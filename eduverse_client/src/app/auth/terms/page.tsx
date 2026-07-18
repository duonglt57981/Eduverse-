'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  CssBaseline,
  Paper,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ArrowBackRounded } from '@mui/icons-material';
import { createAppTheme } from '@/src/theme/createAppTheme';

export default function TermsPage() {
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
                Điều khoản Dịch vụ
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

            {/* Terms Content */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, color: '#334155' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  1. Chấp nhận các Điều khoản
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Bằng cách truy cập và đăng nhập vào hệ thống EduVerse, bạn đồng ý tuân thủ các Điều khoản Dịch vụ này cũng như tất cả các luật pháp và quy định hiện hành. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  2. Quyền Sở hữu Trí tuệ
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Tất cả các tài liệu, bài giảng, video khóa học, hình ảnh, mã nguồn và thiết kế trên hệ thống EduVerse đều thuộc bản quyền của EduVerse hoặc các giảng viên đối tác. Bạn không được sao chép, phân phối hoặc tái bản nội dung khóa học khi chưa có sự đồng ý bằng văn bản của chúng tôi.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  3. Tài khoản Người dùng
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Khi đăng ký tài khoản (qua Google Auth hoặc các hình thức khác), bạn có trách nhiệm bảo mật thông tin đăng nhập của mình. Bạn hoàn toàn chịu trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của bạn. Chúng tôi có quyền khóa hoặc chấm dứt tài khoản nếu phát hiện bất kỳ hành vi vi phạm nào.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  4. Quy định sử dụng Dịch vụ
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  Học viên cam kết không sử dụng hệ thống vào các mục đích bất hợp pháp, không can thiệp hoặc làm gián đoạn hệ thống máy chủ, không tải lên các nội dung độc hại, lăng mạ hoặc vi phạm tiêu chuẩn cộng đồng.
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, fontSize: 18 }}>
                  5. Thay đổi Điều khoản
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 14.5, lineHeight: 1.7, color: '#475569' }}>
                  EduVerse có quyền sửa đổi hoặc thay thế các Điều khoản Dịch vụ này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay sau khi được đăng trên trang web. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc chấp nhận các điều khoản mới.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

            {/* Footer contact */}
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ, vui lòng liên hệ ban quản trị tại{' '}
              <a href="mailto:admin.eduverse10@gmail.com" style={{ color: '#8B1313', textDecoration: 'none', fontWeight: 600 }}>
                admin.eduverse10@gmail.com
              </a>.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
