/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import DashboardHeader from "./DashboardHeader";

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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <DashboardHeader />

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
            maxWidth: 1400,
            mx: "auto",
            px: { xs: 2, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
