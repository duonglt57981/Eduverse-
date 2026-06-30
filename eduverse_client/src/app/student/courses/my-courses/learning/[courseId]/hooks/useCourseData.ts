// src/app/khoa-hoc/hooks/useCourseData.ts

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
        setError("Không tìm thấy ID khóa học");
        setLoading(false);
        return;
      }

      // Kiểm tra định dạng GUID
      const guidRegex = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
      if (!guidRegex.test(courseId)) {
        setError("ID khóa học không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await KhoaHocSvc.getLearningKhoaHoc(courseId);
        console.log("📦 [useCourseData] Full response:", res);

        // --- Lấy data từ nhiều vị trí có thể ---
        let data: KhoaHocType | null = null;

        if (res) {
          // Trường hợp res.data là object chính (như API trả về)
          if (
            res.data &&
            typeof res.data === "object" &&
            !Array.isArray(res.data)
          ) {
            data = res.data;
          }
          // Trường hợp res.result
          else if (res.result && typeof res.result === "object") {
            data = res.result;
          }
          // Trường hợp res chính là object (nếu API trả thẳng)
          else if (typeof res === "object" && !res.message) {
            data = res as KhoaHocType;
          }
        }

        if (!data) {
          console.warn(
            "⚠️ [useCourseData] Không tìm thấy dữ liệu trong response",
          );
          setError("Không tìm thấy dữ liệu khóa học");
          setKhoaHoc(null);
          setDanhSachTatCa([]);
          return;
        }

        console.log("✅ [useCourseData] Dữ liệu khóa học:", data);
        setKhoaHoc(data);

        const ds = flatten(data);
        setDanhSachTatCa(ds);
        console.log("📚 [useCourseData] Số bài giảng:", ds.length);
        console.log("📹 [useCourseData] URL video mẫu:", ds[0]?.urlBaiGiang);
      } catch (err) {
        console.error("❌ [useCourseData] Lỗi:", err);
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403) {
          setError("Bạn không có quyền truy cập.");
        } else if (status === 404) {
          setError("Không tìm thấy khóa học.");
        } else {
          setError("Có lỗi xảy ra. Vui lòng thử lại.");
        }
        setKhoaHoc(null);
        setDanhSachTatCa([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  return { khoaHoc, loading, error, danhSachTatCa, setDanhSachTatCa };
};
