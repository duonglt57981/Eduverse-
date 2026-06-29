'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import InstructorDashboardContent from '@/src/components/dashboard/InstructorDashboardContent';

export default function InstructorDashboardPage() {
  return (
    <AuthGuard allowedRoles={['GiaoVien']}>
      <DashboardShell>
        <InstructorDashboardContent />
      </DashboardShell>
    </AuthGuard>
  );
}
