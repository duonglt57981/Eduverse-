'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
  clearError,
  clearSuccess,
} from '../../../store/auth/AuthSlice';
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
  KeyRounded,
  LockResetRounded,
} from '@mui/icons-material';

const MAROON = '#8B1313';
const GREEN = '#0a5a3a';

// Style dùng chung cho các ô nhập liệu
const inputSx = {
  borderRadius: 3,
  bgcolor: 'rgba(17,17,17,0.03)',
  pr: 2,
  py: 0.5,
  transition: 'box-shadow 160ms ease, background 160ms ease',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--ev-divider, rgba(17,17,17,0.06))',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(17,17,17,0.12)',
  },
  '&.Mui-focused': {
    boxShadow: '0 0 0 4px rgba(139,19,19,0.1)',
    bgcolor: 'rgba(17,17,17,0.02)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(139,19,19,0.3)',
  },
} as const;

// Style dùng chung cho nút hành động chính
const primaryButtonSx = {
  borderRadius: 3,
  py: 1.75,
  fontWeight: 800,
  fontSize: 15,
  textTransform: 'none',
  background: 'linear-gradient(90deg, #8B1313 0%, #8B1313 55%, #6b1414 100%)',
  boxShadow: '0 10px 25px rgba(139,19,19,0.2)',
  '&:hover': {
    background: 'linear-gradient(90deg, #8B1313 0%, #6b1414 60%, #5c1111 100%)',
    boxShadow: '0 12px 28px rgba(139,19,19,0.25)',
  },
  '&.Mui-disabled': {
    background: 'rgba(17,17,17,0.08)',
    color: 'var(--ev-text-muted, rgba(17,17,17,0.35))',
  },
} as const;

const RequirementItem = ({ checked, label }: { checked: boolean; label: string }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
    <CheckCircleOutlineRounded
      sx={{
        fontSize: 16,
        color: checked ? GREEN : 'rgba(17,17,17,0.25)',
        transition: 'color 160ms ease',
      }}
    />
    <Typography
      variant="caption"
      sx={{
        color: checked ? GREEN : 'rgba(17,17,17,0.55)',
        fontWeight: checked ? 600 : 400,
        transition: 'color 160ms ease',
      }}
    >
      {label}
    </Typography>
  </Stack>
);

