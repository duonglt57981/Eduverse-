'use client';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { register, clearError, clearSuccess, externalLogin } from '../../../store/auth/AuthSlice';
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
import { ThemeProvider, createTheme } from '@mui/material/styles';
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

function GoogleGlyph(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.8 2.9v2.4h3c1.8-1.7 2.8-4.2 2.8-7.2 0-.7-.1-1.3-.2-2H12Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.6 0 4.7-.8 6.3-2.2l-3-2.4c-.8.6-1.9 1-3.3 1-2.5 0-4.6-1.7-5.4-4h-3V17c1.6 3.2 4.9 5 8.4 5Z"
      />
      <path
        fill="currentColor"
        d="M6.6 14.4a6.3 6.3 0 0 1 0-4.8V7.1h-3A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l3.5-2Z"
      />
      <path
        fill="currentColor"
        d="M12 5.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9.4 9.4 0 0 0 12 2C8.5 2 5.2 3.9 3.6 7.1l3 2.5c.8-2.3 2.9-4 5.4-4Z"
      />
    </SvgIcon>
  );
}

function FacebookGlyph(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.2-1.6 1.6-1.6h1.6V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.5v3H10v8h3.5Z"
      />
    </SvgIcon>
  );
}

function GithubGlyph(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 2C6.5 2 2 6.6 2 12.3c0 4.6 2.9 8.4 6.9 9.8.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.6 0 0 .8-.3 2.7 1a9 9 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5 4-1.4 6.9-5.2 6.9-9.8C22 6.6 17.5 2 12 2Z"
      />
    </SvgIcon>
  );
}

