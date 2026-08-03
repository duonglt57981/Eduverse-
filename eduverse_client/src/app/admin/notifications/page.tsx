"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  RefreshRounded,
  NotificationsRounded,
  FolderOpenRounded,
  CheckCircleRounded,
} from "@mui/icons-material";
import { BRAND, NEUTRAL, STATUS } from "@/src/theme/tokens";
import { isNotificationForRole } from "@/src/libs/notificationRole";
import { useSignalR } from "@/src/hook/useSignalR";

const COLORS = {
  primary: BRAND.main,
  primaryHover: BRAND.dark,
  primaryActive: BRAND.darker,
  primarySoft: BRAND.light,
  primaryBorder: BRAND.border,
  bgLight: NEUTRAL.bg,
  white: NEUTRAL.paper,
  textDark: NEUTRAL.textPrimary,
  textTitle: NEUTRAL.textPrimary,
  textSecondary: NEUTRAL.textSecondary,
  textMuted: NEUTRAL.textMuted,
  borderMain: NEUTRAL.divider,
  borderLight: NEUTRAL.divider,
  divider: NEUTRAL.divider,
  green: STATUS.success,
  greenBg: STATUS.successSoft,
  orange: STATUS.warningDark,
  orangeBg: STATUS.warningSoft,
  red: STATUS.error,
  redBg: STATUS.errorSoft,
  blue: STATUS.info,
  blueBg: STATUS.infoSoft,
};

const loaiLabel: Record<string, string> = {
  YeuCauRutTien: "Rút tiền",
  DoanhThu: "Doanh thu",
  RutTienThanhCong: "Thành công",
  RutTienTuChoi: "Từ chối",
  HeThong: "Hệ thống",
  Khac: "Khác",
};

