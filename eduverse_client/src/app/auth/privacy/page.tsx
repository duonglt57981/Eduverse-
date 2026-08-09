'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ArrowBackRounded } from '@mui/icons-material';
import { createAppTheme } from '@/src/theme/createAppTheme';
import { LAYOUT_SPACING } from '@/src/theme/tokens';

const privacySections = [
  {
    title: '1. Phạm vi Thu thập Thông tin Cá nhân',
    content:
      'Để cung cấp dịch vụ đào tạo trực tuyến hiệu quả và cá nhân hóa trải nghiệm học tập, EduVerse thu thập các loại dữ liệu sau khi bạn tương tác với hệ thống:',
    bullets: [
      'Thông tin định danh tài khoản: Họ và tên, địa chỉ Email, số điện thoại, mật khẩu (đã mã hóa băm) và ảnh đại diện (avatar).',
      'Thông tin đăng nhập OAuth: Khi bạn sử dụng phương thức đăng nhập qua Google, chúng tôi tiếp nhận các thông tin cơ bản được cấp quyền gồm Google ID, Họ tên, Email và Ảnh hồ sơ.',
      'Dữ liệu tiến trình học tập: Lịch sử đăng ký khóa học, tiến độ hoàn thành bài giảng, kết quả bài kiểm tra (Quiz/Assessment), danh sách khóa học yêu thích và thông tin chứng chỉ đã được cấp.',
      'Dữ liệu giao dịch & Tài chính: Lịch sử thanh toán mua khóa học (qua VNPay/Ngân hàng) và thông tin tài khoản ngân hàng chính chủ của Giảng viên phục vụ quy trình rút tiền doanh thu.',
    ],
  },
  {
    title: '2. Mục đích Sử dụng Thông tin',
    content:
      'EduVerse cam kết sử dụng dữ liệu thu thập được strictly cho các mục đích vận hành và nâng cao chất lượng đào tạo chính đáng:',
    bullets: [
      'Xác thực tài khoản, xử lý gửi mã OTP qua Email/SMS và đảm bảo an toàn truy cập.',
      'Cung cấp trải nghiệm học tập: Phát video bài học, ghi nhận tiến độ, chấm điểm tự động và cấp chứng nhận hoàn thành khóa học.',
      'Quản lý giao dịch: Xử lý thanh toán đơn hàng khóa học và thực hiện đối soát, chi trả doanh thu cho Giảng viên.',
      'Tương tác & Hỗ trợ: Gửi thông báo nhắc nhở tiến độ học tập, phản hồi thắc mắc Q&A và hỗ trợ sự cố kỹ thuật.',
      'Bảo vệ an toàn hạ tầng: Phát hiện, ngăn chặn các hành vi gian lận, truy cập trái phép hoặc vi phạm bản quyền bài giảng.',
    ],
  },
  {
    title: '3. Cam kết Bảo mật & Không chia sẻ Dữ liệu',
    content:
      'EduVerse đặt sự an toàn dữ liệu cá nhân của người dùng lên hàng đầu với các tiêu chuẩn bảo mật nghiêm ngặt:',
    bullets: [
      'Mã hóa truyền tải: Mọi dữ liệu trao đổi giữa thiết bị người dùng và máy chủ EduVerse đều được mã hóa bằng chuẩn SSL/TLS (HTTPS).',
      'Mã hóa lưu trữ: Mật khẩu người dùng được băm một chiều an toàn; dữ liệu nhạy cảm được bảo vệ bằng các lớp tường lửa và phân quyền truy cập nghiêm ngặt.',
      'Cam kết không thương mại hóa: EduVerse tuyệt đối KHÔNG bán, cho thuê, trao đổi hoặc chia sẻ thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.',
    ],
  },
  {
    title: '4. Công nghệ Cookie & Lưu trữ Phiên làm việc',
    content:
      'EduVerse sử dụng Cookie và Token xác thực ngắn hạn (JWT) để tối ưu hóa trải nghiệm người dùng:',
    bullets: [
      'Duy trì trạng thái đăng nhập an toàn mà không yêu cầu nhập lại mật khẩu nhiều lần.',
      'Lưu trữ các cài đặt tùy chỉnh giao diện cá nhân (như Chế độ sáng/tối Dark Mode, giao diện bảng điều khiển).',
      'Bạn có thể cấu hình trình duyệt từ chối tiếp nhận Cookie, tuy nhiên điều này có thể làm giảm trải nghiệm tự động của một số tính năng trên hệ thống.',
    ],
  },
  {
    title: '5. Quyền Kiểm soát Dữ liệu của Người dùng',
    content:
      'Người dùng EduVerse có đầy đủ các quyền kiểm soát đối với thông tin cá nhân của mình:',
    bullets: [
      'Quyền xem & Cập nhật: Bạn có thể tự do chỉnh sửa họ tên, ảnh đại diện, số điện thoại và mật khẩu trong trang Hồ sơ cá nhân.',
      'Quyền quản lý phương thức xác minh: Thêm hoặc thay đổi số điện thoại nhận mã xác thực OTP.',
      'Quyền yêu cầu xóa dữ liệu: Người dùng có quyền gửi yêu cầu đóng tài khoản và xóa dữ liệu cá nhân khỏi hệ thống theo quy định.',
    ],
  },
  {
    title: '6. Cập nhật Chính sách & Thông tin Liên hệ',
    content:
      'Chính sách Bảo mật này có thể được điều chỉnh để phù hợp với sự phát triển của nền tảng EduVerse và quy định pháp luật hiện hành. Mọi thay đổi sẽ được niêm yết công khai trên website.',
  },
];

