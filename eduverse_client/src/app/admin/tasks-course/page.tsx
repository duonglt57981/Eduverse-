import { redirect } from "next/navigation";

export default function LegacyCourseAssignmentPage() {
  redirect("/admin/approve-courses");
}
