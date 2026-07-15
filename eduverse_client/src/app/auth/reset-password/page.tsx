'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Stack, Typography, CircularProgress } from '@mui/material';

/**
 * Luồng đặt lại mật khẩu qua liên kết (userId + token trên URL) đã được thay thế
 * bằng luồng OTP an toàn hơn tại /auth/forgot-password:
 *   Nhập email  ->  Xác minh mã OTP  ->  Đặt mật khẩu mới (bằng reset token ngắn hạn).
 * Trang này giữ lại route cũ và tự động chuyển hướng người dùng sang luồng mới.
 */
export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/auth/forgot-password'), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F7F5F2',
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
          textAlign: 'center',
        }}
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#8B1313' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Đang chuyển hướng...
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(17,17,17,0.65)', lineHeight: 1.6 }}>
            Tính năng đặt lại mật khẩu nay sử dụng mã OTP gửi qua email. Bạn sẽ được chuyển đến
            trang <strong>Quên mật khẩu</strong> trong giây lát.
          </Typography>
          <Typography
            component="a"
            href="/auth/forgot-password"
            sx={{
              color: '#8B1313',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Nhấn vào đây nếu trình duyệt không tự chuyển
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
