'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  LogoutRounded,
  MailOutlineRounded,
  NotificationsNoneRounded,
  SearchRounded,
  SettingsRounded,
  ShoppingCartOutlined,
  FavoriteBorderOutlined,
  LanguageRounded,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  useTheme,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from '@mui/material';
import { logout } from '@/src/store/auth/AuthSlice';
import { useDispatch, useSelector } from '@/src/store/hook';

interface StudentDashboardShellProps {
  children: React.ReactNode;
}

export default function StudentDashboardShell({ children }: StudentDashboardShellProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const user = useSelector((state: any) => state.auth.user);
  const hoTen = user?.hoTen || 'Học viên EduVerse';
  const userInitials = hoTen.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  useEffect(() => {
    const token = window.localStorage.getItem('AccessToken');
    if (!token) {
      window.localStorage.setItem('AccessToken', 'mock-token-eduverse');
    }
    setAuthChecked(true);
  }, [router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/auth/login');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const headerOffset = '86px';

  const navItems = [
    { label: 'Khám phá', path: '/student/explore' },
  ];

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
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', width: '100%', minHeight: 52 }}
        >
          {/* Logo */}
          <Box 
            sx={{ width: { xs: 120, sm: 140, lg: 170 }, cursor: 'pointer', flexShrink: 0 }} 
            onClick={() => router.push('/student/dashboard')}
          >
            <Image
              src="/auth/img/logo_nentrang.png"
              alt="EduVerse"
              width={170}
              height={52}
              priority
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Nav Items (Khám phá, Khóa học của tôi, ...) */}
          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', lg: 'flex' }, flexShrink: 0 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  sx={{
                    color: isActive ? 'primary.main' : 'text.primary',
                    fontWeight: 400,
                    fontSize: 14,
                    textTransform: 'none',
                    px: 1.5,
                    minWidth: 'auto',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'transparent',
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          {/* Search Bar */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                width: '100%',
                maxWidth: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1.25,
                borderRadius: 50, // Pill shape like Udemy
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <SearchRounded sx={{ color: 'rgba(24,24,27,0.42)' }} />
              <InputBase
                placeholder="Tìm kiếm nội dung bất kỳ..."
                sx={{ flex: 1, fontSize: 14 }}
              />
            </Paper>
          </Box>

          {/* Right Actions */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <Button
              onClick={() => router.push('/student/profile')}
              sx={{
                display: { xs: 'none', lg: 'block' },
                color: 'text.primary',
                fontWeight: 600,
                fontSize: 14,
                textTransform: 'none',
                px: 1.5,
                '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
              }}
            >
              Trở thành Giảng viên
            </Button>

            <Button
              onClick={() => router.push('/student/courses/my-courses')}
              sx={{
                display: { xs: 'none', lg: 'block' },
                color: 'text.primary',
                fontWeight: 600,
                fontSize: 14,
                textTransform: 'none',
                px: 1.5,
                '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
              }}
            >
              Khóa học của tôi
            </Button>

            {[
              { icon: FavoriteBorderOutlined, path: '/student/favorites' },
              { icon: ShoppingCartOutlined, path: '/student/cart' },
              { icon: NotificationsNoneRounded, path: '#' }
            ].map(
              (item, index) => (
                <IconButton
                  key={index}
                  onClick={() => item.path !== '#' && router.push(item.path)}
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: 'transparent',
                    '&:hover': { color: theme.palette.primary.main },
                  }}
                >
                  <item.icon fontSize="small" />
                </IconButton>
              ),
            )}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pl: 0.5 }}>
              <Box
                onClick={handleMenuClick}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  '&:hover': {
                    opacity: 0.9,
                  }
                }}
              >
                {userInitials}
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    mt: 1.5,
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.08))',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0, // Udemy uses sharp edges for dropdowns usually, but let's keep 0 or small
                    minWidth: 280,
                    p: 0,
                    '& .MuiMenuItem-root': {
                      py: 1.2,
                      px: 2,
                      fontSize: 14,
                      color: 'text.primary',
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }
                  },
                }}
              >
                {/* Header User Info */}
                <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' } }} onClick={() => { handleMenuClose(); router.push('/student/profile'); }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 20,
                      bgcolor: '#1c1d1f',
                    }}
                  >
                    {userInitials}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, display: 'block', color: 'text.primary' }} noWrap>
                      {hoTen}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', display: 'block' }} noWrap>
                      {user?.email || 'user@eduverse.vn'}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 0 }} />
                
                <MenuItem onClick={() => { handleMenuClose(); router.push('/student/settings'); }}>
                  <ListItemIcon>
                    <SettingsRounded fontSize="small" />
                  </ListItemIcon>
                  Cài đặt
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                  <ListItemIcon>
                    <LogoutRounded fontSize="small" />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ pt: headerOffset, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
