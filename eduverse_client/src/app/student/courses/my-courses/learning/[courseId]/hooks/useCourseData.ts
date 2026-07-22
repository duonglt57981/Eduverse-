// src/app/khoa-hoc/hooks/useCourseData.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";

const KhoaHocSvc = new KhoaHocService();

// Interface khớp với response thực tế từ BE (camelCase)
// Không sửa file type gốc, chỉ dùng nội bộ trong hook này
interface PhanHocApi {
  id?: string;
  tenPhan?: string;
  thuTuSapXep?: number;
  danhSachBaiGiang?: BaiGiangType[];
  danhSachBaiKiemTra?: BaiKiemTraDto[];
}

interface UseCourseDataReturn {
  khoaHoc: KhoaHocType | null;
  loading: boolean;
  error: string;
  danhSachTatCa: BaiGiangType[];
  setDanhSachTatCa: (data: BaiGiangType[]) => void;
  // Thêm để dùng trong page.tsx
  getPhanHocApi: () => PhanHocApi[];
}

export const useCourseData = (
  courseId: string | undefined,
): UseCourseDataReturn => {
  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);
  const [phanHocApi, setPhanHocApi] = useState<PhanHocApi[]>([]);

  const flatten = useCallback((phanHocs: PhanHocApi[]): BaiGiangType[] => {
    return phanHocs.flatMap((p) => p.danhSachBaiGiang ?? []);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) {
        setError("Không tìm thấy ID khóa học");
        setLoading(false);
        return;
      }

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

        let data: KhoaHocType | null = null;

        if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) {
          data = res.data;
        }

        if (!data) {
          console.warn("⚠️ [useCourseData] Không tìm thấy dữ liệu trong response");
          setError("Không tìm thấy dữ liệu khóa học");
          setKhoaHoc(null);
          setDanhSachTatCa([]);
          setPhanHocApi([]);
          return;
        }

        console.log("✅ [useCourseData] Dữ liệu khóa học:", data);
        setKhoaHoc(data);

        // Cast sang PhanHocApi[] để dùng đúng field camelCase từ BE
        const phans = (data.danhSachPhanHoc as unknown as PhanHocApi[]) ?? [];
        setPhanHocApi(phans);

        const ds = flatten(phans);
        setDanhSachTatCa(ds);
        console.log("📚 [useCourseData] Số bài giảng:", ds.length);
        console.log("📹 [useCourseData] URL video mẫu:", ds[0]?.urlBaiGiang);
      } catch (err) {
        console.error("❌ [useCourseData] Lỗi:", err);
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          setError("Bạn không có quyền truy cập.");
        } else if (status === 404) {
          setError("Không tìm thấy khóa học.");
        } else {
          setError("Có lỗi xảy ra. Vui lòng thử lại.");
        }
        setKhoaHoc(null);
        setDanhSachTatCa([]);
        setPhanHocApi([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const getPhanHocApi = useCallback(() => phanHocApi, [phanHocApi]);

  return { khoaHoc, loading, error, danhSachTatCa, setDanhSachTatCa, getPhanHocApi };
};