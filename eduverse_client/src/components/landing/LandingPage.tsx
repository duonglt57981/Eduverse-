'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowForwardRounded,
  PlayArrowRounded,
  StarRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  benefits,
  featuredCourses,
  mentorHighlights,
  stats,
  testimonials,
} from './landing-data';
import {
  CourseVisual,
  LandingFooter,
  LandingNavbar,
  LandingThemeProvider,
  SectionHeading,
} from './landing-shared';

export default function LandingPage() {
  return (
    <LandingThemeProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 } }}>
          <LandingNavbar activePath="/" />

          <Box
            sx={{
              pt: { xs: 5, md: 8 },
              pb: { xs: 4, md: 6 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.02fr) minmax(420px, 0.98fr)' },
              gap: { xs: 4, md: 5 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                label="Nền tảng học tập premium"
                sx={{
                  bgcolor: 'rgba(159,23,23,0.08)',
                  color: '#9f1717',
                  fontWeight: 900,
                  mb: 2.25,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 38, sm: 50, md: 68 },
                  lineHeight: 1.02,
                  letterSpacing: '-1.6px',
                  fontWeight: 900,
                  maxWidth: 680,
                  color: '#1a1a1a',
                }}
              >
                Học mọi lúc,
                <br />
                phát triển
                <br />
                tương lai cùng
                <br />
                EduVerse
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 620,
                  fontSize: 15.5,
                  lineHeight: 1.95,
                  color: 'rgba(24,24,27,0.62)',
                }}
              >
                Tham gia môi trường học tập hiện đại với hàng trăm khóa học thực tiễn,
                mentor chuyên sâu và trải nghiệm giao diện cao cấp giúp bạn học tập,
                quản lý tiến độ và bứt phá sự nghiệp.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.25 }}>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    px: 2.8,
                    py: 1.4,
                    borderRadius: 2.8,
                    background: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
                  }}
                >
                  Bắt đầu học ngay
                </Button>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  startIcon={<PlayArrowRounded />}
                  sx={{
                    px: 2.6,
                    py: 1.4,
                    borderRadius: 2.8,
                    borderColor: 'rgba(24,24,27,0.14)',
                    color: 'rgba(24,24,27,0.82)',
                  }}
                >
                  Khám phá lộ trình
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3.25, alignItems: 'center', flexWrap: 'wrap' }}>
                <Stack direction="row" spacing={-0.75}>
                  {[1, 2, 3, 4].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontWeight: 900,
                        bgcolor: item % 2 === 0 ? '#7f1d1d' : '#b86d57',
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Stack>
                <Typography sx={{ fontSize: 13.5, color: 'rgba(24,24,27,0.58)' }}>
                  1.200+ học viên mới bắt đầu học mỗi tuần
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.25, md: 1.6 },
                  borderRadius: 2.8,
                  border: '1px solid rgba(127,29,29,0.18)',
                  boxShadow: '0 26px 50px rgba(90, 26, 26, 0.14)',
                  bgcolor: '#fff7f4',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2.8,
                    minHeight: { xs: 280, sm: 360, md: 430 },
                    background:
                      'linear-gradient(135deg, rgba(255,247,240,0.96), rgba(255,240,233,0.94))',
                  }}
                >
                  <Image
                    src="/auth/img/Illustration_Section_v2.png"
                    alt="EduVerse classroom"
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 48vw"
                    style={{ objectFit: 'cover', objectPosition: 'center center', transform: 'scale(1.1)' }}
                  />
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  position: 'absolute',
                  right: { xs: 12, md: -18 },
                  bottom: { xs: 12, md: 26 },
                  px: 2,
                  py: 1.4,
                  borderRadius: 2.8,
                  border: '1px solid rgba(17,17,17,0.08)',
                  boxShadow: '0 18px 32px rgba(30,24,26,0.10)',
                  bgcolor: '#fff',
                }}
              >
                <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#7f1d1d' }}>
                  4.9/5
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'rgba(24,24,27,0.54)' }}>
                  Đánh giá từ học viên premium
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
              gap: 2,
              py: { xs: 2, md: 3 },
            }}
          >
            {stats.map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.8,
                  border: '1px solid rgba(17,17,17,0.06)',
                  bgcolor: 'rgba(255,255,255,0.76)',
                }}
              >
                <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, color: '#a21a1a' }}>
                  {item.value}
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: 12.5, fontWeight: 800, color: 'rgba(24,24,27,0.56)', textTransform: 'uppercase' }}>
                  {item.label}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box id="courses" sx={{ py: { xs: 5, md: 7 } }}>
            <Box sx={{ mb: 3.5 }}>
              <SectionHeading
                eyebrow="Courses"
                title="Các khóa học nổi bật"
                description="Lựa chọn chương trình học được thiết kế chuyên sâu với nội dung thực tiễn và mentor chất lượng cao."
                align="center"
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2.2,
              }}
            >
              {featuredCourses.map((course) => (
                <Paper
                  key={course.title}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.8,
                    border: '1px solid rgba(17,17,17,0.08)',
                    bgcolor: '#fff',
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 24px 40px rgba(24,18,20,0.10)',
                    },
                  }}
                >
                  <CourseVisual palette={course.palette} badge={course.badge} />
                  <Typography sx={{ mt: 1.75, fontSize: 21, fontWeight: 900, letterSpacing: '-0.4px' }}>
                    {course.title}
                  </Typography>
                  <Typography sx={{ mt: 0.75, fontSize: 13, color: 'rgba(24,24,27,0.58)' }}>
                    {course.subtitle}
                  </Typography>
                  <Stack direction="row" spacing={0.35} sx={{ mt: 1.25, color: '#efb21a' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarRounded key={star} sx={{ fontSize: 18 }} />
                    ))}
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ mt: 1.75, alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#7f1d1d' }}>
                      {course.price}
                    </Typography>
                    <Button
                      component={Link}
                      href="/auth/login"
                      variant="outlined"
                      sx={{
                        borderRadius: 2.8,
                        borderColor: 'rgba(17,17,17,0.12)',
                        color: 'rgba(24,24,27,0.76)',
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>

            <Stack direction="row" sx={{ justifyContent: 'center', mt: 4 }}>
              <Button 
                component={Link}
                href="/courses"
                endIcon={<ArrowForwardRounded />} 
                sx={{ color: '#8d1313' }}
              >
                Xem toàn bộ khóa học
              </Button>
            </Stack>
          </Box>

          <Box id="benefits" sx={{ py: { xs: 5, md: 7 } }}>
            <SectionHeading
              eyebrow="Benefits"
              title="Nền tảng học tập tối giản nhưng mạnh mẽ"
              description="EduVerse kết hợp thiết kế premium, dữ liệu học tập rõ ràng và hành trình cá nhân hóa để bạn tập trung vào kết quả."
              align="center"
            />
            <Box
              sx={{
                mt: 3.5,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <Paper
                    key={item.title}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.8,
                      border: '1px solid rgba(17,17,17,0.07)',
                      bgcolor: '#fff',
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 24px 38px rgba(24,18,20,0.08)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.8,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(127,29,29,0.08)',
                        color: '#8d1313',
                        mb: 1.5,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.8, color: 'rgba(24,24,27,0.58)' }}>
                      {item.description}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          <Box id="mentors" sx={{ py: { xs: 5, md: 7 } }}>
            <SectionHeading
              title="Học từ những chuyên gia hàng đầu"
              description="Đội ngũ giảng viên kết hợp kinh nghiệm doanh nghiệp, tư duy chiến lược và khả năng truyền đạt rõ ràng."
              align="center"
            />
            <Box
              sx={{
                mt: 3.5,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {mentorHighlights.map((mentor, index) => (
                <Paper
                  key={mentor.name}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.8,
                    border: '1px solid rgba(17,17,17,0.07)',
                    bgcolor: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 84, md: 104 },
                      height: { xs: 84, md: 104 },
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontSize: 28,
                      fontWeight: 900,
                      background:
                        index % 2 === 0
                          ? 'linear-gradient(135deg, #321212, #8d1313)'
                          : 'linear-gradient(135deg, #2d313d, #5f6677)',
                    }}
                  >
                    {mentor.name
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')}
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
                    {mentor.name}
                  </Typography>
                  <Typography sx={{ mt: 0.75, fontSize: 12.5, color: 'rgba(24,24,27,0.56)' }}>
                    {mentor.role}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          <Box id="testimonials" sx={{ py: { xs: 5, md: 7 } }}>
            <SectionHeading title="Cảm nhận từ học viên" align="center" />
            <Box
              sx={{
                mt: 3.5,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {testimonials.map((item) => (
                <Paper
                  key={item.name}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.8,
                    border: '1px solid rgba(17,17,17,0.07)',
                    bgcolor: '#fff',
                  }}
                >
                  <Stack direction="row" spacing={0.35} sx={{ color: '#efb21a' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarRounded key={star} sx={{ fontSize: 18 }} />
                    ))}
                  </Stack>
                  <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.9, color: 'rgba(24,24,27,0.7)' }}>
                    {item.quote}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 900 }}>{item.name}</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 12.5, color: 'rgba(24,24,27,0.54)' }}>
                    {item.role}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: { xs: 2, md: 4 },
              p: { xs: 3, md: 5 },
              borderRadius: 2.8,
              overflow: 'hidden',
              position: 'relative',
              color: '#fff',
              background:
                'radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 25%), linear-gradient(135deg, #8d1010 0%, #6f0f0f 100%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: -60,
                top: -40,
                width: 220,
                height: 220,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.08)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: { xs: 28, md: 40 } }}>
                Sẵn sàng nâng tầm sự nghiệp của bạn?
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 660, mx: 'auto', lineHeight: 1.9, color: 'rgba(255,255,255,0.82)' }}>
                Bắt đầu với lộ trình học tập thông minh, mentor chất lượng và trải nghiệm
                học trực tuyến hiện đại dành riêng cho người đi làm.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, justifyContent: 'center' }}>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  sx={{ px: 2.6, py: 1.25, borderRadius: 2.8, bgcolor: '#fff', color: '#7f1d1d' }}
                >
                  Đăng ký miễn phí
                </Button>
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  sx={{ px: 2.6, py: 1.25, borderRadius: 2.8, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                >
                  Tư vấn khóa học
                </Button>
              </Stack>
            </Box>
          </Paper>

          <LandingFooter />
        </Box>
      </Box>
    </LandingThemeProvider>
  );
}

