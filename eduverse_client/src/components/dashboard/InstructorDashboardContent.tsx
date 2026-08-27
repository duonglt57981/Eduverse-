/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getSoDu, getNganHangs } from "@/src/store/rutTien/RutTienSlice";
import { apiService } from "@/src/services/index";
import { thongBaoService } from "@/src/services/ThongBaoService";
import { BRAND, NEUTRAL, STATUS } from "@/src/theme/tokens";

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  Skeleton,
} from "@mui/material";
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
  AutoAwesomeRounded,
  NotificationsNoneRounded,
} from "@mui/icons-material";

// Notification Icon Mapping đồng bộ với design token EduVerse
const loaiIconMap: Record<
  string,
  { icon: any; iconBg: string; iconColor: string }
> = {
  YeuCauRutTien: {
    icon: PaymentRounded,
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#B45309",
  },
  guiyeucauruttien: {
    icon: PaymentRounded,
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#B45309",
  },
  DoanhThu: {
    icon: AttachMoneyRounded,
    iconBg: "rgba(22, 163, 74, 0.12)",
    iconColor: "#15803D",
  },
  doanhthu: {
    icon: AttachMoneyRounded,
    iconBg: "rgba(22, 163, 74, 0.12)",
    iconColor: "#15803D",
  },
  RutTienThanhCong: {
    icon: AccountBalanceRounded,
    iconBg: "rgba(22, 163, 74, 0.12)",
    iconColor: "#15803D",
  },
  ruttienthanhcong: {
    icon: AccountBalanceRounded,
    iconBg: "rgba(22, 163, 74, 0.12)",
    iconColor: "#15803D",
  },
  RutTienTuChoi: {
    icon: PaymentRounded,
    iconBg: "rgba(220, 38, 38, 0.12)",
    iconColor: STATUS.error,
  },
  ruttientuchoi: {
    icon: PaymentRounded,
    iconBg: "rgba(220, 38, 38, 0.12)",
    iconColor: STATUS.error,
  },
  KhoaHocDaDuyet: {
    icon: CheckCircleOutlineRounded,
    iconBg: "rgba(22, 163, 74, 0.12)",
    iconColor: "#15803D",
  },
  khoahocdaduyet: {
    icon: CheckCircleOutlineRounded,
    iconBg: "rgba(22, 163, 74, 0.12)",
    iconColor: "#15803D",
  },
  HocVienDangKy: {
    icon: PersonAddRounded,
    iconBg: "rgba(37, 99, 235, 0.12)",
    iconColor: "#2563EB",
  },
  hocviendangkykhoahoc: {
    icon: PersonAddRounded,
    iconBg: "rgba(37, 99, 235, 0.12)",
    iconColor: "#2563EB",
  },
};

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

// ── BIỂU ĐỒ HỌC VIÊN ĐĂNG KÝ (EnrollmentBarChart) ──────────────────────────
function EnrollmentBarChart({
  data,
  highlightIndex,
}: {
  data: { label: string; value: number }[];
  highlightIndex: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const allZero = data.length === 0 || data.every((d) => d.value === 0);
  const maxVal = data.length ? Math.max(1, ...data.map((d) => d.value)) : 1;

  return (
    <Box sx={{ position: "relative", width: "100%", height: 210 }}>
      {allZero && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bottom: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(2px)",
            borderRadius: "16px",
          }}
        >
          <PeopleAltRounded sx={{ fontSize: 32, color: "#94A3B8", mb: 1 }} />
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>
            Chưa có học viên đăng ký trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <Stack
        direction="row"
        sx={{
          alignItems: "flex-end",
          gap: { xs: 1, md: 1.5 },
          height: 175,
          position: "relative",
          zIndex: 2,
          px: 0.5,
        }}
      >
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const isHovered = hoveredIndex === i;
          const barHeight = allZero ? 8 : Math.max(10, (month.value / maxVal) * 115);

          return (
            <Stack
              key={month.label}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                alignItems: "center",
                flex: 1,
                gap: 1,
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Tooltip khi hover */}
              {isHovered && !allZero && month.value > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 38,
                    bgcolor: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  {month.label}: {month.value} học viên
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid #0F172A",
                    }}
                  />
                </Box>
              )}

              {/* Con số trên thanh */}
              {!allZero && month.value > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 8,
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: "8px",
                    bgcolor: isHighlight ? BRAND.main : "#F1F5F9",
                    color: isHighlight ? "#FFFFFF" : "#475569",
                    boxShadow: isHighlight ? `0 2px 8px ${BRAND.main}40` : "none",
                    lineHeight: 1,
                  }}
                >
                  {month.value}
                </Box>
              )}

              {/* Track và Thanh biểu đồ */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 38,
                  height: 125,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  bgcolor: isHovered ? "rgba(139, 19, 19, 0.08)" : "#F8FAFC",
                  borderRadius: "12px",
                  p: "4px",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: barHeight,
                    borderRadius: isHighlight ? "8px 8px 6px 6px" : "8px",
                    background: allZero
                      ? "#E2E8F0"
                      : isHighlight
                        ? `linear-gradient(180deg, ${BRAND.dark} 0%, ${BRAND.main} 100%)`
                        : isHovered
                          ? "linear-gradient(180deg, rgba(139, 19, 19, 0.7) 0%, rgba(139, 19, 19, 0.45) 100%)"
                          : "linear-gradient(180deg, rgba(139, 19, 19, 0.35) 0%, rgba(139, 19, 19, 0.15) 100%)",
                    boxShadow:
                      !allZero && (isHighlight || isHovered)
                        ? `0 6px 16px ${BRAND.main}35`
                        : "none",
                    transform: isHovered && !allZero ? "translateY(-2px)" : "none",
                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </Box>

              {/* Label Tháng */}
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "8px",
                  bgcolor: isHighlight ? "rgba(139, 19, 19, 0.1)" : "transparent",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: isHighlight ? 800 : 600,
                    color: isHighlight ? BRAND.main : "#64748B",
                    whiteSpace: "nowrap",
                  }}
                >
                  {month.label}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

