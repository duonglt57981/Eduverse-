'use client';

import React, { useState } from 'react';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
} from '@mui/material';
import {
  PersonRounded,
  SecurityRounded,
} from '@mui/icons-material';

// Import Settings Components
import AccountSettings from '@/src/components/settings/AccountSettings';
import SecuritySettings from '@/src/components/settings/SecuritySettings';
import { BRAND, CSSVAR } from "@/src/theme/tokens";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = [
    {
      id: 0,
      label: 'Hồ sơ tài khoản',
      icon: <PersonRounded sx={{ fontSize: 20 }} />,
      component: <AccountSettings />,
    },
    {
      id: 1,
      label: 'Bảo mật & Đăng nhập',
      icon: <SecurityRounded sx={{ fontSize: 20 }} />,
      component: <SecuritySettings />,
    },
  ];

  return (
    <StudentDashboardShell>
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 3, md: 4.5 },
          maxWidth: 1200,
          mx: 'auto',
        }}
      >
        {/* Header Title Section */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: CSSVAR.textPrimary,
              letterSpacing: '-0.6px',
              fontSize: { xs: 26, sm: 32 },
              mb: 0.75,
            }}
          >
            Cài đặt hệ thống
          </Typography>
          <Typography
            sx={{
              color: CSSVAR.textSecondary,
              fontSize: 14.5,
              fontWeight: 500,
            }}
          >
            Quản lý hồ sơ cá nhân và bảo mật tài khoản của bạn.
          </Typography>
        </Box>

        {/* Modern Segmented Navigation Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 0.75,
            mb: 4,
            borderRadius: '16px',
            border: '1px solid rgba(139,19,19,0.08)',
            bgcolor: CSSVAR.paper,
            display: 'inline-flex',
            width: { xs: '100%', sm: 'auto' },
            boxShadow: '0 4px 20px rgba(139,19,19,0.02)',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: '100%' }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  startIcon={tab.icon}
                  disableRipple
                  sx={{
                    px: 3.5,
                    py: 1.25,
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: 14,
                    textTransform: 'none',
                    transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: isActive ? BRAND.main : 'transparent',
                    color: isActive ? '#FFFFFF' : CSSVAR.textSecondary,
                    boxShadow: isActive
                      ? '0 6px 18px rgba(139,19,19,0.22)'
                      : 'none',
                    '&:hover': {
                      bgcolor: isActive ? '#7F1D1D' : 'rgba(139,19,19,0.04)',
                      color: isActive ? '#FFFFFF' : BRAND.main,
                    },
                    '& .MuiButton-startIcon': {
                      color: isActive ? '#FFFFFF' : BRAND.main,
                    },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Stack>
        </Paper>

        {/* Settings Content Area */}
        <Box
          key={activeTab}
          sx={{
            animation: 'fadeIn 240ms cubic-bezier(0.4, 0, 0.2, 1)',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(8px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {tabs[activeTab].component}
        </Box>
      </Box>
    </StudentDashboardShell>
  );
}
