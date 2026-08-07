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

const instructorTermsList = [
  {
    title: '1. Quyền Sở hữu Trí tuệ & Bản quyền Bài giảng',
    content:
      'Giảng viên sở hữu toàn bộ quyền sở hữu trí tuệ đối với các bài giảng, tài liệu học tập và video khóa học do mình tự biên soạn và tải lên hệ thống EduVerse.',
    bullets: [
      'Giảng viên cấp cho EduVerse quyền không độc quyền (non-exclusive) để lưu trữ, tiếp thị, quảng bá và phân phối khóa học tới học viên.',
      'Giảng viên cam kết nội dung tải lên là chính chủ, không sao chép trái phép hoặc xâm phạm bản quyền của bất kỳ bên thứ ba nào.',
    ],
  },
  {
    title: '2. Quy định Phân chia Doanh thu & Rút tiền',
    content:
      'Doanh thu phát sinh từ bán khóa học sẽ được ghi nhận và phân chia minh bạch trên bảng điều khiển tài chính của Giảng viên.',
    bullets: [
      'Rút tiền: Giảng viên thực hiện yêu cầu rút tiền trực tiếp về tài khoản ngân hàng chính chủ đã xác minh.',
      'Nghĩa vụ Thuế: Giảng viên tự chịu trách nhiệm thực hiện nghĩa vụ thuế thu nhập cá nhân theo quy định của pháp luật hiện hành.',
    ],
  },
  {
    title: '3. Tiêu chuẩn Chất lượng & Tương tác Học viên',
    content:
      'Bài giảng tải lên phải đảm bảo chất lượng hình ảnh, âm thanh rõ ràng, nội dung chính xác và không chứa thông tin phản cảm hay vi phạm tiêu chuẩn cộng đồng.',
    bullets: [
      'Giảng viên có trách nhiệm phản hồi và giải đáp các câu hỏi Q&A của học viên trong thời gian hợp lý (khuyên dùng trong 48 giờ làm việc).',
      'Nghiêm cấm hành vi chèn liên kết lừa đảo hoặc lôi kéo học viên giao dịch ngoài hệ thống EduVerse.',
    ],
  },
  {
    title: '4. Quy trình Duyệt & Kiểm duyệt Khóa học',
    content:
      'Tất cả khóa học mới tạo hoặc cập nhật nội dung lớn sẽ qua quy trình kiểm duyệt bởi Ban Quản trị EduVerse trước khi phát hành công khai.',
    bullets: [
      'EduVerse bảo lưu quyền tạm ẩn hoặc hủy phát hành khóa học nếu có phản ánh chính xác về vi phạm bản quyền hoặc nội dung giả mạo.',
    ],
  },
  {
    title: '5. Bảo mật Thông tin & Điều khoản Chung',
    content:
      'Thông tin cá nhân, tài khoản ngân hàng và hồ sơ giảng dạy của Giảng viên được EduVerse bảo mật nghiêm ngặt theo quy định bảo mật.',
  },
];

export default function InstructorTermsPage() {
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
            <Link href="/student/dashboard" style={{ textDecoration: 'none' }}>
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
                Quay lại EduVerse
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
                Điều khoản Hợp tác Giảng viên
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'var(--ev-text-muted, #6B7280)',
                  fontSize: 13.5,
                  fontWeight: 500,
                }}
              >
                Quy định về quyền lợi, trách nhiệm và quy trình giảng dạy dành cho Giảng viên EduVerse
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(17, 17, 17, 0.08)' }} />

            {/* Content List */}
            <Stack spacing={3.5}>
              {instructorTermsList.map((item, index) => (
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
