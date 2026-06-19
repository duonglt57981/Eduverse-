'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { apiService } from '@/src/services/index';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Avatar,
} from '@mui/material';
import {
  ArrowForwardRounded,
  StarRounded,
  SchoolRounded,
  TimelineRounded,
  EmojiEventsRounded,
  PeopleAltRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  MoreVertRounded,
  LocalFireDepartmentRounded,
  InfoOutlined,
  PlayCircleOutlineRounded,
  ArticleOutlined,
  AssignmentTurnedInRounded,
  PsychologyRounded,
  CloudQueueRounded,
  TrendingUpRounded,
  AutoAwesomeRounded,
  QuizRounded,
  HelpOutlineRounded,
} from '@mui/icons-material';

// Crimson palette matching the premium design theme
const COLORS = {
  primary: '#8D1313',       // Crimson Red (Đỏ đô chủ đạo)
  primaryLight: '#B91C1C',  // Light Crimson
  primaryDark: '#7F1D1D',   // Dark Crimson
  bgLight: '#FFF8F6',       // Premium cream-rose background
  white: '#FFFFFF',
  textDark: '#1F2937',
  textSecondary: '#4B5563',
  purpleAI: '#7C3AED',
  gradientAI: 'linear-gradient(135deg, #8D1313 0%, #7C3AED 100%)',
  gradientTeal: 'linear-gradient(135deg, #0D9488 0%, #005F55 100%)',
  gradientCrimson: 'linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)',
  gradientCrimsonHover: 'linear-gradient(90deg, #7f1d1d 0%, #681212 100%)',
};

// Carousel row with navigation arrows
function CarouselRow({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 15);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      setTimeout(checkScroll, 100);
      const resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [children]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {showLeft && (
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: -15,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: '#ffffff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)',
            width: 38,
            height: 38,
            color: '#1F2937',
            '&:hover': { bgcolor: '#F3F4F6' },
          }}
        >
          <ChevronLeftRounded />
        </IconButton>
      )}

      {showRight && (
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: -15,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: '#ffffff',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.06)',
            width: 38,
            height: 38,
            color: '#1F2937',
            '&:hover': { bgcolor: '#F3F4F6' },
          }}
        >
          <ChevronRightRounded />
        </IconButton>
      )}

      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
          pb: 1.5,
          pt: 1,
          px: 0.5,
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Category bar at the top of content
function CategoryBar({ categories }: { categories: string[] }) {
  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        bgcolor: COLORS.white,
        py: 1.5,
        px: 2,
        borderRadius: '16px',
        mb: 3,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack direction="row" spacing={3} sx={{ minWidth: 'max-content' }}>
        {categories.map((cat, idx) => (
          <Typography
            key={idx}
            sx={{
              fontSize: 13.5,
              fontWeight: idx === 4 ? 800 : 500, // Make 'Phát triển' or similar look active/bold
              color: idx === 4 ? COLORS.primary : 'rgba(31,41,55,0.7)',
              cursor: 'pointer',
              transition: 'color 150ms',
              '&:hover': { color: COLORS.primary },
              borderBottom: idx === 4 ? `2px solid ${COLORS.primary}` : '2px solid transparent',
              pb: 0.5,
            }}
          >
            {cat}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

// Course card component
function CourseCard({ course }: { course: any }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 260,
        flexShrink: 0,
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.07)',
        bgcolor: COLORS.white,
        transition: 'transform 250ms ease, box-shadow 250ms ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 30px rgba(141, 19, 19, 0.06)',
        },
      }}
    >
      <Box
        sx={{
          height: 130,
          background: course.thumbnailGradient || 'linear-gradient(135deg, #F43F5E 0%, #C084FC 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 950, opacity: 0.15 }}>
          EduVerse
        </Typography>
        <Chip
          label={course.level || 'Cơ bản'}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: 10.5,
            height: 20,
          }}
        />
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontSize: 14.5,
            fontWeight: 800,
            lineHeight: 1.4,
            height: 40,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: COLORS.textDark,
          }}
        >
          {course.title}
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 12.5, color: 'rgba(31,41,55,0.5)' }}>
          {course.instructor || 'Giảng viên EduVerse'}
        </Typography>

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2,
            pt: 1.5,
            borderTop: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <StarRounded sx={{ color: '#F59E0B', fontSize: 16 }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textDark }}>
              {course.rating || 4.8}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 11.5, color: 'rgba(31,41,55,0.45)', fontWeight: 600 }}>
            👥 {(course.studentsCount || 1200).toLocaleString()}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

