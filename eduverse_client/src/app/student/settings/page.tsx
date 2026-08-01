'use client';

import React, { useState } from 'react';
import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import {
  PersonRounded,
  LockRounded,
  NotificationsRounded,
  ShieldRounded,
  LinkRounded,
} from '@mui/icons-material';

import AccountSettings from '@/src/components/settings/AccountSettings';
import SecuritySettings from '@/src/components/settings/SecuritySettings';
import NotificationSettings from '@/src/components/settings/NotificationSettings';
import PrivacySettings from '@/src/components/settings/PrivacySettings';
import LinkedAccountSettings from '@/src/components/settings/LinkedAccountSettings';

const settingsTabs = [
  { label: 'Tài khoản', icon: PersonRounded, description: 'Thông tin cá nhân, ảnh đại diện' },
  { label: 'Bảo mật', icon: LockRounded, description: 'Mật khẩu, xác thực 2 lớp' },
  { label: 'Thông báo', icon: NotificationsRounded, description: 'Email, push, SMS' },
  { label: 'Quyền riêng tư', icon: ShieldRounded, description: 'Hiển thị hồ sơ, dữ liệu' },
  { label: 'Liên kết tài khoản', icon: LinkRounded, description: 'Google, Facebook, GitHub' },
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      sx={{ flex: 1, minWidth: 0 }}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <StudentDashboardShell>
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.7px',
              mb: 0.75,
            }}
          >
            Cài đặt
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.6 }}>
            Quản lý tài khoản, bảo mật và các tùy chỉnh cá nhân trên EduVerse.
          </Typography>
        </Box>

        <Box>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2.8,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              mb: 3,
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
                minHeight: 54,
                '& .MuiTab-root': {
                  minHeight: 54,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'text.secondary',
                  px: 3,
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 800,
                  },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: 'primary.main',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              {settingsTabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={index}
                    icon={<Icon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                    label={tab.label}
                    id={`settings-tab-${index}`}
                    aria-controls={`settings-tabpanel-${index}`}
                  />
                );
              })}
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TabPanel value={activeTab} index={0}><AccountSettings /></TabPanel>
            <TabPanel value={activeTab} index={1}><SecuritySettings /></TabPanel>
            <TabPanel value={activeTab} index={2}><NotificationSettings /></TabPanel>
            <TabPanel value={activeTab} index={3}><PrivacySettings /></TabPanel>
            <TabPanel value={activeTab} index={4}><LinkedAccountSettings /></TabPanel>
          </Box>
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
