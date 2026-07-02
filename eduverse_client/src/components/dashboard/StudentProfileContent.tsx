/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { apiService } from '@/src/services/index';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputBase,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Avatar,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  CameraAltRounded,
  CheckCircleRounded,
  EmojiEventsRounded,
  TimelineRounded,
  LockRounded,
  QrCodeRounded,
  ShareRounded,
  DownloadRounded,
  PrintRounded,
  InfoOutlined,
  CalendarMonthRounded,
  MilitaryTechRounded,
  LocalFireDepartmentRounded,
  PhotoCameraBackRounded,
  CloseRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  RotateRightRounded,
  ZoomInRounded,
  ZoomOutRounded,
  CheckRounded,
} from '@mui/icons-material';

const TextFieldAny = TextField as any;

// Crimson Red Palette
const COLORS = {
  primary: '#8D1313',       // Crimson Red
  primaryLight: '#B91C1C',  // Light Crimson
  primaryDark: '#7F1D1D',   // Dark Crimson
  bgLight: '#FFF8F6',       // Premium cream-rose background
  white: '#FFFFFF',
  textDark: '#1F2937',
  textSecondary: '#4B5563',
  green: '#10B981',
  grey: '#9CA3AF',
};

export default function StudentProfileContent() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Instructor upgrade requests state
  const [instructorRequest, setInstructorRequest] = useState<any>(null);
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [motivation, setMotivation] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');

  // Form validation errors
  const [errors, setErrors] = useState<any>({});

  // Security tab fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [securityErrors, setSecurityErrors] = useState<any>({});
  const [enable2FA, setEnable2FA] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFAData, setTwoFAData] = useState<any>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Achievements & Badges
  const [achievements, setAchievements] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // Certificates
  const [certificates, setCertificates] = useState<any[]>([]);

  // Avatar & Cover Upload & Crop
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // Toasts / Messages
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
  const showToast = (message: string, severity: 'success' | 'error') => {
    setToast({ open: true, message, severity });
    setTimeout(() => setToast(null), 4000);
  };
  // Fetch all profile details
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await apiService.get<any>('/profile');
      if (res.status && res.data) {
        const d = res.data;
        setProfile(d);
        setFullName(d.hoTen || '');
        setEmail(d.email || '');
        setPhoneNumber(d.phoneNumber || '');
        setDateOfBirth(d.ngaySinh || '');
        setBio(d.tieuSu || '');
        setAddress(d.diaChi || '');
        setEnable2FA(!!d.twoFactorEnabled);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải thông tin cá nhân', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementsAndCerts = async () => {
    try {
      const [achRes, badgeRes, certRes] = await Promise.all([
        apiService.get<any>('/achievements'),
        apiService.get<any>('/badges'),
        apiService.get<any>('/certificates'),
      ]);

      if (achRes.status && achRes.data) setAchievements(achRes.data);
      if (badgeRes.status && badgeRes.data) setBadges(badgeRes.data);
      if (certRes.status && certRes.data) setCertificates(certRes.data);
    } catch (err: any) {
      console.log('Error fetching extra achievements/certs data:', err);
    }
  };

  const fetchUpgradeRequest = async () => {
    try {
      const res = await apiService.get<any>('/profile/upgrade-request');
      if (res.status && res.data) {
        setInstructorRequest(res.data);
        setSpecialty(res.data.chuyenMon || '');
        setExperience(res.data.kinhNghiem || '');
        setMotivation(res.data.lyDo || '');
      }
    } catch (err) {
      console.log('Error fetching upgrade request:', err);
    }
  };

  const handleSubmitUpgrade = async () => {
    if (!specialty.trim() || !experience.trim() || !motivation.trim()) {
      showToast('Vui lòng điền đầy đủ các thông tin đăng ký', 'error');
      return;
    }

    try {
      setSaveLoading(true);
      const res = await apiService.post<any>('/profile/upgrade-request', {
        chuyenMon: specialty,
        kinhNghiem: experience,
        lyDo: motivation,
      });

      if (res.status) {
        showToast('Gửi yêu cầu nâng cấp thành công!', 'success');
        fetchUpgradeRequest();
      } else {
        showToast(res.message || 'Lỗi khi gửi yêu cầu', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi hệ thống khi gửi yêu cầu', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfileData();
    fetchAchievementsAndCerts();
    fetchUpgradeRequest();
  }, []);


  // Profile Save handler
  const handleSaveProfile = async () => {
    const errs: any = {};
    if (!fullName || fullName.trim().length < 2) {
      errs.fullName = 'Họ và tên phải có tối thiểu 2 ký tự';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errs.email = 'Vui lòng nhập email đúng định dạng';
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      errs.phoneNumber = 'Số điện thoại phải chứa 10-11 chữ số';
    }
    if (dateOfBirth) {
      const selectedDate = new Date(dateOfBirth);
      const today = new Date();
      if (selectedDate > today) {
        errs.dateOfBirth = 'Ngày sinh không được lớn hơn ngày hiện tại';
      }
    }
    if (bio && bio.length > 500) {
      errs.bio = 'Tiểu sử cá nhân không được vượt quá 500 ký tự';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast('Vui lòng sửa các lỗi trong form', 'error');
      return;
    }

    setErrors({});
    try {
      setSaveLoading(true);
      const res = await apiService.put<any>('/profile', {
        hoTen: fullName,
        email,
        phoneNumber,
        diaChi: address,
        ngaySinh: dateOfBirth,
        tieuSu: bio,
      });

      if (res.status) {
        showToast('Thông tin đã được cập nhật thành công', 'success');
        // Refresh display profile
        setProfile((prev: any) => ({ ...prev, ...res.data }));
      } else {
        showToast(res.message || 'Lỗi khi cập nhật thông tin', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi hệ thống khi lưu thông tin', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // Password Strength Calculator
  const handlePasswordChange = (val: string) => {
    setNewPassword(val);
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^a-zA-Z0-9]/.test(val)) strength++;
    setPasswordStrength(strength);
  };

  // Update password handler
  const handleUpdatePassword = async () => {
    const errs: any = {};
    if (!currentPassword) {
      errs.current = 'Mật khẩu hiện tại không được để trống';
    }
    if (passwordStrength < 4) {
      errs.newPass = 'Mật khẩu phải tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt';
    }
    if (newPassword !== confirmPassword) {
      errs.confirm = 'Xác nhận mật khẩu mới không khớp';
    }

    if (Object.keys(errs).length > 0) {
      setSecurityErrors(errs);
      return;
    }

    setSecurityErrors({});
    try {
      setSaveLoading(true);
      const res = await apiService.post<any>('/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword,
      });

      if (res.status) {
        showToast('Mật khẩu đã được cập nhật thành công', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
      } else {
        showToast(res.message || 'Lỗi khi cập nhật mật khẩu', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Mật khẩu cũ không chính xác', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  // 2FA Switch toggler
  const handle2FAToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      try {
        const res = await apiService.post<any>('/enable-2fa', { enable: true });
        if (res.status && res.data) {
          setTwoFAData(res.data);
          setShow2FADialog(true);
        }
      } catch (err: any) {
        showToast('Không thể kích hoạt xác thực 2 lớp', 'error');
      }
    } else {
      try {
        const res = await apiService.post<any>('/enable-2fa', { enable: false });
        if (res.status) {
          setEnable2FA(false);
          showToast('Đã tắt xác thực 2 lớp thành công', 'success');
        } else {
          showToast(res.message || 'Lỗi khi tắt xác thực 2 lớp', 'error');
        }
      } catch (err: any) {
        showToast('Lỗi hệ thống khi tắt xác thực 2 lớp', 'error');
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Mã OTP phải gồm 6 chữ số');
      return;
    }
    setOtpError('');
    try {
      const res = await apiService.post<any>('/verify-otp', { code: otpCode });
      if (res.status) {
        setEnable2FA(true);
        setShow2FADialog(false);
        setOtpCode('');
        showToast('Xác thực 2 lớp đã được kích hoạt thành công', 'success');
      } else {
        setOtpError(res.message || 'Mã OTP không hợp lệ');
      }
    } catch (err: any) {
      setOtpError('Mã OTP không hợp lệ hoặc đã hết hạn');
    }
  };

  // Avatar/Cover File Select handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setCropType(type);

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setRotation(0);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw crop preview on HTML5 canvas
  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const w = cropType === 'avatar' ? 300 : 800;
      const h = cropType === 'avatar' ? 300 : 300;
      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Move to center to rotate
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image centered
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let drawW, drawH;
      if (imgRatio > targetRatio) {
        drawH = h;
        drawW = h * imgRatio;
      } else {
        drawW = w;
        drawH = w / imgRatio;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    };
  };

  useEffect(() => {
    if (showCropDialog) {
      setTimeout(drawImageOnCanvas, 150);
    }
  }, [showCropDialog, zoom, rotation, imageSrc, cropType]);

  // Save Cropped Image to backend
  const handleSaveCroppedImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], cropType === 'avatar' ? 'avatar.jpg' : 'cover.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);

      try {
        setSaveLoading(true);
        const urlPath = cropType === 'avatar' ? '/profile/avatar' : '/profile/cover';
        const res = await apiService.post<any>(urlPath, formData);

        if (res.status && res.data) {
          showToast(cropType === 'avatar' ? 'Ảnh đại diện đã được lưu' : 'Ảnh bìa đã được lưu', 'success');
          setProfile((prev: any) => ({
            ...prev,
            [cropType === 'avatar' ? 'anhDaiDien' : 'anhBia']: res.data.url,
          }));
          setShowCropDialog(false);
        } else {
          showToast(res.message || 'Lỗi khi lưu ảnh', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Lỗi hệ thống khi tải ảnh lên', 'error');
      } finally {
        setSaveLoading(false);
      }
    }, 'image/jpeg');
  };

  const handleDownloadCert = async (certId: string) => {
    try {
      showToast('Đang tải xuống chứng chỉ PDF...', 'success');
      const blob = await apiService.getBlob(`/certificates/download/${certId}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ChungChi-${certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast('Không thể tải xuống chứng chỉ PDF', 'error');
    }
  };

  // Filtered achievements listing
  const filteredAchievements = useMemo(() => {
    let list = [...achievements];
    if (filterMonth !== 'all') {
      list = list.filter(a => a.date && a.date.includes(`/${filterMonth}/`));
    }
    if (filterYear !== 'all') {
      list = list.filter(a => a.date && a.date.endsWith(filterYear));
    }
    if (sortOrder === 'highest') {
      list.sort((a, b) => (b.isAchieved ? 1 : 0) - (a.isAchieved ? 1 : 0));
    } else {
      // newest based on date if achieved
      list.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime();
      });
    }
    return list;
  }, [achievements, filterMonth, filterYear, sortOrder]);

  if (loading || !profile) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 350, py: 10 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: -1 }}>
      {/* Toast alert */}
      {toast && (
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            bgcolor: toast.severity === 'success' ? COLORS.green : '#B91C1C',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          }}
        >
          <CheckCircleRounded sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{toast.message}</Typography>
        </Paper>
      )}

      {/* 1. Header Profile Banner Cover */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          height: { xs: 140, md: 180 },
          borderRadius: '24px',
          bgcolor: '#E2E8F0',
          backgroundImage: profile.anhBia ? `url(${profile.anhBia})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.015)',
        }}
      >
        {/* Shadow Overlay */}
        <Box sx={{ position: 'absolute', inset: 0, bg: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)' }} />

        {/* Change Cover Photo button */}
        <Button
          variant="contained"
          startIcon={<PhotoCameraBackRounded />}
          onClick={() => coverInputRef.current?.click()}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            bgcolor: 'rgba(255,255,255,0.9)',
            color: COLORS.textDark,
            fontSize: 12.5,
            fontWeight: 800,
            borderRadius: '10px',
            px: 2,
            py: 0.8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            textTransform: 'none',
            '&:hover': { bgcolor: '#F9FAFB' },
          }}
        >
          Đổi ảnh bìa
        </Button>
        <input
          type="file"
          ref={coverInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'cover')}
        />
      </Paper>

      {/* 2. User Stats & Basic Information Header Grid */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '24px',
          bgcolor: COLORS.white,
          border: '1px solid rgba(141,19,19,0.06)',
          mt: -6, // pull up banner overlap
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 10px 30px rgba(141,19,19,0.015)',
        }}
      >
        <Grid container spacing={3.5} sx={{ alignItems: 'center' }}>
          {/* Avatar Area */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={3.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profile.anhDaiDien || undefined}
                  sx={{
                    width: 110,
                    height: 110,
                    border: '5px solid #fff',
                    borderRadius: '20px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    bgcolor: COLORS.primary,
                    color: '#fff',
                    fontSize: 32,
                    fontWeight: 900,
                  }}
                >
                  {profile.hoTen.split(' ').pop()?.substring(0, 2).toUpperCase()}
                </Avatar>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: COLORS.primary,
                    color: '#fff',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    '&:hover': { bgcolor: COLORS.primaryDark },
                  }}
                >
                  <CameraAltRounded sx={{ fontSize: 16 }} />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontSize: 21, fontWeight: 900, color: COLORS.textDark }}>
                  {profile.hoTen}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
                  <CheckCircleRounded sx={{ color: COLORS.primary, fontSize: 16 }} />
                  <Typography sx={{ fontSize: 13, color: 'rgba(31,41,55,0.6)', fontWeight: 700 }}>
                    {profile.chucVu}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'rgba(31,41,55,0.3)' }}>•</Typography>
                  <Typography sx={{ fontSize: 13, color: 'rgba(31,41,55,0.4)', fontWeight: 650 }}>
                    ID: {profile.id.substring(0, 8).toUpperCase()}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Quick Realtime Stats cards */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              direction="row"
              spacing={3}
              sx={{
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'center',
              }}
            >
              {[
                { label: 'Khóa học', value: profile.stats?.courses || 12 },
                { label: 'Chứng chỉ', value: String(profile.stats?.certificates || 8).padStart(2, '0') },
                { label: 'Giờ học', value: (profile.stats?.hours || 145) + 'h' },
              ].map((stat, idx) => (
                <Box
                  key={idx}
                  sx={{
                    textAlign: 'center',
                    px: 3,
                    py: 1,
                    borderRadius: '16px',
                    bgcolor: COLORS.bgLight,
                    border: '1px solid rgba(141,19,19,0.04)',
                    minWidth: 90,
                  }}
                >
                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: COLORS.primary }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(31,41,55,0.5)', mt: 0.2 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Horizontal Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          '& .MuiTabs-indicator': {
            bgcolor: COLORS.primary,
            height: 3,
            borderRadius: '3px',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: 14,
            fontWeight: 800,
            color: 'rgba(31,41,55,0.5)',
            px: 2,
            pb: 1.5,
            '&.Mui-selected': { color: COLORS.primary },
          },
        }}
      >
        <Tab label="Thông tin cá nhân" />
        <Tab label="Bảo mật" />
        <Tab label="Thành tích" />
        <Tab label="Chứng chỉ" />
        <Tab label="Đăng ký Giảng viên" />
      </Tabs>

      {/* 4. Tab Content Grid */}
      <Grid container spacing={3.5}>
        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === 0 && (
          <>
            {/* Left side details form */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '24px',
                  bgcolor: COLORS.white,
                  border: '1px solid rgba(141,19,19,0.06)',
                }}
              >
                <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 900, color: COLORS.textDark, mb: 3 }}>
                  Thông tin chi tiết
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldAny
                      fullWidth
                      label="Họ và Tên"
                      value={fullName}
                      onChange={(e: any) => setFullName(e.target.value)}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      placeholder="Nguyễn Minh Triết"
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldAny
                      fullWidth
                      label="Email"
                      value={email}
                      onChange={(e: any) => setEmail(e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      placeholder="minhtriet.exec@lumina.edu"
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldAny
                      fullWidth
                      label="Số điện thoại"
                      value={phoneNumber}
                      onChange={(e: any) => setPhoneNumber(e.target.value)}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      placeholder="+84 901 234 567"
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextFieldAny
                      fullWidth
                      label="Ngày sinh"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e: any) => setDateOfBirth(e.target.value)}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth}
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextFieldAny
                      fullWidth
                      multiline
                      rows={3}
                      label="Tiểu sử cá nhân"
                      value={bio}
                      onChange={(e: any) => setBio(e.target.value.substring(0, 500))}
                      placeholder="Nhập giới thiệu ngắn về bản thân..."
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Typography
                      sx={{
                        fontSize: 11.5,
                        textAlign: 'right',
                        color: 'rgba(31,41,55,0.4)',
                        fontWeight: 700,
                        mt: 0.5,
                      }}
                    >
                      Còn lại: {500 - bio.length} / 500 ký tự
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextFieldAny
                      fullWidth
                      multiline
                      rows={2}
                      label="Địa chỉ liên hệ"
                      value={address}
                      onChange={(e: any) => setAddress(e.target.value)}
                      placeholder="72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh"
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleSaveProfile}
                        disabled={saveLoading}
                        sx={{
                          bgcolor: COLORS.primary,
                          color: '#fff',
                          fontWeight: 800,
                          borderRadius: '12px',
                          px: 4,
                          py: 1.25,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: 'none' },
                        }}
                      >
                        {saveLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Lưu thay đổi'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right side widgets (Progress & Timeline) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3.5}>
                {/* 1. Progress current courses */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: '24px',
                    bgcolor: COLORS.white,
                    border: '1px solid rgba(141,19,19,0.06)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: 15.5, fontWeight: 900, color: COLORS.textDark, mb: 3.5 }}>
                    Tiến độ hiện tại
                  </Typography>
                  <Stack spacing={3}>
                    {[
                      { name: 'Quản trị Tài chính', progress: 85 },
                      { name: 'Lãnh đạo Đổi mới', progress: 42 },
                    ].map((item, i) => (
                      <Box key={i}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.8, alignItems: 'center' }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 800, color: COLORS.textDark }}>
                            {item.name}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 900, color: COLORS.primary }}>
                            {item.progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress}
                          sx={{
                            height: 6,
                            borderRadius: '3px',
                            bgcolor: 'rgba(141,19,19,0.04)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: '3px',
                              bgcolor: COLORS.primary,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                {/* 2. Recent activities timeline */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: '24px',
                    bgcolor: COLORS.white,
                    border: '1px solid rgba(141,19,19,0.06)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: 15.5, fontWeight: 900, color: COLORS.textDark, mb: 3.5 }}>
                    Hoạt động gần đây
                  </Typography>

                  <Stack spacing={3} sx={{ position: 'relative', pl: 2.5 }}>
                    {/* Vertical timeline line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 6,
                        top: 8,
                        bottom: 8,
                        width: 2,
                        bgcolor: 'rgba(141,19,19,0.08)',
                      }}
                    />

                    {[
                      { title: 'Hoàn thành Module 4', desc: 'Phân tích rủi ro tài chính doanh nghiệp', time: 'Hôm nay, 10:45 AM' },
                      { title: 'Nhận Chứng chỉ', desc: 'Digital Transformation Executive', time: 'Hôm qua, 14:23 PM' },
                      { title: 'Tham gia Thảo luận', desc: 'Topic: Tương lai của AI trong quản trị', time: '24 Thg 10, 2026' },
                      { title: 'Bắt đầu khóa học mới', desc: 'Lập trình JavaScript thực chiến', time: '20 Thg 10, 2026' },
                    ].map((act, i) => (
                      <Box key={i} sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -24.5,
                            top: 4,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: i === 0 ? COLORS.primary : 'rgba(141,19,19,0.2)',
                            border: '2px solid #fff',
                            boxShadow: '0 0 0 2px rgba(141,19,19,0.05)',
                          }}
                        />
                        <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: COLORS.textDark }}>
                          {act.title}
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: 'rgba(31,41,55,0.6)', mt: 0.2 }}>
                          {act.desc}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'rgba(31,41,55,0.4)', fontWeight: 700, mt: 0.5 }}>
                          {act.time}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 3.5, textAlign: 'center' }}>
                    <Typography
                      component="a"
                      href="#activity-history"
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: COLORS.primary,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Xem lịch sử đầy đủ
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </Grid>

            {/* Bottom highlights achievements section */}
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '24px',
                  bgcolor: COLORS.white,
                  border: '1px solid rgba(141,19,19,0.06)',
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontSize: 16.5, fontWeight: 900, color: COLORS.textDark }}>
                    Thành tích nổi bật
                  </Typography>
                  <Typography
                    onClick={() => setActiveTab(2)}
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: COLORS.primary,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Xem tất cả
                  </Typography>
                </Stack>

                <Grid container spacing={3.5}>
                  {achievements.map((badge) => (
                    <Grid key={badge.id} size={{ xs: 12, sm: 6, md: 3 }}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedBadge(badge)}
                        sx={{
                          p: 3,
                          borderRadius: '20px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          bgcolor: badge.isAchieved ? COLORS.white : 'rgba(0,0,0,0.015)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                          opacity: badge.isAchieved ? 1 : 0.6,
                          '&:hover': {
                            borderColor: COLORS.primary,
                            boxShadow: badge.isAchieved ? '0 8px 24px rgba(141, 19, 19, 0.05)' : 'none',
                            transform: badge.isAchieved ? 'translateY(-2px)' : 'none',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: badge.isAchieved ? 'rgba(141, 19, 19, 0.05)' : 'rgba(0,0,0,0.03)',
                            color: badge.isAchieved ? COLORS.primary : 'rgba(0,0,0,0.35)',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          {badge.icon === 'award' ? (
                            <MilitaryTechRounded sx={{ fontSize: 24 }} />
                          ) : badge.icon === 'check' ? (
                            <CheckCircleRounded sx={{ fontSize: 22 }} />
                          ) : badge.icon === 'chat' ? (
                            <TimelineRounded sx={{ fontSize: 22 }} />
                          ) : (
                            <MilitaryTechRounded sx={{ fontSize: 24 }} />
                          )}
                        </Box>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 900, color: COLORS.textDark }}>
                          {badge.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(31,41,55,0.45)', fontWeight: 700, mt: 0.5 }}>
                          {badge.detail}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </>
        )}

        {/* TAB 2: BẢO MẬT */}
        {activeTab === 1 && (
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3.5}>
              {/* Change password panel */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    bgcolor: COLORS.white,
                    border: '1px solid rgba(141,19,19,0.06)',
                    height: '100%',
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: 16.5, fontWeight: 900, color: COLORS.textDark, mb: 3 }}>
                    Đổi mật khẩu
                  </Typography>

                  <Stack spacing={2.5}>
                    <TextFieldAny
                      fullWidth
                      label="Mật khẩu hiện tại"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e: any) => setCurrentPassword(e.target.value)}
                      error={!!securityErrors.current}
                      helperText={securityErrors.current}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                            {showCurrentPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        ),
                      }}
                    />

                    <Box>
                      <TextFieldAny
                        fullWidth
                        label="Mật khẩu mới"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e: any) => handlePasswordChange(e.target.value)}
                        error={!!securityErrors.newPass}
                        helperText={securityErrors.newPass}
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                              {showNewPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                            </IconButton>
                          ),
                        }}
                      />

                      {/* Password strength meter */}
                      {newPassword && (
                        <Box sx={{ mt: 1.5 }}>
                          <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
                            {[1, 2, 3, 4].map((step) => (
                              <Box
                                key={step}
                                sx={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: '2px',
                                  bgcolor:
                                    step <= passwordStrength
                                      ? passwordStrength === 4
                                        ? COLORS.green
                                        : passwordStrength >= 2
                                        ? '#F59E0B'
                                        : '#EF4444'
                                      : 'rgba(0,0,0,0.06)',
                                }}
                              />
                            ))}
                          </Stack>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'rgba(31,41,55,0.45)' }}>
                            Độ mạnh: {passwordStrength === 4 ? 'Mạnh' : passwordStrength >= 2 ? 'Trung bình' : 'Yếu'}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <TextFieldAny
                      fullWidth
                      label="Xác nhận mật khẩu mới"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                      error={!!securityErrors.confirm}
                      helperText={securityErrors.confirm}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        ),
                      }}
                    />

                    <Button
                      variant="contained"
                      onClick={handleUpdatePassword}
                      disabled={saveLoading}
                      sx={{
                        bgcolor: COLORS.primary,
                        color: '#fff',
                        fontWeight: 800,
                        borderRadius: '12px',
                        py: 1.25,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: 'none' },
                      }}
                    >
                      {saveLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Cập nhật mật khẩu'}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>

              {/* 2FA Panel */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    bgcolor: COLORS.white,
                    border: '1px solid rgba(141,19,19,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontSize: 16.5, fontWeight: 900, color: COLORS.textDark, mb: 2 }}>
                      Xác thực 2 lớp (2FA)
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', mb: 2.5, lineHeight: 1.6 }}>
                      Tăng cường bảo mật cho tài khoản của bạn bằng cách yêu cầu mã xác minh OTP mỗi lần đăng nhập. Bạn có thể sử dụng ứng dụng Google Authenticator hoặc Microsoft Authenticator để nhận mã.
                    </Typography>

                    <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: COLORS.bgLight, border: '1px solid rgba(141,19,19,0.03)', mb: 2.5 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: COLORS.textDark }}>
                            Google Authenticator
                          </Typography>
                          <Typography sx={{ fontSize: 12.5, color: 'rgba(31,41,55,0.45)', mt: 0.2, fontWeight: 650 }}>
                            Trạng thái: {enable2FA ? 'Đang kích hoạt' : 'Chưa bật'}
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={<Switch checked={enable2FA} onChange={handle2FAToggle} color="primary" />}
                          label=""
                          sx={{ m: 0 }}
                        />
                      </Stack>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'rgba(31,41,55,0.4)', borderTop: '1px solid rgba(0,0,0,0.05)', pt: 3.5 }}>
                    <InfoOutlined sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: 11.5, fontWeight: 650 }}>
                      Sau khi kích hoạt, bạn sẽ cần nhập mã OTP 6 chữ số từ ứng dụng xác minh mỗi lần đăng nhập.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* TAB 3: THÀNH TÍCH */}
        {activeTab === 2 && (
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '24px',
                bgcolor: COLORS.white,
                border: '1px solid rgba(141,19,19,0.06)',
              }}
            >
              {/* Header section with filters */}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', md: 'center' },
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 900, color: COLORS.textDark }}>
                    Huy hiệu và Điểm thưởng
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', mt: 0.2 }}>
                    Danh sách các huy hiệu và thành tích bạn đạt được trong học tập.
                  </Typography>
                </Box>

                {/* Filters */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="month-select-label">Tháng</InputLabel>
                    <Select
                      labelId="month-select-label"
                      label="Tháng"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="05">Tháng 5</MenuItem>
                      <MenuItem value="06">Tháng 6</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id="year-select-label">Năm</InputLabel>
                    <Select
                      labelId="year-select-label"
                      label="Năm"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="2026">2026</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel id="sort-select-label">Sắp xếp</InputLabel>
                    <Select
                      labelId="sort-select-label"
                      label="Sắp xếp"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <MenuItem value="newest">Mới nhất</MenuItem>
                      <MenuItem value="highest">Đạt được trước</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>

              {/* Achievements Grid list */}
              <Grid container spacing={3.5}>
                {filteredAchievements.map((badge) => (
                  <Grid key={badge.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedBadge(badge)}
                      sx={{
                        p: 3,
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.06)',
                        bgcolor: badge.isAchieved ? COLORS.white : 'rgba(0,0,0,0.015)',
                        position: 'relative',
                        display: 'flex',
                        gap: 2,
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        '&:hover': {
                          borderColor: COLORS.primary,
                          boxShadow: badge.isAchieved ? '0 8px 24px rgba(141, 19, 19, 0.05)' : 'none',
                          transform: badge.isAchieved ? 'translateY(-2px)' : 'none',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: badge.isAchieved ? 'rgba(141, 19, 19, 0.05)' : 'rgba(0,0,0,0.03)',
                          color: badge.isAchieved ? COLORS.primary : 'rgba(0,0,0,0.3)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {badge.icon === 'award' ? (
                          <MilitaryTechRounded sx={{ fontSize: 26 }} />
                        ) : badge.icon === 'check' ? (
                          <CheckCircleRounded sx={{ fontSize: 24 }} />
                        ) : badge.icon === 'chat' ? (
                          <TimelineRounded sx={{ fontSize: 24 }} />
                        ) : (
                          <MilitaryTechRounded sx={{ fontSize: 26 }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: COLORS.textDark,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {badge.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            color: 'rgba(31,41,55,0.5)',
                            mt: 0.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {badge.condition}
                        </Typography>
                        <Chip
                          label={badge.isAchieved ? `Đạt được: ${badge.date}` : 'Chưa đạt'}
                          size="small"
                          sx={{
                            mt: 2,
                            height: 22,
                            fontSize: 10.5,
                            fontWeight: 800,
                            bgcolor: badge.isAchieved ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.05)',
                            color: badge.isAchieved ? COLORS.green : 'rgba(31,41,55,0.4)',
                            border: badge.isAchieved ? '1px solid rgba(16,185,129,0.1)' : '1px solid transparent',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* TAB 4: CHỨNG CHỈ */}
        {activeTab === 3 && (
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '24px',
                bgcolor: COLORS.white,
                border: '1px solid rgba(141,19,19,0.06)',
              }}
            >
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 900, color: COLORS.textDark, mb: 0.5 }}>
                Danh sách chứng chỉ
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', mb: 4 }}>
                Các chứng chỉ bạn đã xuất sắc nhận được sau khi hoàn thành khóa học.
              </Typography>

              <Grid container spacing={3.5}>
                {certificates.map((cert) => (
                  <Grid key={cert.id} size={{ xs: 12, md: 6 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.07)',
                        bgcolor: COLORS.white,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2.5,
                        transition: 'transform 200ms, box-shadow 200ms',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 24px rgba(141, 19, 19, 0.04)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                        {/* Certificate Icon Visual representation */}
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                            display: 'grid',
                            placeItems: 'center',
                            border: '2px solid rgba(141,19,19,0.1)',
                            flexShrink: 0,
                          }}
                        >
                          <EmojiEventsRounded sx={{ color: '#F59E0B', fontSize: 32 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 900,
                              color: COLORS.textDark,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: { xs: 220, sm: 280 },
                            }}
                          >
                            {cert.tenChungChi}
                          </Typography>
                          <Typography sx={{ fontSize: 12.5, color: 'rgba(31,41,55,0.6)', mt: 0.2 }}>
                            {cert.khoaHoc}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: 'rgba(31,41,55,0.4)', fontWeight: 700, mt: 0.8 }}>
                            Cấp ngày: {cert.ngayCap} • Mã số: {cert.maSoChungChi.substring(0, 10).toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Actions */}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignSelf: { xs: 'flex-end', sm: 'center' },
                        }}
                      >
                        <Tooltip title="Tải PDF">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadCert(cert.id)}
                            sx={{
                              border: '1px solid rgba(0,0,0,0.06)',
                              bgcolor: COLORS.bgLight,
                              color: COLORS.primary,
                              '&:hover': { bgcolor: 'rgba(141,19,19,0.06)' },
                            }}
                          >
                            <DownloadRounded sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chia sẻ">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const shareLink = cert.urlChungChi && cert.urlChungChi !== '#'
                                ? cert.urlChungChi
                                : `${window.location.origin}/student/profile?tab=certificates&id=${cert.id}`;
                              navigator.clipboard.writeText(shareLink);
                              showToast('Đường liên kết chứng chỉ đã được sao chép vào bộ nhớ tạm!', 'success');
                            }}
                            sx={{
                              border: '1px solid rgba(0,0,0,0.06)',
                              bgcolor: COLORS.bgLight,
                              color: COLORS.primary,
                              '&:hover': { bgcolor: 'rgba(141,19,19,0.06)' },
                            }}
                          >
                            <ShareRounded sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* TAB 5: ĐĂNG KÝ GIẢNG VIÊN */}
        {activeTab === 4 && (
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: '24px',
                bgcolor: COLORS.white,
                border: '1px solid rgba(141,19,19,0.06)',
              }}
            >
              <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 900, color: COLORS.textDark, mb: 0.5 }}>
                Đăng ký nâng cấp tài khoản Giảng viên
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', mb: 4 }}>
                Trở thành giảng viên để tạo, quản lý và chia sẻ khóa học của riêng bạn trên hệ thống EduVerse.
              </Typography>

              {instructorRequest && instructorRequest.status === 0 ? (
                // Pending status
                <Box
                  sx={{
                    p: 4,
                    borderRadius: '16px',
                    bgcolor: 'rgba(245, 158, 11, 0.05)',
                    border: '1px dashed #F59E0B',
                    textAlign: 'center',
                    maxWidth: 500,
                    mx: 'auto',
                    my: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: 16.5, fontWeight: 900, color: '#D97706', mb: 1 }}>
                    ⏳ Đang chờ phê duyệt
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: '#B45309', lineHeight: 1.6 }}>
                    Yêu cầu nâng cấp của bạn đã được gửi thành công vào lúc <strong>{new Date(instructorRequest.createdDate).toLocaleDateString('vi-VN')}</strong>.
                    Ban quản trị đang xem xét thông tin của bạn. Vui lòng chờ phê duyệt.
                  </Typography>
                </Box>
              ) : instructorRequest && instructorRequest.status === 1 ? (
                // Approved status
                <Box
                  sx={{
                    p: 4,
                    borderRadius: '16px',
                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px dashed #10B981',
                    textAlign: 'center',
                    maxWidth: 500,
                    mx: 'auto',
                    my: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontSize: 16.5, fontWeight: 900, color: '#059669', mb: 1 }}>
                    🎉 Đã phê duyệt!
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: '#047857', lineHeight: 1.6 }}>
                    Yêu cầu của bạn đã được phê duyệt. Bạn đã là một Giảng viên chính thức của EduVerse!
                    Hãy đăng nhập lại để cập nhật quyền truy cập bảng quản trị dành riêng cho Giảng viên.
                  </Typography>
                </Box>
              ) : (
                // Form input (No request or Rejected status)
                <Grid container spacing={3}>
                  {instructorRequest && instructorRequest.status === 2 && (
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          bgcolor: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#DC2626', mb: 0.5 }}>
                          ❌ Yêu cầu trước đó bị từ chối
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: '#B91C1C', lineHeight: 1.5 }}>
                          Lý do phản hồi từ Admin: {instructorRequest.adminNotes || 'Không có ghi chú.'}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(185,28,28,0.7)', mt: 1, fontWeight: 600 }}>
                          Bạn có thể điều chỉnh thông tin bên dưới và gửi lại yêu cầu mới.
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <TextFieldAny
                      fullWidth
                      label="Lĩnh vực chuyên môn"
                      value={specialty}
                      onChange={(e: any) => setSpecialty(e.target.value)}
                      placeholder="Ví dụ: Công nghệ thông tin, Thiết kế đồ họa, Quản trị kinh doanh..."
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextFieldAny
                      fullWidth
                      multiline
                      rows={4}
                      label="Kinh nghiệm làm việc & giảng dạy"
                      value={experience}
                      onChange={(e: any) => setExperience(e.target.value)}
                      placeholder="Chi tiết về các dự án đã tham gia, số năm kinh nghiệm, các đơn vị đã công tác..."
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextFieldAny
                      fullWidth
                      multiline
                      rows={3}
                      label="Lý do & Kế hoạch giảng dạy tại EduVerse"
                      value={motivation}
                      onChange={(e: any) => setMotivation(e.target.value)}
                      placeholder="Tại sao bạn muốn giảng dạy tại đây và bạn dự kiến biên soạn các chủ đề khóa học nào?"
                      InputLabelProps={{ shrink: true }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                      <Button
                        variant="contained"
                        onClick={handleSubmitUpgrade}
                        disabled={saveLoading}
                        sx={{
                          bgcolor: COLORS.primary,
                          color: '#fff',
                          fontWeight: 800,
                          borderRadius: '12px',
                          px: 4,
                          py: 1.25,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: 'none' },
                        }}
                      >
                        {saveLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Gửi yêu cầu xét duyệt'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* dialog for crop modal */}
      <Dialog open={showCropDialog} onClose={() => setShowCropDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 17, fontWeight: 900, color: COLORS.textDark }}>
            Chỉnh sửa {cropType === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'}
          </Typography>
          <IconButton onClick={() => setShowCropDialog(false)} size="small">
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'grid', placeItems: 'center', bgcolor: '#F9FAFB', py: 4 }}>
          {/* Canvas crop box */}
          <Box sx={{ border: '2px dashed rgba(0,0,0,0.1)', borderRadius: cropType === 'avatar' ? '20px' : '8px', overflow: 'hidden', bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%' }} />
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={3} sx={{ mt: 3, alignItems: 'center', width: '100%', maxWidth: 360, justifyContent: 'center' }}>
            <IconButton onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} size="small">
              <ZoomOutRounded />
            </IconButton>
            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: COLORS.textSecondary }}>
              Zoom: {Math.round(zoom * 100)}%
            </Typography>
            <IconButton onClick={() => setZoom(Math.min(3, zoom + 0.1))} size="small">
              <ZoomInRounded />
            </IconButton>
            <IconButton onClick={() => setRotation((rotation + 90) % 360)} size="small" sx={{ ml: 1 }}>
              <RotateRightRounded />
            </IconButton>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setShowCropDialog(false)} sx={{ color: 'rgba(31,41,55,0.6)', fontWeight: 800 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCroppedImage}
            disabled={saveLoading}
            sx={{
              bgcolor: COLORS.primary,
              color: '#fff',
              fontWeight: 800,
              borderRadius: '10px',
              px: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: 'none' },
            }}
          >
            {saveLoading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Lưu ảnh'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog for 2FA OTP verification */}
      <Dialog open={show2FADialog} onClose={() => setShow2FADialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 16.5, fontWeight: 900, color: COLORS.textDark }}>
            Thiết lập xác thực 2 lớp
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'rgba(31,41,55,0.6)', mb: 3, lineHeight: 1.5 }}>
            Quét mã QR dưới đây bằng ứng dụng Google Authenticator và nhập mã OTP 6 chữ số để kích hoạt.
          </Typography>

          {twoFAData && (
            <Stack spacing={3} sx={{ alignItems: 'center' }}>
              <Box
                component="img"
                src={twoFAData.qrCode}
                alt="2FA QR Code"
                sx={{
                  width: 150,
                  height: 150,
                  border: '1px solid rgba(0,0,0,0.08)',
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#fff',
                }}
              />
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'rgba(31,41,55,0.45)' }}>
                Secret Key: <span style={{ color: COLORS.primary }}>{twoFAData.secret}</span>
              </Typography>

              <TextFieldAny
                fullWidth
                label="Mã xác thực OTP"
                value={otpCode}
                onChange={(e: any) => setOtpCode(e.target.value.substring(0, 6).replace(/[^0-9]/g, ''))}
                error={!!otpError}
                helperText={otpError}
                placeholder="000 000"
                inputProps={{ style: { textAlign: 'center', letterSpacing: '8px', fontSize: '18px', fontWeight: 'bold' } }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setShow2FADialog(false)} sx={{ color: 'rgba(31,41,55,0.5)', fontWeight: 800 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyOTP}
            sx={{
              bgcolor: COLORS.primary,
              color: '#fff',
              fontWeight: 800,
              borderRadius: '10px',
              px: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: 'none' },
            }}
          >
            Xác minh & Kích hoạt
          </Button>
        </DialogActions>
      </Dialog>

      {/* dialog for badge detail */}
      <Dialog open={!!selectedBadge} onClose={() => setSelectedBadge(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: COLORS.textDark }}>
            Chi tiết thành tích
          </Typography>
          <IconButton onClick={() => setSelectedBadge(null)} size="small">
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        {selectedBadge && (
          <DialogContent sx={{ py: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: selectedBadge.isAchieved ? 'rgba(141, 19, 19, 0.05)' : 'rgba(0,0,0,0.03)',
                color: selectedBadge.isAchieved ? COLORS.primary : 'rgba(0,0,0,0.3)',
                mx: 'auto',
                mb: 2,
              }}
            >
              {selectedBadge.icon === 'award' ? (
                <MilitaryTechRounded sx={{ fontSize: 36 }} />
              ) : selectedBadge.icon === 'check' ? (
                <CheckCircleRounded sx={{ fontSize: 32 }} />
              ) : selectedBadge.icon === 'chat' ? (
                <TimelineRounded sx={{ fontSize: 32 }} />
              ) : (
                <MilitaryTechRounded sx={{ fontSize: 36 }} />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 950, color: COLORS.textDark }}>
              {selectedBadge.name}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(31,41,55,0.6)', mt: 1, px: 2, lineHeight: 1.5 }}>
              {selectedBadge.condition}
            </Typography>
            {selectedBadge.isAchieved ? (
              <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: COLORS.green }}>
                  🎉 Bạn đã đạt được thành tích này!
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'rgba(31,41,55,0.45)', mt: 0.5, fontWeight: 700 }}>
                  Ngày nhận: {selectedBadge.date}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)' }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: 'rgba(31,41,55,0.45)' }}>
                  🔒 Chưa đạt được
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'rgba(31,41,55,0.4)', mt: 0.5, fontWeight: 650 }}>
                  Hãy tiếp tục học tập và tham gia thảo luận để mở khóa thành tích này.
                </Typography>
              </Box>
            )}
          </DialogContent>
        )}
      </Dialog>
    </Stack>
  );
}
