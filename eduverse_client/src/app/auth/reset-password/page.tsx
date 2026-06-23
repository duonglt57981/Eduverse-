'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '../../../store/hook';
import { resetPassword } from '../../../store/auth/AuthSlice';
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
import { useTheme, alpha } from '@mui/material/styles';
import { ArrowBackRounded, VisibilityOffRounded, VisibilityRounded } from '@mui/icons-material';

function ResetPasswordContent() {
  const dispatch    = useDispatch();
  const router      = useRouter();
  const params      = useSearchParams();
  const { loading, error, successMessage } = useSelector((s) => s.auth);
  const theme       = useTheme();

  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = params.get('userId') || '';
    const token  = params.get('token') || '';
    const result = await dispatch(resetPassword({ userId, token, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => router.push('/auth/login'), 2000);
    }
  };

  const primaryColor = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          p: { xs: 3, sm: 4 },
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton
              component="a"
              href="/auth/login"
              aria-label="Quay lại đăng nhập"
              size="small"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.action.hover,
              }}
            >
              <ArrowBackRounded fontSize="small" />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.4px', color: 'text.primary' }}>
              Đặt lại mật khẩu
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Nhập mật khẩu mới của bạn.
          </Typography>

          {error ? (
            <Box
              sx={{
                borderRadius: 2.5,
                border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                bgcolor: alpha(theme.palette.error.main, 0.06),
                color: 'error.main',
                px: 2,
                py: 1.25,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {error}
            </Box>
          ) : null}

          {successMessage ? (
            <Box
              sx={{
                borderRadius: 2.5,
                border: '1px solid rgba(10,90,58,0.25)',
                bgcolor: 'rgba(10,90,58,0.06)',
                color: '#0a5a3a',
                px: 2,
                py: 1.25,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {successMessage} — Đang chuyển hướng...
            </Box>
          ) : null}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <OutlinedInput
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  inputProps={{ minLength: 6 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        edge="end"
                        onClick={() => setShowPass((v) => !v)}
                      >
                        {showPass ? <VisibilityOffRounded /> : <VisibilityRounded />}
                      </IconButton>
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 999,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(17,17,17,0.04)',
                    pr: 0.5,
                    transition: 'box-shadow 160ms ease, background 160ms ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(17,17,17,0.14)',
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 4px ${alpha(primaryColor, 0.14)}`,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(17,17,17,0.03)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(primaryColor, 0.38),
                    },
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 999,
                  py: 1.5,
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${primaryColor}e0 0%, ${primaryColor} 55%, ${primaryDark} 100%)`,
                  boxShadow: `0 14px 34px ${alpha(primaryColor, 0.26)}`,
                  '&:hover': {
                    background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryDark} 60%, ${primaryDark} 100%)`,
                  },
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
