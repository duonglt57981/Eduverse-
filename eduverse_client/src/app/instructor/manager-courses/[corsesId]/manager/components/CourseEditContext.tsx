"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { TrangThaiKhoaHoc } from "./courseEditCore";
import PhanService from "@/src/services/PhanService";
import BaiGiangService from "@/src/services/BaiGiangService";
import TaiLieuService from "@/src/services/TaiLieuService";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";

interface CourseEditContextValue {
  idKhoaHoc: string;
  thongTin: KhoaHocType;
  setThongTin: (patch: Partial<KhoaHocType>) => void;
  phans: PhanHocType[];
  setPhans: (phans: PhanHocType[]) => void;
  trangThai: TrangThaiKhoaHoc;
  setTrangThai: (trangThai: TrangThaiKhoaHoc) => void;
  lyDoTuChoi?: string | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const CourseEditContext = createContext<CourseEditContextValue | undefined>(
  undefined,
);

export function useCourseEdit(): CourseEditContextValue {
  const ctx = useContext(CourseEditContext);
  if (!ctx) {
    throw new Error(
      "useCourseEdit phải được dùng bên trong CourseEditProvider",
    );
  }
  return ctx;
}

export function CourseEditProvider({
  coursesId,
  children,
}: {
  coursesId: string;
  children: ReactNode;
}) {
  const [thongTin, setThongTinState] = useState<KhoaHocType>({} as KhoaHocType);
  const [phans, setPhans] = useState<PhanHocType[]>([]);
  const [trangThai, setTrangThai] = useState<TrangThaiKhoaHoc>("DangSua");
  const [lyDoTuChoi] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const khoaHocService = useMemo(() => new KhoaHocService(), []);
  const phanService = useMemo(() => new PhanService(), []);
  const baiGiangService = useMemo(() => new BaiGiangService(), []);
  const taiLieuService = useMemo(() => new TaiLieuService(), []);

  const setThongTin = useCallback((patch: Partial<KhoaHocType>) => {
    setThongTinState((truoc) => ({ ...truoc, ...patch }));
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await khoaHocService.GetToUpdateKhoaHoc(coursesId);

      if (data) {
        const khoaHoc: KhoaHocType = {
          id: data.id,
          tieuDe: data.tieuDe,
          moTa: data.moTa,
          gia: data.gia,
          giaGoc: data.giaGoc,
          capDo: data.capDo,
          hinhAnhKhoaHoc: data.urlHinhAnh,

          daDangKy: false,
          ngayDangKy: new Date(),
          soBaiGiangHoanThanh: 0,
          phanTramHoanThanh: 0,
        };

        setThongTinState(khoaHoc);
      }

      const phanResult = await phanService.GetListPhanManager(coursesId);
      if (phanResult?.status !== false && phanResult?.data) {
        const phanDtoList = phanResult.data;
        const phanHocList = await Promise.all(
          phanDtoList.map(async (phanDto) => {
            const phanId = phanDto.id!;
            const bgResult =
              await baiGiangService.GetListBaiGiangManager(phanId);
            const baiGiangs =
              bgResult?.status !== false ? bgResult?.data || [] : [];

            const baiGiangsWithTaiLieu = await Promise.all(
              baiGiangs.map(async (bg) => {
                const taiLieuResult =
                  await taiLieuService.GetListTaiLieuManager(bg.id!);
                const taiLieus =
                  taiLieuResult?.status !== false
                    ? taiLieuResult?.data || []
                    : [];
                return { ...bg, danhSachTaiLieu: taiLieus };
              }),
            );

            // Tạm thời để mảng rỗng cho bài kiểm tra
            const danhSachBaiKiemTra: BaiKiemTraDto[] = [];

            return {
              ...phanDto,
              DanhSachBaiGiang: baiGiangsWithTaiLieu,
              DanhDachBaiKiemTra: danhSachBaiKiemTra,
            } as PhanHocType;
          }),
        );
        setPhans(phanHocList);
      } else {
        setPhans([]);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu khóa học:", error);
    } finally {
      setLoading(false);
    }
  }, [coursesId, khoaHocService, phanService, baiGiangService, taiLieuService]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshData().catch(() => {});
  }, [refreshData]);

  return (
    <CourseEditContext.Provider
      value={{
        idKhoaHoc: coursesId,
        thongTin,
        setThongTin,
        phans,
        setPhans,
        trangThai,
        setTrangThai,
        lyDoTuChoi,
        loading,
        refreshData,
      }}
    >
      {children}
    </CourseEditContext.Provider>
  );
}
