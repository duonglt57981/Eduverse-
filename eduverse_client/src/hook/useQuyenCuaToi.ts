import { useState, useEffect } from "react";
import LoiMoiGiangVienService, {
  QuyenCuaToiDto,
} from "@/src/services/LoiMoiGiangVienService";

export function useQuyenCuaToi(idKhoaHoc: string) {
  const [quyen, setQuyen] = useState<QuyenCuaToiDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idKhoaHoc) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    LoiMoiGiangVienService.GetQuyenCuaToi(idKhoaHoc)
      .then((data) => {
        if (active) setQuyen(data);
      })
      .catch(() => {
        if (active) setQuyen(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [idKhoaHoc]);

  // Chủ sở hữu luôn coi như có mọi quyền (bypass), khớp với logic backend
  const coQuyen = (key: keyof QuyenCuaToiDto) =>
    !!quyen?.laChuSoHuu || !!quyen?.[key];

  return { quyen, loading, coQuyen };
}
