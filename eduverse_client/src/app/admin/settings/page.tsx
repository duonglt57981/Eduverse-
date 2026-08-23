"use client";

import React, { useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import AccountSettings from "@/src/components/settings/AccountSettings";
import SecuritySettings from "@/src/components/settings/SecuritySettings";
import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import { PersonRounded, SecurityRounded } from "@mui/icons-material";
import { useSelector } from "@/src/store/hook";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useSelector((state: any) => state.auth?.user);
  const isPersonnel = Boolean(
    user?.roles?.some((r: string) =>
      ["personnel", "nhanvien"].includes(r.toLowerCase()),
    ),
  );

  const tabs = [
    {
      id: 0,
      label: "Hồ sơ tài khoản",
      icon: <PersonRounded sx={{ fontSize: 20 }} />,
      component: <AccountSettings />,
    },
    {
      id: 1,
      label: "Bảo mật & Đăng nhập",
      icon: <SecurityRounded sx={{ fontSize: 20 }} />,
      component: <SecuritySettings />,
    },
  ];

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 3, md: 4.5 },
            maxWidth: 1200,
            mx: "auto",
            width: "100%",
          }}
        >
          {/* Header Title Section */}
          <Box sx={{ mb: 3.5 }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", mb: 0.75, flexWrap: "wrap", gap: 1 }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: CSSVAR.textPrimary,
                  letterSpacing: "-0.6px",
                  fontSize: { xs: 26, sm: 32 },
                }}
              >
                {isPersonnel
                  ? "Thông tin tài khoản cá nhân"
                  : "Cài đặt hệ thống"}
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: isPersonnel ? "#F3E8FF" : "#FEF2F2",
                  border: isPersonnel
                    ? "1px solid #C084FC"
                    : "1px solid #FCA5A5",
                  borderRadius: "8px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: isPersonnel ? "#7C3AED" : "#8B1313",
                  }}
                >
                  {isPersonnel ? "NHÂN VIÊN KIỂM DUYỆT" : "SUPER ADMIN"}
                </Typography>
              </Box>
            </Stack>
            <Typography
              sx={{
                color: CSSVAR.textSecondary,
                fontSize: 14.5,
                fontWeight: 500,
              }}
            >
              {isPersonnel
                ? "Quản lý và cập nhật thông tin tài khoản cá nhân của bạn trên hệ thống EduVerse."
                : "Quản lý hồ sơ cá nhân và bảo mật tài khoản của bạn."}
            </Typography>
          </Box>

          {/* Modern Segmented Navigation Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 0.75,
              mb: 4,
              borderRadius: "16px",
              border: "1px solid rgba(139,19,19,0.08)",
              bgcolor: CSSVAR.paper,
              display: "inline-flex",
              width: { xs: "100%", sm: "auto" },
              boxShadow: "0 4px 20px rgba(139,19,19,0.02)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ width: "100%" }}
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
                      borderRadius: "12px",
                      fontWeight: 800,
                      fontSize: 14,
                      textTransform: "none",
                      transition: "all 220ms cubic-bezier(0.4, 0, 0.2, 1)",
                      bgcolor: isActive ? BRAND.main : "transparent",
                      color: isActive ? "#FFFFFF" : CSSVAR.textSecondary,
                      boxShadow: isActive
                        ? "0 6px 18px rgba(139,19,19,0.22)"
                        : "none",
                      "&:hover": {
                        bgcolor: isActive ? "#7F1D1D" : "rgba(139,19,19,0.04)",
                        color: isActive ? "#FFFFFF" : BRAND.main,
                      },
                      "& .MuiButton-startIcon": {
                        color: isActive ? "#FFFFFF" : BRAND.main,
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
              animation: "fadeIn 240ms cubic-bezier(0.4, 0, 0.2, 1)",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(8px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {tabs[activeTab].component}
          </Box>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
