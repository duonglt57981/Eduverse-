/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getSoDu, getNganHangs } from "@/src/store/rutTien/RutTienSlice";
import { apiService } from "@/src/services/index";
import { thongBaoService } from "@/src/services/ThongBaoService";
import { BRAND, NEUTRAL, STATUS } from "@/src/theme/tokens";
import { alpha } from "@mui/material/styles";

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Chip,
  Skeleton,
} from "@mui/material";
import { EduAvatar } from "@/src/components/common/EduAvatar";
import {
  AddRounded,
  SchoolRounded,
  PeopleAltRounded,
  AttachMoneyRounded,
  ArrowForwardRounded,
  AccountBalanceWalletRounded,
  AccountBalanceRounded,
  PaymentRounded,
  PersonAddRounded,
  CheckCircleOutlineRounded,
  CheckCircleRounded,
  AutoAwesomeRounded,
  NotificationsNoneRounded,
  NotificationsActiveRounded,
  TrendingUpRounded,
  TrendingDownRounded,
  CalendarTodayRounded,
  ShowChartRounded,
  BarChartRounded,
  MenuBookRounded,
  LocalOfferRounded,
  CancelOutlined,
  AccessTimeRounded,
  ForumRounded,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

// Dynamic Notification Config Mapping theo phong cách Modern SaaS
function getNotificationConfig(noti: any) {
  const loai = (noti?.loaiThongBao || "").toLowerCase();
  const tieuDe = (noti?.tieuDe || "").toLowerCase();

  if (
    loai.includes("tuchoi") ||
    loai.includes("tu_choi") ||
    tieuDe.includes("từ chối") ||
    tieuDe.includes("hủy")
  ) {
    return {
      icon: CancelOutlined,
      iconBg: "#FEE2E2",
      iconColor: "#DC2626",
      borderColor: "#FECACA",
    };
  }
  if (
    loai.includes("ruttien") ||
    loai.includes("rut_tien") ||
    tieuDe.includes("rút tiền")
  ) {
    return {
      icon: AccountBalanceWalletRounded,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
      borderColor: "#BBF7D0",
    };
  }
  if (
    loai.includes("hocvien") ||
    loai.includes("dangky") ||
    loai.includes("dang_ky") ||
    tieuDe.includes("học viên") ||
    tieuDe.includes("đăng ký")
  ) {
    return {
      icon: PersonAddRounded,
      iconBg: "#EFF6FF",
      iconColor: "#2563EB",
      borderColor: "#DBEAFE",
    };
  }
  if (
    loai.includes("khuyenmai") ||
    loai.includes("giamgia") ||
    tieuDe.includes("khuyến mãi") ||
    tieuDe.includes("giảm giá") ||
    tieuDe.includes("mã")
  ) {
    return {
      icon: LocalOfferRounded,
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
      borderColor: "#FDE68A",
    };
  }
  if (
    loai.includes("hoidap") ||
    loai.includes("cauhoi") ||
    tieuDe.includes("hỏi") ||
    tieuDe.includes("thảo luận")
  ) {
    return {
      icon: ForumRounded,
      iconBg: "#EEF2FF",
      iconColor: "#4F46E5",
      borderColor: "#E0E7FF",
    };
  }
  if (
    loai.includes("duyet") ||
    tieuDe.includes("phê duyệt") ||
    tieuDe.includes("thành công")
  ) {
    return {
      icon: CheckCircleRounded,
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
      borderColor: "#BBF7D0",
    };
  }

  return {
    icon: NotificationsActiveRounded,
    iconBg: "rgba(139, 19, 19, 0.08)",
    iconColor: BRAND.main,
    borderColor: "rgba(139, 19, 19, 0.15)",
  };
}

const SAMPLE_INSTRUCTOR_NOTIFS = [
  {
    id: "sample-1",
    tieuDe: "Khóa học đã được phê duyệt",
    noiDung:
      "Khóa học của bạn đã được ban quản trị kiểm duyệt và xuất bản thành công trên nền tảng.",
    thoiGianTao: new Date(Date.now() - 3600000 * 2).toISOString(),
    loaiThongBao: "khoahocdaduyet",
    daDoc: false,
  },
  {
    id: "sample-2",
    tieuDe: "Yêu cầu rút tiền được duyệt",
    noiDung:
      "Yêu cầu rút 50.000đ của bạn đã được phê duyệt và hoàn tất chuyển khoản thành công.",
    thoiGianTao: new Date(Date.now() - 3600000 * 5).toISOString(),
    loaiThongBao: "ruttienthanhcong",
    daDoc: true,
  },
  {
    id: "sample-3",
    tieuDe: "Học viên mới vừa đăng ký",
    noiDung: "Đã có thêm học viên mới vừa tham gia khóa học của bạn.",
    thoiGianTao: new Date(Date.now() - 3600000 * 12).toISOString(),
    loaiThongBao: "hocviendangkykhoahoc",
    daDoc: true,
  },
];

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

const formatTienCompact = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
};

