'use client';

import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import { Box, Typography, Paper } from "@mui/material";

export default function Page() {
  return (
    <StudentDashboardShell>
      <Box sx={{ px: { xs: 2, md: 3.5 }, py: { xs: 2.5, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#19171c', letterSpacing: '-0.6px' }}>
            Quản lý danh mục
          </Typography>
        </Box>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4.5, 
            borderRadius: '24px', 
            border: '1px solid rgba(141,19,19,0.06)',
            bgcolor: '#ffffff',
            boxShadow: '0 10px 30px rgba(141,19,19,0.015)'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#8B1313', mb: 2 }}>
            Quản lý danh mục
          </Typography>
          <Typography sx={{ color: 'rgba(31,41,55,0.6)', lineHeight: 1.6 }}>
            Tính năng này đang được EduVerse phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
          </Typography>
        </Paper>
      </Box>
    </StudentDashboardShell>
  );
}
