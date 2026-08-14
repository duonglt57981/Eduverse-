"use client";

import { useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
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
  // id đăng ký lấy trực tiếp từ route param [courseId], khác với courseId
  // truyền tay vào sendProgress
  idDangKy: string;
}

export const useProgress = (): UseProgressReturn => {
  // Lấy id đăng ký từ route param [courseId] (tên param giữ nguyên trên URL,
  // nhưng bản chất giá trị là id đăng ký khóa học)
  const params = useParams();
  const idDangKy = (params?.courseId as string) || "";

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
  // courseId ở đây vẫn giữ nguyên như cũ: được truyền tay từ nơi gọi,
  // KHÔNG lấy từ idDangKy (route param) ở trên.
  const sendProgress = useCallback(
    async (baiGiangId: string, thoiGianXem: number, courseId: string) => {
      if (!courseId || !baiGiangId) return;

      // Lấy tiến độ hiện tại
      const current = progressMap.get(baiGiangId);
      const currentTime = current?.thoiGianXem ?? 0;

      // ✅ Chỉ gửi nếu thời gian mới LỚN HƠN thời gian đã lưu
      if (thoiGianXem <= currentTime) {
        return;
      }

      // Chống gọi trùng
      if (updatingRef.current[baiGiangId]) return;
      updatingRef.current[baiGiangId] = true;

      const thoiLuong = baiGiangInfoMap.get(baiGiangId)?.thoiLuong ?? 0;
      const nguongHoanThanh = thoiLuong * 0.9;

      // Giữ trạng thái hoàn thành nếu đã có, ngược lại tính dựa trên ngưỡng
      const optimisticCompleted =
        current?.daHoanThanh || thoiGianXem >= nguongHoanThanh;

      // Cập nhật optimistic
      setProgressMap((prev) => {
        const next = new Map(prev);
        next.set(baiGiangId, {
          daHoanThanh: optimisticCompleted,
          thoiGianXem: thoiGianXem,
        });
        return next;
      });

      try {
        const request: UpdateTienDoBaiGiangRequest = {
          idDangKyKhoaHoc: idDangKy,
          idBaiGiang: baiGiangId,
          thoiGianXem: Math.floor(thoiGianXem),
          LanCuoiXem: new Date(),
        };

        const response = await TienDoSvc.updateTienDoBaiGiang(request);

        // Cập nhật từ server, đảm bảo không giảm thời gian
        const serverTime = response?.thoiGianXem ?? thoiGianXem;
        const serverCompleted =
          response?.trangThai === "HoanThanh" ||
          (response?.thoiGianXem ?? 0) >= nguongHoanThanh;

        setProgressMap((prev) => {
          const next = new Map(prev);
          const prevData = next.get(baiGiangId);
          const finalTime = Math.max(prevData?.thoiGianXem ?? 0, serverTime);
          const finalCompleted = prevData?.daHoanThanh || serverCompleted;
          next.set(baiGiangId, {
            daHoanThanh: finalCompleted,
            thoiGianXem: finalTime,
          });
          return next;
        });
      } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err);
        // Không rollback vì đã cập nhật optimistic, lần gọi sau sẽ gửi thời gian lớn hơn
      } finally {
        delete updatingRef.current[baiGiangId];
      }
    },
    [progressMap, baiGiangInfoMap],
  );

  return {
    progressMap,
    setProgressMap,
    sendProgress,
    isBaiHoanThanh,
    initProgress,
    idDangKy,
  };
};
