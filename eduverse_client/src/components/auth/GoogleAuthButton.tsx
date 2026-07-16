'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useDispatch } from '../../store/hook';
import { externalLogin } from '../../store/auth/AuthSlice';

/**
 * GoogleAuthButton — Đăng nhập / Đăng ký bằng Google qua Google Identity Services (GIS).
 *
 * - Dùng thư viện chính thức của Google (script accounts.google.com/gsi/client),
 *   không cần cài thêm package npm.
 * - Nhận về ID token (JWT) và gửi lên backend qua thunk `externalLogin`
 *   ({ provider: 'Google', token }). Backend tự xác minh chữ ký / aud / email_verified.
 * - Sau khi đăng nhập thành công, điều hướng theo VAI TRÒ lấy từ database.
 *
 * Ghi chú giao diện: nút do Google render trong iframe nên chỉ tùy biến được theo
 * các tham số Google cho phép (theme/shape/size/text/width). Component tự ĐO bề rộng
 * và CHIỀU CAO thực tế của nút Google rồi báo ra ngoài qua onSize để trang cha có thể
 * làm nút chính (submit) có cùng kích thước, giúp 2 nút bằng nhau và thẳng hàng.
 */

// Kiểu tối thiểu cho phản hồi credential của GIS
interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  ux_mode?: 'popup' | 'redirect';
  itp_support?: boolean;
}

interface GoogleButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'small' | 'medium' | 'large';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfig) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
  cancel: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const GIS_MAX_WIDTH = 400; // Google giới hạn tối đa 400px cho renderButton
let gisPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gis-load-error')));
      if (window.google?.accounts?.id) resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('gis-load-error'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

export type GoogleAuthText = 'signin_with' | 'signup_with' | 'continue_with';

interface GoogleAuthButtonProps {
  /** Nhãn nút Google (mặc định "continue_with"). */
  text?: GoogleAuthText;
  /** Bề rộng tối đa (px), tự co nhỏ theo khung. Mặc định 400 (giới hạn của Google). */
  maxWidth?: number;
  /** Báo kích thước thực tế của nút Google (px) để trang cha khớp nút chính. */
  onSize?: (size: { width: number; height: number }) => void;
  /** Callback báo lỗi phía client (không cấu hình, tải script lỗi, không nhận được token...). */
  onError?: (message: string) => void;
  /** Theme của nút Google. Mặc định 'outline'. */
  theme?: 'outline' | 'filled_blue' | 'filled_black';
}

export default function GoogleAuthButton({
  text = 'continue_with',
  maxWidth = GIS_MAX_WIDTH,
  onSize,
  onError,
  theme = 'outline',
}: GoogleAuthButtonProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const processingRef = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [btnWidth, setBtnWidth] = useState(320);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const cap = Math.min(maxWidth, GIS_MAX_WIDTH);

  // Đo bề rộng khung + chiều cao thực tế của nút Google (dùng ResizeObserver để bắt
  // cả lúc GIS render xong lẫn khi đổi kích thước màn hình → luôn responsive & khớp).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;

    const report = () => {
      const w = wrapper?.clientWidth ?? 0;
      if (w > 0) setBtnWidth(Math.min(Math.max(Math.floor(w), 200), cap));
      const h = container?.clientHeight ?? 0;
      if (h > 0) onSize?.({ width: container?.clientWidth ?? 0, height: h });
    };

    report();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', report);
      return () => window.removeEventListener('resize', report);
    }
    const ro = new ResizeObserver(() => report());
    if (wrapper) ro.observe(wrapper);
    if (container) ro.observe(container);
    return () => ro.disconnect();
  }, [cap, onSize]);

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (processingRef.current) return; // Chống double submit / double callback
      const idToken = response?.credential;
      if (!idToken) {
        onError?.('Không nhận được phản hồi từ Google. Vui lòng thử lại.');
        return;
      }

      processingRef.current = true;
      setProcessing(true);
      try {
        const result = await dispatch(externalLogin({ provider: 'Google', token: idToken }));
        if (externalLogin.fulfilled.match(result)) {
          const roles: string[] = result.payload.roles || [];
          if (roles.includes('Admin')) {
            router.push('/admin/dashboard');
          } else if (roles.includes('GiaoVien')) {
            router.push('/instructor/dashboard');
          } else {
            router.push('/student/dashboard');
          }
        }
        // Trường hợp thất bại: thunk đã set state.auth.error → trang cha tự hiển thị.
      } finally {
        processingRef.current = false;
        setProcessing(false);
      }
    },
    [dispatch, router, onError],
  );

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          itp_support: true,
        });

        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme,
          size: 'large',
          text,
          shape: 'pill',
          logo_alignment: 'center',
          width: btnWidth,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setScriptError(true);
        onError?.('Không thể tải đăng nhập Google. Vui lòng kiểm tra kết nối mạng và thử lại.');
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, text, theme, btnWidth, handleCredential, onError]);

  // Chưa cấu hình Client ID → hiện nút vô hiệu hoá kèm thông báo tiếng Việt
  if (!clientId) {
    return (
      <Box
        role="button"
        aria-disabled="true"
        aria-label="Đăng nhập bằng Google (chưa được cấu hình)"
        title="Hệ thống chưa được cấu hình đăng nhập Google."
        sx={{
          width: '100%',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          px: 2,
          borderRadius: 999,
          border: '1px solid rgba(17,17,17,0.14)',
          color: 'rgba(17,17,17,0.45)',
          bgcolor: 'rgba(17,17,17,0.03)',
          cursor: 'not-allowed',
          userSelect: 'none',
          fontSize: 13.5,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Đăng nhập Google chưa được cấu hình
      </Box>
    );
  }

  return (
    <Box
      ref={wrapperRef}
      sx={{ 
        width: '100%', 
        maxWidth: 400,
        position: 'relative',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}
      aria-busy={processing}
    >
      {/* Custom Button styling under the invisible Google iframe */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 48,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          bgcolor: '#FFF5F5', // Soft crimson red/pink background to match logo
          border: '1px solid #E6B8B8', // Subtle crimson border
          color: '#8B1313', // Deep crimson text
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          userSelect: 'none',
          boxSizing: 'border-box',
          '&:hover': {
            bgcolor: '#FFECEC',
            borderColor: '#D49B9B',
          },
          '&:active': {
            bgcolor: '#FFDBDB',
          },
        }}
      >
        {/* Transparent Google G logo */}
        <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>
          {text === 'signin_with' ? 'Đăng nhập bằng Google' : 
           text === 'signup_with' ? 'Đăng ký bằng Google' : 'Tiếp tục với Google'}
        </span>

        {/* The actual Google iframe button overlay - transparent & clickable */}
        <Box
          ref={containerRef}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.01, // Clickable but invisible
            cursor: 'pointer',
            '& iframe': {
              width: '100% !important',
              height: '100% !important',
              cursor: 'pointer !important',
            }
          }}
        />

        {processing && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(255, 245, 245, 0.7)',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <CircularProgress size={20} sx={{ color: '#8B1313' }} />
          </Box>
        )}
      </Box>

      {scriptError && (
        <Typography sx={{ mt: 1, fontSize: 12, color: '#b42318', textAlign: 'center' }}>
          Không thể tải đăng nhập Google. Vui lòng thử lại.
        </Typography>
      )}
    </Box>
  );
}