export default function PrivacyPage() {
  const theme = useMemo(() => createAppTheme('light'), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'var(--ev-bg, #F7F5F2)',
          py: LAYOUT_SPACING.pagePy,
          px: LAYOUT_SPACING.pagePx,
        }}
      >
        <Box sx={{ maxWidth: LAYOUT_SPACING.containerMaxWidth, mx: 'auto' }}>
          {/* Back button */}
          <Box sx={{ mb: 3 }}>
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'var(--ev-text-secondary, #4B5563)',
                  fontSize: 14,
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
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              border: '1px solid rgba(17, 17, 17, 0.08)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.03)',
              p: { xs: 3.5, sm: 6 },
              bgcolor: 'var(--ev-paper, #ffffff)',
            }}
          >
            {/* Logo & Document Title */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ width: 210, mb: 3 }}>
                <Link href="/">
                  <Image
                    src="/auth/img/logo_nentrang.png"
                    alt="EduVerse Logo"
                    width={210}
                    height={55}
                    priority
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </Link>
              </Box>



              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,
                  color: 'var(--ev-text-primary, #1F2937)',
                  fontSize: { xs: 26, sm: 32 },
                  letterSpacing: '-0.6px',
                  mb: 1,
                }}
              >
                Chính sách Bảo mật Thông tin
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'var(--ev-text-muted, #6B7280)',
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              >
                Cam kết bảo vệ dữ liệu cá nhân, thông tin học tập và quyền riêng tư của toàn bộ người dùng EduVerse
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(17, 17, 17, 0.08)' }} />

            {/* Privacy Content List */}
            <Stack spacing={3.5}>
              {privacySections.map((item, index) => (
                <Box key={index}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: 'var(--ev-text-primary, #1F2937)',
                      fontSize: 17,
                      mb: 1,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 14.5,
                      lineHeight: 1.75,
                      color: 'var(--ev-text-secondary, #374151)',
                    }}
                  >
                    {item.content}
                  </Typography>

                  {item.bullets && (
                    <Box component="ul" sx={{ pl: 2.5, mt: 1.25, mb: 0 }}>
                      {item.bullets.map((bullet, bIdx) => (
                        <Typography
                          key={bIdx}
                          component="li"
                          variant="body2"
                          sx={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: 'var(--ev-text-secondary, #4B5563)',
                            mb: 0.75,
                          }}
                        >
                          {bullet}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 4, borderColor: 'rgba(17, 17, 17, 0.08)' }} />

            {/* Contact Footer */}
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--ev-text-muted, #8A7676)', fontSize: 13 }}>
              Nếu bạn có bất kỳ thắc mắc nào về Chính sách Bảo mật, vui lòng liên hệ Ban Quản trị EduVerse tại{' '}
              <a href="mailto:admin.eduverse10@gmail.com" style={{ color: '#8B1313', textDecoration: 'none', fontWeight: 700 }}>
                admin.eduverse10@gmail.com
              </a>.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
