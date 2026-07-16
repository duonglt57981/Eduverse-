/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useParams } from "next/navigation";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { TrangThaiKhoaHoc } from "./courseEditCore";
import PhanService from "@/src/services/PhanService";
import BaiGiangService from "@/src/services/BaiGiangService";
import TaiLieuService from "@/src/services/TaiLieuService";
import BaiKiemTraService from "@/src/services/BaiKiemTraService";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";

// Helper unwrap
function unwrapApiData<T = any>(res: any): T | undefined {
  return (res?.data?.data ?? res?.data ?? undefined) as T | undefined;
}

function taoTempId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

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

  // CRUD Phan
  createPhan: (data: {
    tenPhan: string;
    mieuTa: string;
  }) => Promise<PhanHocType>;
  updatePhan: (
    phanId: string,
    data: { tenPhan: string; mieuTa: string },
  ) => Promise<void>;
  deletePhan: (phanId: string) => Promise<void>;

  // CRUD BaiGiang
  createBaiGiang: (
    phanId: string,
    data: { tieuDe: string; file?: File | null; isFree: boolean },
  ) => Promise<BaiGiangType>;
  updateBaiGiang: (
    phanId: string,
    baiGiangId: string,
    data: { tieuDe?: string; isFree?: boolean; file?: File | null },
  ) => Promise<void>;
  deleteBaiGiang: (phanId: string, baiGiangId: string) => Promise<void>;

  // CRUD BaiKiemTra
  createBaiKiemTra: (
    phanId: string,
    data: { tenBaiKiemTra: string; moTa: string; cauHois: any[] },
  ) => Promise<BaiKiemTraDto>;
  updateBaiKiemTra: (
    phanId: string,
    baiKiemTraId: string,
    data: { tenBaiKiemTra: string; moTa: string; cauHois: any[] },
  ) => Promise<void>;
  deleteBaiKiemTra: (phanId: string, baiKiemTraId: string) => Promise<void>;

  // CRUD TaiLieu
  createTaiLieu: (
    phanId: string,
    baiGiangId: string,
    file: File,
    tenTaiLieu?: string,
  ) => Promise<void>;
  deleteTaiLieu: (
    phanId: string,
    baiGiangId: string,
    taiLieuId: string,
  ) => Promise<void>;
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

