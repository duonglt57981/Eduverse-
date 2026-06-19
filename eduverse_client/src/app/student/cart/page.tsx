'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import { Box, Typography, Paper } from '@mui/material';

export default function StudentCartPage() {
  return (
    <AuthGuard allowedRoles={['HocVien']}>
      <DashboardShell>
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
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#8D1313', mb: 2 }}>
            Giỏ hàng của tôi
          </Typography>
          <Typography sx={{ color: 'rgba(31,41,55,0.6)', lineHeight: 1.6 }}>
            Tính năng này đang được EduVerse phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
          </Typography>
        </Paper>
      </DashboardShell>
    </AuthGuard>
  );
}
