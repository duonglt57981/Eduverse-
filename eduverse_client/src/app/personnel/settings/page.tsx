"use client";

import React from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import AccountSettings from "@/src/components/settings/AccountSettings";
import { Box, Typography } from "@mui/material";

export default function PersonnelSettingsPage() {
  return (
    <AuthGuard allowedRoles={["personnel", "Admin"]}>
      <DashboardShell>
        <Box
          sx={{
            px: { xs: 2.5, md: 4.5 },
            py: { xs: 3, md: 5 },
            width: "100%",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Box sx={{ mb: 3.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                letterSpacing: "-0.7px",
                mb: 1,
              }}
            >
              Hồ sơ cá nhân
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14.5 }}>
              Quản lý và cập nhật thông tin tài khoản cá nhân của bạn trên hệ thống EduVerse.
            </Typography>
          </Box>

          <AccountSettings />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
