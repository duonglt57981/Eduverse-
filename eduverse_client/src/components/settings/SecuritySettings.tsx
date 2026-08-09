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
  Switch,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  LockRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  DesktopWindowsRounded,
  SmartphoneRounded,
  HistoryRounded,
  VpnKeyRounded,
  ShieldRounded,
  InfoRounded,
} from '@mui/icons-material';
import { apiService } from '@/src/services/index';

interface Device {
  id: number;
  name: string;
  browser: string;
  location: string;
  ip: string;
  time: string;
  isCurrent: boolean;
}

interface LoginHistoryItem {
  time: string;
  dev: string;
  ip: string;
  loc: string;
  status: string;
}

export default function SecuritySettings() {
  const theme = useTheme();
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passErrors, setPassErrors] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [twoFactor, setTwoFactor] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Load 2FA status from profile API on mount
  const fetch2FAStatus = useCallback(async () => {
    try {
      const res = await apiService.get<any>('/profile');
      if (res.status && res.data) {
        setTwoFactor(res.data.twoFactorEnabled || false);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Fetch real active devices and login history from backend
  const fetchDevicesAndHistory = useCallback(async () => {
    try {
      setLoadingDevices(true);
      const resDev = await apiService.get<Device[]>('/profile/active-devices');
      if (resDev.status && Array.isArray(resDev.data)) {
        setDevices(resDev.data);
      }
    } catch {
      // Silent catch
    } finally {
      setLoadingDevices(false);
    }

    try {
      setLoadingHistory(true);
      const resHist = await apiService.get<LoginHistoryItem[]>('/profile/login-history');
      if (resHist.status && Array.isArray(resHist.data)) {
        setLoginHistory(resHist.data);
      }
    } catch {
      // Silent catch
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetch2FAStatus();
    fetchDevicesAndHistory();
  }, [fetch2FAStatus, fetchDevicesAndHistory]);

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

  const handleLogoutDevice = async (id: number) => {
    try {
      const res = await apiService.post<any>(`/profile/logout-device/${id}`, {});
      if (res.status) {
        setSnackbar({ open: true, message: res.message || 'Đã hủy phiên đăng nhập trên thiết bị!', severity: 'info' });
        fetchDevicesAndHistory();
      } else {
        setSnackbar({ open: true, message: res.message || 'Không thể hủy phiên đăng nhập', severity: 'error' });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: typeof err === 'string' ? err : 'Không thể đăng xuất thiết bị', severity: 'error' });
    }
  };

  // Real API: POST /api/enable-2fa
  const handleToggle2FA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      try {
        const res = await apiService.post<any>('/enable-2fa', { enable: true });
        if (res.status && res.data) {
          setQrCodeUrl(res.data.qrCode || '');
          setSecretKey(res.data.secret || 'EDUVERSE2026KEY');
          setOpen2FA(true);
        } else {
          setSnackbar({ open: true, message: res.message || 'Không thể kích hoạt 2FA', severity: 'error' });
        }
      } catch (err: any) {
        const message = typeof err === 'string' ? err : 'Có lỗi xảy ra';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    } else {
      try {
        const res = await apiService.post<any>('/enable-2fa', { enable: false });
        if (res.status) {
          setTwoFactor(false);
          setSnackbar({ open: true, message: 'Đã tắt xác thực 2 lớp!', severity: 'info' });
        } else {
          setSnackbar({ open: true, message: res.message || 'Không thể tắt 2FA', severity: 'error' });
        }
      } catch (err: any) {
        const message = typeof err === 'string' ? err : 'Có lỗi xảy ra';
        setSnackbar({ open: true, message, severity: 'error' });
      }
    }
  };

  // Real API: POST /api/verify-otp
  const handleVerify2FA = async () => {
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setOtpError('Mã xác thực phải gồm 6 chữ số');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await apiService.post<any>('/verify-otp', { code: otpCode });
      if (res.status) {
        setTwoFactor(true);
        setOpen2FA(false);
        setOtpCode('');
        setOtpError('');
        setSnackbar({ open: true, message: 'Kích hoạt xác thực 2 lớp thành công!', severity: 'success' });
      } else {
        setOtpError(res.message || 'Mã xác thực không đúng');
      }
    } catch (err: any) {
      const message = typeof err === 'string' ? err : 'Xác minh OTP thất bại';
      setOtpError(message);
    } finally {
      setOtpLoading(false);
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
                      error={Boolean(passErrors.current)}
                      helperText={passErrors.current}
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => handleTogglePassVisibility('current')} edge="end">
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
                      error={Boolean(passErrors.new)}
                      helperText={passErrors.new}
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => handleTogglePassVisibility('new')} edge="end">
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
                      error={Boolean(passErrors.confirm)}
                      helperText={passErrors.confirm}
                      placeholder="••••••••"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => handleTogglePassVisibility('confirm')} edge="end">
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
                    disabled={passLoading}
                    startIcon={passLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
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
                    {passLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Xác thực 2 lớp (2FA) */}
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
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldRounded sx={{ color: 'primary.main' }} /> Xác thực 2 lớp (2FA)
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 13.5 }}>
                  Bảo vệ tài khoản bằng cách yêu cầu mã bảo mật bổ sung mỗi khi đăng nhập.
                </Typography>
              </Box>
              <Switch
                checked={twoFactor}
                onChange={handleToggle2FA}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'primary.main' },
                }}
              />
            </Stack>

            {twoFactor && (
              <Box sx={{ mt: 2.5, p: 2, bgcolor: 'rgba(46,125,50,0.06)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.15)' }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <VpnKeyRounded sx={{ color: '#2e7d32' }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2e7d32' }}>
                    Xác thực hai lớp đang hoạt động thông qua ứng dụng Authenticator (Google/Microsoft).
                  </Typography>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Thiết bị đăng nhập */}
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
              <DesktopWindowsRounded sx={{ color: 'primary.main' }} /> Thiết bị đang đăng nhập
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
              Danh sách các thiết bị hiện đang duy trì phiên đăng nhập vào tài khoản của bạn.
            </Typography>

            {loadingDevices ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={26} />
              </Box>
            ) : devices.length === 0 ? (
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', py: 2, textAlign: 'center' }}>
                Không tìm thấy phiên đăng nhập nào.
              </Typography>
            ) : (
              <Stack spacing={2} divider={<Divider sx={{ opacity: 0.6 }} />}>
                {devices.map((device) => (
                  <Stack key={device.id} direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'text.secondary',
                        }}
                      >
                        {device.name.includes('iPhone') || device.name.includes('Android') ? (
                          <SmartphoneRounded />
                        ) : (
                          <DesktopWindowsRounded />
                        )}
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary' }}>
                            {device.name}
                          </Typography>
                          {device.isCurrent && (
                            <Chip
                              label="Phiên hiện tại"
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                fontWeight: 800,
                                height: 20,
                                fontSize: 11,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.3 }}>
                          {device.browser} • {device.location} • IP: {device.ip}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                        {device.time}
                      </Typography>
                      {!device.isCurrent && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleLogoutDevice(device.id)}
                          sx={{
                            borderRadius: 999,
                            borderColor: 'rgba(211,47,47,0.25)',
                            fontWeight: 700,
                            px: 2,
                            '&:hover': {
                              borderColor: 'error.main',
                              bgcolor: 'rgba(211,47,47,0.03)',
                            },
                          }}
                        >
                          Đăng xuất
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Lịch sử đăng nhập */}
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
              <HistoryRounded sx={{ color: 'primary.main' }} /> Lịch sử đăng nhập
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13.5, mb: 3 }}>
              Giám sát hoạt động truy cập tài khoản gần đây.
            </Typography>

            {loadingHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={26} />
              </Box>
            ) : loginHistory.length === 0 ? (
              <Typography sx={{ fontSize: 13.5, color: 'text.secondary', py: 2, textAlign: 'center' }}>
                Chưa có lịch sử đăng nhập.
              </Typography>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 800, fontSize: 13 }}>Thời gian</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 13 }}>Thiết bị / Trình duyệt</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 13 }}>Địa chỉ IP</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 13 }}>Vị trí</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: 13 }}>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loginHistory.map((row, index) => (
                      <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ fontSize: 13.5 }}>{row.time}</TableCell>
                        <TableCell sx={{ fontSize: 13.5, fontWeight: 700 }}>{row.dev}</TableCell>
                        <TableCell sx={{ fontSize: 13.5 }}>{row.ip}</TableCell>
                        <TableCell sx={{ fontSize: 13.5 }}>{row.loc}</TableCell>
                        <TableCell sx={{ fontSize: 13.5 }}>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: row.status.includes('thành công') || row.status.includes('Thành công') ? 'rgba(46,125,50,0.08)' : 'rgba(211,47,47,0.08)',
                              color: row.status.includes('thành công') || row.status.includes('Thành công') ? '#2e7d32' : '#d32f2f',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Dialog thiết lập 2FA */}
      <Dialog
        open={open2FA}
        onClose={() => setOpen2FA(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: 20 }}>Thiết lập Xác thực 2 lớp</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ p: 1.75, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), alignItems: 'center' }}>
              <InfoRounded sx={{ color: 'primary.main', flexShrink: 0, mt: 0.2 }} />
              <Typography sx={{ fontSize: 13, color: 'text.primary', opacity: 0.8, lineHeight: 1.6 }}>
                Quét mã QR dưới đây bằng ứng dụng xác thực của bạn (như Google Authenticator hoặc Microsoft Authenticator) để liên kết tài khoản.
              </Typography>
            </Stack>

            <Stack spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'var(--ev-paper, #fff)',
                  border: '1px solid rgba(17,17,17,0.1)',
                  borderRadius: 2.8,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
                }}
              >
                {qrCodeUrl ? (
                  <Box
                    component="img"
                    src={qrCodeUrl}
                    alt="QR Code for 2FA"
                    sx={{ width: 160, height: 160, display: 'block' }}
                  />
                ) : (
                  <svg width="160" height="160" viewBox="0 0 100 100" fill="none">
                    <rect x="5" y="5" width="25" height="25" stroke={theme.palette.primary.main} strokeWidth="4" />
                    <rect x="11" y="11" width="13" height="13" fill={theme.palette.primary.main} />
                    <rect x="70" y="5" width="25" height="25" stroke={theme.palette.primary.main} strokeWidth="4" />
                    <rect x="76" y="11" width="13" height="13" fill={theme.palette.primary.main} />
                    <rect x="5" y="70" width="25" height="25" stroke={theme.palette.primary.main} strokeWidth="4" />
                    <rect x="11" y="76" width="13" height="13" fill={theme.palette.primary.main} />
                    <rect x="40" y="40" width="20" height="20" fill={theme.palette.primary.main} />
                    <rect x="40" y="10" width="5" height="10" fill="#222" />
                    <rect x="50" y="25" width="10" height="5" fill="#222" />
                    <rect x="10" y="45" width="15" height="5" fill="#222" />
                    <rect x="20" y="55" width="5" height="10" fill="#222" />
                    <rect x="70" y="45" width="10" height="10" fill="#222" />
                    <rect x="85" y="55" width="10" height="5" fill="#222" />
                    <rect x="45" y="75" width="15" height="5" fill="#222" />
                    <rect x="55" y="85" width="5" height="10" fill="#222" />
                    <rect x="75" y="75" width="15" height="15" fill="#222" />
                  </svg>
                )}
              </Box>

              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Hoặc nhập thủ công mã khóa: <strong style={{ color: theme.palette.primary.main }}>{secretKey || 'EDUVERSE2026KEY'}</strong>
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Nhập mã xác minh gồm 6 số</Typography>
              <TextField
                fullWidth
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.slice(0, 6));
                  setOtpError('');
                }}
                error={Boolean(otpError)}
                helperText={otpError}
                placeholder="000 000"
                slotProps={{
                  htmlInput: {
                    style: { textAlign: 'center', letterSpacing: '8px', fontSize: '18px', fontWeight: 800 }
                  },
                  input: {
                    sx: { borderRadius: 2.8 }
                  }
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpen2FA(false);
              setOtpCode('');
              setOtpError('');
            }}
            disabled={otpLoading}
            sx={{ borderRadius: 999, color: 'text.secondary', fontWeight: 800 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleVerify2FA}
            disabled={otpLoading}
            variant="contained"
            startIcon={otpLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              borderRadius: 999,
              bgcolor: 'primary.main',
              boxShadow: 'none',
              fontWeight: 800,
              px: 3,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {otpLoading ? 'Đang xác minh...' : 'Kích hoạt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
