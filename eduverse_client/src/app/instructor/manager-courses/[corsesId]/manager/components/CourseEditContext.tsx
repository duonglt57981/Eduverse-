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
import {
  validateTenPhan,
  validateTieuDeBaiGiang,
  validateTenTaiLieu,
  validateTenBaiKiemTra,
  validateMoTaBaiKiemTra,
  validateNoiDungCauHoi,
  validateNoiDungDapAn,
  trimString,
  SO_DAP_AN_TOI_THIEU,
  SO_DAP_AN_TOI_DA,
  ThongTinKhoaHocCoBan,
  TrangThaiKhoaHoc,
  extractData,
  LichSuKiemDuyetDto,
} from "./courseEditCore";
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

// --- Helper tạo ID tạm (chỉ dùng cho các đối tượng con chưa có ID thật, nhưng ưu tiên lấy từ API) ---
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
  lichSuKiemDuyet: LichSuKiemDuyetDto | null;
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
      thuTuSapXep?: number;
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
  const [lichSuKiemDuyet, setLichSuKiemDuyet] =
    useState<LichSuKiemDuyetDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDirty, setIsDirty] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const initialDataRef = useRef<{
    thongTin: ThongTinKhoaHocCoBan;
    phans: PhanHocType[];
  } | null>(null);
  const initialFetchDone = useRef(false);
  const isRefreshingRef = useRef(false); // <--- THÊM REF NÀY

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
          lichSuKiemDuyet,
          timestamp: Date.now(),
        });
      }
      setIsDirty(false);
      window.location.href = destination;
    },
    [idKhoaHoc, stateKey, thongTin, phans, lyDoTuChoi, lichSuKiemDuyet],
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
      lichSuKiemDuyet,
      timestamp: Date.now(),
    });
  }, [idKhoaHoc, stateKey, thongTin, phans, lyDoTuChoi, lichSuKiemDuyet]);

  const restoreState = useCallback(() => {
    if (!idKhoaHoc) return false;
    const saved = courseEditStore.get(stateKey);
    if (saved) {
      setThongTinState(saved.thongTin || {});
      setPhans(saved.phans || []);
      setLyDoTuChoi(saved.lyDoTuChoi || null);
      setLichSuKiemDuyet(saved.lichSuKiemDuyet || null);
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

  // ---- Map 1 phần (raw) từ response GetKhoaHocDetail sang PhanHocType ----
  const mapPhanRaw = useCallback((phanRaw: any): PhanHocType => {
    const baiGiangs: BaiGiangDto[] = (phanRaw.danhSachBaiGiang || []).map(
      (bg: any) => ({
        ...bg,
        id: bg.id,
        tieuDe: bg.tieuDe || "",
        urlBaiGiang: bg.urlBaiGiang || "",
        thoiLuong: bg.thoiLuong || 0,
        laBaiGiangFree: bg.laBaiGiangFree || false,
        thuTuSapXep: bg.thuTuSapXep,
        danhSachTaiLieu: bg.danhSachTaiLieu || [],
      }),
    );

    const quizzes: BaiKiemTraDto[] = (phanRaw.danhSachBaiKiemTra || []).map(
      (kt: any) => ({
        ...kt,
        id: kt.id,
        tenBaiKiemTra: kt.tenBaiKiemTra || "",
        moTa: kt.moTa || "",
        thuTuSapXep: kt.thuTuSapXep,
        cauHois: (kt.danhSachCauHois || []).map((q: any) => ({
          id: chuanHoaId(q.id),
          noiDungCauHoi: q.noiDungCauHoi || q.tenCauHoi || "",
          loaiCauHoi: q.loaiCauHoi || "ONE",
          doKho: q.doKho || "TrungBinh",
          thuTuSapXep: q.thuTuSapXep,
          danhSachDapAn: (q.danhSachDapAns || []).map((d: any) => ({
            id: chuanHoaId(d.id),
            noiDungDapAn: d.noiDungDapAn || "",
            laDapAnDung: d.laDapAnDung || false,
            thuTuSapXep: d.thuTuSapXep || 0,
          })),
        })),
        soCauHoi: (kt.danhSachCauHois || []).length,
      }),
    );

    return {
      ...phanRaw,
      id: phanRaw.id,
      tenPhan: phanRaw.tenPhan || "",
      mieuTa: phanRaw.mieuTa || "",
      thuTuSapXep: phanRaw.thuTuSapXep,
      DanhSachBaiGiang: baiGiangs,
      DanhDachBaiKiemTra: quizzes,
    } as PhanHocType;
  }, []);

  // ---- Tải toàn bộ chi tiết khóa học (thông tin + phần + bài giảng + tài liệu + bài kiểm tra + câu hỏi) chỉ bằng 1 API ----
  const fetchCourseDetail = useCallback(async () => {
    if (!idKhoaHoc) return;
    try {
      const res = await khoaHocService.GetKhoaHocDetail(idKhoaHoc);
      const data = extractData<any>(res);
      if (res?.status === false || !data) {
        setPhans([]);
        return;
      }

      // ---- Thông tin cơ bản của khóa học ----
      setThongTinState({
        tieuDe: data.tieuDe || "",
        moTa: data.moTa || "",
        capDo: data.capDo || "",
        hinhAnhKhoaHoc: data.hinhAnhKhoaHoc || "",
        giaGoc: data.giaGoc,
        trangThai: data.trangThai || "",
        trangThaiPheDuyet: data.trangThaiPheDuyet || "",
      });

      setTrangThai((data.trangThaiPheDuyet as TrangThaiKhoaHoc) || "DangSua");

      // ---- Lịch sử kiểm duyệt khóa học (lần duyệt/từ chối gần nhất) ----
      const lichSuRaw = data.lichSuKiemDuyetKhoaHoc || null;
      setLichSuKiemDuyet(lichSuRaw);
      setLyDoTuChoi(lichSuRaw?.lyDo ?? null);

      // ---- Danh sách phần (kèm bài giảng, tài liệu, bài kiểm tra, câu hỏi) ----
      const phanHocList: PhanHocType[] = (data.danhSachPhanHoc || []).map(
        (phanRaw: any) => mapPhanRaw(phanRaw),
      );

      setPhans(phanHocList);
    } catch (error) {
      console.error("Lỗi lấy chi tiết khóa học:", error);
      setPhans([]);
    }
  }, [idKhoaHoc, khoaHocService, mapPhanRaw]);

  // ---- Tải lại bài kiểm tra cho 1 phần (dùng chung API GetKhoaHocDetail) ----
  const loadQuizzesForSection = useCallback(
    async (phanId: string) => {
      if (!idKhoaHoc) return;
      try {
        const res = await khoaHocService.GetKhoaHocDetail(idKhoaHoc);
        const data = extractData<any>(res);
        if (res?.status === false || !data) return;

        const phanRaw = (data.danhSachPhanHoc || []).find(
          (p: any) => p.id === phanId,
        );
        if (!phanRaw) return;

        const mappedList: BaiKiemTraDto[] = (
          phanRaw.danhSachBaiKiemTra || []
        ).map((kt: any) => ({
          ...kt,
          id: kt.id,
          tenBaiKiemTra: kt.tenBaiKiemTra || "",
          moTa: kt.moTa || "",
          thuTuSapXep: kt.thuTuSapXep,
          cauHois: (kt.danhSachCauHois || []).map((q: any) => ({
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
          soCauHoi: (kt.danhSachCauHois || []).length,
        }));

        setPhans((prevPhans) =>
          prevPhans.map((p) =>
            p.id === phanId ? { ...p, DanhDachBaiKiemTra: mappedList } : p,
          ),
        );
      } catch (err) {
        console.error("Lỗi tải bài kiểm tra cho phần", phanId, err);
      }
    },
    [idKhoaHoc, khoaHocService],
  );

  // ===== SỬA refreshData: KHÔNG set loading, thêm isRefreshingRef =====
  const refreshData = useCallback(async () => {
    if (isNavigating) {
      return;
    }
    if (isRefreshingRef.current) {
      return; // đang refresh thì bỏ qua
    }
    isRefreshingRef.current = true;

    try {
      await fetchCourseDetail();
      setIsDirty(false);
      initialDataRef.current = {
        thongTin: { ...thongTin },
        phans: JSON.parse(JSON.stringify(phans)),
      };
      saveState();
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [fetchCourseDetail, saveState, thongTin, phans, isNavigating]);

  // ---- CRUD Phan ----
  const createPhan = useCallback(
    async (data: {
      tenPhan: string;
      mieuTa: string;
      thuTuSapXep?: number;
    }): Promise<PhanHocType> => {
      const tenPhanValid = validateTenPhan(data.tenPhan);
      if (!tenPhanValid.valid) {
        throw new Error(tenPhanValid.error);
      }

      const mieuTaTrimmed = trimString(data.mieuTa);
      const thuTuSapXep = data.thuTuSapXep ?? phans.length + 1;

      const res = await phanService.CreatePhanHoc({
        idKhoaHoc,
        tenPhan: trimString(data.tenPhan),
        mieuTa: mieuTaTrimmed,
        thuTuSapXep,
      });

      if (res?.status === false) {
        throw new Error(res.message || "Tạo phần thất bại");
      }

      const raw = extractData<Partial<PhanHocType>>(res);
      if (!raw?.id) {
        throw new Error("Không nhận được ID phần từ server");
      }

      const newPhan: PhanHocType = {
        ...raw,
        id: raw.id,
        tenPhan: raw.tenPhan ?? trimString(data.tenPhan),
        mieuTa: raw.mieuTa ?? mieuTaTrimmed,
        thuTuSapXep: raw.thuTuSapXep ?? thuTuSapXep,
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
      const tenPhanValid = validateTenPhan(data.tenPhan);
      if (!tenPhanValid.valid) {
        throw new Error(tenPhanValid.error);
      }

      const mieuTaTrimmed = trimString(data.mieuTa);

      const res = await phanService.UpdatePhanHoc({
        id: phanId,
        tenPhan: trimString(data.tenPhan),
        mieuTa: mieuTaTrimmed,
        thuTuSapXep: data.thuTuSapXep,
      });
      if (res.status === false)
        throw new Error(res.message || "Cập nhật phần thất bại");
      setPhans((prev) =>
        prev.map((p) =>
          p.id === phanId
            ? {
                ...p,
                tenPhan: trimString(data.tenPhan),
                mieuTa: mieuTaTrimmed,
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
      const tieuDeValid = validateTieuDeBaiGiang(data.tieuDe);
      if (!tieuDeValid.valid) {
        throw new Error(tieuDeValid.error);
      }

      if (!data.file) {
        throw new Error("Vui lòng chọn video cho bài giảng");
      }

      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");

      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);
      const thuTuSapXep = data.thuTuSapXep ?? soMucHienCo + 1;

      const tieuDe = trimString(data.tieuDe);

      const formData = new FormData();
      formData.append("idPhan", phanId);
      formData.append("tieuDe", tieuDe);
      formData.append("thuTuSapXep", String(thuTuSapXep));
      formData.append("laBaiGiangFree", data.isFree ? "true" : "false");
      if (data.file) formData.append("video", data.file);

      const res = await baiGiangService.CreateBaiGiang(formData as any);
      if (res?.status === false) {
        throw new Error(res.message || "Tạo bài giảng thất bại");
      }

      const raw = extractData<Partial<BaiGiangType>>(res);
      if (!raw?.id) {
        throw new Error("Không nhận được ID bài giảng từ server");
      }

      const newBg: BaiGiangType = {
        id: raw.id,
        tieuDe: raw.tieuDe || tieuDe,
        thuTuSapXep: raw.thuTuSapXep ?? thuTuSapXep,
        urlBaiGiang: raw.urlBaiGiang || "",
        thoiLuong: raw.thoiLuong || 0,
        danhSachTaiLieu: [],
        laBaiGiangFree: raw.laBaiGiangFree ?? data.isFree,
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

          const raw = extractData<Partial<BaiGiangType>>(res);
          if (!raw?.id) {
            throw new Error("Không nhận được ID bài giảng từ server");
          }

          const newBg: BaiGiangType = {
            id: raw.id,
            tieuDe: raw.tieuDe || tieuDe,
            thuTuSapXep: raw.thuTuSapXep ?? soMucHienCo + index + 1,
            urlBaiGiang: raw.urlBaiGiang || "",
            thoiLuong: raw.thoiLuong || 0,
            danhSachTaiLieu: [],
            laBaiGiangFree: raw.laBaiGiangFree ?? isFree,
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

      const tieuDeMoi =
        data.tieuDe !== undefined
          ? trimString(data.tieuDe)
          : trimString(bg.tieuDe || "");
      if (!tieuDeMoi) {
        throw new Error("Vui lòng nhập tiêu đề bài giảng");
      }
      const tieuDeValid = validateTieuDeBaiGiang(tieuDeMoi);
      if (!tieuDeValid.valid) {
        throw new Error(tieuDeValid.error);
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

      if (data.file) {
        formData.append("video", data.file);
      }

      const res = await baiGiangService.UpdateBaiGiang(formData as any);
      if (res.status === false) {
        throw new Error(res.message || "Cập nhật bài giảng thất bại");
      }

      const updatedData = extractData<Partial<BaiGiangType>>(res) || {};

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
                        urlBaiGiang: updatedData.urlBaiGiang ?? b.urlBaiGiang,
                        thoiLuong: updatedData.thoiLuong ?? b.thoiLuong,
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
      const tenValid = validateTenBaiKiemTra(data.tenBaiKiemTra);
      if (!tenValid.valid) {
        throw new Error(tenValid.error);
      }
      const moTaValid = validateMoTaBaiKiemTra(data.moTa);
      if (!moTaValid.valid) {
        throw new Error(moTaValid.error);
      }

      const phan = phans.find((p) => p.id === phanId);
      if (!phan) throw new Error("Không tìm thấy phần");

      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);
      const thuTuSapXep = data.thuTuSapXep ?? soMucHienCo + 1;

      const payload = {
        idPhan: phanId,
        tenBaiKiemTra: trimString(data.tenBaiKiemTra),
        moTa: trimString(data.moTa),
        thuTuSapXep,
      };
      const res = await baiKiemTraService.CreateBaiKiemTra(payload as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo bài kiểm tra thất bại");

      const raw = extractData<any>(res);
      if (!raw?.id) {
        throw new Error("Không nhận được ID bài kiểm tra từ server");
      }

      const newQuiz: BaiKiemTraDto = {
        id: raw.id,
        tenBaiKiemTra: raw.tenBaiKiemTra || payload.tenBaiKiemTra,
        moTa: raw.moTa || payload.moTa,
        thuTuSapXep: raw.thuTuSapXep ?? thuTuSapXep,
        soCauHoi: 0,
        cauHois: [],
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
      const tenValid = validateTenBaiKiemTra(data.tenBaiKiemTra);
      if (!tenValid.valid) {
        throw new Error(tenValid.error);
      }
      const moTaValid = validateMoTaBaiKiemTra(data.moTa);
      if (!moTaValid.valid) {
        throw new Error(moTaValid.error);
      }

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
        tenBaiKiemTra: trimString(data.tenBaiKiemTra),
        moTa: trimString(data.moTa),
        thuTuSapXep: data.thuTuSapXep ?? foundQuiz.thuTuSapXep,
      };
      const res = await baiKiemTraService.UpdateBaiKiemTra(payload as any);
      if (res.status === false)
        throw new Error(res.message || "Cập nhật bài kiểm tra thất bại");

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
      const noiDungValid = validateNoiDungCauHoi(data.noiDungCauHoi);
      if (!noiDungValid.valid) {
        throw new Error(noiDungValid.error);
      }

      if (data.danhSachDapAn.length < SO_DAP_AN_TOI_THIEU) {
        throw new Error(
          `Cần ít nhất ${SO_DAP_AN_TOI_THIEU} đáp án cho câu hỏi. Hiện tại: ${data.danhSachDapAn.length} đáp án.`,
        );
      }
      if (data.danhSachDapAn.length > SO_DAP_AN_TOI_DA) {
        throw new Error(
          `Tối đa ${SO_DAP_AN_TOI_DA} đáp án cho câu hỏi. Hiện tại: ${data.danhSachDapAn.length} đáp án.`,
        );
      }

      const soDapAnDung = data.danhSachDapAn.filter(
        (d) => d.laDapAnDung,
      ).length;
      if (soDapAnDung === 0) {
        throw new Error("Cần có ít nhất 1 đáp án đúng");
      }
      if (soDapAnDung >= data.danhSachDapAn.length) {
        throw new Error("Số đáp án đúng phải nhỏ hơn tổng số đáp án");
      }

      const noiDungDapAns: string[] = [];
      for (const dapAn of data.danhSachDapAn) {
        const dapAnValid = validateNoiDungDapAn(dapAn.noiDungDapAn);
        if (!dapAnValid.valid) {
          throw new Error(dapAnValid.error);
        }
        noiDungDapAns.push(trimString(dapAn.noiDungDapAn).toLowerCase());
      }

      const uniqueDapAns = new Set(noiDungDapAns);
      if (uniqueDapAns.size !== noiDungDapAns.length) {
        throw new Error("Các đáp án không được trùng nhau");
      }

      const phan = phans.find((p) => p.id === phanId);
      const quiz = phan?.DanhDachBaiKiemTra?.find(
        (kt) => kt.id === baiKiemTraId,
      );
      const thuTuSapXep = (quiz?.cauHois?.length || 0) + 1;

      const request: CreateCauHoiRequest = {
        idBaiKiemTra: baiKiemTraId,
        noiDungCauHoi: trimString(data.noiDungCauHoi),
        doKho: data.doKho,
        thuTuSapXep,
        danhSachDapAn: data.danhSachDapAn.map((d, idx) => ({
          noiDungDapAn: trimString(d.noiDungDapAn),
          laDapAnDung: d.laDapAnDung,
          thuTuSapXep: d.thuTuSapXep ?? idx + 1,
        })),
      };

      const res = await baiKiemTraService.CreateCauHoi(request);
      if (res?.status === false)
        throw new Error(res.message || "Tạo câu hỏi thất bại");

      const raw = extractData<any>(res);
      if (!raw?.id) {
        throw new Error("Không nhận được ID câu hỏi từ server");
      }

      const newCauHoi = {
        id: raw.id,
        noiDungCauHoi: raw.noiDungCauHoi || request.noiDungCauHoi,
        loaiCauHoi: raw.loaiCauHoi || data.loaiCauHoi,
        doKho: raw.doKho || data.doKho,
        thuTuSapXep: raw.thuTuSapXep ?? thuTuSapXep,
        danhSachDapAn: (Array.isArray(raw.danhSachDapAns)
          ? raw.danhSachDapAns
          : []
        ).map((d: any) => ({
          id: d.id ?? taoTempId("da"),
          noiDungDapAn: d.noiDungDapAn || "",
          laDapAnDung: d.laDapAnDung || false,
          thuTuSapXep: d.thuTuSapXep || 0,
        })),
      } as unknown as CauHoiDto;

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
      const noiDungValid = validateNoiDungCauHoi(data.noiDungCauHoi);
      if (!noiDungValid.valid) {
        throw new Error(noiDungValid.error);
      }

      if (data.danhSachDapAn.length < SO_DAP_AN_TOI_THIEU) {
        throw new Error(
          `Cần ít nhất ${SO_DAP_AN_TOI_THIEU} đáp án cho câu hỏi. Hiện tại: ${data.danhSachDapAn.length} đáp án.`,
        );
      }
      if (data.danhSachDapAn.length > SO_DAP_AN_TOI_DA) {
        throw new Error(
          `Tối đa ${SO_DAP_AN_TOI_DA} đáp án cho câu hỏi. Hiện tại: ${data.danhSachDapAn.length} đáp án.`,
        );
      }

      const soDapAnDung = data.danhSachDapAn.filter(
        (d) => d.laDapAnDung,
      ).length;
      if (soDapAnDung === 0) {
        throw new Error("Cần có ít nhất 1 đáp án đúng");
      }
      if (soDapAnDung >= data.danhSachDapAn.length) {
        throw new Error("Số đáp án đúng phải nhỏ hơn tổng số đáp án");
      }

      const noiDungDapAns: string[] = [];
      for (const dapAn of data.danhSachDapAn) {
        const dapAnValid = validateNoiDungDapAn(dapAn.noiDungDapAn);
        if (!dapAnValid.valid) {
          throw new Error(dapAnValid.error);
        }
        noiDungDapAns.push(trimString(dapAn.noiDungDapAn).toLowerCase());
      }

      const uniqueDapAns = new Set(noiDungDapAns);
      if (uniqueDapAns.size !== noiDungDapAns.length) {
        throw new Error("Các đáp án không được trùng nhau");
      }

      const request: UpdateCauHoiRequest = {
        id: cauHoiId,
        noiDungCauHoi: trimString(data.noiDungCauHoi),
        doKho: data.doKho,
        danhSachDapAns: data.danhSachDapAn.map((d, idx) => ({
          id: isValidGuid(d.id) ? d.id : undefined,
          noiDungDapAn: trimString(d.noiDungDapAn),
          laDapAnDung: d.laDapAnDung,
          thuTuSapXep: d.thuTuSapXep ?? idx + 1,
        })),
      };

      const res = await baiKiemTraService.UpdateCauHoi(request);
      if (res?.status === false)
        throw new Error(res.message || "Cập nhật câu hỏi thất bại");

      const raw = extractData<any>(res);
      if (!raw?.id) {
        throw new Error("Không nhận được ID câu hỏi từ server");
      }

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
                                  raw.noiDungCauHoi || request.noiDungCauHoi,
                                loaiCauHoi: raw.loaiCauHoi || data.loaiCauHoi,
                                doKho: raw.doKho || data.doKho,
                                thuTuSapXep: raw.thuTuSapXep ?? q.thuTuSapXep,
                                danhSachDapAn: (Array.isArray(
                                  raw.danhSachDapAns,
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
      if (!file) {
        throw new Error("Vui lòng chọn file tài liệu");
      }

      const finalTen = trimString(tenTaiLieu || "");
      if (!finalTen) {
        throw new Error("Vui lòng nhập tên tài liệu");
      }
      const tenValid = validateTenTaiLieu(finalTen);
      if (!tenValid.valid) {
        throw new Error(tenValid.error);
      }

      const formData = new FormData();
      formData.append("idBaiGiang", baiGiangId);
      formData.append("tenTaiLieu", finalTen);
      formData.append("document", file);

      const res = await taiLieuService.CreateTaiLieu(formData as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo tài liệu thất bại");

      const raw = extractData<Partial<TaiLieuType>>(res);
      if (!raw?.id) {
        throw new Error("Không nhận được ID tài liệu từ server");
      }

      const newDoc: TaiLieuType = {
        ...raw,
        id: raw.id,
        tenTaiLieu: raw.tenTaiLieu ?? finalTen,
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
                        danhSachTaiLieu: [...(bg.taiLieus || []), newDoc],
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
                        danhSachTaiLieu: bg.taiLieus?.filter(
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
          await fetchCourseDetail();
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
    lichSuKiemDuyet,
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
