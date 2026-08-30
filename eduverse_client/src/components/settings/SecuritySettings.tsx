/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  LockRounded,
  VisibilityRounded,
  VisibilityOffRounded,
} from '@mui/icons-material';
import { apiService } from '@/src/services/index';

export default function SecuritySettings() {
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passErrors, setPassErrors] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [securityStatusError, setSecurityStatusError] = useState(false);
  const passwordChangeDisabled = profileLoading || isGoogleAccount || securityStatusError;

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Load security capabilities from profile API on mount
  const fetchSecurityStatus = useCallback(async () => {
    try {
      const res = await apiService.get<any>('/profile');
      if (res.status && res.data) {
        setIsGoogleAccount(Boolean(res.data.isGoogleAccount));
      } else {
        setSecurityStatusError(true);
      }
    } catch {
      setSecurityStatusError(true);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSecurityStatus();
  }, [fetchSecurityStatus]);

  const handleTogglePassVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPassErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Real API: POST /api/auth/change-password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordChangeDisabled) {
      return;
    }

    let hasError = false;
    const errors = { current: '', new: '', confirm: '' };

    if (!passwords.current) {
      errors.current = 'Mật khẩu hiện tại là bắt buộc';
      hasError = true;
    }
    if (!passwords.new) {
      errors.new = 'Mật khẩu mới là bắt buộc';
      hasError = true;
    } else if (passwords.new.length < 6) {
      errors.new = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      hasError = true;
    }
    if (passwords.new !== passwords.confirm) {
      errors.confirm = 'Mật khẩu xác nhận không trùng khớp';
      hasError = true;
    }

    if (hasError) {
      setPassErrors(errors);
      return;
    }

    setPassLoading(true);
    try {
      const res = await apiService.post<any>('/auth/change-password', {
        oldPassword: passwords.current,
        newPassword: passwords.new,
      });
      if (res.status) {
        setPasswords({ current: '', new: '', confirm: '' });
        setSnackbar({ open: true, message: 'Đổi mật khẩu thành công!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: res.message || 'Đổi mật khẩu thất bại', severity: 'error' });
      }
    } catch (err: any) {
      const message = typeof err === 'string' ? err : 'Có lỗi xảy ra khi đổi mật khẩu';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setPassLoading(false);
    }
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

      <Stack spacing={3}>
        {/* Đổi mật khẩu */}
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
              <LockRounded sx={{ color: 'primary.main' }} /> Đổi mật khẩu
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
              Cập nhật mật khẩu mới thường xuyên để nâng cao bảo mật tài khoản.
            </Typography>

            {isGoogleAccount && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                Tài khoản Google không sử dụng tính năng đổi mật khẩu tại EduVerse. Chỉ tài khoản đăng nhập bằng tên đăng nhập và mật khẩu của EduVerse mới có thể dùng tính năng này.
              </Alert>
            )}

            {securityStatusError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                Không thể xác định loại tài khoản. Tính năng đổi mật khẩu tạm thời bị khóa để bảo vệ tài khoản.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSavePassword}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Stack spacing={0.75}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Mật khẩu hiện tại</Typography>
                    <TextField
                      fullWidth
                      type={showPass.current ? 'text' : 'password'}
                      name="current"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      disabled={passwordChangeDisabled}
                      error={Boolean(passErrors.current)}
                      helperText={passErrors.current}
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleTogglePassVisibility('current')}
                                edge="end"
                                disabled={passwordChangeDisabled}
                                aria-label={showPass.current ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
                              >
                                {showPass.current ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2.8 },
                        },
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.75}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Mật khẩu mới</Typography>
                    <TextField
                      fullWidth
                      type={showPass.new ? 'text' : 'password'}
                      name="new"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      disabled={passwordChangeDisabled}
                      error={Boolean(passErrors.new)}
                      helperText={passErrors.new}
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleTogglePassVisibility('new')}
                                edge="end"
                                disabled={passwordChangeDisabled}
                                aria-label={showPass.new ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                              >
                                {showPass.new ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2.8 },
                        },
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.75}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Xác nhận mật khẩu mới</Typography>
                    <TextField
                      fullWidth
                      type={showPass.confirm ? 'text' : 'password'}
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      disabled={passwordChangeDisabled}
                      error={Boolean(passErrors.confirm)}
                      helperText={passErrors.confirm}
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => handleTogglePassVisibility('confirm')}
                                edge="end"
                                disabled={passwordChangeDisabled}
                                aria-label={showPass.confirm ? 'Ẩn xác nhận mật khẩu mới' : 'Hiện xác nhận mật khẩu mới'}
                              >
                                {showPass.confirm ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2.8 },
                        },
                      }}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={passwordChangeDisabled || passLoading}
                    startIcon={profileLoading || passLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
                    sx={{
                      px: 3,
                      py: 1.1,
                      borderRadius: 999,
                      bgcolor: 'primary.main',
                      boxShadow: 'none',
                      fontWeight: 800,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    {profileLoading ? 'Đang kiểm tra...' : passLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