// Chỉ báo tiến trình 3 bước
const StepIndicator = ({ current }: { current: number }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
    {[1, 2, 3].map((s) => (
      <Box
        key={s}
        sx={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          bgcolor: s <= current ? MAROON : 'rgba(17,17,17,0.1)',
          transition: 'background 240ms ease',
        }}
      />
    ))}
  </Stack>
);

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((s) => s.auth);

  // 1: Nhập email | 2: Xác minh OTP | 3: Đặt mật khẩu mới
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Điều kiện mật khẩu
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  // Xóa trạng thái redux khi mount/unmount
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // Đồng hồ đếm ngược để gửi lại OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Bước 1 -> gửi OTP tới email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearSuccess());

    const result = await dispatch(forgotPassword(email.trim()));
    if (forgotPassword.fulfilled.match(result)) {
      // Cố tình KHÔNG hiển thị nội dung phản hồi từ backend ra màn hình,
      // để mã OTP không bao giờ lộ trên giao diện. OTP chỉ được gửi qua email.
      setStep(2);
      setResendCountdown(60);
      dispatch(clearSuccess());
    }
  };

  // Gửi lại OTP (khi đã hết đếm ngược)
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) return;
    dispatch(clearError());
    dispatch(clearSuccess());
    setOtp('');

    const result = await dispatch(forgotPassword(email.trim()));
    if (forgotPassword.fulfilled.match(result)) {
      setResendCountdown(60);
      dispatch(clearSuccess());
    }
  };

  // Bước 2 -> xác minh OTP, nhận reset token
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    dispatch(clearError());
    dispatch(clearSuccess());

    const result = await dispatch(verifyOtp({ email: email.trim(), otp }));
    if (verifyOtp.fulfilled.match(result)) {
      setResetToken((result.payload as string) || '');
      setStep(3);
    }
  };

  // Bước 3 -> đặt mật khẩu mới bằng reset token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !passwordsMatch || !resetToken) return;
    dispatch(clearError());
    dispatch(clearSuccess());

    const result = await dispatch(
      resetPassword({ email: email.trim(), resetToken, newPassword }),
    );
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    }
  };

  // Nút quay lại theo từng bước
  const handleBack = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
    if (step === 3) {
      // Quay lại bước OTP: cần xác minh lại (mã cũ đã dùng)
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setStep(2);
    } else if (step === 2) {
      setOtp('');
      setResendCountdown(0);
      setStep(1);
    }
  };

  const titleByStep = step === 1 ? 'Quên mật khẩu' : step === 2 ? 'Xác minh OTP' : 'Đặt lại mật khẩu';
  const subtitleByStep =
    step === 1
      ? 'Nhập email đã đăng ký. Hệ thống sẽ gửi một mã OTP gồm 6 chữ số để xác nhận đặt lại mật khẩu.'
      : step === 2
        ? `Chúng tôi đã gửi mã OTP đến ${email}. Vui lòng nhập mã gồm 6 chữ số để tiếp tục.`
        : 'Xác minh thành công. Hãy tạo mật khẩu mới cho tài khoản của bạn.';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--ev-bg, #F7F5F2)',
        px: 2,
        py: 4,
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
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IconButton
                component="a"
                href={step === 1 ? '/auth/login' : undefined}
                onClick={step === 1 ? undefined : handleBack}
                aria-label="Quay lại"
                size="small"
                sx={{
                  border: '1px solid rgba(17,17,17,0.08)',
                  bgcolor: 'rgba(17,17,17,0.01)',
                  '&:hover': {
                    bgcolor: 'rgba(17,17,17,0.05)',
                  },
                }}
              >
                <ArrowBackRounded fontSize="small" />
              </IconButton>
              <Typography
                variant="h5"
                sx={{ fontWeight: 850, letterSpacing: '-0.6px', color: '#111' }}
              >
                {titleByStep}
              </Typography>
            </Stack>

            <StepIndicator current={step} />
          </Stack>

          <Typography variant="body2" sx={{ color: 'rgba(17,17,17,0.6)', lineHeight: 1.5 }}>
            {subtitleByStep}
          </Typography>

          {/* Lỗi từ backend */}
          {error ? (
            <Box
              role="alert"
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(139,19,19,0.2)',
                bgcolor: 'rgba(139,19,19,0.05)',
                color: MAROON,
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

          {/* Nhắc kiểm tra email — CỐ ĐỊNH, không lấy nội dung từ backend nên
              mã OTP không bao giờ bị hiển thị ra màn hình. */}
          {step === 2 && !error ? (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(10,90,58,0.2)',
                bgcolor: 'rgba(10,90,58,0.05)',
                color: GREEN,
                px: 2.5,
                py: 1.5,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              Mã OTP đã được gửi tới email của bạn. Nếu chưa thấy, vui lòng kiểm tra mục Spam/Quảng cáo.
              Mã có hiệu lực trong 5 phút.
            </Box>
          ) : null}

          {/* Thông báo đặt lại thành công */}
          {successMessage && step === 3 ? (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid rgba(10,90,58,0.2)',
                bgcolor: 'rgba(10,90,58,0.05)',
                color: GREEN,
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

          {/* ============ BƯỚC 1: NHẬP EMAIL ============ */}
          {step === 1 ? (
            <Box component="form" onSubmit={handleSendOtp}>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}
                  >
                    Địa chỉ Email
                  </Typography>
                  <OutlinedInput
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputProps={{ 'aria-label': 'Địa chỉ email' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <EmailRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                </FormControl>

                <Button type="submit" variant="contained" disabled={loading} sx={primaryButtonSx}>
                  {loading ? 'Đang gửi mã...' : 'Gửi mã OTP'}
                </Button>
              </Stack>
            </Box>
          ) : null}

          {/* ============ BƯỚC 2: XÁC MINH OTP ============ */}
          {step === 2 ? (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <Typography
                    variant="caption"
                    sx={{ mb: 0.75, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}
                  >
                    Mã xác minh OTP (6 chữ số)
                  </Typography>
                  <OutlinedInput
                    type="text"
                    placeholder="Nhập 6 số OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))
                    }
                    required
                    autoFocus
                    inputProps={{
                      inputMode: 'numeric',
                      autoComplete: 'one-time-code',
                      maxLength: 6,
                      'aria-label': 'Mã xác minh OTP gồm 6 chữ số',
                      style: {
                        textAlign: 'center',
                        letterSpacing: '8px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                      },
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyRounded sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' }} />
                      </InputAdornment>
                    }
                    sx={inputSx}
                  />
                </FormControl>

                {/* Gửi lại OTP + đồng hồ đếm ngược */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'var(--ev-text-muted, rgba(17,17,17,0.55))' }}>
                    Không nhận được mã?
                  </Typography>
                  <Button
                    variant="text"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || loading}
                    sx={{
                      textTransform: 'none',
                      color: MAROON,
                      fontWeight: 700,
                      fontSize: 13,
                      minWidth: 0,
                      '&:hover': { bgcolor: 'rgba(139,19,19,0.04)' },
                      '&.Mui-disabled': { color: 'var(--ev-text-muted, rgba(17,17,17,0.35))' },
                    }}
                  >
                    {resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại mã OTP'}
                  </Button>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || otp.length < 6}
                  sx={primaryButtonSx}
                >
                  {loading ? 'Đang xác minh...' : 'Xác minh OTP'}
                </Button>
              </Stack>
            </Box>
          ) : null}

          {/* ============ BƯỚC 3: ĐẶT MẬT KHẨU MỚI ============ */}
          {step === 3 ? (
            <Box component="form" onSubmit={handleResetPassword}>
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <Typography
                    variant="caption"
                    sx={{ mb: 0.75, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}
                  >
                    Mật khẩu mới
                  </Typography>
                  <OutlinedInput
                    type={showPass ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    inputProps={{ 'aria-label': 'Mật khẩu mới' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          edge="end"
                          onClick={() => setShowPass((v) => !v)}
                          size="small"
                        >
                          {showPass ? (
                            <VisibilityOffRounded fontSize="small" />
                          ) : (
                            <VisibilityRounded fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{ ...inputSx, pr: 1.5 }}
                  />
                </FormControl>

                <FormControl fullWidth>
                  <Typography
                    variant="caption"
                    sx={{ mb: 0.75, fontWeight: 700, color: 'rgba(17,17,17,0.7)' }}
                  >
                    Xác nhận mật khẩu mới
                  </Typography>
                  <OutlinedInput
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    error={confirmPassword.length > 0 && !passwordsMatch}
                    inputProps={{ 'aria-label': 'Xác nhận mật khẩu mới' }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          edge="end"
                          onClick={() => setShowConfirm((v) => !v)}
                          size="small"
                        >
                          {showConfirm ? (
                            <VisibilityOffRounded fontSize="small" />
                          ) : (
                            <VisibilityRounded fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{ ...inputSx, pr: 1.5 }}
                  />
                  {confirmPassword.length > 0 && !passwordsMatch ? (
                    <Typography variant="caption" sx={{ mt: 0.75, color: MAROON, fontWeight: 600 }}>
                      Mật khẩu xác nhận không khớp.
                    </Typography>
                  ) : null}
                </FormControl>

                {/* Điều kiện mật khẩu */}
                <Stack
                  spacing={1}
                  sx={{
                    bgcolor: 'rgba(17,17,17,0.01)',
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid rgba(17,17,17,0.04)',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(17,17,17,0.65)' }}>
                    Yêu cầu mật khẩu mới:
                  </Typography>
                  <RequirementItem checked={hasMinLength} label="Tối thiểu 8 ký tự" />
                  <RequirementItem checked={hasUppercase} label="Chứa ít nhất 1 chữ in hoa (A-Z)" />
                  <RequirementItem checked={hasLowercase} label="Chứa ít nhất 1 chữ thường (a-z)" />
                  <RequirementItem checked={hasDigit} label="Chứa ít nhất 1 chữ số (0-9)" />
                  <RequirementItem
                    checked={hasSpecial}
                    label="Chứa ít nhất 1 ký tự đặc biệt (@, #, $, ...)"
                  />
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                  startIcon={<LockResetRounded />}
                  sx={primaryButtonSx}
                >
                  {loading ? 'Đang thực hiện...' : 'Đặt lại mật khẩu'}
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
