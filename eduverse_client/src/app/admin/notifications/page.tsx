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
  primary: "#8D1313", // Crimson Red
  primaryLight: "#B91C1C", // Light Crimson
  primaryDark: "#7F1D1D", // Dark Crimson
  primaryBgLight: "#FFF5F5", // Extra light pink/red background
  bgLight: "#FFF8F6", // Premium cream-rose background
  white: "#FFFFFF",
  textDark: "#1E293B", // Slate 800
  textSecondary: "#64748B", // Slate 500
  green: "#10B981", // Active state emerald
  greenBg: "#ECFDF5",
  orange: "#F59E0B", // Warning/key gold
  orangeBg: "#FFFBEB",
  red: "#EF4444", // Error red
  redBg: "#FEF2F2",
  blue: "#3B82F6",
  blueBg: "#EFF6FF",
};

const loaiColor: Record<
  string,
  "default" | "success" | "error" | "warning" | "info"
> = {
  YeuCauRutTien: "warning",
  DoanhThu: "success",
  RutTienThanhCong: "success",
  RutTienTuChoi: "error",
  HeThong: "info",
  Khac: "default",
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
              alignItems: { xs: "flex-start", sm: "center" },
              mb: 4,
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,
                  color: COLORS.primary,
                  mb: 1,
                  letterSpacing: "-0.75px",
                }}
              >
                Quản lý thông báo
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: COLORS.textSecondary, fontWeight: 500 }}
              >
                Tạo, chỉnh sửa, gửi và quản lý hệ thống thông báo người dùng
                trong EduVerse.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openAddDialog}
              sx={{
                bgcolor: COLORS.primary,
                borderRadius: "50px",
                px: 3,
                py: 1.25,
                fontWeight: 700,
                textTransform: "none",
                fontSize: 14,
                boxShadow: "0 8px 24px rgba(141,19,19,0.25)",
                transition: "all 200ms ease",
                "&:hover": {
                  bgcolor: COLORS.primaryDark,
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(141,19,19,0.35)",
                },
              }}
            >
              Tạo thông báo mới
            </Button>
          </Stack>

          {/* Quick Stats Grid */}
          <Grid container spacing={3} sx={{ width: "100%", m: 0, mb: 4 }}>
            {[
              {
                title: "Tổng thông báo",
                val: totalItems,
                icon: <NotificationsRounded sx={{ color: COLORS.primary }} />,
                bg: COLORS.primaryBgLight,
              },
              {
                title: "Mục hiển thị",
                val: notifications.filter((n) => n.isDisplay).length,
                icon: <CheckCircleRounded sx={{ color: COLORS.green }} />,
                bg: COLORS.greenBg,
              },
            ].map((st, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "24px",
                    border: "1px solid rgba(141,19,19,0.06)",
                    bgcolor: COLORS.white,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "16px",
                        bgcolor: st.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {st.icon}
                    </Box>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.textSecondary,
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {st.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: COLORS.textDark,
                      lineHeight: 1.1,
                      fontSize: "2rem",
                    }}
                  >
                    {st.val}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Main List Table Container */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: "1px solid rgba(141,19,19,0.06)",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
            }}
          >
            {/* Filter controls */}
            <Box sx={{ p: 3, borderBottom: "1px solid #F1F5F9" }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: COLORS.textDark, fontSize: 17 }}
                >
                  Danh sách thông báo
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ alignItems: "center" }}
                >
                  {/* Search bar */}
                  <form
                    onSubmit={handleSearchSubmit}
                    style={{ display: "flex" }}
                  >
                    <TextField
                      placeholder="Tìm kiếm thông báo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      size="small"
                      sx={{
                        width: 200,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          bgcolor: "#F8FAFC",
                          height: 42,
                          "& fieldset": { borderColor: "#E2E8F0" },
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
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id="filter-type-label">Loại</InputLabel>
                    <Select
                      labelId="filter-type-label"
                      value={filterLoai}
                      label="Loại"
                      onChange={(e) => setFilterLoai(e.target.value)}
                      sx={{
                        borderRadius: "14px",
                        bgcolor: "#F8FAFC",
                        height: 42,
                        fontSize: 13.5,
                        fontWeight: 500,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E2E8F0",
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
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel id="filter-read-label">Trạng thái</InputLabel>
                    <Select
                      labelId="filter-read-label"
                      value={filterRead}
                      label="Trạng thái"
                      onChange={(e) => setFilterRead(e.target.value)}
                      sx={{
                        borderRadius: "14px",
                        bgcolor: "#F8FAFC",
                        height: 42,
                        fontSize: 13.5,
                        fontWeight: 500,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E2E8F0",
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
                        border: "1px solid #E2E8F0",
                        borderRadius: "14px",
                        width: 42,
                        height: 42,
                        "&:hover": { bgcolor: COLORS.primaryBgLight },
                      }}
                    >
                      <RefreshRounded
                        sx={{ color: COLORS.textSecondary, fontSize: 20 }}
                      />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* Table layout */}
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        pl: 3,
                      }}
                    >
                      Tiêu đề / Nội dung
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                      }}
                    >
                      Loại thông báo
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                      }}
                    >
                      Người nhận
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                      }}
                    >
                      Thời gian
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                      }}
                    >
                      Trạng thái
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 800,
                        color: COLORS.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 2,
                        pr: 3,
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
                          sx={{ fontSize: 48, color: "#CBD5E1", mb: 1 }}
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
                      const label =
                        loaiLabel[noti.loaiThongBao ?? ""] ??
                        noti.loaiThongBao ??
                        "Hệ thống";
                      const color =
                        loaiColor[noti.loaiThongBao ?? ""] ?? "default";
                      return (
                        <TableRow
                          key={noti.id}
                          sx={{
                            transition: "all 150ms ease",
                            "&:hover": { bgcolor: COLORS.primaryBgLight },
                            "&:last-child td": { borderBottom: "none" },
                          }}
                        >
                          <TableCell sx={{ py: 2, pl: 3 }}>
                            <Box sx={{ maxWidth: 280 }}>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: COLORS.textDark,
                                  fontSize: 14,
                                }}
                              >
                                {noti.tieuDe || "Không tiêu đề"}
                              </Typography>
                              <Typography
                                noWrap
                                sx={{
                                  color: COLORS.textSecondary,
                                  fontSize: 12,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  mt: 0.5,
                                }}
                              >
                                {noti.noiDung || noti.message || "—"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={label}
                              color={color}
                              size="small"
                              sx={{ fontWeight: 700, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                              {noti.idNguoiDung || noti.email || "Tất cả"}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography
                              sx={{
                                color: COLORS.textSecondary,
                                fontSize: 13,
                                fontWeight: 500,
                              }}
                            >
                              {formatDate(noti.thoiGianTao)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={noti.daDoc ? "Đã đọc" : "Chưa đọc"}
                              color={noti.daDoc ? "success" : "warning"}
                              size="small"
                              variant={noti.daDoc ? "outlined" : "filled"}
                              sx={{ fontWeight: 700, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2, pr: 3 }}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{ justifyContent: "center" }}
                            >
                              {!noti.daDoc && (
                                <Tooltip title="Đánh dấu đã đọc">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(noti)}
                                    sx={{
                                      color: COLORS.green,
                                      bgcolor: COLORS.greenBg,
                                      borderRadius: "10px",
                                      width: 32,
                                      height: 32,
                                      "&:hover": { bgcolor: "#D1FAE5" },
                                    }}
                                  >
                                    <CheckCircleRounded sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Xem chi tiết">
                                <IconButton
                                  size="small"
                                  onClick={() => openDetailDialog(noti)}
                                  sx={{
                                    color: COLORS.blue,
                                    bgcolor: COLORS.blueBg,
                                    borderRadius: "10px",
                                    width: 32,
                                    height: 32,
                                    "&:hover": { bgcolor: "#DBEAFE" },
                                  }}
                                >
                                  <VisibilityRounded sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(noti)}
                                  sx={{
                                    color: COLORS.primary,
                                    bgcolor: COLORS.primaryBgLight,
                                    borderRadius: "10px",
                                    width: 32,
                                    height: 32,
                                    "&:hover": { bgcolor: "#FFE4E6" },
                                  }}
                                >
                                  <EditRounded sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(noti)}
                                  sx={{
                                    color: COLORS.red,
                                    bgcolor: COLORS.redBg,
                                    borderRadius: "10px",
                                    width: 32,
                                    height: 32,
                                    "&:hover": { bgcolor: "#FECACA" },
                                  }}
                                >
                                  <DeleteRounded sx={{ fontSize: 16 }} />
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
                  borderTop: "1px solid #F1F5F9",
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
                      borderRadius: "12px",
                      "&.Mui-selected": {
                        bgcolor: COLORS.primary,
                        color: COLORS.white,
                        "&:hover": { bgcolor: COLORS.primaryDark },
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
