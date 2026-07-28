"use client";
import { COLORS } from "@/src/theme/tokens";

import { useEffect, useState } from "react";
import { apiService } from "@/src/services/index";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getSoDu, getNganHangs } from "@/src/store/rutTien/RutTienSlice";

import Image from "next/image";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Avatar,
  LinearProgress,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  AddRounded,
  SchoolRounded,
  PeopleAltRounded,
  AttachMoneyRounded,
  StarRounded,
  ArrowForwardRounded,
  DescriptionRounded,
  PersonAddRounded,
  StarBorderRounded,
  PaymentRounded,
  QuestionAnswerRounded,
  VisibilityRounded,
  AccountBalanceWalletRounded,
  AccountBalanceRounded,
} from "@mui/icons-material";

const loaiIconMap: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { icon: any; iconBg: string; iconColor: string }
> = {
  YeuCauRutTien: {
    icon: PaymentRounded,
    iconBg: "rgba(245, 158, 11, 0.08)",
    iconColor: "#F59E0B",
  },
  DoanhThu: {
    icon: AttachMoneyRounded,
    iconBg: "rgba(21, 128, 61, 0.08)",
    iconColor: "#15803D",
  },
  RutTienThanhCong: {
    icon: AccountBalanceRounded,
    iconBg: "rgba(21, 128, 61, 0.08)",
    iconColor: "#15803D",
  },
  RutTienTuChoi: {
    icon: PaymentRounded,
    iconBg: "rgba(220, 38, 38, 0.08)",
    iconColor: "#DC2626",
  },
};

const thoiGianRelative = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

