'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import {
  CheckCircleOutlineRounded,
  ErrorOutlineRounded,
  ArrowForwardRounded,
} from '@mui/icons-material';
import { createAppTheme } from '@/src/theme/createAppTheme';
import { apiService } from '@/src/services/index';
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState('Đang xác thực email...');
  const [ok, setOk] = useState<boolean | null>(null);

  const theme = useMemo(() => createAppTheme('light'), []);

  useEffect(() => {
    const userId = params.get('userId');
    const token = params.get('token');

    if (!userId || !token) {
      queueMicrotask(() => {
        setOk(false);
        setMsg('Đường dẫn xác thực không hợp lệ.');
      });
      return;
    }

    apiService
      .get(`/auth/verify-email?userId=${userId}&token=${encodeURIComponent(token)}`)
      .then(() => {
        setOk(true);
        setMsg('Xác thực email thành công!');
        setTimeout(() => router.push('/auth/login'), 2500);
      })
      .catch(() => {
        setOk(false);
        setMsg('Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      });
  }, [params, router]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: CSSVAR.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 440,
            width: '100%',
            p: 4.5,
            borderRadius: '24px',
            border: '1px solid rgba(17, 17, 17, 0.08)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            bgcolor: CSSVAR.paper,
          }}
        >
          <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
            {ok === null ? (
              <CircularProgress size={48} sx={{ color: BRAND.main, mb: 1 }} />
            ) : ok ? (
              <CheckCircleOutlineRounded sx={{ fontSize: 56, color: STATUS.success, mb: 0.5 }} />
            ) : (
              <ErrorOutlineRounded sx={{ fontSize: 56, color: STATUS.error, mb: 0.5 }} />
            )}

            <Typography
              variant="h5"
              sx={{
                fontWeight: 850,
                color: CSSVAR.textPrimary,
                letterSpacing: '-0.5px',
              }}
            >
              {msg}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: CSSVAR.textSecondary, lineHeight: 1.6 }}
            >
              {ok === null
                ? 'Vui lòng chờ hệ thống xác nhận thông tin của bạn...'
                : ok
                ? 'Tài khoản của bạn đã được xác minh. Hệ thống đang tự động chuyển về trang Đăng nhập...'
                : 'Vui lòng kiểm tra lại liên kết trong email hoặc đăng nhập lại để nhận mã xác minh mới.'}
            </Typography>

            <Button
              onClick={() => router.push('/auth/login')}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              sx={{
                mt: 1,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                fontWeight: 700,
                bgcolor: BRAND.main,
                '&:hover': { bgcolor: BRAND.dark },
              }}
            >
              Về trang Đăng nhập
            </Button>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: CSSVAR.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress sx={{ color: BRAND.main }} />
        </Box>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
