'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { login } from '../../../store/auth/AuthSlice';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  OutlinedInput,
  Paper,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { useThemeSettings } from '../../../contexts/ThemeSettingsContext';

function ArrowRightIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M13.2 5.2a1 1 0 0 1 1.4 0l6.1 6.1a1 1 0 0 1 0 1.4l-6.1 6.1a1 1 0 1 1-1.4-1.4l4.4-4.4H4a1 1 0 1 1 0-2h13.6l-4.4-4.4a1 1 0 0 1 0-1.4Z"
      />
    </SvgIcon>
  );
}

function MailIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm0 3.2-7.3 4.6a1.3 1.3 0 0 1-1.4 0L4 9.2V8l8 5 8-5v1.2Z"
      />
    </SvgIcon>
  );
}

function EyeIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M12 5c6 0 10 7 10 7s-4 7-10 7S2 12 2 12s4-7 10-7Zm0 2c-3.3 0-6.1 3.1-7.6 5 1.5 1.9 4.3 5 7.6 5s6.1-3.1 7.6-5c-1.5-1.9-4.3-5-7.6-5Zm0 2.2A2.8 2.8 0 1 1 9.2 12 2.8 2.8 0 0 1 12 9.2Zm0 1.8a1 1 0 1 0 1 1 1 1 0 0 0-1-1Z"
      />
    </SvgIcon>
  );
}

function EyeOffIcon(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="m4.7 3.3 16 16a1 1 0 1 1-1.4 1.4l-2.2-2.2A10.9 10.9 0 0 1 12 19C6 19 2 12 2 12a19.5 19.5 0 0 1 4.3-5.2L3.3 4.7a1 1 0 0 1 1.4-1.4Zm3.1 5.9A17.1 17.1 0 0 0 4.4 12c1.5 1.9 4.3 5 7.6 5 1.2 0 2.3-.4 3.3-.9l-1.7-1.7a2.9 2.9 0 0 1-1.6.4A2.8 2.8 0 0 1 9.2 12c0-.6.2-1.1.4-1.6L7.8 9.2Zm4.4-2.1c6 .1 9.8 6.9 9.8 6.9a18.6 18.6 0 0 1-3.4 4.2l-2.1-2.1a2.8 2.8 0 0 0-3.8-3.8L10 9.4a2.8 2.8 0 0 1 4.7-1.4l1.5 1.5a9.7 9.7 0 0 0-4-1.4Z"
      />
    </SvgIcon>
  );
}

function GoogleGlyph(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 48 48">
      <path
        fill="currentColor"
        d="M24 21.7v4.6h6.5c-.9 3.9-4.3 5.7-6.5 5.7-3.9 0-7.3-3.2-7.3-8s3.3-8 7.3-8c2.2 0 3.8.9 4.7 1.7l3.2-3.1C30 12.7 27.3 11.5 24 11.5c-6.9 0-12.5 5.6-12.5 12.5S17.1 36.5 24 36.5c7.3 0 12.1-5.1 12.1-12.3 0-.8-.1-1.5-.2-2.2H24Z"
      />
    </SvgIcon>
  );
}