// --- Simple Bar Chart Component ---
function RevenueBarChart({
  data,
  highlightIndex,
}: {
  data: { label: string; value: number }[];
  highlightIndex: number;
}) {
  const allZero = data.length === 0 || data.every((d) => d.value === 0);
  const maxVal = data.length ? Math.max(1, ...data.map((d) => d.value)) : 1;

  return (
    <Box sx={{ position: "relative", width: "100%", height: 210 }}>
      {/* Grid Lines in background */}
      <Stack spacing={3.5} sx={{ position: "absolute", top: 10, left: 0, right: 0, zIndex: 1, pointerEvents: "none" }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ borderBottom: "1px dashed #E2E8F0", width: "100%" }} />
        ))}
      </Stack>

      {/* Empty State Overlay */}
      {allZero && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            bgcolor: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(1px)",
            borderRadius: "12px",
          }}
        >
          <PeopleAltRounded sx={{ fontSize: 32, color: "#94A3B8", mb: 1 }} />
          <Typography sx={{ fontSize: 13.5, color: "#64748B", fontWeight: 600 }}>
            Chưa có số liệu học viên mới trong 7 tháng qua
          </Typography>
        </Box>
      )}

      {/* Bar Chart Row */}
      <Stack
        direction="row"
        sx={{
          alignItems: "flex-end",
          gap: { xs: 1.5, md: 2.5 },
          height: 170,
          mt: 3,
          position: "relative",
          zIndex: 2,
          px: 1,
        }}
      >
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const barHeight = allZero ? 6 : (month.value / maxVal) * 130;
          return (
            <Stack
              key={month.label}
              sx={{ alignItems: "center", flex: 1, gap: 1.5, position: "relative" }}
            >
              {/* Value display on top of bar when hovered or highlighted */}
              {!allZero && month.value > 0 && (
                <Typography
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 24,
                    fontSize: 11,
                    fontWeight: 800,
                    color: isHighlight ? COLORS.primary : "#64748B",
                  }}
                >
                  {month.value}
                </Typography>
              )}

              <Box
                sx={{
                  width: "100%",
                  maxWidth: 32,
                  height: barHeight,
                  borderRadius: "6px 6px 4px 4px",
                  bgcolor: allZero
                    ? "#F1F5F9"
                    : isHighlight
                    ? COLORS.primary
                    : "rgba(141, 19, 19, 0.18)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: allZero ? "default" : "pointer",
                  boxShadow: !allZero && isHighlight ? "0 4px 12px rgba(139,19,19,0.25)" : "none",
                  "&:hover": {
                    bgcolor: allZero
                      ? "#F1F5F9"
                      : isHighlight
                      ? "#7F1D1D"
                      : "rgba(141, 19, 19, 0.35)",
                    transform: !allZero ? "scaleY(1.03)" : "none",
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: isHighlight ? 800 : 600,
                  color: isHighlight ? COLORS.primary : "#64748B",
                  whiteSpace: "nowrap",
                }}
              >
                {month.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

// --- MAIN COMPONENT ---
export default function InstructorDashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { soDu, thongBaos, nganHangs } = useSelector((s) => s.rutTien);
  const fullName = user?.hoTen || user?.userName || "Giảng viên";

  useEffect(() => {
    dispatch(getSoDu());
    dispatch(getNganHangs());
  }, [dispatch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dash, setDash] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiService.get<any>("/dashboard?role=GiaoVien");
        if (res?.status && res.data) setDash(res.data);
      } catch (e) {
        console.error("Error fetching instructor dashboard:", e);
      }
    })();
  }, []);

  // Dữ liệu thật cho biểu đồ / tăng trưởng / hoàn thành / học viên mới
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartMonths: any[] = dash?.monthlyEnrollments ?? [];
  const growthCount: number = dash?.newStudentsThisMonth ?? 0;
  const growthPct: number = dash?.studentGrowthPercent ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completionData: any[] = dash?.completionByCourse ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentStudentsData: any[] = dash?.recentStudents ?? [];

  const instructorStats = [
    {
      label: "Tổng khóa học",
      value: dash ? String(dash.totalCourses ?? 0) : "0",
      icon: SchoolRounded,
      iconBg: "rgba(141, 19, 19, 0.05)",
      iconColor: COLORS.primary,
    },
    {
      label: "Tổng học viên",
      value: dash ? (dash.totalStudents ?? 0).toLocaleString("vi-VN") : "0",
      icon: PeopleAltRounded,
      iconBg: "rgba(37, 99, 235, 0.05)",
      iconColor: "#2563EB",
    },
    {
      label: "Doanh thu cá nhân",
      value: dash ? (dash.totalRevenue ?? 0).toLocaleString("vi-VN") + " đ" : "0 đ",
      icon: AttachMoneyRounded,
      iconBg: "rgba(21, 128, 61, 0.05)",
      iconColor: "#15803D",
      onClick: () => router.push("/instructor/money"),
    },
    {
      label: "Số dư khả dụng",
      value: soDu ? soDu.toLocaleString("vi-VN") + " đ" : "0 đ",
      icon: AccountBalanceWalletRounded,
      iconBg: "rgba(141, 19, 19, 0.05)",
      iconColor: COLORS.primary,
      onClick: () => router.push("/instructor/money"),
    },
  ];

  if (!dash) {
    return (
      <Stack spacing={3.5}>
        {/* Banner Skeleton */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: { xs: 3.5, md: 4.5 },
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: COLORS.white,
          }}
        >
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mb: 4 }} />
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rectangular" width={140} height={46} sx={{ borderRadius: "12px" }} />
                <Skeleton variant="rectangular" width={140} height={46} sx={{ borderRadius: "12px" }} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
              <Skeleton variant="circular" width={140} height={140} sx={{ mx: "auto" }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Grid Skeleton */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2.5,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: COLORS.white,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: "14px" }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={16} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="40%" height={28} />
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Middle Section Skeleton */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
            }}
          >
            <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="20%" height={16} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: "8px" }} />
          </Paper>

          <Stack spacing={2.5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: COLORS.white,
              }}
            >
              <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                <Skeleton variant="circular" width={68} height={68} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: COLORS.white,
              }}
            >
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Skeleton variant="text" width="80%" height={16} sx={{ mb: 0.5 }} />
                  <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3.5}>
      {/* ============================================== */}
      {/* 1. WELCOME CARD                                */}
      {/* ============================================== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "24px",
          p: { xs: 3.5, md: 4.5 },
          border: "1px solid rgba(141,19,19,0.06)",
          bgcolor: COLORS.white,
          boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Left: Text content */}
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: COLORS.primary,
                textTransform: "uppercase",
                letterSpacing: "1px",
                mb: 1,
              }}
            >
              Bảng điều khiển Giảng viên
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 26, md: 32 },
                fontWeight: 900,
                color: "#111827",
                mb: 1.5,
                lineHeight: 1.2,
              }}
            >
              Chào mừng trở lại, GS. {fullName}
            </Typography>
            <Typography
              sx={{
                fontSize: 14.5,
                color: "#64748B",
                maxWidth: 480,
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Theo dõi hiệu quả giảng dạy và quản lý hoạt động khóa học của bạn.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => router.push("/instructor/manager-courses/create/1")}
                sx={{
                  borderRadius: "12px",
                  bgcolor: COLORS.primary,
                  color: "#fff",
                  px: 3,
                  py: 1.25,
                  fontSize: 13.5,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#7F1D1D",
                    boxShadow: "none",
                  },
                }}
              >
                Tạo khóa học
              </Button>
              <Button
                variant="outlined"
                startIcon={<AccountBalanceWalletRounded />}
                onClick={() => router.push("/instructor/money")}
                sx={{
                  borderRadius: "12px",
                  borderColor: "rgba(141,19,19,0.25)",
                  color: COLORS.primary,
                  px: 3,
                  py: 1.25,
                  fontSize: 13.5,
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: COLORS.primary,
                    bgcolor: "rgba(141,19,19,0.03)",
                  },
                }}
              >
                Rút tiền
              </Button>
            </Stack>
          </Box>

          {/* Right: Instructor Avatar/Image */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: "#FEF2F2",
              border: "2px solid rgba(141,19,19,0.08)",
              position: "relative",
              mr: 2,
              p: 0.5,
            }}
          >
            <Avatar
              src={user?.anhDaiDien || "/auth/img/instructor_hero.png"}
              alt={fullName}
              sx={{
                width: 146,
                height: 146,
                border: "1px solid rgba(141,19,19,0.04)",
                boxShadow: "0 8px 24px rgba(141,19,19,0.06)",
                bgcolor: "#FEF2F2",
                "& img": {
                  objectFit: user?.anhDaiDien ? "cover" : "contain",
                }
              }}
            >
              {fullName.split(" ").pop()?.charAt(0)}
            </Avatar>
          </Box>
        </Stack>

        {/* Decorative Shapes */}
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(141,19,19,0.03) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />
      </Paper>

      {/* ============================================== */}
      {/* 2. STATS CARDS                                 */}
      {/* ============================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 2.5,
        }}
      >
        {instructorStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Paper
              key={stat.label}
              elevation={0}
              onClick={stat.onClick}
              sx={{
                p: 2.5,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: COLORS.white,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: stat.onClick ? "pointer" : "default",
                transition: "transform 200ms ease, box-shadow 200ms ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 24px rgba(141,19,19,0.06)",
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 24, color: stat.iconColor }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#64748B",
                    mb: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* ============================================== */}
      {/* 3. MAIN DASHBOARD CONTENT GRID                 */}
      {/* ============================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        {/* Left Column Stack: Chart & Students Table */}
        <Stack spacing={2.5}>
          {/* Revenue Chart */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
              height: 350,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  sx={{ fontSize: 16.5, fontWeight: 800, color: "#1F2937" }}
                >
                  Học viên mới theo tháng
                </Typography>
                <Typography
                  sx={{ fontSize: 12.5, color: "#64748B", mt: 0.3 }}
                >
                  Số lượt đăng ký 7 tháng gần nhất
                </Typography>
              </Box>
              <Chip
                label={`Năm ${new Date().getFullYear()}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: "rgba(31,41,55,0.6)",
                  bgcolor: "rgba(31,41,55,0.04)",
                  border: "1px solid rgba(31,41,55,0.08)",
                  borderRadius: "10px",
                }}
              />
            </Stack>
            <RevenueBarChart
              data={chartMonths}
              highlightIndex={chartMonths.length ? chartMonths.length - 1 : 0}
            />
          </Paper>

          {/* Latest Students Table */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: 350,
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                p: 3,
                pb: 2,
              }}
            >
              <Typography
                sx={{ fontSize: 16.5, fontWeight: 800, color: "#1F2937" }}
              >
                Học viên mới nhất
              </Typography>
              <Button
                endIcon={
                  <ArrowForwardRounded sx={{ fontSize: "16px !important" }} />
                }
                onClick={() => router.push("/instructor/students")}
                sx={{
                  textTransform: "none",
                  color: COLORS.primary,
                  fontWeight: 700,
                  fontSize: 13,
                  "&:hover": { bgcolor: "rgba(141,19,19,0.04)" },
                }}
              >
                Xem tất cả
              </Button>
            </Stack>

            {recentStudentsData.length === 0 ? (
              <Box sx={{ p: 8, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <PeopleAltRounded sx={{ fontSize: 44, color: "#CBD5E1", mb: 1.5 }} />
                <Typography sx={{ fontSize: 14, color: "#64748B", fontWeight: 600 }}>
                  Chưa có học viên đăng ký khóa học
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ flex: 1, overflowY: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: "rgba(31,41,55,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                          px: 3,
                        }}
                      >
                        Học viên
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: "rgba(31,41,55,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        Khóa học
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: "rgba(31,41,55,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        Tiến độ
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: 11,
                          color: "rgba(31,41,55,0.45)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        Hoạt động cuối
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStudentsData.map((student, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "&:hover": { bgcolor: "rgba(141,19,19,0.015)" },
                        }}
                      >
                        <TableCell
                          sx={{
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                            px: 3,
                            py: 2,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: 13,
                                fontWeight: 700,
                                bgcolor: "rgba(141,19,19,0.08)",
                                color: COLORS.primary,
                              }}
                            >
                              {student.name.split(" ").pop()?.charAt(0)}
                            </Avatar>
                            <Typography
                              sx={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: "#1F2937",
                              }}
                            >
                              {student.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{ borderBottom: "1px solid rgba(0,0,0,0.04)", py: 2 }}
                        >
                          <Typography
                            noWrap
                            sx={{ fontSize: 13, color: "rgba(31,41,55,0.7)", maxWidth: 180 }}
                          >
                            {student.course}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ borderBottom: "1px solid rgba(0,0,0,0.04)", py: 2 }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <LinearProgress
                              variant="determinate"
                              value={student.progress}
                              sx={{
                                width: 80,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "rgba(141,19,19,0.06)",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 3,
                                  bgcolor:
                                    student.progress > 80
                                      ? "#10B981"
                                      : COLORS.primary,
                                },
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: "#1F2937",
                                minWidth: 32,
                              }}
                            >
                              {student.progress}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{ borderBottom: "1px solid rgba(0,0,0,0.04)", py: 2 }}
                        >
                          <Typography
                            sx={{ fontSize: 12.5, color: "rgba(31,41,55,0.5)" }}
                          >
                            {student.time}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Stack>

        {/* Right Column Stack: Growth, Completion, Tasks, Notifications */}
        <Stack spacing={2.5}>
          {/* Student Growth */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
            }}
          >
            <Typography
              sx={{ fontSize: 14.5, fontWeight: 800, color: "#1F2937", mb: 2 }}
            >
              Tăng trưởng học viên
            </Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2.5 }}>
              {/* Circular-like progress indicator */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `conic-gradient(#10B981 0% ${growthPct > 0 ? growthPct : 0}%, #F1F5F9 ${growthPct > 0 ? growthPct : 0}% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "inset 0 0 0 6px #fff",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: COLORS.white,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12.5, fontWeight: 800, color: growthPct >= 0 ? "#10B981" : "#EF4444" }}
                  >
                    {growthPct >= 0 ? "+" : ""}{growthPct}%
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: "#1F2937",
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {growthCount.toLocaleString("vi-VN")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  Đăng ký mới trong tháng này
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Completion Rate */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
            }}
          >
            <Typography
              sx={{ fontSize: 14.5, fontWeight: 800, color: "#1F2937", mb: 2 }}
            >
              Tỷ lệ hoàn thành
            </Typography>
            {completionData.length === 0 ? (
              <Box sx={{ py: 2.5, textAlign: "center" }}>
                <Typography sx={{ fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
                  Chưa có số liệu học viên hoàn thành
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {completionData.map((item) => (
                  <Box key={item.title}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between", mb: 0.8 }}
                    >
                      <Typography
                        noWrap
                        sx={{ fontSize: 12.5, fontWeight: 700, color: "#475569", maxWidth: "80%" }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: COLORS.primary,
                        }}
                      >
                        {item.rate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.rate}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#F1F5F9",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          bgcolor: COLORS.primary,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Tasks Panel */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
            }}
          >
            <Typography
              sx={{ fontSize: 15, fontWeight: 800, color: "#1F2937", mb: 2 }}
            >
              Công việc cần xử lý
            </Typography>
            <Stack spacing={1.5}>
              {/* Task 1: Ngan hang */}
              {nganHangs.length === 0 ? (
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#D97706",
                      }}
                    />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>
                      Chưa liên kết tài khoản ngân hàng
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    onClick={() => router.push("/instructor/bank")}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 850,
                      color: "#D97706",
                      p: 0,
                      minWidth: 0,
                      "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                    }}
                  >
                    Thiết lập
                  </Button>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#059669",
                    }}
                  />
                  <Typography sx={{ fontSize: 13, fontWeight: 750, color: "#065F46" }}>
                    Tài khoản ngân hàng đã hoạt động
                  </Typography>
                </Stack>
              )}

              {/* Task 2: Tao khoa hoc neu totalCourses === 0 */}
              {dash && (dash.totalCourses ?? 0) === 0 ? (
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#D97706",
                      }}
                    />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>
                      Chưa có khóa học nào được tạo
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    onClick={() => router.push("/instructor/manager-courses")}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 850,
                      color: "#D97706",
                      p: 0,
                      minWidth: 0,
                      "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                    }}
                  >
                    Tạo ngay
                  </Button>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: "12px",
                    bgcolor: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#059669",
                    }}
                  />
                  <Typography sx={{ fontSize: 13, fontWeight: 750, color: "#065F46" }}>
                    Đã tạo khóa học trên hệ thống
                  </Typography>
                </Stack>
              )}

              {/* Task 3: Cap nhat thong tin ca nhan */}
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: "12px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#64748B",
                    }}
                  />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>
                    Cập nhật hồ sơ cá nhân giảng viên
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  onClick={() => router.push("/settings")}
                  sx={{
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 850,
                    color: "#475569",
                    p: 0,
                    minWidth: 0,
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                  }}
                >
                  Cập nhật
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Notifications & Activities */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: COLORS.white,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              sx={{ fontSize: 15, fontWeight: 800, color: "#1F2937", mb: 2.5 }}
            >
              Thông báo & Hoạt động
            </Typography>

            <Stack spacing={0} sx={{ flex: 1 }}>
              {thongBaos.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "rgba(31,41,55,0.5)",
                    textAlign: "center",
                    py: 4,
                  }}
                >
                  Chưa có thông báo nào
                </Typography>
              ) : (
                thongBaos.slice(0, 4).map((notif, index) => {
                  const config = loaiIconMap[notif.loaiThongBao ?? ""] ?? {
                    icon: PersonAddRounded,
                    iconBg: "rgba(141, 19, 19, 0.08)",
                    iconColor: COLORS.primary,
                  };
                  const Icon = config.icon;
                  return (
                    <Box
                      key={notif.id}
                      sx={{
                        display: "flex",
                        gap: 2,
                        py: 2,
                        cursor: !notif.daDoc ? "pointer" : "default",
                        borderBottom:
                          index < Math.min(thongBaos.length, 4) - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none",
                        bgcolor: !notif.daDoc
                          ? "rgba(141,19,19,0.02)"
                          : "transparent",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          bgcolor: config.iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 20, color: config.iconColor }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          sx={{ alignItems: "center", gap: 0.8 }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: !notif.daDoc ? 800 : 700,
                              color: "#1F2937",
                              mb: 0.3,
                            }}
                          >
                            {notif.tieuDe}
                          </Typography>
                          {!notif.daDoc && (
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                bgcolor: COLORS.primary,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "rgba(31,41,55,0.6)",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {notif.noiDung}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "rgba(31,41,55,0.4)",
                            mt: 0.5,
                          }}
                        >
                          {thoiGianRelative(notif.thoiGianTao)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Stack>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/instructor/thong-bao")}
              sx={{
                mt: 2.5,
                borderRadius: "12px",
                borderColor: "rgba(141,19,19,0.15)",
                color: "#1F2937",
                fontWeight: 700,
                fontSize: 13,
                textTransform: "none",
                py: 1.2,
                "&:hover": {
                  borderColor: COLORS.primary,
                  bgcolor: "rgba(141,19,19,0.03)",
                },
              }}
            >
              Xem tất cả thông báo
            </Button>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}
