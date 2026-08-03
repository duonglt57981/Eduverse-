'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { register, clearError, clearSuccess } from '../../../store/auth/AuthSlice';
import GoogleAuthButton from '../../../components/auth/GoogleAuthButton';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  OutlinedInput,
  Paper,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '@/src/theme/createAppTheme';
import {
  ArrowBackRounded,
  BadgeRounded,
  CheckCircleRounded,
  CircleOutlined,
  EmailRounded,
  LockRounded,
  PersonRounded,
  PhoneIphoneRounded,
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


  const [form, setForm] = useState({
    hoTen: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNews, setAgreeNews] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [googleSize, setGoogleSize] = useState({ width: 0, height: 40 });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear Redux messages khi mount trang để không hiện message cũ
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  const theme = useMemo(() => createAppTheme('light'), []);

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh'][strength.score] || '';
  const strengthTone =
    ['rgba(17,17,17,0.14)', '#b42318', '#b54708', '#0a5a3a'][strength.score] ||
    '#b42318';

  const confirmMismatch =
    confirmPass.length > 0 && form.password.length > 0 && confirmPass !== form.password;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Họ tên: tối thiểu 2 ký tự
    if (!form.hoTen.trim()) {
      errors.hoTen = 'Vui lòng nhập họ và tên.';
    } else if (form.hoTen.trim().length < 2) {
      errors.hoTen = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    // Username: không dấu, không khoảng trắng, chỉ chữ cái không dấu + số + ._-
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

    // Email: bắt buộc, đúng format
    if (!form.email.trim()) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Email không đúng định dạng.';
    }

    // Số điện thoại: bắt buộc, 10 chữ số, bắt đầu bằng 0
    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại.';
    } else if (!/^0[0-9]{9}$/.test(form.phoneNumber.trim())) {
      errors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.';
    }

    // Mật khẩu: ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
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

    // Xác nhận mật khẩu
    if (!confirmPass) {
      errors.confirmPass = 'Vui lòng xác nhận mật khẩu.';
    } else if (confirmPass !== form.password) {
      errors.confirmPass = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearError());
    dispatch(clearSuccess());

    if (!validateForm()) return;

    if (!agreeTerms) {
      setLocalError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      router.push('/auth/login');
    }
  };

  const activeError = localError || error;

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
          background: 'linear-gradient(135deg, #F7F5F2 0%, #FFF1F1 50%, #F7F5F2 100%)',
          px: 2.5,
          py: 6,
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
                color: 'var(--ev-text-secondary, #4B5563)',
                fontWeight: 600,
                fontSize: 14.5,
                transition: 'color 200ms ease',
                cursor: 'pointer',
                '&:hover': {
                  color: '#8B1313',
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
            maxWidth: 680,
            borderRadius: '24px',
            border: '1px solid rgba(139, 19, 19, 0.06)',
            boxShadow: '0 24px 70px rgba(139, 19, 19, 0.04), 0 10px 30px rgba(0, 0, 0, 0.02)',
            backgroundColor: 'var(--ev-paper, #ffffff)',
            p: { xs: 4, sm: 5.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3.5,
            my: 'auto',
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
                  background: 'linear-gradient(135deg, #1F2937 30%, #8B1313 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Đăng ký tài khoản
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--ev-text-secondary, #4B5563)', fontSize: 15, lineHeight: 1.6 }}
              >
                Chào mừng bạn! Hãy điền thông tin để bắt đầu hành trình học tập.
              </Typography>
            </Box>
          </Box>

          {/* Alert Error */}
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
                color: '#8B1313',
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {activeError}
            </Paper>
          )}

          {successMessage && (
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                px: 3,
                py: 2,
                borderRadius: '14px',
                border: '1px solid rgba(10,90,58,0.25)',
                background: 'rgba(10,90,58,0.06)',
                color: '#0a5a3a',
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {successMessage}
            </Paper>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
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
                <FormControl fullWidth error={!!fieldErrors.phoneNumber}>
                  <OutlinedInput
                    placeholder="Số điện thoại"
                    value={form.phoneNumber}
                    onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); setFieldErrors((p) => ({ ...p, phoneNumber: '' })); }}
                    type="tel"
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneIphoneRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                  {fieldErrors.phoneNumber && <FormHelperText>{fieldErrors.phoneNumber}</FormHelperText>}
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
                            <CheckCircleRounded sx={{ fontSize: 13, color: '#0a5a3a' }} />
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
                          '&.Mui-checked': { color: '#8B1313' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ mt: 0.2, fontSize: 11.5, color: 'rgba(17,17,17,0.65)' }}>
                        Tôi đồng ý với{' '}
                        <a href="/auth/terms" style={{ color: '#8B1313', fontWeight: 800, textDecoration: 'none' }}>
                          <Box component="span" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                            Điều khoản dịch vụ
                          </Box>
                        </a>{' '}
                        và{' '}
                        <a href="/auth/privacy" style={{ color: '#8B1313', fontWeight: 800, textDecoration: 'none' }}>
                          <Box component="span" sx={{ '&:hover': { textDecoration: 'underline' } }}>
                            Chính sách bảo mật
                          </Box>
                        </a>
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
                          '&.Mui-checked': { color: '#8B1313' },
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
                  disabled={loading}
                  sx={{
                    width: '100%',
                    height: 44,
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: 15,
                    textTransform: 'none',
                    background:
                      'linear-gradient(135deg, #8B1313 0%, #6b1414 100%)',
                    boxShadow: '0 8px 20px rgba(139,19,19,0.15)',
                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #9b1c1c 0%, #5c1111 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 28px rgba(139,19,19,0.25)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Divider */}
          <Divider sx={{ width: '100%', opacity: 0.35, my: 0.5 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: 'var(--ev-text-muted, rgba(17,17,17,0.45))' }}>
              HOẶC TIẾP TỤC VỚI
            </Typography>
          </Divider>

          {/* Google signup */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 0.5 }}>
            <GoogleAuthButton text="signup_with" maxWidth={1000} borderRadius="12px" height={44} onError={setLocalError} onSize={setGoogleSize} />
          </Box>

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
            <a href="/auth/login" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{
                  color: '#8B1313',
                  fontWeight: 900,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline', color: '#5c1111' },
                }}
              >
                Đăng nhập ngay
              </Box>
            </a>
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
