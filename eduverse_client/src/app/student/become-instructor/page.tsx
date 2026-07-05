'use client';

import AuthGuard from '@/src/components/AuthGuard';
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import StudentProfileContent from '@/src/components/dashboard/StudentProfileContent';

export default function StudentBecomeInstructorPage() {
  return (
    <AuthGuard allowedRoles={['HocVien', 'GiaoVien']}>
      <StudentDashboardShell>
        <StudentProfileContent onlyBecomeInstructor={true} />
      </StudentDashboardShell>
    </AuthGuard>
  );
}
