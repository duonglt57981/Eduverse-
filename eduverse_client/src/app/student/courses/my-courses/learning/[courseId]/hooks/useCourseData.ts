"use client";

import { useState, useEffect, useCallback } from "react";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";

const KhoaHocSvc = new KhoaHocService();

interface UseCourseDataReturn {
  khoaHoc: KhoaHocType | null;
  loading: boolean;
  error: string;
  danhSachTatCa: BaiGiangType[];
  setDanhSachTatCa: (data: BaiGiangType[]) => void;
}

export const useCourseData = (
  courseId: string | undefined,
): UseCourseDataReturn => {
  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);

  const flatten = useCallback((d: KhoaHocType | null): BaiGiangType[] => {
    if (!d) return [];
    return d.danhSachPhanHoc?.flatMap((p) => p.danhSachBaiGiang ?? []) ?? [];
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) {
        setError("Không tìm thấy ID");
        setLoading(false);
        return;
      }
      if (!/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(courseId)) {
        setError("ID không đúng định dạng GUID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await KhoaHocSvc.getLearningKhoaHoc(courseId);
        const data = res?.data;

        if (!data) {
          setError("Không tìm thấy dữ liệu khóa học.");
          setKhoaHoc(null);
          setDanhSachTatCa([]);
          return;
        }

        setKhoaHoc(data);
        const ds = flatten(data);
        setDanhSachTatCa(ds);
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403) {
          setError("Bạn không có quyền truy cập.");
        } else if (status === 404) {
          setError("Không tìm thấy khóa học.");
        } else {
          setError("Có lỗi xảy ra. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  return { khoaHoc, loading, error, danhSachTatCa, setDanhSachTatCa };
};
