"use client";
import { COLORS } from "@/src/theme/tokens";

import { useEffect, useState } from "react";
import { apiService } from "@/src/services/index";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getSoDu } from "@/src/store/rutTien/RutTienSlice";

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

// Crimson palette matching the premium design theme

// --- MOCK DATA ---
const instructorStats = [
  {
    label: "Tổng khóa học",
    value: "12",
    icon: SchoolRounded,
    iconBg: "rgba(141, 19, 19, 0.06)",
    iconColor: COLORS.primary,
  },
  {
    label: "Tổng học viên",
    value: "1,240",
    icon: PeopleAltRounded,
    iconBg: "rgba(141, 19, 19, 0.06)",
    iconColor: COLORS.primary,
  },
  {
    label: "Doanh thu cá nhân",
    value: "85.5M",
    suffix: "VNĐ",
    icon: AttachMoneyRounded,
    iconBg: "rgba(141, 19, 19, 0.06)",
    iconColor: COLORS.primary,
  },
  {
    label: "Rating trung bình",
    value: "4.9",
    suffix: "/5",
    icon: StarRounded,
    iconBg: "rgba(141, 19, 19, 0.06)",
    iconColor: "#F59E0B",
  },
];

const revenueMonths = [
  { label: "Tháng 1", value: 45 },
  { label: "Tháng 2", value: 52 },
  { label: "Tháng 3", value: 65 },
  { label: "Tháng 4", value: 60 },
  { label: "Tháng 5", value: 95 },
  { label: "Tháng 6", value: 55 },
  { label: "Tháng 7", value: 48 },
];

const latestStudents = [
  {
    id: "1",
    name: "Lê Minh Tuấn",
    avatar: "",
    course: "Marketing Cơ bản",
    progress: 45,
    lastActivity: "2 giờ trước",
  },
  {
    id: "2",
    name: "Trần Thị Bích",
    avatar: "",
    course: "Thiết kế UI/UX",
    progress: 92,
    lastActivity: "5 giờ trước",
  },
  {
    id: "3",
    name: "Nguyễn Hoàng Nam",
    avatar: "",
    course: "Python for Data Science",
    progress: 12,
    lastActivity: "Hôm qua",
  },
];