// Student Dashboard Content Page
export default function StudentDashboardContent() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'assigned' | 'paths' | 'certs' | 'tests'>('courses');
  const [selectedSkill, setSelectedSkill] = useState<string>('AI');

  // Hardcoded default category bar items from screenshot
  const categoriesList = [
    'Hoạt động kinh doanh',
    'Điện toán đám mây',
    'An ninh mạng',
    'Khoa học dữ liệu',
    'Phát triển',
    'Hoạt động CNTT',
    'Học ngôn ngữ',
    'Năng lực lãnh đạo & Quản lý',
    'Marketing',
    'AI tạo sinh',
    'Phát triển cá nhân',
  ];

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const res = await apiService.get<any>('/dashboard');
        if (res.status && res.data) {
          setDashboardData(res.data);
        } else {
          setError(res.message || 'Không thể tải dữ liệu học tập.');
        }
      } catch (err: any) {
        setError(typeof err === 'string' ? err : 'Đã xảy ra lỗi khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const filteredSkillsCourses = useMemo(() => {
    if (!dashboardData?.skillsCourses) return [];
    const skill = selectedSkill.toLowerCase();
    return dashboardData.skillsCourses.filter((course: any) => {
      const title = (course.title || '').toLowerCase();
      if (skill === 'ai') return title.includes('ai') || title.includes('machine learning') || title.includes('llm') || title.includes('python') || title.includes('chatbot');
      if (skill === 'python') return title.includes('python') || title.includes('machine learning') || title.includes('data');
      if (skill === 'reactjs') return title.includes('react') || title.includes('javascript') || title.includes('html') || title.includes('css');
      if (skill === 'sql server') return title.includes('sql') || title.includes('dữ liệu') || title.includes('data');
      if (skill === 'aws') return title.includes('aws') || title.includes('cloud') || title.includes('microservices') || title.includes('docker');
      if (skill === 'ui/ux') return title.includes('figma') || title.includes('ui') || title.includes('ux') || title.includes('thiết kế');
      return true;
    });
  }, [selectedSkill, dashboardData]);

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 350, py: 10 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (error || !dashboardData) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(127,29,29,0.1)', bgcolor: '#FFF0F0' }}>
        <Typography sx={{ color: '#b42318', fontWeight: 700 }}>
          {error || 'Có lỗi xảy ra khi đồng bộ dữ liệu.'}
        </Typography>
      </Paper>
    );
  }

  const { welcomeStats, continueLearning, interestedSkills, nextSectors, premiumSelection, historyRecommendation } = dashboardData;

  const currentTabItems = () => {
    if (!continueLearning) return [];
    switch (activeTab) {
      case 'courses':
        return continueLearning.courses || [];
      case 'paths':
        return continueLearning.paths || [];
      case 'certs':
        return continueLearning.certificates || [];
      case 'tests':
        return continueLearning.assessments || [];
      default:
        return [];
    }
  };

  return (
    <Stack spacing={4} sx={{ width: '100%', mt: -1 }}>
      {/* 1. Categories Navigation Sub-bar */}
      <CategoryBar categories={categoriesList} />

      {/* 2. Welcome Banner area */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '24px',
          bgcolor: COLORS.white,
          border: '1px solid rgba(141,19,19,0.06)',
          boxShadow: '0 6px 20px rgba(141,19,19,0.015)',
        }}
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Avatar
            src={welcomeStats?.avatarUrl || undefined}
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'rgba(141,19,19,0.05)',
              color: COLORS.primary,
              fontSize: 24,
              fontWeight: 900,
              boxShadow: '0 8px 20px rgba(141,19,19,0.08)',
              border: '2px solid rgba(141,19,19,0.1)',
            }}
          >
            {welcomeStats?.userName
              ? welcomeStats.userName.split(' ').pop()?.substring(0, 2).toUpperCase()
              : 'HV'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900, color: COLORS.textDark }}>
              Chào mừng {welcomeStats?.userName || 'học viên'} trở lại!
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(31,41,55,0.48)' }}>
                Sinh viên
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.3)', display: { xs: 'none', sm: 'inline' } }}>
                •
              </Typography>
              <Typography
                component="a"
                href="#profile-settings"
                sx={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: COLORS.primary,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Chỉnh sửa nghề nghiệp và sở thích
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* 3. Double Highlight promo cards: AI Suggestion & Skill Assessment */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '24px',
              background: COLORS.gradientAI,
              color: '#ffffff',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(124, 58, 237, 0.15)',
              transition: 'transform 200ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            {/* Visual background element */}
            <Box
              sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <PsychologyRounded sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />
            </Box>

            <Box sx={{ zIndex: 1 }}>
              <Typography sx={{ fontSize: 21, fontWeight: 900, mb: 1, letterSpacing: '-0.3px' }}>
                AI phù hợp với bạn
              </Typography>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, opacity: 0.9, maxWidth: '85%' }}>
                Luôn dẫn đầu với các kỹ năng AI theo nhu cầu giúp nâng cao sự nghiệp và giúp bạn được chú ý.
              </Typography>
            </Box>
            <Box sx={{ zIndex: 1, mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#ffffff',
                  color: COLORS.primary,
                  fontWeight: 800,
                  borderRadius: '50px',
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#FFF5F7', boxShadow: 'none' },
                }}
              >
                Khám phá các khóa học về AI
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '24px',
              background: COLORS.gradientTeal,
              color: '#ffffff',
              minHeight: 220,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(13, 148, 136, 0.15)',
              transition: 'transform 200ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            {/* Visual background element */}
            <Box
              sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <QuizRounded sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />
            </Box>

            <Box sx={{ zIndex: 1 }}>
              <Typography sx={{ fontSize: 21, fontWeight: 900, mb: 1, letterSpacing: '-0.3px' }}>
                Kiểm tra kỹ năng của bạn
              </Typography>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, opacity: 0.9, maxWidth: '85%' }}>
                Khám phá điểm mạnh và nhận định hướng về những gì nên học tiếp theo.
              </Typography>
            </Box>
            <Box sx={{ zIndex: 1, mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#ffffff',
                  color: '#005F55',
                  fontWeight: 800,
                  borderRadius: '50px',
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#F0FDF4', boxShadow: 'none' },
                }}
              >
                Khám phá bài đánh giá
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 4. Learning Streak box */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '24px',
          border: '1px solid rgba(141,19,19,0.08)',
          bgcolor: COLORS.white,
          boxShadow: '0 6px 20px rgba(141,19,19,0.01)',
        }}
      >
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          {/* Col 1: Title */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: COLORS.textDark }}>
              Bắt đầu một chuỗi mới
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(31,41,55,0.5)', fontWeight: 500 }}>
              Đã xong vòng truy cập, giờ hãy hoàn thành vòng xem.
            </Typography>
          </Grid>

          {/* Col 2: Streak weeks indicator */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'rgba(141,19,19,0.04)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <LocalFireDepartmentRounded sx={{ color: COLORS.primary, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 900, color: COLORS.textDark }}>
                  0 tuần
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(31,41,55,0.4)', fontWeight: 650 }}>
                  Chuỗi hiện tại
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Col 3: Radial Progress ring */}
          <Grid size={{ xs: 6, md: 4 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {/* Custom SVG Radial progress */}
              <Box sx={{ position: 'relative', width: 44, height: 44, display: 'grid', placeItems: 'center' }}>
                <svg width="44" height="44" viewBox="0 0 36 36">
                  {/* Background track */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(141,19,19,0.06)" strokeWidth="3.5" />
                  {/* Active segment (0%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={COLORS.primary}
                    strokeWidth="3.5"
                    strokeDasharray="0 100"
                    strokeDashoffset="25"
                    strokeLinecap="round"
                  />
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: COLORS.primary,
                    border: '2px solid #fff',
                  }}
                />
              </Box>
              <Box>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: COLORS.textDark }}>
                    0/30 phút khóa học
                  </Typography>
                  <InfoOutlined sx={{ fontSize: 13, color: 'rgba(31,41,55,0.4)' }} />
                </Stack>
                <Typography sx={{ fontSize: 11.5, color: 'rgba(31,41,55,0.4)', fontWeight: 700, mt: 0.2 }}>
                  🟢 1/1 lượt truy cập • 14 thg 6 - 20
                </Typography>
                <Typography
                  component="a"
                  href="#streak-details"
                  sx={{
                    display: 'inline-block',
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: COLORS.primary,
                    textDecoration: 'none',
                    mt: 0.5,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Xem tất cả hoạt động
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 5. Continuation Section (Hoàn thành nốt phần bạn đang làm dở) */}
      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 900, color: COLORS.textDark }}>
            Hoàn thành nốt phần bạn đang làm dở
          </Typography>
          <Typography
            component="a"
            href="/learning-activity"
            sx={{
              fontSize: 13.5,
              fontWeight: 800,
              color: COLORS.primary,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Học tập
          </Typography>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            '& .MuiTabs-indicator': {
              bgcolor: COLORS.primary,
              height: 3,
              borderRadius: '3px',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 700,
              color: 'rgba(31,41,55,0.5)',
              minWidth: 100,
              px: 1.5,
              pb: 1.5,
              '&.Mui-selected': { color: COLORS.primary },
            },
          }}
        >
          <Tab value="courses" label="Khóa học" />
          <Tab value="assigned" label="Các khóa học được chỉ định" />
          <Tab value="paths" label="Lộ trình học tập" />
          <Tab value="certs" label="Luyện thi chứng chỉ" />
          <Tab value="tests" label="Bài đánh giá" />
        </Tabs>

        {/* Tab Content rendering */}
        {activeTab === 'courses' && (
          <CarouselRow>
            {currentTabItems().map((item: any) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  width: 320,
                  flexShrink: 0,
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  bgcolor: COLORS.white,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative',
                  transition: 'transform 200ms, box-shadow 200ms',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
                  },
                }}
              >
                {/* Visual Type indicator Icon */}
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: '12px',
                    bgcolor: item.id.includes('fallback') && item.title.includes('Javascript')
                      ? 'rgba(124, 58, 237, 0.06)'
                      : item.title.includes('Software')
                      ? 'rgba(16, 185, 129, 0.06)'
                      : 'rgba(141,19,19,0.05)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    color: item.id.includes('fallback') && item.title.includes('Javascript')
                      ? COLORS.purpleAI
                      : item.title.includes('Software')
                      ? '#10B981'
                      : COLORS.primary,
                  }}
                >
                  {item.contentType === 'Bài viết' || item.contentType === 'Bài tập' ? (
                    <ArticleOutlined sx={{ fontSize: 28 }} />
                  ) : (
                    <PlayCircleOutlineRounded sx={{ fontSize: 30 }} />
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: COLORS.textDark,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'rgba(31,41,55,0.7)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mt: 0.2,
                    }}
                  >
                    {item.subtitle || 'Tiến độ học tập'}
                  </Typography>
                  <Typography sx={{ mt: 0.8, fontSize: 11.5, color: 'rgba(31,41,55,0.4)', fontWeight: 700 }}>
                    {item.contentType} • {item.duration}
                  </Typography>
                </Box>

                <IconButton size="small" sx={{ alignSelf: 'flex-start', mt: -0.5, mr: -0.5 }}>
                  <MoreVertRounded sx={{ fontSize: 18, color: 'rgba(31,41,55,0.4)' }} />
                </IconButton>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 20,
                    right: 20,
                    height: 3,
                    bgcolor: 'rgba(0,0,0,0.04)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${item.progress}%`,
                      bgcolor: item.id.includes('fallback') && item.title.includes('Javascript')
                        ? COLORS.purpleAI
                        : item.title.includes('Software')
                        ? '#10B981'
                        : COLORS.primary,
                    }}
                  />
                </Box>
              </Paper>
            ))}
          </CarouselRow>
        )}

        {activeTab === 'assigned' && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '24px',
              border: '1px solid rgba(141,19,19,0.06)',
              bgcolor: COLORS.white,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: COLORS.textDark }}>
              Chưa có khóa học nào được chỉ định
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', maxWidth: 650, lineHeight: 1.6 }}>
              Chưa có khóa học nào được chỉ định cho bạn. Khi khóa học được chỉ định cho bạn, khóa học sẽ xuất hiện ở đây.
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: COLORS.primary,
                color: '#fff',
                borderRadius: '12px',
                px: 3.5,
                py: 1,
                fontWeight: 800,
                boxShadow: 'none',
                '&:hover': { bgcolor: COLORS.primaryDark, boxShadow: 'none' },
              }}
            >
              Khám phá khóa học
            </Button>
          </Paper>
        )}

        {activeTab === 'paths' && (
          <CarouselRow>
            {currentTabItems().map((item: any) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  width: 320,
                  flexShrink: 0,
                  p: 3,
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.07)',
                  bgcolor: COLORS.white,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 150,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 200ms, box-shadow 200ms',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.04)',
                  },
                }}
              >
                <Box sx={{ minHeight: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: 'rgba(31,41,55,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.contentType}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 15,
                      fontWeight: 800,
                      color: COLORS.textDark,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 12.5, color: 'rgba(31,41,55,0.5)', fontWeight: 700 }}>
                  {item.duration}
                </Typography>
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, bgcolor: COLORS.primary }} />
              </Paper>
            ))}
          </CarouselRow>
        )}

        {activeTab === 'certs' && (
          <CarouselRow>
            {currentTabItems().map((item: any) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  width: 440,
                  flexShrink: 0,
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.07)',
                  bgcolor: COLORS.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2.5,
                  transition: 'transform 200ms, box-shadow 200ms',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.04)',
                  },
                }}
              >
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                  {/* ISTQB visual logo badge mock */}
                  <Box
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: item.thumbnailGradient || 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(141,19,19,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 900, letterSpacing: '0.5px' }}>
                      ISTQB
                    </Typography>
                    <Box sx={{ position: 'absolute', bottom: 12, width: '70%', height: 3, borderRadius: '2px', background: '#EF4444' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: COLORS.textDark, lineHeight: 1.4, maxWidth: 280 }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: 'rgba(31,41,55,0.4)', fontWeight: 700 }}>
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton size="small">
                  <MoreVertRounded />
                </IconButton>
              </Paper>
            ))}
          </CarouselRow>
        )}

        {activeTab === 'tests' && (
          <Stack spacing={2.5}>
            {currentTabItems().map((item: any) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.07)',
                  bgcolor: COLORS.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'transform 200ms, box-shadow 200ms',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
                  },
                }}
              >
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: item.thumbnailGradient || COLORS.gradientCrimson,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <QuizRounded sx={{ fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: COLORS.textDark }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ mt: 0.3, fontSize: 12.5, color: 'rgba(31,41,55,0.4)', fontWeight: 700 }}>
                      {item.contentType} • {item.duration}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: '10px',
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                    fontWeight: 800,
                    px: 2.5,
                    fontSize: 12.5,
                    '&:hover': {
                      borderColor: COLORS.primaryDark,
                      bgcolor: 'rgba(141,19,19,0.04)',
                    },
                  }}
                >
                  Làm bài thi
                </Button>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* 6. Recommended Section (Lĩnh vực sẽ học tiếp theo) */}
      <Box>
        <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 900, color: COLORS.textDark }}>
          Lĩnh vực sẽ học tiếp theo
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', mb: 3, mt: 0.5 }}>
          Các khóa học đề xuất dành cho bạn
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 2.5,
          }}
        >
          {nextSectors.map((sec: any) => (
            <Paper
              key={sec.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '20px',
                border: '1px solid rgba(0,0,0,0.06)',
                bgcolor: COLORS.white,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 180,
                transition: 'all 200ms ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: COLORS.primary,
                  boxShadow: '0 8px 24px rgba(141, 19, 19, 0.04)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(141, 19, 19, 0.04)',
                    mb: 2,
                  }}
                >
                  {sec.iconName === 'data' ? (
                    <SchoolRounded sx={{ color: COLORS.primary, fontSize: 26 }} />
                  ) : sec.iconName === 'ai' ? (
                    <PsychologyRounded sx={{ color: COLORS.primary, fontSize: 26 }} />
                  ) : sec.iconName === 'cloud' ? (
                    <CloudQueueRounded sx={{ color: COLORS.primary, fontSize: 26 }} />
                  ) : (
                    <TrendingUpRounded sx={{ color: COLORS.primary, fontSize: 26 }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: 15.5, fontWeight: 900, color: COLORS.textDark, mb: 1.5 }}>
                  {sec.title}
                </Typography>
                <Stack spacing={0.75}>
                  {(sec.subfields || []).map((sub: string, i: number) => (
                    <Typography
                      key={i}
                      sx={{
                        fontSize: 12.5,
                        color: 'rgba(31,41,55,0.6)',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        '&:before': {
                          content: '""',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: COLORS.primary,
                          display: 'inline-block',
                        },
                      }}
                    >
                      {sub}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* 7. Skill-based section (Dựa trên kỹ năng bạn quan tâm) */}
      <Box sx={{ mt: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 900, color: COLORS.textDark }}>
            Dựa trên kỹ năng bạn quan tâm, chúng tôi khuyến nghị bạn
          </Typography>
          <Typography
            component="a"
            href="#edit-skills"
            sx={{
              fontSize: 13.5,
              fontWeight: 800,
              color: COLORS.primary,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Chỉnh sửa danh sách kỹ năng quan tâm
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {interestedSkills.map((badge: string) => {
            const isActive = selectedSkill === badge;
            return (
              <Chip
                key={badge}
                label={badge}
                onClick={() => setSelectedSkill(badge)}
                sx={{
                  bgcolor: isActive ? COLORS.primary : 'rgba(0,0,0,0.03)',
                  color: isActive ? '#fff' : 'rgba(31,41,55,0.65)',
                  fontWeight: 800,
                  fontSize: 13,
                  px: 1,
                  py: 1.8,
                  borderRadius: '50px',
                  border: isActive ? `1px solid ${COLORS.primary}` : '1px solid rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: isActive ? COLORS.primary : 'rgba(141, 19, 19, 0.05)',
                    color: isActive ? '#fff' : COLORS.primary,
                  },
                  transition: 'all 150ms ease',
                }}
              />
            );
          })}
        </Stack>

        <CarouselRow>
          {filteredSkillsCourses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CarouselRow>
      </Box>

      {/* 8. Premium selection Hero Card */}
      <Box>
        <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 900, color: COLORS.textDark, mb: 2.5 }}>
          Các khóa học hàng đầu chúng tôi chọn cho bạn
        </Typography>

        <Paper
          elevation={0}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(141, 19, 19, 0.08)',
            bgcolor: COLORS.white,
            mb: 3,
            boxShadow: '0 8px 24px rgba(141, 19, 19, 0.02)',
          }}
        >
          <Grid container>
            {/* Left preview (visual design) */}
            <Grid size={{ xs: 12, md: 5 }} sx={{ minHeight: 240, background: premiumSelection?.thumbnailGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Typography sx={{ color: '#fff', fontSize: 36, fontWeight: 900, opacity: 0.1 }}>
                PREMIUM
              </Typography>
              <Chip
                icon={<StarRounded sx={{ fontSize: '14px' }} />}
                label="LỰA CHỌN HÀNG ĐẦU"
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  bgcolor: 'rgba(255,255,255,0.95)',
                  color: COLORS.primary,
                  fontWeight: 900,
                  fontSize: 11,
                  height: 26,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  '& .MuiChip-icon': { color: `${COLORS.primary} !important` },
                }}
              />
            </Grid>

            {/* Right content */}
            <Grid size={{ xs: 12, md: 7 }} sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 12, fontWeight: 800, color: COLORS.primaryLight, mb: 1 }}>
                KHÓA HỌC ĐẶC BIỆT
              </Typography>
              <Typography sx={{ fontSize: 19, fontWeight: 900, color: COLORS.textDark, mb: 1.5, lineHeight: 1.4 }}>
                {premiumSelection?.title}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.6)', mb: 3, lineHeight: 1.6 }}>
                {premiumSelection?.description}
              </Typography>

              <Stack spacing={1} sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textDark }}>
                  Giảng viên: <span style={{ fontWeight: 500, color: 'rgba(31,41,55,0.7)' }}>{premiumSelection?.instructor}</span>
                </Typography>
                <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <StarRounded sx={{ color: '#F59E0B', fontSize: 16 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.textDark }}>
                      {premiumSelection?.rating}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 13, color: 'rgba(31,41,55,0.5)', fontWeight: 600 }}>
                    👥 {premiumSelection?.studentsCount?.toLocaleString()} học viên
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  sx={{
                    background: COLORS.gradientCrimson,
                    color: '#fff',
                    fontWeight: 800,
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    boxShadow: 'none',
                    '&:hover': { background: COLORS.gradientCrimsonHover, boxShadow: 'none' },
                  }}
                >
                  Xem khóa học
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(141, 19, 19, 0.25)',
                    color: COLORS.primary,
                    fontWeight: 800,
                    borderRadius: '12px',
                    px: 2.5,
                    py: 1,
                    '&:hover': { borderColor: COLORS.primary, bgcolor: 'rgba(141, 19, 19, 0.03)' },
                  }}
                >
                  Thêm vào danh sách
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <CarouselRow>
          {(premiumSelection?.relatedCourses || []).map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CarouselRow>
      </Box>

      {/* 9. Based on your history */}
      <Box>
        <Typography variant="h6" sx={{ fontSize: 20, fontWeight: 900, color: COLORS.textDark }}>
          Vì bạn đã học &quot;{historyRecommendation?.basedOnCourse}&quot;
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: 'rgba(31,41,55,0.5)', mb: 3, mt: 0.5 }}>
          Đề xuất từ động cơ trí tuệ nhân tạo (AI Recommendation Engine).
        </Typography>

        <CarouselRow>
          {(historyRecommendation?.courses || []).map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CarouselRow>
      </Box>
    </Stack>
  );
}
