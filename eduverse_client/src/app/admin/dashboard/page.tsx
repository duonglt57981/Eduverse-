'use client';

import AuthGuard from '@/src/components/AuthGuard';
import DashboardShell from '@/src/components/dashboard/DashboardShell';
import AdminDashboardContent from '@/src/components/dashboard/AdminDashboardContent';

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={['Admin']}>
      <DashboardShell>
        <AdminDashboardContent />
      </DashboardShell>
    </AuthGuard>
  );
}
