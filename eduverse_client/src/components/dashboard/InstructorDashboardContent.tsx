/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { COLORS } from "@/src/theme/tokens";

import { useEffect, useState } from "react";
import { apiService } from "@/src/services/index";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "@/src/store/hook";
import { getSoDu, getNganHangs } from "@/src/store/rutTien/RutTienSlice";

import {
  Box, Button, Paper, Stack, Typography, Avatar, LinearProgress,
  Chip, Skeleton,
} from "@mui/material";
import {
  AddRounded, SchoolRounded, PeopleAltRounded, AttachMoneyRounded,
  ArrowForwardRounded, AccountBalanceWalletRounded, AccountBalanceRounded,
  PaymentRounded, PersonAddRounded,
} from "@mui/icons-material";

const loaiIconMap: Record<string, { icon: any; iconBg: string; iconColor: string }> = {
  YeuCauRutTien: { icon: PaymentRounded, iconBg: "rgba(245,158,11,0.08)", iconColor: "#F59E0B" },
  DoanhThu: { icon: AttachMoneyRounded, iconBg: "rgba(21,128,61,0.08)", iconColor: "#15803D" },
  RutTienThanhCong: { icon: AccountBalanceRounded, iconBg: "rgba(21,128,61,0.08)", iconColor: "#15803D" },
  RutTienTuChoi: { icon: PaymentRounded, iconBg: "rgba(220,38,38,0.08)", iconColor: "#DC2626" },
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
  const allZero = data.length === 0 || data.every((d) => d.value === 0);
  const maxVal = data.length ? Math.max(1, ...data.map((d) => d.value)) : 1;

  return (
    <Box sx={{ position: "relative", width: "100%", height: 210 }}>
      <Stack spacing={3.5} sx={{ position: "absolute", top: 10, left: 0, right: 0, zIndex: 1, pointerEvents: "none" }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ borderBottom: "1px dashed var(--ev-divider, #ECE7E4)", width: "100%" }} />
        ))}
      </Stack>

      {allZero && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 3, bgcolor: "rgba(255,255,255,0.6)", backdropFilter: "blur(1px)", borderRadius: "12px" }}>
          <PeopleAltRounded sx={{ fontSize: 32, color: "var(--ev-text-muted, #8A7676)", mb: 1 }} />
          <Typography sx={{ fontSize: 13.5, color: "var(--ev-text-secondary, #4B5563)", fontWeight: 600 }}>
            Chưa có học viên đăng ký trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <Stack direction="row" sx={{ alignItems: "flex-end", gap: { xs: 1.5, md: 2.5 }, height: 170, mt: 3, position: "relative", zIndex: 2, px: 1 }}>
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const barHeight = allZero ? 6 : (month.value / maxVal) * 130;
          return (
            <Stack key={month.label} sx={{ alignItems: "center", flex: 1, gap: 1.5, position: "relative" }}>
              {!allZero && month.value > 0 && (
                <Typography sx={{ position: "absolute", bottom: barHeight + 24, fontSize: 11, fontWeight: 800, color: isHighlight ? COLORS.primary : "#4B5563" }}>
                  {month.value}
                </Typography>
              )}
              <Box sx={{
                width: "100%", maxWidth: 32, height: barHeight,
                borderRadius: "6px 6px 4px 4px",
                bgcolor: allZero ? "#FBFAF9" : isHighlight ? COLORS.primary : "rgba(141,19,19,0.18)",
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: !allZero && isHighlight ? "0 4px 12px rgba(139,19,19,0.25)" : "none",
                "&:hover": { bgcolor: allZero ? "#FBFAF9" : isHighlight ? "#7F1D1D" : "rgba(141,19,19,0.35)", transform: !allZero ? "scaleY(1.03)" : "none" },
              }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: isHighlight ? 800 : 600, color: isHighlight ? COLORS.primary : "#4B5563", whiteSpace: "nowrap" }}>
                {month.label}
              </Typography>
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
    <Box sx={{ position: "relative", width: "100%", height: 210 }}>
      <Stack spacing={3.5} sx={{ position: "absolute", top: 10, left: 0, right: 0, zIndex: 1, pointerEvents: "none" }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ borderBottom: "1px dashed var(--ev-divider, #ECE7E4)", width: "100%" }} />
        ))}
      </Stack>

      {allZero && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 3, bgcolor: "rgba(255,255,255,0.6)", backdropFilter: "blur(1px)", borderRadius: "12px" }}>
          <AttachMoneyRounded sx={{ fontSize: 32, color: "var(--ev-text-muted, #8A7676)", mb: 1 }} />
          <Typography sx={{ fontSize: 13.5, color: "var(--ev-text-secondary, #4B5563)", fontWeight: 600 }}>
            Chưa có doanh thu trong 7 tháng qua
          </Typography>
        </Box>
      )}

      <Stack direction="row" sx={{ alignItems: "flex-end", gap: { xs: 1.5, md: 2.5 }, height: 170, mt: 3, position: "relative", zIndex: 2, px: 1 }}>
        {data.map((month, i) => {
          const isHighlight = i === highlightIndex;
          const isHovered = hoveredIndex === i;
          const barHeight = allZero ? 6 : (month.value / maxVal) * 130;
          const barColor = allZero ? "#FBFAF9" : isHighlight ? "#15803D" : "rgba(21,128,61,0.2)";

          return (
            <Stack key={month.label} sx={{ alignItems: "center", flex: 1, gap: 1.5, position: "relative" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}>
              {/* Tooltip khi hover */}
              {isHovered && !allZero && month.raw > 0 && (
                <Box sx={{ position: "absolute", bottom: barHeight + 30, bgcolor: "var(--ev-text-primary, #1F2937)", color: "#FFFFFF", fontSize: 11, fontWeight: 800, px: 1, py: 0.5, borderRadius: "6px", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  {month.raw.toLocaleString("vi-VN")}đ
                  <Box sx={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #1F2937" }} />
                </Box>
              )}
              {/* Label trên thanh */}
              {!allZero && month.value > 0 && !isHovered && (
                <Typography sx={{ position: "absolute", bottom: barHeight + 24, fontSize: 11, fontWeight: 800, color: isHighlight ? "#15803D" : "#4B5563" }}>
                  {formatTienCompact(month.raw)}
                </Typography>
              )}
              <Box sx={{
                width: "100%", maxWidth: 32, height: barHeight,
                borderRadius: "6px 6px 4px 4px",
                bgcolor: isHovered && !allZero ? "#15803D" : barColor,
                transition: "all 0.2s ease",
                boxShadow: isHighlight && !allZero ? "0 4px 12px rgba(21,128,61,0.3)" : "none",
                cursor: "default",
              }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: isHighlight ? 800 : 600, color: isHighlight ? "#15803D" : "#4B5563", whiteSpace: "nowrap" }}>
                {month.label}
              </Typography>
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
    return () => window.removeEventListener("avatar_updated", handleAvatarUpdate);
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

  // ── Dữ liệu biểu đồ học viên ──
  const chartMonths: { label: string; value: number }[] = dash?.monthlyEnrollments ?? [];
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
    raw: Math.round(m.totalAmount * 0.7), // 70%
    value: Math.round(m.totalAmount * 0.7), // dùng để vẽ bar
  }));

  // Tổng doanh thu 70% tháng này
  const doanhThuThangNay = revenueChartData.length > 0
    ? revenueChartData[revenueChartData.length - 1].raw
    : 0;

  const instructorStats = [
    { label: "Tổng khóa học", value: dash ? String(dash.totalCourses ?? 0) : "0", icon: SchoolRounded, iconBg: "rgba(141,19,19,0.05)", iconColor: COLORS.primary },
    { label: "Tổng học viên", value: dash ? (dash.totalStudents ?? 0).toLocaleString("vi-VN") : "0", icon: PeopleAltRounded, iconBg: "rgba(37,99,235,0.05)", iconColor: "#2563EB" },
    { label: "Doanh thu cá nhân", value: dash ? (dash.totalRevenue ?? 0).toLocaleString("vi-VN") + " đ" : "0 đ", icon: AttachMoneyRounded, iconBg: "rgba(21,128,61,0.05)", iconColor: "#15803D", onClick: () => router.push("/instructor/money") },
    { label: "Số dư khả dụng", value: soDu ? soDu.toLocaleString("vi-VN") + " đ" : "0 đ", icon: AccountBalanceWalletRounded, iconBg: "rgba(141,19,19,0.05)", iconColor: COLORS.primary, onClick: () => router.push("/instructor/money") },
  ];

  if (!dash) {
    return (
      <Stack spacing={3.5}>
        <Paper elevation={0} sx={{ borderRadius: "24px", p: { xs: 3.5, md: 4.5 }, border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)" }}>
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width={280} height={46} sx={{ borderRadius: "12px" }} />
        </Paper>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 2.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Paper key={i} elevation={0} sx={{ p: 2.5, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)", display: "flex", alignItems: "center", gap: 2 }}>
              <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: "14px" }} />
              <Box sx={{ flex: 1 }}><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" /></Box>
            </Paper>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2.5 }}>
          <Stack spacing={2.5}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: "20px" }} />
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: "20px" }} />
          </Stack>
          <Stack spacing={2.5}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: "20px" }} />)}
          </Stack>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3.5}>
      {/* ── 1. WELCOME CARD ── */}
      <Paper elevation={0} sx={{ borderRadius: "24px", p: { xs: 3.5, md: 4.5 }, border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)", boxShadow: "0 10px 30px rgba(141,19,19,0.015)", position: "relative", overflow: "hidden" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} sx={{ alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          <Box sx={{ flex: 1, width: "100%" }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: COLORS.primary, textTransform: "uppercase", letterSpacing: "1px", mb: 1 }}>
              Bảng điều khiển Giảng viên
            </Typography>
            <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)", mb: 1.5, lineHeight: 1.2 }}>
              Chào mừng trở lại, GS. {fullName}
            </Typography>
            <Typography sx={{ fontSize: 14.5, color: "var(--ev-text-secondary, #4B5563)", maxWidth: 480, lineHeight: 1.6, mb: 3 }}>
              Theo dõi hiệu quả giảng dạy và quản lý hoạt động khóa học của bạn.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { xs: "stretch", sm: "center" } }}>
              <Button variant="contained" startIcon={<AddRounded />} onClick={() => router.push("/instructor/manager-courses/create/1")}
                sx={{ borderRadius: "12px", bgcolor: COLORS.primary, color: "#FFFFFF", px: 3, py: 1.25, fontSize: 13.5, fontWeight: 800, textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#7F1D1D", boxShadow: "none" } }}>
                Tạo khóa học
              </Button>
              <Button variant="outlined" startIcon={<AccountBalanceWalletRounded />} onClick={() => router.push("/instructor/money")}
                sx={{ borderRadius: "12px", borderColor: "rgba(141,19,19,0.25)", color: COLORS.primary, px: 3, py: 1.25, fontSize: 13.5, fontWeight: 800, textTransform: "none", "&:hover": { borderColor: COLORS.primary, bgcolor: "rgba(141,19,19,0.03)" } }}>
                Rút tiền
              </Button>
            </Stack>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center", flexShrink: 0, width: 160, height: 160, borderRadius: "50%", bgcolor: "#FEF2F2", border: "2px solid rgba(141,19,19,0.08)", mr: 2, p: 0.5 }}>
            <Avatar src={userAvatar || user?.anhDaiDien || undefined} alt={fullName} sx={{ width: 146, height: 146, border: "1px solid rgba(141,19,19,0.04)", boxShadow: "0 8px 24px rgba(141,19,19,0.06)", bgcolor: "#FEF2F2" }}>
              {fullName.split(" ").pop()?.charAt(0)}
            </Avatar>
          </Box>
        </Stack>
        <Box sx={{ position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(141,19,19,0.03) 0%, transparent 70%)", zIndex: 1 }} />
      </Paper>

      {/* ── 2. STATS CARDS ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" }, gap: 2.5 }}>
        {instructorStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Paper key={stat.label} elevation={0} onClick={stat.onClick}
              sx={{ p: 2.5, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)", display: "flex", alignItems: "center", gap: 2, cursor: stat.onClick ? "pointer" : "default", transition: "transform 200ms ease, box-shadow 200ms ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(141,19,19,0.06)" } }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: stat.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon sx={{ fontSize: 24, color: stat.iconColor }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--ev-text-secondary, #4B5563)", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</Typography>
                <Typography noWrap sx={{ fontSize: 20, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)", lineHeight: 1.2 }}>{stat.value}</Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* ── 3. MAIN GRID ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2.5 }}>

        {/* ── LEFT COLUMN ── */}
        <Stack spacing={2.5}>

          {/* Biểu đồ học viên mới theo tháng */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)", height: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 16.5, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)" }}>
                  Học viên đăng ký theo tháng
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "var(--ev-text-secondary, #4B5563)", mt: 0.3 }}>
                  Số lượt đăng ký khóa học 7 tháng gần nhất
                </Typography>
              </Box>
              <Chip label={`Năm ${new Date().getFullYear()}`} size="small"
                sx={{ fontWeight: 700, fontSize: 12, color: "var(--ev-text-secondary, rgba(31,41,55,0.6))", bgcolor: "rgba(31,41,55,0.04)", border: "1px solid rgba(31,41,55,0.08)", borderRadius: "10px" }} />
            </Stack>
            <EnrollmentBarChart data={chartMonths} highlightIndex={chartMonths.length ? chartMonths.length - 1 : 0} />
          </Paper>

          {/* Biểu đồ doanh thu theo tháng (70%) */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)", height: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 16.5, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)" }}>
                  Doanh thu theo tháng
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "var(--ev-text-secondary, #4B5563)", mt: 0.3 }}>
                  70% từ doanh số khóa học · 7 tháng gần nhất
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 11, color: "var(--ev-text-secondary, #4B5563)", fontWeight: 600 }}>Tháng này</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#15803D" }}>
                  {doanhThuThangNay.toLocaleString("vi-VN")}đ
                </Typography>
              </Box>
            </Stack>
            <RevenueBarChart data={revenueChartData} highlightIndex={revenueChartData.length ? revenueChartData.length - 1 : 0} />
          </Paper>
        </Stack>

        {/* ── RIGHT COLUMN ── */}
        <Stack spacing={2.5}>

          {/* Tăng trưởng học viên */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)" }}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)", mb: 2 }}>Tăng trưởng học viên</Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2.5 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(#10B981 0% ${growthPct > 0 ? growthPct : 0}%, #FBFAF9 ${growthPct > 0 ? growthPct : 0}% 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "inset 0 0 0 6px #fff" }}>
                <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "var(--ev-paper, #FFFFFF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: growthPct >= 0 ? "#10B981" : "#DC2626" }}>
                    {growthPct >= 0 ? "+" : ""}{growthPct}%
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 30, fontWeight: 900, color: "var(--ev-text-primary, #1F2937)", lineHeight: 1, mb: 0.5 }}>
                  {growthCount.toLocaleString("vi-VN")}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "var(--ev-text-secondary, #4B5563)", fontWeight: 600 }}>Đăng ký mới tháng này</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Tỷ lệ hoàn thành */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)" }}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)", mb: 2 }}>Tỷ lệ hoàn thành</Typography>
            {completionData.length === 0 ? (
              <Box sx={{ py: 2.5, textAlign: "center" }}>
                <Typography sx={{ fontSize: 12.5, color: "var(--ev-text-secondary, #4B5563)", fontWeight: 500 }}>Chưa có số liệu hoàn thành</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {completionData.map((item) => (
                  <Box key={item.title}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.8 }}>
                      <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700, color: "var(--ev-text-secondary, #4B5563)", maxWidth: "80%" }}>{item.title}</Typography>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: COLORS.primary }}>{item.rate}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={item.rate} sx={{ height: 8, borderRadius: 4, bgcolor: "var(--ev-paper-alt, #FBFAF9)", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: COLORS.primary } }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Công việc cần xử lý */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)", mb: 2 }}>Công việc cần xử lý</Typography>
            <Stack spacing={1.5}>
              {nganHangs.length === 0 ? (
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#D97706" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>Chưa liên kết tài khoản ngân hàng</Typography>
                  </Stack>
                  <Button size="small" onClick={() => router.push("/instructor/bank")} sx={{ textTransform: "none", fontSize: 12, fontWeight: 850, color: "#D97706", p: 0, minWidth: 0 }}>Thiết lập</Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1.5, borderRadius: "12px", bgcolor: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#059669" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 750, color: "#065F46" }}>Tài khoản ngân hàng đã hoạt động</Typography>
                </Stack>
              )}
              {dash && (dash.totalCourses ?? 0) === 0 ? (
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#D97706" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>Chưa có khóa học nào được tạo</Typography>
                  </Stack>
                  <Button size="small" onClick={() => router.push("/instructor/manager-courses")} sx={{ textTransform: "none", fontSize: 12, fontWeight: 850, color: "#D97706", p: 0, minWidth: 0 }}>Tạo ngay</Button>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 1.5, borderRadius: "12px", bgcolor: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#059669" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 750, color: "#065F46" }}>Đã tạo khóa học trên hệ thống</Typography>
                </Stack>
              )}
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: "12px", bgcolor: "var(--ev-paper-alt, #F7F5F2)", border: "1px solid var(--ev-divider, #ECE7E4)" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4B5563" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "var(--ev-text-secondary, #4B5563)" }}>Cập nhật hồ sơ giảng viên</Typography>
                </Stack>
                <Button size="small" onClick={() => router.push("/settings")} sx={{ textTransform: "none", fontSize: 12, fontWeight: 850, color: "var(--ev-text-secondary, #4B5563)", p: 0, minWidth: 0 }}>Cập nhật</Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Thông báo & Hoạt động */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: "20px", border: "1px solid rgba(141,19,19,0.06)", bgcolor: "var(--ev-paper, #FFFFFF)", display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "var(--ev-text-primary, #1F2937)", mb: 2.5 }}>Thông báo & Hoạt động</Typography>
            <Stack spacing={0} sx={{ flex: 1 }}>
              {thongBaos.length === 0 ? (
                <Typography sx={{ fontSize: 13, color: "var(--ev-text-muted, rgba(31,41,55,0.5))", textAlign: "center", py: 4 }}>Chưa có thông báo nào</Typography>
              ) : (
                thongBaos.slice(0, 4).map((notif, index) => {
                  const config = loaiIconMap[notif.loaiThongBao ?? ""] ?? { icon: PersonAddRounded, iconBg: "rgba(141,19,19,0.08)", iconColor: COLORS.primary };
                  const Icon = config.icon;
                  return (
                    <Box key={notif.id} sx={{ display: "flex", gap: 2, py: 2, borderBottom: index < Math.min(thongBaos.length, 4) - 1 ? "1px solid rgba(0,0,0,0.05)" : "none", bgcolor: !notif.daDoc ? "rgba(141,19,19,0.02)" : "transparent", borderRadius: 1 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: config.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 20, color: config.iconColor }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" sx={{ alignItems: "center", gap: 0.8 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: !notif.daDoc ? 800 : 700, color: "var(--ev-text-primary, #1F2937)", mb: 0.3 }}>{notif.tieuDe}</Typography>
                          {!notif.daDoc && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: COLORS.primary, flexShrink: 0 }} />}
                        </Stack>
                        <Typography sx={{ fontSize: 12, color: "var(--ev-text-secondary, rgba(31,41,55,0.6))", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {notif.noiDung}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "var(--ev-text-muted, rgba(31,41,55,0.4))", mt: 0.5 }}>{thoiGianRelative(notif.thoiGianTao)}</Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Stack>
            <Button variant="outlined" fullWidth onClick={() => router.push("/instructor/thong-bao")}
              sx={{ mt: 2.5, borderRadius: "12px", borderColor: "rgba(141,19,19,0.15)", color: "var(--ev-text-primary, #1F2937)", fontWeight: 700, fontSize: 13, textTransform: "none", py: 1.2, "&:hover": { borderColor: COLORS.primary, bgcolor: "rgba(141,19,19,0.03)" } }}>
              Xem tất cả thông báo
            </Button>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}
