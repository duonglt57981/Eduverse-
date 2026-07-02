'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  Avatar,
  Stack,
  CssBaseline,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const providerParam = searchParams.get('provider') || 'google';
  const isGoogle = providerParam.toLowerCase() === 'google';
  const providerName = isGoogle ? 'Google' : 'Facebook';

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');
  const [loading, setLoading] = useState(true);

  // Theme definition
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: isGoogle ? '#4285F4' : '#1877f2' },
          text: { primary: '#1c1e21', secondary: '#606770' },
          background: { default: isGoogle ? '#f8f9fa' : '#f0f2f5' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Be Vietnam Pro", "Roboto", system-ui, -apple-system, sans-serif',
          button: { textTransform: 'none', fontWeight: 600 },
        },
      }),
    [isGoogle]
  );

  useEffect(() => {
    // Check if we have real tokens in the hash redirect
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('id_token'))) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('id_token') || params.get('access_token');
        if (token) {
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'OAUTH_SUCCESS',
                payload: {
                  provider: providerName,
                  token: token,
                },
              },
              window.location.origin
            );
            window.close();
            return;
          }
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  }, [providerName]);

  const handleSelect = (user: { name: string; email: string; key: string }) => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'OAUTH_SUCCESS',
          payload: {
            provider: providerName,
            email: user.email,
            name: user.name,
            providerKey: user.key,
          },
        },
        window.location.origin
      );
      window.close();
    } else {
      alert('Không tìm thấy cửa sổ cha.');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setCustomError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!customEmail.includes('@')) {
      setCustomError('Email không hợp lệ');
      return;
    }

    const providerKey = `${isGoogle ? 'g' : 'fb'}-${Date.now()}`;
    handleSelect({
      name: customName.trim(),
      email: customEmail.trim(),
      key: providerKey,
    });
  };

  const mockUsers = isGoogle
    ? [
        { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', key: 'g-12345' },
        { name: 'Trần Thị B', email: 'tranthib@gmail.com', key: 'g-67890' },
      ]
    : [
        { name: 'Lê Văn C', email: 'levanc@facebook.com', key: 'fb-12345' },
        { name: 'Phạm Thị D', email: 'phamthid@facebook.com', key: 'fb-67890' },
      ];

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Đang xử lý kết quả đăng nhập...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
          backgroundColor: 'background.default',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 8px 28px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {isGoogle ? (
            // Google branded header
            <Box
              sx={{
                p: 4,
                pb: 2,
                textAlign: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <svg width="40" height="40" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
                Đăng nhập bằng Google
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                để tiếp tục đến EduVerse
              </Typography>
            </Box>
          ) : (
            // Facebook branded header
            <Box
              sx={{
                bgcolor: '#1877f2',
                p: 3,
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  letterSpacing: '-1.5px',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                facebook
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Đăng nhập bằng tài khoản của bạn
              </Typography>
            </Box>
          )}

          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                display: 'block',
                mb: 2,
              }}
            >
              Chọn tài khoản demo
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {mockUsers.map((user) => (
                <Button
                  key={user.key}
                  variant="outlined"
                  onClick={() => handleSelect(user)}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: 'rgba(0,0,0,0.12)',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: isGoogle ? 'rgba(66,133,244,0.04)' : 'rgba(24,119,242,0.04)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold',
                      mr: 2,
                      width: 36,
                      height: 36,
                      fontSize: 15,
                    }}
                  >
                    {user.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Stack>

            <Divider sx={{ my: 3.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>
                Hoặc đăng nhập tài khoản khác
              </Typography>
            </Divider>

            <Box component="form" onSubmit={handleCustomSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Họ và Tên"
                variant="outlined"
                fullWidth
                size="small"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setCustomError('');
                }}
                placeholder="Nhập họ tên"
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                size="small"
                type="email"
                value={customEmail}
                onChange={(e) => {
                  setCustomEmail(e.target.value);
                  setCustomError('');
                }}
                placeholder="example@gmail.com"
              />

              {customError && (
                <Alert severity="error" icon={false} sx={{ py: 0, px: 1.5, fontSize: '0.8rem' }}>
                  {customError}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: isGoogle ? '#357ae8' : '#166fe5',
                    boxShadow: 'none',
                  },
                }}
              >
                Tiếp tục
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
        <Typography>Đang tải...</Typography>
      </Box>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
