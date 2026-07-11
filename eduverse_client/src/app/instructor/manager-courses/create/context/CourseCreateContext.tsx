"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface CourseFormData {
  tieuDe?: string;
  giaGoc?: number;
  moTa?: string;
  img?: File | null;
  danhSachDanhMuc?: string[];
}

interface ContextType {
  formData: CourseFormData;
  setFormData: (data: Partial<CourseFormData>) => void;
}

const Context = createContext<ContextType | undefined>(undefined);

export function CourseCreateProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<CourseFormData>({});

  const setFormData = (data: Partial<CourseFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  return (
    <Context.Provider value={{ formData, setFormData }}>
      {children}
    </Context.Provider>
  );
}

export function useCourseCreate() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCourseCreate must be used within provider");
  return ctx;
}
