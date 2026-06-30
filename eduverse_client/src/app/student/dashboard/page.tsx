'use client';

import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import StudentDashboardContent from '@/src/components/dashboard/StudentDashboardContent';

export default function StudentDashboardPage() {
  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <StudentDashboardShell>
        <StudentDashboardContent/>
      </StudentDashboardShell>
    </AuthGuard>
  );
}

