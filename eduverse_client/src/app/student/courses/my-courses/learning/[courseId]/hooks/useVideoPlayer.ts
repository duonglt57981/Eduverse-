"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
}

export const useVideoPlayer = (): UseVideoPlayerReturn => {
  const [baiGiang, setBaiGiang] = useState<BaiGiangType | null>(null);
  const [phanDangMo, setPhanDangMo] = useState<Set<string>>(new Set());
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [coTiepTheo, setCoTiepTheo] = useState(false);
  const lastUpdateTimeRef = useRef<Record<string, number>>({});

  const chonBaiGiang = useCallback(
    (bg: BaiGiangType, danhSachTatCa: BaiGiangType[]) => {
      setBaiGiang(bg);
      if (bg.idPhan) setPhanDangMo(new Set([bg.idPhan]));
      lastUpdateTimeRef.current[bg.id!] = 0;
      const idx = danhSachTatCa.findIndex((b) => b.id === bg.id);
      setCurrentIdx(idx);
      setCoTiepTheo(idx !== -1 && idx < danhSachTatCa.length - 1);
    },
    [],
  );

  const handleTimeUpdate = useCallback(
    (ct: number, sendProgress: (id: string, time: number) => void) => {
      if (!baiGiang?.id) return;
      const last = lastUpdateTimeRef.current[baiGiang.id] ?? 0;
      if (ct - last >= 10) {
        lastUpdateTimeRef.current[baiGiang.id] = ct;
        sendProgress(baiGiang.id, ct);
      }
    },
    [baiGiang],
  );

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
  };
};
