"use client";

import CurriculumContent from "./components/CurriculumContent";
import { useCourseEdit } from "../components/CourseEditContext";

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
