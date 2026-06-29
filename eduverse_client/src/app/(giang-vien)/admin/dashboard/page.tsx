"use client";
import { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  Button,
  Avatar,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "../../../../store/hook";
import {
  getTatCaYeuCau,
  getThongBaoAdmin,
} from "../../../../store/rutTien/RutTienSlice";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  Cell,
} from "recharts";

const PRIMARY = "#9b1c1c";

const revenueData = [
  { month: "T1", value: 42 },
  { month: "T2", value: 58 },
  { month: "T3", value: 35 },
  { month: "T4", value: 72 },
  { month: "T5", value: 95 },
  { month: "T6", value: 68 },
  { month: "T7", value: 110 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { tatCaYeuCau, thongBaoAdmins } = useSelector((s) => s.rutTien);

  useEffect(() => {
    dispatch(getTatCaYeuCau());
    dispatch(getThongBaoAdmin());
  }, [dispatch]);

  const choDuyet = tatCaYeuCau.filter((y) => y.trangThai === "ChoDuyet");
  const chuaDocAdmin = thongBaoAdmins.filter((t) => !t.daDoc);
  const formatTien = (n?: number) =>
    n ? `${n.toLocaleString("vi-VN")}đ` : "0đ";

  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  const thoiGian = (iso?: string) => {
    if (!iso) return "";

    const date = new Date(iso);
    const now = new Date();

    const diff = date.getTime() - now.getTime();
    const mins = Math.round(diff / 60000);

    if (Math.abs(mins) < 60) {
      return rtf.format(mins, "minute");
    }

    const hours = Math.round(mins / 60);
    if (Math.abs(hours) < 24) {
      return rtf.format(hours, "hour");
    }

    const days = Math.round(hours / 24);
    return rtf.format(days, "day");
  };

  const stats = [
    {
      label: "Tổng học viên",
      value: "2,847",
      icon: <PeopleIcon />,
      change: "+12%",
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Tổng khóa học",
      value: "186",
      icon: <SchoolIcon />,
      change: "+5%",
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      label: "Doanh thu tháng",
      value: "285M",
      icon: <AttachMoneyIcon />,
      change: "+23%",
      color: "#059669",
      bg: "#f0fdf4",
    },
    {
      label: "Chờ duyệt rút",
      value: choDuyet.length.toString(),
      icon: <AccountBalanceIcon />,
      change: choDuyet.length > 0 ? `${choDuyet.length} yêu cầu` : "Không có",
      color: choDuyet.length > 0 ? "#d97706" : "#6b7280",
      bg: choDuyet.length > 0 ? "#fffbeb" : "#f9fafb",
      onClick: () => router.push("/admin/rut-tien"),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 800,
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/admin/rut-tien")}
            sx={{
              borderColor: PRIMARY,
              color: PRIMARY,
              borderRadius: 2,
              fontSize: 13,
            }}
            startIcon={<AccountBalanceIcon />}
          >
            Duyệt rút tiền
            {choDuyet.length > 0 && (
              <Chip
                label={choDuyet.length}
                color="warning"
                size="small"
                sx={{ ml: 1, height: 18, fontSize: 10, fontWeight: 700 }}
              />
            )}
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push("/admin/thong-bao")}
            sx={{
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#7f1d1d" },
              borderRadius: 2,
              fontSize: 13,
            }}
            startIcon={<NotificationsIcon />}
          >
            Thông báo
            {chuaDocAdmin.length > 0 && (
              <Chip
                label={chuaDocAdmin.length}
                sx={{
                  ml: 1,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: "#fff",
                  color: PRIMARY,
                }}
                size="small"
              />
            )}
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: 3,
                p: 2.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: s.onClick ? "pointer" : "default",
                "&:hover": s.onClick
                  ? {
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      transform: "translateY(-1px)",
                    }
                  : {},
                transition: "all 0.2s",
              }}
              onClick={s.onClick}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}
                  >
                    {s.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 26,
                      color: "text.primary",
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: s.color,
                      fontWeight: 600,
                      mt: 0.5,
                    }}
                  >
                    {s.change}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.color,
                  }}
                >
                  {s.icon}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Left */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Chart */}
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                  Doanh thu hệ thống
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  7 tháng gần nhất (đơn vị: triệu đ)
                </Typography>
              </Box>
              <Chip
                label="Năm 2024"
                size="small"
                sx={{ bgcolor: "#fff0f0", color: PRIMARY, fontWeight: 600 }}
              />
            </Box>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={32}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`${v}M VNĐ`, "Doanh thu"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {revenueData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === revenueData.length - 1 ? PRIMARY : "#f0e8e8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Yêu cầu rút tiền chờ duyệt */}
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                  Yêu cầu rút tiền
                </Typography>
                {choDuyet.length > 0 && (
                  <Chip
                    label={`${choDuyet.length} chờ duyệt`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
              <Button
                size="small"
                onClick={() => router.push("/admin/rut-tien")}
                sx={{ color: PRIMARY, fontSize: 12, fontWeight: 600 }}
              >
                Xem tất cả →
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {choDuyet.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 40, color: "#059669", mb: 1 }}
                />
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                  Không có yêu cầu nào đang chờ duyệt
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                        Giảng viên
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                        Số tiền
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                        Ngân hàng
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                        Thời gian
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {choDuyet.slice(0, 5).map((y) => (
                      <TableRow
                        key={y.id}
                        sx={{ "&:hover": { bgcolor: "#f9f8f6" } }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 26,
                                height: 26,
                                bgcolor: PRIMARY,
                                fontSize: 11,
                              }}
                            >
                              {y.tenGiangVien?.[0]}
                            </Avatar>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                              {y.tenGiangVien}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: PRIMARY,
                              fontSize: 13,
                            }}
                          >
                            {formatTien(y.soTienRut)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          {y.soTaiKhoan}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: 11, color: "text.secondary" }}
                        >
                          {thoiGian(y.ngayYeuCau)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => router.push("/admin/rut-tien")}
                            sx={{
                              bgcolor: PRIMARY,
                              "&:hover": { bgcolor: "#7f1d1d" },
                              fontSize: 11,
                              py: 0.3,
                              borderRadius: 1.5,
                            }}
                          >
                            Xử lý
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Right */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Quick actions */}
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              mb: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
              Truy cập nhanh
            </Typography>
            <Stack spacing={1}>
              {[
                {
                  label: "Duyệt rút tiền",
                  icon: <AccountBalanceIcon />,
                  href: "/admin/rut-tien",
                  badge: choDuyet.length > 0 ? choDuyet.length : null,
                  color: "#d97706",
                },
                {
                  label: "Quản lý thông báo",
                  icon: <NotificationsIcon />,
                  href: "/admin/thong-bao",
                  badge: chuaDocAdmin.length > 0 ? chuaDocAdmin.length : null,
                  color: PRIMARY,
                },
                {
                  label: "Người dùng",
                  icon: <PeopleIcon />,
                  href: "/admin/nguoi-dung",
                  badge: null,
                  color: "#3b82f6",
                },
                {
                  label: "Khóa học",
                  icon: <SchoolIcon />,
                  href: "/admin/khoa-hoc",
                  badge: null,
                  color: "#8b5cf6",
                },
              ].map((item) => (
                <Box
                  key={item.href}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: "1px solid #f0ece8",
                    "&:hover": { bgcolor: "#fff0f0", borderColor: PRIMARY },
                  }}
                  onClick={() => router.push(item.href)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: item.color }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  {item.badge != null && item.badge > 0 && (
                    <Chip
                      label={item.badge}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 700, height: 20, fontSize: 11 }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Thông báo mới */}
          <Card
            sx={{
              borderRadius: 3,
              p: 2.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  Thông báo mới
                </Typography>
                {chuaDocAdmin.length > 0 && (
                  <Chip
                    label={chuaDocAdmin.length}
                    color="error"
                    size="small"
                    sx={{ height: 18, fontSize: 10 }}
                  />
                )}
              </Box>
              <Button
                size="small"
                onClick={() => router.push("/admin/thong-bao")}
                sx={{ color: PRIMARY, fontSize: 11, fontWeight: 600 }}
              >
                Xem tất cả
              </Button>
            </Box>

            {thongBaoAdmins.length === 0 ? (
              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "center",
                  py: 2,
                }}
              >
                Không có thông báo mới
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {thongBaoAdmins.slice(0, 5).map((t) => (
                  <Box
                    key={t.id}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      bgcolor: !t.daDoc ? "#fffbf0" : "transparent",
                      p: 1,
                      borderRadius: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        mt: 0.7,
                        flexShrink: 0,
                        bgcolor: !t.daDoc ? "#d97706" : "#ccc",
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: !t.daDoc ? 600 : 400,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                        }}
                      >
                        {t.tieuDe}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11, color: "text.secondary" }}
                      >
                        {thoiGian(t.thoiGianTao)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
