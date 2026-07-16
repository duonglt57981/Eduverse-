'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ArrowBackRounded } from '@mui/icons-material';
import { createAppTheme } from '@/src/theme/createAppTheme';

export default function PrivacyPage() {
  const theme = useMemo(() => createAppTheme('light'), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          py: { xs: 4, sm: 6 },
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Back button */}
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: '#64748B',
                mb: 3,
                fontSize: 14.5,
                fontWeight: 600,
                transition: 'color 200ms ease',
                '&:hover': {
                  color: '#8B1313',
                },
              }}
            >
              <ArrowBackRounded fontSize="small" />
              Quay lại Đăng nhập
            </Box>
          </Link>

          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 12px 30px rgba(30, 41, 59, 0.04)',
              p: { xs: 3.5, sm: 5 },
              bgcolor: '#ffffff',
            }}
          >
            {/* Title Block */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#1E293B',
                  letterSpacing: '-1px',
                  mb: 1.5,
                  fontSize: { xs: 28, sm: 34 },
                }}
              >
                Chính sách Bảo mật
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13.5 }}>
                Cập nhật lần cuối: 15 tháng 7, 2026
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

            {/* Privacy Content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, color: '#334155' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  1. Thu thập Thông tin Cá nhân
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Khi bạn đăng ký tài khoản qua liên kết Google Auth, chúng tôi thu thập một số thông tin cơ bản được cấp quyền từ hồ sơ Google của bạn bao gồm: Họ tên, Địa chỉ Email và Ảnh đại diện (avatar). Các thông tin này giúp chúng tôi định danh và tạo lập môi trường học tập cho riêng bạn.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  2. Mục đích Sử dụng Thông tin
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Chúng tôi sử dụng thông tin của bạn vào các mục đích:
                  <br />
                  - Cung cấp và duy trì tài khoản người dùng trên EduVerse.
                  <br />
                  - Xác nhận trạng thái đăng ký, thanh toán và cung cấp chứng nhận học tập.
                  <br />
                  - Gửi thông báo về tiến độ học tập, bài học mới hoặc các cập nhật quan trọng từ hệ thống.
                  <br />
                  - Cải thiện chất lượng dịch vụ và tối ưu hóa trải nghiệm người dùng.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  3. Bảo mật Dữ liệu
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  EduVerse cam kết bảo mật tuyệt đối thông tin cá nhân của bạn. Chúng tôi sử dụng các công nghệ mã hóa truyền tải và lưu trữ dữ liệu an toàn để tránh việc truy cập, thay đổi hoặc tiết lộ thông tin trái phép. Chúng tôi không bao giờ bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì bất kỳ mục đích thương mại nào.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  4. Quyền của Người dùng
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ thông tin cá nhân của mình trên hệ thống bất cứ lúc nào. Bạn cũng có thể hủy liên kết tài khoản Google khỏi hệ thống EduVerse qua phần Cài đặt tài khoản.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  5. Cookie và Công nghệ Theo dõi
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Chúng tôi sử dụng cookie để lưu trữ phiên làm việc của bạn và duy trì cài đặt giao diện (như Chế độ sáng/tối). Bạn có thể cấu hình trình duyệt để từ chối nhận cookie, tuy nhiên một số tính năng của hệ thống có thể hoạt động không chính xác khi không có cookie.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

            {/* Footer contact */}
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật, vui lòng liên hệ ban quản trị tại{' '}
              <a href="mailto:admin.eduverse@gmail.com" style={{ color: '#8B1313', textDecoration: 'none', fontWeight: 600 }}>
                admin.eduverse@gmail.com
              </a>.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
