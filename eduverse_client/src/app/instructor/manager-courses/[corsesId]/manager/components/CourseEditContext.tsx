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
  useRef,
} from "react";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { TrangThaiKhoaHoc, ThongTinKhoaHocCoBan } from "./courseEditCore";
import PhanService from "@/src/services/PhanService";
import BaiGiangService from "@/src/services/BaiGiangService";
import TaiLieuService from "@/src/services/TaiLieuService";
import BaiKiemTraService from "@/src/services/BaiKiemTraService";
import {
  BaiKiemTraDto,
  CauHoiDto,
} from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import { BaiGiangDto } from "@/src/types/khoaHoc";
import {
  CreateCauHoiRequest,
  UpdateCauHoiRequest,
} from "@/src/types/baiKiemTra/Request/QuizzRequest";

function unwrapApiData<T = any>(res: any): T | undefined {
  return (res?.data?.data ?? res?.data ?? undefined) as T | undefined;
}

function taoTempId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function isValidGuid(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

function taoGuidMoi(): string {
  return uuidv4();
}

function chuanHoaId(id: unknown): string {
  return isValidGuid(id) ? (id as string) : taoGuidMoi();
}

const courseEditStore = new Map<string, any>();

interface CourseEditContextValue {
  idKhoaHoc: string;
  thongTin: ThongTinKhoaHocCoBan;
  setThongTin: (patch: ThongTinKhoaHocCoBan) => void;
  phans: PhanHocType[];
  setPhans: (phans: PhanHocType[]) => void;
  trangThai: TrangThaiKhoaHoc;
  setTrangThai: (trangThai: TrangThaiKhoaHoc) => void;
  lyDoTuChoi?: string | null;
  loading: boolean;
  isReadOnly: boolean;
  refreshData: () => Promise<void>;
  saveState: () => void;
  restoreState: () => void;
  clearState: () => void;
  isDirty: boolean;
  markDirty: () => void;
  markClean: () => void;
  resetDirty: () => void;
  saveAndNavigate: (destination: string) => void;
  isNavigating: boolean;
  setNavigating: (value: boolean) => void;

  createPhan: (data: {
    tenPhan: string;
    mieuTa: string;
    thuTuSapXep?: number;
  }) => Promise<PhanHocType>;
  updatePhan: (
    phanId: string,
    data: { tenPhan: string; mieuTa: string; thuTuSapXep?: number },
  ) => Promise<void>;
  deletePhan: (phanId: string) => Promise<void>;

  createBaiGiang: (
    phanId: string,
    data: {
      tieuDe: string;
      file?: File | null;
      isFree: boolean;
      thuTuSapXep?: number;
    },
  ) => Promise<BaiGiangType>;
  createMultipleBaiGiang: (
    phanId: string,
    lectures: { tieuDe: string; file?: File | null; isFree: boolean }[],
    onProgress?: (progress: {
      current: number;
      total: number;
      tieuDe: string;
      status: "uploading" | "completed" | "error";
      error?: string;
    }) => void,
  ) => Promise<{
    success: BaiGiangType[];
    errors: { tieuDe: string; error: string }[];
  }>;
  updateBaiGiang: (
    phanId: string,
    baiGiangId: string,
    data: {
      tieuDe?: string;
      isFree?: boolean;
      file?: File | null;
      thuTuSapXep?: number;
    },
  ) => Promise<void>;
  deleteBaiGiang: (phanId: string, baiGiangId: string) => Promise<void>;

  createBaiKiemTra: (
    phanId: string,
    data: { tenBaiKiemTra: string; moTa: string; thuTuSapXep?: number },
  ) => Promise<BaiKiemTraDto>;
  updateBaiKiemTra: (
    baiKiemTraId: string,
    data: {
      tenBaiKiemTra: string;
      moTa: string;
      thuTuSapXep?: number;
    },
  ) => Promise<void>;
  deleteBaiKiemTra: (phanId: string, baiKiemTraId: string) => Promise<void>;

  createCauHoi: (
    phanId: string,
    baiKiemTraId: string,
    data: {
      noiDungCauHoi: string;
      loaiCauHoi: "ONE" | "MULTI";
      doKho: string;
      danhSachDapAn: {
        noiDungDapAn: string;
        laDapAnDung: boolean;
        thuTuSapXep?: number;
      }[];
    },
  ) => Promise<CauHoiDto>;
  updateCauHoi: (
    phanId: string,
    baiKiemTraId: string,
    cauHoiId: string,
    data: {
      noiDungCauHoi: string;
      loaiCauHoi: "ONE" | "MULTI";
      doKho: string;
      danhSachDapAn: {
        id?: string;
        noiDungDapAn: string;
        laDapAnDung: boolean;
        thuTuSapXep?: number;
      }[];
    },
  ) => Promise<CauHoiDto>;
  deleteCauHoi: (
    phanId: string,
    baiKiemTraId: string,
    cauHoiId: string,
  ) => Promise<void>;

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

  loadQuizzesForSection: (phanId: string) => Promise<void>;
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
  const stateKey = useMemo(() => `course_edit_${idKhoaHoc}`, [idKhoaHoc]);

  const [thongTin, setThongTinState] = useState<ThongTinKhoaHocCoBan>({});
  const [phans, setPhans] = useState<PhanHocType[]>([]);
  const [trangThai, setTrangThai] = useState<TrangThaiKhoaHoc>("DangSua");
  const [lyDoTuChoi, setLyDoTuChoi] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDirty, setIsDirty] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const initialDataRef = useRef<{
    thongTin: ThongTinKhoaHocCoBan;
    phans: PhanHocType[];
  } | null>(null);
  const initialFetchDone = useRef(false);

  const khoaHocService = useMemo(() => new KhoaHocService(), []);
  const phanService = useMemo(() => new PhanService(), []);
  const baiGiangService = useMemo(() => new BaiGiangService(), []);
  const taiLieuService = useMemo(() => new TaiLieuService(), []);
  const baiKiemTraService = useMemo(() => new BaiKiemTraService(), []);

  const markDirty = useCallback(() => {
    if (trangThai === "DangSua") {
      setIsDirty(true);
    }
  }, [trangThai]);

  const markClean = useCallback(() => {
    setIsDirty(false);
    initialDataRef.current = {
      thongTin: { ...thongTin },
      phans: JSON.parse(JSON.stringify(phans)),
    };
  }, [thongTin, phans]);

  const resetDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  const setThongTin = useCallback(
    (patch: ThongTinKhoaHocCoBan) => {
      setThongTinState((prev) => {
        const newState = { ...prev, ...patch };
        return newState;
      });
      if (trangThai === "DangSua") {
        setIsDirty(true);
      }
    },
    [trangThai],
  );

  const setPhansWrapper = useCallback(
    (newPhans: PhanHocType[]) => {
      setPhans(newPhans);
      if (trangThai === "DangSua") {
        setIsDirty(true);
      }
    },
    [trangThai],
  );

  const saveAndNavigate = useCallback(
    (destination: string) => {
      if (idKhoaHoc) {
        courseEditStore.set(stateKey, {
          thongTin,
          phans,
          lyDoTuChoi,
          timestamp: Date.now(),
        });
      }
      setIsDirty(false);
      window.location.href = destination;
    },
    [idKhoaHoc, stateKey, thongTin, phans, lyDoTuChoi],
  );

  const setNavigating = useCallback((value: boolean) => {
    setIsNavigating(value);
  }, []);

  const saveState = useCallback(() => {
    if (!idKhoaHoc) return;
    courseEditStore.set(stateKey, {
      thongTin,
      phans,
      lyDoTuChoi,
      timestamp: Date.now(),
    });
  }, [idKhoaHoc, stateKey, thongTin, phans, lyDoTuChoi]);

  const restoreState = useCallback(() => {
    if (!idKhoaHoc) return false;
    const saved = courseEditStore.get(stateKey);
    if (saved) {
      setThongTinState(saved.thongTin || {});
      setPhans(saved.phans || []);
      setLyDoTuChoi(saved.lyDoTuChoi || null);
      setIsDirty(false);
      return true;
    }
    return false;
  }, [idKhoaHoc, stateKey]);

  const clearState = useCallback(() => {
    if (!idKhoaHoc) return;
    courseEditStore.delete(stateKey);
    setIsDirty(false);
  }, [idKhoaHoc, stateKey]);

  const loadQuizzesForSection = useCallback(
    async (phanId: string) => {
      try {
        const res = await baiKiemTraService.GetListForManager(phanId);
        const rawList: any = (res as any)?.data?.data ?? res?.data;
        if (res.status !== false && rawList) {
          const mappedList = rawList.map((item: any) => ({
            ...item,
            cauHois: (item.danhSachCauHois || []).map((q: any) => ({
              id: chuanHoaId(q.id),
              noiDungCauHoi: q.noiDungCauHoi || q.tenCauHoi || "",
              loaiCauHoi: q.loaiCauHoi || "ONE",
              doKho: q.doKho || "TrungBinh",
              danhSachDapAn: (q.danhSachDapAns || []).map((d: any) => ({
                id: chuanHoaId(d.id),
                noiDungDapAn: d.noiDungDapAn || "",
                laDapAnDung: d.laDapAnDung || false,
                thuTuSapXep: d.thuTuSapXep || 0,
              })),
            })),
            soCauHoi: (item.danhSachCauHois || []).length,
          }));
          setPhans((prevPhans) =>
            prevPhans.map((p) =>
              p.id === phanId
                ? {
                    ...p,
                    DanhDachBaiKiemTra: mappedList,
                  }
                : p,
            ),
          );
        }
      } catch (err) {
        console.error("Lỗi tải bài kiểm tra cho phần", phanId, err);
      }
    },
    [baiKiemTraService],
  );

  const fetchCourseInfo = useCallback(async () => {
    if (!idKhoaHoc) return;
    try {
      const data = await khoaHocService.GetToUpdateKhoaHoc(idKhoaHoc);
      if (data) {
        setThongTinState({
          tieuDe: data.tieuDe || "",
          moTa: data.moTa || "",
          capDo: data.capDo || "",
          hinhAnhKhoaHoc: data.urlHinhAnh || "",
          giaGoc: data.giaGoc,
          trangThai: data.trangThai || "",
          trangThaiPheDuyet: data.trangThaiPheDuyet || "",
        });

        if (data.trangThaiPheDuyet) {
          setTrangThai(data.trangThaiPheDuyet as TrangThaiKhoaHoc);
        } else {
          setTrangThai("DangSua");
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin khóa học:", error);
    }
  }, [idKhoaHoc, khoaHocService]);

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

            let quizzes: BaiKiemTraDto[] = [];
            try {
              const quizRes = await baiKiemTraService.GetListForManager(phanId);
              const rawList: any =
                (quizRes as any)?.data?.data ?? quizRes?.data;
              if (quizRes.status !== false && rawList) {
                quizzes = rawList.map((item: any) => ({
                  ...item,
                  cauHois: (item.danhSachCauHois || []).map((q: any) => ({
                    id: chuanHoaId(q.id),
                    noiDungCauHoi: q.noiDungCauHoi || q.tenCauHoi || "",
                    loaiCauHoi: q.loaiCauHoi || "ONE",
                    doKho: q.doKho || "TrungBinh",
                    danhSachDapAn: (q.danhSachDapAns || []).map((d: any) => ({
                      id: chuanHoaId(d.id),
                      noiDungDapAn: d.noiDungDapAn || "",
                      laDapAnDung: d.laDapAnDung || false,
                      thuTuSapXep: d.thuTuSapXep || 0,
                    })),
                  })),
                  soCauHoi: (item.danhSachCauHois || []).length,
                }));
              }
            } catch (err) {
              console.error("Lỗi tải bài kiểm tra cho phần", phanId, err);
            }

            return {
              ...phanDto,
              DanhSachBaiGiang: baiGiangsWithTaiLieu,
              DanhDachBaiKiemTra: quizzes,
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
  }, [
    idKhoaHoc,
    phanService,
    baiGiangService,
    taiLieuService,
    baiKiemTraService,
  ]);

  const refreshData = useCallback(async () => {
    if (isNavigating) {
      return;
    }
    setLoading(true);
    try {
      await Promise.all([fetchCourseInfo(), fetchSections()]);
      setIsDirty(false);
      initialDataRef.current = {
        thongTin: { ...thongTin },
        phans: JSON.parse(JSON.stringify(phans)),
      };
      saveState();
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [
    fetchCourseInfo,
    fetchSections,
    saveState,
    thongTin,
    phans,
    isNavigating,
  ]);

  // ---- CRUD Phan ----
  const createPhan = useCallback(
    async (data: {
      tenPhan: string;
      mieuTa: string;
      thuTuSapXep?: number;
    }): Promise<PhanHocType> => {
      const thuTuSapXep = data.thuTuSapXep ?? phans.length + 1;
      const res = await phanService.CreatePhanHoc({
        idKhoaHoc,
        tenPhan: data.tenPhan,
        mieuTa: data.mieuTa,
        thuTuSapXep,
      });
      if (res?.status === false)
        throw new Error(res.message || "Tạo phần thất bại");

      const raw = unwrapApiData<Partial<PhanHocType>>(res);
      const newPhan: PhanHocType = {
        ...raw,
        id: raw?.id ?? taoTempId("phan"),
        tenPhan: raw?.tenPhan ?? data.tenPhan,
        mieuTa: raw?.mieuTa ?? data.mieuTa,
        thuTuSapXep: raw?.thuTuSapXep ?? thuTuSapXep,
        DanhSachBaiGiang: [],
        DanhDachBaiKiemTra: [],
      } as PhanHocType;
      setPhans((prev) => [...prev, newPhan]);
      saveState();
      return newPhan;
    },
    [idKhoaHoc, phanService, saveState, phans.length],
  );

  const updatePhan = useCallback(
    async (
      phanId: string,
      data: { tenPhan: string; mieuTa: string; thuTuSapXep?: number },
    ) => {
      const res = await phanService.UpdatePhanHoc({
        id: phanId,
        tenPhan: data.tenPhan,
        mieuTa: data.mieuTa,
        thuTuSapXep: data.thuTuSapXep,
      });
      if (res.status === false)
        throw new Error(res.message || "Cập nhật phần thất bại");
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                tenPhan: data.tenPhan,
                mieuTa: data.mieuTa,
                thuTuSapXep: data.thuTuSapXep ?? p.thuTuSapXep,
              }
            : p,
        ),
      );
      saveState();
    },
    [phanService, saveState],
  );

  const deletePhan = useCallback(
    async (phanId: string) => {
      const res = await phanService.DeletePhanHoc(phanId);
      if (res.status === false)
        throw new Error(res.message || "Xóa phần thất bại");
      setPhans((prev) => prev.filter((p) => p.id !== phanId));
      saveState();
    },
    [phanService, saveState],
  );

  // ---- CRUD BaiGiang ----
  const createBaiGiang = useCallback(
    async (
      phanId: string,
      data: {
        tieuDe: string;
        file?: File | null;
        isFree: boolean;
        thuTuSapXep?: number;
      },
    ): Promise<BaiGiangType> => {
      if (!data.tieuDe || !data.tieuDe.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài giảng");
      }

      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");

      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);
      const thuTuSapXep = data.thuTuSapXep ?? soMucHienCo + 1;

      const tieuDe = data.tieuDe.trim();

      const formData = new FormData();
      formData.append("idPhan", phanId);
      formData.append("tieuDe", tieuDe);
      formData.append("thuTuSapXep", String(thuTuSapXep));
      formData.append("laBaiGiangFree", data.isFree ? "true" : "false");
      if (data.file) formData.append("video", data.file);

      const res = await baiGiangService.CreateBaiGiang(formData as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo bài giảng thất bại");

      const raw = unwrapApiData<Partial<BaiGiangType>>(res);
      const newBg: BaiGiangType = {
        id: raw?.id ?? taoTempId("bg"),
        tieuDe: raw?.tieuDe || tieuDe,
        thuTuSapXep: raw?.thuTuSapXep ?? thuTuSapXep,
        urlBaiGiang: raw?.urlBaiGiang || "",
        thoiLuong: raw?.thoiLuong || 0,
        danhSachTaiLieu: [],
        laBaiGiangFree: raw?.laBaiGiangFree ?? data.isFree,
      } as BaiGiangType;

      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhSachBaiGiang: [
                  ...(p.DanhSachBaiGiang || []),
                  newBg,
                ] as BaiGiangDto[],
              }
            : p,
        ),
      );
      saveState();
      return newBg;
    },
    [phans, baiGiangService, saveState],
  );

  const createMultipleBaiGiang = useCallback(
    async (
      phanId: string,
      lectures: { tieuDe: string; file?: File | null; isFree: boolean }[],
      onProgress?: (progress: {
        current: number;
        total: number;
        tieuDe: string;
        status: "uploading" | "completed" | "error";
        error?: string;
      }) => void,
    ): Promise<{
      success: BaiGiangType[];
      errors: { tieuDe: string; error: string }[];
    }> => {
      const success: BaiGiangType[] = [];
      const errors: { tieuDe: string; error: string }[] = [];
      const total = lectures.length;
      if (total === 0) {
        throw new Error("Không có bài giảng nào để tạo");
      }

      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");

      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);

      const uploadPromises = lectures.map(async (lecture, index) => {
        const { tieuDe, file, isFree } = lecture;
        try {
          if (onProgress) {
            onProgress({
              current: index + 1,
              total,
              tieuDe,
              status: "uploading",
            });
          }

          const formData = new FormData();
          formData.append("idPhan", phanId);
          formData.append("tieuDe", tieuDe);
          formData.append("thuTuSapXep", String(soMucHienCo + index + 1));
          formData.append("laBaiGiangFree", isFree ? "true" : "false");
          if (file) formData.append("video", file);

          const res = await baiGiangService.CreateBaiGiang(formData as any);
          if (res?.status === false) {
            throw new Error(res.message || "Tạo bài giảng thất bại");
          }

          const raw = unwrapApiData<Partial<BaiGiangType>>(res);
          const newBg: BaiGiangType = {
            id: raw?.id ?? taoTempId("bg"),
            tieuDe: raw?.tieuDe || tieuDe,
            thuTuSapXep: raw?.thuTuSapXep ?? soMucHienCo + index + 1,
            urlBaiGiang: raw?.urlBaiGiang || "",
            thoiLuong: raw?.thoiLuong || 0,
            danhSachTaiLieu: [],
            laBaiGiangFree: raw?.laBaiGiangFree ?? isFree,
          } as BaiGiangType;

          if (onProgress) {
            onProgress({
              current: index + 1,
              total,
              tieuDe,
              status: "completed",
            });
          }
          return { success: true, data: newBg, tieuDe };
        } catch (error: any) {
          const errorMessage = error.message || "Lỗi không xác định";
          if (onProgress) {
            onProgress({
              current: index + 1,
              total,
              tieuDe,
              status: "error",
              error: errorMessage,
            });
          }
          return { success: false, error: errorMessage, tieuDe };
        }
      });

      const results = await Promise.all(uploadPromises);
      for (const result of results) {
        if (result.success && result.data) {
          success.push(result.data);
        } else if (!result.success) {
          errors.push({
            tieuDe: result.tieuDe,
            error: result.error || "Lỗi không xác định",
          });
        }
      }

      if (success.length > 0) {
        setPhans((prev) =>
          prev.map((p) =>
            p.id === phanId
              ? {
                  ...p,
                  DanhSachBaiGiang: [
                    ...(p.DanhSachBaiGiang || []),
                    ...success,
                  ] as BaiGiangDto[],
                }
              : p,
          ),
        );
        saveState();
      }
      return { success, errors };
    },
    [phans, baiGiangService, saveState],
  );

  const updateBaiGiang = useCallback(
    async (
      phanId: string,
      baiGiangId: string,
      data: {
        tieuDe?: string;
        isFree?: boolean;
        file?: File | null;
        thuTuSapXep?: number;
      },
    ) => {
      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");
      const bg = phan.DanhSachBaiGiang?.find((b) => b.id === baiGiangId);
      if (!bg) throw new Error("Không tìm thấy bài giảng");

      const tieuDeMoi = (data.tieuDe ?? bg.tieuDe ?? "").trim();
      if (!tieuDeMoi) {
        throw new Error("Vui lòng nhập tiêu đề bài giảng");
      }

      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
      formData.append("tieuDe", tieuDeMoi);
      formData.append(
        "laBaiGiangFree",
        (data.isFree ?? bg.laBaiGiangFree) ? "true" : "false",
      );
      formData.append(
        "thuTuSapXep",
        String(data.thuTuSapXep ?? bg.thuTuSapXep ?? 0),
      );
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
                        tieuDe: tieuDeMoi,
                        laBaiGiangFree: data.isFree ?? b.laBaiGiangFree,
                        thuTuSapXep: data.thuTuSapXep ?? b.thuTuSapXep,
                        urlBaiGiang: res.data?.urlBaiGiang ?? b.urlBaiGiang,
                        thoiLuong: res.data?.thoiLuong ?? b.thoiLuong,
                      }
                    : b,
                ),
              }
            : p,
        ),
      );
      saveState();
    },
    [phans, baiGiangService, saveState],
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
      saveState();
    },
    [baiGiangService, saveState],
  );

  // ---- CRUD BaiKiemTra ----
  const createBaiKiemTra = useCallback(
    async (
      phanId: string,
      data: { tenBaiKiemTra: string; moTa: string; thuTuSapXep?: number },
    ): Promise<BaiKiemTraDto> => {
      if (!data.tenBaiKiemTra || !data.tenBaiKiemTra.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài kiểm tra");
      }

      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");

      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);
      const thuTuSapXep = data.thuTuSapXep ?? soMucHienCo + 1;

      const payload = {
        idPhan: phanId,
        tenBaiKiemTra: data.tenBaiKiemTra.trim(),
        moTa: data.moTa || "",
        thuTuSapXep,
      };
      const res = await baiKiemTraService.CreateBaiKiemTra(payload as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo bài kiểm tra thất bại");

      const raw = unwrapApiData<any>(res);
      const newQuiz: BaiKiemTraDto = {
        id: raw?.id ?? taoTempId("kt"),
        tenBaiKiemTra: raw?.tenBaiKiemTra || payload.tenBaiKiemTra,
        moTa: raw?.moTa || payload.moTa,
        thuTuSapXep: raw?.thuTuSapXep ?? thuTuSapXep,
        soCauHoi: 0,
        cauHois: [],
      } as BaiKiemTraDto;

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
      saveState();
      return newQuiz;
    },
    [phans, baiKiemTraService, saveState],
  );

  const updateBaiKiemTra = useCallback(
    async (
      baiKiemTraId: string,
      data: { tenBaiKiemTra: string; moTa: string; thuTuSapXep?: number },
    ) => {
      if (!data.tenBaiKiemTra || !data.tenBaiKiemTra.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài kiểm tra");
      }

      // Find the quiz in phans
      let foundQuiz = null;
      let foundPhanId = null;
      for (const phan of phans) {
        const quiz = phan.DanhDachBaiKiemTra?.find(
          (kt) => kt.id === baiKiemTraId,
        );
        if (quiz) {
          foundQuiz = quiz;
          foundPhanId = phan.id;
          break;
        }
      }
      if (!foundQuiz) throw new Error("Không tìm thấy bài kiểm tra");

      const payload = {
        idBaiKiemTra: baiKiemTraId,
        tenBaiKiemTra: data.tenBaiKiemTra.trim(),
        moTa: data.moTa || "",
        thuTuSapXep: data.thuTuSapXep ?? foundQuiz.thuTuSapXep,
      };
      const res = await baiKiemTraService.UpdateBaiKiemTra(payload as any);
      if (res.status === false)
        throw new Error(res.message || "Cập nhật bài kiểm tra thất bại");

      // Cập nhật local state
      setPhans((prev) =>
        prev.map((p) =>
          p.id === foundPhanId
            ? {
                ...p,
                DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.map((kt) =>
                  kt.id === baiKiemTraId
                    ? {
                        ...kt,
                        tenBaiKiemTra: payload.tenBaiKiemTra,
                        moTa: payload.moTa,
                        thuTuSapXep: payload.thuTuSapXep,
                      }
                    : kt,
                ),
              }
            : p,
        ),
      );
      saveState();
    },
    [baiKiemTraService, saveState, phans],
  );

  const deleteBaiKiemTra = useCallback(
    async (phanId: string, baiKiemTraId: string) => {
      const res = await baiKiemTraService.DeleteBaiKiemTra(baiKiemTraId);
      if (res.status === false)
        throw new Error(res.message || "Xóa bài kiểm tra thất bại");
      await loadQuizzesForSection(phanId);
      saveState();
    },
    [baiKiemTraService, loadQuizzesForSection, saveState],
  );

  // ---- CRUD CauHoi + DapAn ----
  const createCauHoi = useCallback(
    async (
      phanId: string,
      baiKiemTraId: string,
      data: {
        noiDungCauHoi: string;
        loaiCauHoi: "ONE" | "MULTI";
        doKho: string;
        danhSachDapAn: {
          noiDungDapAn: string;
          laDapAnDung: boolean;
          thuTuSapXep?: number;
        }[];
      },
    ): Promise<CauHoiDto> => {
      const phan = phans.find((p) => p.id === phanId);
      const quiz = phan?.DanhDachBaiKiemTra?.find(
        (kt) => kt.id === baiKiemTraId,
      );
      const thuTuSapXep = (quiz?.cauHois?.length || 0) + 1;

      const request: CreateCauHoiRequest = {
        idBaiKiemTra: baiKiemTraId,
        noiDungCauHoi: data.noiDungCauHoi.trim(),
        doKho: data.doKho,
        thuTuSapXep,
        danhSachDapAn: data.danhSachDapAn.map((d, idx) => ({
          noiDungDapAn: d.noiDungDapAn.trim(),
          laDapAnDung: d.laDapAnDung,
          thuTuSapXep: d.thuTuSapXep ?? idx + 1,
        })),
      };

      const res = await baiKiemTraService.CreateCauHoi(request);
      if (res?.status === false)
        throw new Error(res.message || "Tạo câu hỏi thất bại");

      const raw = unwrapApiData<any>(res) as CauHoiDto;
      const newCauHoi = {
        id: raw?.id ?? taoTempId("q"),
        noiDungCauHoi: raw?.noiDungCauHoi || request.noiDungCauHoi,
        loaiCauHoi: raw?.loaiCauHoi || data.loaiCauHoi,
        doKho: raw?.doKho || data.doKho,
        thuTuSapXep: raw?.thuTuSapXep ?? thuTuSapXep,
        danhSachDapAn: (Array.isArray(raw?.danhSachDapAns)
          ? raw.danhSachDapAns
          : []
        ).map((d: any) => ({
          id: d.id ?? taoTempId("da"),
          noiDungDapAn: d.noiDungDapAn || "",
          laDapAnDung: d.laDapAnDung || false,
          thuTuSapXep: d.thuTuSapXep || 0,
        })),
      };

      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.map((kt) =>
                  kt.id === baiKiemTraId
                    ? {
                        ...kt,
                        cauHois: [...(kt.cauHois || []), newCauHoi],
                        soCauHoi: (kt.soCauHoi || 0) + 1,
                      }
                    : kt,
                ),
              }
            : p,
        ),
      );
      saveState();
      return raw;
    },
    [phans, baiKiemTraService, saveState],
  );

  const updateCauHoi = useCallback(
    async (
      phanId: string,
      baiKiemTraId: string,
      cauHoiId: string,
      data: {
        noiDungCauHoi: string;
        loaiCauHoi: "ONE" | "MULTI";
        doKho: string;
        danhSachDapAn: {
          id?: string;
          noiDungDapAn: string;
          laDapAnDung: boolean;
          thuTuSapXep?: number;
        }[];
      },
    ): Promise<CauHoiDto> => {
      const request: UpdateCauHoiRequest = {
        id: cauHoiId,
        noiDungCauHoi: data.noiDungCauHoi.trim(),
        doKho: data.doKho,
        danhSachDapAns: data.danhSachDapAn.map((d, idx) => ({
          id: isValidGuid(d.id) ? d.id : undefined,
          noiDungDapAn: d.noiDungDapAn.trim(),
          laDapAnDung: d.laDapAnDung,
          thuTuSapXep: d.thuTuSapXep ?? idx + 1,
        })),
      };

      const res = await baiKiemTraService.UpdateCauHoi(request);
      if (res?.status === false)
        throw new Error(res.message || "Cập nhật câu hỏi thất bại");

      const raw = unwrapApiData<any>(res) as CauHoiDto;

      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.map((kt) =>
                  kt.id === baiKiemTraId
                    ? {
                        ...kt,
                        cauHois: (kt.cauHois || []).map((q: any) =>
                          q.id === cauHoiId
                            ? {
                                id: cauHoiId,
                                noiDungCauHoi:
                                  raw?.noiDungCauHoi || request.noiDungCauHoi,
                                loaiCauHoi: raw?.loaiCauHoi || data.loaiCauHoi,
                                doKho: raw?.doKho || data.doKho,
                                thuTuSapXep: raw?.thuTuSapXep ?? q.thuTuSapXep,
                                danhSachDapAn: (Array.isArray(
                                  raw?.danhSachDapAns,
                                )
                                  ? raw.danhSachDapAns
                                  : []
                                ).map((d: any) => ({
                                  id: d.id ?? taoTempId("da"),
                                  noiDungDapAn: d.noiDungDapAn || "",
                                  laDapAnDung: d.laDapAnDung || false,
                                  thuTuSapXep: d.thuTuSapXep || 0,
                                })),
                              }
                            : q,
                        ),
                      }
                    : kt,
                ),
              }
            : p,
        ),
      );
      saveState();
      return raw;
    },
    [baiKiemTraService, saveState],
  );

  const deleteCauHoi = useCallback(
    async (phanId: string, baiKiemTraId: string, cauHoiId: string) => {
      const res = await baiKiemTraService.DeleteCauHoi(cauHoiId);
      if (res.status === false)
        throw new Error(res.message || "Xóa câu hỏi thất bại");

      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                DanhDachBaiKiemTra: p.DanhDachBaiKiemTra?.map((kt) =>
                  kt.id === baiKiemTraId
                    ? {
                        ...kt,
                        cauHois: (kt.cauHois || []).filter(
                          (q: any) => q.id !== cauHoiId,
                        ),
                        soCauHoi: Math.max((kt.soCauHoi || 1) - 1, 0),
                      }
                    : kt,
                ),
              }
            : p,
        ),
      );
      saveState();
    },
    [baiKiemTraService, saveState],
  );

  // ---- CRUD TaiLieu ----
  const createTaiLieu = useCallback(
    async (
      phanId: string,
      baiGiangId: string,
      file: File,
      tenTaiLieu?: string,
    ) => {
      const finalTen = (tenTaiLieu || "").trim();
      if (!finalTen) {
        throw new Error("Vui lòng nhập tên tài liệu");
      }

      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
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
      saveState();
    },
    [taiLieuService, saveState],
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
      saveState();
    },
    [taiLieuService, saveState],
  );

  // ---- Khởi tạo ----
  useEffect(() => {
    const initializeData = async () => {
      if (!idKhoaHoc) return;
      if (!initialFetchDone.current) {
        initialFetchDone.current = true;
        setLoading(true);
        try {
          await fetchCourseInfo();
          await fetchSections();
          setIsDirty(false);
          saveState();
        } catch (error) {
          console.error("Lỗi tải dữ liệu:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKhoaHoc]);

  useEffect(() => {
    return () => {
      saveState();
    };
  }, [saveState]);

  const isReadOnly = trangThai !== "DangSua";

  const value: CourseEditContextValue = {
    idKhoaHoc,
    thongTin,
    setThongTin,
    phans,
    setPhans: setPhansWrapper,
    trangThai,
    setTrangThai,
    lyDoTuChoi,
    loading,
    isReadOnly,
    refreshData,
    saveState,
    restoreState,
    clearState,
    isDirty,
    markDirty,
    markClean,
    resetDirty,
    saveAndNavigate,
    isNavigating,
    setNavigating,
    createPhan,
    updatePhan,
    deletePhan,
    createBaiGiang,
    createMultipleBaiGiang,
    updateBaiGiang,
    deleteBaiGiang,
    createBaiKiemTra,
    updateBaiKiemTra,
    deleteBaiKiemTra,
    createCauHoi,
    updateCauHoi,
    deleteCauHoi,
    createTaiLieu,
    deleteTaiLieu,
    loadQuizzesForSection,
  };

  return (
    <CourseEditContext.Provider value={value}>
      {children}
    </CourseEditContext.Provider>
  );
}
