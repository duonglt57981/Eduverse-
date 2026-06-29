'use client';

import React, { useState, useRef } from 'react';
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
  WcRounded,
} from '@mui/icons-material';

export default function AccountSettings() {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Minh Anh',
    email: 'minhanh.eduverse@gmail.com',
    phone: '0987654321',
    dob: '2002-05-15',
    gender: 'Nữ',
    address: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
    avatar: '', // Base64 placeholder or empty for initials
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
        if (!isEditing) {
          setProfile((prev) => ({
            ...prev,
            avatar: reader.result as string,
          }));
          setShowSnackbar(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setProfile({ ...tempProfile });
      setLoading(false);
      setIsEditing(false);
      setShowSnackbar(true);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  };

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
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2, bgcolor: '#2e7d32' }}
        >
          Cập nhật thông tin tài khoản thành công!
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
                src={isEditing ? tempProfile.avatar : profile.avatar}
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
                {getInitials(isEditing ? tempProfile.fullName : profile.fullName)}
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
                <CameraAltRounded fontSize="small" />
              </IconButton>
            </Box>

            <Stack spacing={1} sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                {profile.fullName}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>
                Học viên khóa học thực chiến • Mã số: EDV-202688
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
                  name="fullName"
                  value={isEditing ? tempProfile.fullName : profile.fullName}
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
                  name="phone"
                  value={isEditing ? tempProfile.phone : profile.phone}
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
                  name="dob"
                  value={isEditing ? tempProfile.dob : profile.dob}
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.75}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WcRounded fontSize="inherit" sx={{ color: 'rgba(25,23,28,0.4)' }} /> Giới tính
                </Typography>
                <FormControl fullWidth disabled={!isEditing}>
                  <Select
                    name="gender"
                    value={isEditing ? tempProfile.gender : profile.gender}
                    onChange={(e) => handleChange(e as any)}
                    sx={{
                      borderRadius: 2.8,
                      bgcolor: !isEditing ? 'action.hover' : 'background.paper',
                      transition: 'all 160ms ease',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.08)',
                      },
                    }}
                  >
                    <MenuItem value="Nam">Nam</MenuItem>
                    <MenuItem value="Nữ">Nữ</MenuItem>
                    <MenuItem value="Khác">Khác</MenuItem>
                  </Select>
                </FormControl>
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
                  name="address"
                  value={isEditing ? tempProfile.address : profile.address}
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
