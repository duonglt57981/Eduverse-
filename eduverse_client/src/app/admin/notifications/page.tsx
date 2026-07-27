"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import { thongBaoService } from "@/src/services/ThongBaoService";
import { ThongBao, ThongBaoRequest } from "@/src/types/thongbao";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  SearchRounded,
  AddRounded,
  EditRounded,
  DeleteRounded,
  RefreshRounded,
  NotificationsRounded,
  FolderOpenRounded,
  CheckCircleRounded,
  VisibilityRounded,
} from "@mui/icons-material";

const COLORS = {
  primary: "#991B1B",
  primaryHover: "#7F1D1D",
  primaryActive: "#6B1515",
  primarySoft: "#FEF2F2",
  primaryBorder: "#FECACA",
  bgLight: "#F7F8FA",
  white: "#FFFFFF",
  textDark: "#111827",
  textTitle: "#1F2937",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  borderMain: "#E5E7EB",
  borderLight: "#EEF0F3",
  divider: "#F1F5F9",
  green: "#15803D",
  greenBg: "#ECFDF5",
  orange: "#D97706",
  orangeBg: "#FFF7ED",
  red: "#DC2626",
  redBg: "#FEF2F2",
  blue: "#2563EB",
  blueBg: "#EFF6FF",
};

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case "YeuCauRutTien":
      return { bgcolor: "#FFF7ED", color: "#D97706", label: "Rút tiền" };
    case "DoanhThu":
      return { bgcolor: "#ECFDF5", color: "#15803D", label: "Doanh thu" };
    case "RutTienThanhCong":
      return { bgcolor: "#ECFDF5", color: "#15803D", label: "Thành công" };
    case "RutTienTuChoi":
      return { bgcolor: "#FEF2F2", color: "#DC2626", label: "Từ chối" };
    case "HeThong":
      return { bgcolor: "#EFF6FF", color: "#2563EB", label: "Hệ thống" };
    default:
      return { bgcolor: "#F1F5F9", color: "#475569", label: "Khác" };
  }
};

const loaiLabel: Record<string, string> = {
  YeuCauRutTien: "Rút tiền",
  DoanhThu: "Doanh thu",
  RutTienThanhCong: "Thành công",
  RutTienTuChoi: "Từ chối",
  HeThong: "Hệ thống",
  Khac: "Khác",
};

