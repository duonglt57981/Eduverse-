/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Stack,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  chinh: "#8B1313",
  chinhDam: "#5C0D0D",
  chinhNhat: "#FBEFEF",
  vien: "#F0DEDE",
  chuDen: "#231313",
  chuXam: "#8A7676",
};

const duongDanChiTietKhoaHoc = (id: string) =>
  `/instructor/manager-courses/${id}/manager/curriculum`;
const duongDanTaoKhoaHocMoi = "/instructor/manager-courses/create/1";
const SO_LUONG_MOI_TRANG = 20;
const SO_LUONG_MOI_TRANG_STATS = 1000;

// Các trạng thái được phép xóa khóa học
const TRANG_THAI_CHO_PHEP_XOA = ["DangSua", "DaDuyet", "TuChoi"];

function thongTinTrangThaiPheDuyet(trangThai?: string): {
  nhan: string;
  mau: "default" | "warning" | "success" | "error";
} {
  switch (trangThai) {
    case "ChoDuyet":
      return { nhan: "Chờ duyệt", mau: "warning" };
    case "DaDuyet":
      return { nhan: "Đã duyệt", mau: "success" };
    case "TuChoi":
      return { nhan: "Từ chối", mau: "error" };
    case "DangSua":
      return { nhan: "Đang sửa", mau: "default" };
    default:
      return { nhan: trangThai ?? "Không rõ", mau: "default" };
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

// ─── Thống kê / bộ lọc theo trạng thái ──────────────────────────────────────

type KhoaThongKe =
  | "tong"
  | "daDuyet"
  | "choDuyet"
  | "dangDuyet"
  | "tuChoi"
  | "dangSua";

interface CauHinhTrangThai {
  giaTri: string; // giá trị dùng cho trangThaiLoc / API
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
    mau: MAU.chinh,
    nen: MAU.chinhNhat,
  },
  {
    giaTri: "DaDuyet",
    khoaThongKe: "daDuyet",
    nhan: "Đã duyệt",
    icon: <CheckCircleIcon fontSize="small" />,
    mau: "#2e7d32",
    nen: "#e8f5e9",
  },
  {
    giaTri: "ChoDuyet",
    khoaThongKe: "choDuyet",
    nhan: "Chờ duyệt",
    icon: <PendingIcon fontSize="small" />,
    mau: "#e65100",
    nen: "#fff3e0",
  },
  {
    giaTri: "DangDuyet",
    khoaThongKe: "dangDuyet",
    nhan: "Đang duyệt",
    icon: <HourglassEmptyIcon fontSize="small" />,
    mau: "#0277bd",
    nen: "#e3f2fd",
  },
  {
    giaTri: "TuChoi",
    khoaThongKe: "tuChoi",
    nhan: "Từ chối",
    icon: <CancelIcon fontSize="small" />,
    mau: "#c62828",
    nen: "#ffebee",
  },
  {
    giaTri: "DangSua",
    khoaThongKe: "dangSua",
    nhan: "Đang sửa",
    icon: <EditNoteIcon fontSize="small" />,
    mau: "#9c27b0",
    nen: "#f3e5f5",
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

// Tách riêng phần hiển thị số liệu để tránh children kiểu union (number | Element)
// làm TypeScript suy luận sai overload của Typography.
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
        p: 1.75,
        borderRadius: "16px",
        bgcolor: dangChon ? cauHinh.nen : "#fff",
        textAlign: "left",
        border: dangChon ? `1.5px solid ${cauHinh.mau}` : "1px solid #EFE7E7",
        cursor: "pointer",
        userSelect: "none",
        transition: "all .18s ease",
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        height: "100%",
        boxShadow: dangChon ? `0 6px 16px ${alpha(cauHinh.mau, 0.18)}` : "none",
        "&:hover": {
          borderColor: cauHinh.mau,
          boxShadow: `0 6px 16px ${alpha(cauHinh.mau, 0.16)}`,
          transform: "translateY(-2px)",
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
          color: cauHinh.mau,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {cauHinh.icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 20,
            color: cauHinh.mau,
            lineHeight: 1.1,
          }}
        >
          <GiaTriThongKe dangTai={dangTai} giaTri={giaTri} mau={cauHinh.mau} />
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5,
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

        const data = response.data;
        let items = data.items || [];

        if (searchParams.trangThai && searchParams.trangThai !== "TatCa") {
          const filtered = items.filter(
            (item) => item.trangThaiPheDuyet === searchParams.trangThai,
          );
          if (filtered.length !== items.length) {
            console.warn(
              "⚠️ Backend chưa lọc theo trangThaiPheDuyet, lọc bổ sung ở client.",
            );
            items = filtered;
          }
        }

        setDanhSachKhoaHoc(items);
        setTotalCount(items.length);
        setTongSoTrang(
          Math.max(1, Math.ceil(items.length / SO_LUONG_MOI_TRANG)),
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    layDanhSachKhoaHoc(abortController.signal);
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleRefresh = () => {
    layDanhSachKhoaHoc();
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
      await Promise.all([layDanhSachKhoaHoc(), fetchThongKe(true)]);
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

      {/* Thống kê / bộ lọc nhanh theo trạng thái — click để lọc luôn */}
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
          p: 1.25,
          mb: 3,
          borderRadius: "16px",
          border: `1px solid ${MAU.vien}`,
          bgcolor: "#fff",
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
              borderRadius: "12px",
              bgcolor: MAU.chinhNhat,
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: MAU.vien },
              "&.Mui-focused fieldset": { borderColor: MAU.chinh },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: MAU.chinh, fontSize: 20 }} />
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
              <SwapVertIcon sx={{ color: MAU.chinh, fontSize: 20 }} />
            </InputAdornment>
          }
          sx={{
            minWidth: 190,
            borderRadius: "12px",
            color: MAU.chinh,
            fontWeight: 600,
            bgcolor: MAU.chinhNhat,
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          }}
        >
          <MenuItem value="moi-nhat">Mới nhất</MenuItem>
          <MenuItem value="cu-nhat">Cũ nhất</MenuItem>
          <MenuItem value="ten-a-z">Tên A-Z</MenuItem>
          <MenuItem value="hoc-vien-nhieu-nhat">Nhiều học viên nhất</MenuItem>
        </Select>

        <Tooltip title="Làm mới danh sách">
          <IconButton
            onClick={handleRefresh}
            sx={{
              color: MAU.chinh,
              bgcolor: MAU.chinhNhat,
              borderRadius: "12px",
              p: 1,
              "&:hover": { bgcolor: MAU.vien },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Chip hiển thị bộ lọc trạng thái đang áp dụng (nếu khác "Tất cả") */}
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
              bgcolor: MAU.chinhNhat,
              color: MAU.chinh,
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
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderRadius: "16px",
            bgcolor: "#FDECEC",
          }}
        >
          <Typography sx={{ color: "#c62828", fontWeight: 600 }}>
            {loi}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            sx={{ mt: 2, textTransform: "none" }}
          >
            Thử lại
          </Button>
        </Box>
      )}
      {!dangTai && !loi && danhSachKhoaHoc.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            borderRadius: "16px",
            border: `1px dashed ${MAU.vien}`,
          }}
        >
          <SchoolOutlinedIcon
            sx={{ fontSize: 40, color: MAU.chinh, opacity: 0.5, mb: 1 }}
          />
          <Typography sx={{ color: MAU.chuXam, fontWeight: 500 }}>
            Bạn chưa có khóa học nào.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(duongDanTaoKhoaHocMoi)}
            sx={{
              mt: 2,
              bgcolor: MAU.chinh,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: MAU.chinhDam },
            }}
          >
            Tạo khóa học mới
          </Button>
        </Box>
      )}

      {/* Danh sách khóa học */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {danhSachKhoaHoc.map((khoaHoc) => {
            const pheDuyet = thongTinTrangThaiPheDuyet(
              khoaHoc.trangThaiPheDuyet,
            );
            const isDraft = khoaHoc.isBanHienTai === false;
            const actions = getAvailableActions(khoaHoc.trangThaiPheDuyet);
            const dangXuLyItemNay = dangXuLyId === khoaHoc.id;

            return (
              <Box
                key={khoaHoc.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  border: `1px solid ${isDraft ? MAU.chinh : MAU.vien}`,
                  borderRadius: "16px",
                  p: 1.5,
                  transition: "all .18s ease",
                  bgcolor: isDraft ? MAU.chinhNhat : "transparent",
                  "&:hover": {
                    boxShadow: "0 8px 22px rgba(139,19,19,0.10)",
                    borderColor: MAU.chinh,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box
                  onClick={() => xuLyBamKhoaHoc(khoaHoc.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    flex: 1,
                    cursor: "pointer",
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 128,
                      height: 84,
                      flexShrink: 0,
                      borderRadius: "12px",
                      overflow: "hidden",
                      bgcolor: MAU.chinhNhat,
                    }}
                  >
                    {khoaHoc.hinhAnhKhoaHoc ? (
                      <Image
                        src={khoaHoc.hinhAnhKhoaHoc}
                        alt={khoaHoc.tieuDe ?? "Khóa học"}
                        fill
                        sizes="128px"
                        style={{ objectFit: "cover" }}
                        unoptimized
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArticleOutlinedIcon
                          sx={{ color: MAU.chinh, opacity: 0.4 }}
                        />
                      </Box>
                    )}
                    {isDraft && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: MAU.chinh,
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        Nháp
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: MAU.chuDen,
                        mb: 0.75,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {khoaHoc.tieuDe ?? "Chưa đặt tên"}
                      {isDraft && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 11,
                            color: MAU.chinh,
                            fontWeight: 600,
                            ml: 1,
                          }}
                        >
                          (Bản nháp)
                        </Typography>
                      )}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={pheDuyet.nhan}
                        color={pheDuyet.mau}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          borderRadius: "8px",
                        }}
                      />
                      {khoaHoc.capDo && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: MAU.chuXam,
                            fontWeight: 500,
                          }}
                        >
                          • {khoaHoc.capDo}
                        </Typography>
                      )}
                      {khoaHoc.giaGoc !== undefined &&
                        khoaHoc.giaGoc !== null && (
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: MAU.chuXam,
                              fontWeight: 500,
                            }}
                          >
                            •{" "}
                            {khoaHoc.giaGoc === 0
                              ? "Miễn phí"
                              : `${khoaHoc.giaGoc.toLocaleString()}đ`}
                          </Typography>
                        )}
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                    ".MuiBox-root:hover > &": { opacity: 1 },
                    "@media (max-width: 600px)": { opacity: 1 },
                  }}
                >
                  {actions.showView && (
                    <Tooltip title="Chi tiết">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(khoaHoc);
                        }}
                        sx={{
                          color: MAU.chinh,
                          "&:hover": { bgcolor: MAU.chinhNhat },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {actions.showEdit && (
                    <Tooltip title="Chỉnh sửa">
                      <span>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(khoaHoc);
                          }}
                          sx={{
                            color: MAU.chinh,
                            "&:hover": { bgcolor: MAU.chinhNhat },
                          }}
                          disabled={dangXuLyItemNay}
                        >
                          {dangXuLyItemNay ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: MAU.chinh }}
                            />
                          ) : (
                            <EditIcon />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                  {actions.showDelete && (
                    <Tooltip title="Xóa khóa học">
                      <span>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            moXacNhanXoa(khoaHoc);
                          }}
                          sx={{
                            color: "#c62828",
                            "&:hover": { bgcolor: "#FDECEC" },
                          }}
                          disabled={dangXuLyItemNay}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Phân trang */}
      {!dangTai && !loi && danhSachKhoaHoc.length > 0 && tongSoTrang > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={tongSoTrang}
            page={trangHienTai}
            onChange={handlePageChange}
            shape="rounded"
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
        </Box>
      )}

      {/* Dialog xác nhận xóa khóa học */}
      <Dialog
        open={!!xacNhanXoa}
        onClose={dongXacNhanXoa}
        maxWidth="xs"
        fullWidth
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

      {/* Snackbar thành công (ví dụ xóa thành công) */}
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
            borderRadius: "24px",
            border: "1px solid rgba(139,19,19,0.06)",
            bgcolor: "#ffffff",
            boxShadow: "0 10px 30px rgba(139,19,19,0.05)",
          }}
        >
          <KhoaHocContent />
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
