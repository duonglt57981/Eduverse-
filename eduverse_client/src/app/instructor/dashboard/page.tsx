'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';

export default function InstructorDashboardPage() {
  return (
    <AuthGuard allowedRoles={['GiaoVien']}>
      <DashboardShell />
    </AuthGuard>
  );
}
