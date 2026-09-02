/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  alpha,
  Stack,
  Tooltip as MuiTooltip,
} from "@mui/material";
import { EduAvatar } from "@/src/components/common/EduAvatar";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import ThongKeKhoaHocService, {
  ThongKeDoanhThuDto,
  ThongKeHocVienDto,
  BaiGiangEngagementDto,
  CourseEngagementDto,
} from "@/src/services/ThongKeKhoaHocService";
import LoiMoiGiangVienService, {
  LichSuThayDoiTyLeDto,
  LichSuNhanTheoDonDto,
} from "@/src/services/LoiMoiGiangVienService";
import { useQuyenCuaToi } from "@/src/hook/useQuyenCuaToi";
import { BRAND, CSSVAR, NEUTRAL } from "@/src/theme/tokens";

const FONTS = {
  display: "var(--font-heading, 'Be Vietnam Pro', sans-serif)",
  body: "var(--font-sans, 'Be Vietnam Pro', sans-serif)",
};

// ── Helper format tiền ──────────────────────────────────────────────────────
function formatTien(so: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(so);
}

function formatTienNgan(so: number) {
  if (so >= 1_000_000) return `${(so / 1_000_000).toFixed(1)}M`;
  if (so >= 1_000) return `${(so / 1_000).toFixed(0)}K`;
  return String(so);
}

const THANG_LABEL = [
  "Thg 1",
  "Thg 2",
  "Thg 3",
  "Thg 4",
  "Thg 5",
  "Thg 6",
  "Thg 7",
  "Thg 8",
  "Thg 9",
  "Thg 10",
  "Thg 11",
  "Thg 12",
];

// ── Stat card component ─────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color = BRAND.main,
  bgColor = "#FEF2F2",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: "18px",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        gap: 2,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.05)",
          borderColor: alpha(color, 0.35),
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          bgcolor: bgColor,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography
          sx={{
            fontSize: { xs: 20, sm: 22 },
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: 1.15,
            fontFamily: FONTS.display,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5,
            color: "#64748B",
            fontWeight: 600,
            mt: 0.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
        {sub && (
          <Typography
            sx={{
              fontSize: 11.5,
              color: color,
              fontWeight: 700,
              mt: 0.2,
            }}
          >
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ── Custom Tooltip cho Biểu đồ Recharts ──────────────────────────────────────
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          p: "8px 12px",
          borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          fontSize: 12,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 12, color: "#94A3B8", mb: 0.25 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: "#38BDF8" }}>
          {payload[0].name === "Doanh thu"
            ? formatTien(Number(payload[0].value || 0))
            : `${payload[0].value} học viên`}
        </Typography>
      </Box>
    );
  }
  return null;
}