const getAdminNotificationTarget = (notification: ThongBao) => {
  const rawLink = notification.link?.trim();
  if (rawLink && !/^https?:\/\//i.test(rawLink)) {
    const normalizedLink = rawLink.startsWith("/") ? rawLink : `/${rawLink}`;
    if (normalizedLink.startsWith("/admin")) return normalizedLink;
  }

  const searchableText = [
    notification.type,
    notification.loaiThongBao,
    notification.tieuDe,
    notification.noiDung,
    notification.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("vi-VN");

  if (/rút tiền|rut tien|withdraw/.test(searchableText)) {
    return "/admin/withdrawal-request";
  }
  if (/thanh toán|thanh toan|payment/.test(searchableText)) {
    return "/admin/payments";
  }
  if (/nâng cấp giảng viên|nang cap giang vien|instructor request/.test(searchableText)) {
    return "/admin/dashboard?tab=instructor-requests";
  }
  if (/phê duyệt khóa học|phe duyet khoa hoc|khóa học chờ duyệt|khoa hoc cho duyet/.test(searchableText)) {
    return notification.itemId
      ? `/admin/approve-courses/${notification.itemId}`
      : "/admin/approve-courses";
  }
  if (/khuyến mãi|khuyen mai|promotion/.test(searchableText)) {
    return "/admin/promotions";
  }
  if (/khóa học|khoa hoc|course/.test(searchableText)) {
    return "/admin/courses";
  }
  if (/người dùng|nguoi dung|user|tài khoản|tai khoan/.test(searchableText)) {
    return "/admin/users";
  }

  return null;
};

export default function AdminThongBaoPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState(""); // "" | "read" | "unread"
  const [loading, setLoading] = useState(false);

  // Dialog CRUD states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId] = useState<string | null>(null);

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

  useSignalR("ReceiveNotification", (notification: ThongBao) => {
    if (!isNotificationForRole(notification, "Admin")) return;
    setTrigger((current) => current + 1);
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await thongBaoService.getMyNotifications();

      if (res.status && res.data) {
        const keyword = search.trim().toLocaleLowerCase("vi-VN");
        const adminNotifications = res.data.filter((notification) => {
          const belongsToAdmin = isNotificationForRole(notification, "Admin");
          const isRead = Boolean(notification.daDoc || notification.isRead);
          const matchesReadState =
            filterRead === "read"
              ? isRead
              : filterRead === "unread"
                ? !isRead
                : true;
          const searchableText = [
            notification.tieuDe,
            notification.noiDung,
            notification.message,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("vi-VN");

          return (
            belongsToAdmin &&
            matchesReadState &&
            (!keyword || searchableText.includes(keyword))
          );
        });
        const pageCount = Math.max(1, Math.ceil(adminNotifications.length / pageSize));
        const safePageIndex = Math.min(pageIndex, pageCount);
        const startIndex = (safePageIndex - 1) * pageSize;

        setNotifications(
          adminNotifications.slice(startIndex, startIndex + pageSize),
        );
        setTotalItems(adminNotifications.length);
        setTotalPages(pageCount);
        if (safePageIndex !== pageIndex) setPageIndex(safePageIndex);
      } else {
        setNotifications([]);
        setTotalItems(0);
        setTotalPages(1);
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
  }, [pageIndex, filterRead, trigger]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageIndex(1);
    setTrigger((prev) => prev + 1);
  };

  const openDetailDialog = async (noti: ThongBao) => {
    setDetailItem(noti);
    setDetailOpen(true);
    try {
      const res = await thongBaoService.getNotificationDetail(noti.id);
      if (res.status && res.data) setDetailItem(res.data);
    } catch (err) {
      console.error("Không thể tải chi tiết thông báo:", err);
    }
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
      const payload: ThongBaoRequest = {
        ...formState,
        // sync message field with noiDung
        message: formState.message || formState.noiDung,
        noiDung: formState.noiDung || formState.message,
      };

      if (!editingId) return;
      const res = await thongBaoService.updateNotification(editingId, payload);

      if (res.status) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thông báo thành công!",
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

  const handleNotificationClick = async (noti: ThongBao) => {
    if (!noti.daDoc && !noti.isRead) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === noti.id
            ? {
                ...item,
                daDoc: true,
                isRead: true,
                thoiGianDoc: new Date().toISOString(),
              }
            : item,
        ),
      );

      try {
        const response = await thongBaoService.markAsRead(noti.id);
        if (!response.status) setTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Không thể đánh dấu thông báo đã đọc:", error);
        setTrigger((prev) => prev + 1);
      }
    }

    const target = getAdminNotificationTarget(noti);
    if (!target) {
      await openDetailDialog({ ...noti, daDoc: true, isRead: true });
      return;
    }

    if (/^https?:\/\//i.test(target)) {
      window.location.assign(target);
      return;
    }

    router.push(target.startsWith("/") ? target : `/${target}`);
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
        <Box sx={{ width: "100%" }}>
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
            <Box>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: "var(--ev-text-primary, #1F2937)",
                  mb: 0.5,
                }}
              >
                Quản lý thông báo
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: COLORS.textSecondary, fontWeight: 500 }}
              >
                Theo dõi, xem chi tiết và quản lý thông báo trong EduVerse.
              </Typography>
            </Box>
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
                          bgcolor: "var(--ev-paper-alt, #F7F5F2)",
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
                        bgcolor: "var(--ev-paper-alt, #F7F5F2)",
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
                        setFilterRead("");
                        setPageIndex(1);
                        setTrigger((prev) => prev + 1);
                      }}
                      sx={{
                        border: `1px solid ${COLORS.borderMain}`,
                        borderRadius: "10px",
                        width: 42,
                        height: 42,
                        bgcolor: "var(--ev-paper-alt, #F7F5F2)",
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
                <TableHead sx={{ bgcolor: "var(--ev-paper-alt, #F7F5F2)" }}>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
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
                      <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
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
                      const isUnread = !noti.daDoc && !noti.isRead;

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
                          onClick={() => void handleNotificationClick(noti)}
                          sx={{
                            cursor: "pointer",
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
                              label={isUnread ? "Chưa đọc" : "Đã đọc"}
                              size="small"
                              sx={{
                                bgcolor: isUnread ? COLORS.orangeBg : COLORS.greenBg,
                                color: isUnread ? COLORS.orange : COLORS.green,
                                fontWeight: 600,
                                fontSize: 11.5,
                                borderRadius: "6px",
                                border: `1px solid ${isUnread ? "rgba(217, 119, 6, 0.1)" : "rgba(21, 128, 61, 0.1)"}`,
                              }}
                            />
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
                        bgcolor: "var(--ev-paper-alt, #FBFAF9)",
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
              Chỉnh sửa thông báo
            </DialogTitle>
            <DialogContent sx={{ px: 3, py: 1 }}>
              <Stack spacing={2.5} sx={{ mt: 1.5 }}>
                {/* Tiêu đề */}
                <Stack spacing={0.75}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "var(--ev-text-primary, #1F2937)" }}
                  >
                    Tiêu đề thông báo{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
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
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "var(--ev-text-primary, #1F2937)" }}
                  >
                    Nội dung thông báo{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
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
                      sx={{ fontWeight: 700, fontSize: 13.5, color: "var(--ev-text-primary, #1F2937)" }}
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
                      sx={{ fontWeight: 700, fontSize: 13.5, color: "var(--ev-text-primary, #1F2937)" }}
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
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "var(--ev-text-primary, #1F2937)" }}
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
                    sx={{ fontWeight: 700, fontSize: 13.5, color: "var(--ev-text-primary, #1F2937)" }}
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
                  "&:hover": { bgcolor: COLORS.primaryHover },
                }}
              >
                Lưu thay đổi
              </Button>
            </DialogActions>
          </Dialog>

          {/* Details Dialog */}
          <Dialog
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            maxWidth="sm"
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
                <Grid container spacing={2}>
                  {[
                    ["Mã thông báo", detailItem?.id],
                    ["Type", detailItem?.type],
                    ["Người gửi", detailItem?.fromUser],
                    ["Người nhận", detailItem?.toUser || detailItem?.idNguoiDung],
                    ["Email", detailItem?.email],
                    ["Tên mục", detailItem?.itemName],
                    ["Mã mục", detailItem?.itemId],
                    ["Loại mục", detailItem?.itemType],
                    ["Tên sản phẩm", detailItem?.productName],
                    ["Mã sản phẩm", detailItem?.productId],
                    ["Đơn vị", detailItem?.donViId],
                    ["Người tạo", detailItem?.nguoiTao],
                    ["Trạng thái", detailItem?.trangThai],
                    ["Đã đọc", detailItem?.daDoc || detailItem?.isRead ? "Có" : "Chưa"],
                    ["Thời gian đọc", formatDate(detailItem?.thoiGianDoc)],
                    ["Hiển thị", detailItem?.isDisplay === false ? "Không" : "Có"],
                    ["Xuất bản", detailItem?.isXuatBan === false ? "Không" : "Có"],
                    ["Gửi frontend", detailItem?.sendToFrontEndUser === false ? "Không" : "Có"],
                    ["File đính kèm", detailItem?.fileDinhKem],
                  ].map(([label, value]) => (
                    <Grid key={String(label)} size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {label}:
                      </Typography>
                      <Typography sx={{ fontWeight: 500, wordBreak: "break-word" }}>
                        {value || "—"}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
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
