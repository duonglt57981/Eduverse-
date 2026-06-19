'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import StudentDashboardContent from '@/src/components/dashboard/StudentDashboardContent';

export default function StudentDashboardPage() {
  return (
    <AuthGuard allowedRoles={['HocVien']}>
      <DashboardShell>
        <StudentDashboardContent />
      </DashboardShell>
    </AuthGuard>
  );
}

