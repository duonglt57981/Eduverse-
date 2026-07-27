// src/app/khoa-hoc/hooks/useVideoPlayer.ts

"use client";

import { useState, useCallback, useRef } from "react";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";

interface UseVideoPlayerReturn {
  baiGiang: BaiGiangType | null;
  setBaiGiang: (bg: BaiGiangType | null) => void;
  currentIdx: number;
  coTiepTheo: boolean;
  chonBaiGiang: (bg: BaiGiangType, danhSachTatCa: BaiGiangType[]) => void;
  phanDangMo: Set<string>;
  setPhanDangMo: React.Dispatch<React.SetStateAction<Set<string>>>;
  idPhanPlay: string | undefined;
  handleTimeUpdate: (
    ct: number,
    sendProgress: (id: string, time: number) => void,
  ) => void;
  lastUpdateTimeRef: React.MutableRefObject<Record<string, number>>;
  /** Lưu thời gian hiện tại của video để đồng bộ khi chuyển đổi full/mini */
  currentTimeRef: React.MutableRefObject<number>;
  /** Lưu thời gian video cuối cùng để phục hồi khi remount */
  lastSavedTimeRef: React.MutableRefObject<number>;
  /** Cập nhật thời gian khi video unmount */
  updateLastSavedTime: (time: number) => void;
  /** Lấy thời gian đã lưu để truyền vào VideoPlayer khi mount */
  getSavedTime: () => number | undefined;
}

export const useVideoPlayer = (): UseVideoPlayerReturn => {
  const [baiGiang, setBaiGiang] = useState<BaiGiangType | null>(null);
  const [phanDangMo, setPhanDangMo] = useState<Set<string>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [coTiepTheo, setCoTiepTheo] = useState(false);
  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const currentTimeRef = useRef<number>(0);
  const lastSavedTimeRef = useRef<number>(0);

  const chonBaiGiang = useCallback(
    (bg: BaiGiangType, danhSachTatCa: BaiGiangType[]) => {
      setBaiGiang(bg);
      if (bg.idPhan) setPhanDangMo(new Set([bg.idPhan]));
      lastUpdateTimeRef.current[bg.id!] = 0;
      currentTimeRef.current = 0;
      lastSavedTimeRef.current = 0;
      const idx = danhSachTatCa.findIndex((b) => b.id === bg.id);
      setCurrentIdx(idx);
      setCoTiepTheo(idx !== -1 && idx < danhSachTatCa.length - 1);
    },
    [],
  );

  const handleTimeUpdate = useCallback(
    (ct: number, sendProgress: (id: string, time: number) => void) => {
      if (!baiGiang?.id) return;
      // Lưu thời gian hiện tại vào ref
      currentTimeRef.current = ct;
      const last = lastUpdateTimeRef.current[baiGiang.id] ?? 0;
      if (ct - last >= 10) {
        lastUpdateTimeRef.current[baiGiang.id] = ct;
        sendProgress(baiGiang.id, ct);
      }
    },
    [baiGiang],
  );

  const updateLastSavedTime = useCallback((time: number) => {
    lastSavedTimeRef.current = time;
  }, []);

  const getSavedTime = useCallback(() => {
    // Ưu tiên thời gian đã lưu từ lần unmount trước
    if (lastSavedTimeRef.current > 0) {
      return lastSavedTimeRef.current;
    }
    // Fallback: thời gian hiện tại trong ref
    if (currentTimeRef.current > 0) {
      return currentTimeRef.current;
    }
    return undefined;
  }, []);

  const idPhanPlay = baiGiang?.idPhan;

  return {
    baiGiang,
    setBaiGiang,
    currentIdx,
    coTiepTheo,
    chonBaiGiang,
    phanDangMo,
    setPhanDangMo,
    idPhanPlay,
    handleTimeUpdate,
    lastUpdateTimeRef,
    currentTimeRef,
    lastSavedTimeRef,
    updateLastSavedTime,
    getSavedTime,
  };
};
