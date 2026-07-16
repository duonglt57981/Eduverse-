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
import { v4 as uuidv4 } from "uuid";
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

// Id tạm dùng cho Phan / BaiGiang / TaiLieu / BaiKiemTra (không đi qua validate Guid ở BE cho các luồng này)
function taoTempId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ===== Kiểm tra 1 giá trị có phải chuỗi GUID hợp lệ hay không =====
function isValidGuid(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

// ===== Sinh GUID thật bằng thư viện uuid =====
function taoGuidMoi(): string {
  return uuidv4();
}

// ===== Trả về id hợp lệ: giữ nguyên nếu đã là GUID, sinh mới nếu không =====
function chuanHoaId(id: unknown): string {
  return isValidGuid(id) ? (id as string) : taoGuidMoi();
}

// Store để lưu trạng thái khóa học đang edit trên toàn app
const courseEditStore = new Map<string, any>();

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
  saveState: () => void;
  restoreState: () => void;
  clearState: () => void;

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

  // Load quizzes for a section
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

  // Lưu state vào store
  const saveState = useCallback(() => {
    if (!idKhoaHoc) return;
    courseEditStore.set(stateKey, {
      thongTin,
      phans,
      trangThai,
      lyDoTuChoi,
      timestamp: Date.now(),
    });
  }, [idKhoaHoc, stateKey, thongTin, phans, trangThai, lyDoTuChoi]);

  // Khôi phục state từ store
  const restoreState = useCallback(() => {
    if (!idKhoaHoc) return false;
    const saved = courseEditStore.get(stateKey);
    if (saved) {
      setThongTinState(saved.thongTin || {});
      setPhans(saved.phans || []);
      setTrangThai(saved.trangThai || "DangSua");
      setLyDoTuChoi(saved.lyDoTuChoi || null);
      return true;
    }
    return false;
  }, [idKhoaHoc, stateKey]);

  // Xóa state khỏi store
  const clearState = useCallback(() => {
    if (!idKhoaHoc) return;
    courseEditStore.delete(stateKey);
  }, [idKhoaHoc, stateKey]);

  const setThongTin = useCallback((patch: Partial<KhoaHocType>) => {
    setThongTinState((prev) => ({ ...prev, ...patch }));
  }, []);

  // ---- Load quizzes for a specific section ----
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
          trangThai: data.trangThai || "",
          trangThaiPheDuyet: data.trangThaiPheDuyet || "",
        });

        if (data.trangThaiPheDuyet) {
          setTrangThai(data.trangThaiPheDuyet as TrangThaiKhoaHoc);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin khóa học:", error);
    }
  }, [idKhoaHoc, khoaHocService, setThongTin, setTrangThai]);

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
    setLoading(true);
    try {
      await Promise.all([fetchCourseInfo(), fetchSections()]);
      saveState();
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchCourseInfo, fetchSections, saveState]);

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
      saveState();
      return newPhan;
    },
    [idKhoaHoc, phanService, saveState],
  );

  const updatePhan = useCallback(
    async (phanId: string, data: { tenPhan: string; mieuTa: string }) => {
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
      data: { tieuDe: string; file?: File | null; isFree: boolean },
    ): Promise<BaiGiangType> => {
      if (!data.tieuDe || !data.tieuDe.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài giảng");
      }

      let actualPhanId = phanId;
      if (phanId.startsWith("phan_")) {
        await refreshData();
        const phan = phans.find((p) => p.id === phanId);
        if (!phan) {
          throw new Error("Không tìm thấy phần. Vui lòng thử lại.");
        }
        if (phan.id.startsWith("phan_")) {
          throw new Error("Phần chưa được lưu trên server. Vui lòng thử lại.");
        }
        actualPhanId = phan.id;
      }

      const phan = phans.find((p) => p.id === actualPhanId);
      if (!phan) throw new Error("Không tìm thấy phần");

      const soMucHienCo =
        (phan.DanhSachBaiGiang?.length || 0) +
        (phan.DanhDachBaiKiemTra?.length || 0);

      const tieuDe = data.tieuDe.trim();

      const formData = new FormData();
      formData.append("idPhan", actualPhanId);
      formData.append("tieuDe", tieuDe);
      formData.append("thuTuSapXep", String(soMucHienCo + 1));
      formData.append("laBaiGiangFree", data.isFree ? "true" : "false");
      if (data.file) formData.append("video", data.file);

      const res = await baiGiangService.CreateBaiGiang(formData as any);
      if (res?.status === false)
        throw new Error(res.message || "Tạo bài giảng thất bại");

      const raw = unwrapApiData<Partial<BaiGiangType>>(res);
      const newBg: BaiGiangType = {
        id: raw?.id ?? taoTempId("bg"),
        tieuDe: raw?.tieuDe || tieuDe,
        thuTuSapXep: raw?.thuTuSapXep ?? soMucHienCo + 1,
        urlBaiGiang: raw?.urlBaiGiang || "",
        thoiLuong: raw?.thoiLuong || 0,
        danhSachTaiLieu: [],
        laBaiGiangFree: raw?.laBaiGiangFree ?? data.isFree,
      };

      setPhans((prev) =>
        prev.map((p) =>
          p.id === actualPhanId
            ? { ...p, DanhSachBaiGiang: [...(p.DanhSachBaiGiang || []), newBg] }
            : p,
        ),
      );
      saveState();
      return newBg;
    },
    [phans, baiGiangService, refreshData, saveState],
  );

  // ---- Tạo nhiều bài giảng cùng lúc (Parallel) ----
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

      let actualPhanId = phanId;
      if (phanId.startsWith("phan_")) {
        await refreshData();
        const phan = phans.find((p) => p.id === phanId);
        if (!phan) {
          throw new Error("Không tìm thấy phần. Vui lòng thử lại.");
        }
        if (phan.id.startsWith("phan_")) {
          throw new Error("Phần chưa được lưu trên server. Vui lòng thử lại.");
        }
        actualPhanId = phan.id;
      }

      const phan = phans.find((p) => p.id === actualPhanId);
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
          formData.append("idPhan", actualPhanId);
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
          };

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
            p.id === actualPhanId
              ? {
                  ...p,
                  DanhSachBaiGiang: [...(p.DanhSachBaiGiang || []), ...success],
                }
              : p,
          ),
        );
        saveState();
      }

      return { success, errors };
    },
    [phans, baiGiangService, refreshData, saveState],
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
                        tieuDe: tieuDeMoi,
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
      data: { tenBaiKiemTra: string; moTa: string; cauHois: any[] },
    ): Promise<BaiKiemTraDto> => {
      if (!data.tenBaiKiemTra || !data.tenBaiKiemTra.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài kiểm tra");
      }

      const tenBaiKiemTra = data.tenBaiKiemTra.trim();

      const payload = {
        idPhan: phanId,
        tenBaiKiemTra,
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
        cauHois: (raw?.danhSachCauHoi || []).map((q: any) => ({
          id: chuanHoaId(q.id),
          noiDungCauHoi: q.noiDungCauHoi || "",
          loaiCauHoi: q.loaiCauHoi || "ONE",
          doKho: q.doKho || "TrungBinh",
          danhSachDapAn: (q.danhSachDapAns || []).map((d: any) => ({
            id: chuanHoaId(d.id),
            noiDungDapAn: d.noiDungDapAn || "",
            laDapAnDung: d.laDapAnDung || false,
            thuTuSapXep: d.thuTuSapXep || 0,
          })),
        })),
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
    [baiKiemTraService, saveState],
  );

  const updateBaiKiemTra = useCallback(
    async (
      phanId: string,
      baiKiemTraId: string,
      data: { tenBaiKiemTra: string; moTa: string; cauHois: any[] },
    ) => {
      if (!data.tenBaiKiemTra || !data.tenBaiKiemTra.trim()) {
        throw new Error("Vui lòng nhập tiêu đề bài kiểm tra");
      }

      const tenBaiKiemTra = data.tenBaiKiemTra.trim();

      const payload = {
        idBaiKiemTra: baiKiemTraId,
        tenBaiKiemTra,
        moTa: data.moTa || "",
        // ✅ Chuẩn hóa id: giữ nguyên GUID thật (câu hỏi/đáp án đã có trong DB),
        // sinh GUID mới cho câu hỏi/đáp án nào đang có id tạm (q_..., da_..., a1...)
        // -> Backend không tìm thấy id này trong DB nên sẽ tự hiểu là item mới và insert.
        danhSachCauHoi: data.cauHois.map((q, index) => ({
          id: chuanHoaId(q.id),
          noiDungCauHoi: q.noiDungCauHoi,
          loaiCauHoi: q.loaiCauHoi === "ONE" ? "ONE" : "MULTI",
          doKho: q.doKho,
          thuTuSapXep: index + 1,
          danhSachDapAns: q.danhSachDapAn.map((d: any, dIdx: number) => ({
            id: chuanHoaId(d.id),
            noiDungDapAn: d.noiDungDapAn,
            laDapAnDung: d.laDapAnDung,
            thuTuSapXep: dIdx + 1,
          })),
        })),
      };
      const res = await baiKiemTraService.UpdateBaiKiemTra(payload as any);
      if (res.status === false)
        throw new Error(res.message || "Cập nhật bài kiểm tra thất bại");

      await loadQuizzesForSection(phanId);
      saveState();
    },
    [baiKiemTraService, loadQuizzesForSection, saveState],
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

  // ---- Khôi phục state khi component mount ----
  useEffect(() => {
    const initializeData = async () => {
      if (!idKhoaHoc) return;

      const restored = restoreState();
      if (!restored) {
        setLoading(true);
        try {
          await refreshData();
        } catch (error) {
          console.error("Lỗi tải dữ liệu:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKhoaHoc]);

  // ---- Lưu state khi component unmount ----
  useEffect(() => {
    return () => {
      saveState();
    };
  }, [saveState]);

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
    saveState,
    restoreState,
    clearState,
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
