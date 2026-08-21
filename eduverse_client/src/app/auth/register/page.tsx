'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { register, sendRegisterOtp, clearError, clearSuccess } from '../../../store/auth/AuthSlice';
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '@/src/theme/createAppTheme';
import { LAYOUT_SPACING, BRAND, CSSVAR, STATUS } from '@/src/theme/tokens';
import {
  ArrowBackRounded,
  BadgeRounded,
  CheckCircleRounded,
  CircleOutlined,
  EmailRounded,
  LockRounded,
  MarkEmailReadRounded,
  PersonRounded,
  RefreshRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material';

function getStrength(password: string) {
  let score = 0;
  const hasMin = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  if (hasMin) score++;
  if (hasUpper && hasNumber) score++;
  if (hasSpecial) score++;
  return { score, hasMin, hasUpper, hasNumber, hasSpecial };
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [form, setForm] = useState({
    hoTen: '',
    userName: '',
    email: '',
    password: '',
  });
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNews, setAgreeNews] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [googleSize, setGoogleSize] = useState({ width: 0, height: 40 });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  // Count down timer cho nút gửi lại OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const theme = useMemo(() => createAppTheme('light'), []);

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh'][strength.score] || '';
  const strengthTone =
    ['rgba(17,17,17,0.14)', '#b42318', '#b54708', STATUS.successDark][strength.score] ||
    '#b42318';

  const confirmMismatch =
    confirmPass.length > 0 && form.password.length > 0 && confirmPass !== form.password;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.hoTen.trim()) {
      errors.hoTen = 'Vui lòng nhập họ và tên.';
    } else if (form.hoTen.trim().length < 2) {
      errors.hoTen = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    if (!form.userName.trim()) {
      errors.userName = 'Vui lòng nhập tên đăng nhập.';
    } else if (form.userName.trim().length < 3) {
      errors.userName = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    } else if (/\s/.test(form.userName)) {
      errors.userName = 'Tên đăng nhập không được chứa dấu cách.';
    } else if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(form.userName)) {
      errors.userName = 'Tên đăng nhập không được chứa dấu tiếng Việt.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(form.userName)) {
      errors.userName = 'Tên đăng nhập chỉ được chứa chữ cái không dấu, số, dấu chấm, gạch ngang.';
    }

    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Email không đúng định dạng.';
    }

    if (!form.password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else {
      const missing: string[] = [];
      if (form.password.length < 8) missing.push('ít nhất 8 ký tự');
      if (!/[A-Z]/.test(form.password)) missing.push('1 chữ in hoa');
      if (!/[a-z]/.test(form.password)) missing.push('1 chữ thường');
      if (!/[0-9]/.test(form.password)) missing.push('1 chữ số');
      if (!/[^a-zA-Z0-9]/.test(form.password)) missing.push('1 ký tự đặc biệt');
      if (missing.length > 0) {
        errors.password = `Mật khẩu cần có: ${missing.join(', ')}.`;
      }
    }

    if (!confirmPass) {
      errors.confirmPass = 'Vui lòng xác nhận mật khẩu.';
    } else if (confirmPass !== form.password) {
      errors.confirmPass = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Bước 1: Yêu cầu gửi OTP xác minh về Email
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    dispatch(clearError());
    dispatch(clearSuccess());

    if (!validateForm()) return;

    if (!agreeTerms) {
      setLocalError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await dispatch(sendRegisterOtp({ email: form.email.trim(), userName: form.userName.trim() }));
      if (sendRegisterOtp.fulfilled.match(res)) {
        setStep(2);
        setResendCooldown(60);
        setLocalSuccess(typeof res.payload === 'string' ? res.payload : 'Mã xác minh OTP đã được gửi đến email của bạn.');
      } else {
        setLocalError(typeof res.payload === 'string' ? res.payload : 'Không thể gửi mã OTP.');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Gửi lại mã OTP ở Bước 2
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || sendingOtp) return;
    setLocalError(null);
    setLocalSuccess(null);
    dispatch(clearError());
    dispatch(clearSuccess());

    setSendingOtp(true);
    try {
      const res = await dispatch(sendRegisterOtp({ email: form.email.trim(), userName: form.userName.trim() }));
      if (sendRegisterOtp.fulfilled.match(res)) {
        setResendCooldown(60);
        setLocalSuccess('Đã gửi lại mã xác minh OTP mới tới email của bạn.');
      } else {
        setLocalError(typeof res.payload === 'string' ? res.payload : 'Gửi lại mã OTP thất bại.');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Bước 2: Nhập OTP và hoàn tất Đăng ký
  const handleConfirmRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    dispatch(clearError());
    dispatch(clearSuccess());

    if (!otp.trim() || otp.trim().length !== 6) {
      setLocalError('Vui lòng nhập đúng 6 chữ số mã OTP xác minh.');
      return;
    }

    const result = await dispatch(register({ ...form, otp: otp.trim() }));
    if (register.fulfilled.match(result)) {
      setLocalSuccess('Đăng ký tài khoản thành công! Tự động chuyển hướng về trang Đăng nhập...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    }
  };

  const activeError = localError || error;
  const activeSuccess = localSuccess || successMessage;

  const inputSx = {
    height: 44,
    borderRadius: '12px',
    bgcolor: 'rgba(17,17,17,0.025)',
    transition: 'all 200ms ease',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(17, 17, 17, 0.06)',
      transition: 'border-color 200ms ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(139, 19, 19, 0.20)',
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(17,17,17,0.015)',
      boxShadow: '0 0 0 4px rgba(139, 19, 19, 0.08)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(139, 19, 19, 0.45)',
    },
  } as const;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${CSSVAR.bg} 0%, #FFF1F1 50%, ${CSSVAR.bg} 100%)`,
          px: LAYOUT_SPACING.pagePx,
          py: LAYOUT_SPACING.pagePy,
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        {/* Floating Back to Home button */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            zIndex: 999,
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: CSSVAR.textSecondary,
                fontWeight: 600,
                fontSize: 14.5,
                transition: 'color 200ms ease',
                cursor: 'pointer',
                '&:hover': {
                  color: BRAND.main,
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
            </Box>
          </Link>
        </Box>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: step === 1 ? 680 : 540,
            borderRadius: '24px',
            border: '1px solid rgba(139, 19, 19, 0.06)',
            boxShadow: '0 24px 70px rgba(139, 19, 19, 0.04), 0 10px 30px rgba(0, 0, 0, 0.02)',
            backgroundColor: CSSVAR.paper,
            p: { xs: 4, sm: 5.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3.5,
            my: 'auto',
            transition: 'max-width 300ms ease',
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, width: '100%' }}>
            <Box sx={{ width: 250, height: 'auto', mb: 1, display: 'flex', justifyContent: 'center' }}>
              <Link href="/" style={{ display: 'block', width: '100%' }}>
                <Image
                  src="/auth/img/logo_nentrang.png"
                  alt="EduVerse"
                  width={270}
                  height={70}
                  priority
                  style={{ width: '100%', height: 'auto', objectFit: 'contain', cursor: 'pointer' }}
                />
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  fontSize: 27,
                  letterSpacing: '-0.5px',
                  mb: 1.5,
                  background: `linear-gradient(135deg, ${CSSVAR.textPrimary} 30%, ${BRAND.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {step === 1 ? 'Đăng ký tài khoản' : 'Xác minh địa chỉ Email'}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: CSSVAR.textSecondary, fontSize: 15, lineHeight: 1.6 }}
              >
                {step === 1
                  ? 'Chào mừng bạn! Hãy điền thông tin để bắt đầu hành trình học tập.'
                  : `Chúng tôi đã gửi mã xác minh OTP 6 chữ số đến email ${form.email}. Vui lòng nhập mã để hoàn tất đăng ký.`}
              </Typography>
            </Box>
          </Box>

          {/* Alert Messages */}
          {activeError && (
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                px: 3,
                py: 2,
                borderRadius: '14px',
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: BRAND.main,
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {activeError}
            </Paper>
          )}

          {activeSuccess && (
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                px: 3,
                py: 2,
                borderRadius: '14px',
                border: '1px solid rgba(10,90,58,0.25)',
                background: 'rgba(10,90,58,0.06)',
                color: STATUS.successDark,
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {activeSuccess}
            </Paper>
          )}

          {/* BƯỚC 1: ĐIỀN THÔNG TIN ĐĂNG KÝ */}
          {step === 1 && (
            <Box component="form" onSubmit={handleRequestOtp} sx={{ width: '100%' }}>
              <Grid container spacing={2.25}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!fieldErrors.hoTen}>
                    <OutlinedInput
                      placeholder="Họ và tên"
                      value={form.hoTen}
                      onChange={(e) => { setForm({ ...form, hoTen: e.target.value }); setFieldErrors((p) => ({ ...p, hoTen: '' })); }}
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                        </InputAdornment>
                      }
                      sx={inputSx}
                    />
                    {fieldErrors.hoTen && <FormHelperText>{fieldErrors.hoTen}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!fieldErrors.userName}>
                    <OutlinedInput
                      placeholder="Tên đăng nhập"
                      value={form.userName}
                      onChange={(e) => { setForm({ ...form, userName: e.target.value }); setFieldErrors((p) => ({ ...p, userName: '' })); }}
                      type="text"
                      startAdornment={
                        <InputAdornment position="start">
                          <BadgeRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                        </InputAdornment>
                      }
                      sx={inputSx}
                    />
                    {fieldErrors.userName && <FormHelperText>{fieldErrors.userName}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth error={!!fieldErrors.email}>
                    <OutlinedInput
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors((p) => ({ ...p, email: '' })); }}
                      type="email"
                      startAdornment={
                        <InputAdornment position="start">
                          <EmailRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                        </InputAdornment>
                      }
                      sx={inputSx}
                    />
                    {fieldErrors.email && <FormHelperText>{fieldErrors.email}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!fieldErrors.password}>
                    <OutlinedInput
                      placeholder="Mật khẩu"
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors((p) => ({ ...p, password: '' })); }}
                      type={showPass ? 'text' : 'password'}
                      startAdornment={
                        <InputAdornment position="start">
                          <LockRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            edge="end"
                            onClick={() => setShowPass((v) => !v)}
                            size="small"
                            sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.55))' }}
                          >
                            {showPass ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        </InputAdornment>
                      }
                      sx={inputSx}
                    />
                    {fieldErrors.password && <FormHelperText>{fieldErrors.password}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={confirmMismatch || !!fieldErrors.confirmPass}>
                    <OutlinedInput
                      placeholder="Xác nhận mật khẩu"
                      value={confirmPass}
                      onChange={(e) => { setConfirmPass(e.target.value); setFieldErrors((p) => ({ ...p, confirmPass: '' })); }}
                      type={showConfirmPass ? 'text' : 'password'}
                      startAdornment={
                        <InputAdornment position="start">
                          <LockRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showConfirmPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            edge="end"
                            onClick={() => setShowConfirmPass((v) => !v)}
                            size="small"
                            sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.55))' }}
                          >
                            {showConfirmPass ? <VisibilityOffRounded /> : <VisibilityRounded />}
                          </IconButton>
                        </InputAdornment>
                      }
                      sx={inputSx}
                    />
                    {(confirmMismatch || fieldErrors.confirmPass) && (
                      <FormHelperText>{fieldErrors.confirmPass || 'Mật khẩu xác nhận không khớp.'}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {form.password && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ px: 0.5, mt: -0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: 'var(--ev-text-muted, rgba(17,17,17,0.55))' }}>
                          ĐỘ BẢO MẬT
                        </Typography>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: strengthTone }}>
                          {strengthLabel.toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              height: 4,
                              borderRadius: 999,
                              bgcolor: i < strength.score ? strengthTone : 'rgba(17,17,17,0.10)',
                              transition: 'background 160ms ease',
                            }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ mt: 0.75, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {[
                          { ok: strength.hasMin, label: 'Ít nhất 8 ký tự' },
                          { ok: strength.hasUpper && strength.hasNumber, label: 'Chữ hoa & chữ số' },
                          { ok: strength.hasSpecial, label: 'Ký tự đặc biệt' },
                        ].map((r) => (
                          <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {r.ok ? (
                              <CheckCircleRounded sx={{ fontSize: 13, color: STATUS.successDark }} />
                            ) : (
                              <CircleOutlined sx={{ fontSize: 13, color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                            )}
                            <Typography sx={{ fontSize: 11, color: r.ok ? 'rgba(17,17,17,0.78)' : 'rgba(17,17,17,0.52)' }}>
                              {r.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Checkboxes */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          sx={{
                            py: 0.25,
                            pl: 0.5,
                            color: 'var(--ev-text-muted, rgba(17,17,17,0.35))',
                            '&.Mui-checked': { color: BRAND.main },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ mt: 0.2, fontSize: 11.5, color: 'rgba(17,17,17,0.65)' }}>
                          Tôi đồng ý với{' '}
                          <Link href="/auth/terms" style={{ color: BRAND.main, fontWeight: 800, textDecoration: 'none' }}>
                            <Box component="span" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                              Điều khoản dịch vụ
                            </Box>
                          </Link>{' '}
                          và{' '}
                          <Link href="/auth/privacy" style={{ color: BRAND.main, fontWeight: 800, textDecoration: 'none' }}>
                            <Box component="span" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                              Chính sách bảo mật
                            </Box>
                          </Link>
                          .
                        </Typography>
                      }
                      sx={{ alignItems: 'flex-start', m: 0 }}
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={agreeNews}
                          onChange={(e) => setAgreeNews(e.target.checked)}
                          sx={{
                            py: 0.25,
                            pl: 0.5,
                            color: 'var(--ev-text-muted, rgba(17,17,17,0.35))',
                            '&.Mui-checked': { color: 'primary.main' },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ mt: 0.2, fontSize: 11.5, color: 'rgba(17,17,17,0.65)' }}>
                          Đăng ký nhận thông báo về khóa học mới và ưu đãi đặc biệt qua email.
                        </Typography>
                      }
                      sx={{ alignItems: 'flex-start', m: 0 }}
                    />
                  </Box>
                </Grid>

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={sendingOtp}
                    sx={{
                      width: '100%',
                      height: 44,
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: 15,
                      textTransform: 'none',
                      background:
                        `linear-gradient(135deg, ${BRAND.main} 0%, #6b1414 100%)`,
                      boxShadow: '0 8px 20px rgba(139,19,19,0.15)',
                      transition: 'background 200ms ease, box-shadow 200ms ease',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #9b1c1c 0%, #5c1111 100%)',
                        boxShadow: '0 8px 20px rgba(139,19,19,0.25)',
                      },
                    }}
                  >
                    {sendingOtp ? <CircularProgress size={22} color="inherit" /> : 'Gửi mã xác minh về Email'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* BƯỚC 2: NHẬP MÃ OTP VÀ XÁC NHẬN ĐĂNG KÝ */}
          {step === 2 && (
            <Box component="form" onSubmit={handleConfirmRegister} sx={{ width: '100%' }}>
              <Stack spacing={3.5} sx={{ width: '100%', alignItems: 'center' }}>
                
                {/* Targeted Email Pill Badge */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2.25,
                    py: 1,
                    borderRadius: '999px',
                    bgcolor: 'rgba(139, 19, 19, 0.05)',
                    border: '1px solid rgba(139, 19, 19, 0.12)',
                  }}
                >
                  <EmailRounded sx={{ fontSize: 18, color: BRAND.main }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: BRAND.main }}>
                    {form.email}
                  </Typography>
                </Box>

                {/* 6 Digit OTP Inputs */}
                <Box sx={{ width: '100%', py: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: CSSVAR.textSecondary,
                      mb: 1.75,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      fontSize: 11,
                    }}
                  >
                    MÃ XÁC MINH 6 CHỮ SỐ
                  </Typography>
                  <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ width: '100%', justifyContent: 'center' }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const digit = otp[index] || '';
                      return (
                        <OutlinedInput
                          key={index}
                          id={`otp-box-${index}`}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (!val) {
                              const newOtp = otp.split('');
                              newOtp[index] = '';
                              setOtp(newOtp.join(''));
                              return;
                            }
                            const char = val.slice(-1);
                            const newOtp = otp.split('');
                            newOtp[index] = char;
                            const fullOtp = newOtp.join('');
                            setOtp(fullOtp);

                            // Tự động focus sang ô kế tiếp
                            if (index < 5) {
                              const nextEl = document.getElementById(`otp-box-${index + 1}`);
                              nextEl?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !digit && index > 0) {
                              const prevEl = document.getElementById(`otp-box-${index - 1}`);
                              prevEl?.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                            if (pasted) {
                              setOtp(pasted);
                              const targetIndex = Math.min(pasted.length, 5);
                              document.getElementById(`otp-box-${targetIndex}`)?.focus();
                            }
                          }}
                          inputProps={{
                            maxLength: 1,
                            style: {
                              textAlign: 'center',
                              fontSize: 22,
                              fontWeight: 800,
                              padding: 0,
                              fontFamily: 'monospace',
                              color: CSSVAR.textPrimary,
                            },
                          }}
                          sx={{
                            width: { xs: 42, sm: 54 },
                            height: { xs: 50, sm: 60 },
                            borderRadius: '16px',
                            bgcolor: digit ? 'rgba(139, 19, 19, 0.03)' : 'rgba(17,17,17,0.025)',
                            transition: 'all 200ms ease',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: digit ? 'rgba(139, 19, 19, 0.4)' : 'rgba(17, 17, 17, 0.1)',
                              borderWidth: digit ? '1.5px' : '1px',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(139, 19, 19, 0.3)',
                            },
                            '&.Mui-focused': {
                              bgcolor: '#ffffff',
                              boxShadow: '0 0 0 4px rgba(139, 19, 19, 0.12)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: BRAND.main,
                              borderWidth: '2px',
                            },
                          }}
                          autoFocus={index === 0}
                        />
                      );
                    })}
                  </Stack>
                </Box>

                {/* Primary Confirm Button */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || otp.length !== 6}
                  sx={{
                    width: '100%',
                    height: 48,
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: 15,
                    textTransform: 'none',
                    background:
                      `linear-gradient(135deg, ${BRAND.main} 0%, #6b1414 100%)`,
                    boxShadow: '0 10px 24px rgba(139,19,19,0.18)',
                    transition: 'all 200ms ease',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #9b1c1c 0%, #5c1111 100%)',
                      boxShadow: '0 12px 28px rgba(139,19,19,0.28)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(17,17,17,0.12)',
                      color: 'rgba(17,17,17,0.35)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Xác minh & Hoàn tất Đăng ký'}
                </Button>

                {/* Resend Cooldown Action */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Button
                    variant="text"
                    disabled={resendCooldown > 0 || sendingOtp}
                    onClick={handleResendOtp}
                    startIcon={sendingOtp ? <CircularProgress size={16} /> : <RefreshRounded />}
                    sx={{
                      color: resendCooldown > 0 ? 'text.disabled' : BRAND.main,
                      fontWeight: 700,
                      fontSize: 13.5,
                      textTransform: 'none',
                      borderRadius: '10px',
                      px: 2,
                    }}
                  >
                    {resendCooldown > 0
                      ? `Gửi lại mã OTP (${resendCooldown}s)`
                      : 'Chưa nhận được mã? Gửi lại ngay'}
                  </Button>
                </Stack>

                {/* Back to Step 1 */}
                <Button
                  variant="text"
                  onClick={() => setStep(1)}
                  startIcon={<ArrowBackRounded />}
                  sx={{
                    color: CSSVAR.textSecondary,
                    fontWeight: 600,
                    fontSize: 13.5,
                    textTransform: 'none',
                    '&:hover': {
                      color: BRAND.main,
                      bgcolor: 'rgba(139, 19, 19, 0.04)',
                    },
                  }}
                >
                  Quay lại chỉnh sửa thông tin
                </Button>
              </Stack>
            </Box>
          )}

          {/* Divider */}
          {step === 1 && (
            <>
              <Divider sx={{ width: '100%', opacity: 0.35, my: 0.5 }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: 'var(--ev-text-muted, rgba(17,17,17,0.45))' }}>
                  HOẶC TIẾP TỤC VỚI
                </Typography>
              </Divider>

              {/* Google signup */}
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 0.5 }}>
                <GoogleAuthButton text="signup_with" maxWidth={1000} borderRadius="12px" height={44} onError={setLocalError} onSize={setGoogleSize} />
              </Box>
            </>
          )}

          {/* Redirect to login */}
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: 13.5,
              color: 'rgba(17,17,17,0.60)',
              position: 'relative',
              zIndex: 999,
            }}
          >
            Đã có tài khoản?{' '}
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  fontWeight: 900,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline', color: 'primary.dark' },
                }}
              >
                Đăng nhập ngay
              </Box>
            </Link>
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
