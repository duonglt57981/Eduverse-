'use client';

import React, { useState } from 'react';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import {
  Box,
  Typography,
  Grid,
  Stack,
  Tab,
  Tabs,
  Paper,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  alpha,
} from '@mui/material';
import {
  PersonRounded,
  SecurityRounded,
  PaletteRounded,
  NotificationsActiveRounded,
  ShieldRounded,
  LinkRounded,
} from '@mui/icons-material';

// Import Settings Components
import AccountSettings from '@/src/components/settings/AccountSettings';
import SecuritySettings from '@/src/components/settings/SecuritySettings';
import AppearanceSettings from '@/src/components/settings/AppearanceSettings';
import NotificationSettings from '@/src/components/settings/NotificationSettings';
import PrivacySettings from '@/src/components/settings/PrivacySettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const tabList = [
    { label: 'Tài khoản', icon: <PersonRounded fontSize="small" />, component: <AccountSettings /> },
    { label: 'Bảo mật', icon: <SecurityRounded fontSize="small" />, component: <SecuritySettings /> },
    { label: 'Giao diện', icon: <PaletteRounded fontSize="small" />, component: <AppearanceSettings /> },
    { label: 'Thông báo', icon: <NotificationsActiveRounded fontSize="small" />, component: <NotificationSettings /> },
    { label: 'Quyền riêng tư', icon: <ShieldRounded fontSize="small" />, component: <PrivacySettings /> },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <StudentDashboardShell>
      <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        {/* Tiêu đề trang */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.7px',
              mb: 1,
            }}
          >
            Cài đặt hệ thống
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14.5 }}>
            Quản lý hồ sơ cá nhân, bảo mật tài khoản, quyền riêng tư và tùy chỉnh giao diện học tập của bạn.
          </Typography>
        </Box>

        {isMobile ? (
          /* Giao diện Mobile: Tabs Nằm ngang, cuộn được */
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2.8,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTabs-indicator': {
                    bgcolor: 'primary.main',
                    height: 3,
                  },
                  '& .MuiTab-root': {
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'none',
                    py: 2,
                    color: 'text.secondary',
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                {tabList.map((tab, index) => (
                  <Tab
                    key={index}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Paper>

            <Box
              sx={{
                animation: 'fadeIn 200ms ease',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(6px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {tabList[activeTab]?.component || tabList[0]?.component}
            </Box>
          </Stack>
        ) : (
          /* Giao diện Desktop: Cột bên trái là danh sách Tab dọc, cột phải là Content */
          <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, md: 3.5, lg: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2.8,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  p: 1.5,
                  position: 'sticky',
                  top: '110px',
                }}
              >
                <Tabs
                  orientation="vertical"
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTabs-indicator': {
                      left: 0,
                      right: 'auto',
                      bgcolor: 'primary.main',
                      width: 3,
                      borderRadius: 1.5,
                    },
                    '& .MuiTab-root': {
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 14.5,
                      py: 1.5,
                      px: 2,
                      minHeight: 48,
                      borderRadius: 2,
                      color: 'text.secondary',
                      mb: 0.5,
                      transition: 'all 160ms ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                      },
                      '&.Mui-selected': {
                        color: 'primary.main',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                      },
                    },
                  }}
                >
                  {tabList.map((tab, index) => (
                    <Tab
                      key={index}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
              <Box
                sx={{
                  animation: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(12px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {tabList[activeTab]?.component || tabList[0]?.component}
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </StudentDashboardShell>
  );
}
