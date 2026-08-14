/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
  Grid,
  Paper,
  alpha,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import UndoIcon from "@mui/icons-material/Undo";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AuthGuard from "@/src/components/AuthGuard";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, KhoaHocManagerSearch } from "@/src/types/khoaHoc/Dto/dto";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { BRAND, NEUTRAL } from "@/src/theme/tokens";

const MAU = {
  chinh: BRAND.main,
  chinhDam: BRAND.dark,
  chinhNhat: BRAND.light,
  vien: NEUTRAL.divider,
  chuDen: NEUTRAL.textPrimary,
  chuXam: NEUTRAL.textMuted,
  nenTrang: NEUTRAL.bg,
};

const duongDanChiTietKhoaHoc = (id: string) =>
  `/instructor/manager-courses/${id}/manager/curriculum`;
const duongDanTaoKhoaHocMoi = "/instructor/manager-courses/create/1";
const SO_LUONG_MOI_TRANG = 10;
const SO_LUONG_MOI_TRANG_STATS = 1000;
const SO_GIAY_HOAN_TAC = 10;

// Các trạng thái được phép xóa khóa học
const TRANG_THAI_CHO_PHEP_XOA = ["DangSua", "DaDuyet", "TuChoi"];

// Thông tin hiển thị cho trạng thái
function thongTinTrangThaiPheDuyet(trangThai?: string): {
  nhan: string;
  mau: string;
  nen: string;
} {
  switch (trangThai) {
    case "ChoDuyet":
      return { nhan: "Chờ duyệt", mau: "#F59E0B", nen: "#FEF3C7" };
    case "DaDuyet":
      return { nhan: "Đã duyệt", mau: "#10B981", nen: "#E6F4EA" };
    case "DangDuyet":
      return { nhan: "Đang duyệt", mau: "#3B82F6", nen: "#DBEAFE" };
    case "TuChoi":
      return { nhan: "Từ chối", mau: "#DC2626", nen: "#FEE2E2" };
    case "DangSua":
      return { nhan: "Đang sửa", mau: "#8B5CF6", nen: "#F5F3FF" };
    default:
      return { nhan: trangThai ?? "Không rõ", mau: MAU.chuXam, nen: "#FBFAF9" };
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
}

const CAU_HINH_TRANG_THAI: CauHinhTrangThai[] = [
  {
    giaTri: "TatCa",
    khoaThongKe: "tong",
    nhan: "Tất cả",
    icon: <SchoolOutlinedIcon fontSize="small" />,
    mau: "#8B1313",
    nen: "#FEF2F2",
  },
  {
    giaTri: "DaDuyet",
    khoaThongKe: "daDuyet",
    nhan: "Đã duyệt",
    icon: <CheckCircleIcon fontSize="small" />,
    mau: "#10B981",
    nen: "#E6F4EA",
  },
  {
    giaTri: "ChoDuyet",
    khoaThongKe: "choDuyet",
    nhan: "Chờ duyệt",
    icon: <PendingIcon fontSize="small" />,
    mau: "#F59E0B",
    nen: "#FEF3C7",
  },
  {
    giaTri: "DangDuyet",
    khoaThongKe: "dangDuyet",
    nhan: "Đang duyệt",
    icon: <HourglassEmptyIcon fontSize="small" />,
    mau: "#3B82F6",
    nen: "#DBEAFE",
  },
  {
    giaTri: "TuChoi",
    khoaThongKe: "tuChoi",
    nhan: "Từ chối",
    icon: <CancelIcon fontSize="small" />,
    mau: "#DC2626",
    nen: "#FEE2E2",
  },
  {
    giaTri: "DangSua",
    khoaThongKe: "dangSua",
    nhan: "Đang sửa",
    icon: <EditNoteIcon fontSize="small" />,
    mau: "#8B5CF6",
    nen: "#F5F3FF",
  },
];

interface ThongKeState {
  tong: number;
  daDuyet: number;
  choDuyet: number;
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
    return <CircularProgress size={20} sx={{ color: mau }} />;
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
        p: 1.5,
        borderRadius: "12px",
        bgcolor: dangChon ? MAU.chinhNhat : "#ffffff",
        textAlign: "left",
        border: dangChon ? `2px solid ${MAU.chinh}` : `1px solid ${MAU.vien}`,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        height: "100%",
        boxShadow: dangChon ? `0 4px 12px ${alpha(MAU.chinh, 0.08)}` : "none",
        "&:hover": {
          borderColor: dangChon ? MAU.chinh : "#ECE7E4",
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.04)`,
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: "8px",
          bgcolor: cauHinh.nen,
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
            fontWeight: 800,
            fontSize: 16,
            color: MAU.chuDen,
            lineHeight: 1.2,
          }}
        >
          <GiaTriThongKe dangTai={dangTai} giaTri={giaTri} mau={cauHinh.mau} />
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            color: MAU.chuXam,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
            console.warn(
              "⚠️ Backend chưa lọc theo trangThaiPheDuyet, lọc bổ sung ở client.",
            );
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
  const handleViewDetail = (khoaHoc: KhoaHocType) => {
    if (khoaHoc.id) router.push(duongDanChiTietKhoaHoc(khoaHoc.id));
  };

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
    let showView: boolean;
    switch (trangThaiPheDuyet) {
      case "DaDuyet":
      case "TuChoi":
        showEdit = true;
        showView = true;
        break;
      case "DangSua":
        showEdit = true;
        showView = false;
        break;
      case "ChoDuyet":
      case "DangDuyet":
        showEdit = false;
        showView = true;
        break;
      default:
        showEdit = true;
        showView = true;
        break;
    }
    const showDelete = TRANG_THAI_CHO_PHEP_XOA.includes(
      trangThaiPheDuyet ?? "",
    );
    return { showEdit, showView, showDelete };
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

  // ===== Dialog xác nhận xóa =====
  const mopDialogXoa = (khoaHoc: KhoaHocType) => {
    if (!khoaHoc.id) return;
    // Kiểm tra trạng thái có cho phép xóa không
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

    // Ẩn khóa học ngay lập tức (optimistic UI)
    setHiddenIds((prev) => [...prev, id]);

    // Hiển thị thông báo hoàn tác
    setUndoInfo({
      id,
      ten: khoaHoc.tieuDe || "Khóa học",
      thoiGian: SO_GIAY_HOAN_TAC,
    });

    // Xóa timer cũ nếu có (đề phòng bấm xóa lại trong lúc chờ)
    if (deleteTimers.current[id]) {
      clearTimeout(deleteTimers.current[id]);
      delete deleteTimers.current[id];
    }
    if (countdownTimers.current[id]) {
      clearInterval(countdownTimers.current[id]);
      delete countdownTimers.current[id];
    }

    // Đếm ngược hiển thị mỗi giây
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

    // Bắt đầu đếm ngược 10 giây rồi xóa thật
    const timer = setTimeout(async () => {
      try {
        const response = await khoaHocService.DeleteKhoaHoc(id);
        if (laThanhCong(response)) {
          // Xóa thành công: loại bỏ khỏi danh sách thật
          setDanhSachKhoaHoc((prev) => prev.filter((c) => c.id !== id));
          setThongBaoThanhCong(
            `Đã xóa khóa học "${khoaHoc.tieuDe}" thành công.`,
          );
          // Cập nhật thống kê
          await fetchThongKe(true);
        } else {
          // Xóa thất bại: hiển thị lại khóa học
          setHiddenIds((prev) => prev.filter((itemId) => itemId !== id));
          setThongBaoLoiThaoTac(
            response?.message || "Không thể xóa khóa học. Vui lòng thử lại.",
          );
        }
      } catch (error) {
        console.error("Lỗi xóa khóa học:", error);
        // Xóa thất bại: hiển thị lại
        setHiddenIds((prev) => prev.filter((itemId) => itemId !== id));
        setThongBaoLoiThaoTac(
          trichXuatThongBaoLoi(error, "Có lỗi xảy ra khi xóa khóa học."),
        );
      } finally {
        // Xóa thông báo hoàn tác + dọn dẹp timer đếm ngược
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
    // Hủy timer xóa
    if (deleteTimers.current[id]) {
      clearTimeout(deleteTimers.current[id]);
      delete deleteTimers.current[id];
    }
    // Hủy timer đếm ngược
    if (countdownTimers.current[id]) {
      clearInterval(countdownTimers.current[id]);
      delete countdownTimers.current[id];
    }
    // Hiện lại khóa học
    setHiddenIds((prev) => prev.filter((item) => item !== id));
    setUndoInfo(null);
  };

  // ===== Render =====
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box>
            <Typography
              sx={{ fontWeight: 900, fontSize: 26, color: MAU.chuDen }}
            >
              Các khóa học
            </Typography>
            <Typography sx={{ fontSize: 14, color: MAU.chuXam, mt: 0.5 }}>
              Quản lý và theo dõi toàn bộ khóa học bạn đang giảng dạy
              {totalCount > 0 && ` (${totalCount} khóa học)`}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push(duongDanTaoKhoaHocMoi)}
          sx={{
            bgcolor: MAU.chinh,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: "12px",
            boxShadow: "0 6px 16px rgba(139,19,19,0.25)",
            "&:hover": {
              bgcolor: MAU.chinhDam,
              boxShadow: "0 8px 20px rgba(139,19,19,0.32)",
            },
          }}
        >
          Khóa học mới
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value="khoa-hoc"
        sx={{
          borderBottom: `1px solid ${MAU.vien}`,
          mb: 3,
          minHeight: 40,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            minHeight: 40,
            color: MAU.chuXam,
          },
          "& .Mui-selected": { color: `${MAU.chinh} !important` },
          "& .MuiTabs-indicator": {
            bgcolor: MAU.chinh,
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        <Tab label="Các khóa học" value="khoa-hoc" />
      </Tabs>

      {/* Thống kê / bộ lọc nhanh theo trạng thái */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {CAU_HINH_TRANG_THAI.map((cauHinh) => (
          <Grid key={cauHinh.giaTri} size={{ xs: 6, sm: 4, md: 2 }}>
            <TheTrangThai
              cauHinh={cauHinh}
              giaTri={thongKe[cauHinh.khoaThongKe]}
              dangChon={trangThaiLoc === cauHinh.giaTri}
              dangTai={dangTaiThongKe}
              onClick={() => handleChonTrangThai(cauHinh.giaTri)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Thanh tìm kiếm & sắp xếp */}
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          p: 1.5,
          mb: 3,
          borderRadius: "12px",
          border: `1px solid ${MAU.vien}`,
          bgcolor: "var(--ev-paper, #FFFFFF)",
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm kiếm khóa học theo tên..."
          value={tuKhoaTimKiem}
          onChange={(e) => {
            setTrangHienTai(1);
            setTuKhoaTimKiem(e.target.value);
          }}
          sx={{
            flex: 1,
            minWidth: 220,
            "& .MuiOutlinedInput-root": {
              height: "42px",
              borderRadius: "10px",
              bgcolor: "var(--ev-paper-alt, #FBFAF9)",
              "& fieldset": { borderColor: MAU.vien },
              "&:hover fieldset": { borderColor: "var(--ev-divider, #ECE7E4)" },
              "&.Mui-focused fieldset": { borderColor: MAU.chinh },
              "&.Mui-focused": {
                bgcolor: "var(--ev-paper, #FFFFFF)",
                boxShadow: `0 0 0 3px ${alpha(MAU.chinh, 0.08)}`,
              },
            },
            "& .MuiOutlinedInput-input": {
              color: MAU.chuDen,
              fontSize: 14,
              fontWeight: 500,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: MAU.chuXam, fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Select
          size="small"
          value={sapXep}
          onChange={(e) => {
            setTrangHienTai(1);
            setSapXep(e.target.value);
          }}
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.5 }}>
              <SwapVertIcon sx={{ color: MAU.chuXam, fontSize: 20 }} />
            </InputAdornment>
          }
          sx={{
            minWidth: 195,
            height: "42px",
            borderRadius: "10px",
            color: MAU.chuDen,
            fontSize: 14,
            fontWeight: 600,
            bgcolor: "var(--ev-paper-alt, #FBFAF9)",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: MAU.vien },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--ev-divider, #ECE7E4)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: MAU.chinh,
            },
            "&.Mui-focused": {
              bgcolor: "var(--ev-paper, #FFFFFF)",
              boxShadow: `0 0 0 3px ${alpha(MAU.chinh, 0.08)}`,
            },
          }}
        >
          <MenuItem value="moi-nhat">Mới nhất</MenuItem>
          <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
          <MenuItem value="ten-a-z">Tên A-Z</MenuItem>
          <MenuItem value="hoc-vien-nhieu-nhat">Nhiều học viên nhất</MenuItem>
        </Select>

        <Tooltip title="Tải lại dữ liệu với bộ lọc hiện tại">
          <IconButton
            onClick={handleReload}
            disabled={dangTai}
            sx={{
              color: MAU.chinh,
              bgcolor: "var(--ev-paper-alt, #FBFAF9)",
              border: `1px solid ${MAU.vien}`,
              borderRadius: "10px",
              width: "42px",
              height: "42px",
              "&:hover": {
                bgcolor: MAU.chinhNhat,
                borderColor: MAU.chinh,
              },
              "&.Mui-disabled": {
                opacity: 0.5,
              },
            }}
          >
            {dangTai ? (
              <CircularProgress size={20} sx={{ color: MAU.chinh }} />
            ) : (
              <RefreshIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Đặt lại bộ lọc & làm mới">
          <IconButton
            onClick={handleRefresh}
            sx={{
              color: MAU.chinh,
              bgcolor: "var(--ev-paper-alt, #FBFAF9)",
              border: `1px solid ${MAU.vien}`,
              borderRadius: "10px",
              width: "42px",
              height: "42px",
              "&:hover": {
                bgcolor: MAU.chinhNhat,
                borderColor: MAU.chinh,
              },
            }}
          >
            <RestartAltRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Chip hiển thị bộ lọc trạng thái đang áp dụng */}
      {trangThaiLoc !== "TatCa" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: MAU.chuXam }}>
            Đang lọc:
          </Typography>
          <Chip
            label={thongTinTrangThaiPheDuyet(trangThaiLoc).nhan}
            size="small"
            onDelete={() => handleChonTrangThai("TatCa")}
            sx={{
              bgcolor: thongTinTrangThaiPheDuyet(trangThaiLoc).nen,
              color: thongTinTrangThaiPheDuyet(trangThaiLoc).mau,
              fontWeight: 700,
              fontSize: 12,
            }}
          />
        </Box>
      )}

      {/* Trạng thái tải / lỗi / rỗng */}
      {dangTai && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: MAU.chinh }} />
        </Box>
      )}
      {!dangTai && loi && (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 6,
            px: 4,
            borderRadius: "12px",
            border: `1px solid ${MAU.vien}`,
            bgcolor: "var(--ev-paper, #FFFFFF)",
          }}
        >
          <Typography
            sx={{ color: "#c62828", fontWeight: 700, fontSize: 16, mb: 2 }}
          >
            {loi}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleReload}
            sx={{
              borderColor: MAU.chinh,
              color: MAU.chinh,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              "&:hover": {
                borderColor: MAU.chinhDam,
                bgcolor: MAU.chinhNhat,
              },
            }}
          >
            Thử lại
          </Button>
        </Paper>
      )}
      {!dangTai && !loi && danhSachKhoaHoc.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            borderRadius: "12px",
            border: `1px dashed ${MAU.vien}`,
            bgcolor: "var(--ev-paper, #FFFFFF)",
          }}
        >
          <SchoolOutlinedIcon
            sx={{ fontSize: 48, color: MAU.chinh, opacity: 0.6, mb: 2 }}
          />
          <Typography
            sx={{ color: MAU.chuDen, fontWeight: 700, fontSize: 18, mb: 1 }}
          >
            Chưa có khóa học nào
          </Typography>
          <Typography
            sx={{ color: MAU.chuXam, fontWeight: 500, fontSize: 14, mb: 3 }}
          >
            Bắt đầu chia sẻ kiến thức của bạn bằng cách tạo khóa học đầu tiên
            ngay hôm nay!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(duongDanTaoKhoaHocMoi)}
            sx={{
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: "10px",
              "&:hover": { bgcolor: MAU.chinhDam },
            }}
          >
            Tạo khóa học mới
          </Button>
        </Paper>
      )}

      {/* Danh sách khóa học dạng Grid */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Grid container spacing={3.5}>
          {danhSachKhoaHoc.map((khoaHoc) => {
            const pheDuyet = thongTinTrangThaiPheDuyet(
              khoaHoc.trangThaiPheDuyet,
            );
            const isDraft = khoaHoc.isBanHienTai === false;
            const actions = getAvailableActions(khoaHoc.trangThaiPheDuyet);
            const dangXuLyItemNay = dangXuLyId === khoaHoc.id;

            return (
              <Grid key={khoaHoc.id} size={{ xs: 12 }}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    borderRadius: "16px",
                    border: `1px solid ${isDraft ? "#FECACA" : MAU.vien}`,
                    bgcolor: "var(--ev-paper, #FFFFFF)",
                    overflow: "hidden",
                    position: "relative",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.04)",
                      borderColor: MAU.chinh,
                    },
                  }}
                >
                  {/* Thumbnail / Image Area */}
                  <Box
                    onClick={() => xuLyBamKhoaHoc(khoaHoc.id)}
                    sx={{
                      position: "relative",
                      width: { xs: "100%", sm: "220px", md: "260px" },
                      height: { xs: "160px", sm: "auto" },
                      minHeight: { sm: "146px" },
                      flexShrink: 0,
                      cursor: "pointer",
                      bgcolor: "var(--ev-paper-alt, #FBFAF9)",
                      overflow: "hidden",
                      borderRight: { sm: `1px solid ${MAU.vien}` },
                      borderBottom: { xs: `1px solid ${MAU.vien}`, sm: "none" },
                    }}
                  >
                    {khoaHoc.hinhAnhKhoaHoc ? (
                      <Image
                        src={khoaHoc.hinhAnhKhoaHoc}
                        alt={khoaHoc.tieuDe ?? "Khóa học"}
                        fill
                        sizes="(max-width: 600px) 100vw, 260px"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(135deg, ${MAU.chinhNhat} 0%, #FEE2E2 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArticleOutlinedIcon
                          sx={{ color: MAU.chinh, fontSize: 40, opacity: 0.6 }}
                        />
                      </Box>
                    )}

                    {isDraft && (
                      <Chip
                        label="Bản nháp"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          bgcolor: MAU.chinh,
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: 10,
                          height: 20,
                          textTransform: "uppercase",
                          boxShadow: `0 2px 8px ${alpha(MAU.chinh, 0.3)}`,
                        }}
                      />
                    )}
                  </Box>

                  {/* Body Content Area */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      flexGrow: 1,
                      justifyContent: "space-between",
                      alignItems: { xs: "stretch", md: "center" },
                      gap: 2.5,
                    }}
                  >
                    {/* Metadata & Title & Stats block */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: "center",
                          mb: 1,
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: MAU.chuXam,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {khoaHoc.capDo || "Tất cả cấp độ"}
                        </Typography>

                        <Chip
                          label={pheDuyet.nhan}
                          size="small"
                          sx={{
                            fontWeight: 750,
                            fontSize: 10.5,
                            borderRadius: "6px",
                            height: "20px",
                            color: pheDuyet.mau,
                            bgcolor: pheDuyet.nen,
                          }}
                        />
                      </Stack>

                      <Typography
                        onClick={() => xuLyBamKhoaHoc(khoaHoc.id)}
                        sx={{
                          fontWeight: 800,
                          fontSize: 16.5,
                          color: MAU.chuDen,
                          mb: 1.5,
                          cursor: "pointer",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          transition: "color 0.2s ease",
                          "&:hover": {
                            color: MAU.chinh,
                          },
                        }}
                      >
                        {khoaHoc.tieuDe ?? "Chưa đặt tên"}
                      </Typography>

                      {/* Giá khóa học */}
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: 15.5,
                          color: MAU.chuDen,
                        }}
                      >
                        {khoaHoc.giaGoc === 0
                          ? "Miễn phí"
                          : `${(khoaHoc.giaGoc ?? 0).toLocaleString()}đ`}
                      </Typography>
                    </Box>

                    {/* Actions Group on the right */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "flex-end", md: "center" },
                        gap: 1.2,
                        borderTop: { xs: `1px solid ${MAU.vien}`, md: "none" },
                        pt: { xs: 1.5, md: 0 },
                      }}
                    >
                      {actions.showView && (
                        <Tooltip title="Chi tiết">
                          <IconButton
                            size="medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(khoaHoc);
                            }}
                            sx={{
                              color: MAU.chinh,
                              bgcolor: MAU.chinhNhat,
                              borderRadius: "10px",
                              "&:hover": {
                                bgcolor: MAU.chinhDam,
                                color: "#fff",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {actions.showEdit && (
                        <Tooltip title="Chỉnh sửa">
                          <span>
                            <IconButton
                              size="medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(khoaHoc);
                              }}
                              disabled={dangXuLyItemNay}
                              sx={{
                                color: MAU.chinh,
                                bgcolor: MAU.chinhNhat,
                                borderRadius: "10px",
                                "&:hover": {
                                  bgcolor: MAU.chinhDam,
                                  color: "#fff",
                                },
                                transition: "all 0.2s",
                              }}
                            >
                              {dangXuLyItemNay ? (
                                <CircularProgress
                                  size={18}
                                  sx={{ color: MAU.chinh }}
                                />
                              ) : (
                                <EditIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      {actions.showDelete && (
                        <Tooltip title="Xóa khóa học">
                          <span>
                            <IconButton
                              size="medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                mopDialogXoa(khoaHoc);
                              }}
                              disabled={dangXuLyItemNay}
                              sx={{
                                color: "#DC2626",
                                bgcolor: "#FEF2F2",
                                borderRadius: "10px",
                                "&:hover": {
                                  bgcolor: "#DC2626",
                                  color: "#fff",
                                },
                                transition: "all 0.2s",
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Phân trang */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mt: 4,
          }}
        >
          <Typography sx={{ fontSize: 13, color: MAU.chuXam, fontWeight: 500 }}>
            Trang {trangHienTai}/{tongSoTrang}
            {totalCount > 0 && ` · ${totalCount} khóa học`}
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
                  fontWeight: 600,
                  borderRadius: "10px",
                },
                "& .Mui-selected": {
                  bgcolor: `${MAU.chinh} !important`,
                  color: "#fff",
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
          paper: { sx: { borderRadius: "16px" } },
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
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#FEF2F2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon fontSize="small" />
          </Box>
          Xóa khóa học?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: MAU.chuXam, fontSize: 14.5 }}>
            Bạn có chắc chắn muốn xóa khóa học{" "}
            <Box component="span" sx={{ fontWeight: 700, color: MAU.chuDen }}>
              &quot;{khoaHocChoXacNhanXoa?.tieuDe || "Khóa học"}&quot;
            </Box>{" "}
            không? Sau khi xác nhận, bạn sẽ có {SO_GIAY_HOAN_TAC} giây để hoàn
            tác trước khi khóa học bị xóa vĩnh viễn.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={dongDialogXoa}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: MAU.chuXam,
              borderRadius: "10px",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={xacNhanXoaTuDialog}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#DC2626",
              borderRadius: "10px",
              "&:hover": { bgcolor: "#B91C1C" },
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo hoàn tác - gọn hơn */}
      <Snackbar
        open={!!undoInfo}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={null} // không tự đóng
        sx={{ mb: 2 }}
      >
        <Alert
          severity="warning"
          icon={<UndoIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={hoanTacXoa}
              sx={{
                fontWeight: 700,
                borderLeft: "1px solid rgba(0,0,0,0.1)",
                pl: 1.5,
                ml: 1,
              }}
            >
              Hoàn tác ({undoInfo?.thoiGian ?? 0}s)
            </Button>
          }
          sx={{
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            alignItems: "center",
            bgcolor: "#FFF3E0",
            color: "#E65100",
            "& .MuiAlert-icon": { color: "#E65100" },
            "& .MuiAlert-message": {
              fontWeight: 500,
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
          sx={{ width: "100%" }}
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
          sx={{ width: "100%" }}
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
            p: { xs: 2, md: 4 },
            minHeight: "100vh",
            bgcolor: "var(--ev-bg, #F7F5F2)",
          }}
        >
          <KhoaHocContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
