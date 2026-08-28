/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Paper,
  alpha,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

import AuthGuard from "@/src/components/AuthGuard";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, KhoaHocManagerSearch } from "@/src/types/khoaHoc/Dto/dto";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { BRAND, NEUTRAL, CSSVAR, STATUS } from "@/src/theme/tokens";

const FONTS = {
  display: "var(--font-heading, 'Be Vietnam Pro', sans-serif)",
  body: "var(--font-sans, 'Be Vietnam Pro', sans-serif)",
};

const MAU = {
  chinh: BRAND.main,
  chinhDam: BRAND.dark,
  chinhNhat: BRAND.light,
  vien: "#E2E8F0",
  chuDen: "#0F172A",
  chuXam: "#64748B",
  nenTrang: "#FFFFFF",
};

const duongDanChiTietKhoaHoc = (id: string) =>
  `/instructor/manager-courses/${id}/manager/curriculum`;
const duongDanTaoKhoaHocMoi = "/instructor/manager-courses/create/1";
const SO_LUONG_MOI_TRANG = 10;
const SO_LUONG_MOI_TRANG_STATS = 1000;
const SO_GIAY_HOAN_TAC = 10;

// Các trạng thái được phép xóa khóa học
const TRANG_THAI_CHO_PHEP_XOA = ["DangSua", "DaDuyet", "TuChoi"];

// Thông tin hiển thị cho trạng thái đồng bộ nhận diện EduVerse
function thongTinTrangThaiPheDuyet(trangThai?: string): {
  nhan: string;
  mau: string;
  nen: string;
  vien: string;
} {
  switch (trangThai) {
    case "ChoDuyet":
      return { nhan: "Chờ duyệt", mau: "#D97706", nen: "#FFFBEB", vien: "#FEF3C7" };
    case "XemXet":
      return { nhan: "Xem xét", mau: "#475569", nen: "#F7F5F2", vien: "#ECE7E4" };
    case "DaDuyet":
      return { nhan: "Đã duyệt", mau: "#16A34A", nen: "#F0FDF4", vien: "#DCFCE7" };
    case "DangDuyet":
      return { nhan: "Đang duyệt", mau: "#475569", nen: "#F7F5F2", vien: "#ECE7E4" };
    case "TuChoi":
      return { nhan: "Từ chối", mau: "#DC2626", nen: "#FEF2F2", vien: "#FECACA" };
    case "DangSua":
      return { nhan: "Đang sửa", mau: "#7C3AED", nen: "#FAF5FF", vien: "#F3E8FF" };
    default:
      return {
        nhan: trangThai ?? "Không rõ",
        mau: "#64748B",
        nen: "#F7F5F2",
        vien: "#ECE7E4",
      };
  }
}

function trichXuatThongBaoLoi(err: unknown, macDinh: string): string {
  if (err && typeof err === "object") {
    const anyErr = err as any;
    const msg =
      anyErr?.response?.data?.message ??
      anyErr?.response?.data?.errors ??
      anyErr?.data?.message ??
      anyErr?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return macDinh;
}

function trichXuatIdBanNhap(response: any): string | undefined {
  if (!response) return undefined;
  return (
    response?.data?.khoaHoc?.id ??
    response?.data?.khoaHocMoi?.id ??
    response?.data?.id ??
    response?.khoaHoc?.id ??
    response?.khoaHocMoi?.id ??
    response?.id ??
    response?.data?.data?.khoaHoc?.id ??
    response?.data?.data?.id
  );
}

function laThanhCong(response: any): boolean {
  if (!response) return false;
  if (response.status === false) return false;
  if (response.success === false) return false;
  if (response.isSuccess === false) return false;
  return true;
}

function trichXuatTongSoBanGhi(data: any): number | undefined {
  if (!data) return undefined;
  const tong =
    data?.totalCount ??
    data?.total ??
    data?.tongSo ??
    data?.tongSoBanGhi ??
    data?.totalItems ??
    data?.totalRecords ??
    data?.rowCount ??
    data?.count;
  return typeof tong === "number" ? tong : undefined;
}

function trichXuatTongSoTrang(
  data: any,
  tongSoBanGhi: number,
  soLuongMoiTrang: number,
): number {
  const tongSoTrangBackend =
    data?.totalPages ?? data?.tongSoTrang ?? data?.pageCount;
  if (typeof tongSoTrangBackend === "number" && tongSoTrangBackend > 0) {
    return tongSoTrangBackend;
  }
  return Math.max(1, Math.ceil(tongSoBanGhi / soLuongMoiTrang));
}

// ─── Thống kê / bộ lọc theo trạng thái ──────────────────────────────────────

type KhoaThongKe =
  | "tong"
  | "daDuyet"
  | "choDuyet"
  | "xemXet"
  | "dangDuyet"
  | "tuChoi"
  | "dangSua";

interface CauHinhTrangThai {
  giaTri: string;
  khoaThongKe: KhoaThongKe;
  nhan: string;
  icon: React.ReactNode;
  mau: string;
  nen: string;
  vien: string;
}

const CAU_HINH_TRANG_THAI: CauHinhTrangThai[] = [
  {
    giaTri: "TatCa",
    khoaThongKe: "tong",
    nhan: "Tất cả",
    icon: <SchoolRoundedIcon sx={{ fontSize: 18 }} />,
    mau: BRAND.main,
    nen: "#FEF2F2",
    vien: "#FECACA",
  },
  {
    giaTri: "DaDuyet",
    khoaThongKe: "daDuyet",
    nhan: "Đã duyệt",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
    mau: "#16A34A",
    nen: "#F0FDF4",
    vien: "#DCFCE7",
  },
  {
    giaTri: "ChoDuyet",
    khoaThongKe: "choDuyet",
    nhan: "Chờ duyệt",
    icon: <PendingRoundedIcon sx={{ fontSize: 18 }} />,
    mau: "#D97706",
    nen: "#FFFBEB",
    vien: "#FEF3C7",
  },
  {
    giaTri: "XemXet",
    khoaThongKe: "xemXet",
    nhan: "Xem xét",
    icon: <VisibilityRoundedIcon sx={{ fontSize: 18 }} />,
    mau: "#475569",
    nen: "#F7F5F2",
    vien: "#ECE7E4",
  },
  {
    giaTri: "DangDuyet",
    khoaThongKe: "dangDuyet",
    nhan: "Đang duyệt",
    icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 18 }} />,
    mau: "#475569",
    nen: "#F7F5F2",
    vien: "#ECE7E4",
  },
  {
    giaTri: "TuChoi",
    khoaThongKe: "tuChoi",
    nhan: "Từ chối",
    icon: <CancelRoundedIcon sx={{ fontSize: 18 }} />,
    mau: "#DC2626",
    nen: "#FEF2F2",
    vien: "#FECACA",
  },
  {
    giaTri: "DangSua",
    khoaThongKe: "dangSua",
    nhan: "Đang sửa",
    icon: <EditNoteRoundedIcon sx={{ fontSize: 18 }} />,
    mau: "#7C3AED",
    nen: "#FAF5FF",
    vien: "#F3E8FF",
  },
];

