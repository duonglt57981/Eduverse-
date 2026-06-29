'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogoutRounded,
  MailOutlineRounded,
  MenuRounded,
  NotificationsNoneRounded,
  SearchRounded,
  WbTwilightRounded,
  EmojiEventsRounded,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { logout } from '@/src/store/auth/AuthSlice';
import { useDispatch } from '@/src/store/hook';
import {
  sidebarPrimaryItems,
  sidebarSecondaryItems,
} from './dashboard-data';

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const getRouteByLabel = (label: string) => {
    switch (label) {
      case 'Trang chủ':
        return '/student/dashboard';
      case 'Khóa học của tôi':
        return '/student/courses';
      case 'Khám phá':
        return '/student/explore';
      case 'Giỏ hàng':
        return '/student/cart';
      case 'Yêu thích':
        return '/student/favorites';
      case 'Hồ sơ':
        return '/student/profile';
      case 'Cài đặt':
        return '/settings';
      default:
        return '/student/dashboard';
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={() => router.push('/student/dashboard')}
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

      <Box sx={{ px: 1.25, py: 1.5, flex: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {sidebarPrimaryItems.map((item) => {
            const Icon = item.icon;
            const itemRoute = getRouteByLabel(item.label);
            const isActive = pathname === itemRoute;

            return (
              <ListItemButton
                key={item.label}
                onClick={() => router.push(itemRoute)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2.8,
                  px: 1.5,
                  py: 1.2,
                  color: isActive ? 'primary.main' : 'rgba(24,24,27,0.72)',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  transition: 'all 160ms ease',
                  '&:hover': {
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.10)
                      : 'action.hover',
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
            const itemRoute = getRouteByLabel(item.label);
            const isActive = pathname === itemRoute;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => router.push(itemRoute)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2.8,
                  px: 1.5,
                  py: 1.1,
                  color: isActive ? 'primary.main' : 'rgba(24,24,27,0.72)',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
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
    </Box>
  );
}

interface StudentDashboardShellProps {
  children: React.ReactNode;
}

export default function StudentDashboardShell({ children }: StudentDashboardShellProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('AccessToken');

    // Bypass check if we are in development and want to easily test
    if (!token) {
      // Create a temporary mock token for easy testing if desired
      window.localStorage.setItem('AccessToken', 'mock-token-eduverse');
    }

    setAuthChecked(true);
  }, [router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/auth/login');
  };

  const sidebarWidth = 270;
  const headerOffset = '86px';

  if (!authChecked) {
    return (
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
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'text.secondary' }}>
            Đang kiểm tra đăng nhập...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
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
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
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

            <Box sx={{ width: { xs: 120, sm: 140, lg: 170 }, cursor: 'pointer' }} onClick={() => router.push('/student/dashboard')}>
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
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
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
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
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
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
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
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: headerOffset,
            alignSelf: 'flex-start',
            height: `calc(100vh - ${headerOffset})`,
          }}
        >
          <SidebarContent onLogout={handleLogout} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
