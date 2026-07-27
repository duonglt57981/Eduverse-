'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from '@/src/components/dashboard/StudentDashboardShell';
import CoursesPage from '@/src/components/landing/CoursesPage';

function ExploreContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() ?? '';

  return (
    <StudentDashboardShell>
      <CoursesPage key={keyword} initialSearch={keyword} />
    </StudentDashboardShell>
  );
}

function ExploreLoading() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <CircularProgress sx={{ color: '#8B1313' }} />
    </Box>
  );
}

export default function StudentExplorePage() {
  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <Suspense fallback={<ExploreLoading />}>
        <ExploreContent />
      </Suspense>
    </AuthGuard>
  );
}
