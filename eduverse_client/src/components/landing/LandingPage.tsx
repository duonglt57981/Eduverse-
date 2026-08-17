'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import KhoaHocService from '@/src/services/KhoaHocService';
import { danhMucService } from '@/src/services/danhmucService';
import { useSelector } from '@/src/store/hook';
import { isTokenExpired } from '@/src/utils/jwt';
import { getRoleHomePath } from '@/src/utils/roleHome';
import {
  benefits,
  mentorHighlights,
  testimonials,
  type LandingCourse,
  type LandingStat,
} from './landing-data';
import {
  CourseVisual,
  SectionHeading,
} from './landing-shared';

// Định dạng số theo kiểu Việt Nam (vd 1234 -> "1.234")
function formatCount(n: number): string {
  return (n || 0).toLocaleString('vi-VN');
}

// Map khóa học thật -> thẻ "khóa học nổi bật" (không có tên GV/đánh giá trong API)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFeatured(kh: any): LandingCourse {
  const isFree = kh?.gia === 0 || kh?.gia == null;
  return {
    id: kh?.id || kh?.idKhoaHoc,
    badge: isFree ? 'Miễn phí' : (kh?.capDo || 'Khóa học'),
    title: kh?.tieuDe || 'Khóa học',
    subtitle: `${kh?.capDo || 'Mọi cấp độ'} • ${kh?.tongBaiGiang ?? 0} bài giảng`,
    price: isFree ? 'Miễn phí' : `${(kh?.gia ?? 0).toLocaleString('vi-VN')}đ`,
    palette: ['#8B1313', '#c2410c', '#fff7f4'],
    hinhAnhKhoaHoc: kh?.hinhAnhKhoaHoc || kh?.urlHinhAnh || kh?.hinhAnh || kh?.hinhAnhBia,
  };
}

export default function LandingPage() {
  // 100% dữ liệu thật (KHÔNG dùng dữ liệu mẫu): khóa học nổi bật + số liệu tính từ DB
  const [featured, setFeatured] = useState<LandingCourse[]>([]);
  const [realStats, setRealStats] = useState<LandingStat[]>([]);
  const courseService = useMemo(() => new KhoaHocService(), []);
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const roles = useSelector((s) => s.auth.roles);

  // Người dùng đã đăng nhập trước đó (đóng web rồi quay lại "/") → đưa thẳng
  // vào trang tương ứng với vai trò thay vì hiện lại trang giới thiệu.
  useEffect(() => {
    const token = user?.accessToken;
    if (token && !isTokenExpired(token)) {
      router.replace(getRoleHomePath(roles));
    }
  }, [user, roles, router]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const courseParams: any = { pageIndex: 1, pageSize: 500 };
        const [courseRes, catRes] = await Promise.all([
          courseService.GetList(courseParams),
          danhMucService.getList({ pageIndex: 1, pageSize: 500 }),
        ]);
        if (!active) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let items: any[] = [];
        let totalCourses = 0;
        if (courseRes?.status && courseRes.data) {
          items = courseRes.data.items || [];
          totalCourses = courseRes.data.totalCount || items.length;
          setFeatured(items.slice(0, 3).map(mapFeatured));
        }
        const totalStudents = items.reduce((sum, c) => sum + (c?.soLuongHocVien || 0), 0);
        const totalLectures = items.reduce((sum, c) => sum + (c?.tongBaiGiang || 0), 0);
        const totalCategories =
          catRes?.status && catRes.data ? (catRes.data.items || []).length : 0;
        setRealStats([
          { value: formatCount(totalStudents), label: 'Học viên' },
          { value: formatCount(totalCourses), label: 'Khóa học' },
          { value: formatCount(totalLectures), label: 'Bài giảng' },
          { value: formatCount(totalCategories), label: 'Danh mục' },
        ]);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, [courseService]);

  return (
    <>
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
                  color: 'var(--ev-text-muted, rgba(24,24,27,0.62))',
                }}
              >
                Tham gia môi trường học tập hiện đại với hàng trăm khóa học thực tiễn,
                mentor chuyên sâu và trải nghiệm giao diện cao cấp giúp bạn học tập,
                quản lý tiến độ và bứt phá sự nghiệp.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.25 }}>
                <Button
                  component={Link}
                  href="/auth/login"
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
                <Typography sx={{ fontSize: 13.5, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
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
                  bgcolor: 'var(--ev-paper, #fff)',
                }}
              >
                <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#7f1d1d' }}>
                  4.9/5
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
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
            {realStats.map((item) => (
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
                <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, color: '#8B1313' }}>
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
              {featured.map((course) => (
                <Paper
                  key={course.title}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.8,
                    border: '1px solid rgba(17,17,17,0.08)',
                    bgcolor: 'var(--ev-paper, #fff)',
                    transition: 'transform 180ms ease, box-shadow 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 24px 40px rgba(24,18,20,0.10)',
                    },
                  }}
                >
                  <CourseVisual
                    palette={course.palette}
                    badge={course.badge}
                    hinhAnhKhoaHoc={course.hinhAnhKhoaHoc}
                  />
                  <Typography sx={{ mt: 1.75, fontSize: 21, fontWeight: 900, letterSpacing: '-0.4px' }}>
                    {course.title}
                  </Typography>
                  <Typography sx={{ mt: 0.75, fontSize: 13, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
                    {course.subtitle}
                  </Typography>
                  <Stack
                    direction="row"
                    sx={{ mt: 1.75, alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#7f1d1d' }}>
                      {course.price}
                    </Typography>
                    <Button
                      component={Link}
                      href={course.id ? `/student/enroll-courses/${course.id}` : '/courses'}
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
                sx={{ color: '#8B1313' }}
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
                      bgcolor: 'var(--ev-paper, #fff)',
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
                        color: '#8B1313',
                        mb: 1.5,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.8, color: 'var(--ev-text-muted, rgba(24,24,27,0.58))' }}>
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
                    bgcolor: 'var(--ev-paper, #fff)',
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
                          ? 'linear-gradient(135deg, #321212, #8B1313)'
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

          <Box id="testimonials" sx={{ py: { xs: 5, md: 7 }, mb: { xs: 4, md: 6 } }}>
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
                    bgcolor: 'var(--ev-paper, #fff)',
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
                  <Typography sx={{ mt: 0.5, fontSize: 12.5, color: 'var(--ev-text-muted, rgba(24,24,27,0.54))' }}>
                    {item.role}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>


    </>
  );
}

