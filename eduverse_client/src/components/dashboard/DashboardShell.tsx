'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  ChevronRightRounded,
  LogoutRounded,
  MailOutlineRounded,
  MenuRounded,
  NotificationsNoneRounded,
  SearchRounded,
  WbTwilightRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { logout } from '@/src/store/auth/AuthSlice';
import { useDispatch } from '@/src/store/hook';
import {
  activities,
  featuredCourses,
  inProgressCourses,
  quickActions,
  recentAssessments,
  sidebarPrimaryItems,
  sidebarSecondaryItems,
  statCards,
  todaySchedule,
} from './dashboard-data';

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.25,
          borderBottom: '1px solid rgba(17,17,17,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: 210, maxWidth: '100%' }}>
          <Image
            src="/auth/img/logo_nentrang.png"
            alt="EduVerse"
            width={210}
            height={64}
            priority
            style={{ width: '100%', height: 'auto' }}
          />
        </Box>
      </Box>

      <Box sx={{ px: 1.25, py: 1.5, flex: 1 }}>
        <List disablePadding>
          {sidebarPrimaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = Boolean(item.active);
            return (
              <ListItemButton
                key={item.label}
                sx={{
                  mb: 0.5,
                  borderRadius: 2.8,
                  px: 1.5,
                  py: 1.2,
                  color: isActive ? '#7f1d1d' : 'rgba(24,24,27,0.72)',
                  bgcolor: isActive ? 'rgba(127,29,29,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #7f1d1d' : '3px solid transparent',
                  transition: 'all 160ms ease',
                  '&:hover': {
                    bgcolor: isActive
                      ? 'rgba(127,29,29,0.10)'
                      : 'rgba(17,17,17,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  {item.label}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 1.5 }} />

        <List disablePadding>
          {sidebarSecondaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItemButton
                key={item.label}
                sx={{
                  mb: 0.5,
                  borderRadius: 2.8,
                  px: 1.5,
                  py: 1.1,
                  color: 'rgba(24,24,27,0.72)',
                  '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                  {item.label}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ px: 1.25, py: 1.5, borderTop: '1px solid rgba(17,17,17,0.06)' }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2.8,
            px: 1.5,
            py: 1.1,
            color: 'rgba(24,24,27,0.72)',
            '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            Đăng xuất
          </Typography>
        </ListItemButton>
      </Box>
    </Box>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
    >
      <Typography sx={{ fontSize: 21, fontWeight: 900, letterSpacing: '-0.4px' }}>
        {title}
      </Typography>
      {action ? (
        <Button
          size="small"
          endIcon={<ChevronRightRounded />}
          sx={{ color: 'rgba(24,24,27,0.62)', fontWeight: 800 }}
        >
          {action}
        </Button>
      ) : null}
    </Stack>
  );
}

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ElementType;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 32px rgba(19,16,18,0.08)',
        },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2.8,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(127,29,29,0.08)',
          color: '#7f1d1d',
          mb: 1.5,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'rgba(24,24,27,0.54)' }}>
        {label.toUpperCase()}
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 30, fontWeight: 900, letterSpacing: '-0.6px' }}>
        {value}
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: 12.5, color: 'rgba(24,24,27,0.56)' }}>
        {caption}
      </Typography>
    </Paper>
  );
}

