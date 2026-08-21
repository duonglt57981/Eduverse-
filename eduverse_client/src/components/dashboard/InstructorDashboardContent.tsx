/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { COLORS, CSSVAR, STATUS } from "@/src/theme/tokens";

import { useEffect, useState } from "react";
import { apiService } from "@/src/services/index";
import { thongBaoService } from "@/src/services/ThongBaoService";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getSoDu, getNganHangs } from "@/src/store/rutTien/RutTienSlice";

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
} from "@mui/icons-material";

const loaiIconMap: Record<
  string,
  { icon: any; iconBg: string; iconColor: string }
> = {
  YeuCauRutTien: {
    icon: PaymentRounded,
    iconBg: "rgba(245,158,11,0.08)",
    iconColor: STATUS.warning,
  },
  guiyeucauruttien: {
    icon: PaymentRounded,
    iconBg: "rgba(245,158,11,0.08)",
    iconColor: STATUS.warning,
  },
  DoanhThu: {
    icon: AttachMoneyRounded,
    iconBg: "rgba(21,128,61,0.08)",
    iconColor: "#15803D",
  },
  doanhthu: {
    icon: AttachMoneyRounded,
    iconBg: "rgba(21,128,61,0.08)",
    iconColor: "#15803D",
  },
  RutTienThanhCong: {
    icon: AccountBalanceRounded,
    iconBg: "rgba(21,128,61,0.08)",
    iconColor: "#15803D",
  },
  ruttienthanhcong: {
    icon: AccountBalanceRounded,
    iconBg: "rgba(21,128,61,0.08)",
    iconColor: "#15803D",
  },
  RutTienTuChoi: {
    icon: PaymentRounded,
    iconBg: "rgba(220,38,38,0.08)",
    iconColor: STATUS.error,
  },
  ruttientuchoi: {
    icon: PaymentRounded,
    iconBg: "rgba(220,38,38,0.08)",
    iconColor: STATUS.error,
  },
  KhoaHocDaDuyet: {
    icon: CheckCircleOutlineRounded,
    iconBg: "rgba(16,185,129,0.08)",
    iconColor: STATUS.success,
  },
  khoahocdaduyet: {
    icon: CheckCircleOutlineRounded,
    iconBg: "rgba(16,185,129,0.08)",
    iconColor: STATUS.success,
  },
  HocVienDangKy: {
    icon: PersonAddRounded,
    iconBg: "rgba(37,99,235,0.08)",
    iconColor: "#2563EB",
  },
  hocviendangkykhoahoc: {
    icon: PersonAddRounded,
    iconBg: "rgba(37,99,235,0.08)",
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
  {
    id: "sample-4",
    tieuDe: "Đã gửi yêu cầu rút tiền",
    noiDung: "Yêu cầu rút 500.000đ đã được ghi nhận và đang được Admin xử lý.",
    thoiGianTao: new Date(Date.now() - 3600000 * 24).toISOString(),
    loaiThongBao: "guiyeucauruttien",
    daDoc: true,
  },
  {
    id: "sample-5",
    tieuDe: "Cập nhật doanh thu khóa học",
    noiDung:
      "Hệ thống vừa cập nhật doanh thu mới nhất từ lượt mua khóa học của bạn.",
    thoiGianTao: new Date(Date.now() - 3600000 * 48).toISOString(),
    loaiThongBao: "doanhthu",
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
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
};

// ── Bar Chart cho học viên (đếm số lượng) ──────────────────────────────────
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
    <Box sx={{ position: "relative", width: "100%", height: 220 }}>
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
            justify: "center",
            zIndex: 3,
            bgcolor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(2px)",
            borderRadius: "16px",
          }}
        >
          <PeopleAltRounded
            sx={{ fontSize: 32, color: CSSVAR.textMuted, mb: 1 }}
          />
          <Typography
            sx={{
              fontSize: 13.5,
              color: CSSVAR.textSecondary,
              fontWeight: 600,
            }}
          >
            Chưa có học viên đăng ký trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <Stack
        direction="row"
        sx={{
          alignItems: "flex-end",
          gap: { xs: 1, md: 2 },
          height: 180,
          mt: 2,
          position: "relative",
          zIndex: 2,
          px: 1,
        }}
      >
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const isHovered = hoveredIndex === i;
          const barHeight = allZero
            ? 8
            : Math.max(12, (month.value / maxVal) * 125);

          return (
            <Stack
              key={month.label}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                alignItems: "center",
                flex: 1,
                gap: 1.2,
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Tooltip khi hover */}
              {isHovered && !allZero && month.value > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 34,
                    bgcolor: CSSVAR.textPrimary,
                    color: "#FFFFFF",
                    fontSize: 11.5,
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                    animation: "fadeIn 0.15s ease",
                  }}
                >
                  {month.label}: {month.value} học viên mới
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
                      borderTop: `4px solid ${CSSVAR.textPrimary}`,
                    }}
                  />
                </Box>
              )}

              {/* Con số trên thanh */}
              {!allZero && month.value > 0 && !isHovered && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 8,
                    fontSize: 11,
                    fontWeight: 800,
                    px: 0.9,
                    py: 0.25,
                    borderRadius: "10px",
                    bgcolor: isHighlight
                      ? COLORS.primary
                      : "rgba(31, 41, 55, 0.06)",
                    color: isHighlight ? CSSVAR.paper : CSSVAR.textSecondary,
                    boxShadow: isHighlight
                      ? "0 2px 8px rgba(139,19,19,0.25)"
                      : "none",
                    lineHeight: 1,
                  }}
                >
                  {month.value}
                </Box>
              )}

              {/* Cột nền (Track) và Thanh biểu đồ */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 36,
                  height: 135,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  bgcolor: isHovered
                    ? "rgba(139,19,19,0.06)"
                    : "rgba(31, 41, 55, 0.025)",
                  borderRadius: "10px",
                  p: "3px",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: barHeight,
                    borderRadius: isHighlight ? "8px 8px 6px 6px" : "6px",
                    background: allZero
                      ? "#F3F4F6"
                      : isHighlight
                        ? `linear-gradient(180deg, #A81B1B 0%, ${COLORS.primary} 100%)`
                        : isHovered
                          ? "linear-gradient(180deg, rgba(139,19,19,0.65) 0%, rgba(139,19,19,0.4) 100%)"
                          : "linear-gradient(180deg, rgba(139,19,19,0.35) 0%, rgba(139,19,19,0.15) 100%)",
                    boxShadow:
                      !allZero && (isHighlight || isHovered)
                        ? "0 6px 16px rgba(139,19,19,0.3)"
                        : "none",
                    transform:
                      isHovered && !allZero ? "translateY(-2px)" : "none",
                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </Box>

              {/* Label Tháng */}
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: "8px",
                  bgcolor: isHighlight
                    ? "rgba(139, 19, 19, 0.08)"
                    : "transparent",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: isHighlight ? 850 : 600,
                    color: isHighlight
                      ? COLORS.primary
                      : CSSVAR.textSecondary,
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

// ── Bar Chart cho doanh thu (tiền) ─────────────────────────────────────────
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
    <Box sx={{ position: "relative", width: "100%", height: 220 }}>
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
            justify: "center",
            zIndex: 3,
            bgcolor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(2px)",
            borderRadius: "16px",
          }}
        >
          <AttachMoneyRounded
            sx={{ fontSize: 32, color: CSSVAR.textMuted, mb: 1 }}
          />
          <Typography
            sx={{
              fontSize: 13.5,
              color: CSSVAR.textSecondary,
              fontWeight: 600,
            }}
          >
            Chưa có doanh thu trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <Stack
        direction="row"
        sx={{
          alignItems: "flex-end",
          gap: { xs: 1, md: 2 },
          height: 180,
          mt: 2,
          position: "relative",
          zIndex: 2,
          px: 1,
        }}
      >
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const isHovered = hoveredIndex === i;
          const barHeight = allZero
            ? 8
            : Math.max(12, (month.value / maxVal) * 125);

          return (
            <Stack
              key={month.label}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                alignItems: "center",
                flex: 1,
                gap: 1.2,
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Tooltip khi hover */}
              {isHovered && !allZero && month.raw > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 34,
                    bgcolor: CSSVAR.textPrimary,
                    color: "#FFFFFF",
                    fontSize: 11.5,
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: "8px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                  }}
                >
                  {month.label}: {month.raw.toLocaleString("vi-VN")}đ
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
                      borderTop: `4px solid ${CSSVAR.textPrimary}`,
                    }}
                  />
                </Box>
              )}

              {/* Con số doanh thu compact trên thanh */}
              {!allZero && month.value > 0 && !isHovered && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: barHeight + 8,
                    fontSize: 10.5,
                    fontWeight: 800,
                    px: 0.8,
                    py: 0.25,
                    borderRadius: "10px",
                    bgcolor: isHighlight ? "#15803D" : "rgba(31, 41, 55, 0.06)",
                    color: isHighlight ? CSSVAR.paper : CSSVAR.textSecondary,
                    boxShadow: isHighlight
                      ? "0 2px 8px rgba(21,128,61,0.25)"
                      : "none",
                    lineHeight: 1,
                  }}
                >
                  {formatTienCompact(month.raw)}
                </Box>
              )}

              {/* Cột nền (Track) và Thanh biểu đồ */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 36,
                  height: 135,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  bgcolor: isHovered
                    ? "rgba(16,185,129,0.06)"
                    : "rgba(31, 41, 55, 0.025)",
                  borderRadius: "10px",
                  p: "3px",
                  transition: "background-color 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: barHeight,
                    borderRadius: isHighlight ? "8px 8px 6px 6px" : "6px",
                    background: allZero
                      ? "#F3F4F6"
                      : isHighlight
                        ? `linear-gradient(180deg, ${STATUS.success} 0%, #047857 100%)`
                        : isHovered
                          ? "linear-gradient(180deg, rgba(16,185,129,0.7) 0%, rgba(5,150,105,0.45) 100%)"
                          : "linear-gradient(180deg, rgba(16,185,129,0.4) 0%, rgba(5,150,105,0.18) 100%)",
                    boxShadow:
                      !allZero && (isHighlight || isHovered)
                        ? "0 6px 16px rgba(16,185,129,0.3)"
                        : "none",
                    transform:
                      isHovered && !allZero ? "translateY(-2px)" : "none",
                    transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </Box>

              {/* Label Tháng */}
              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: "8px",
                  bgcolor: isHighlight
                    ? "rgba(16, 185, 129, 0.08)"
                    : "transparent",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: isHighlight ? 850 : 600,
                    color: isHighlight
                      ? "#15803D"
                      : CSSVAR.textSecondary,
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

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function InstructorDashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { soDu, thongBaos, nganHangs } = useSelector((s) => s.rutTien);
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
  const notiDisplayList = Array.from(notifMap.values()).slice(0, 2);

  // ── Dữ liệu biểu đồ học viên ──
  const chartMonths: { label: string; value: number }[] =
    dash?.monthlyEnrollments ?? [];
  const growthCount: number = dash?.newStudentsThisMonth ?? 0;
  const growthPct: number = dash?.studentGrowthPercent ?? 0;
  const completionData: any[] = dash?.completionByCourse ?? [];

  // ── Dữ liệu doanh thu theo tháng (70% hóa đơn) ──
  // BE trả về monthlyRevenue: [{label, totalAmount}] — tổng tiền khóa học được mua
  // FE tự tính 70%
  const rawMonthlyRevenue: { label: string; totalAmount: number }[] =
    dash?.monthlyRevenue ?? [];

  const revenueChartData = rawMonthlyRevenue.map((m) => ({
    label: m.label,
    raw: Math.round(m.totalAmount),
    value: Math.round(m.totalAmount),
  }));

  // Tổng doanh thu 70% tháng này
  const doanhThuThangNay =
    revenueChartData.length > 0
      ? revenueChartData[revenueChartData.length - 1].raw
      : 0;

  const instructorStats = [
    {
      label: "Tổng khóa học",
      value: dash ? String(dash.totalCourses ?? 0) : "0",
      icon: SchoolRounded,
      iconBg: "rgba(141,19,19,0.05)",
      iconColor: COLORS.primary,
    },
    {
      label: "Tổng học viên",
      value: dash ? (dash.totalStudents ?? 0).toLocaleString("vi-VN") : "0",
      icon: PeopleAltRounded,
      iconBg: "rgba(37,99,235,0.05)",
      iconColor: "#2563EB",
    },
    {
      label: "Doanh thu cá nhân",
      value: dash
        ? (dash.totalRevenue ?? 0).toLocaleString("vi-VN") + " đ"
        : "0 đ",
      icon: AttachMoneyRounded,
      iconBg: "rgba(21,128,61,0.05)",
      iconColor: "#15803D",
      onClick: () => router.push("/instructor/money"),
    },
    {
      label: "Số dư khả dụng",
      value: soDu ? soDu.toLocaleString("vi-VN") + " đ" : "0 đ",
      icon: AccountBalanceWalletRounded,
      iconBg: "rgba(141,19,19,0.05)",
      iconColor: COLORS.primary,
      onClick: () => router.push("/instructor/money"),
    },
  ];

  if (!dash) {
    return (
      <Stack spacing={3.5}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "24px",
            p: { xs: 3.5, md: 4.5 },
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: CSSVAR.paper,
          }}
        >
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton
            variant="rectangular"
            width={280}
            height={46}
            sx={{ borderRadius: "12px" }}
          />
        </Paper>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2,1fr)",
              md: "repeat(4,1fr)",
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
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: CSSVAR.paper,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Skeleton
                variant="rectangular"
                width={48}
                height={48}
                sx={{ borderRadius: "14px" }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Paper>
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          <Stack spacing={2.5}>
            <Skeleton
              variant="rectangular"
              height={350}
              sx={{ borderRadius: "20px" }}
            />
            <Skeleton
              variant="rectangular"
              height={350}
              sx={{ borderRadius: "20px" }}
            />
          </Stack>
          <Stack spacing={2.5}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={140}
                sx={{ borderRadius: "20px" }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3.5}>
      {/* ── 1. WELCOME CARD ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "24px",
          p: { xs: 3.5, md: 4.5 },
          border: "1px solid rgba(141,19,19,0.06)",
          bgcolor: CSSVAR.paper,
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
                color: CSSVAR.textPrimary,
                mb: 1.5,
                lineHeight: 1.2,
              }}
            >
              Chào mừng trở lại, GS. {fullName}
            </Typography>
            <Typography
              sx={{
                fontSize: 14.5,
                color: CSSVAR.textSecondary,
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
                onClick={() =>
                  router.push("/instructor/manager-courses/create/1")
                }
                sx={{
                  borderRadius: "12px",
                  bgcolor: COLORS.primary,
                  color: "#FFFFFF",
                  px: 3,
                  py: 1.25,
                  fontSize: 13.5,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#7F1D1D", boxShadow: "none" },
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
              mr: 2,
              p: 0.5,
            }}
          >
            <Avatar
              src={userAvatar || user?.anhDaiDien || undefined}
              alt={fullName}
              sx={{
                width: 146,
                height: 146,
                border: "1px solid rgba(141,19,19,0.04)",
                boxShadow: "0 8px 24px rgba(141,19,19,0.06)",
                bgcolor: "#FEF2F2",
              }}
            >
              {fullName.split(" ").pop()?.charAt(0)}
            </Avatar>
          </Box>
        </Stack>
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(141,19,19,0.03) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />
      </Paper>

      {/* ── 2. STATS CARDS ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,1fr)",
            md: "repeat(4,1fr)",
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
                p: 2.5,
                borderRadius: "20px",
                border: "1px solid rgba(141,19,19,0.06)",
                bgcolor: CSSVAR.paper,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: stat.onClick ? "pointer" : "default",
                transition: "box-shadow 200ms ease",
                "&:hover": {
                  boxShadow: "0 6px 18px rgba(141,19,19,0.06)",
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
                    color: CSSVAR.textSecondary,
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
                    color: CSSVAR.textPrimary,
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

      {/* ── 3. MAIN GRID ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2.5,
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <Stack spacing={2.5}>
          {/* Biểu đồ học viên mới theo tháng */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: CSSVAR.paper,
              height: 310,
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
                  sx={{
                    fontSize: 16.5,
                    fontWeight: 800,
                    color: CSSVAR.textPrimary,
                  }}
                >
                  Học viên đăng ký theo tháng
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: CSSVAR.textSecondary,
                    mt: 0.3,
                  }}
                >
                  Số lượt đăng ký khóa học 7 tháng gần nhất
                </Typography>
              </Box>
              <Chip
                label={`Năm ${new Date().getFullYear()}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--ev-text-secondary, rgba(31,41,55,0.6))",
                  bgcolor: "rgba(31,41,55,0.04)",
                  border: "1px solid rgba(31,41,55,0.08)",
                  borderRadius: "10px",
                }}
              />
            </Stack>
            <EnrollmentBarChart
              data={chartMonths}
              highlightIndex={chartMonths.length ? chartMonths.length - 1 : 0}
            />
          </Paper>

          {/* Biểu đồ doanh thu theo tháng (70%) */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: CSSVAR.paper,
              height: 310,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 16.5,
                    fontWeight: 800,
                    color: CSSVAR.textPrimary,
                  }}
                >
                  Doanh thu theo tháng
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: CSSVAR.textSecondary,
                    mt: 0.3,
                  }}
                >
                  Doanh thu thực nhận · 7 tháng gần nhất
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: CSSVAR.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  Tháng này
                </Typography>
                <Typography
                  sx={{ fontSize: 18, fontWeight: 900, color: "#15803D" }}
                >
                  {doanhThuThangNay.toLocaleString("vi-VN")}đ
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

        {/* ── RIGHT COLUMN ── */}
        <Stack spacing={2.5}>
          {/* Tăng trưởng học viên */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: CSSVAR.paper,
              height: 145,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: CSSVAR.textPrimary,
                mb: 1.5,
              }}
            >
              Tăng trưởng học viên
            </Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `conic-gradient(${STATUS.success} 0% ${growthPct > 0 ? growthPct : 0}%, ${CSSVAR.paperAlt} ${growthPct > 0 ? growthPct : 0}% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "inset 0 0 0 5px #fff",
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    bgcolor: CSSVAR.paper,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: growthPct >= 0 ? STATUS.success : STATUS.error,
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
                    fontSize: 26,
                    fontWeight: 900,
                    color: CSSVAR.textPrimary,
                    lineHeight: 1,
                    mb: 0.3,
                  }}
                >
                  {growthCount.toLocaleString("vi-VN")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: CSSVAR.textSecondary,
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
              p: 2.5,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: CSSVAR.paper,
              height: 145,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: CSSVAR.textPrimary,
                mb: 1.5,
              }}
            >
              Tỷ lệ hoàn thành
            </Typography>
            {completionData.length === 0 ? (
              <Box sx={{ py: 1, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: CSSVAR.textSecondary,
                    fontWeight: 500,
                  }}
                >
                  Chưa có số liệu hoàn thành
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {completionData.map((item) => (
                  <Box key={item.title}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "space-between", mb: 0.5 }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: CSSVAR.textSecondary,
                          maxWidth: "80%",
                        }}
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
                        height: 7,
                        borderRadius: 4,
                        bgcolor: CSSVAR.paperAlt,
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

          {/* Thông báo & Hoạt động */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "20px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: CSSVAR.paper,
              height: 310,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: CSSVAR.textPrimary,
                mb: 1.5,
              }}
            >
              Thông báo & Hoạt động
            </Typography>
            <Stack spacing={0} sx={{ flex: 1, justifyContent: "space-around" }}>
              {notiDisplayList.length === 0 ? (
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Chưa có thông báo nào
                </Typography>
              ) : (
                notiDisplayList.map((notif, index) => {
                  const config = loaiIconMap[notif.loaiThongBao ?? ""] ?? {
                    icon: PersonAddRounded,
                    iconBg: "rgba(141,19,19,0.08)",
                    iconColor: COLORS.primary,
                  };
                  const Icon = config.icon;
                  return (
                    <Box
                      key={notif.id}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        py: 1.2,
                        borderBottom:
                          index < notiDisplayList.length - 1
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
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
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
                          sx={{ alignItems: "center", gap: 0.8 }}
                        >
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              fontWeight: !notif.daDoc ? 800 : 700,
                              color: CSSVAR.textPrimary,
                              mb: 0.2,
                            }}
                          >
                            {notif.tieuDe}
                          </Typography>
                          {!notif.daDoc && (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: COLORS.primary,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography
                          sx={{
                            fontSize: 11.5,
                            color:
                              "var(--ev-text-secondary, rgba(31,41,55,0.6))",
                            lineHeight: 1.4,
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
                            fontSize: 10.5,
                            color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                            mt: 0.3,
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
                mt: 1.5,
                borderRadius: "12px",
                borderColor: "rgba(141,19,19,0.15)",
                color: CSSVAR.textPrimary,
                fontWeight: 700,
                fontSize: 12.5,
                textTransform: "none",
                py: 1,
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