interface ThongKeState {
  tong: number;
  daDuyet: number;
  choDuyet: number;
  xemXet: number;
  dangDuyet: number;
  tuChoi: number;
  dangSua: number;
}

function GiaTriThongKe({
  dangTai,
  giaTri,
  mau,
}: {
  dangTai: boolean;
  giaTri: number;
  mau: string;
}) {
  if (dangTai) {
    return <CircularProgress size={16} sx={{ color: mau }} />;
  }
  return <>{giaTri}</>;
}

function TheTrangThai({
  cauHinh,
  giaTri,
  dangChon,
  dangTai,
  onClick,
}: {
  cauHinh: CauHinhTrangThai;
  giaTri: number;
  dangChon: boolean;
  dangTai: boolean;
  onClick: () => void;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 1.1,
        borderRadius: "14px",
        bgcolor: dangChon ? "#FFF8F8" : "#FFFFFF",
        textAlign: "left",
        border: dangChon
          ? `1.5px solid ${BRAND.main}`
          : `1px solid ${MAU.vien}`,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        height: 64,
        minWidth: 0,
        boxShadow: dangChon
          ? `0 4px 14px ${alpha(BRAND.main, 0.1)}`
          : "0 1px 3px rgba(0, 0, 0, 0.02)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: dangChon ? BRAND.main : alpha(BRAND.main, 0.4),
          transform: "translateY(-2px)",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "10px",
          bgcolor: cauHinh.nen,
          border: `1px solid ${cauHinh.vien}`,
          color: cauHinh.mau,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {cauHinh.icon}
      </Box>

      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: 16,
            color: dangChon ? BRAND.main : MAU.chuDen,
            lineHeight: 1.15,
            fontFamily: FONTS.display,
          }}
        >
          <GiaTriThongKe dangTai={dangTai} giaTri={giaTri} mau={cauHinh.mau} />
        </Typography>
        <Typography
          sx={{
            fontSize: 11.5,
            color: dangChon ? BRAND.main : MAU.chuXam,
            fontWeight: dangChon ? 700 : 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mt: 0.2,
          }}
        >
          {cauHinh.nhan}
        </Typography>
      </Box>
    </Paper>
  );
}

