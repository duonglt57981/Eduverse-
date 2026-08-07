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

const termsList = [
  {
    title: '1. Chấp nhận các Điều khoản Dịch vụ',
    content:
      'Khi truy cập, đăng ký hoặc sử dụng dịch vụ trên nền tảng EduVerse, người dùng xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản và điều kiện này cũng như tất cả các quy định pháp luật hiện hành. Trường hợp người dùng không đồng ý với bất kỳ nội dung nào, vui lòng không tiếp tục truy cập hoặc sử dụng dịch vụ.',
  },
  {
    title: '2. Quyền Sở hữu Trí tuệ & Bản quyền Nội dung',
    content:
      'Tất cả các tài liệu bài giảng, video khóa học, bài kiểm tra, tài nguyên tải về, mã nguồn và giao diện thiết kế trên hệ thống EduVerse đều thuộc bản quyền hợp pháp của EduVerse hoặc các giảng viên đối tác được cấp phép.',
    bullets: [
      'Nghiêm cấm mọi hành vi sao chép, ghi hình màn hình, tải xuống trái phép hoặc phát tán nội dung khóa học dưới bất kỳ hình thức nào.',
      'Tài khoản người dùng được cấp quyền truy cập cá nhân và không được phép chia sẻ hoặc bán lại quyền sử dụng cho bên thứ ba.',
    ],
  },
  {
    title: '3. Quy định Tài khoản & Bảo mật',
    content:
      'Người dùng có trách nhiệm bảo mật thông tin đăng nhập tài khoản của mình. Mọi thao tác và giao dịch phát sinh từ tài khoản đăng nhập sẽ do chủ tài khoản chịu trách nhiệm trước pháp luật và EduVerse.',
    bullets: [
      'EduVerse có quyền tạm khóa hoặc chấm dứt vĩnh viễn quyền truy cập tài khoản nếu phát hiện hành vi truy cập bất thường hoặc vi phạm chính sách.',
    ],
  },
  {
    title: '4. Chính sách Học phí, Giao dịch & Rút tiền',
    content:
      'EduVerse cung cấp các chương trình đào tạo có phí và miễn phí. Đối với các khóa học có phí, người dùng đồng ý hoàn tất thanh toán theo các cổng giao dịch trực tuyến được tích hợp hợp lệ trên nền tảng.',
    bullets: [
      'Đối với Giảng viên: Số dư doanh thu từ bán khóa học sẽ được đối soát công khai và chỉ được rút về tài khoản ngân hàng chính chủ.',
      'Đối với Học viên: Quyền truy cập vào khóa học sẽ có hiệu lực ngay khi giao dịch thanh toán thành công.',
    ],
  },
  {
    title: '5. Tiêu chuẩn Cộng đồng & Quy tắc Sử dụng',
    content:
      'Người dùng cam kết duy trì môi trường học tập lành mạnh, tôn trọng giảng viên và các học viên khác trong toàn bộ hệ thống.',
    bullets: [
      'Không đăng tải các thông tin sai sự thật, xúc phạm danh dự nhân phẩm người khác hoặc phát tán nội dung vi phạm pháp luật.',
      'Không can thiệp vào mã nguồn, tấn công hệ thống máy chủ hoặc thực hiện các hành vi gây ảnh hưởng tới sự vận hành bình thường của EduVerse.',
    ],
  },
  {
    title: '6. Điều chỉnh & Cập nhật Chính sách',
    content:
      'EduVerse có quyền bổ sung, sửa đổi nội dung Điều khoản Dịch vụ này bất kỳ lúc nào để đáp ứng yêu cầu vận hành và quy định pháp luật. Bản cập nhật mới nhất sẽ có hiệu lực ngay sau khi được công bố công khai trên hệ thống.',
  },
];

export default function TermsPage() {
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
                Điều khoản Dịch vụ
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'var(--ev-text-muted, #6B7280)',
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              >
                Quy định điều khoản sử dụng hệ thống đào tạo trực tuyến EduVerse
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(17, 17, 17, 0.08)' }} />

            {/* Terms Content List */}
            <Stack spacing={3.5}>
              {termsList.map((item, index) => (
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
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
