"use client";

import AuthGuard from "@/src/components/AuthGuard";
import StudentHomeShell from "@/src/components/dashboard/StudentHomeShell";
import StudentHomeContent from "@/src/components/dashboard/StudentHomeContent";

export default function StudentDashboardPage() {
  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentHomeShell>
        <StudentHomeContent />
      </StudentHomeShell>
    </AuthGuard>
  );
}
