'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton';
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '@/src/theme/createAppTheme';

export default function LoginPage() {
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSize, setGoogleSize] = useState({ width: 0, height: 44 });

  const theme = useMemo(() => createAppTheme('light'), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'var(--ev-paper-alt, #F8FAFC)',
          px: 2.5,
          py: 4,
          position: 'relative',
        }}
      >
        {/* Floating Back to Home button */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
          }}
        >
          <MuiLink
            component={NextLink}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'var(--ev-text-secondary, #64748B)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14.5,
              transition: 'color 200ms ease',
              '&:hover': {
                color: '#8B1313',
              },
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Quay lại trang chủ
          </MuiLink>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 500,
            borderRadius: '28px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 16px 40px rgba(30, 41, 59, 0.06)',
            backgroundColor: 'var(--ev-paper, #ffffff)',
            p: { xs: 5, sm: 6.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, width: '100%' }}>
            <Box sx={{ width: 250, height: 'auto', mb: 1, display: 'flex', justifyContent: 'center' }}>
              <NextLink href="/" style={{ display: 'block', width: '100%' }}>
                <Image
                  src="/auth/img/logo_nentrang.png"
                  alt="EduVerse"
                  width={270}
                  height={70}
                  priority
                  style={{ width: '100%', height: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                />
              </NextLink>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1E293B)', fontSize: 26, letterSpacing: '-0.5px', mb: 1.5 }}
              >
                Chào mừng trở lại!
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--ev-text-secondary, #64748B)', fontSize: 15.5, lineHeight: 1.6 }}
              >
                Đăng nhập bằng tài khoản Google để tiếp tục hành trình học tập tại EduVerse
              </Typography>
            </Box>
          </Box>

          {/* Alert Error */}
          {googleError && (
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                px: 3,
                py: 2,
                borderRadius: '14px',
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: '#991B1B',
                fontSize: 14.5,
                fontWeight: 500,
              }}
            >
              {googleError}
            </Paper>
          )}

          {/* Google Login Button Container */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              py: 1
            }}
          >
            <GoogleAuthButton
              text="signin_with"
              theme="filled_blue"
              onError={setGoogleError}
              onSize={setGoogleSize}
            />
          </Box>

          {/* Elegant Footer */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: 13,
              color: '#94A3B8',
              lineHeight: 1.6,
              position: 'relative',
              zIndex: 10,
            }}
          >
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <MuiLink
              component={NextLink}
              href="/auth/terms"
              sx={{
                color: '#8B1313',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Điều khoản Dịch vụ
            </MuiLink>{' '}
            và{' '}
            <MuiLink
              component={NextLink}
              href="/auth/privacy"
              sx={{
                color: '#8B1313',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Chính sách Bảo mật
            </MuiLink>{' '}
            của EduVerse.
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