export default function AdminThongBaoPage() {
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterRead, setFilterRead] = useState(""); // "" | "read" | "unread"
  const [loading, setLoading] = useState(false);

  // Dialog CRUD states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formState, setFormState] = useState<ThongBaoRequest>({
    tieuDe: "",
    noiDung: "",
    message: "",
    idNguoiDung: "",
    type: "System",
    loaiThongBao: "HeThong",
    link: "",
    isDisplay: true,
    isXuatBan: true,
  });

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ThongBao | null>(null);

  const [trigger, setTrigger] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const isReadParam =
        filterRead === "read"
          ? true
          : filterRead === "unread"
            ? false
            : undefined;

      const res = await thongBaoService.getNotifications({
        keyword: search || undefined,
        loaiThongBao: filterLoai || undefined,
        isRead: isReadParam,
        pageIndex,
        pageSize,
      });

      if (res.status && res.data) {
        setNotifications(res.data.items || []);
        setTotalItems(res.data.totalCount || 0);
        setTotalPages(res.data.totalPage || 1);
      } else {
        setNotifications([]);
      }
    } catch (err: unknown) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text: "Không thể tải danh sách thông báo",
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [pageIndex, filterLoai, filterRead, trigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    setTrigger((prev) => prev + 1);
  };

  const openAddDialog = () => {
    setDialogMode("add");
    setEditingId(null);
    setFormState({
      tieuDe: "",
      noiDung: "",
      message: "",
      idNguoiDung: "",
      type: "System",
      loaiThongBao: "HeThong",
      link: "",
      isDisplay: true,
      isXuatBan: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (noti: ThongBao) => {
    setDialogMode("edit");
    setEditingId(noti.id);
    setFormState({
      tieuDe: noti.tieuDe || "",
      noiDung: noti.noiDung || "",
      message: noti.message || "",
      idNguoiDung: noti.idNguoiDung || "",
      type: noti.type || "System",
      loaiThongBao: noti.loaiThongBao || "HeThong",
      link: noti.link || "",
      isDisplay: noti.isDisplay !== false,
      isXuatBan: noti.isXuatBan !== false,
    });
    setDialogOpen(true);
  };

  const openDetailDialog = (noti: ThongBao) => {
    setDetailItem(noti);
    setDetailOpen(true);
  };

  const handleSubmitForm = async () => {
    if (
      !formState.tieuDe?.trim() ||
      !(formState.noiDung || formState.message)?.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập tiêu đề và nội dung thông báo",
        confirmButtonColor: COLORS.primary,
      });
      return;
    }

    setLoading(true);
    try {
      let res;
      const payload: ThongBaoRequest = {
        ...formState,
        // sync message field with noiDung
        message: formState.message || formState.noiDung,
        noiDung: formState.noiDung || formState.message,
      };

      if (dialogMode === "add") {
        res = await thongBaoService.createNotification(payload);
      } else {
        res = await thongBaoService.updateNotification(editingId!, payload);
      }

      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text:
            dialogMode === "add"
              ? "Tạo thông báo mới thành công!"
              : "Cập nhật thông báo thành công!",
          confirmButtonColor: COLORS.primary,
          timer: 2000,
          showConfirmButton: false,
        });
        setDialogOpen(false);
        setTrigger((prev) => prev + 1);
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: res.message || "Thao tác thất bại",
          confirmButtonColor: COLORS.primary,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Không thể kết nối đến máy chủ",
        confirmButtonColor: COLORS.primary,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noti: ThongBao) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      html: `Bạn có chắc muốn xóa thông báo <b>"${noti.tieuDe || "Không tiêu đề"}"</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: COLORS.red,
      cancelButtonColor: COLORS.textSecondary,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await thongBaoService.deleteNotification(noti.id);
        if (res.status) {
          Swal.fire({
            icon: "success",
            title: "Đã xóa!",
            text: "Thông báo đã được xóa thành công.",
            confirmButtonColor: COLORS.primary,
            timer: 2000,
            showConfirmButton: false,
          });
          setTrigger((prev) => prev + 1);
        } else {
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: res.message || "Xóa thông báo thất bại",
            confirmButtonColor: COLORS.primary,
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể kết nối đến API",
          confirmButtonColor: COLORS.primary,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (noti: ThongBao) => {
    try {
      const res = await thongBaoService.markAsRead(noti.id);
      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Đã đánh dấu đã đọc",
          timer: 1500,
          showConfirmButton: false,
        });
        setTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <DashboardShell>
        <Box sx={{ p: 4, bgcolor: COLORS.bgLight, minHeight: "100%" }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              mb: 4.5,
              gap: 2.5,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  bgcolor: COLORS.primarySoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${COLORS.primaryBorder}`,
                }}
              >
                <NotificationsRounded sx={{ color: COLORS.primary, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: COLORS.textTitle,
                    mb: 0.5,
                    fontSize: { xs: 24, md: 28 },
                    letterSpacing: "-0.5px",
                  }}
                >
                  Quản lý thông báo
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: COLORS.textSecondary, fontWeight: 500, fontSize: 13.5 }}
                >
                  Tạo, chỉnh sửa, gửi và quản lý hệ thống thông báo người dùng trong EduVerse.
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              sx={{
                bgcolor: COLORS.primary,
                borderRadius: "10px",
                px: 3,
                height: 44,
                fontWeight: 700,
                textTransform: "none",
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(153, 27, 27, 0.12)",
                transition: "all 200ms ease",
                "&:hover": {
                  bgcolor: COLORS.primaryHover,
                  transform: "translateY(-1.5px)",
                  boxShadow: "0 6px 16px rgba(153, 27, 27, 0.2)",
                },
                "&:active": {
                  bgcolor: COLORS.primaryActive,
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Tạo thông báo mới
            </Button>
          </Stack>

          {/* Quick Stats Grid */}
          <Grid container spacing={3} sx={{ width: "100%", m: 0, mb: 4.5 }}>
            {[
              {
                title: "Tổng thông báo",
                val: totalItems,
                icon: <NotificationsRounded sx={{ color: COLORS.primary, fontSize: 24 }} />,
                bg: COLORS.primarySoft,
                border: COLORS.primaryBorder,
              },
              {
                title: "Mục hiển thị",
                val: notifications.filter((n) => n.isDisplay).length,
                icon: <CheckCircleRounded sx={{ color: COLORS.green, fontSize: 24 }} />,
                bg: COLORS.greenBg,
                border: "rgba(21, 128, 61, 0.15)",
              },
            ].map((st, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: "14px",
                    border: `1px solid ${COLORS.borderMain}`,
                    bgcolor: COLORS.white,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    transition: "all 200ms ease",
                    "&:hover": {
                      borderColor: COLORS.primaryBorder,
                      boxShadow: "0 4px 12px rgba(153, 27, 27, 0.03)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2.5}
                    sx={{
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: st.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1px solid ${st.border}`,
                      }}
                    >
                      {st.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: COLORS.textSecondary,
                          fontWeight: 600,
                          fontSize: 13,
                          display: "block",
                          mb: 0.25,
                        }}
                      >
                        {st.title}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          color: COLORS.textDark,
                          lineHeight: 1.1,
                          fontSize: "1.75rem",
                        }}
                      >
                        {st.val}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Main List Table Container */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: `1px solid ${COLORS.borderMain}`,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              bgcolor: COLORS.white,
            }}
          >
            {/* Filter controls */}
            <Box sx={{ p: 3, borderBottom: `1px solid ${COLORS.borderLight}` }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: COLORS.textTitle, fontSize: 16 }}
                  >
                    Danh sách thông báo
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 500 }}
                  >
                    ({totalItems} kết quả)
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ alignItems: "stretch", width: { xs: "100%", sm: "auto" } }}
                >
                  {/* Search bar */}
                  <form
                    onSubmit={handleSearchSubmit}
                    style={{ display: "flex", width: "100%" }}
                  >
                    <TextField
                      placeholder="Tìm theo tiêu đề hoặc nội dung..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      size="small"
                      sx={{
                        width: { xs: "100%", sm: 240 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          bgcolor: "#F8FAFC",
                          height: 42,
                          "& fieldset": { borderColor: COLORS.borderMain },
                          "&:hover fieldset": { borderColor: COLORS.primary },
                          "&.Mui-focused fieldset": {
                            borderColor: COLORS.primary,
                            borderWidth: 1.5,
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontSize: 13.5,
                          fontWeight: 500,
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRounded
                                sx={{
                                  color: COLORS.textSecondary,
                                  fontSize: 20,
                                }}
                              />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </form>

                  {/* Filter category */}
                  <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                    <InputLabel id="filter-type-label" sx={{ fontSize: 13.5, fontWeight: 500 }}>Loại</InputLabel>
                    <Select
                      labelId="filter-type-label"
                      value={filterLoai}
                      label="Loại"
                      onChange={(e) => setFilterLoai(e.target.value)}
                      sx={{
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        height: 42,
                        fontSize: 13.5,
                        fontWeight: 500,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.borderMain,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.primary,
                        },
                      }}
                    >
                      <MenuItem value="">Tất cả loại</MenuItem>
                      {Object.keys(loaiLabel).map((key) => (
                        <MenuItem key={key} value={key}>
                          {loaiLabel[key]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Filter status */}
                  <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 } }}>
                    <InputLabel id="filter-read-label" sx={{ fontSize: 13.5, fontWeight: 500 }}>Trạng thái</InputLabel>
                    <Select
                      labelId="filter-read-label"
                      value={filterRead}
                      label="Trạng thái"
                      onChange={(e) => setFilterRead(e.target.value)}
                      sx={{
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        height: 42,
                        fontSize: 13.5,
                        fontWeight: 500,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.borderMain,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: COLORS.primary,
                        },
                      }}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="read">Đã đọc</MenuItem>
                      <MenuItem value="unread">Chưa đọc</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Refresh button */}
                  <Tooltip title="Làm mới">
                    <IconButton
                      onClick={() => {
                        setSearch("");
                        setFilterLoai("");
                        setFilterRead("");
                        setPageIndex(1);
                        setTrigger((prev) => prev + 1);
                      }}
                      sx={{
                        border: `1px solid ${COLORS.borderMain}`,
                        borderRadius: "10px",
                        width: 42,
                        height: 42,
                        bgcolor: "#F8FAFC",
                        color: COLORS.textSecondary,
                        transition: "all 150ms ease",
                        "&:hover": {
                          bgcolor: COLORS.primarySoft,
                          borderColor: COLORS.primaryBorder,
                          color: COLORS.primary,
                        },
                      }}
                    >
                      <RefreshRounded sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* Table layout */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow sx={{ borderBottom: `1px solid ${COLORS.borderLight}` }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        pl: 3,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                      }}
                    >
                      Tiêu đề / Nội dung
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                      }}
                    >
                      Loại thông báo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                      }}
                    >
                      Người nhận
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                      }}
                    >
                      Thời gian
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                      }}
                    >
                      Trạng thái
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        pr: 3,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                      }}
                    >
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CircularProgress
                          size={32}
                          sx={{ color: COLORS.primary }}
                        />
                        <Typography
                          sx={{
                            mt: 2,
                            color: COLORS.textSecondary,
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          Đang tải dữ liệu...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : notifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <FolderOpenRounded
                          sx={{ fontSize: 48, color: COLORS.textMuted, mb: 1 }}
                        />
                        <Typography
                          sx={{
                            color: COLORS.textSecondary,
                            fontWeight: 600,
                            fontSize: 14,
                          }}
                        >
                          Chưa có thông báo nào phù hợp
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notifications.map((noti) => {
                      const isUnread = !noti.daDoc;
                      const badge = getTypeBadgeStyles(noti.loaiThongBao ?? "");
                      const recipient = noti.idNguoiDung || noti.email || "Tất cả";
                      const isAll = recipient === "Tất cả" || recipient === "all";
                      const displayRecipient = isAll
                        ? "Tất cả"
                        : recipient.length > 15
                          ? `${recipient.substring(0, 8)}...${recipient.substring(recipient.length - 4)}`
                          : recipient;

                      const formatTimeDate = (dateStr?: string) => {
                        if (!dateStr) return { time: "—", date: "—" };
                        const d = new Date(dateStr);
                        const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                        const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
                        return { time, date };
                      };
                      const { time, date } = formatTimeDate(noti.thoiGianTao);

                      return (
                        <TableRow
                          key={noti.id}
                          sx={{
                            transition: "all 150ms ease",
                            bgcolor: isUnread ? "rgba(153, 27, 27, 0.015)" : "transparent",
                            "&:hover": {
                              bgcolor: isUnread ? "rgba(153, 27, 27, 0.03)" : "#FAFAFA",
                            },
                            "& td": {
                              borderBottom: `1px solid ${COLORS.borderLight}`,
                            },
                            "&:last-child td": { borderBottom: "none" },
                          }}
                        >
                          <TableCell sx={{ py: 2, pl: 3 }}>
                            <Box sx={{ maxWidth: 360 }}>
                              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.5 }}>
                                {isUnread && (
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: "50%",
                                      bgcolor: COLORS.red,
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                <Typography
                                  sx={{
                                    fontWeight: isUnread ? 700 : 600,
                                    color: COLORS.textDark,
                                    fontSize: 14,
                                  }}
                                >
                                  {noti.tieuDe || "Không tiêu đề"}
                                </Typography>
                              </Stack>
                              <Tooltip title={noti.noiDung || noti.message || ""} arrow placement="top-start">
                                <Typography
                                  sx={{
                                    color: COLORS.textSecondary,
                                    fontSize: 12.5,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {noti.noiDung || noti.message || "—"}
                                </Typography>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={badge.label}
                              size="small"
                              sx={{
                                bgcolor: badge.bgcolor,
                                color: badge.color,
                                fontWeight: 600,
                                fontSize: 11.5,
                                borderRadius: "6px",
                                border: "1px solid rgba(0,0,0,0.03)",
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {isAll ? (
                              <Chip
                                label="Tất cả"
                                size="small"
                                sx={{
                                  bgcolor: "#F1F5F9",
                                  color: "#475569",
                                  fontWeight: 600,
                                  fontSize: 11.5,
                                  borderRadius: "6px",
                                }}
                              />
                            ) : (
                              <Tooltip title={recipient} arrow>
                                <Typography sx={{ fontSize: 13, fontWeight: 500, color: COLORS.textDark }}>
                                  {displayRecipient}
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Stack spacing={0.25}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: COLORS.textDark }}>
                                {time}
                              </Typography>
                              <Typography sx={{ fontSize: 11.5, color: COLORS.textSecondary, fontWeight: 400 }}>
                                {date}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={noti.daDoc ? "Đã đọc" : "Chưa đọc"}
                              size="small"
                              sx={{
                                bgcolor: noti.daDoc ? COLORS.greenBg : COLORS.orangeBg,
                                color: noti.daDoc ? COLORS.green : COLORS.orange,
                                fontWeight: 600,
                                fontSize: 11.5,
                                borderRadius: "6px",
                                border: `1px solid ${noti.daDoc ? "rgba(21, 128, 61, 0.1)" : "rgba(217, 119, 6, 0.1)"}`,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2, pr: 3 }}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ justifyContent: "center" }}
                            >
                              {!noti.daDoc && (
                                <Tooltip title="Đánh dấu đã đọc" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(noti)}
                                    aria-label="Đánh dấu đã đọc"
                                    sx={{
                                      color: COLORS.green,
                                      bgcolor: "transparent",
                                      borderRadius: "8px",
                                      width: 34,
                                      height: 34,
                                      transition: "all 150ms ease",
                                      "&:hover": {
                                        bgcolor: "#DCFCE7",
                                        color: "#15803D",
                                      },
                                    }}
                                  >
                                    <CheckCircleRounded sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Xem chi tiết" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => openDetailDialog(noti)}
                                  aria-label="Xem chi tiết"
                                  sx={{
                                    color: COLORS.blue,
                                    bgcolor: "transparent",
                                    borderRadius: "8px",
                                    width: 34,
                                    height: 34,
                                    transition: "all 150ms ease",
                                    "&:hover": {
                                      bgcolor: "#EFF6FF",
                                      color: "#2563EB",
                                    },
                                  }}
                                >
                                  <VisibilityRounded sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(noti)}
                                  aria-label="Chỉnh sửa"
                                  sx={{
                                    color: COLORS.orange,
                                    bgcolor: "transparent",
                                    borderRadius: "8px",
                                    width: 34,
                                    height: 34,
                                    transition: "all 150ms ease",
                                    "&:hover": {
                                      bgcolor: "#FEF3C7",
                                      color: "#D97706",
                                    },
                                  }}
                                >
                                  <EditRounded sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(noti)}
                                  aria-label="Xóa"
                                  sx={{
                                    color: COLORS.red,
                                    bgcolor: "transparent",
                                    borderRadius: "8px",
                                    width: 34,
                                    height: 34,
                                    transition: "all 150ms ease",
                                    "&:hover": {
                                      bgcolor: "#FEE2E2",
                                      color: "#DC2626",
                                    },
                                  }}
                                >
                                  <DeleteRounded sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 3,
                  borderTop: `1px solid ${COLORS.borderLight}`,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Hiển thị {notifications.length} / {totalItems} thông báo
                </Typography>
                <Pagination
                  count={totalPages}
                  page={pageIndex}
                  onChange={(_, v) => setPageIndex(v)}
                  color="standard"
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600,
                      borderRadius: "8px",
                      transition: "all 150ms ease",
                      "&.Mui-selected": {
                        bgcolor: COLORS.primary,
                        color: COLORS.white,
                        "&:hover": { bgcolor: COLORS.primaryHover },
                      },
                      "&:hover": {
                        bgcolor: "#F1F5F9",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Card>

          {/* Create/Edit Form Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            slotProps={{
              paper: {
                sx: { borderRadius: "24px", p: 1.5 },
              },
            }}
          >
            <DialogTitle
              sx={{ fontWeight: 850, color: COLORS.primary, fontSize: 20 }}
            >
              {dialogMode === "add"
                ? "Tạo thông báo mới"
                : "Chỉnh sửa thông báo"}
            </DialogTitle>
            <DialogContent sx={{ px: 3, py: 1 }}>
              <Stack spacing={2.5} sx={{ mt: 1.5 }}>
                {/* Tiêu đề */}
                <Stack spacing={0.75}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}
                  >
                    Tiêu đề thông báo{" "}
                    <span style={{ color: "#EF4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    value={formState.tieuDe}
                    onChange={(e) =>
                      setFormState({ ...formState, tieuDe: e.target.value })
                    }
                    placeholder="Nhập tiêu đề thông báo..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        "&:hover fieldset": { borderColor: COLORS.primary },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                </Stack>

                {/* Nội dung */}
                <Stack spacing={0.75}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}
                  >
                    Nội dung thông báo{" "}
                    <span style={{ color: "#EF4444" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    required
                    multiline
                    rows={3}
                    value={formState.noiDung}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        noiDung: e.target.value,
                        message: e.target.value,
                      })
                    }
                    placeholder="Nhập chi tiết nội dung thông báo..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        "&:hover fieldset": { borderColor: COLORS.primary },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                </Stack>

                {/* Phân loại & Type */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}
                    >
                      Phân loại
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={formState.loaiThongBao}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            loaiThongBao: e.target.value,
                          })
                        }
                        sx={{
                          borderRadius: "14px",
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.primary,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.primary,
                          },
                        }}
                      >
                        {Object.keys(loaiLabel).map((key) => (
                          <MenuItem key={key} value={key}>
                            {loaiLabel[key]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}
                    >
                      Loại thông báo (type)
                    </Typography>
                    <TextField
                      fullWidth
                      value={formState.type}
                      onChange={(e) =>
                        setFormState({ ...formState, type: e.target.value })
                      }
                      placeholder="Ví dụ: System, Alert..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          "&:hover fieldset": { borderColor: COLORS.primary },
                          "&.Mui-focused fieldset": {
                            borderColor: COLORS.primary,
                          },
                        },
                      }}
                    />
                  </Stack>
                </Stack>

                {/* Đường dẫn */}
                <Stack spacing={0.75}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}
                  >
                    Đường dẫn liên kết (Link)
                  </Typography>
                  <TextField
                    fullWidth
                    value={formState.link}
                    onChange={(e) =>
                      setFormState({ ...formState, link: e.target.value })
                    }
                    placeholder="Ví dụ: /student/favorites..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        "&:hover fieldset": { borderColor: COLORS.primary },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                </Stack>

                {/* Người nhận */}
                <Stack spacing={0.75}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "#1F2937" }}
                  >
                    ID người nhận (idNguoiDung)
                  </Typography>
                  <TextField
                    fullWidth
                    value={formState.idNguoiDung}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        idNguoiDung: e.target.value,
                      })
                    }
                    placeholder="Để trống để gửi cho tất cả..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        "&:hover fieldset": { borderColor: COLORS.primary },
                        "&.Mui-focused fieldset": {
                          borderColor: COLORS.primary,
                        },
                      },
                    }}
                  />
                </Stack>

                {/* Switches */}
                <Stack direction="row" spacing={4} sx={{ pl: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.isDisplay !== false}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            isDisplay: e.target.checked,
                          })
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: COLORS.primary,
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: COLORS.primary,
                            },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        Hiển thị
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.isXuatBan !== false}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            isXuatBan: e.target.checked,
                          })
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: COLORS.primary,
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: COLORS.primary,
                            },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        Xuất bản ngay
                      </Typography>
                    }
                  />
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                sx={{
                  color: COLORS.textSecondary,
                  fontWeight: 700,
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitForm}
                variant="contained"
                sx={{
                  bgcolor: COLORS.primary,
                  fontWeight: 700,
                  borderRadius: "50px",
                  px: 3,
                  "&:hover": { bgcolor: COLORS.primaryDark },
                }}
              >
                {dialogMode === "add" ? "Tạo mới" : "Lưu thay đổi"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Details Dialog */}
          <Dialog
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            maxWidth="xs"
            fullWidth
            slotProps={{
              paper: {
                sx: { borderRadius: "24px", p: 1 },
              },
            }}
          >
            <DialogTitle sx={{ fontWeight: 800, color: COLORS.primary }}>
              Chi tiết thông báo
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Tiêu đề:
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {detailItem?.tieuDe || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Nội dung:
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {detailItem?.noiDung || detailItem?.message || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Loại:
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {detailItem?.loaiThongBao
                      ? loaiLabel[detailItem.loaiThongBao] ||
                        detailItem.loaiThongBao
                      : "—"}
                  </Typography>
                </Box>
                {detailItem?.link && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Link liên kết:
                    </Typography>
                    <Typography
                      sx={{
                        color: COLORS.blue,
                        textDecoration: "underline",
                        wordBreak: "break-all",
                      }}
                    >
                      {detailItem.link}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Thời gian tạo:
                  </Typography>
                  <Typography>{formatDate(detailItem?.thoiGianTao)}</Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setDetailOpen(false)}
                sx={{
                  color: COLORS.primary,
                  fontWeight: 700,
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
