'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton';
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
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
          bgcolor: '#F8FAFC',
          px: 2.5,
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 500,
            borderRadius: '28px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 16px 40px rgba(30, 41, 59, 0.06)',
            backgroundColor: '#ffffff',
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
              <Image
                src="/auth/img/logo_nentrang.png"
                alt="EduVerse"
                width={270}
                height={70}
                priority
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: '#1E293B', fontSize: 26, letterSpacing: '-0.5px', mb: 1.5 }}
              >
                Chào mừng trở lại!
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#64748B', fontSize: 15.5, lineHeight: 1.6 }}
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
            }}
          >
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Link href="/auth/terms" style={{ color: '#8B1313', textDecoration: 'none', fontWeight: 600 }}>
              Điều khoản Dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/auth/privacy" style={{ color: '#8B1313', textDecoration: 'none', fontWeight: 600 }}>
              Chính sách Bảo mật
            </Link>{' '}
            của EduVerse.
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
