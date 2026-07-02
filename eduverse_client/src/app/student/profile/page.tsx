'use client';

import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import StudentProfileContent from '@/src/components/dashboard/StudentProfileContent';

export default function StudentProfilePage() {
  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <StudentDashboardShell>
        <StudentProfileContent />
      </StudentDashboardShell>
    </AuthGuard>
  );
}
