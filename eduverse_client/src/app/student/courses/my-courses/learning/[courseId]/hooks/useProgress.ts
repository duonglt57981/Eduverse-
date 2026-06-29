"use client";

import { useState, useCallback, useRef } from "react";
import TienDoHocTapService from "@/src/services/TienDoHocTapService";
import { UpdateTienDoBaiGiangRequest } from "@/src/types/tienDoHocTap/Request/UpdateTienDoBaiGiangRequest";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";

const TienDoSvc = new TienDoHocTapService();

// --- Interface cho progress và thông tin bài giảng ---
interface ProgressData {
  daHoanThanh: boolean;
  thoiGianXem: number;
}

interface BaiGiangInfo {
  thoiLuong: number; // giây
}

interface UseProgressReturn {
  progressMap: Map<string, ProgressData>;
  setProgressMap: React.Dispatch<
    React.SetStateAction<Map<string, ProgressData>>
  >;
  sendProgress: (
    baiGiangId: string,
    thoiGianXem: number,
    courseId: string,
  ) => Promise<void>;
  isBaiHoanThanh: (bgId: string) => boolean;
  initProgress: (danhSachTatCa: BaiGiangType[]) => void;
}

export const useProgress = (): UseProgressReturn => {
  // State cho tiến độ của từng bài giảng
  const [progressMap, setProgressMap] = useState<Map<string, ProgressData>>(
    new Map(),
  );

  // State lưu thông tin bài giảng (cần thiết để tính ngưỡng)
  const [baiGiangInfoMap, setBaiGiangInfoMap] = useState<
    Map<string, BaiGiangInfo>
  >(new Map());

  // Ref chống gọi trùng lặp
  const updatingRef = useRef<Record<string, boolean>>({});

  // --- Kiểm tra hoàn thành ---
  const isBaiHoanThanh = useCallback(
    (bgId: string) => progressMap.get(bgId)?.daHoanThanh === true,
    [progressMap],
  );

  // --- Khởi tạo: lưu trạng thái ban đầu và thời lượng ---
  const initProgress = useCallback((danhSachTatCa: BaiGiangType[]) => {
    const initMap = new Map<string, ProgressData>();
    const infoMap = new Map<string, BaiGiangInfo>();

    for (const bg of danhSachTatCa) {
      if (bg.id) {
        initMap.set(bg.id, {
          daHoanThanh: bg.daHoanThanh === true,
          thoiGianXem: bg.thoiGianXem ?? 0,
        });
        infoMap.set(bg.id, {
          thoiLuong: bg.thoiLuong ?? 0,
        });
      }
    }

    setProgressMap(initMap);
    setBaiGiangInfoMap(infoMap);
  }, []);

  // --- Gửi tiến độ lên server ---
  const sendProgress = useCallback(
    async (baiGiangId: string, thoiGianXem: number, courseId: string) => {
      if (!courseId || !baiGiangId || updatingRef.current[baiGiangId]) return;
      updatingRef.current[baiGiangId] = true;

      // Lưu thời lượng để tính ngưỡng (phòng khi response không có trạng thái)
      const thoiLuong = baiGiangInfoMap.get(baiGiangId)?.thoiLuong ?? 0;
      const nguongHoanThanh = thoiLuong * 0.9; // 90%

      // Cập nhật optimistic (thời gian xem mới, giữ nguyên trạng thái cũ)
      setProgressMap((prev) => {
        const next = new Map(prev);
        const current = prev.get(baiGiangId);
        next.set(baiGiangId, {
          daHoanThanh: current?.daHoanThanh ?? false,
          thoiGianXem,
        });
        return next;
      });

      try {
        const request: UpdateTienDoBaiGiangRequest = {
          idDangKyKhoaHoc: courseId,
          idBaiGiang: baiGiangId,
          thoiGianXem: Math.floor(thoiGianXem),
          LanCuoiXem: new Date(),
        };

        // Gọi API (BE sẽ trả về TienDoHocTapDto hoặc tương tự)
        const response = await TienDoSvc.updateTienDoBaiGiang(request);

        // --- Xác định trạng thái hoàn thành từ response hoặc tự tính ---
        let daHoanThanh = false;
        let thoiGianXemMoi = thoiGianXem;

        if (response) {
          // Ưu tiên dữ liệu từ server nếu có
          daHoanThanh = response.trangThai === "HoanThanh";
          thoiGianXemMoi = response.thoiGianXem ?? thoiGianXem;
        } else {
          // Nếu không có response, tự tính dựa trên ngưỡng (chỉ khi đạt ngưỡng mới set HoanThanh)
          daHoanThanh = thoiGianXem >= nguongHoanThanh;
        }

        // Cập nhật state cuối cùng
        setProgressMap((prev) => {
          const next = new Map(prev);
          next.set(baiGiangId, {
            daHoanThanh,
            thoiGianXem: thoiGianXemMoi,
          });
          return next;
        });
      } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err);
        // Rollback về trạng thái cũ nếu có lỗi
        setProgressMap((prev) => {
          const next = new Map(prev);
          const current = prev.get(baiGiangId);
          if (current) {
            next.set(baiGiangId, {
              daHoanThanh: current.daHoanThanh,
              thoiGianXem: current.thoiGianXem,
            });
          }
          return next;
        });
      } finally {
        delete updatingRef.current[baiGiangId];
      }
    },
    [baiGiangInfoMap],
  );

  return {
    progressMap,
    setProgressMap,
    sendProgress,
    isBaiHoanThanh,
    initProgress,
  };
};
