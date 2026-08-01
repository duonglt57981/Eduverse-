/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AuthGuard from "@/src/components/AuthGuard";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, KhoaHocManagerSearch } from "@/src/types/khoaHoc/Dto/dto";
import DashboardShell from "@/src/components/dashboard/DashboardShell";

const MAU = {
  chinh: "#991B1B",
  chinhDam: "#7F1D1D",
  chinhNhat: "#FEF2F2",
  vien: "#E5E7EB",
  chuDen: "#111827",
  chuXam: "#6B7280",
  nenTrang: "#FAFAF9",
};

const duongDanChiTietKhoaHoc = (id: string) =>
  `/instructor/manager-courses/${id}/manager/curriculum`;
const duongDanTaoKhoaHocMoi = "/instructor/manager-courses/create/1";
const SO_LUONG_MOI_TRANG = 10;
const SO_LUONG_MOI_TRANG_STATS = 1000;

// Các trạng thái được phép xóa khóa học
const TRANG_THAI_CHO_PHEP_XOA = ["DangSua", "DaDuyet", "TuChoi"];

// Thông tin hiển thị (nhãn + màu chữ + màu nền) cho từng trạng thái phê duyệt.
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
      return { nhan: "Từ chối", mau: "#EF4444", nen: "#FEE2E2" };
    case "DangSua":
      return { nhan: "Đang sửa", mau: "#8B5CF6", nen: "#F5F3FF" };
    default:
      return { nhan: trangThai ?? "Không rõ", mau: MAU.chuXam, nen: "#F3F4F6" };
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
    mau: "#991B1B",
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
    mau: "#EF4444",
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
          borderColor: dangChon ? MAU.chinh : "#D1D5DB",
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.04)`,
          transform: "translateY(-2px)",
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

  // State xóa khóa học
  const [xacNhanXoa, setXacNhanXoa] = useState<KhoaHocType | null>(null);
  const [dangXoa, setDangXoa] = useState(false);
  const [loiXoa, setLoiXoa] = useState<string | null>(null);

  // Hàm reset tất cả bộ lọc về trạng thái ban đầu
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
            daDuyet: items.filter((x) => x.trangThaiPheDuyet === "DaDuyet")
              .length,
            choDuyet: items.filter((x) => x.trangThaiPheDuyet === "ChoDuyet")
              .length,
            dangDuyet: items.filter((x) => x.trangThaiPheDuyet === "DangDuyet")
              .length,
            tuChoi: items.filter((x) => x.trangThaiPheDuyet === "TuChoi")
              .length,
            dangSua: items.filter((x) => x.trangThaiPheDuyet === "DangSua")
              .length,
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

  // Hàm lấy danh sách khóa học
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

        let tongSoBanGhiTuBackend = trichXuatTongSoBanGhi(data);

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
            tongSoBanGhiTuBackend = undefined;
          }
        }

        const tongSoBanGhi: number = tongSoBanGhiTuBackend ?? items.length;

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
    [tuKhoaTimKiem, trangThaiLoc, sapXep, trangHienTai, khoaHocService],
  );

  useEffect(() => {
    const abortController = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch data khi mount/filter đổi, pattern hợp lệ
    layDanhSachKhoaHoc(abortController.signal);
    fetchThongKe();
    return () => abortController.abort();
  }, [layDanhSachKhoaHoc, fetchThongKe]);

  // Handler
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

  // Hàm tải lại dữ liệu với bộ lọc hiện tại (không reset)
  const handleReload = () => {
    fetchThongKe(true);
  };

  // Hàm làm mới danh sách: reset tất cả bộ lọc về mặc định và tải lại dữ liệu
  const handleRefresh = () => {
    resetAllFilters();
    fetchThongKe(true);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleChonTrangThai = (giaTri: string) => {
    setTrangHienTai(1);
    setTrangThaiLoc(giaTri);
  };

  // Mở dialog xác nhận xóa
  const moXacNhanXoa = (khoaHoc: KhoaHocType) => {
    setLoiXoa(null);
    setXacNhanXoa(khoaHoc);
  };

  const dongXacNhanXoa = () => {
    if (dangXoa) return;
    setXacNhanXoa(null);
    setLoiXoa(null);
  };

  // Xử lý xóa khóa học
  const handleXoaKhoaHoc = async () => {
    if (!xacNhanXoa?.id) return;
    setDangXoa(true);
    setLoiXoa(null);
    try {
      const response = await khoaHocService.DeleteKhoaHoc(xacNhanXoa.id);
      if (!laThanhCong(response)) {
        setLoiXoa(response?.message || "Không thể xóa khóa học này.");
        return;
      }
      setThongBaoThanhCong(
        `Đã xóa khóa học "${xacNhanXoa.tieuDe ?? ""}" thành công.`,
      );
      setXacNhanXoa(null);

      const seLaTrangTrong = danhSachKhoaHoc.length === 1 && trangHienTai > 1;
      if (seLaTrangTrong) {
        setTrangHienTai((trang) => trang - 1);
      } else {
        await layDanhSachKhoaHoc();
      }
      await fetchThongKe(true);
    } catch (error) {
      console.error("Lỗi xóa khóa học:", error);
      setLoiXoa(trichXuatThongBaoLoi(error, "Có lỗi xảy ra khi xóa khóa học."));
    } finally {
      setDangXoa(false);
    }
  };

  // Render
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
          <Tooltip title="Quay lại">
            <IconButton
              onClick={handleGoBack}
              sx={{
                border: `1px solid ${MAU.vien}`,
                borderRadius: "12px",
                color: MAU.chuDen,
                bgcolor: "#fff",
                "&:hover": {
                  borderColor: MAU.chinh,
                  color: MAU.chinh,
                  bgcolor: MAU.chinhNhat,
                },
              }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: 28, color: MAU.chuDen }}
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
          bgcolor: "var(--ev-paper, #ffffff)",
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
              bgcolor: "var(--ev-paper-alt, #F9FAFB)",
              "& fieldset": { borderColor: MAU.vien },
              "&:hover fieldset": { borderColor: "var(--ev-divider, #D1D5DB)" },
              "&.Mui-focused fieldset": { borderColor: MAU.chinh },
              "&.Mui-focused": {
                bgcolor: "var(--ev-paper, #ffffff)",
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
            bgcolor: "var(--ev-paper-alt, #F9FAFB)",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: MAU.vien },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#D1D5DB",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: MAU.chinh,
            },
            "&.Mui-focused": {
              bgcolor: "var(--ev-paper, #ffffff)",
              boxShadow: `0 0 0 3px ${alpha(MAU.chinh, 0.08)}`,
            },
          }}
        >
          <MenuItem value="moi-nhat">Mới nhất</MenuItem>
          <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
          <MenuItem value="ten-a-z">Tên A-Z</MenuItem>
          <MenuItem value="hoc-vien-nhieu-nhat">Nhiều học viên nhất</MenuItem>
        </Select>

        {/* Nút tải lại dữ liệu với bộ lọc hiện tại */}
        <Tooltip title="Tải lại dữ liệu với bộ lọc hiện tại">
          <IconButton
            onClick={handleReload}
            disabled={dangTai}
            sx={{
              color: MAU.chinh,
              bgcolor: "#F9FAFB",
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

        {/* Nút reset bộ lọc và tải lại */}
        <Tooltip title="Đặt lại bộ lọc & làm mới">
          <IconButton
            onClick={handleRefresh}
            sx={{
              color: MAU.chinh,
              bgcolor: "var(--ev-paper-alt, #F9FAFB)",
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
            bgcolor: "var(--ev-paper, #ffffff)",
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
            bgcolor: "var(--ev-paper, #ffffff)",
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
                    bgcolor: "var(--ev-paper, #ffffff)",
                    overflow: "hidden",
                    position: "relative",
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.04)",
                      borderColor: MAU.chinh,
                      transform: "translateY(-3px)",
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
                      bgcolor: "var(--ev-paper-alt, #F3F4F6)",
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
                                moXacNhanXoa(khoaHoc);
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

      {/* Dialog xác nhận xóa khóa học */}
      <Dialog
        open={!!xacNhanXoa}
        onClose={dongXacNhanXoa}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#c62828" }}>
          Xóa khóa học
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: MAU.chuXam, mb: loiXoa ? 1.5 : 0 }}>
            Bạn chắc chắn muốn xóa khóa học &quot;
            <strong>{xacNhanXoa?.tieuDe ?? ""}</strong>&quot;? Hành động này
            không thể hoàn tác.
          </Typography>
          {loiXoa && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {loiXoa}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={dongXacNhanXoa}
            disabled={dangXoa}
            sx={{ textTransform: "none", color: MAU.chuXam }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleXoaKhoaHoc}
            disabled={dangXoa}
            sx={{
              bgcolor: "#c62828",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": { bgcolor: "#a02020", boxShadow: "none" },
            }}
          >
            {dangXoa ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Xác nhận xóa"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
            bgcolor: "#FAFAF9",
          }}
        >
          <KhoaHocContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
