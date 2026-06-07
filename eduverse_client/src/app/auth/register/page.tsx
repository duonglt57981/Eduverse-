'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { register } from '../../../store/auth/AuthSlice';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
  CheckCircleRounded,
  CircleOutlined,
  EmailRounded,
  LockRounded,
  PersonRounded,
  PhoneIphoneRounded,
  ShieldRounded,
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

  const [form, setForm] = useState({
    hoTen: '',
    userName: '',
    phoneNumber: '',
    password: '',
  });
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNews, setAgreeNews] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    if (!agreeTerms) {
      setLocalError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }
    if (confirmMismatch) {
      setLocalError('Mật khẩu xác nhận không khớp.');
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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 1.5, sm: 2.5, md: 4 },
          py: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1240,
            minHeight: { xs: 'auto', md: 760 },
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
            px: { md: 5 },
            py: { md: 4 },
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
                mb: 4,
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
                fontSize: 44,
                lineHeight: 1.08,
                maxWidth: 520,
              }}
            >
              Bắt đầu hành trình học tập cùng EduVerse
            </Typography>
            <Typography
              sx={{
                mt: 2.25,
                maxWidth: 520,
                color: 'rgba(255,255,255,0.72)',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              Nền tảng giáo dục Ivy League kỹ thuật số, kết nối bạn với những kiến thức
              tinh hoa từ các chuyên gia hàng đầu thế giới.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                mt: 3.5,
                p: 2.25,
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
                mt: 3,
                p: 2,
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
              gap: 2,
              borderTop: '1px solid rgba(255,255,255,0.12)',
              pt: 2.5,
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
                <Typography sx={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.3px' }}>
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

            <Typography variant="h4" sx={{ fontSize: { xs: 26, sm: 30 }, mb: 0.75 }}>
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

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Stack spacing={1.75}>
                <FormControl fullWidth>
                  <OutlinedInput
                    placeholder="Họ và tên"
                    value={form.hoTen}
                    onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                    required
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <OutlinedInput
                    placeholder="Email hoặc tên đăng nhập"
                    value={form.userName}
                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                    required
                    type="text"
                    inputProps={{ inputMode: 'email' }}
                    startAdornment={
                      <InputAdornment position="start">
                        <EmailRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <OutlinedInput
                    placeholder="Số điện thoại"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                    type="tel"
                    startAdornment={
                      <InputAdornment position="start">
                        <PhoneIphoneRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <OutlinedInput
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
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
                </FormControl>

                {form.password ? (
                  <Box
                    sx={{
                      mt: -0.5,
                      px: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: 'rgba(17,17,17,0.55)' }}>
                        ĐỘ BẢO MẬT
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: strengthTone }}>
                        {strengthLabel.toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                      {[0, 1, 2].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            height: 6,
                            borderRadius: 999,
                            bgcolor: i < strength.score ? strengthTone : 'rgba(17,17,17,0.10)',
                            transition: 'background 160ms ease',
                          }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ mt: 1.25, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.75 }}>
                      {[
                        { ok: strength.hasMin, label: 'Ít nhất 8 ký tự' },
                        { ok: strength.hasUpper && strength.hasNumber, label: 'Chữ hoa & chữ số' },
                        { ok: strength.hasSpecial, label: 'Ký tự đặc biệt' },
                      ].map((r) => (
                        <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {r.ok ? (
                            <CheckCircleRounded sx={{ fontSize: 16, color: '#0a5a3a' }} />
                          ) : (
                            <CircleOutlined sx={{ fontSize: 16, color: 'rgba(17,17,17,0.35)' }} />
                          )}
                          <Typography sx={{ fontSize: 12.5, color: r.ok ? 'rgba(17,17,17,0.78)' : 'rgba(17,17,17,0.52)' }}>
                            {r.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : null}

                <FormControl fullWidth error={confirmMismatch}>
                  <OutlinedInput
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                    type={showPass ? 'text' : 'password'}
                    sx={inputSx}
                  />
                  {confirmMismatch ? (
                    <FormHelperText>Mật khẩu xác nhận không khớp.</FormHelperText>
                  ) : null}
                </FormControl>

                <Box sx={{ mt: 0.25 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        sx={{
                          color: 'rgba(17,17,17,0.35)',
                          '&.Mui-checked': { color: '#7f1d1d' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 12.75, color: 'rgba(17,17,17,0.65)' }}>
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
                          color: 'rgba(17,17,17,0.35)',
                          '&.Mui-checked': { color: '#7f1d1d' },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 12.75, color: 'rgba(17,17,17,0.65)' }}>
                        Đăng ký nhận thông báo về khóa học mới và ưu đãi đặc biệt qua email.
                      </Typography>
                    }
                    sx={{ alignItems: 'flex-start', m: 0, mt: 0.5 }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 0.5,
                    borderRadius: 999,
                    py: 1.55,
                    background:
                      'linear-gradient(90deg, #8b1a1a 0%, #7f1d1d 55%, #6b1414 100%)',
                    boxShadow: '0 14px 34px rgba(127,29,29,0.26)',
                    '&:hover': {
                      background:
                        'linear-gradient(90deg, #7f1d1d 0%, #6b1414 60%, #5c1111 100%)',
                    },
                  }}
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản →'}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3, opacity: 0.35 }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: 'rgba(17,17,17,0.45)' }}>
                HOẶC TIẾP TỤC VỚI
              </Typography>
            </Divider>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25 }}>
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
                  onClick={() => setLocalError('Social login chưa được tích hợp.')}
                  sx={{
                    height: 44,
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

            <Typography sx={{ mt: 2.5, textAlign: 'center', fontSize: 13, color: 'rgba(17,17,17,0.60)' }}>
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