// ===== Component chính =====
function KhoaHocContent() {
  const router = useRouter();
  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [trangThaiLoc, setTrangThaiLoc] = useState("TatCa");
  const [sapXep, setSapXep] = useState("moi-nhat");
  const [trangHienTai, setTrangHienTai] = useState(1);

  const [danhSachKhoaHoc, setDanhSachKhoaHoc] = useState<KhoaHocType[]>([]);
  const [tongSoTrang, setTongSoTrang] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  // State thống kê
  const [thongKe, setThongKe] = useState<ThongKeState>({
    tong: 0,
    daDuyet: 0,
    choDuyet: 0,
    xemXet: 0,
    dangDuyet: 0,
    tuChoi: 0,
    dangSua: 0,
  });
  const [dangTaiThongKe, setDangTaiThongKe] = useState(true);
  const [daTaiThongKeLanDau, setDaTaiThongKeLanDau] = useState(false);

  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [thongBaoLoiThaoTac, setThongBaoLoiThaoTac] = useState<string | null>(
    null,
  );
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(
    null,
  );

  // ===== State cho dialog xác nhận xóa =====
  const [khoaHocChoXacNhanXoa, setKhoaHocChoXacNhanXoa] =
    useState<KhoaHocType | null>(null);

  // ===== State cho dialog xác nhận hủy duyệt =====
  const [khoaHocChoHuyDuyet, setKhoaHocChoHuyDuyet] =
    useState<KhoaHocType | null>(null);

  // ===== State cho xóa + hoàn tác =====
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [undoInfo, setUndoInfo] = useState<{
    id: string;
    ten: string;
    thoiGian: number;
  } | null>(null);
  const deleteTimers = useRef<{ [id: string]: NodeJS.Timeout }>({});
  const countdownTimers = useRef<{ [id: string]: NodeJS.Timeout }>({});

  // Hàm reset bộ lọc
  const resetAllFilters = useCallback(() => {
    setTuKhoaTimKiem("");
    setTrangThaiLoc("TatCa");
    setSapXep("moi-nhat");
    setTrangHienTai(1);
  }, []);

  // Hàm lấy thống kê
  const fetchThongKe = useCallback(
    async (buocQuaCache = false) => {
      if (daTaiThongKeLanDau && !buocQuaCache) return;
      setDangTaiThongKe(true);
      try {
        const response = await khoaHocService.GetListForManager({
          pageIndex: 1,
          pageSize: SO_LUONG_MOI_TRANG_STATS,
        });
        if (response.status && response.data) {
          const items = response.data.items || [];
          const stats: ThongKeState = {
            tong: items.length,
            daDuyet: items.filter(
              (x: KhoaHocType) => x.trangThaiPheDuyet === "DaDuyet",
            ).length,
            choDuyet: items.filter(
              (x: KhoaHocType) => x.trangThaiPheDuyet === "ChoDuyet",
            ).length,
            xemXet: items.filter(
              (x: KhoaHocType) => x.trangThaiPheDuyet === "XemXet",
            ).length,
            dangDuyet: items.filter(
              (x: KhoaHocType) => x.trangThaiPheDuyet === "DangDuyet",
            ).length,
            tuChoi: items.filter(
              (x: KhoaHocType) => x.trangThaiPheDuyet === "TuChoi",
            ).length,
            dangSua: items.filter(
              (x: KhoaHocType) => x.trangThaiPheDuyet === "DangSua",
            ).length,
          };
          setThongKe(stats);
          setDaTaiThongKeLanDau(true);
        }
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      } finally {
        setDangTaiThongKe(false);
      }
    },
    [khoaHocService, daTaiThongKeLanDau],
  );

  // Hàm lấy danh sách khóa học - lọc bỏ hiddenIds
  const layDanhSachKhoaHoc = useCallback(
    async (signal?: AbortSignal) => {
      setDangTai(true);
      setLoi(null);
      try {
        const searchParams: KhoaHocManagerSearch = {
          pageIndex: trangHienTai,
          pageSize: SO_LUONG_MOI_TRANG,
          keyword: tuKhoaTimKiem || undefined,
          trangThai: trangThaiLoc === "TatCa" ? undefined : trangThaiLoc,
        };

        switch (sapXep) {
          case "moi-nhat":
            searchParams.sapXepNgay = "Moi";
            break;
          case "cu-nhat":
            searchParams.sapXepNgay = "Cu";
            break;
          case "ten-a-z":
            searchParams.sapXepTen = "AZ";
            break;
          case "hoc-vien-nhieu-nhat":
            searchParams.sapXepHocVienNhieuNhat = true;
            break;
          default:
            break;
        }

        const response = await khoaHocService.GetListForManager(searchParams);
        if (signal?.aborted) return;

        if (!response || response.status === false || !response.data) {
          setLoi(response?.message || "Không có dữ liệu.");
          setDanhSachKhoaHoc([]);
          setTongSoTrang(1);
          setTotalCount(0);
          return;
        }

        const data: any = response.data;
        let items = data.items || [];

        // Lọc theo trạng thái nếu backend chưa lọc
        if (searchParams.trangThai && searchParams.trangThai !== "TatCa") {
          const filtered = items.filter(
            (item: KhoaHocType) =>
              item.trangThaiPheDuyet === searchParams.trangThai,
          );
          if (filtered.length !== items.length) {
            items = filtered;
          }
        }

        // Loại bỏ các khóa học đang chờ xóa (hiddenIds)
        items = items.filter(
          (item: KhoaHocType) => !hiddenIds.includes(item.id),
        );

        const tongSoBanGhi: number =
          trichXuatTongSoBanGhi(data) ?? items.length;

        setDanhSachKhoaHoc(items);
        setTotalCount(tongSoBanGhi);
        setTongSoTrang(
          trichXuatTongSoTrang(data, tongSoBanGhi, SO_LUONG_MOI_TRANG),
        );
      } catch (err) {
        if (signal?.aborted) return;
        console.error("❌ Lỗi fetch:", err);
        setLoi("Có lỗi xảy ra khi tải danh sách.");
        setDanhSachKhoaHoc([]);
        setTongSoTrang(1);
        setTotalCount(0);
      } finally {
        if (!signal?.aborted) setDangTai(false);
      }
    },
    [
      tuKhoaTimKiem,
      trangThaiLoc,
      sapXep,
      trangHienTai,
      khoaHocService,
      hiddenIds,
    ],
  );

  useEffect(() => {
    const abortController = new AbortController();
    layDanhSachKhoaHoc(abortController.signal);
    fetchThongKe();
    return () => abortController.abort();
  }, [layDanhSachKhoaHoc, fetchThongKe]);

  // Cleanup timers khi unmount
  useEffect(() => {
    return () => {
      Object.values(deleteTimers.current).forEach((timer) =>
        clearTimeout(timer),
      );
      Object.values(countdownTimers.current).forEach((timer) =>
        clearInterval(timer),
      );
    };
  }, []);

  // ===== Các handler =====
  const handleEdit = async (khoaHoc: KhoaHocType) => {
    if (!khoaHoc.id || dangXuLyId) return;
    if (khoaHoc.trangThaiPheDuyet === "DangSua") {
      router.push(duongDanChiTietKhoaHoc(khoaHoc.id));
      return;
    }
    setDangXuLyId(khoaHoc.id);
    setThongBaoLoiThaoTac(null);
    try {
      const response = await khoaHocService.createFullKhoaHocDraft(khoaHoc.id);
      const idBanNhap = trichXuatIdBanNhap(response);
      if (laThanhCong(response) && idBanNhap) {
        router.push(duongDanChiTietKhoaHoc(idBanNhap));
        return;
      }
      setThongBaoLoiThaoTac(
        response?.message || "Không thể tạo bản nháp. Vui lòng kiểm tra lại.",
      );
    } catch (error) {
      console.error("Lỗi tạo bản nháp:", error);
      setThongBaoLoiThaoTac(
        trichXuatThongBaoLoi(
          error,
          "Có lỗi xảy ra khi tạo bản nháp. Thử lại sau.",
        ),
      );
    } finally {
      setDangXuLyId(null);
    }
  };

  const getAvailableActions = (trangThaiPheDuyet?: string) => {
    let showEdit: boolean;
    switch (trangThaiPheDuyet) {
      case "DaDuyet":
      case "TuChoi":
      case "DangSua":
        showEdit = true;
        break;
      case "ChoDuyet":
      case "XemXet":
      case "DangDuyet":
        showEdit = false;
        break;
      default:
        showEdit = true;
        break;
    }
    const showDelete = TRANG_THAI_CHO_PHEP_XOA.includes(
      trangThaiPheDuyet ?? "",
    );
    const showCancelApproval = trangThaiPheDuyet === "ChoDuyet";
    return { showEdit, showDelete, showCancelApproval };
  };

  const xuLyBamKhoaHoc = (id?: string) => {
    if (id) router.push(duongDanChiTietKhoaHoc(id));
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    setTrangHienTai(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReload = () => {
    fetchThongKe(true);
  };

  const handleRefresh = () => {
    resetAllFilters();
    fetchThongKe(true);
  };

  const handleChonTrangThai = (giaTri: string) => {
    setTrangHienTai(1);
    setTrangThaiLoc(giaTri);
  };

  // ===== Xử lý hủy duyệt khóa học =====
  const handleHuyDuyet = async (khoaHoc: KhoaHocType) => {
    if (!khoaHoc.id || dangXuLyId) return;
    setDangXuLyId(khoaHoc.id);
    setThongBaoLoiThaoTac(null);
    try {
      const response = await khoaHocService.ChuyenTTDangSuaBatch(khoaHoc.id);
      if (laThanhCong(response)) {
        setThongBaoThanhCong(
          `Đã hủy duyệt khóa học "${khoaHoc.tieuDe || "Khóa học"}" thành công. Trạng thái đã chuyển sang "Đang sửa".`,
        );
        setKhoaHocChoHuyDuyet(null);
        layDanhSachKhoaHoc();
        await fetchThongKe(true);
      } else {
        setThongBaoLoiThaoTac(
          response?.message ||
            "Không thể hủy duyệt khóa học. Vui lòng thử lại.",
        );
      }
    } catch (error) {
      console.error("Lỗi hủy duyệt khóa học:", error);
      setThongBaoLoiThaoTac(
        trichXuatThongBaoLoi(error, "Có lỗi xảy ra khi hủy duyệt khóa học."),
      );
    } finally {
      setDangXuLyId(null);
    }
  };

  // ===== Dialog xác nhận xóa =====
  const mopDialogXoa = (khoaHoc: KhoaHocType) => {
    if (!khoaHoc.id) return;
    if (!TRANG_THAI_CHO_PHEP_XOA.includes(khoaHoc.trangThaiPheDuyet ?? "")) {
      setThongBaoLoiThaoTac(
        "Khóa học này không thể xóa ở trạng thái hiện tại.",
      );
      return;
    }
    setKhoaHocChoXacNhanXoa(khoaHoc);
  };

  const dongDialogXoa = () => {
    setKhoaHocChoXacNhanXoa(null);
  };

  const xacNhanXoaTuDialog = () => {
    if (!khoaHocChoXacNhanXoa) return;
    const khoaHoc = khoaHocChoXacNhanXoa;
    setKhoaHocChoXacNhanXoa(null);
    batDauXoa(khoaHoc);
  };

  // ===== Xóa + hoàn tác (chạy sau khi đã xác nhận trong dialog) =====
  const batDauXoa = (khoaHoc: KhoaHocType) => {
    if (!khoaHoc.id) return;
    const id = khoaHoc.id;

    setHiddenIds((prev) => [...prev, id]);

    setUndoInfo({
      id,
      ten: khoaHoc.tieuDe || "Khóa học",
      thoiGian: SO_GIAY_HOAN_TAC,
    });

    if (deleteTimers.current[id]) {
      clearTimeout(deleteTimers.current[id]);
      delete deleteTimers.current[id];
    }
    if (countdownTimers.current[id]) {
      clearInterval(countdownTimers.current[id]);
      delete countdownTimers.current[id];
    }

    const countdownTimer = setInterval(() => {
      setUndoInfo((prev) => {
        if (!prev || prev.id !== id) return prev;
        const conLai = prev.thoiGian - 1;
        if (conLai <= 0) {
          clearInterval(countdownTimers.current[id]);
          delete countdownTimers.current[id];
          return { ...prev, thoiGian: 0 };
        }
        return { ...prev, thoiGian: conLai };
      });
    }, 1000);
    countdownTimers.current[id] = countdownTimer;

    const timer = setTimeout(async () => {
      try {
        const response = await khoaHocService.DeleteKhoaHoc(id);
        if (laThanhCong(response)) {
          setDanhSachKhoaHoc((prev) => prev.filter((c) => c.id !== id));
          setThongBaoThanhCong(
            `Đã xóa khóa học "${khoaHoc.tieuDe}" thành công.`,
          );
          await fetchThongKe(true);
        } else {
          setHiddenIds((prev) => prev.filter((itemId) => itemId !== id));
          setThongBaoLoiThaoTac(
            response?.message || "Không thể xóa khóa học. Vui lòng thử lại.",
          );
        }
      } catch (error) {
        console.error("Lỗi xóa khóa học:", error);
        setHiddenIds((prev) => prev.filter((itemId) => itemId !== id));
        setThongBaoLoiThaoTac(
          trichXuatThongBaoLoi(error, "Có lỗi xảy ra khi xóa khóa học."),
        );
      } finally {
        setUndoInfo((prev) => (prev?.id === id ? null : prev));
        if (countdownTimers.current[id]) {
          clearInterval(countdownTimers.current[id]);
          delete countdownTimers.current[id];
        }
        delete deleteTimers.current[id];
      }
    }, SO_GIAY_HOAN_TAC * 1000);

    deleteTimers.current[id] = timer;
  };

  const hoanTacXoa = () => {
    if (!undoInfo) return;
    const { id } = undoInfo;
    if (deleteTimers.current[id]) {
      clearTimeout(deleteTimers.current[id]);
      delete deleteTimers.current[id];
    }
    if (countdownTimers.current[id]) {
      clearInterval(countdownTimers.current[id]);
      delete countdownTimers.current[id];
    }
    setHiddenIds((prev) => prev.filter((item) => item !== id));
    setUndoInfo(null);
  };

  // ===== Render =====
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      {/* Header Banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: 22, sm: 28 },
                color: MAU.chuDen,
                fontFamily: FONTS.display,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Quản lý khóa học
            </Typography>
            {totalCount > 0 && (
              <Box
                sx={{
                  px: 1.2,
                  py: 0.35,
                  borderRadius: "999px",
                  bgcolor: "#FEF2F2",
                  color: BRAND.main,
                  fontSize: 12.5,
                  fontWeight: 800,
                  border: `1px solid ${alpha(BRAND.main, 0.2)}`,
                }}
              >
                {totalCount} khóa học
              </Box>
            )}
          </Stack>
          <Typography sx={{ fontSize: 14, color: MAU.chuXam, fontWeight: 500 }}>
            Tạo mới, chỉnh sửa nội dung bài giảng và theo dõi tiến độ phê duyệt các khóa học của bạn
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          onClick={() => router.push(duongDanTaoKhoaHocMoi)}
          sx={{
            background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
            textTransform: "none",
            fontWeight: 800,
            fontSize: 14,
            px: 3,
            py: 1.2,
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(139, 19, 19, 0.25)",
            transition: "all 0.2s ease",
            flexShrink: 0,
            whiteSpace: "nowrap",
            "&:hover": {
              boxShadow: "0 6px 22px rgba(139, 19, 19, 0.38)",
              transform: "translateY(-1px)",
            },
          }}
        >
          Tạo khóa học mới
        </Button>
      </Box>

      {/* Quick Status Metric Filter Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(7, 1fr)",
          },
          gap: 1.5,
          mb: 3,
        }}
      >
        {CAU_HINH_TRANG_THAI.map((cauHinh) => (
          <TheTrangThai
            key={cauHinh.giaTri}
            cauHinh={cauHinh}
            giaTri={thongKe[cauHinh.khoaThongKe]}
            dangChon={trangThaiLoc === cauHinh.giaTri}
            dangTai={dangTaiThongKe}
            onClick={() => handleChonTrangThai(cauHinh.giaTri)}
          />
        ))}
      </Box>

      {/* Search & Sort Control Bar */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          p: 1.5,
          mb: 3,
          borderRadius: "16px",
          border: `1px solid ${MAU.vien}`,
          bgcolor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
        }}
      >
        {/* Search Input */}
        <TextField
          placeholder="Tìm kiếm khóa học theo tên..."
          value={tuKhoaTimKiem}
          onChange={(e) => {
            setTrangHienTai(1);
            setTuKhoaTimKiem(e.target.value);
          }}
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: 260 },
            "& .MuiOutlinedInput-root": {
              height: 44,
              borderRadius: "12px",
              bgcolor: "#FFFFFF",
              fontSize: 13.5,
              fontWeight: 500,
              transition: "all 0.15s ease",
              "& fieldset": { borderColor: "#ECE7E4" },
              "&:hover fieldset": { borderColor: alpha(BRAND.main, 0.4) },
              "&.Mui-focused": {
                bgcolor: "#FFFFFF",
                boxShadow: `0 0 0 3px ${alpha(BRAND.main, 0.08)}`,
              },
              "&.Mui-focused fieldset": {
                borderColor: BRAND.main,
                borderWidth: 1.5,
              },
            },
            "& .MuiOutlinedInput-input": {
              py: 0,
              height: "100%",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <SearchIcon sx={{ color: "#64748B", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: tuKhoaTimKiem ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setTuKhoaTimKiem("")}
                    sx={{ p: 0.5, color: "#94A3B8" }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />

        {/* Sort Select */}
        <Select
          value={sapXep}
          onChange={(e) => {
            setTrangHienTai(1);
            setSapXep(e.target.value);
          }}
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.5, mr: 0.75 }}>
              <SwapVertRoundedIcon sx={{ color: "#64748B", fontSize: 20 }} />
            </InputAdornment>
          }
          sx={{
            minWidth: { xs: "100%", sm: 200 },
            height: 44,
            borderRadius: "12px",
            color: MAU.chuDen,
            fontSize: 13.5,
            fontWeight: 700,
            bgcolor: "#FFFFFF",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ECE7E4" },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(BRAND.main, 0.4),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: BRAND.main,
            },
            "&.Mui-focused": {
              bgcolor: "#FFFFFF",
              boxShadow: `0 0 0 3px ${alpha(BRAND.main, 0.08)}`,
            },
          }}
        >
          <MenuItem value="moi-nhat" sx={{ fontSize: 13.5, fontWeight: 600 }}>Mới nhất</MenuItem>
          <MenuItem value="cu-nhat" sx={{ fontSize: 13.5, fontWeight: 600 }}>Cũ nhất</MenuItem>
          <MenuItem value="ten-a-z" sx={{ fontSize: 13.5, fontWeight: 600 }}>Tên A-Z</MenuItem>
          <MenuItem value="hoc-vien-nhieu-nhat" sx={{ fontSize: 13.5, fontWeight: 600 }}>Nhiều học viên nhất</MenuItem>
        </Select>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} sx={{ ml: { xs: 0, sm: "auto" } }}>
          <Tooltip title="Tải lại danh sách">
            <span>
              <IconButton
                onClick={handleReload}
                disabled={dangTai}
                sx={{
                  color: BRAND.main,
                  bgcolor: "#FFFFFF",
                  border: "1px solid #ECE7E4",
                  borderRadius: "12px",
                  width: 44,
                  height: 44,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#FEF2F2",
                    borderColor: alpha(BRAND.main, 0.3),
                  },
                  "&.Mui-disabled": { opacity: 0.5 },
                }}
              >
                {dangTai ? (
                  <CircularProgress size={18} sx={{ color: BRAND.main }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Đặt lại toàn bộ bộ lọc">
            <IconButton
              onClick={handleRefresh}
              sx={{
                color: "#64748B",
                bgcolor: "#FFFFFF",
                border: "1px solid #ECE7E4",
                borderRadius: "12px",
                width: 44,
                height: 44,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#F7F5F2",
                  color: "#0F172A",
                  borderColor: "#D1D5DB",
                },
              }}
            >
              <RestartAltRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Filter Tag Active Indicator */}
      {trangThaiLoc !== "TatCa" && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", mb: 2.5 }}
        >
          <Typography sx={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
            Đang lọc:
          </Typography>
          <Chip
            label={thongTinTrangThaiPheDuyet(trangThaiLoc).nhan}
            size="small"
            onDelete={() => handleChonTrangThai("TatCa")}
            sx={{
              bgcolor: thongTinTrangThaiPheDuyet(trangThaiLoc).nen,
              color: thongTinTrangThaiPheDuyet(trangThaiLoc).mau,
              border: `1px solid ${thongTinTrangThaiPheDuyet(trangThaiLoc).vien}`,
              fontWeight: 800,
              fontSize: 12,
              borderRadius: "8px",
              height: 26,
            }}
          />
        </Stack>
      )}

      {/* Loading Skeleton View */}
      {dangTai && (
        <Stack spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "18px",
                border: `1px solid ${MAU.vien}`,
                bgcolor: "#FFFFFF",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2.5,
              }}
            >
              <Skeleton
                variant="rounded"
                width={240}
                height={140}
                sx={{ borderRadius: "14px", flexShrink: 0 }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="80%" height={32} sx={{ mb: 1.5 }} />
                <Skeleton width="30%" height={28} />
              </Box>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Error State */}
      {!dangTai && loi && (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 6,
            px: 4,
            borderRadius: "16px",
            border: "1px solid #FECACA",
            bgcolor: "#FEF2F2",
          }}
        >
          <Typography
            sx={{ color: "#DC2626", fontWeight: 800, fontSize: 16, mb: 2 }}
          >
            {loi}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleReload}
            sx={{
              borderColor: BRAND.main,
              color: BRAND.main,
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              "&:hover": {
                borderColor: BRAND.dark,
                bgcolor: "#FEF2F2",
              },
            }}
          >
            Thử lại
          </Button>
        </Paper>
      )}

      {/* Empty State */}
      {!dangTai && !loi && danhSachKhoaHoc.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            borderRadius: "20px",
            border: "1px dashed #CBD5E1",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              bgcolor: "#FEF2F2",
              color: BRAND.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            sx={{
              color: MAU.chuDen,
              fontWeight: 900,
              fontSize: 19,
              fontFamily: FONTS.display,
              mb: 1,
            }}
          >
            Chưa tìm thấy khóa học nào
          </Typography>
          <Typography
            sx={{
              color: MAU.chuXam,
              fontWeight: 500,
              fontSize: 14,
              maxWidth: 420,
              mx: "auto",
              mb: 3,
            }}
          >
            {tuKhoaTimKiem || trangThaiLoc !== "TatCa"
              ? "Không có khóa học nào khớp với bộ lọc hiện tại. Thử đặt lại bộ lọc để xem toàn bộ."
              : "Bắt đầu chia sẻ kiến thức của bạn bằng cách tạo khóa học đầu tiên ngay hôm nay!"}
          </Typography>
          {tuKhoaTimKiem || trangThaiLoc !== "TatCa" ? (
            <Button
              variant="outlined"
              onClick={handleRefresh}
              sx={{
                borderColor: BRAND.main,
                color: BRAND.main,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "10px",
                px: 3,
              }}
            >
              Đặt lại bộ lọc
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(duongDanTaoKhoaHocMoi)}
              sx={{
                bgcolor: BRAND.main,
                textTransform: "none",
                fontWeight: 800,
                px: 3.5,
                py: 1.2,
                borderRadius: "12px",
                boxShadow: "0 4px 14px rgba(139, 19, 19, 0.25)",
                "&:hover": { bgcolor: BRAND.dark },
              }}
            >
              Tạo khóa học mới
            </Button>
          )}
        </Paper>
      )}

      {/* Course Cards List */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Stack spacing={2}>
          {danhSachKhoaHoc.map((khoaHoc) => {
            const pheDuyet = thongTinTrangThaiPheDuyet(
              khoaHoc.trangThaiPheDuyet,
            );
            const isDraft = khoaHoc.isBanHienTai === false;
            const actions = getAvailableActions(khoaHoc.trangThaiPheDuyet);
            const dangXuLyItemNay = dangXuLyId === khoaHoc.id;

            return (
              <Paper
                key={khoaHoc.id}
                elevation={0}
                onClick={() => xuLyBamKhoaHoc(khoaHoc.id)}
                sx={{
                  p: 2,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2.5,
                  borderRadius: "18px",
                  border: `1px solid ${isDraft ? "#FECACA" : MAU.vien}`,
                  bgcolor: "#FFFFFF",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                  "&:hover": {
                    boxShadow: "0 10px 28px rgba(0, 0, 0, 0.06)",
                    borderColor: alpha(BRAND.main, 0.35),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Thumbnail Area */}
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: "100%", sm: "220px", md: "240px" },
                    height: { xs: "160px", sm: "135px" },
                    borderRadius: "14px",
                    flexShrink: 0,
                    bgcolor: "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  {khoaHoc.hinhAnhKhoaHoc ? (
                    <Image
                      src={khoaHoc.hinhAnhKhoaHoc}
                      alt={khoaHoc.tieuDe ?? "Khóa học"}
                      fill
                      sizes="(max-width: 600px) 100vw, 240px"
                      style={{ objectFit: "cover", borderRadius: "14px" }}
                      unoptimized
                    />
                  ) : (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "#F8FAFC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "14px",
                      }}
                    >
                      <ArticleOutlinedIcon
                        sx={{ color: "#94A3B8", fontSize: 40, opacity: 0.8 }}
                      />
                    </Box>
                  )}

                  {isDraft && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: BRAND.main,
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: 10,
                        px: 1,
                        py: 0.3,
                        borderRadius: "6px",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      Bản nháp
                    </Box>
                  )}
                </Box>

                {/* Content & Metadata Area */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", lg: "row" },
                    flexGrow: 1,
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", lg: "center" },
                    gap: 2,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  {/* Title & Badges */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    {/* Status & Level Badges */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                        mb: 1,
                        flexWrap: "wrap",
                        gap: 0.75,
                      }}
                    >
                      {/* Status Chip */}
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.6,
                          px: 1.1,
                          py: 0.35,
                          borderRadius: "8px",
                          bgcolor: pheDuyet.nen,
                          border: `1px solid ${pheDuyet.vien}`,
                          color: pheDuyet.mau,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: pheDuyet.mau,
                          }}
                        />
                        {pheDuyet.nhan}
                      </Box>

                      {/* Level Tag */}
                      {khoaHoc.capDo && (
                        <Chip
                          icon={<LayersRoundedIcon sx={{ fontSize: "13px !important", color: "#64748B" }} />}
                          label={khoaHoc.capDo}
                          size="small"
                          sx={{
                            bgcolor: "#F8FAFC",
                            color: "#475569",
                            fontWeight: 700,
                            fontSize: 11.5,
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            height: 24,
                          }}
                        />
                      )}

                      {/* Category Tag */}
                      {khoaHoc.loaiKhoaHoc && (
                        <Chip
                          label={khoaHoc.loaiKhoaHoc}
                          size="small"
                          sx={{
                            bgcolor: "#F8FAFC",
                            color: "#475569",
                            fontWeight: 700,
                            fontSize: 11.5,
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            height: 24,
                          }}
                        />
                      )}
                    </Stack>

                    {/* Title */}
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: 16, sm: 17.5 },
                        color: MAU.chuDen,
                        mb: 1.25,
                        fontFamily: FONTS.display,
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        transition: "color 0.15s ease",
                        "&:hover": { color: BRAND.main },
                      }}
                    >
                      {khoaHoc.tieuDe ?? "Chưa đặt tên khóa học"}
                    </Typography>

                    {/* Price & Students */}
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.2,
                          py: 0.4,
                          borderRadius: "8px",
                          bgcolor: "#F0FDF4",
                          border: "1px solid #DCFCE7",
                          color: "#16A34A",
                        }}
                      >
                        <SellRoundedIcon sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontWeight: 900, fontSize: 13, lineHeight: 1 }}>
                          {khoaHoc.giaGoc === 0
                            ? "Miễn phí"
                            : `${(khoaHoc.giaGoc ?? 0).toLocaleString("vi-VN")} đ`}
                        </Typography>
                      </Box>

                      {khoaHoc.soLuongHocVien != null && (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            color: "#64748B",
                            fontSize: 12.5,
                            fontWeight: 600,
                          }}
                        >
                          <PeopleAltRoundedIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                          <span>{khoaHoc.soLuongHocVien} học viên</span>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {/* Action Buttons Group */}
                  <Stack
                    direction="row"
                    spacing={1}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      alignItems: "center",
                      justifyContent: { xs: "flex-end", lg: "center" },
                      flexShrink: 0,
                      pt: { xs: 1.5, lg: 0 },
                      borderTop: { xs: "1px solid #F1F5F9", lg: "none" },
                      width: { xs: "100%", lg: "auto" },
                    }}
                  >
                    {actions.showEdit && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          dangXuLyItemNay ? (
                            <CircularProgress size={14} sx={{ color: BRAND.main }} />
                          ) : (
                            <EditRoundedIcon sx={{ fontSize: 16 }} />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(khoaHoc);
                        }}
                        disabled={dangXuLyItemNay}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: 13.5,
                          borderRadius: "10px",
                          borderColor: alpha(BRAND.main, 0.35),
                          color: BRAND.main,
                          bgcolor: "#FEF2F2",
                          px: 2.5,
                          py: 0.9,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          minWidth: "fit-content",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: BRAND.main,
                            color: "#FFFFFF",
                            borderColor: BRAND.main,
                            boxShadow: `0 4px 12px ${alpha(BRAND.main, 0.25)}`,
                          },
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    )}

                    {actions.showCancelApproval && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          dangXuLyItemNay ? (
                            <CircularProgress size={14} sx={{ color: "#D97706" }} />
                          ) : (
                            <UndoRoundedIcon sx={{ fontSize: 16 }} />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setKhoaHocChoHuyDuyet(khoaHoc);
                        }}
                        disabled={dangXuLyItemNay}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          fontSize: 13.5,
                          borderRadius: "10px",
                          borderColor: "#FEF3C7",
                          bgcolor: "#FFFBEB",
                          color: "#D97706",
                          px: 2.5,
                          py: 0.9,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          minWidth: "fit-content",
                          "&:hover": {
                            bgcolor: "#FEF3C7",
                            borderColor: "#F59E0B",
                          },
                        }}
                      >
                        Hủy duyệt
                      </Button>
                    )}

                    {actions.showDelete && (
                      <Tooltip title="Xóa khóa học">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              mopDialogXoa(khoaHoc);
                            }}
                            disabled={dangXuLyItemNay}
                            sx={{
                              color: "#DC2626",
                              bgcolor: "#FEF2F2",
                              border: "1px solid #FECACA",
                              borderRadius: "10px",
                              p: 1,
                              transition: "all 0.15s ease",
                              "&:hover": {
                                bgcolor: "#DC2626",
                                color: "#FFFFFF",
                                borderColor: "#DC2626",
                              },
                            }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}

                    <Tooltip title="Vào quản lý nội dung">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          xuLyBamKhoaHoc(khoaHoc.id);
                        }}
                        sx={{
                          color: "#64748B",
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          borderRadius: "10px",
                          p: 1,
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: "#0F172A",
                            color: "#FFFFFF",
                            borderColor: "#0F172A",
                          },
                        }}
                      >
                        <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Pagination */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mt: 4,
            pt: 2,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <Typography sx={{ fontSize: 13.5, color: MAU.chuXam, fontWeight: 600 }}>
            Hiển thị trang <span style={{ color: "#0F172A", fontWeight: 800 }}>{trangHienTai}</span> / {tongSoTrang}
            {totalCount > 0 && ` (Tổng cộng ${totalCount} khóa học)`}
          </Typography>

          {tongSoTrang > 1 && (
            <Pagination
              count={tongSoTrang}
              page={trangHienTai}
              onChange={handlePageChange}
              shape="rounded"
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  color: MAU.chuDen,
                  fontWeight: 700,
                  borderRadius: "10px",
                  fontSize: 13.5,
                  "&:hover": { bgcolor: "#FEF2F2", color: BRAND.main },
                },
                "& .Mui-selected": {
                  bgcolor: `${BRAND.main} !important`,
                  color: "#FFFFFF !important",
                  boxShadow: `0 2px 8px ${alpha(BRAND.main, 0.3)}`,
                },
              }}
            />
          )}
        </Box>
      )}

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={!!khoaHocChoXacNhanXoa}
        onClose={dongDialogXoa}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              p: 1,
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            fontWeight: 800,
            fontSize: 18,
            color: MAU.chuDen,
            fontFamily: FONTS.display,
            pt: 2,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#FEF2F2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          Xác nhận xóa khóa học?
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <DialogContentText sx={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xóa khóa học{" "}
            <Box component="span" sx={{ fontWeight: 800, color: MAU.chuDen }}>
              &quot;{khoaHocChoXacNhanXoa?.tieuDe || "Khóa học"}&quot;
            </Box>{" "}
            không? Sau khi xác nhận, bạn sẽ có {SO_GIAY_HOAN_TAC} giây để hoàn
            tác trước khi khóa học bị xóa vĩnh viễn khỏi hệ thống.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={dongDialogXoa}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#64748B",
              borderRadius: "8px",
              px: 2,
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={xacNhanXoaTuDialog}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 800,
              bgcolor: "#DC2626",
              borderRadius: "8px",
              px: 2.5,
              boxShadow: "none",
              "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
            }}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận hủy duyệt */}
      <Dialog
        open={!!khoaHocChoHuyDuyet}
        onClose={() => !dangXuLyId && setKhoaHocChoHuyDuyet(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              p: 1,
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            fontWeight: 800,
            fontSize: 18,
            color: MAU.chuDen,
            fontFamily: FONTS.display,
            pt: 2,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#FFFBEB",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <UndoRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          Hủy yêu cầu duyệt?
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <DialogContentText sx={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn hủy yêu cầu duyệt cho khóa học{" "}
            <Box component="span" sx={{ fontWeight: 800, color: MAU.chuDen }}>
              &quot;{khoaHocChoHuyDuyet?.tieuDe || "Khóa học"}&quot;
            </Box>{" "}
            không? Khóa học sẽ được chuyển về trạng thái &quot;Đang sửa&quot; để bạn có thể tiếp tục chỉnh sửa nội dung.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setKhoaHocChoHuyDuyet(null)}
            disabled={!!dangXuLyId}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#64748B",
              borderRadius: "8px",
              px: 2,
            }}
          >
            Đóng
          </Button>
          <Button
            onClick={() =>
              khoaHocChoHuyDuyet && handleHuyDuyet(khoaHocChoHuyDuyet)
            }
            variant="contained"
            disabled={!!dangXuLyId}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              bgcolor: "#D97706",
              borderRadius: "8px",
              px: 2.5,
              boxShadow: "none",
              "&:hover": { bgcolor: "#B45309", boxShadow: "none" },
            }}
          >
            {dangXuLyId ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : (
              "Xác nhận hủy"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo hoàn tác */}
      <Snackbar
        open={!!undoInfo}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={null}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="warning"
          icon={<UndoRoundedIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={hoanTacXoa}
              sx={{
                fontWeight: 800,
                borderLeft: "1px solid rgba(0,0,0,0.1)",
                pl: 1.5,
                ml: 1,
              }}
            >
              Hoàn tác ({undoInfo?.thoiGian ?? 0}s)
            </Button>
          }
          sx={{
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            alignItems: "center",
            bgcolor: "#FFFBEB",
            color: "#D97706",
            border: "1px solid #FDE68A",
            "& .MuiAlert-icon": { color: "#D97706" },
            "& .MuiAlert-message": {
              fontWeight: 600,
            },
          }}
        >
          Đã xóa &quot;{undoInfo?.ten}&quot;
        </Alert>
      </Snackbar>

      {/* Snackbar lỗi thao tác chung */}
      <Snackbar
        open={!!thongBaoLoiThaoTac}
        autoHideDuration={6000}
        onClose={() => setThongBaoLoiThaoTac(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setThongBaoLoiThaoTac(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {thongBaoLoiThaoTac}
        </Alert>
      </Snackbar>

      {/* Snackbar thành công */}
      <Snackbar
        open={!!thongBaoThanhCong}
        autoHideDuration={5000}
        onClose={() => setThongBaoThanhCong(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setThongBaoThanhCong(null)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
        >
          {thongBaoThanhCong}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function InstructorCoursesPage() {
  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            minHeight: "100vh",
            bgcolor: "transparent",
          }}
        >
          <KhoaHocContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
