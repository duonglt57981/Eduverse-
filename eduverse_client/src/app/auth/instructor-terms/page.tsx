'use client';
import { useMemo } from 'react';
import Link from 'next/link';
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
import {
  ArrowBackRounded,
  SchoolRounded,
} from '@mui/icons-material';
import { createAppTheme } from '@/src/theme/createAppTheme';

const PRIMARY_COLOR = '#8B1313';

export default function InstructorTermsPage() {
  const theme = useMemo(() => createAppTheme('light'), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'var(--ev-paper-alt, #F8FAFC)',
          py: { xs: 4, sm: 6 },
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 880, mx: 'auto' }}>
          {/* Back button */}
          <Link href="/student/dashboard" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: 'var(--ev-text-secondary, #64748B)',
                mb: 3,
                fontSize: 14.5,
                fontWeight: 600,
                transition: 'color 200ms ease',
                '&:hover': {
                  color: PRIMARY_COLOR,
                },
              }}
            >
              <ArrowBackRounded fontSize="small" />
              Quay lại EduVerse
            </Box>
          </Link>

          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 12px 36px rgba(30, 41, 59, 0.05)',
              p: { xs: 3.5, sm: 5, md: 6 },
              bgcolor: 'var(--ev-paper, #ffffff)',
            }}
          >
            {/* Header Badge & Title */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Chip
                  icon={<SchoolRounded sx={{ fontSize: 16, color: `${PRIMARY_COLOR} !important` }} />}
                  label="Dành cho Giảng viên"
                  sx={{
                    bgcolor: 'rgba(139, 19, 19, 0.08)',
                    color: PRIMARY_COLOR,
                    fontWeight: 700,
                    fontSize: 13,
                    px: 0.5,
                  }}
                />
              </Stack>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'var(--ev-text-primary, #1E293B)',
                  letterSpacing: '-1px',
                  mb: 1.5,
                  fontSize: { xs: 26, sm: 32 },
                  lineHeight: 1.2,
                }}
              >
                Điều khoản & Quy định Hợp tác Giảng viên
              </Typography>

              <Typography variant="body1" sx={{ color: 'var(--ev-text-secondary, #64748B)', fontSize: 15, lineHeight: 1.6 }}>
                Chào mừng bạn đến với cộng đồng Giảng viên của EduVerse! Các điều khoản dưới đây điều chỉnh quyền lợi, trách nhiệm và quy trình hợp tác giảng dạy giữa bạn và nền tảng EduVerse.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

            {/* Terms Content List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, color: 'var(--ev-text-secondary, #334155)' }}>
              
              {/* Section 1 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1E293B)', mb: 1, fontSize: 18 }}>
                  1. Quyền Sở hữu Trí tuệ & Bản quyền Nội dung
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ev-text-secondary, #475569)' }}>
                  - Giảng viên luôn giữ trọn vẹn quyền sở hữu trí tuệ đối với tài liệu, bài giảng và nội dung khóa học do mình tự biên soạn.<br />
                  - Bằng việc cấp phép phân phối khóa học trên EduVerse, Giảng viên đồng ý cấp cho EduVerse quyền không độc quyền (non-exclusive) để tiếp thị, quảng bá và phân phối khóa học tới học viên trên toàn cầu.<br />
                  - Giảng viên cam kết nội dung tải lên là chính chủ, không sao chép trái phép hoặc vi phạm bản quyền của bất kỳ cá nhân hay tổ chức nào khác.
                </Typography>
              </Box>

              {/* Section 2 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1E293B)', mb: 1, fontSize: 18 }}>
                  2. Phân chia Doanh thu & Quy trình Thanh toán
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ev-text-secondary, #475569)' }}>
                  - <strong>Tỷ lệ phân chia:</strong> Giảng viên nhận tỷ lệ doanh thu theo thỏa thuận trong từng chương trình khuyến mại hoặc bán hàng trực tiếp trên EduVerse.<br />
                  - <strong>Rút tiền:</strong> Yêu cầu rút tiền được xử lý định kỳ thông qua tài khoản ngân hàng chính chủ đã được liên kết và xác minh trên hệ thống.<br />
                  - <strong>Nghĩa vụ thuế:</strong> Giảng viên có trách nhiệm thực hiện khai báo và nộp thuế thu nhập cá nhân theo đúng quy định của pháp luật Việt Nam đối với nguồn thu nhập từ nền tảng.
                </Typography>
              </Box>

              {/* Section 3 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1E293B)', mb: 1, fontSize: 18 }}>
                  3. Quy chuẩn Chất lượng & Tương tác Học viên
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ev-text-secondary, #475569)' }}>
                  - Video bài giảng cần đảm bảo hình ảnh rõ nét, âm thanh trong trẻo, không chứa nội dung phản cảm, kích động hoặc vi phạm pháp luật.<br />
                  - Giảng viên có trách nhiệm phản hồi và giải đáp các thắc mắc (Q&A) của học viên liên quan đến bài giảng trong vòng 48 giờ làm việc.<br />
                  - Nghiêm cấm chèn liên kết lừa đảo, quảng cáo dịch vụ bên ngoài trái phép hoặc chủ động lôi kéo học viên thanh toán ngoài hệ thống EduVerse.
                </Typography>
              </Box>

              {/* Section 4 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1E293B)', mb: 1, fontSize: 18 }}>
                  4. Quy trình Duyệt & Quản lý Khóa học
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ev-text-secondary, #475569)' }}>
                  - Tất cả khóa học mới tạo hoặc chỉnh sửa nội dung lớn sẽ trải qua quy trình duyệt bởi Ban Quản trị EduVerse trước khi phát hành.<br />
                  - EduVerse bảo lưu quyền tạm ẩn hoặc hạ khóa học nếu nhận được các khiếu nại xác đáng về vi phạm bản quyền, nội dung sai lệch hoặc giả mạo bằng cấp.
                </Typography>
              </Box>

              {/* Section 5 */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--ev-text-primary, #1E293B)', mb: 1, fontSize: 18 }}>
                  5. Bảo mật Thông tin & Hỗ trợ
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--ev-text-secondary, #475569)' }}>
                  - Thông tin cá nhân, CV và hồ sơ năng lực của Giảng viên được EduVerse bảo mật nghiêm ngặt theo chính sách quyền riêng tư.<br />
                  - Nếu cần hỗ trợ thêm thông tin về thủ tục nâng cấp tài khoản Giảng viên, bạn có thể liên hệ trực tiếp với bộ phận Hỗ trợ Giảng viên qua email: <a href="mailto:instructor@eduverse.website" style={{ color: PRIMARY_COLOR, fontWeight: 700 }}>instructor@eduverse.website</a>.
                </Typography>
              </Box>

            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

            {/* Footer */}
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--ev-text-muted, #94A3B8)', fontSize: 13 }}>
              EduVerse © 2026. Tất cả các quyền được bảo lưu. Việc nâng cấp tài khoản Giảng viên đồng nghĩa với việc bạn đồng ý với toàn bộ các điều khoản trên.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
