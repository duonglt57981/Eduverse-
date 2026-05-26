'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from '../../../store/hook';
import { forgotPassword } from '../../../store/auth/AuthSlice';
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
import { EmailRounded, ArrowBackRounded } from '@mui/icons-material';

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(forgotPassword(email));
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
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 4,
          border: '1px solid rgba(17,17,17,0.10)',
          p: { xs: 3, sm: 4 },
          bgcolor: '#fff',
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
                border: '1px solid rgba(17,17,17,0.10)',
                bgcolor: 'rgba(17,17,17,0.02)',
              }}
            >
              <ArrowBackRounded fontSize="small" />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.4px' }}>
              Quên mật khẩu
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ color: 'rgba(17,17,17,0.65)' }}>
            Nhập email để nhận link đặt lại mật khẩu.
          </Typography>

          {error ? (
            <Box
              sx={{
                borderRadius: 2.5,
                border: '1px solid rgba(127,29,29,0.25)',
                bgcolor: 'rgba(127,29,29,0.06)',
                color: '#7f1d1d',
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
              {successMessage}
            </Box>
          ) : null}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <OutlinedInput
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  endAdornment={
                    <InputAdornment position="end">
                      <EmailRounded sx={{ color: 'rgba(17,17,17,0.45)' }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 999,
                    bgcolor: 'rgba(17,17,17,0.04)',
                    pr: 1.25,
                    transition: 'box-shadow 160ms ease, background 160ms ease',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(17,17,17,0.08)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(17,17,17,0.14)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 4px rgba(127,29,29,0.14)',
                      bgcolor: 'rgba(17,17,17,0.03)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(127,29,29,0.38)',
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
                  background:
                    'linear-gradient(90deg, #8b1a1a 0%, #7f1d1d 55%, #6b1414 100%)',
                  boxShadow: '0 14px 34px rgba(127,29,29,0.26)',
                  '&:hover': {
                    background:
                      'linear-gradient(90deg, #7f1d1d 0%, #6b1414 60%, #5c1111 100%)',
                  },
                }}
              >
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
