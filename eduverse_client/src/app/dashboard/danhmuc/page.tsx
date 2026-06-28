'use client';

import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import { Box, Typography, Paper } from "@mui/material";
import { CategoryRounded } from "@mui/icons-material";

export default function Page() {
  return (
    <StudentDashboardShell>
      <Box sx={{ px: { xs: 2, md: 3.5 }, py: { xs: 2.5, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#19171c', letterSpacing: '-0.6px' }}>
            Quản lý danh mục
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2.8, border: '1px solid rgba(17,17,17,0.08)', textAlign: 'center' }}>
          <CategoryRounded sx={{ fontSize: 48, color: '#7f1d1d', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Tính năng đang phát triển
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Giao diện Quản lý danh mục đang được xây dựng. Vui lòng quay lại sau.
          </Typography>
        </Paper>
      </Box>
    </StudentDashboardShell>
  );
}