export function CourseEditProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ corsesId: string }>();
  const idKhoaHoc = params?.corsesId || "";

  const [thongTin, setThongTinState] = useState<KhoaHocType>({} as KhoaHocType);
  const [phans, setPhans] = useState<PhanHocType[]>([]);
  const [trangThai, setTrangThai] = useState<TrangThaiKhoaHoc>("DangSua");
  const [lyDoTuChoi, setLyDoTuChoi] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Services
  const khoaHocService = useMemo(() => new KhoaHocService(), []);
  const phanService = useMemo(() => new PhanService(), []);
  const baiGiangService = useMemo(() => new BaiGiangService(), []);
  const taiLieuService = useMemo(() => new TaiLieuService(), []);
  const baiKiemTraService = useMemo(() => new BaiKiemTraService(), []);

  const setThongTin = useCallback((patch: Partial<KhoaHocType>) => {
    setThongTinState((prev) => ({ ...prev, ...patch }));
  }, []);

  // ---- Fetch data ----
  const fetchCourseInfo = useCallback(async () => {
    if (!idKhoaHoc) return;
    try {
      const data = await khoaHocService.GetToUpdateKhoaHoc(idKhoaHoc);
      if (data) {
        setThongTin({
          tieuDe: data.tieuDe || "",
          moTa: data.moTa || "",
          capDo: data.capDo || "",
          hinhAnhKhoaHoc: data.urlHinhAnh || "",
          gia: data.gia,
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin khóa học:", error);
    }
  }, [idKhoaHoc, khoaHocService, setThongTin]);

  const fetchSections = useCallback(async () => {
    if (!idKhoaHoc) return;
    try {
      const phanResult = await phanService.GetListPhanManager(idKhoaHoc);
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

            return {
              ...phanDto,
              DanhSachBaiGiang: baiGiangsWithTaiLieu,
              DanhDachBaiKiemTra: [],
            } as PhanHocType;
          }),
        );
        setPhans(phanHocList);
      } else {
        setPhans([]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách phần:", error);
      setPhans([]);
    }
  }, [idKhoaHoc, phanService, baiGiangService, taiLieuService]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchCourseInfo(), fetchSections()]);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchCourseInfo, fetchSections]);

  // ---- CRUD Phan ----
  const createPhan = useCallback(
    async (data: { tenPhan: string; mieuTa: string }): Promise<PhanHocType> => {
      const res = await phanService.CreatePhanHoc({ idKhoaHoc, ...data });
      if (res?.status === false)
        throw new Error(res.message || "Tạo phần thất bại");
      const raw = unwrapApiData<Partial<PhanHocType>>(res);
      const newPhan: PhanHocType = {
        ...raw,
        id: raw?.id ?? taoTempId("phan"),
        tenPhan: raw?.tenPhan ?? data.tenPhan,
        mieuTa: raw?.mieuTa ?? data.mieuTa,
        DanhSachBaiGiang: [],
        DanhDachBaiKiemTra: [],
      };
      setPhans((prev) => [...prev, newPhan]);
      return newPhan;
    },
    [idKhoaHoc, phanService],
  );

  const updatePhan = useCallback(
    async (phanId: string, data: { tenPhan: string; mieuTa: string }) => {
      // Sửa: service nhận object chứa id và data
      const res = await phanService.UpdatePhanHoc({ id: phanId, ...data });
      if (res.status === false)
        throw new Error(res.message || "Cập nhật phần thất bại");
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? { ...p, tenPhan: data.tenPhan, mieuTa: data.mieuTa }
            : p,
        ),
      );
    },
    [phanService],
  );

  const deletePhan = useCallback(
    async (phanId: string) => {
      const res = await phanService.DeletePhanHoc(phanId);
      if (res.status === false)
        throw new Error(res.message || "Xóa phần thất bại");
      setPhans((prev) => prev.filter((p) => p.id !== phanId));
    },
    [phanService],
  );

  // ---- CRUD BaiGiang ----
  const createBaiGiang = useCallback(
    async (
      phanId: string,
      data: { tieuDe: string; file?: File | null; isFree: boolean },
    ): Promise<BaiGiangType> => {
      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");
      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);

      const formData = new FormData();
      formData.append("idPhan", phanId);
      formData.append("tieuDe", data.tieuDe || "Bài giảng mới");
      formData.append("thuTuSapXep", String(soMucHienCo + 1));
      formData.append("laBaiGiangFree", data.isFree ? "true" : "false");
      if (data.file) formData.append("video", data.file);

      const res = await baiGiangService.CreateBaiGiang(formData as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo bài giảng thất bại");
      const raw = unwrapApiData<Partial<BaiGiangType>>(res);
      const newBg: BaiGiangType = {
        id: raw?.id ?? taoTempId("bg"),
        tieuDe: raw?.tieuDe || data.tieuDe || "Bài giảng mới",
        thuTuSapXep: raw?.thuTuSapXep ?? soMucHienCo + 1,
        urlBaiGiang: raw?.urlBaiGiang || "",
        thoiLuong: raw?.thoiLuong || 0,
        danhSachTaiLieu: [],
        laBaiGiangFree: raw?.laBaiGiangFree ?? data.isFree,
      };
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? { ...p, DanhSachBaiGiang: [...(p.DanhSachBaiGiang || []), newBg] }
            : p,
        ),
      );
      return newBg;
    },
    [phans, baiGiangService],
  );

  const updateBaiGiang = useCallback(
    async (
      phanId: string,
      baiGiangId: string,
      data: { tieuDe?: string; isFree?: boolean; file?: File | null },
    ) => {
      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");
      const bg = phan.DanhSachBaiGiang?.find((b) => b.id === baiGiangId);
      if (!bg) throw new Error("Không tìm thấy bài giảng");

      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
      formData.append("tieuDe", data.tieuDe ?? bg.tieuDe ?? "");
      formData.append(
        "laBaiGiangFree",
        (data.isFree ?? bg.laBaiGiangFree) ? "true" : "false",
      );
      formData.append("thuTuSapXep", String(bg.thuTuSapXep || 0));
      if (data.file) formData.append("video", data.file);

      const res = await baiGiangService.UpdateBaiGiang(formData as any);
      if (res.status === false)
        throw new Error(res.message || "Cập nhật bài giảng thất bại");

      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhSachBaiGiang: p.DanhSachBaiGiang?.map((b) =>
                  b.id === baiGiangId
                    ? {
                        ...b,
                        tieuDe: data.tieuDe ?? b.tieuDe,
                        laBaiGiangFree: data.isFree ?? b.laBaiGiangFree,
                        urlBaiGiang: res.data?.urlBaiGiang || b.urlBaiGiang,
                        thoiLuong: res.data?.thoiLuong ?? b.thoiLuong,
                      }
                    : b,
                ),
              }
            : p,
        ),
      );
    },
    [phans, baiGiangService],
  );

  const deleteBaiGiang = useCallback(
    async (phanId: string, baiGiangId: string) => {
      const res = await baiGiangService.DeleteBaiGiang(baiGiangId);
      if (res.status === false)
        throw new Error(res.message || "Xóa bài giảng thất bại");
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhSachBaiGiang: p.DanhSachBaiGiang?.filter(
                  (b) => b.id !== baiGiangId,
                ),
              }
            : p,
        ),
      );
    },
    [baiGiangService],
  );

  // ---- CRUD BaiKiemTra ----
  const createBaiKiemTra = useCallback(
    async (
      phanId: string,
      data: { tenBaiKiemTra: string; moTa: string; cauHois: any[] },
    ): Promise<BaiKiemTraDto> => {
      const payload = {
        idPhan: phanId,
        tenBaiKiemTra: data.tenBaiKiemTra || "Bài kiểm tra mới",
        moTa: data.moTa || "",
        danhSachCauHoi: data.cauHois.map((q, index) => ({
          noiDungCauHoi: q.noiDungCauHoi,
          loaiCauHoi: q.loaiCauHoi === "ONE" ? "ONE" : "MULTI",
          doKho: q.doKho,
          thuTuSapXep: index + 1,
          danhSachDapAn: q.danhSachDapAn.map((d: any, dIdx: number) => ({
            noiDungDapAn: d.noiDungDapAn,
            laDapAnDung: d.laDapAnDung,
            thuTuSapXep: dIdx + 1,
          })),
        })),
      };
      const res = await baiKiemTraService.CreateBaiKiemTra(payload as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo bài kiểm tra thất bại");
      const raw = unwrapApiData<any>(res);
      const newQuiz: BaiKiemTraDto = {
        id: raw?.id ?? taoTempId("kt"),
        tenBaiKiemTra: raw?.tenBaiKiemTra || payload.tenBaiKiemTra,
        moTa: raw?.moTa || payload.moTa,
        soCauHoi: raw?.soCauHoi || data.cauHois.length,
        cauHois:
          raw?.danhSachCauHoi?.map((q: any) => ({
            id: q.id,
            noiDungCauHoi: q.noiDungCauHoi,
            loaiCauHoi: q.loaiCauHoi,
            doKho: q.doKho,
            danhSachDapAn:
              q.danhSachDapAns?.map((d: any) => ({
                id: d.id,
                noiDungDapAn: d.noiDungDapAn,
                laDapAnDung: d.laDapAnDung,
              })) || [],
          })) || data.cauHois.map((q, idx) => ({ ...q, id: `q_${idx}` })),
      };
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhDachBaiKiemTra: [...(p.DanhDachBaiKiemTra || []), newQuiz],
              }
            : p,
        ),
      );
      return newQuiz;
    },
    [baiKiemTraService],
  );

  const updateBaiKiemTra = useCallback(
    async (
      phanId: string,
      baiKiemTraId: string,
      data: { tenBaiKiemTra: string; moTa: string; cauHois: any[] },
    ) => {
      const payload = {
        idBaiKiemTra: baiKiemTraId,
        tenBaiKiemTra: data.tenBaiKiemTra || "Bài kiểm tra",
        moTa: data.moTa || "",
        danhSachCauHoi: data.cauHois.map((q, index) => ({
          id: q.id,
          noiDungCauHoi: q.noiDungCauHoi,
          loaiCauHoi: q.loaiCauHoi === "ONE" ? "ONE" : "MULTI",
          doKho: q.doKho,
          thuTuSapXep: index + 1,
          danhSachDapAns: q.danhSachDapAn.map((d: any, dIdx: number) => ({
            id: d.id,
            noiDungDapAn: d.noiDungDapAn,
            laDapAnDung: d.laDapAnDung,
            thuTuSapXep: dIdx + 1,
          })),
        })),
      };
      const res = await baiKiemTraService.UpdateBaiKiemTra(payload as any);
      if (res.status === false)
        throw new Error(res.message || "Cập nhật bài kiểm tra thất bại");
      const updated = {
        id: baiKiemTraId,
        tenBaiKiemTra: payload.tenBaiKiemTra,
        moTa: payload.moTa,
        soCauHoi: data.cauHois.length,
        cauHois:
          res.data?.danhSachCauHoi?.map((q: any) => ({
            id: q.id,
            noiDungCauHoi: q.noiDungCauHoi,
            loaiCauHoi: q.loaiCauHoi,
            doKho: q.doKho,
            danhSachDapAn:
              q.danhSachDapAns?.map((d: any) => ({
                id: d.id,
                noiDungDapAn: d.noiDungDapAn,
                laDapAnDung: d.laDapAnDung,
              })) || [],
          })) || data.cauHois,
      };
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.map((kt) =>
                  kt.id === baiKiemTraId ? updated : kt,
                ),
              }
            : p,
        ),
      );
    },
    [baiKiemTraService],
  );

  const deleteBaiKiemTra = useCallback(
    async (phanId: string, baiKiemTraId: string) => {
      const res = await baiKiemTraService.DeleteBaiKiemTra(baiKiemTraId);
      if (res.status === false)
        throw new Error(res.message || "Xóa bài kiểm tra thất bại");
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.filter(
                  (kt) => kt.id !== baiKiemTraId,
                ),
              }
            : p,
        ),
      );
    },
    [baiKiemTraService],
  );

  // ---- CRUD TaiLieu ----
  const createTaiLieu = useCallback(
    async (
      phanId: string,
      baiGiangId: string,
      file: File,
      tenTaiLieu?: string,
    ) => {
      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
      const finalTen =
        tenTaiLieu && tenTaiLieu.trim() !== "" ? tenTaiLieu : file.name;
      formData.append("tenTaiLieu", finalTen);
      formData.append("document", file);

      const res = await taiLieuService.CreateTaiLieu(formData as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo tài liệu thất bại");
      const raw = unwrapApiData<Partial<TaiLieuType>>(res);
      const newDoc: TaiLieuType = {
        ...raw,
        id: raw?.id ?? taoTempId("tl"),
        tenTaiLieu: raw?.tenTaiLieu ?? finalTen,
      } as TaiLieuType;

      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhSachBaiGiang: p.DanhSachBaiGiang?.map((bg) =>
                  bg.id === baiGiangId
                    ? {
                        ...bg,
                        danhSachTaiLieu: [
                          ...(bg.danhSachTaiLieu || []),
                          newDoc,
                        ],
                      }
                    : bg,
                ),
              }
            : p,
        ),
      );
    },
    [taiLieuService],
  );

  const deleteTaiLieu = useCallback(
    async (phanId: string, baiGiangId: string, taiLieuId: string) => {
      const res = await taiLieuService.DeleteTaiLieu(taiLieuId);
      if (res.status === false)
        throw new Error(res.message || "Xóa tài liệu thất bại");
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhSachBaiGiang: p.DanhSachBaiGiang?.map((bg) =>
                  bg.id === baiGiangId
                    ? {
                        ...bg,
                        danhSachTaiLieu: bg.danhSachTaiLieu?.filter(
                          (tl: TaiLieuType) => tl.id !== taiLieuId,
                        ),
                      }
                    : bg,
                ),
              }
            : p,
        ),
      );
    },
    [taiLieuService],
  );

  // ---- Load lần đầu ----
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (idKhoaHoc) {
      refreshData().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKhoaHoc]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const value: CourseEditContextValue = {
    idKhoaHoc,
    thongTin,
    setThongTin,
    phans,
    setPhans,
    trangThai,
    setTrangThai,
    lyDoTuChoi,
    loading,
    refreshData,
    createPhan,
    updatePhan,
    deletePhan,
    createBaiGiang,
    updateBaiGiang,
    deleteBaiGiang,
    createBaiKiemTra,
    updateBaiKiemTra,
    deleteBaiKiemTra,
    createTaiLieu,
    deleteTaiLieu,
  };

  return (
    <CourseEditContext.Provider value={value}>
      {children}
    </CourseEditContext.Provider>
  );
}