function CourseVisual({
  palette,
  badge,
}: {
  palette: readonly string[];
  badge?: string;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 170,
        borderRadius: 2.8,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 55%, ${palette[2]} 100%)`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.10), transparent 22%), radial-gradient(circle at 78% 26%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(180deg, transparent 10%, rgba(0,0,0,0.35) 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 14,
          borderRadius: 2.8,
          border: '1px solid rgba(255,255,255,0.07)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 20,
          height: 44,
          borderRadius: 2.8,
          background: 'rgba(255,255,255,0.07)',
          boxShadow: '0 10px 22px rgba(0,0,0,0.20)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 24,
          right: 110,
          bottom: 80,
          height: 8,
          borderRadius: 2.8,
          background: 'rgba(255,255,255,0.15)',
        }}
      />
      {badge ? (
        <Chip
          label={badge}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: '#8e1414',
            color: '#fff',
            fontWeight: 900,
            height: 24,
          }}
        />
      ) : null}
    </Box>
  );
}

function ContinueCourseCard({
  title,
  mentor,
  progress,
  badge,
  palette,
}: {
  title: string;
  mentor: string;
  progress: number;
  badge: string;
  palette: readonly string[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 32px rgba(19,16,18,0.08)',
        },
      }}
    >
      <CourseVisual palette={palette} badge={badge} />
      <Typography sx={{ mt: 1.5, fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.4, fontSize: 13, color: 'rgba(24,24,27,0.58)' }}>
        {mentor}
      </Typography>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.5, mb: 0.75 }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: 'rgba(24,24,27,0.56)' }}>
          Ti?n d?
        </Typography>
        <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: 'rgba(24,24,27,0.7)' }}>
          {progress}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 7,
          borderRadius: 2.8,
          bgcolor: 'rgba(127,29,29,0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2.8,
            background: 'linear-gradient(90deg, #9f1717, #7f1d1d)',
          },
        }}
      />
      <Button
        fullWidth
        variant="outlined"
        sx={{
          mt: 2,
          py: 1.2,
          borderRadius: 2.8,
          borderColor: 'rgba(17,17,17,0.14)',
          color: 'rgba(24,24,27,0.78)',
          fontWeight: 800,
          '&:hover': {
            borderColor: 'rgba(127,29,29,0.30)',
            bgcolor: 'rgba(127,29,29,0.03)',
          },
        }}
      >
        Tiếp tục học
      </Button>
    </Paper>
  );
}

function FeaturedCourseCard({
  title,
  subtitle,
  price,
  palette,
}: {
  title: string;
  subtitle: string;
  price: string;
  palette: readonly string[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 32px rgba(19,16,18,0.08)',
        },
      }}
    >
      <CourseVisual palette={palette} />
      <Typography sx={{ mt: 1.5, fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>
        {title}
      </Typography>
      <Typography sx={{ mt: 0.6, fontSize: 12.5, color: 'rgba(24,24,27,0.56)' }}>
        {subtitle}
      </Typography>
      <Typography sx={{ mt: 1.5, fontSize: 24, fontWeight: 900, color: '#3c1515' }}>
        {price}
      </Typography>
      <Button
        fullWidth
        variant="outlined"
        sx={{
          mt: 2,
          py: 1.2,
          borderRadius: 2.8,
          borderColor: 'rgba(17,17,17,0.14)',
          color: 'rgba(24,24,27,0.78)',
          fontWeight: 800,
          '&:hover': {
            borderColor: 'rgba(127,29,29,0.30)',
            bgcolor: 'rgba(127,29,29,0.03)',
          },
        }}
      >
        Xem chi tiết
      </Button>
    </Paper>
  );
}

function RightRailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 2.8,
        border: '1px solid rgba(17,17,17,0.08)',
        bgcolor: '#fff',
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px', mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default function DashboardShell() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('AccessToken');

    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setAuthChecked(true); // react-hooks/set-state-in-effect
  }, [router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/auth/login');
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#7f1d1d' },
          background: { default: '#f6f3f1', paper: '#ffffff' },
          text: { primary: '#19171c', secondary: '#69656c' },
        },
        shape: { borderRadius: 2.8 },
        typography: {
          fontFamily:
            '"Be Vietnam Pro","Roboto",system-ui,-apple-system,Segoe UI,Arial,sans-serif',
          h3: { fontWeight: 900, letterSpacing: '-1px' },
          h4: { fontWeight: 900, letterSpacing: '-0.7px' },
          button: { textTransform: 'none', fontWeight: 800 },
        },
      }),
    [],
  );

  const sidebarWidth = 270;
  const headerOffset = '86px';

  if (!authChecked) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 2,
              borderRadius: 2.8,
              border: '1px solid rgba(17,17,17,0.08)',
              bgcolor: '#fff',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'rgba(24,24,27,0.66)' }}>
              Đang kiểm tra đăng nhập...
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              boxSizing: 'border-box',
              mt: headerOffset,
              height: `calc(100% - ${headerOffset})`,
            },
          }}
        >
          <SidebarContent onLogout={handleLogout} />
        </Drawer>

        <Box
          component="header"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1200,
            px: { xs: 2, md: 3.5 },
            py: 1.75,
            borderBottom: '1px solid rgba(17,17,17,0.06)',
            bgcolor: '#ffffff',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 52 }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                minWidth: 0,
                width: { xs: 'auto', lg: sidebarWidth },
                flexShrink: 0,
              }}
            >
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
              >
                <MenuRounded />
              </IconButton>

              <Box sx={{ width: { xs: 120, sm: 140, lg: 170 } }}>
                <Image
                  src="/auth/img/logo_nentrang.png"
                  alt="EduVerse"
                  width={170}
                  height={52}
                  priority
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  maxWidth: 520,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2.8,
                  bgcolor: '#fff',
                  border: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <SearchRounded sx={{ color: 'rgba(24,24,27,0.42)' }} />
                <InputBase
                  placeholder="Tìm kiếm khóa học, tài liệu..."
                  sx={{ flex: 1, fontSize: 14 }}
                />
              </Paper>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {[NotificationsNoneRounded, MailOutlineRounded, WbTwilightRounded].map(
                  (Icon, index) => (
                    <IconButton
                      key={index}
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: '#fff',
                        border: '1px solid rgba(17,17,17,0.06)',
                        '&:hover': { bgcolor: 'rgba(127,29,29,0.03)' },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  ),
                )}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: 0.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.8,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #311212, #8c1717)',
                    }}
                  >
                    MA
                  </Box>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', minHeight: '100vh', pt: headerOffset }}>
          <Box
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              display: { xs: 'none', lg: 'block' },
              borderRight: '1px solid rgba(17,17,17,0.06)',
              position: 'sticky',
              top: headerOffset,
              alignSelf: 'flex-start',
              height: `calc(100vh - ${headerOffset})`,
            }}
          >
            <SidebarContent onLogout={handleLogout} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ px: { xs: 2, md: 3.5 }, py: { xs: 2, md: 3 } }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.55fr) 360px' },
                  gap: 2.5,
                  alignItems: 'start',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 4 },
                      borderRadius: 2.8,
                      color: '#fff',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid rgba(127,29,29,0.16)',
                      background:
                        'radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 28%), linear-gradient(135deg, #8e1010 0%, #b21414 34%, #7f1d1d 66%, #550d0d 100%)',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'radial-gradient(circle at 75% 25%, rgba(255,255,255,0.08), transparent 20%), linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.03) 40%, transparent 60%)',
                      }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
                      <Typography
                        variant="h3"
                        sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.02 }}
                      >
                        Chào mừng trở lại,
                        <br />
                        Minh Anh!
                      </Typography>
                      <Typography
                        sx={{
                          mt: 1.5,
                          maxWidth: 420,
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: 'rgba(255,255,255,0.82)',
                        }}
                      >
                        Bạn đã hoàn thành 85% mục tiêu học tập của tuần này.
                        Tiếp tục phát huy nhé.
                      </Typography>
                      <Stack direction="row" spacing={1.25} sx={{ mt: 3, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardRounded />}
                          sx={{
                            px: 2.5,
                            py: 1.25,
                            bgcolor: '#fff',
                            color: '#6f1111',
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#fff4f4' },
                          }}
                        >
                          Tiếp tục bài học gần nhất
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            px: 2.25,
                            py: 1.25,
                            color: '#fff',
                            borderColor: 'rgba(255,255,255,0.25)',
                            '&:hover': {
                              borderColor: 'rgba(255,255,255,0.4)',
                              bgcolor: 'rgba(255,255,255,0.06)',
                            },
                          }}
                        >
                          Xem lộ trình
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(4, minmax(0, 1fr))',
                      },
                      gap: 1.75,
                      mt: 2.25,
                    }}
                  >
                    {statCards.map((card) => (
                      <StatCard key={card.label} {...card} />
                    ))}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <SectionHeader title="Khóa học đang học" action="Xem tất cả" />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                      }}
                    >
                      {inProgressCourses.map((course) => (
                        <ContinueCourseCard key={course.title} {...course} />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <SectionHeader title="Khóa học đề xuất" />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: 2,
                      }}
                    >
                      {featuredCourses.map((course) => (
                        <FeaturedCourseCard key={course.title} {...course} />
                      ))}
                    </Box>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      mt: 3,
                      p: { xs: 2, md: 2.5 },
                      borderRadius: 2.8,
                      border: '1px solid rgba(17,17,17,0.08)',
                      bgcolor: '#fff',
                    }}
                  >
                    <SectionHeader title="Hành động nhanh" />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                        gap: 1.5,
                      }}
                    >
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Paper
                            key={action.title}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2.8,
                              bgcolor: 'rgba(127,29,29,0.035)',
                              border: '1px solid rgba(127,29,29,0.08)',
                              transition: 'transform 160ms ease, background 160ms ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                bgcolor: 'rgba(127,29,29,0.06)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.8,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'rgba(127,29,29,0.10)',
                                color: '#7f1d1d',
                                mb: 1.25,
                              }}
                            >
                              <Icon fontSize="small" />
                            </Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 900 }}>
                              {action.title}
                            </Typography>
                            <Typography sx={{ mt: 0.75, fontSize: 12.5, color: 'rgba(24,24,27,0.58)' }}>
                              {action.desc}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      mt: 3,
                      p: { xs: 2, md: 2.5 },
                      borderRadius: 2.8,
                      border: '1px solid rgba(17,17,17,0.08)',
                      bgcolor: '#fff',
                    }}
                  >
                    <SectionHeader title="Hoạt động gần đây" />
                    <Stack spacing={1.25}>
                      {activities.map((item) => (
                        <Box
                          key={item.title}
                          sx={{
                            p: 1.5,
                            borderRadius: 2.8,
                            bgcolor: 'rgba(17,17,17,0.02)',
                            border: '1px solid rgba(17,17,17,0.05)',
                          }}
                        >
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'rgba(24,24,27,0.78)' }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ mt: 0.5, fontSize: 12.5, color: 'rgba(24,24,27,0.48)' }}>
                            {item.time}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    sx={{
                      mt: 3,
                      pt: 2.5,
                      borderTop: '1px solid rgba(17,17,17,0.06)',
                      color: 'rgba(24,24,27,0.54)',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 900, color: 'rgba(24,24,27,0.82)' }}>
                        EduVerse
                      </Typography>
                      <Typography sx={{ mt: 0.5, fontSize: 13 }}>
                        Hệ thống giáo dục executive cao cấp.
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                      {['Chính sách bảo mật', 'Điều khoản dịch vụ', 'Hỗ trợ'].map((item) => (
                        <Typography key={item} sx={{ fontSize: 13, fontWeight: 700 }}>
                          {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Stack spacing={2}>
                    <RightRailCard title="Lịch học hôm nay">
                      <Stack spacing={1.25}>
                        {todaySchedule.map((item) => (
                          <Box
                            key={item.title}
                            sx={{
                              p: 1.5,
                              borderRadius: 2.8,
                              border: '1px solid rgba(17,17,17,0.06)',
                              bgcolor: 'rgba(17,17,17,0.015)',
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{ alignItems: 'flex-start' }}
                            >
                              <Box
                                sx={{
                                  minWidth: 72,
                                  p: 1,
                                  borderRadius: 2.8,
                                  bgcolor: 'rgba(127,29,29,0.08)',
                                  color: '#7f1d1d',
                                }}
                              >
                                <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
                                  {item.time}
                                </Typography>
                                <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>
                                  {item.duration}
                                </Typography>
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 900 }}>
                                  {item.title}
                                </Typography>
                                <Typography sx={{ mt: 0.5, fontSize: 12.5, color: 'rgba(24,24,27,0.54)' }}>
                                  {item.detail}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>

                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2.8,
                          background:
                            'linear-gradient(135deg, rgba(127,29,29,0.08), rgba(127,29,29,0.03))',
                        }}
                      >
                        <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: 'rgba(24,24,27,0.54)' }}>
                          BUỔI HỌC TIẾP THEO
                        </Typography>
                        <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 900, color: '#5f1616' }}>
                          02:14:35
                        </Typography>
                      </Box>
                    </RightRailCard>

                    <RightRailCard title="Bài kiểm tra gần đây">
                      <Stack spacing={1.25}>
                        {recentAssessments.map((item) => (
                          <Stack
                            key={item.subject}
                            direction="row"
                            sx={{
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1.25,
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13.5, fontWeight: 800 }}>
                                {item.subject}
                              </Typography>
                              <Typography sx={{ mt: 0.4, fontSize: 12, color: 'rgba(24,24,27,0.48)' }}>
                                Điểm: {item.score}
                              </Typography>
                            </Box>
                            <Chip
                              label={item.status}
                              size="small"
                              sx={{
                                bgcolor: item.bg,
                                color: item.tone,
                                fontWeight: 900,
                              }}
                            />
                          </Stack>
                        ))}
                      </Stack>
                    </RightRailCard>

                    <RightRailCard title="Thống kê học tập">
                      <Stack spacing={1.5}>
                        {[
                          { label: 'Mục tiêu tuần', value: 85 },
                          { label: 'Hoàn thành module', value: 68 },
                          { label: 'Độ tập trung', value: 92 },
                        ].map((item) => (
                          <Box key={item.label}>
                            <Stack
                              direction="row"
                              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}
                            >
                              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                                {item.label}
                              </Typography>
                              <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: '#7f1d1d' }}>
                                {item.value}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={item.value}
                              sx={{
                                height: 8,
                                borderRadius: 2.8,
                                bgcolor: 'rgba(127,29,29,0.08)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 2.8,
                                  background:
                                    'linear-gradient(90deg, #aa1c1c 0%, #7f1d1d 100%)',
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </RightRailCard>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.25,
                        borderRadius: 2.8,
                        border: '1px solid rgba(17,17,17,0.08)',
                        bgcolor: '#fff',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <Typography sx={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>
                        Chứng chỉ tiêu biểu
                      </Typography>
                      <Box
                        sx={{
                          mt: 2,
                          p: 2.5,
                          borderRadius: 2.8,
                          bgcolor: 'rgba(17,17,17,0.02)',
                          border: '1px solid rgba(17,17,17,0.05)',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 2.8,
                            mx: 'auto',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#7f1d1d',
                            bgcolor: 'rgba(127,29,29,0.08)',
                            mb: 1.5,
                          }}
                        >
                          <AccessTimeRounded />
                        </Box>
                        <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
                          Chuong tr�nh L�nh d?o MBA
                        </Typography>
                        <Typography sx={{ mt: 0.6, fontSize: 12.5, color: 'rgba(24,24,27,0.48)' }}>
                          Hoàn thành tháng 01/2024
                        </Typography>
                      </Box>
                      <Typography sx={{ mt: 1.5, fontSize: 12.5, color: 'rgba(24,24,27,0.56)', lineHeight: 1.7 }}>
                        Chứng nhận này thể hiện năng lực lãnh đạo và tư duy chiến lược
                        trong môi trường điều hành hiện đại.
                      </Typography>
                    </Paper>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
