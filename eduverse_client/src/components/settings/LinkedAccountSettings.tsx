'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  SvgIcon,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LinkOffRounded, LinkRounded } from '@mui/icons-material';

// Custom Social Logos
function GoogleIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 48 48">
      <path
        fill="#ea4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285f4"
        d="M46.5 24c0-1.55-.15-3.24-.47-4.75H24v9.03h12.75c-.55 2.83-2.15 5.23-4.57 6.85l7.1 5.5C43.43 36.57 46.5 30.87 46.5 24z"
      />
      <path
        fill="#fbbc05"
        d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"
      />
      <path
        fill="#34a853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.1-5.5c-2.2 1.48-5.01 2.36-8.79 2.36-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </SvgIcon>
  );
}

function FacebookIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </SvgIcon>
  );
}

function GitHubIcon(props: React.ComponentProps<typeof SvgIcon>) {
  const theme = useTheme();
  // GH logo color: white in dark mode, dark grey in light mode
  const fill = theme.palette.mode === 'dark' ? '#ffffff' : '#24292F';
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill={fill}
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </SvgIcon>
  );
}

function MicrosoftIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 23 23">
      <path fill="#f35325" d="M0 0h11v11H0z" />
      <path fill="#81bc06" d="M12 0h11v11H12z" />
      <path fill="#05a6f0" d="M0 12h11v11H0z" />
      <path fill="#ffba08" d="M12 12h11v11H12z" />
    </SvgIcon>
  );
}

interface AccountItem {
  id: 'google' | 'facebook' | 'github' | 'microsoft';
  name: string;
  desc: string;
  icon: React.ElementType;
  linked: boolean;
  email?: string;
  loading: boolean;
}

export default function LinkedAccountSettings() {
  const theme = useTheme();
  const [accounts, setAccounts] = useState<AccountItem[]>([
    { id: 'google', name: 'Google', desc: 'Đăng nhập nhanh và đồng bộ hóa danh bạ học tập.', icon: GoogleIcon, linked: true, email: 'minhanh.eduverse@gmail.com', loading: false },
    { id: 'facebook', name: 'Facebook', desc: 'Kết nối bạn bè và chia sẻ các chứng nhận học tập.', icon: FacebookIcon, linked: false, loading: false },
    { id: 'github', name: 'GitHub', desc: 'Liên kết mã nguồn dự án và hiển thị đóng góp công nghệ.', icon: GitHubIcon, linked: true, email: 'minhanh-coder', loading: false },
    { id: 'microsoft', name: 'Microsoft', desc: 'Đồng bộ hóa lịch học với Outlook và lịch Microsoft.', icon: MicrosoftIcon, linked: false, loading: false },
  ]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' });

  const handleLinkAction = (id: string, action: 'connect' | 'disconnect') => {
    // Set loading for the specific account card
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, loading: true } : acc))
    );

    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            if (action === 'connect') {
              return {
                ...acc,
                linked: true,
                email: id === 'microsoft' ? 'minhanh.outlook@outlook.com' : 'minhanh.fb@facebook.com',
                loading: false,
              };
            } else {
              return {
                ...acc,
                linked: false,
                email: undefined,
                loading: false,
              };
            }
          }
          return acc;
        })
      );

      const accountName = accounts.find((a) => a.id === id)?.name || '';
      setSnackbar({
        open: true,
        message: action === 'connect' ? `Đã liên kết tài khoản ${accountName} thành công!` : `Đã hủy liên kết tài khoản ${accountName}!`,
        severity: action === 'connect' ? 'success' : 'info',
      });
    }, 1200);
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Card
        elevation={0}
        sx={{
          borderRadius: 2.8,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkRounded sx={{ color: 'primary.main' }} /> Liên kết tài khoản
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 4 }}>
            Quản lý các tài khoản mạng xã hội liên kết để đăng nhập nhanh chóng và chia sẻ thông tin học tập.
          </Typography>

          <Stack spacing={3} divider={<Divider sx={{ opacity: 0.6 }} />}>
            {accounts.map((acc) => (
              <Stack
                key={acc.id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ py: 0.5, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      mt: 0.25,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <acc.icon sx={{ fontSize: acc.id === 'microsoft' ? 20 : 24 }} />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>
                        {acc.name}
                      </Typography>
                      {acc.linked ? (
                        <Chip
                          label="Đã liên kết"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: 'rgba(46,125,50,0.08)',
                            color: '#2e7d32',
                          }}
                        />
                      ) : (
                        <Chip
                          label="Chưa liên kết"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: 'action.selected',
                            color: 'text.secondary',
                          }}
                        />
                      )}
                    </Stack>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.5 }}>
                      {acc.desc}
                    </Typography>
                    {acc.linked && acc.email && (
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                        Tài khoản: {acc.email}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Box sx={{ width: { xs: '100%', sm: 'auto' }, textAlign: 'right', alignSelf: { xs: 'stretch', sm: 'center' } }}>
                  {acc.linked ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      disabled={acc.loading}
                      onClick={() => handleLinkAction(acc.id, 'disconnect')}
                      startIcon={acc.loading ? <CircularProgress size={16} color="inherit" /> : <LinkOffRounded fontSize="small" />}
                      sx={{
                        borderRadius: 999,
                        borderColor: 'rgba(211,47,47,0.25)',
                        fontWeight: 800,
                        px: 3,
                        py: 0.9,
                        '&:hover': {
                          borderColor: 'error.main',
                          bgcolor: 'rgba(211,47,47,0.03)',
                        },
                      }}
                    >
                      {acc.loading ? 'Đang hủy...' : 'Hủy liên kết'}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={acc.loading}
                      onClick={() => handleLinkAction(acc.id, 'connect')}
                      startIcon={acc.loading ? <CircularProgress size={16} color="inherit" /> : <LinkRounded fontSize="small" />}
                      sx={{
                        borderRadius: 999,
                        bgcolor: 'primary.main',
                        boxShadow: 'none',
                        fontWeight: 800,
                        px: 3.5,
                        py: 0.9,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      {acc.loading ? 'Đang kết nối...' : 'Kết nối'}
                    </Button>
                  )}
                </Box>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
