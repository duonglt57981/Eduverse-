import { redirect } from "next/navigation";

interface CourseManagerPageProps {
  params: Promise<{
    corsesId: string;
  }>;
}

export default async function CourseManagerPage({
  params,
}: CourseManagerPageProps) {
  const { corsesId } = await params;

  redirect(`/instructor/manager-courses/${corsesId}/manager/curriculum`);
}