// ── Component chính ─────────────────────────────────────────────────────────
export default function PerformanceContent() {
  const { idKhoaHoc, trangThai } = useCourseEdit();
  const { coQuyen, loading: loadingQuyen } = useQuyenCuaToi(idKhoaHoc);
  const [tab, setTab] = useState(0);

  // Doanh thu
  const [doanhThu, setDoanhThu] = useState<ThongKeDoanhThuDto | null>(null);
  const [loadingDT, setLoadingDT] = useState(false);

  // Học viên
  const [hocVien, setHocVien] = useState<ThongKeHocVienDto | null>(null);
  const [loadingHV, setLoadingHV] = useState(false);
  const [namChon, setNamChon] = useState<number>(new Date().getFullYear());

  // Bài giảng
  const [baiGiangList, setBaiGiangList] = useState<BaiGiangEngagementDto[]>([]);
  const [engagement, setEngagement] = useState<CourseEngagementDto | null>(null);
  const [loadingEG, setLoadingEG] = useState(false);

  const [, setError] = useState<string | null>(null);

  // Lịch sử doanh thu theo giảng viên (dialog)
  const [lichSuTarget, setLichSuTarget] = useState<{
    id: string;
    ten: string;
  } | null>(null);
  const [lichSuTyLe, setLichSuTyLe] = useState<LichSuThayDoiTyLeDto[]>([]);
  const [lichSuDonHang, setLichSuDonHang] = useState<LichSuNhanTheoDonDto[]>([]);
  const [loadingLichSu, setLoadingLichSu] = useState(false);

  const moLichSu = async (idGiangVien: string, ten: string) => {
    setLichSuTarget({ id: idGiangVien, ten });
    setLoadingLichSu(true);
    try {
      const [tyLe, donHang] = await Promise.all([
        LoiMoiGiangVienService.GetLichSuTyLe(idKhoaHoc, idGiangVien),
        LoiMoiGiangVienService.GetLichSuDonHang(idKhoaHoc, idGiangVien),
      ]);
      setLichSuTyLe(tyLe);
      setLichSuDonHang(donHang);
    } catch {
      setLichSuTyLe([]);
      setLichSuDonHang([]);
    } finally {
      setLoadingLichSu(false);
    }
  };

  const loadDoanhThu = useCallback(async () => {
    if (!idKhoaHoc) return;
    setLoadingDT(true);
    try {
      const data = await ThongKeKhoaHocService.GetDoanhThu(idKhoaHoc);
      setDoanhThu(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDT(false);
    }
  }, [idKhoaHoc]);

  const loadHocVien = useCallback(async () => {
    if (!idKhoaHoc) return;
    setLoadingHV(true);
    try {
      const data = await ThongKeKhoaHocService.GetHocVien(idKhoaHoc, namChon);
      setHocVien(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingHV(false);
    }
  }, [idKhoaHoc, namChon]);

  const loadEngagement = useCallback(async () => {
    if (!idKhoaHoc) return;
    setLoadingEG(true);
    try {
      const [dsBaiGiang, tongQuan] = await Promise.all([
        ThongKeKhoaHocService.GetBaiGiang(idKhoaHoc),
        ThongKeKhoaHocService.GetEngagement(idKhoaHoc),
      ]);
      setBaiGiangList(dsBaiGiang);
      setEngagement(tongQuan);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingEG(false);
    }
  }, [idKhoaHoc]);

  useEffect(() => {
    if (tab === 2) loadEngagement();
  }, [tab, loadEngagement]);

  useEffect(() => {
    loadDoanhThu();
  }, [loadDoanhThu]);

  useEffect(() => {
    if (tab === 1) loadHocVien();
  }, [tab, loadHocVien]);

  // Chart data doanh thu — fill đủ 12 tháng
  const chartDataDT = THANG_LABEL.map((nhan, i) => {
    const found = doanhThu?.doanhThuTheoThang?.find(
      (d) => d.nam === namChon && d.thang === i + 1,
    );
    return {
      thang: nhan,
      doanhThu: found?.doanhThu ?? 0,
      soDon: found?.soDon ?? 0,
    };
  });

  // Chart data học viên — fill đủ 12 tháng
  const chartDataHV = THANG_LABEL.map((nhan, i) => {
    const found = hocVien?.hocVienTheoThang?.find(
      (d) => d.nam === namChon && d.thang === i + 1,
    );
    return { thang: nhan, soLuong: found?.soLuong ?? 0 };
  });

  const namOptions = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  if (loadingQuyen) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: BRAND.main }} />
      </Box>
    );
  }

  if (trangThai !== "DaDuyet") {
    return (
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          py: 8,
          px: 3,
          borderRadius: "20px",
          border: "1px dashed #CBD5E1",
          bgcolor: "#FFFFFF",
          maxWidth: 600,
          mx: "auto",
          mt: 4,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "#FEF2F2",
            color: BRAND.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <SchoolRoundedIcon sx={{ fontSize: 32 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#0F172A", mb: 1 }}>
          Chưa khả dụng thống kê
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#64748B" }}>
          Tính năng thống kê và phân tích doanh thu sẽ được kích hoạt ngay sau khi khóa học được phê duyệt và xuất bản.
        </Typography>
      </Paper>
    );
  }

  if (!coQuyen("performance")) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ fontWeight: 700, color: "#64748B" }}>
          Bạn không có quyền truy cập mục Thống kê.
        </Typography>
      </Box>
    );
  }

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 1200, mx: "auto", pb: 8 }}>
        {/* Header Title */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: 22, sm: 26 },
              color: "#0F172A",
              fontFamily: FONTS.display,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Thống kê khóa học
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#64748B", fontWeight: 500, mt: 0.5 }}>
            Theo dõi doanh thu, số lượng học viên và hiệu quả bài giảng chi tiết
          </Typography>
        </Box>

        {/* Floating Pill Tabs */}
        <Paper
          elevation={0}
          sx={{
            display: "inline-flex",
            p: 0.6,
            borderRadius: "14px",
            bgcolor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            mb: 3.5,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: 0,
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": {
                minHeight: 38,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13.5,
                borderRadius: "10px",
                px: 2.25,
                py: 0.8,
                color: "#64748B",
                transition: "all 0.15s ease",
                "&.Mui-selected": {
                  bgcolor: "#FFFFFF",
                  color: `${BRAND.main} !important`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  fontWeight: 800,
                },
                "&:hover:not(.Mui-selected)": {
                  color: "#0F172A",
                  bgcolor: alpha("#FFFFFF", 0.5),
                },
              },
            }}
          >
            <Tab
              icon={<MonetizationOnRoundedIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Doanh thu"
            />
            <Tab
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Học viên"
            />
            <Tab
              icon={<AssessmentRoundedIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Hiệu quả bài giảng"
            />
          </Tabs>
        </Paper>

        {/* ── TAB 0: DOANH THU ── */}
        {tab === 0 &&
          (loadingDT ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: BRAND.main }} />
            </Box>
          ) : doanhThu == null ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "16px",
                bgcolor: "#FEF2F2",
                border: "1px solid #FECACA",
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#DC2626", fontWeight: 700 }}>
                Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {/* 4 Stat Cards */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                  mb: 3.5,
                }}
              >
                <StatCard
                  icon={<MonetizationOnRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Tổng doanh thu"
                  value={formatTienNgan(doanhThu.tongDoanhThu)}
                  sub={formatTien(doanhThu.tongDoanhThu)}
                  color={BRAND.main}
                  bgColor="#FEF2F2"
                />
                <StatCard
                  icon={<TrendingUpRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Phần giảng viên (70%)"
                  value={formatTienNgan(doanhThu.phanGiangVien)}
                  sub={formatTien(doanhThu.phanGiangVien)}
                  color="#16A34A"
                  bgColor="#F0FDF4"
                />
                <StatCard
                  icon={<ShoppingCartRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Tổng đơn hàng"
                  value={doanhThu.tongDonHang.toLocaleString("vi-VN")}
                  color="#475569"
                  bgColor="#F8FAFC"
                />
                <StatCard
                  icon={<PeopleAltRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Tổng học viên"
                  value={doanhThu.tongHocVien.toLocaleString("vi-VN")}
                  color="#D97706"
                  bgColor="#FFFBEB"
                />
              </Box>

              {/* Chart Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                  mb: 4,
                }}
              >
                {/* Chart Header Toolbar */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#0F172A",
                        fontFamily: FONTS.display,
                      }}
                    >
                      Biểu đồ doanh thu theo tháng
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                      Số liệu doanh thu thực tế được ghi nhận trong năm {namChon}
                    </Typography>
                  </Box>

                  <FormControl size="small">
                    <Select
                      value={namChon}
                      onChange={(e) => setNamChon(Number(e.target.value))}
                      startAdornment={
                        <CalendarTodayRoundedIcon
                          sx={{ fontSize: 16, color: "#64748B", mr: 1, ml: 0.5 }}
                        />
                      }
                      sx={{
                        height: 38,
                        fontSize: 13.5,
                        fontWeight: 700,
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E2E8F0",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(BRAND.main, 0.4),
                        },
                      }}
                    >
                      {namOptions.map((n) => (
                        <MenuItem
                          key={n}
                          value={n}
                          sx={{ fontSize: 13.5, fontWeight: 600 }}
                        >
                          Năm {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Chart Body */}
                {doanhThu.doanhThuTheoThang.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 7,
                      bgcolor: "#F8FAFC",
                      borderRadius: "14px",
                      border: "1px dashed #CBD5E1",
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "#FEF2F2",
                        color: BRAND.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 1.5,
                      }}
                    >
                      <MonetizationOnRoundedIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#0F172A", mb: 0.5 }}>
                      Chưa có dữ liệu doanh thu
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                      Chưa có đơn hàng nào được ghi nhận cho khóa học này trong năm {namChon}.
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartDataDT}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      style={{ outline: "none" }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis
                        dataKey="thang"
                        tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
                        axisLine={{ stroke: "#E2E8F0" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, "auto"]}
                        allowDecimals={false}
                        tickFormatter={formatTienNgan}
                        tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Bar
                        dataKey="doanhThu"
                        name="Doanh thu"
                        fill={BRAND.main}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>

              {/* Revenue Split Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: "#0F172A",
                    fontFamily: FONTS.display,
                    mb: 2,
                  }}
                >
                  Phân chia doanh thu giảng viên
                </Typography>

                {/* 2 Split Overview Banners */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      border: "1px solid #BBF7D0",
                      background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: "#15803D",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          mb: 0.5,
                        }}
                      >
                        Phần giảng viên (70%)
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 24,
                          fontWeight: 900,
                          color: "#166534",
                          fontFamily: FONTS.display,
                        }}
                      >
                        {formatTien(doanhThu.phanGiangVien)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "rgba(22, 163, 74, 0.15)",
                        color: "#15803D",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PercentRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      border: "1px solid #E2E8F0",
                      background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: "#475569",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          mb: 0.5,
                        }}
                      >
                        Phần hệ thống (30%)
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 24,
                          fontWeight: 900,
                          color: "#1E293B",
                          fontFamily: FONTS.display,
                        }}
                      >
                        {formatTien(doanhThu.phanHeTong)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "rgba(100, 116, 139, 0.15)",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AccountBalanceWalletRoundedIcon sx={{ fontSize: 22 }} />
                    </Box>
                  </Paper>
                </Box>

                {/* Table of Instructors */}
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#475569",
                            py: 1.75,
                          }}
                        >
                          Giảng viên
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#475569",
                            py: 1.75,
                          }}
                        >
                          Tỷ lệ chia
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#475569",
                            py: 1.75,
                          }}
                        >
                          Thực nhận
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
                            color: "#475569",
                            py: 1.75,
                          }}
                        >
                          Lịch sử
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doanhThu.phanChiaGiangVien.map((gv) => (
                        <TableRow
                          key={gv.idGiangVien}
                          sx={{
                            "&:hover": { bgcolor: "#F8FAFC" },
                            transition: "background 0.15s ease",
                          }}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <EduAvatar
                                src={gv.anhDaiDien}
                                name={gv.hoTen}
                                size={38}
                              />
                              <Box>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#0F172A",
                                  }}
                                >
                                  {gv.hoTen || "Chưa đặt tên"}
                                </Typography>
                                {gv.laChuSoHuu && (
                                  <Chip
                                    label="Chủ sở hữu"
                                    size="small"
                                    sx={{
                                      fontSize: 10.5,
                                      height: 20,
                                      bgcolor: "#FEF2F2",
                                      color: BRAND.main,
                                      fontWeight: 800,
                                      borderRadius: "6px",
                                      mt: 0.25,
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "inline-flex",
                                px: 1.2,
                                py: 0.35,
                                borderRadius: "8px",
                                bgcolor: "#F0FDF4",
                                color: "#16A34A",
                                border: "1px solid #BBF7D0",
                                fontWeight: 800,
                                fontSize: 13,
                              }}
                            >
                              {gv.tyLeChiaDoanhThu}%
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: "#16A34A",
                              }}
                            >
                              {formatTien(gv.soTienNhan)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <MuiTooltip title="Xem lịch sử phân chia">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  moLichSu(gv.idGiangVien, gv.hoTen || "Giảng viên")
                                }
                                sx={{
                                  color: "#64748B",
                                  bgcolor: "#F8FAFC",
                                  border: "1px solid #E2E8F0",
                                  borderRadius: "10px",
                                  p: 0.8,
                                  transition: "all 0.15s ease",
                                  "&:hover": {
                                    color: BRAND.main,
                                    bgcolor: "#FEF2F2",
                                    borderColor: alpha(BRAND.main, 0.3),
                                  },
                                }}
                              >
                                <HistoryRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </MuiTooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Box>
          ))}

        {/* ── TAB 1: HỌC VIÊN ── */}
        {tab === 1 &&
          (loadingHV ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: BRAND.main }} />
            </Box>
          ) : !hocVien ? null : (
            <Box>
              {/* Stat Cards */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 2,
                  mb: 3.5,
                }}
              >
                <StatCard
                  icon={<PeopleAltRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Tổng học viên"
                  value={hocVien.tongHocVien.toLocaleString("vi-VN")}
                  color={BRAND.main}
                  bgColor="#FEF2F2"
                />
                <StatCard
                  icon={<TrendingUpRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Mới 30 ngày qua"
                  value={hocVien.hocVienMoi30Ngay.toLocaleString("vi-VN")}
                  color="#2563EB"
                  bgColor="#EFF6FF"
                />
                <StatCard
                  icon={<CheckCircleRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Đang tích cực học"
                  value={hocVien.dangHoc.toLocaleString("vi-VN")}
                  color="#16A34A"
                  bgColor="#F0FDF4"
                />
                <StatCard
                  icon={<SchoolRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Hết hạn truy cập"
                  value={hocVien.hetHan.toLocaleString("vi-VN")}
                  color="#D97706"
                  bgColor="#FFFBEB"
                />
              </Box>

              {/* Chart Line Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: "20px",
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: "#0F172A",
                        fontFamily: FONTS.display,
                      }}
                    >
                      Học viên đăng ký theo tháng
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                      Số lượng người đăng ký mới trong năm {namChon}
                    </Typography>
                  </Box>

                  <FormControl size="small">
                    <Select
                      value={namChon}
                      onChange={(e) => setNamChon(Number(e.target.value))}
                      startAdornment={
                        <CalendarTodayRoundedIcon
                          sx={{ fontSize: 16, color: "#64748B", mr: 1, ml: 0.5 }}
                        />
                      }
                      sx={{
                        height: 38,
                        fontSize: 13.5,
                        fontWeight: 700,
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E2E8F0",
                        },
                      }}
                    >
                      {namOptions.map((n) => (
                        <MenuItem
                          key={n}
                          value={n}
                          sx={{ fontSize: 13.5, fontWeight: 600 }}
                        >
                          Năm {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={chartDataHV}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    style={{ outline: "none" }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="thang"
                      tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="soLuong"
                      name="Học viên"
                      stroke={BRAND.main}
                      strokeWidth={3}
                      dot={{ fill: "#FFFFFF", stroke: BRAND.main, strokeWidth: 2.5, r: 4 }}
                      activeDot={{ r: 6, fill: BRAND.main }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              {/* Students Table */}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: "#0F172A",
                    fontFamily: FONTS.display,
                    mb: 2,
                  }}
                >
                  Danh sách học viên đăng ký gần đây
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Học viên
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Ngày đăng ký
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Trạng thái
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Tiến độ
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Giá mua
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hocVien.danhSachHocVien.map((hv) => (
                        <TableRow
                          key={hv.idHocVien}
                          sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <EduAvatar
                                src={hv.anhDaiDien}
                                name={hv.hoTen}
                                size={36}
                              />
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: "#0F172A" }}>
                                  {hv.hoTen || "Học viên ẩn danh"}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                                  {hv.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
                              {hv.thoiGianDK
                                ? new Date(hv.thoiGianDK).toLocaleDateString("vi-VN")
                                : "—"}
                            </Typography>
                            {hv.ngayHetHan && (
                              <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>
                                Hết hạn: {new Date(hv.ngayHetHan).toLocaleDateString("vi-VN")}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                hv.isDangKy &&
                                hv.ngayHetHan &&
                                new Date(hv.ngayHetHan) >= new Date()
                                  ? "Đang học"
                                  : hv.ngayHetHan &&
                                      new Date(hv.ngayHetHan) < new Date()
                                    ? "Hết hạn"
                                    : "Không hoạt động"
                              }
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: 11.5,
                                borderRadius: "6px",
                                height: 22,
                                bgcolor:
                                  hv.isDangKy &&
                                  hv.ngayHetHan &&
                                  new Date(hv.ngayHetHan) >= new Date()
                                    ? "#F0FDF4"
                                    : "#FEF3C7",
                                color:
                                  hv.isDangKy &&
                                  hv.ngayHetHan &&
                                  new Date(hv.ngayHetHan) >= new Date()
                                    ? "#16A34A"
                                    : "#D97706",
                                border: `1px solid ${
                                  hv.isDangKy &&
                                  hv.ngayHetHan &&
                                  new Date(hv.ngayHetHan) >= new Date()
                                    ? "#DCFCE7"
                                    : "#FDE68A"
                                }`,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 80,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: "#F1F5F9",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${Math.min(hv.phanTramHoanThanh ?? 0, 100)}%`,
                                    height: "100%",
                                    bgcolor:
                                      (hv.phanTramHoanThanh ?? 0) >= 100
                                        ? "#16A34A"
                                        : (hv.phanTramHoanThanh ?? 0) >= 50
                                          ? BRAND.main
                                          : "#D97706",
                                    borderRadius: 3,
                                  }}
                                />
                              </Box>
                              <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>
                                {Math.round(hv.phanTramHoanThanh ?? 0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: BRAND.main }}>
                              {hv.giaDangKy != null
                                ? formatTien(hv.giaDangKy)
                                : "Miễn phí"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Box>
          ))}

        {/* ── TAB 2: HIỆU QUẢ BÀI GIẢNG ── */}
        {tab === 2 &&
          (loadingEG ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: BRAND.main }} />
            </Box>
          ) : !engagement ? null : (
            <Box>
              {/* Engagement 6 Cards Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 2,
                  mb: 4,
                }}
              >
                <StatCard
                  icon={<PeopleAltRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Học viên đã đăng ký"
                  value={engagement.hocVienDaDangKy.toLocaleString("vi-VN")}
                  color={BRAND.main}
                  bgColor="#FEF2F2"
                />
                <StatCard
                  icon={<PlayCircleRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Học viên đã bắt đầu học"
                  value={engagement.hocVienDaBatDauHoc.toLocaleString("vi-VN")}
                  color="#2563EB"
                  bgColor="#EFF6FF"
                />
                <StatCard
                  icon={<AccessTimeRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Tổng thời lượng học"
                  value={`${engagement.tongThoiGianHocGio.toLocaleString("vi-VN")} giờ`}
                  color="#D97706"
                  bgColor="#FFFBEB"
                />
                <StatCard
                  icon={<MenuBookRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Lượt xem bài giảng"
                  value={engagement.luotXemBaiGiang.toLocaleString("vi-VN")}
                  color="#7C3AED"
                  bgColor="#FAF5FF"
                />
                <StatCard
                  icon={<TrendingUpRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Tỷ lệ hoàn thành TB"
                  value={`${engagement.tyLeHoanThanhTrungBinh}%`}
                  color="#16A34A"
                  bgColor="#F0FDF4"
                />
                <StatCard
                  icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 24 }} />}
                  label="Đang tích cực học"
                  value={engagement.hocVienDangHoatDong.toLocaleString("vi-VN")}
                  color="#DC2626"
                  bgColor="#FEF2F2"
                />
              </Box>

              {/* Lesson Engagement Table */}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: "#0F172A",
                    fontFamily: FONTS.display,
                    mb: 2,
                  }}
                >
                  Thống kê chi tiết theo từng bài giảng
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Tên bài giảng
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          <VisibilityRoundedIcon sx={{ fontSize: 15, verticalAlign: "middle", mr: 0.5 }} />
                          Lượt xem
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: 13, color: "#475569", py: 1.75 }}>
                          Tỷ lệ hoàn thành
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {baiGiangList.map((bg) => (
                        <TableRow
                          key={bg.idBaiGiang}
                          sx={{ "&:hover": { bgcolor: "#F8FAFC" } }}
                        >
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>
                              {bg.tenBaiGiang || "Bài giảng chưa đặt tên"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography sx={{ fontSize: 13.5, color: "#64748B", fontWeight: 700 }}>
                              {bg.luotXem.toLocaleString("vi-VN")}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 80,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: "#F1F5F9",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${Math.min(bg.tyLeHoanThanh, 100)}%`,
                                    height: "100%",
                                    bgcolor:
                                      bg.tyLeHoanThanh >= 70
                                        ? "#16A34A"
                                        : bg.tyLeHoanThanh >= 40
                                          ? BRAND.main
                                          : "#D97706",
                                    borderRadius: 3,
                                  }}
                                />
                              </Box>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  fontSize: 13,
                                  color: "#0F172A",
                                  minWidth: 36,
                                }}
                              >
                                {bg.tyLeHoanThanh}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            </Box>
          ))}

        {/* ── Dialog Lịch sử Doanh thu ── */}
        <Dialog
          open={!!lichSuTarget}
          onClose={() => setLichSuTarget(null)}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: "20px",
                p: 1,
                boxShadow: "0 20px 48px rgba(0, 0, 0, 0.15)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: 17,
              color: "#0F172A",
              fontFamily: FONTS.display,
              display: "flex",
              alignItems: "center",
              gap: 1,
              pt: 2,
            }}
          >
            <HistoryRoundedIcon sx={{ color: BRAND.main }} />
            Lịch sử chia sẻ doanh thu — {lichSuTarget?.ten}
          </DialogTitle>
          <DialogContent sx={{ maxHeight: "70vh", py: 1.5 }}>
            {loadingLichSu ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress sx={{ color: BRAND.main }} />
              </Box>
            ) : (
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#0F172A", mb: 1.25 }}>
                  Lịch sử thay đổi tỷ lệ
                </Typography>
                {lichSuTyLe.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "#64748B", mb: 2 }}>
                    Chưa có lần thay đổi tỷ lệ nào.
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ mb: 2.5 }}>
                    {lichSuTyLe.map((ls, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: "8px 12px",
                          borderRadius: "10px",
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        <Typography sx={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                          {new Date(ls.ngayThayDoi).toLocaleDateString("vi-VN")}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: BRAND.main }}>
                          {ls.tyLeCu}% → {ls.tyLeMoi}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#0F172A", mb: 1.25 }}>
                  Chi tiết đơn hàng đã ghi nhận
                </Typography>
                {lichSuDonHang.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>
                    Chưa có đơn hàng nào được ghi nhận cho giảng viên này.
                  </Typography>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      overflow: "hidden",
                    }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                          <TableCell sx={{ fontSize: 12, fontWeight: 800, color: "#475569" }}>
                            Ngày ghi nhận
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 12, fontWeight: 800, color: "#475569" }}>
                            Tỷ lệ
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12, fontWeight: 800, color: "#475569" }}>
                            Thực nhận
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lichSuDonHang.map((dh) => (
                          <TableRow key={dh.idDonHang}>
                            <TableCell sx={{ fontSize: 12.5, color: "#0F172A", fontWeight: 600 }}>
                              {new Date(dh.ngayGhiNhan).toLocaleDateString("vi-VN")}
                            </TableCell>
                            <TableCell align="center" sx={{ fontSize: 12.5, fontWeight: 700, color: "#64748B" }}>
                              {dh.tyLeChiaDoanhThu}%
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#16A34A",
                              }}
                            >
                              {formatTien(dh.soTienNhan)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </AuthGuard>
  );
}
