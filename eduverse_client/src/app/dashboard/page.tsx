'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from '@/src/store/hook';
import { Box, CircularProgress } from '@mui/material';
import { BRAND, CSSVAR } from "@/src/theme/tokens";

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  const roles = useSelector((s) => s.auth.roles) || [];

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (roles.includes('Admin')) {
      router.replace('/admin/dashboard');
    } else if (roles.includes('GiaoVien')) {
      router.replace('/instructor/dashboard');
    } else {
      router.replace('/student/dashboard');
    }
  }, [user, roles, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: CSSVAR.bg,
      }}
    >
      <CircularProgress sx={{ color: BRAND.main }} />
    </Box>
  );
}