function FacebookGlyph(props: React.ComponentProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.7-1.6H17V4.2c-.3 0-1.4-.2-2.7-.2-2.7 0-4.5 1.6-4.5 4.7v1.9H7v3.2h2.9V22h3.6Z"
      />
    </SvgIcon>
  );
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const router   = useRouter();
  const { loading, error } = useSelector((s) => s.auth);
  const { currentAccent } = useThemeSettings();

  const [form, setForm] = useState({ userName: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: currentAccent.value, dark: currentAccent.hoverColor },
          text: { primary: '#141414', secondary: '#6f6f6f' },
          background: { default: '#f9f8f6', paper: '#ffffff' },
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily:
            '"Be Vietnam Pro","Roboto",system-ui,-apple-system,Segoe UI,Arial,sans-serif',
          h3: { fontWeight: 800, letterSpacing: '-0.6px' },
          h4: { fontWeight: 800, letterSpacing: '-0.6px' },
          button: { textTransform: 'none', fontWeight: 700 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                paddingTop: 12,
                paddingBottom: 12,
              },
            },
          },
        },
      }),
    [currentAccent],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) router.push('/dashboard');
  };

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
          bgcolor: '#f9f8f6',
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
            width: { xs: '100%', md: '46%' },
            color: '#fff',
            px: { xs: 2.5, sm: 4, md: 5 },
            py: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(160deg, ${currentAccent.value}cc 0%, ${currentAccent.value} 50%, ${currentAccent.hoverColor} 100%)`,
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
          }}
          >
          <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: { xs: 210, sm: 250, md: 290 },
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

            <Box sx={{ maxWidth: 520 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: 32, sm: 40, md: 44 },
                  lineHeight: 1.15,
                }}
              >
                Chào mừng bạn trở lại
                <br />
                với tri thức đỉnh cao.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 440,
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                Hành trình chinh phục sự nghiệp của bạn bắt đầu từ việc không
                ngừng học hỏi tại môi trường chuẩn quốc tế.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: { xs: 2, md: 3 },
                borderRadius: 4,
                overflow: 'hidden',
                height: { xs: 190, sm: 220, md: 240 },
                bgcolor: 'rgba(0,0,0,0.22)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 22px 50px rgba(0,0,0,0.28)',
                position: 'relative',
              }}
            >
              <Image
                src="/auth/img/Illustration Section.png"
                alt="EduVerse learning space"
                fill
                priority
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 46vw"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  transform: 'scale(1.18)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(20,8,8,0.04) 0%, rgba(78,0,0,0.12) 62%, rgba(120,0,0,0.24) 100%)',
                }}
              />
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              mt: { xs: 3, md: 4 },
              position: 'relative',
              zIndex: 1,
            }}
          >
            {[
              { label: 'Mentor chất lượng', icon: 'M12 2 9.3 7.6 3 8.3l4.7 4-1.4 6 5.7-3.3 5.7 3.3-1.4-6 4.7-4-6.3-.7L12 2Z' },
              { label: 'Nội dung thực chiến', icon: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2.5 4h7v2h-7V8Zm0 4h7v2h-7v-2Z' },
              { label: 'Chứng nhận uy tín', icon: 'M12 2a6 6 0 0 0-3 11.2V22l3-1.7 3 1.7v-8.8A6 6 0 0 0 12 2Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z' },
            ].map((f) => (
              <Paper
                key={f.label}
                elevation={0}
                sx={{
                  flex: 1,
                  px: 1.5,
                  py: 1.75,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.88)',
                }}
              >
                <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
                  <SvgIcon sx={{ fontSize: 22, opacity: 0.85 }} viewBox="0 0 24 24">
                    <path fill="currentColor" d={f.icon} />
                  </SvgIcon>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: 'center',
                      letterSpacing: '-0.1px',
                    }}
                  >
                    {f.label}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              px: { xs: 2.5, sm: 4, md: 5 },
              py: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#f9f8f6',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 440, my: 'auto' }}>
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: 28, sm: 32 }, mb: 0.75 }}
            >
              Đăng nhập
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 3 }}>
              Truy cập vào tài khoản EduVerse của bạn
            </Typography>

            {error && (
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
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75 }}>
                    Email hoặc tên đăng nhập
                  </Typography>
                  <FormControl fullWidth>
                    <OutlinedInput
                      placeholder="name@company.com"
                      value={form.userName}
                      onChange={(e) =>
                        setForm({ ...form, userName: e.target.value })
                      }
                      autoComplete="username"
                      inputProps={{ inputMode: 'email' }}
                      endAdornment={
                        <InputAdornment position="end">
                          <MailIcon sx={{ fontSize: 18, color: '#8a8a8a' }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 999,
                        bgcolor: 'rgba(17,17,17,0.04)',
                        pr: 1.25,
                        transition: 'box-shadow 160ms ease, background 160ms ease',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(17,17,17,0.06)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(17,17,17,0.14)',
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 4px ${alpha(currentAccent.value, 0.14)}`,
                          bgcolor: 'rgba(17,17,17,0.03)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(currentAccent.value, 0.38),
                        },
                      }}
                    />
                  </FormControl>
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    sx={{
                      mb: 0.75,
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      Mật khẩu
                    </Typography>
                    <MuiLink
                      href="/auth/forgot-password"
                      underline="none"
                      sx={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'primary.main',
                        '&:hover': { color: 'primary.dark' },
                      }}
                    >
                      Quên mật khẩu?
                    </MuiLink>
                  </Stack>
                  <FormControl fullWidth>
                    <OutlinedInput
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      autoComplete={remember ? 'current-password' : 'off'}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            onClick={() => setShowPass((v) => !v)}
                            edge="end"
                            size="small"
                            sx={{ color: '#7a7a7a' }}
                          >
                            {showPass ? (
                              <EyeOffIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <EyeIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 999,
                        bgcolor: 'rgba(17,17,17,0.04)',
                        transition: 'box-shadow 160ms ease, background 160ms ease',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(17,17,17,0.06)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(17,17,17,0.14)',
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 4px ${alpha(currentAccent.value, 0.14)}`,
                          bgcolor: 'rgba(17,17,17,0.03)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(currentAccent.value, 0.38),
                        },
                      }}
                    />
                  </FormControl>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      sx={{
                        color: 'rgba(17,17,17,0.35)',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: 13, color: '#525252' }}>
                      Ghi nhớ đăng nhập
                    </Typography>
                  }
                  sx={{ mt: -0.75 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={<ArrowRightIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    mt: 0.5,
                    width: '100%',
                    background: `linear-gradient(90deg, ${currentAccent.value}d0 0%, ${currentAccent.value} 55%, ${currentAccent.hoverColor} 100%)`,
                    boxShadow: `0 14px 34px ${alpha(currentAccent.value, 0.26)}`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${currentAccent.value} 0%, ${currentAccent.hoverColor} 60%, ${currentAccent.hoverColor} 100%)`,
                      boxShadow: `0 16px 42px ${alpha(currentAccent.value, 0.32)}`,
                    },
                    '&.Mui-disabled': {
                      background: alpha(currentAccent.value, 0.35),
                      color: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Stack>
            </Box>

            <Divider
              sx={{
                my: 3,
                color: '#9a9a9a',
                '&::before, &::after': { borderColor: 'rgba(17,17,17,0.10)' },
                fontSize: 12.5,
              }}
            >
              Hoặc tiếp tục với
            </Divider>

            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleGlyph sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: 999,
                  borderColor: 'rgba(17,17,17,0.14)',
                  color: '#2a2a2a',
                  bgcolor: '#fff',
                  '&:hover': {
                    borderColor: 'rgba(17,17,17,0.22)',
                    bgcolor: 'rgba(255,255,255,0.92)',
                  },
                }}
              >
                Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookGlyph sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: 999,
                  borderColor: 'rgba(17,17,17,0.14)',
                  color: '#2a2a2a',
                  bgcolor: '#fff',
                  '&:hover': {
                    borderColor: 'rgba(17,17,17,0.22)',
                    bgcolor: 'rgba(255,255,255,0.92)',
                  },
                }}
              >
                Facebook
              </Button>
            </Stack>

            <Typography
              sx={{
                mt: 3,
                textAlign: 'center',
                fontSize: 13.5,
                color: '#6b6b6b',
              }}
            >
              Chưa có tài khoản?{' '}
              <MuiLink
                href="/auth/register"
                underline="none"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                  '&:hover': { color: 'primary.dark' },
                }}
              >
                Đăng ký ngay
              </MuiLink>
            </Typography>
          </Box>

            <Typography
              sx={{
                mt: 4,
                fontSize: 12,
                color: '#9b9b9b',
                textAlign: 'center',
              }}
            >
             
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
