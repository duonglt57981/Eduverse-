'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Stack,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Skeleton,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  EditRounded,
  SaveRounded,
  CloseRounded,
  CameraAltRounded,
  PersonRounded,
  EmailRounded,
  PhoneRounded,
  CakeRounded,
  LocationOnRounded,
} from '@mui/icons-material';
import { apiService } from '@/src/services/index';

interface ProfileData {
  hoTen: string;
  email: string;
  phoneNumber: string;
  ngaySinh: string;
  diaChi: string;
  tieuSu: string;
  anhDaiDien: string;
  chucVu: string;
  twoFactorEnabled: boolean;
}

export default function AccountSettings() {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    hoTen: '',
    email: '',
    phoneNumber: '',
    ngaySinh: '',
    diaChi: '',
    tieuSu: '',
    anhDaiDien: '',
    chucVu: '',
    twoFactorEnabled: false,
  });

  const [tempProfile, setTempProfile] = useState<ProfileData>({ ...profile });

  // Fetch profile from API on mount
  const fetchProfile = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await apiService.get<any>('/profile');
      if (res.status && res.data) {
        const data = res.data;
        const profileData: ProfileData = {
          hoTen: data.hoTen || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          ngaySinh: data.ngaySinh || '',
          diaChi: data.diaChi || '',
          tieuSu: data.tieuSu || '',
          anhDaiDien: data.anhDaiDien || '',
          chucVu: data.chucVu || '',
          twoFactorEnabled: data.twoFactorEnabled || false,
        };
        setProfile(profileData);
        setTempProfile(profileData);
      }
    } catch (err: any) {
      showNotification('Không thể tải thông tin hồ sơ', 'error');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setTempProfile({ ...profile });
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  // Upload avatar to backend (POST /api/profile/avatar)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Ảnh tải lên không được vượt quá 5MB', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiService.post<any>('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status && res.data?.url) {
        const newUrl = res.data.url;
        setProfile((prev) => ({ ...prev, anhDaiDien: newUrl }));
        setTempProfile((prev) => ({ ...prev, anhDaiDien: newUrl }));
        showNotification('Cập nhật ảnh đại diện thành công!', 'success');
      } else {
        showNotification(res.message || 'Không thể tải ảnh lên', 'error');
      }
    } catch (err: any) {
      // Fallback to local preview if API fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setTempProfile((prev) => ({ ...prev, anhDaiDien: base64 }));
        if (!isEditing) {
          setProfile((prev) => ({ ...prev, anhDaiDien: base64 }));
        }
      };
      reader.readAsDataURL(file);
      showNotification('Đã lưu ảnh tạm thời (chưa upload lên server)', 'error');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Save profile to backend (PUT /api/profile)
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        hoTen: tempProfile.hoTen,
        email: tempProfile.email,
        phoneNumber: tempProfile.phoneNumber,
        diaChi: tempProfile.diaChi,
        ngaySinh: tempProfile.ngaySinh,
        tieuSu: tempProfile.tieuSu,
      };

      const res = await apiService.put<any>('/profile', payload);
      if (res.status) {
        setProfile({ ...tempProfile });
        setIsEditing(false);
        showNotification('Cập nhật thông tin tài khoản thành công!', 'success');
      } else {
        showNotification(res.message || 'Cập nhật thất bại', 'error');
      }
    } catch (err: any) {
      const message = typeof err === 'string' ? err : 'Có lỗi xảy ra khi cập nhật hồ sơ';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  };

  // Loading skeleton
  if (fetchLoading) {
    return (
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} sx={{ mb: 4, pb: 4, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
            <Skeleton variant="circular" width={110} height={110} />
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width={200} height={36} />
              <Skeleton variant="text" width={160} height={20} />
              <Skeleton variant="text" width={220} height={18} />
            </Stack>
            <Skeleton variant="rounded" width={120} height={40} sx={{ borderRadius: 999 }} />
          </Stack>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Grid size={{ xs: 12, sm: i === 5 ? 12 : 6 }} key={i}>
                <Stack spacing={0.75}>
                  <Skeleton variant="text" width={80} height={18} />
                  <Skeleton variant="rounded" height={50} sx={{ borderRadius: 2.8 }} />
                </Stack>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Card
        elevation={0}
        sx={{
          borderRadius: 2.8,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            sx={{ mb: 4, pb: 4, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center' }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={isEditing ? tempProfile.anhDaiDien : profile.anhDaiDien}
                sx={{
                  width: 110,
                  height: 110,
                  fontSize: 34,
                  fontWeight: 900,
                  border: '4px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 8px 24px rgba(17,17,17,0.12)',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  color: '#fff',
                }}
              >
                {getInitials(isEditing ? tempProfile.hoTen : profile.hoTen)}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  width: 36,
                  height: 36,
                }}
              >
                {avatarUploading ? <CircularProgress size={18} color="inherit" /> : <CameraAltRounded fontSize="small" />}
              </IconButton>
            </Box>

            <Stack spacing={1} sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                {profile.hoTen || 'Học viên EduVerse'}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                {profile.chucVu || 'Học viên'}
              </Typography>
              <Typography sx={{ color: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                {profile.email}
              </Typography>
            </Stack>

            <Box>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditRounded />}
                  onClick={handleEditToggle}
                  sx={{
                    px: 3,
                    py: 1.1,
                    borderRadius: 999,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: 'primary.main',
                    fontWeight: 800,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<CloseRounded />}
                    onClick={handleEditToggle}
                    disabled={loading}
                    sx={{
                      px: 2.5,
                      py: 1.1,
                      borderRadius: 999,
                      borderColor: 'divider',
                      color: 'text.secondary',
                      fontWeight: 800,
                      '&:hover': {
                        borderColor: 'text.secondary',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveRounded />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{
                      px: 3,
                      py: 1.1,
                      borderRadius: 999,
                      bgcolor: 'primary.main',
                      boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      fontWeight: 800,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        boxShadow: (theme) => `0 10px 24px ${alpha(theme.palette.primary.main, 0.26)}`,
                      },
                    }}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Họ tên
                </Typography>
                <TextField
                  fullWidth
                  name="hoTen"
                  value={isEditing ? tempProfile.hoTen : profile.hoTen}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nhập họ và tên"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing ? 'action.hover' : 'background.paper',
                        transition: 'all 160ms ease',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(17,17,17,0.08)',
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  value={isEditing ? tempProfile.email : profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="example@gmail.com"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing ? 'action.hover' : 'background.paper',
                        transition: 'all 160ms ease',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(17,17,17,0.08)',
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Số điện thoại
                </Typography>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  value={isEditing ? tempProfile.phoneNumber : profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nhập số điện thoại"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing ? 'action.hover' : 'background.paper',
                        transition: 'all 160ms ease',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(17,17,17,0.08)',
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CakeRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Ngày sinh
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  name="ngaySinh"
                  value={isEditing ? tempProfile.ngaySinh : profile.ngaySinh}
                  onChange={handleChange}
                  disabled={!isEditing}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing ? 'action.hover' : 'background.paper',
                        transition: 'all 160ms ease',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(17,17,17,0.08)',
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Địa chỉ
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="diaChi"
                  value={isEditing ? tempProfile.diaChi : profile.diaChi}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Nhập địa chỉ của bạn"
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: 2.8,
                        bgcolor: !isEditing ? 'action.hover' : 'background.paper',
                        transition: 'all 160ms ease',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(17,17,17,0.08)',
                      },
                    },
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