const completionRates = [
  { name: "Khóa học Marketing", rate: 82 },
  { name: "Thiết kế UI/UX", rate: 65 },
];

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
    iconBg: "rgba(16, 185, 129, 0.08)",
    iconColor: "#10B981",
  },
  RutTienThanhCong: {
    icon: AccountBalanceRounded,
    iconBg: "rgba(16, 185, 129, 0.08)",
    iconColor: "#10B981",
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
  data: typeof revenueMonths;
  highlightIndex: number;
}) {
  const maxVal = data.length ? Math.max(1, ...data.map((d) => d.value)) : 1;
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "flex-end", gap: { xs: 1, md: 2 }, height: 180, mt: 2 }}
    >
      {data.map((month, i) => {
        const isHighlight = i === highlightIndex;
        const barHeight = (month.value / maxVal) * 160;
        return (
          <Stack
            key={month.label}
            sx={{ alignItems: "center", flex: 1, gap: 1 }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 48,
                height: barHeight,
                borderRadius: "8px 8px 4px 4px",
                bgcolor: isHighlight
                  ? COLORS.primary
                  : "rgba(141, 19, 19, 0.12)",
                transition: "background-color 300ms ease, height 500ms ease",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: isHighlight
                    ? COLORS.primaryDark
                    : "rgba(141, 19, 19, 0.22)",
                },
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: isHighlight ? 800 : 500,
                color: isHighlight ? COLORS.primary : "rgba(31,41,55,0.5)",
              }}
            >
              {month.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

// --- MAIN COMPONENT ---
export default function InstructorDashboardContent() {
  const [highlightMonth] = useState(4);
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { soDu, thongBaos, nganHangs } = useSelector((s) => s.rutTien);
  const fullName = user?.hoTen || user?.userName || "Giảng viên";

  useEffect(() => {
    dispatch(getSoDu());
  }, [dispatch]);

  // Dữ liệu dashboard giảng viên THẬT từ /dashboard (backend trả theo vai trò GiaoVien)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dash, setDash] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiService.get<any>("/dashboard");
        if (res?.status && res.data) setDash(res.data);
      } catch (e) {
        console.error("Error fetching instructor dashboard:", e);
      }
    })();
  }, []);

  const formatTien = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString("vi-VN");
  };

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
      value: dash ? String(dash.totalCourses ?? 0) : "—",
      icon: SchoolRounded,
      iconBg: "rgba(141, 19, 19, 0.06)",
      iconColor: COLORS.primary,
    },
    {
      label: "Tổng học viên",
      value: dash ? (dash.totalStudents ?? 0).toLocaleString("vi-VN") : "—",
      icon: PeopleAltRounded,
      iconBg: "rgba(141, 19, 19, 0.06)",
      iconColor: COLORS.primary,
    },
    {
      label: "Doanh thu cá nhân",
      value: dash ? formatTien(dash.totalRevenue ?? 0) : formatTien(soDu),
      suffix: "VNĐ",
      icon: AttachMoneyRounded,
      iconBg: "rgba(141, 19, 19, 0.06)",
      iconColor: COLORS.primary,
      onClick: () => router.push("/instructor/money"),
    },
  ];
  return (
    <>
      {/* ============================================== */}
      {/* 1. WELCOME CARD                                */}
      {/* ============================================== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "24px",
          overflow: "visible",
          background:
            "linear-gradient(135deg, #4A0E0E 0%, #7F1D1D 40%, #8B1313 100%)",
          color: "#fff",
          position: "relative",
          minHeight: { xs: 220, md: 260 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left: Text content */}
          <Box sx={{ p: { xs: 3, md: 4 }, flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 24, md: 30 },
                fontWeight: 900,
                lineHeight: 1.3,
                mb: 1.5,
                fontStyle: "italic",
              }}
            >
              Chào mừng trở lại, GS.
              <br />
              {fullName}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                opacity: 0.8,
                maxWidth: 420,
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Theo dõi hiệu suất giảng dạy và phát triển khóa học của bạn một
              cách trực quan và chuyên nghiệp.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                sx={{
                  borderRadius: "12px",
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "#fff",
                  px: 2.5,
                  py: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Tạo khóa học
              </Button>
              <Button
                variant="contained"
                startIcon={<AccountBalanceWalletRounded />}
                onClick={() => router.push("/instructor/money")}
                sx={{
                  borderRadius: "12px",
                  bgcolor: "#fff",
                  color: COLORS.primary,
                  px: 2.5,
                  py: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                Rút tiền ({formatTien(soDu)}đ)
              </Button>
              <Button
                variant="contained"
                sx={{
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  px: 2.5,
                  py: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.25)",
                    boxShadow: "none",
                  },
                }}
              >
                Xem báo cáo
              </Button>
            </Stack>
          </Box>

          {/* Right: Hero image */}
          <Box
            sx={{
              width: { xs: "100%", md: 280 },
              height: { xs: 160, md: 200 },
              position: "relative",
              flexShrink: 0,
              display: { xs: "none", md: "block" },
              mr: 2,
            }}
          >
            <Image
              src="/auth/img/instructor_hero.png"
              alt="Instructor Dashboard"
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
              priority
            />
          </Box>
        </Stack>

        {/* Decorative gradient circles */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />
      </Paper>

      {/* ============================================== */}
      {/* 2. STATS CARDS                                 */}
      {/* ============================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
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
                  boxShadow: "0 8px 24px rgba(141,19,19,0.06)",
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
              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(31,41,55,0.55)",
                    mb: 0.3,
                  }}
                >
                  {stat.label}
                </Typography>
                <Stack
                  direction="row"
                  sx={{ alignItems: "baseline", gap: 0.5 }}
                >
                  <Typography
                    sx={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "#1F2937",
                      lineHeight: 1.1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  {stat.suffix && (
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "rgba(31,41,55,0.45)",
                      }}
                    >
                      {stat.suffix}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* ============================================== */}
      {/* 3. REVENUE CHART + RIGHT PANELS                */}
      {/* ============================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        {/* Revenue Chart */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "20px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: COLORS.white,
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
                sx={{ fontSize: 18, fontWeight: 800, color: "#1F2937" }}
              >
                Học viên mới theo tháng
              </Typography>
              <Typography
                sx={{ fontSize: 12.5, color: "rgba(31,41,55,0.5)", mt: 0.3 }}
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

        {/* Right side panels */}
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
              sx={{ fontSize: 14, fontWeight: 700, color: "#1F2937", mb: 2 }}
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
                  background: `conic-gradient(${COLORS.primary} 0% 76%, rgba(141,19,19,0.08) 76% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
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
                  }}
                >
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 800, color: "#10B981" }}
                  >
                    {growthPct >= 0 ? "+" : ""}{growthPct}%
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#1F2937",
                    lineHeight: 1,
                  }}
                >
                  {growthCount.toLocaleString("vi-VN")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "rgba(31,41,55,0.5)",
                    fontWeight: 500,
                  }}
                >
                  Tháng này
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
              sx={{ fontSize: 14, fontWeight: 700, color: "#1F2937", mb: 2 }}
            >
              Tỷ lệ hoàn thành
            </Typography>
            <Stack spacing={2}>
              {completionData.map((item) => (
                <Box key={item.title}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", mb: 0.8 }}
                  >
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
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
                      bgcolor: "rgba(141,19,19,0.06)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        bgcolor: COLORS.primary,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* ============================================== */}
      {/* 4. STUDENTS TABLE + NOTIFICATIONS               */}
      {/* ============================================== */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
          gap: 2.5,
        }}
      >
        {/* Latest Students Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: COLORS.white,
            overflow: "hidden",
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
              sx={{ fontSize: 18, fontWeight: 800, color: "#1F2937" }}
            >
              Học viên mới nhất
            </Typography>
            <Button
              endIcon={
                <ArrowForwardRounded sx={{ fontSize: "16px !important" }} />
              }
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

          <TableContainer>
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
                        sx={{ fontSize: 13, color: "rgba(31,41,55,0.7)" }}
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
            sx={{ fontSize: 18, fontWeight: 800, color: "#1F2937", mb: 2.5 }}
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
                  py: 3,
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
                    // onClick={() =>
                    //   // !notif.daDoc && dispatch(danhDauDaDoc(notif.id))
                    // }
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
              mt: 2,
              borderRadius: "14px",
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
      </Box>

      {/* ============================================== */}
      {/* 5. FLOATING CTA BUTTON                         */}
      {/* ============================================== */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          left: { xs: 16, lg: 304 },
          zIndex: 1100,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          sx={{
            borderRadius: "16px",
            bgcolor: COLORS.primary,
            color: "#fff",
            px: 3,
            py: 1.5,
            fontSize: 14,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 8px 24px rgba(141,19,19,0.3)",
            "&:hover": {
              bgcolor: COLORS.primaryDark,
              boxShadow: "0 12px 32px rgba(141,19,19,0.4)",
              transform: "translateY(-2px)",
            },
            transition: "all 200ms ease",
          }}
        >
          Tạo khóa học mới
        </Button>
      </Box>
    </>
  );
}
