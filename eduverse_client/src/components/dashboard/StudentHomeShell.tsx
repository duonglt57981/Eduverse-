/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography } from "@mui/material";
import StudentHomeHeader from "./StudentHomeHeader";
import { LAYOUT_SPACING, PAGE_SPACING } from "@/src/theme/tokens";

interface StudentHomeShellProps {
  children: React.ReactNode;
}

export default function StudentHomeShell({ children }: StudentHomeShellProps) {
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

  const headerOffset = "74px";

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
            maxWidth: LAYOUT_SPACING.containerMaxWidthWide,
            mx: "auto",
            px: PAGE_SPACING.px,
            mt: PAGE_SPACING.mt,
            pb: LAYOUT_SPACING.pagePy,
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