// ── BIỂU ĐỒ DOANH THU THỰC NHẬN (RevenueBarChart) ──────────────────────────
function RevenueBarChart({
  data,
  highlightIndex,
}: {
  data: { label: string; value: number; raw: number }[];
  highlightIndex: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const allZero = data.length === 0 || data.every((d) => d.value === 0);
  const maxVal = data.length ? Math.max(1, ...data.map((d) => d.value)) : 1;

  return (
    <Box sx={{ position: "relative", width: "100%", height: 210 }}>
      {allZero && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bottom: 30,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(2px)",
            borderRadius: "16px",
          }}
        >
          <AttachMoneyRounded sx={{ fontSize: 32, color: "#94A3B8", mb: 1 }} />
          <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600 }}>
            Chưa có doanh thu trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <Stack
        direction="row"
        sx={{
          alignItems: "flex-end",
          gap: { xs: 1, md: 1.5 },
          height: 175,
          position: "relative",
          zIndex: 2,
          px: 0.5,
        }}
      >
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const isHovered = hoveredIndex === i;
          const barHeight = allZero ? 8 : Math.max(10, (month.value / maxVal) * 115);

          return (
            <Stack
              key={month.label}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                alignItems: "center",
                flex: 1,
                gap: 1,
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Tooltip khi hover */}
              {isHovered && !allZero && month.raw > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 38,
                    bgcolor: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  {month.label}: {month.raw.toLocaleString("vi-VN")} đ
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "4px solid #0F172A",
                    }}
                  />
                </Box>
              )}

              {/* Con số trên thanh */}
              {!allZero && month.value > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 8,
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: "8px",
                    bgcolor: isHighlight ? "#15803D" : "#F1F5F9",
                    color: isHighlight ? "#FFFFFF" : "#475569",
                    boxShadow: isHighlight ? "0 2px 8px rgba(21, 128, 61, 0.35)" : "none",
                    lineHeight: 1,
                  }}
                >
                  {formatTienCompact(month.raw)}
                </Box>
              )}

              {/* Track và Thanh biểu đồ */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 38,
                  height: 125,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  bgcolor: isHovered ? "rgba(16, 185, 129, 0.08)" : "#F8FAFC",
                  borderRadius: "12px",
                  p: "4px",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: barHeight,
                    borderRadius: isHighlight ? "8px 8px 6px 6px" : "8px",
                    background: allZero
                      ? "#E2E8F0"
                      : isHighlight
                        ? "linear-gradient(180deg, #10B981 0%, #047857 100%)"
                        : isHovered
                          ? "linear-gradient(180deg, rgba(16, 185, 129, 0.7) 0%, rgba(5, 150, 105, 0.45) 100%)"
                          : "linear-gradient(180deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.15) 100%)",
                    boxShadow:
                      !allZero && (isHighlight || isHovered)
                        ? "0 6px 16px rgba(16, 185, 129, 0.3)"
                        : "none",
                    transform: isHovered && !allZero ? "translateY(-2px)" : "none",
                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </Box>

              {/* Label Tháng */}
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "8px",
                  bgcolor: isHighlight ? "rgba(22, 163, 74, 0.1)" : "transparent",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: isHighlight ? 800 : 600,
                    color: isHighlight ? "#15803D" : "#64748B",
                    whiteSpace: "nowrap",
                  }}
                >
                  {month.label}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
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
  const notiDisplayList = Array.from(notifMap.values()).slice(0, 3);

  // Dữ liệu biểu đồ học viên & tăng trưởng
  const chartMonths: { label: string; value: number }[] =
    dash?.monthlyEnrollments ?? [];
  const growthCount: number = dash?.newStudentsThisMonth ?? 0;
  const growthPct: number = dash?.studentGrowthPercent ?? 0;
  const completionData: any[] = dash?.completionByCourse ?? [];

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
      onClick: () => router.push("/instructor/manager-courses"),
    },
    {
      label: "Tổng học viên",
      value: dash ? (dash.totalStudents ?? 0).toLocaleString("vi-VN") : "0",
      icon: PeopleAltRounded,
      gradient: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
      lightBg: "rgba(37, 99, 235, 0.08)",
      color: "#2563EB",
      sub: "Đã tham gia học",
      onClick: () => router.push("/instructor/students"),
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
      onClick: () => router.push("/instructor/money"),
    },
    {
      label: "Số dư khả dụng",
      value: soDu ? soDu.toLocaleString("vi-VN") + " đ" : "0 đ",
      icon: AccountBalanceWalletRounded,
      gradient: `linear-gradient(135deg, #8B1313 0%, #6D0F0F 100%)`,
      lightBg: "rgba(139, 19, 19, 0.08)",
      color: BRAND.main,
      sub: "Sẵn sàng rút",
      onClick: () => router.push("/instructor/money"),
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
            {/* Top Tag */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.5,
                  py: 0.4,
                  borderRadius: "999px",
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: BRAND.main,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <AutoAwesomeRounded sx={{ fontSize: 14 }} />
                <span>Bảng điều khiển Giảng viên</span>
              </Box>
              <Chip
                label="Đang hoạt động"
                size="small"
                sx={{
                  bgcolor: "#DCFCE7",
                  color: "#15803D",
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  border: "1px solid #BBF7D0",
                  height: 22,
                }}
              />
            </Box>

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
              Chào mừng trở lại, GS. {fullName} 👋
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
            <Avatar
              src={userAvatar || user?.anhDaiDien || undefined}
              alt={fullName}
              sx={{
                width: 128,
                height: 128,
                border: "3px solid #FFFFFF",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                bgcolor: BRAND.main,
                color: "#FFFFFF",
                fontSize: "2.2rem",
                fontWeight: 900,
              }}
            >
              {fullName.split(" ").pop()?.charAt(0)?.toUpperCase()}
            </Avatar>
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
              onClick={stat.onClick}
              sx={{
                p: 2.75,
                borderRadius: "24px",
                border: `1px solid ${NEUTRAL.divider}`,
                bgcolor: "#FFFFFF",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 14px 30px -8px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0,0,0,0.03)",
                  borderColor: stat.color,
                  "& .stat-arrow": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
              }}
            >
              {/* Background ambient tint */}
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: stat.lightBg,
                  filter: "blur(20px)",
                  pointerEvents: "none",
                }}
              />

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
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

                <Box
                  className="stat-arrow"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    opacity: 0.4,
                    transform: "translateX(-4px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ArrowForwardRounded sx={{ fontSize: 16 }} />
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

      {/* ── 3. MAIN ANALYTICS GRID ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* ── LEFT COLUMN: Charts ── */}
        <Stack spacing={3}>
          {/* Biểu đồ học viên theo tháng */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "24px",
              border: `1px solid ${NEUTRAL.divider}`,
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
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
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Học viên đăng ký theo tháng
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    color: "#64748B",
                    mt: 0.25,
                  }}
                >
                  Số lượt học viên đăng ký khóa học 7 tháng gần nhất
                </Typography>
              </Box>

              <Chip
                label={`Năm ${new Date().getFullYear()}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  color: "#475569",
                  bgcolor: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  borderRadius: "10px",
                  height: 26,
                }}
              />
            </Stack>

            <EnrollmentBarChart
              data={chartMonths}
              highlightIndex={chartMonths.length ? chartMonths.length - 1 : 0}
            />
          </Paper>

          {/* Biểu đồ doanh thu theo tháng */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: "24px",
              border: `1px solid ${NEUTRAL.divider}`,
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#0F172A",
                  }}
                >
                  Doanh thu theo tháng
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    color: "#64748B",
                    mt: 0.25,
                  }}
                >
                  Doanh thu thực nhận từ khóa học · 7 tháng gần nhất
                </Typography>
              </Box>

              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontSize: "0.74rem",
                    color: "#64748B",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Tháng này
                </Typography>
                <Typography
                  sx={{ fontSize: "1.15rem", fontWeight: 900, color: "#15803D" }}
                >
                  {doanhThuThangNay.toLocaleString("vi-VN")} đ
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
        </Stack>

        {/* ── RIGHT COLUMN: Growth, Completion, Notifications ── */}
        <Stack spacing={3}>
          {/* Tăng trưởng học viên */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "24px",
              border: `1px solid ${NEUTRAL.divider}`,
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#0F172A",
                mb: 2,
              }}
            >
              Tăng trưởng học viên
            </Typography>

            <Stack direction="row" sx={{ alignItems: "center", gap: 2.5 }}>
              {/* Circular Radial Gauge */}
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `conic-gradient(#10B981 0% ${growthPct > 0 ? Math.min(growthPct, 100) : 0}%, #F1F5F9 ${growthPct > 0 ? Math.min(growthPct, 100) : 0}% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "inset 0 0 0 6px #FFFFFF",
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    bgcolor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 900,
                      color: growthPct >= 0 ? "#16A34A" : STATUS.error,
                    }}
                  >
                    {growthPct >= 0 ? "+" : ""}
                    {growthPct}%
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: "1.75rem",
                    fontWeight: 900,
                    color: "#0F172A",
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {growthCount.toLocaleString("vi-VN")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  Đăng ký mới tháng này
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Tỷ lệ hoàn thành */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "24px",
              border: `1px solid ${NEUTRAL.divider}`,
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "#0F172A",
                mb: 2,
              }}
            >
              Tỷ lệ hoàn thành
            </Typography>

            {completionData.length === 0 ? (
              <Box sx={{ py: 1.5, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "#94A3B8",
                    fontWeight: 500,
                  }}
                >
                  Chưa có số liệu hoàn thành
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {completionData.map((item) => (
                  <Box key={item.title}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between", mb: 0.75 }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          color: "#1E293B",
                          maxWidth: "75%",
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.84rem",
                          fontWeight: 800,
                          color: BRAND.main,
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
                          background: `linear-gradient(90deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Thông báo & Hoạt động */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "24px",
              border: `1px solid ${NEUTRAL.divider}`,
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "#0F172A",
                }}
              >
                Thông báo & Hoạt động
              </Typography>
              <NotificationsNoneRounded sx={{ color: "#94A3B8", fontSize: 20 }} />
            </Box>

            <Stack spacing={1.5}>
              {notiDisplayList.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: "#94A3B8",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Chưa có thông báo nào
                </Typography>
              ) : (
                notiDisplayList.map((notif) => {
                  const config = loaiIconMap[notif.loaiThongBao ?? ""] ?? {
                    icon: PersonAddRounded,
                    iconBg: "rgba(139, 19, 19, 0.08)",
                    iconColor: BRAND.main,
                  };
                  const Icon = config.icon;
                  return (
                    <Box
                      key={notif.id}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: "14px",
                        bgcolor: !notif.daDoc ? "#FEF2F2" : "#F8FAFC",
                        border: `1px solid ${!notif.daDoc ? "#FECACA" : "#F1F5F9"}`,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#F1F5F9",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "12px",
                          bgcolor: config.iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 18, color: config.iconColor }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          sx={{ alignItems: "center", gap: 0.8, justifyContent: "space-between" }}
                        >
                          <Typography
                            noWrap
                            sx={{
                              fontSize: "0.82rem",
                              fontWeight: !notif.daDoc ? 800 : 700,
                              color: "#0F172A",
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
                                bgcolor: BRAND.main,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          sx={{
                            fontSize: "0.76rem",
                            color: "#64748B",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mt: 0.25,
                          }}
                        >
                          {notif.noiDung}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#94A3B8",
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
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}
