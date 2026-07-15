'use client';

import React, { useState, useEffect } from 'react';
import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Tab,
  Tabs,
  Paper,
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Avatar,
  InputAdornment,
  Alert,
  useTheme,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  AdminPanelSettingsRounded,
  SecurityRounded,
  SettingsApplicationsRounded,
  ApiRounded,
  SaveRounded,
  EmailRounded,
  PhoneRounded,
  LockRounded,

} from '@mui/icons-material';
import { useSelector } from '@/src/store/hook';
import { apiService } from '@/src/services/index';
import Swal from 'sweetalert2';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  useTheme();

  // Load user info from Redux store
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useSelector((state: any) => state.auth.user);
  
  // Profile settings state – initialize from Redux store directly to avoid
  // calling setState inside an effect (react-hooks/set-state-in-effect).
  const [profile, setProfile] = useState(() => ({
    hoTen: user?.hoTen || 'Quản trị viên',
    email: user?.email || 'admin@eduverse.id.vn',
    phone: user?.soDienThoai || '',
    roles: 'Super Admin',
    avatarUrl: '',
  }));

  // Keep profile in sync when user object changes later
  const prevUserRef = React.useRef(user);
  useEffect(() => {
    if (user && user !== prevUserRef.current) {
      prevUserRef.current = user;
      setProfile(prev => ({
        ...prev,
        hoTen: user.hoTen || prev.hoTen,
        email: user.email || prev.email,
        phone: user.soDienThoai || prev.phone,
      }));
    }
  }, [user]);

  // Fetch /dashboard to get synchronized userName and avatarUrl
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiService.get<any>('/dashboard');
        if (response.status && response.data?.welcomeStats) {
          const stats = response.data.welcomeStats;
          setProfile(prev => ({
            ...prev,
            hoTen: stats.userName || prev.hoTen,
            avatarUrl: stats.avatarUrl || prev.avatarUrl,
          }));
        }
      } catch (err) {
        console.error('Lỗi khi đồng bộ dữ liệu admin:', err);
      }
    };
    fetchDashboardData();
  }, []);

  // Security settings state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: false,
    sessionTimeout: 60, // minutes
  });

  // System configurations state
  const [system, setSystem] = useState({
    siteName: 'EduVerse LMS',
    contactEmail: 'contact@eduverse.id.vn',
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: 50, // MB
  });

  // API Integration settings state
  const [apiKeys, setApiKeys] = useState({
    googleClientId: '1023849182390-abc123xyz.apps.googleusercontent.com',
    cloudinaryCloudName: 'eduverse-cloud',
    zoomApiKey: 'zm_api_key_live_example',
    elasticSearchUrl: 'http://localhost:9200',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setSecurity(prev => ({ ...prev, [name]: value }));
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setSystem(prev => ({ ...prev, [name]: value }));
  };

  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (section: string) => {
    Swal.fire({
      title: 'Đang lưu cài đặt...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: `Đã lưu cài đặt ${section} thành công!`,
        timer: 2000,
        showConfirmButton: false,
      });
    }, 1000);
  };

  // Get User initials for avatar matching DashboardShell logic
  const userInitials = profile.hoTen
    ? profile.hoTen
        .split(' ')
        .pop()
        ?.substring(0, 2)
        .toUpperCase() || 'AD'
    : 'AD';

  return (
    <AuthGuard allowedRoles={['Admin']}>
      <DashboardShell>
        <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#8B1313',
                letterSpacing: '-0.7px',
                mb: 1.5,
              }}
            >
              Cấu hình & Cài đặt hệ thống
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14.5 }}>
              Khu vực dành riêng cho Quản trị viên điều chỉnh cấu hình toàn hệ thống, bảo mật phân quyền và tích hợp dịch vụ.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
            {/* Sidebar navigation */}
            <Grid item xs={12} md={3.5} lg={3}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: '#ffffff',
                  p: 2,
                  position: 'sticky',
                  top: '110px',
                }}
              >
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  sx={{
                    '& .MuiTabs-indicator': {
                      left: 0,
                      right: 'auto',
                      bgcolor: '#8B1313',
                      width: 4,
                      borderRadius: '4px',
                    },
                    '& .MuiTab-root': {
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: 14,
                      textTransform: 'none',
                      py: 1.75,
                      px: 2.5,
                      borderRadius: '12px',
                      color: 'text.secondary',
                      minHeight: 48,
                      mb: 1,
                      transition: 'all 200ms ease',
                      '&:hover': {
                        bgcolor: 'rgba(141,19,19,0.03)',
                        color: '#8B1313',
                      },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(141,19,19,0.06)',
                        color: '#8B1313',
                      },
                    },
                  }}
                >
                  <Tab
                    label="Tài khoản Admin"
                    icon={<AdminPanelSettingsRounded sx={{ mr: 1.5, fontSize: 20 }} />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Bảo mật & Phiên"
                    icon={<SecurityRounded sx={{ mr: 1.5, fontSize: 20 }} />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Vận hành hệ thống"
                    icon={<SettingsApplicationsRounded sx={{ mr: 1.5, fontSize: 20 }} />}
                    iconPosition="start"
                  />
                  <Tab
                    label="Tích hợp & APIs"
                    icon={<ApiRounded sx={{ mr: 1.5, fontSize: 20 }} />}
                    iconPosition="start"
                  />
                </Tabs>
              </Paper>
            </Grid>

            {/* Content Area */}
            <Grid item xs={12} md={8.5} lg={9}>
              {/* Tab 1: Account */}
              {activeTab === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    bgcolor: '#ffffff',
                    p: 4.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1F2937' }}>
                    Hồ sơ Quản trị viên
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4, alignItems: 'center' }}>
                    <Avatar
                      src={profile.avatarUrl || undefined}
                      sx={{
                        width: 72,
                        height: 72,
                        bgcolor: '#8B1313',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 24,
                      }}
                    >
                      {userInitials}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{profile.hoTen}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.5 }}>
                        Vai trò hệ thống: <strong style={{ color: '#8B1313' }}>{profile.roles}</strong>
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        name="hoTen"
                        value={profile.hoTen}
                        onChange={handleProfileChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Địa chỉ Email"
                        name="email"
                        value={profile.email}
                        disabled
                        variant="outlined"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                            style: { borderRadius: '12px', backgroundColor: '#F9FAFB' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.06)' }} />

                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={() => handleSave('thông tin cá nhân')}
                    sx={{
                      bgcolor: '#8B1313',
                      color: '#fff',
                      borderRadius: '12px',
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#7F1D1D' }
                    }}
                  >
                    Cập nhật thông tin
                  </Button>
                </Paper>
              )}

              {/* Tab 2: Security */}
              {activeTab === 1 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    bgcolor: '#ffffff',
                    p: 4.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1F2937' }}>
                    Bảo mật & Phiên làm việc
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Alert severity="warning" sx={{ borderRadius: '14px', mb: 1 }}>
                        Quản trị viên cần định kỳ đổi mật khẩu mạnh để phòng ngừa các cuộc tấn công khai thác quyền truy cập.
                      </Alert>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        value={security.currentPassword}
                        onChange={handleSecurityChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}></Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Mật khẩu mới"
                        name="newPassword"
                        value={security.newPassword}
                        onChange={handleSecurityChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        value={security.confirmPassword}
                        onChange={handleSecurityChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockRounded sx={{ color: 'text.secondary', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.06)' }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="session-timeout-label">Thời gian hết hạn phiên làm việc</InputLabel>
                        <Select
                          labelId="session-timeout-label"
                          name="sessionTimeout"
                          value={security.sessionTimeout}
                          label="Thời gian hết hạn phiên làm việc"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange={handleSecurityChange as any}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value={15}>15 phút</MenuItem>
                          <MenuItem value={30}>30 phút</MenuItem>
                          <MenuItem value={60}>60 phút (Mặc định)</MenuItem>
                          <MenuItem value={120}>120 phút</MenuItem>
                          <MenuItem value={1440}>24 giờ</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={security.enable2FA}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={handleSecurityChange as any}
                            name="enable2FA"
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Bắt buộc xác thực 2 yếu tố (2FA)</Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                              Yêu cầu tất cả tài khoản quản trị sử dụng mã OTP khi đăng nhập.
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.06)' }} />

                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={() => handleSave('bảo mật')}
                    sx={{
                      bgcolor: '#8B1313',
                      color: '#fff',
                      borderRadius: '12px',
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#7F1D1D' }
                    }}
                  >
                    Lưu thay đổi bảo mật
                  </Button>
                </Paper>
              )}

              {/* Tab 3: System Operations */}
              {activeTab === 2 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    bgcolor: '#ffffff',
                    p: 4.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1F2937' }}>
                    Cấu hình vận hành hệ thống
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tên cổng thông tin LMS"
                        name="siteName"
                        value={system.siteName}
                        onChange={handleSystemChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email liên hệ hệ thống"
                        name="contactEmail"
                        value={system.contactEmail}
                        onChange={handleSystemChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="max-upload-label">Giới hạn dung lượng tải lên tối đa</InputLabel>
                        <Select
                          labelId="max-upload-label"
                          name="maxUploadSize"
                          value={system.maxUploadSize}
                          label="Giới hạn dung lượng tải lên tối đa"
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          onChange={handleSystemChange as any}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value={10}>10 MB</MenuItem>
                          <MenuItem value={20}>20 MB</MenuItem>
                          <MenuItem value={50}>50 MB (Mặc định)</MenuItem>
                          <MenuItem value={100}>100 MB</MenuItem>
                          <MenuItem value={500}>500 MB</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.06)' }} />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={system.allowRegistration}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={handleSystemChange as any}
                            name="allowRegistration"
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>Cho phép đăng ký học viên mới</Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                              Học viên mới có thể tự tạo tài khoản qua form Đăng ký.
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={system.maintenanceMode}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={handleSystemChange as any}
                            name="maintenanceMode"
                            color="error"
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: system.maintenanceMode ? '#DC2626' : 'inherit' }}>
                              Chế độ Bảo trì Hệ thống
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                              Đóng cổng thông tin và hiển thị màn hình bảo trì cho người dùng thông thường.
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.06)' }} />

                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={() => handleSave('vận hành hệ thống')}
                    sx={{
                      bgcolor: '#8B1313',
                      color: '#fff',
                      borderRadius: '12px',
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#7F1D1D' }
                    }}
                  >
                    Lưu cấu hình vận hành
                  </Button>
                </Paper>
              )}

              {/* Tab 4: APIs & Integrations */}
              {activeTab === 3 && (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    bgcolor: '#ffffff',
                    p: 4.5,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#1F2937' }}>
                    Tích hợp Dịch vụ & APIs
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Google OAuth Client ID"
                        name="googleClientId"
                        value={apiKeys.googleClientId}
                        onChange={handleApiChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px', fontFamily: 'monospace', fontSize: 13 }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cloudinary Cloud Name"
                        name="cloudinaryCloudName"
                        value={apiKeys.cloudinaryCloudName}
                        onChange={handleApiChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px', fontFamily: 'monospace', fontSize: 13 }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Elasticsearch Connection Node"
                        name="elasticSearchUrl"
                        value={apiKeys.elasticSearchUrl}
                        onChange={handleApiChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px', fontFamily: 'monospace', fontSize: 13 }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Zoom LTI Credentials (API Key)"
                        name="zoomApiKey"
                        value={apiKeys.zoomApiKey}
                        onChange={handleApiChange}
                        variant="outlined"
                        slotProps={{
                          input: {
                            style: { borderRadius: '12px', fontFamily: 'monospace', fontSize: 13 }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4, borderColor: 'rgba(0,0,0,0.06)' }} />

                  <Button
                    variant="contained"
                    startIcon={<SaveRounded />}
                    onClick={() => handleSave('tích hợp APIs')}
                    sx={{
                      bgcolor: '#8B1313',
                      color: '#fff',
                      borderRadius: '12px',
                      px: 3,
                      py: 1.2,
                      fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#7F1D1D' }
                    }}
                  >
                    Lưu khóa tích hợp
                  </Button>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
