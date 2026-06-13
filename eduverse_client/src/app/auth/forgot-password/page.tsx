'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { forgotPassword, resetPassword, clearError, clearSuccess } from '../../../store/auth/AuthSlice';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  EmailRounded,
  ArrowBackRounded,
  VisibilityOffRounded,
  VisibilityRounded,
  CheckCircleOutlineRounded,
  KeyRounded
} from '@mui/icons-material';

const RequirementItem = ({ checked, label }: { checked: boolean; label: string }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
    <CheckCircleOutlineRounded
      sx={{
        fontSize: 16,
        color: checked ? '#0a5a3a' : 'rgba(17,17,17,0.25)',
        transition: 'color 160ms ease',
      }}
    />
    <Typography
      variant="caption"
      sx={{
        color: checked ? '#0a5a3a' : 'rgba(17,17,17,0.55)',
        fontWeight: checked ? 600 : 400,
        transition: 'color 160ms ease',
      }}
    >
      {label}
    </Typography>
  </Stack>
);

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((s) => s.auth);
  
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP & Mật khẩu mới
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');

  // Password requirements state
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;

  // Clear redux state when mounting/unmounting
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearSuccess());
    
    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      setOtpSentMessage(result.payload as string);
      setStep(2);
      dispatch(clearSuccess()); // Clear to allow step 2 success message later
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    
    dispatch(clearError());
    dispatch(clearSuccess());

    const result = await dispatch(resetPassword({ email, token: otp, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    }
  };

  const handleGoBack = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
    setStep(1);
    setOtp('');
    setNewPassword('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f9f8f6',
        px: 2,
        background: 'radial-gradient(circle at 50% 50%, #fefefe 0%, #f5f3f0 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 5,
          border: '1px solid rgba(17,17,17,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
          p: { xs: 3, sm: 4.5 },
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <IconButton
              component="a"
              href={step === 1 ? "/auth/login" : undefined}
              onClick={step === 2 ? handleGoBack : undefined}
              aria-label="Quay lại"
              size="small"
              sx={{
                border: '1px solid rgba(17,17,17,0.08)',
                bgcolor: 'rgba(17,17,17,0.01)',
                '&:hover': {
                  bgcolor: 'rgba(17,17,17,0.05)',
                }
              }}
            >
              <ArrowBackRounded fontSize="small" />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 850, letterSpacing: '-0.6px', color: '#111' }}>
              {step === 1 ? 'Quên mật khẩu' : 'Xác thực OTP'}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'rgba(17,17,17,0.6)', lineHeight: 1.5 }}>
            {step === 1 
              ? 'Nhập email đã đăng ký. Hệ thống sẽ gửi một mã OTP 6 số để xác nhận đặt lại mật khẩu.'
              : `Mã OTP đã được gửi đến email ${email}. Vui lòng kiểm tra và nhập mã để tiếp tục.`
            }
          </Typography>

          {/* Hiển thị lỗi từ backend nếu có */}
          {error ? (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(127,29,29,0.2)',
                bgcolor: 'rgba(127,29,29,0.05)',
                color: '#7f1d1d',
                px: 2.5,
                py: 1.5,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {error}
            </Box>
          ) : null}

          {/* Hiển thị thông báo gửi OTP thành công (cho bước 2) */}
          {step === 2 && otpSentMessage ? (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(10,90,58,0.2)',
                bgcolor: 'rgba(10,90,58,0.05)',
                color: '#0a5a3a',
                px: 2.5,
                py: 1.5,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {otpSentMessage}
            </Box>
          ) : null}

          {/* Hiển thị thông báo thành công chung */}
          {successMessage ? (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(10,90,58,0.2)',
                bgcolor: 'rgba(10,90,58,0.05)',
                color: '#0a5a3a',
                px: 2.5,
                py: 1.5,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {successMessage} — Đang chuyển hướng về Đăng nhập...
            </Box>
          ) : null}

          {step === 1 ? (
            <Box component="form" onSubmit={handleSendOtp}>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <Typography variant="caption" sx={{ mb: 1, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}>
                    Địa chỉ Email
                  </Typography>
                  <OutlinedInput
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    endAdornment={
                      <InputAdornment position="end">
                        <EmailRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'rgba(17,17,17,0.03)',
                      pr: 2,
                      py: 0.5,
                      transition: 'box-shadow 160ms ease, background 160ms ease',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.06)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.12)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(127,29,29,0.1)',
                        bgcolor: 'rgba(17,17,17,0.02)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(127,29,29,0.3)',
                      },
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    borderRadius: 3,
                    py: 1.75,
                    fontWeight: 800,
                    fontSize: 15,
                    textTransform: 'none',
                    background:
                      'linear-gradient(90deg, #8b1a1a 0%, #7f1d1d 55%, #6b1414 100%)',
                    boxShadow: '0 10px 25px rgba(127,29,29,0.2)',
                    '&:hover': {
                      background:
                        'linear-gradient(90deg, #7f1d1d 0%, #6b1414 60%, #5c1111 100%)',
                      boxShadow: '0 12px 28px rgba(127,29,29,0.25)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(17,17,17,0.08)',
                      color: 'rgba(17,17,17,0.35)',
                    }
                  }}
                >
                  {loading ? 'Đang gửi mã...' : 'Gửi mã OTP'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleResetPassword}>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <Typography variant="caption" sx={{ mb: 0.75, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}>
                    Mã xác thực OTP (6 chữ số)
                  </Typography>
                  <OutlinedInput
                    type="text"
                    placeholder="Nhập 6 số OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                    inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '8px', fontSize: '18px', fontWeight: 'bold' } }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyRounded sx={{ color: 'rgba(17,17,17,0.35)' }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'rgba(17,17,17,0.03)',
                      pr: 2,
                      py: 0.5,
                      transition: 'box-shadow 160ms ease, background 160ms ease',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.06)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.12)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(127,29,29,0.1)',
                        bgcolor: 'rgba(17,17,17,0.02)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(127,29,29,0.3)',
                      },
                    }}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <Typography variant="caption" sx={{ mb: 0.75, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}>
                    Mật khẩu mới
                  </Typography>
                  <OutlinedInput
                    type={showPass ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          edge="end"
                          onClick={() => setShowPass((v) => !v)}
                          size="small"
                        >
                          {showPass ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 3,
                      bgcolor: 'rgba(17,17,17,0.03)',
                      pr: 1.5,
                      py: 0.5,
                      transition: 'box-shadow 160ms ease, background 160ms ease',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.06)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17,17,17,0.12)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 4px rgba(127,29,29,0.1)',
                        bgcolor: 'rgba(17,17,17,0.02)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(127,29,29,0.3)',
                      },
                    }}
                  />
                </FormControl>

                {/* Password strength indicators */}
                <Stack spacing={1} sx={{ bgcolor: 'rgba(17,17,17,0.01)', p: 2, borderRadius: 3, border: '1px solid rgba(17,17,17,0.04)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(17,17,17,0.65)' }}>
                    Yêu cầu mật khẩu mới:
                  </Typography>
                  <RequirementItem checked={hasMinLength} label="Tối thiểu 8 ký tự" />
                  <RequirementItem checked={hasUppercase} label="Chứa ít nhất 1 chữ in hoa (A-Z)" />
                  <RequirementItem checked={hasLowercase} label="Chứa ít nhất 1 chữ thường (a-z)" />
                  <RequirementItem checked={hasDigit} label="Chứa ít nhất 1 chữ số (0-9)" />
                  <RequirementItem checked={hasSpecial} label="Chứa ít nhất 1 ký tự đặc biệt (@, #, $, ...)" />
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !isPasswordValid || otp.length < 6}
                  sx={{
                    borderRadius: 3,
                    py: 1.75,
                    fontWeight: 800,
                    fontSize: 15,
                    textTransform: 'none',
                    background:
                      'linear-gradient(90deg, #8b1a1a 0%, #7f1d1d 55%, #6b1414 100%)',
                    boxShadow: '0 10px 25px rgba(127,29,29,0.2)',
                    '&:hover': {
                      background:
                        'linear-gradient(90deg, #7f1d1d 0%, #6b1414 60%, #5c1111 100%)',
                      boxShadow: '0 12px 28px rgba(127,29,29,0.25)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(17,17,17,0.08)',
                      color: 'rgba(17,17,17,0.35)',
                    }
                  }}
                >
                  {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
                </Button>

                <Button
                  variant="text"
                  onClick={handleGoBack}
                  sx={{
                    textTransform: 'none',
                    color: '#7f1d1d',
                    fontWeight: 700,
                    fontSize: 13,
                    '&:hover': {
                      bgcolor: 'rgba(127,29,29,0.04)',
                    }
                  }}
                >
                  Gửi lại mã OTP / Thay đổi Email
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