function LinkedInGlyph(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M6.5 9H3.7v12h2.8V9ZM5.1 3.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM20.5 14.1c0-3.1-1.6-4.6-3.9-4.6-1.8 0-2.6 1-3.1 1.7V9H10.8v12h2.8v-6.7c0-1.8.3-3.5 2.5-3.5s2.2 2 2.2 3.6V21h2.8v-6.9Z"
      />
    </SvgIcon>
  );
}

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

  const handleExternalLogin = (provider: 'google' | 'facebook') => {
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    let url = `/auth/oauth-callback?provider=${provider}`;

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/oauth-callback?provider=${provider}`);
    const nonce = crypto.randomUUID();
    if (provider === 'google' && googleClientId) {
      url = `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${googleClientId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=id_token` +
        `&scope=openid%20profile%20email` +
        `&nonce=nonce_${nonce}` +
        `&state=state_${provider}`;
    } else if (provider === 'facebook' && facebookAppId) {
      url = `https://www.facebook.com/v18.0/dialog/oauth` +
        `?client_id=${facebookAppId}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=token` +
        `&scope=public_profile,email` +
        `&state=state_${provider}`;
    }

    const popup = window.open(
      url,
      `Đăng nhập ${provider === 'google' ? 'Google' : 'Facebook'}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (!popup) {
      setLocalError('Vui lòng bỏ chặn popup để tiếp tục đăng nhập.');
      return;
    }

    const messageListener = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        window.removeEventListener('message', messageListener);
        const payload = event.data.payload;

        const result = await dispatch(externalLogin(payload));
        if (externalLogin.fulfilled.match(result)) {
          const roles: string[] = result.payload.roles || [];
          if (roles.includes('Admin')) {
            router.push('/admin/dashboard');
          } else {
            router.push('/student/dashboard');
          }
        }
      }
    };

    window.addEventListener('message', messageListener);
  };

  const [form, setForm] = useState({
    hoTen: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNews, setAgreeNews] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear Redux messages khi mount trang để không hiện message cũ
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#7f1d1d' },
          background: { default: '#f9f8f6', paper: '#ffffff' },
          text: { primary: '#141414', secondary: '#6f6f6f' },
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily:
            '"Be Vietnam Pro","Roboto",system-ui,-apple-system,Segoe UI,Arial,sans-serif',
          h3: { fontWeight: 900, letterSpacing: '-0.8px' },
          h4: { fontWeight: 900, letterSpacing: '-0.6px' },
          button: { textTransform: 'none', fontWeight: 800 },
        },
      }),
    [],
  );

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

  const inputSx = {
    height: 50,
    borderRadius: 3,
    bgcolor: 'rgba(17,17,17,0.035)',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(17,17,17,0.08)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(17,17,17,0.16)',
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(17,17,17,0.03)',
      boxShadow: '0 0 0 4px rgba(127,29,29,0.14)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(127,29,29,0.38)',
    },
  } as const;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 1.5, sm: 2.5, md: 4 },
          py: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1240,
            height: { xs: 'auto', md: 'min(760px, 90vh)' },
            display: { xs: 'block', md: 'flex' },
            borderRadius: { xs: 4, md: 6 },
            overflow: 'hidden',
            boxShadow: '0 28px 80px rgba(52,32,32,0.16)',
            border: '1px solid rgba(17,17,17,0.06)',
            backgroundColor: '#fff',
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: { md: '46%' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              px: { md: 4 },
              py: { md: 3 },
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              background:
                'linear-gradient(160deg, #9b1c1c 0%, #7f1d1d 50%, #5c1111 100%)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -110,
                right: -110,
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -120,
                left: -120,
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: { xs: 220, md: 290 },
                  mb: 2.5,
                }}
              >
                <Image
                  src="/auth/img/logo_nedo.png"
                  alt="EduVerse"
                  width={290}
                  height={87}
                  priority
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontSize: { md: 36 },
                  lineHeight: 1.1,
                  maxWidth: 520,
                  color: '#ffffff',
                }}
              >
                Bắt đầu hành trình học tập cùng EduVerse
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  maxWidth: 520,
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 13.5,
                  lineHeight: 1.7,
                }}
              >
                Nền tảng giáo dục Ivy League kỹ thuật số, kết nối bạn với những kiến thức
                tinh hoa từ các chuyên gia hàng đầu thế giới.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.75,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: 'rgba(255,255,255,0.92)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  maxWidth: 420,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.18)',
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <SvgIcon sx={{ fontSize: 22, opacity: 0.9 }} viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2 9.2 7.6 3 8.3l4.7 4-1.4 6L12 15l5.7 3.3-1.4-6 4.7-4-6.2-.7L12 2Z"
                    />
                  </SvgIcon>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                    Thành tích xuất sắc
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.70)', fontSize: 12 }}>
                    Khóa học AI nâng cao
                  </Typography>
                </Box>
              </Paper>



              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  maxWidth: 420,
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 999,
                    bgcolor: 'rgba(0,0,0,0.20)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    display: 'grid',
                    placeItems: 'center',
                    position: 'relative',
                  }}
                >
                  <PersonRounded sx={{ fontSize: 22, color: 'rgba(255,255,255,0.85)' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 4,
                      bottom: 4,
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      bgcolor: '#22c55e',
                      boxShadow: '0 0 0 3px rgba(0,0,0,0.22)',
                    }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ color: 'rgba(244, 244, 244, 0.89)', fontWeight: 800, fontSize: 13 }}>
                    Học viên tiêu biểu
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.70)', fontSize: 12 }}>
                    Đã hoàn thành 15 khóa học
                  </Typography>
                </Box>
              </Paper>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                borderTop: '1px solid rgba(255,255,255,0.12)',
                pt: 1.5,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {[
                { num: '10K+', label: 'Học viên' },
                { num: '500+', label: 'Khóa học' },
                { num: '120+', label: 'Giảng viên' },
              ].map((s) => (
                <Box key={s.label}>
                  <Typography sx={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.3px', color: '#ffffff' }}>
                    {s.num}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)' }}>
                    {s.label.toUpperCase()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              width: '100%',
              height: { md: '100%' },
              overflowY: { md: 'auto' },
              px: { xs: 2.5, sm: 4, md: 5 },
              py: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'background.default',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 440, my: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <MuiLink
                  component={Link}
                  href="/"
                  underline="none"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'rgba(17,17,17,0.65)',
                    '&:hover': { color: '#7f1d1d' },
                  }}
                >
                  <ArrowBackRounded sx={{ fontSize: 18 }} />
                  Quay lại trang chủ
                </MuiLink>
              </Box>

              <Typography variant="h4" sx={{ fontSize: { xs: 26, sm: 30 }, mb: 0.75, color: 'text.primary' }}>
                Đăng ký tài khoản
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
                Chào mừng bạn! Hãy điền thông tin để bắt đầu.
              </Typography>

              {error ? (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    px: 2,
                    py: 1.25,
                    borderRadius: 2.5,
                    border: '1px solid #f5bcbc',
                    background: '#fff0f0',
                    color: '#b42318',
                    fontSize: 13,
                  }}
                >
                  {error}
                </Paper>
              ) : null}

              {localError ? (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    px: 2,
                    py: 1.25,
                    borderRadius: 2.5,
                    border: '1px solid #f5bcbc',
                    background: '#fff0f0',
                    color: '#b42318',
                    fontSize: 13,
                  }}
                >
                  {localError}
                </Paper>
              ) : null}

              {successMessage ? (
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    px: 2,
                    py: 1.25,
                    borderRadius: 2.5,
                    border: '1px solid rgba(10,90,58,0.25)',
                    background: 'rgba(10,90,58,0.06)',
                    color: '#0a5a3a',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {successMessage}
                </Paper>
              ) : null}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 0.5 }}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={!!fieldErrors.hoTen}>
                      <OutlinedInput
                        placeholder="Họ và tên"
                        value={form.hoTen}
                        onChange={(e) => { setForm({ ...form, hoTen: e.target.value }); setFieldErrors((p) => ({ ...p, hoTen: '' })); }}
                        startAdornment={
                          <InputAdornment position="start">
                            <PersonRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                          </InputAdornment>
                        }
                        sx={inputSx}
                      />
                      {fieldErrors.hoTen && <FormHelperText>{fieldErrors.hoTen}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={!!fieldErrors.userName}>
                      <OutlinedInput
                        placeholder="Tên đăng nhập"
                        value={form.userName}
                        onChange={(e) => { setForm({ ...form, userName: e.target.value }); setFieldErrors((p) => ({ ...p, userName: '' })); }}
                        type="text"
                        startAdornment={
                          <InputAdornment position="start">
                            <BadgeRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
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
                            <EmailRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                          </InputAdornment>
                        }
                        sx={inputSx}
                      />
                      {fieldErrors.email && <FormHelperText>{fieldErrors.email}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={!!fieldErrors.phoneNumber}>
                      <OutlinedInput
                        placeholder="Số điện thoại"
                        value={form.phoneNumber}
                        onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); setFieldErrors((p) => ({ ...p, phoneNumber: '' })); }}
                        type="tel"
                        startAdornment={
                          <InputAdornment position="start">
                            <PhoneIphoneRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                          </InputAdornment>
                        }
                        sx={inputSx}
                      />
                      {fieldErrors.phoneNumber && <FormHelperText>{fieldErrors.phoneNumber}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={!!fieldErrors.password}>
                      <OutlinedInput
                        placeholder="Mật khẩu"
                        value={form.password}
                        onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors((p) => ({ ...p, password: '' })); }}
                        type={showPass ? 'text' : 'password'}
                        startAdornment={
                          <InputAdornment position="start">
                            <LockRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                          </InputAdornment>
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                              edge="end"
                              onClick={() => setShowPass((v) => !v)}
                              size="small"
                              sx={{ color: 'rgba(17,17,17,0.55)' }}
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

                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={confirmMismatch || !!fieldErrors.confirmPass}>
                      <OutlinedInput
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPass}
                        onChange={(e) => { setConfirmPass(e.target.value); setFieldErrors((p) => ({ ...p, confirmPass: '' })); }}
                        type={showPass ? 'text' : 'password'}
                        sx={inputSx}
                      />
                      {(confirmMismatch || fieldErrors.confirmPass) && (
                        <FormHelperText>{fieldErrors.confirmPass || 'Mật khẩu xác nhận không khớp.'}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {form.password ? (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ px: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: 'rgba(17,17,17,0.55)' }}>
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
                                <CircleOutlined sx={{ fontSize: 13, color: 'rgba(17,17,17,0.35)' }} />
                              )}
                              <Typography sx={{ fontSize: 11, color: r.ok ? 'rgba(17,17,17,0.78)' : 'rgba(17,17,17,0.52)' }}>
                                {r.label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  ) : null}

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            sx={{
                              py: 0.25,
                              pl: 0.5,
                              color: 'rgba(17,17,17,0.35)',
                              '&.Mui-checked': { color: '#7f1d1d' },
                            }}
                          />
                        }
                        label={
                          <Typography sx={{ mt: 0.2, fontSize: 11.5, color: 'rgba(17,17,17,0.65)' }}>
                            Tôi đồng ý với{' '}
                            <MuiLink component={Link} href="/terms" underline="hover" sx={{ color: '#7f1d1d', fontWeight: 800 }}>
                              Điều khoản dịch vụ
                            </MuiLink>{' '}
                            và{' '}
                            <MuiLink component={Link} href="/privacy" underline="hover" sx={{ color: '#7f1d1d', fontWeight: 800 }}>
                              Chính sách bảo mật
                            </MuiLink>
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
                              color: 'rgba(17,17,17,0.35)',
                              '&.Mui-checked': { color: '#7f1d1d' },
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

                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        width: '100%',
                        borderRadius: 999,
                        py: 1.25,
                        background:
                          'linear-gradient(90deg, #8b1a1a 0%, #7f1d1d 55%, #6b1414 100%)',
                        boxShadow: '0 10px 24px rgba(127,29,29,0.2)',
                        '&:hover': {
                          background:
                            'linear-gradient(90deg, #7f1d1d 0%, #6b1414 60%, #5c1111 100%)',
                        },
                      }}
                    >
                      {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản →'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 1.5, opacity: 0.35 }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: 'rgba(17,17,17,0.45)' }}>
                  HOẶC TIẾP TỤC VỚI
                </Typography>
              </Divider>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {[
                  { key: 'google', icon: <GoogleGlyph /> },
                  { key: 'facebook', icon: <FacebookGlyph /> },
                  { key: 'github', icon: <GithubGlyph /> },
                  { key: 'linkedin', icon: <LinkedInGlyph /> },
                ].map((b) => (
                  <Button
                    key={b.key}
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      if (b.key === 'google' || b.key === 'facebook') {
                        handleExternalLogin(b.key);
                      } else {
                        setLocalError('Chức năng liên kết tài khoản này chưa được tích hợp.');
                      }
                    }}
                    sx={{
                      height: 38,
                      borderRadius: 2.5,
                      borderColor: 'rgba(17,17,17,0.10)',
                      color: 'rgba(17,17,17,0.75)',
                      '&:hover': {
                        borderColor: 'rgba(127,29,29,0.35)',
                        backgroundColor: 'rgba(127,29,29,0.04)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'grid', placeItems: 'center' }}>
                      {b.icon}
                    </Box>
                  </Button>
                ))}
              </Box>

              <Typography sx={{ mt: 1.75, textAlign: 'center', fontSize: 12.5, color: 'rgba(17,17,17,0.60)' }}>
                Đã có tài khoản?{' '}
                <MuiLink
                  component={Link}
                  href="/auth/login"
                  underline="none"
                  sx={{ color: '#7f1d1d', fontWeight: 900, '&:hover': { color: '#5c1111' } }}
                >
                  Đăng nhập ngay
                </MuiLink>
              </Typography>

              <Box
                sx={{
                  mt: 2.25,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  color: 'rgba(17,17,17,0.45)',
                }}
              >



              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
