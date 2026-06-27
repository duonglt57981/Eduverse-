'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import StudentProfileContent from '@/src/components/dashboard/StudentProfileContent';

export default function StudentProfilePage() {
  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <DashboardShell>
        <StudentProfileContent />
      </DashboardShell>
    </AuthGuard>
  );
}
