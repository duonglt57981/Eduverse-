'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import { Typography, Paper } from '@mui/material';
import { BRAND, CSSVAR } from "@/src/theme/tokens";

export default function AdminLecturesPage() {
  return (
    <AuthGuard allowedRoles={['Admin']}>
      <DashboardShell>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4.5, 
            borderRadius: '24px', 
            border: '1px solid rgba(141,19,19,0.06)',
            bgcolor: CSSVAR.paper,
            boxShadow: '0 10px 30px rgba(141,19,19,0.015)'
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 900, color: BRAND.main, mb: 2 }}>
            Quản lý bài giảng
          </Typography>
          <Typography sx={{ color: 'var(--ev-text-secondary, rgba(31,41,55,0.6))', lineHeight: 1.6 }}>
            Tính năng này đang được EduVerse phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
          </Typography>
        </Paper>
      </DashboardShell>
    </AuthGuard>
  );
}
