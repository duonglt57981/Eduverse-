"use client";

import { useCourseEdit } from "../components/CourseEditContext";
import CurriculumContent from "../components/CurriculumContent";

export default function CurriculumPage() {
  const { phans, setPhans, idKhoaHoc } = useCourseEdit();

  return (
    <CurriculumContent
      phans={phans}
      onDoiPhans={setPhans}
      idKhoaHoc={idKhoaHoc}
    />
  );
}
