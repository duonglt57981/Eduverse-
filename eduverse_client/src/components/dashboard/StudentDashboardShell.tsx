"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import StudentHomeHeader from "./StudentHomeHeader";

interface StudentDashboardShellProps {
  children: React.ReactNode;
}

export default function StudentDashboardShell({
  children,
}: StudentDashboardShellProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("AccessToken");
    if (!token) {
      window.localStorage.setItem("AccessToken", "mock-token-eduverse");
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthChecked(true);
  }, [router]);

  const headerOffset = "86px";

  if (!authChecked) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2.8,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography
            sx={{ fontSize: 14, fontWeight: 800, color: "text.secondary" }}
          >
            Đang kiểm tra đăng nhập...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        transition: "background-color 200ms ease, color 200ms ease",
        "--dashboard-surface": (theme) => theme.palette.background.paper,
        "--dashboard-surface-raised": (theme) =>
          theme.palette.mode === "dark" ? "#20252D" : "#F7F5F2",
        "--dashboard-surface-muted": (theme) =>
          theme.palette.mode === "dark" ? "#252B34" : "#FBFAF9",
        "--dashboard-border": (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.10)"
            : "#ECE7E4",
        "--dashboard-border-strong": (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.16)"
            : "#E5E0DC",
        "--dashboard-text-primary": (theme) => theme.palette.text.primary,
        "--dashboard-text-secondary": (theme) => theme.palette.text.secondary,
        "--dashboard-text-muted": (theme) =>
          theme.palette.mode === "dark" ? "#7F8998" : "#9AA0A6",
        "--dashboard-primary-tint": (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(203,62,62,0.16)"
            : "#FBEFEF",
        "--dashboard-primary-border": (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(203,62,62,0.34)"
            : "#F0DEDE",
        "--dashboard-info-tint": (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(2,132,199,0.18)"
            : "#E4F1F8",
        "--dashboard-success-tint": (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(16,185,129,0.16)"
            : "#E9F9F1",
      }}
    >
      <StudentHomeHeader />

      <Box
        sx={{
          pt: headerOffset,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: "100%",
            mx: "auto",
            px: { xs: 2, md: 6 },
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
