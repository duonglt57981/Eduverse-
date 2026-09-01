"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { BRAND } from "@/src/theme/tokens";

export default function PersonnelCoursesHubPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/personnel/approve-courses");
  }, [router]);

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <DashboardShell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress sx={{ color: BRAND.main }} />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