// ── CUSTOM TOOLTIP CHO BIỂU ĐỒ HỌC VIÊN ─────────────────────────────────────
function CustomEnrollmentTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const val = payload[0].value ?? 0;
    return (
      <Paper
        elevation={0}
        sx={{
          px: 1.75,
          py: 1.2,
          borderRadius: "12px",
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.74rem",
            color: "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.98rem",
            fontWeight: 800,
            color: "#FFFFFF",
            mt: 0.3,
            lineHeight: 1.2,
          }}
        >
          {val.toLocaleString("vi-VN")} học viên
        </Typography>
      </Paper>
    );
  }
  return null;
}

// ── BIỂU ĐỒ HỌC VIÊN ĐĂNG KÝ (LINE/AREA CHART HIỆN ĐẠI) ───────────────────
function EnrollmentLineChart({
  data,
  highlightIndex,
}: {
  data: { label: string; value: number }[];
  highlightIndex: number;
}) {
  const allZero = data.length === 0 || data.every((d) => d.value === 0);

  // Custom Dot Renderer to highlight current month tastefully
  const renderCustomDot = (props: any) => {
    const { cx, cy, index, value } = props;
    if (cx === undefined || cy === undefined) return null;
    const isLatest = index === highlightIndex;

    if (isLatest) {
      return (
        <g key={`dot-highlight-${index}`}>
          <circle
            cx={cx}
            cy={cy}
            r={8}
            fill={BRAND.main}
            fillOpacity={0.18}
          />
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill={BRAND.main}
            stroke="#FFFFFF"
            strokeWidth={2.5}
          />
        </g>
      );
    }

    if (value > 0) {
      return (
        <circle
          key={`dot-${index}`}
          cx={cx}
          cy={cy}
          r={4}
          fill="#FFFFFF"
          stroke={BRAND.main}
          strokeWidth={2}
        />
      );
    }

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={3}
        fill="#FFFFFF"
        stroke="#CBD5E1"
        strokeWidth={1.5}
      />
    );
  };

  return (
    <Box sx={{ width: "100%", height: 260, position: "relative" }}>
      {allZero && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bottom: 36,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            bgcolor: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(2px)",
            borderRadius: "16px",
          }}
        >
          <PeopleAltRounded sx={{ fontSize: 32, color: "#94A3B8", mb: 0.75 }} />
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>
            Chưa có lượt đăng ký mới trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 20, left: -15, bottom: 6 }}
        >
          <defs>
            <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={BRAND.main} stopOpacity={0.16} />
              <stop offset="95%" stopColor={BRAND.main} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F1F5F9"
          />

          <XAxis
            dataKey="label"
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            tickMargin={12}
            tick={({ x, y, payload, index }: any) => {
              const isHighlight = index === highlightIndex;
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={isHighlight ? BRAND.main : "#64748B"}
                  fontSize={12}
                  fontWeight={isHighlight ? 800 : 600}
                >
                  {payload.value}
                </text>
              );
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tickMargin={8}
            tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
            domain={[0, (dataMax: number) => Math.max(dataMax > 0 ? dataMax + 2 : 5, 5)]}
          />

          <RechartsTooltip
            content={<CustomEnrollmentTooltip />}
            cursor={{
              stroke: BRAND.main,
              strokeWidth: 1.5,
              strokeDasharray: "4 4",
              opacity: 0.35,
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={BRAND.main}
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#enrollmentGrad)"
            dot={renderCustomDot}
            activeDot={{
              r: 6,
              fill: BRAND.main,
              stroke: "#FFFFFF",
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ── CUSTOM TOOLTIP CHO BIỂU ĐỒ DOANH THU ────────────────────────────────────
function CustomRevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const rawVal = payload[0].payload.raw ?? payload[0].value ?? 0;
    return (
      <Paper
        elevation={0}
        sx={{
          px: 1.75,
          py: 1.2,
          borderRadius: "12px",
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.74rem",
            color: "#94A3B8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.98rem",
            fontWeight: 800,
            color: "#10B981",
            mt: 0.3,
            lineHeight: 1.2,
          }}
        >
          {rawVal.toLocaleString("vi-VN")} ₫
        </Typography>
      </Paper>
    );
  }
  return null;
}

// ── BIỂU ĐỒ DOANH THU THỰC NHẬN (BAR CHART HIỆN ĐẠI) ──────────────────────
function RevenueBarChart({
  data,
  highlightIndex,
}: {
  data: { label: string; value: number; raw: number }[];
  highlightIndex: number;
}) {
  const allZero = data.length === 0 || data.every((d) => d.raw === 0);

  return (
    <Box sx={{ width: "100%", height: 260, position: "relative" }}>
      {allZero && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bottom: 36,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            bgcolor: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(2px)",
            borderRadius: "16px",
          }}
        >
          <AttachMoneyRounded sx={{ fontSize: 32, color: "#94A3B8", mb: 0.75 }} />
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>
            Chưa có doanh thu trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 20, left: -5, bottom: 6 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#F1F5F9"
          />

          <XAxis
            dataKey="label"
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
            tickMargin={12}
            tick={({ x, y, payload, index }: any) => {
              const isHighlight = index === highlightIndex;
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={isHighlight ? "#15803D" : "#64748B"}
                  fontSize={12}
                  fontWeight={isHighlight ? 800 : 600}
                >
                  {payload.value}
                </text>
              );
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tickFormatter={(v) => formatTienCompact(v)}
            tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
            domain={[0, "auto"]}
          />

          <RechartsTooltip
            content={<CustomRevenueTooltip />}
            cursor={{ fill: "rgba(16, 185, 129, 0.05)", radius: 8 }}
          />

          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          >
            {data.map((entry, index) => {
              const isLatest = index === highlightIndex;
              return (
                <Cell
                  key={`bar-cell-${entry.label}`}
                  fill={isLatest ? "#10B981" : "#A7F3D0"}
                  style={{
                    transition: "all 0.25s ease",
                    cursor: "pointer",
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ── COMPONENT CHÍNH (InstructorDashboardContent) ──────────────────────────
export default function InstructorDashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { soDu, thongBaos } = useSelector((s) => s.rutTien);
  const fullName = user?.hoTen || user?.userName || "Giảng viên";
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    dispatch(getSoDu());
    dispatch(getNganHangs());
  }, [dispatch]);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (typeof window !== "undefined" && user?.email) {
        const stored = localStorage.getItem(`user_avatar_${user.email}`);
        if (stored) {
          setUserAvatar(stored);
        }
      }
    };
    window.addEventListener("avatar_updated", handleAvatarUpdate);
    handleAvatarUpdate();
    return () =>
      window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, [user?.email]);

  const [dash, setDash] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.get<any>("/dashboard?role=GiaoVien");
        if (res?.status && res.data) setDash(res.data);
      } catch (e) {
        console.error("Error fetching instructor dashboard:", e);
      }
    })();
  }, []);

  const [danhSachThongBao, setDanhSachThongBao] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await thongBaoService.getMyNotifications();
        if (res?.status && Array.isArray(res.data)) {
          setDanhSachThongBao(res.data);
        }
      } catch (e) {
        console.error("Error fetching notifications:", e);
      }
    })();
  }, []);

  const rawNotifs =
    danhSachThongBao.length > 0
      ? danhSachThongBao
      : thongBaos.length > 0
        ? thongBaos
        : [];
  const allNotifs = [...rawNotifs, ...SAMPLE_INSTRUCTOR_NOTIFS];
  const notifMap = new Map<string, any>();
  allNotifs.forEach((n) => {
    const key = n.id || n.tieuDe;
    if (!notifMap.has(key)) notifMap.set(key, n);
  });
  const notiDisplayList = Array.from(notifMap.values()).slice(0, 4);

  // Dữ liệu biểu đồ học viên & tăng trưởng
  const chartMonths: { label: string; value: number }[] =
    dash?.monthlyEnrollments ?? [];
  const growthCount: number = dash?.newStudentsThisMonth ?? 0;
  const growthPct: number = dash?.studentGrowthPercent ?? 0;
  const totalEnrollmentsInPeriod = chartMonths.reduce(
    (sum, m) => sum + m.value,
    0,
  );

  // Dữ liệu doanh thu
  const rawMonthlyRevenue: { label: string; totalAmount: number }[] =
    dash?.monthlyRevenue ?? [];

  const revenueChartData = rawMonthlyRevenue.map((m) => ({
    label: m.label,
    raw: Math.round(m.totalAmount),
    value: Math.round(m.totalAmount),
  }));

  const doanhThuThangNay =
    revenueChartData.length > 0
      ? revenueChartData[revenueChartData.length - 1].raw
      : 0;

  // Top 4 Metrics đồng bộ với bảng màu hệ thống EduVerse
  const instructorStats = [
    {
      label: "Tổng khóa học",
      value: dash ? String(dash.totalCourses ?? 0) : "0",
      icon: SchoolRounded,
      gradient: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
      lightBg: "rgba(139, 19, 19, 0.08)",
      color: BRAND.main,
      sub: "Đang giảng dạy",
    },
    {
      label: "Tổng học viên",
      value: dash ? (dash.totalStudents ?? 0).toLocaleString("vi-VN") : "0",
      icon: PeopleAltRounded,
      gradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      lightBg: "rgba(37, 99, 235, 0.08)",
      color: "#2563EB",
      sub: "Đã tham gia học",
    },
    {
      label: "Doanh thu cá nhân",
      value: dash
        ? (dash.totalRevenue ?? 0).toLocaleString("vi-VN") + " đ"
        : "0 đ",
      icon: AttachMoneyRounded,
      gradient: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
      lightBg: "rgba(22, 163, 74, 0.08)",
      color: "#16A34A",
      sub: "Tổng thu nhập",
    },
    {
      label: "Số dư khả dụng",
      value: soDu ? soDu.toLocaleString("vi-VN") + " đ" : "0 đ",
      icon: AccountBalanceWalletRounded,
      gradient: `linear-gradient(135deg, #8B1313 0%, #6D0F0F 100%)`,
      lightBg: "rgba(139, 19, 19, 0.08)",
      color: BRAND.main,
      sub: "Sẵn sàng rút",
    },
  ];

  if (!dash) {
    return (
      <Stack spacing={3.5}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "28px",
            p: { xs: 3.5, md: 4.5 },
            border: `1px solid ${NEUTRAL.divider}`,
            bgcolor: "#FFFFFF",
          }}
        >
          <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="55%" height={45} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width={280} height={48} sx={{ borderRadius: "14px" }} />
        </Paper>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "22px",
                border: `1px solid ${NEUTRAL.divider}`,
                bgcolor: "#FFFFFF",
              }}
            >
              <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: "14px", mb: 2 }} />
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="75%" height={32} />
            </Paper>
          ))}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3.5}>
      {/* ── 1. HERO BANNER: Chào mừng Giảng viên ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "28px",
          p: { xs: 3, sm: 4, md: 4.5 },
          background: "linear-gradient(135deg, #FFFFFF 0%, #FAF8F6 100%)",
          border: `1px solid ${NEUTRAL.divider}`,
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Glow */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND.main}12 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3.5}
          sx={{
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "1.6rem", md: "2.1rem" },
                fontWeight: 900,
                color: "#0F172A",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                mb: 1,
              }}
            >
              Chào mừng trở lại, GV. {fullName}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.95rem",
                color: "#64748B",
                maxWidth: 540,
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Theo dõi tình hình kinh doanh, số lượng học viên và các hoạt động giảng dạy mới nhất trên hệ thống EduVerse.
            </Typography>

            {/* Quick Actions in Hero */}
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
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
                  color: "#FFFFFF",
                  px: 3.5,
                  py: 1.3,
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: `0 4px 14px ${BRAND.main}35`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.darker} 100%)`,
                    boxShadow: `0 8px 20px ${BRAND.main}45`,
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Tạo khóa học mới
              </Button>

              <Button
                variant="outlined"
                startIcon={<AccountBalanceWalletRounded />}
                onClick={() => router.push("/instructor/money")}
                sx={{
                  borderRadius: "14px",
                  borderColor: "#CBD5E1",
                  bgcolor: "#FFFFFF",
                  color: "#1E293B",
                  px: 3,
                  py: 1.3,
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  "&:hover": {
                    borderColor: BRAND.main,
                    color: BRAND.main,
                    bgcolor: "rgba(139, 19, 19, 0.04)",
                  },
                }}
              >
                Doanh thu & Rút tiền
              </Button>
            </Stack>
          </Box>

          {/* Avatar Profile Ring */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              p: 1,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
              border: `2px solid rgba(139, 19, 19, 0.15)`,
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.06)",
            }}
          >
            <EduAvatar
              src={userAvatar || user?.anhDaiDien}
              name={fullName}
              size="profile"
              border="3px solid #FFFFFF"
              shadow="0 4px 16px rgba(0, 0, 0, 0.08)"
            />
          </Box>
        </Stack>
      </Paper>

      {/* ── 2. STATS KPI CARDS ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {instructorStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 2.75,
                borderRadius: "24px",
                border: `1px solid ${NEUTRAL.divider}`,
                bgcolor: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    background: stat.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: `0 6px 14px ${stat.color}35`,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
              </Box>

              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  mb: 0.5,
                }}
              >
                {stat.label}
              </Typography>

              <Typography
                noWrap
                sx={{
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  color: "#0F172A",
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>

              <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                {stat.sub}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {/* ── 3. CHARTS ROW: 2 Biểu đồ chính song song cân xứng (50% - 50%) ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 3,
        }}
      >
        {/* ── Biểu đồ 1: Học viên đăng ký theo tháng ── */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: "20px",
            border: `1px solid ${NEUTRAL.divider}`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  bgcolor: "rgba(139, 19, 19, 0.08)",
                  color: BRAND.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShowChartRounded sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.08rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                  }}
                >
                  Học viên đăng ký theo tháng
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "#64748B",
                    mt: 0.2,
                  }}
                >
                  Số lượt đăng ký · 7 tháng gần nhất
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.25,
                py: 0.45,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "#475569",
              }}
            >
              <CalendarTodayRounded sx={{ fontSize: 13, color: "#94A3B8" }} />
              <span>Năm {new Date().getFullYear()}</span>
            </Box>
          </Stack>

          <EnrollmentLineChart
            data={chartMonths}
            highlightIndex={chartMonths.length ? chartMonths.length - 1 : 0}
          />
        </Paper>

        {/* ── Biểu đồ 2: Doanh thu theo tháng ── */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: "20px",
            border: `1px solid ${NEUTRAL.divider}`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  bgcolor: "rgba(22, 163, 74, 0.08)",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BarChartRounded sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.08rem",
                    fontWeight: 800,
                    color: "#0F172A",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                  }}
                >
                  Doanh thu theo tháng
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    color: "#64748B",
                    mt: 0.2,
                  }}
                >
                  Doanh thu thực nhận · 7 tháng gần nhất
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "#64748B",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Tháng này
              </Typography>

              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: "#15803D",
                  lineHeight: 1.25,
                  mt: 0.15,
                }}
              >
                {doanhThuThangNay.toLocaleString("vi-VN")} ₫
              </Typography>
            </Box>
          </Stack>

          <RevenueBarChart
            data={revenueChartData}
            highlightIndex={
              revenueChartData.length ? revenueChartData.length - 1 : 0
            }
          />
        </Paper>
      </Box>

      {/* ── 4. WIDGETS ROW: 3 Thẻ Thông Tin Cân Xứng Hoàn Hảo (Modern EdTech SaaS Layout) ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr",
            lg: "minmax(290px, 1fr) minmax(400px, 1.35fr) minmax(290px, 1fr)",
          },
          gap: { xs: 2.5, lg: 3 },
          alignItems: "stretch",
        }}
      >
        {/* Widget 1: Tăng trưởng học viên */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.25, sm: 2.5, xl: 3 },
            borderRadius: "20px",
            border: `1px solid ${NEUTRAL.divider}`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 2,
            height: "100%",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              background:
                growthPct >= 0
                  ? "radial-gradient(circle at top right, rgba(16, 185, 129, 0.09) 0%, transparent 70%)"
                  : "radial-gradient(circle at top right, rgba(220, 38, 38, 0.09) 0%, transparent 70%)",
              pointerEvents: "none",
            },
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
              <TrendingUpRounded sx={{ fontSize: 20, color: BRAND.main, flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: { xs: "0.95rem", xl: "1.02rem" },
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.25,
                }}
              >
                Tăng trưởng học viên
              </Typography>
            </Box>
            <Chip
              label="Tháng này"
              size="small"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                bgcolor: "#F8FAFC",
                color: "#64748B",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                height: 24,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            />
          </Stack>

          {/* Hero KPI Stats Block */}
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              bgcolor:
                growthPct >= 0
                  ? "rgba(16, 185, 129, 0.04)"
                  : "rgba(220, 38, 38, 0.03)",
              border: `1px solid ${growthPct >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(220, 38, 38, 0.12)"}`,
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "1.65rem", xl: "1.85rem" },
                    fontWeight: 900,
                    color: "#0F172A",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  +{growthCount}{" "}
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "#64748B",
                    }}
                  >
                    học viên
                  </Typography>
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    color: "#94A3B8",
                    mt: 0.35,
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  Ghi danh mới trong tháng
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1.25,
                  py: 0.6,
                  borderRadius: "10px",
                  bgcolor: growthPct >= 0 ? "#DCFCE7" : "#FEE2E2",
                  color: growthPct >= 0 ? "#15803D" : "#DC2626",
                  border: `1px solid ${growthPct >= 0 ? "#BBF7D0" : "#FECACA"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {growthPct >= 0 ? (
                  <TrendingUpRounded sx={{ fontSize: 16 }} />
                ) : (
                  <TrendingDownRounded sx={{ fontSize: 16 }} />
                )}
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 800 }}>
                  {growthPct >= 0
                    ? `+${growthPct}%`
                    : `-${Math.abs(growthPct)}%`}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Bottom Dual Summary Badges */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: "14px",
                bgcolor: "#F8FAFC",
                border: "1px solid #F1F5F9",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: "#64748B",
                  fontWeight: 600,
                  mb: 0.35,
                  lineHeight: 1.3,
                }}
              >
                Trung bình / tháng
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.98rem", xl: "1.05rem" },
                  color: "#0F172A",
                  fontWeight: 900,
                  lineHeight: 1.2,
                }}
              >
                ~
                {Math.round(
                  totalEnrollmentsInPeriod / Math.max(chartMonths.length, 1),
                )}{" "}
                học viên
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: "14px",
                bgcolor: "#F8FAFC",
                border: "1px solid #F1F5F9",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.74rem",
                  color: "#64748B",
                  fontWeight: 600,
                  mb: 0.35,
                  lineHeight: 1.3,
                }}
              >
                Tổng ghi danh 7T
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.98rem", xl: "1.05rem" },
                  color: "#0F172A",
                  fontWeight: 900,
                  lineHeight: 1.2,
                }}
              >
                {totalEnrollmentsInPeriod} lượt
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Widget 2: Tiến độ học viên */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.25, sm: 2.5, xl: 3 },
            borderRadius: "20px",
            border: `1px solid ${NEUTRAL.divider}`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 2,
            height: "100%",
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "nowrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
              <MenuBookRounded sx={{ fontSize: 20, color: BRAND.main, flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: { xs: "0.95rem", xl: "1rem" },
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Tiến độ học viên
              </Typography>
            </Box>
            <Chip
              label="Khóa học nổi bật"
              size="small"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                bgcolor: "#F8FAFC",
                color: "#64748B",
                border: "1px solid #E2E8F0",
                borderRadius: "6px",
                height: 24,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            />
          </Stack>

          {dash?.completionByCourse?.length ? (
            <Stack spacing={1.5} sx={{ flex: 1, justifyContent: "space-between" }}>
              {dash.completionByCourse.slice(0, 3).map((c: any, idx: number) => {
                const rate = Math.round(
                  Number(c.rate ?? c.completionRate ?? 0),
                );
                return (
                  <Box
                    key={c.courseId || c.title || idx}
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      bgcolor: "#FAF8F6",
                      border: "1px solid #F1F5F9",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      minHeight: 68,
                      "&:hover": {
                        bgcolor: "#F5F0EB",
                        borderColor: alpha(BRAND.main, 0.2),
                        boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 1,
                        flexWrap: "nowrap",
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 750,
                          color: "#1E293B",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={c.title}
                      >
                        {c.title}
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: "8px",
                          bgcolor:
                            rate >= 100
                              ? "#DCFCE7"
                              : "rgba(139, 19, 19, 0.08)",
                          color: rate >= 100 ? "#15803D" : BRAND.main,
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          border: `1px solid ${rate >= 100 ? "#BBF7D0" : "rgba(139, 19, 19, 0.15)"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.35,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rate >= 100 && (
                          <CheckCircleRounded sx={{ fontSize: 13, color: "#15803D" }} />
                        )}
                        {rate}%
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        height: 6,
                        borderRadius: "999px",
                        bgcolor: "#E2E8F0",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${Math.min(Math.max(rate, 0), 100)}%`,
                          borderRadius: "999px",
                          background:
                            rate >= 100
                              ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                              : `linear-gradient(90deg, ${BRAND.main} 0%, #DC2626 100%)`,
                          boxShadow:
                            rate >= 100
                              ? "0 2px 6px rgba(16, 185, 129, 0.3)"
                              : `0 2px 6px ${BRAND.main}30`,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <SchoolRounded sx={{ fontSize: 36, color: "#CBD5E1", mb: 1 }} />
              <Typography sx={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                Chưa có dữ liệu tiến độ
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Widget 3: Hoạt động mới nhất */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.25, sm: 2.5, xl: 3 },
            borderRadius: "20px",
            border: `1px solid ${NEUTRAL.divider}`,
            bgcolor: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 2,
            height: "100%",
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "nowrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
              <NotificationsActiveRounded
                sx={{ fontSize: 20, color: BRAND.main, flexShrink: 0 }}
              />
              <Typography
                sx={{
                  fontSize: { xs: "0.95rem", xl: "1rem" },
                  fontWeight: 800,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Hoạt động mới nhất
              </Typography>
            </Box>
            <Chip
              label="Hôm nay"
              size="small"
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                bgcolor: "rgba(139, 19, 19, 0.08)",
                color: BRAND.main,
                border: "1px solid rgba(139, 19, 19, 0.15)",
                borderRadius: "6px",
                height: 24,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            />
          </Stack>

          <Stack spacing={1.5} sx={{ flex: 1, justifyContent: "space-between" }}>
            {notiDisplayList.slice(0, 3).map((noti: any) => {
              const cfg = getNotificationConfig(noti);
              const Icon = cfg.icon;

              return (
                <Stack
                  key={noti.id || noti.tieuDe}
                  direction="row"
                  spacing={1.25}
                  sx={{
                    alignItems: "center",
                    p: 1.25,
                    borderRadius: "14px",
                    bgcolor: noti.daDoc ? "#FAFAFA" : "#FAF8F6",
                    border: `1px solid ${noti.daDoc ? "#F1F5F9" : cfg.borderColor}`,
                    minHeight: 68,
                    flexWrap: "nowrap",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      bgcolor: cfg.iconBg,
                      color: cfg.iconColor,
                      border: `1px solid ${cfg.borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        color: "#0F172A",
                        lineHeight: 1.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {noti.tieuDe}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: "0.74rem",
                        color: "#64748B",
                        lineHeight: 1.3,
                        mt: 0.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {noti.noiDung}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: "center", mt: 0.35, color: "#94A3B8" }}
                    >
                      <AccessTimeRounded sx={{ fontSize: 11, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {thoiGianRelative(noti.thoiGianTao || noti.ngayTao)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
