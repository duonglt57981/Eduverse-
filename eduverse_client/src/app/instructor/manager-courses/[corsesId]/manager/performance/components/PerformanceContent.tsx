/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  Box,
  Typography,
  Paper,
  Avatar,
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
} from "@mui/material";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useState, useEffect, useCallback } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import { useCourseEdit } from "../../components/CourseEditContext";
import { MAU } from "../../components/courseEditCore";
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
import { COLORS, CSSVAR, STATUS, NEUTRAL } from "@/src/theme/tokens";

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
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const c = color || MAU.chinh;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "14px",
        border: `1px solid ${CSSVAR.divider}`,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "12px",
          bgcolor: `${c}14`,
          color: c,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            color: NEUTRAL.textPrimary,
            lineHeight: 1.1,
          }}
        >
          {value}
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: NEUTRAL.textSecondary, fontWeight: 600, mt: 0.25 }}
        >
          {label}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: 11, color: NEUTRAL.grey, mt: 0.25 }}>
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
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
  const [engagement, setEngagement] = useState<CourseEngagementDto | null>(
    null,
  );
  const [loadingEG, setLoadingEG] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Lịch sử doanh thu theo giảng viên (dialog)
  const [lichSuTarget, setLichSuTarget] = useState<{
    id: string;
    ten: string;
  } | null>(null);
  const [lichSuTyLe, setLichSuTyLe] = useState<LichSuThayDoiTyLeDto[]>([]);
  const [lichSuDonHang, setLichSuDonHang] = useState<LichSuNhanTheoDonDto[]>(
    [],
  );
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

  useEffect(() => {
    console.log("doanhThu state:", doanhThu);
    console.log("loadingDT:", loadingDT);
    console.log("error:", error);
  }, [doanhThu, loadingDT, error]);

  const loadDoanhThu = useCallback(async () => {
    if (!idKhoaHoc) {
      console.log("❌ idKhoaHoc rỗng, không load được");
      return;
    }
    console.log("✅ Load doanh thu cho:", idKhoaHoc);
    setLoadingDT(true);
    try {
      const data = await ThongKeKhoaHocService.GetDoanhThu(idKhoaHoc);
      console.log("✅ Data nhận được:", data);
      setDoanhThu(data);
    } catch (err: any) {
      console.log("❌ Lỗi:", err.message);
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress sx={{ color: MAU.chinh }} />
      </Box>
    );
  }

  if (trangThai !== "DaDuyet") {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ fontWeight: 700, color: NEUTRAL.grey }}>
          Thống kê chỉ khả dụng sau khi khóa học được duyệt.
        </Typography>
      </Box>
    );
  }

  if (!coQuyen("performance")) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography sx={{ fontWeight: 700, color: NEUTRAL.grey }}>
          Bạn không có quyền truy cập mục Thống kê.
        </Typography>
      </Box>
    );
  }

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <Box sx={{ maxWidth: 1100, mx: "auto", pb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 24, color: NEUTRAL.textPrimary }}>
            Thống kê khóa học
          </Typography>
          <Typography sx={{ fontSize: 14, color: NEUTRAL.textSecondary, mt: 0.5 }}>
            Doanh thu và học viên đăng ký
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 4,
            borderBottom: `1px solid ${NEUTRAL.divider}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: NEUTRAL.textSecondary,
              mr: 3,
              px: 0,
            },
            "& .Mui-selected": { color: `${MAU.chinh} !important` },
            "& .MuiTabs-indicator": { backgroundColor: MAU.chinh },
          }}
        >
          <Tab label="💰 Doanh thu" />
          <Tab label="👥 Học viên" />
          <Tab label="📊 Bài giảng" />
        </Tabs>

        {/* ── Tab 0: Doanh thu ── */}
        {tab === 0 &&
          (loadingDT ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: MAU.chinh }} />
            </Box>
          ) : doanhThu == null ? (
            <Typography sx={{ color: "red", textAlign: "center", py: 4 }}>
              Không tải được dữ liệu
            </Typography>
          ) : (
            <Box>
              {/* Stat cards */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                  mb: 4,
                }}
              >
                <StatCard
                  icon={<AttachMoneyIcon />}
                  label="Tổng doanh thu"
                  value={formatTienNgan(doanhThu.tongDoanhThu)}
                  sub={formatTien(doanhThu.tongDoanhThu)}
                  color={MAU.chinh}
                />
                <StatCard
                  icon={<TrendingUpIcon />}
                  label="Phần giảng viên (70%)"
                  value={formatTienNgan(doanhThu.phanGiangVien)}
                  sub={formatTien(doanhThu.phanGiangVien)}
                  color="#16A34A"
                />
                <StatCard
                  icon={<ShoppingCartOutlinedIcon />}
                  label="Tổng đơn hàng"
                  value={doanhThu.tongDonHang}
                  color="#2563EB"
                />
                <StatCard
                  icon={<PeopleOutlinedIcon />}
                  label="Tổng học viên"
                  value={doanhThu.tongHocVien}
                  color={STATUS.warningDark}
                />
              </Box>

              {/* Bộ lọc năm */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, color: NEUTRAL.textPrimary }}
                >
                  Doanh thu theo tháng
                </Typography>
                <FormControl size="small">
                  <Select
                    value={namChon}
                    onChange={(e) => setNamChon(Number(e.target.value))}
                    sx={{
                      fontSize: 13,
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: NEUTRAL.divider,
                      },
                    }}
                  >
                    {namOptions.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Chart doanh thu */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "14px",
                  border: `1px solid ${NEUTRAL.divider}`,
                  mb: 4,
                }}
              >
                {doanhThu.doanhThuTheoThang.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <AttachMoneyIcon
                      sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }}
                    />
                    <Typography sx={{ fontWeight: 700, color: NEUTRAL.grey }}>
                      Chưa có doanh thu ghi nhận theo giảng viên cho khóa học
                      này.
                    </Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={chartDataDT}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F5" />
                      <XAxis
                        dataKey="thang"
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                      />
                      <YAxis
                        domain={[0, "auto"]}
                        allowDecimals={false}
                        tickFormatter={formatTienNgan}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                      />
                      <Tooltip
                        formatter={(val) => [
                          formatTien(Number(val ?? 0)),
                          "Doanh thu",
                        ]}
                        labelFormatter={(l) => `Tháng ${l}`}
                      />
                      <Bar
                        dataKey="doanhThu"
                        fill={MAU.chinh}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>

              {/* Phân chia doanh thu giảng viên */}
              <Typography
                sx={{ fontWeight: 800, fontSize: 16, color: NEUTRAL.textPrimary, mb: 2 }}
              >
                Phân chia doanh thu giảng viên
              </Typography>

              {/* Tổng quan chia */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid #DCFCE7",
                    bgcolor: "#F0FDF4",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#16A34A",
                      mb: 0.5,
                    }}
                  >
                    Phần giảng viên (70%)
                  </Typography>
                  <Typography
                    sx={{ fontSize: 20, fontWeight: 900, color: "#15803D" }}
                  >
                    {formatTien(doanhThu.phanGiangVien)}
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: `1px solid ${NEUTRAL.divider}`,
                    bgcolor: "#F9FAFB",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#6B7280",
                      mb: 0.5,
                    }}
                  >
                    Phần hệ thống (30%)
                  </Typography>
                  <Typography
                    sx={{ fontSize: 20, fontWeight: 900, color: "#374151" }}
                  >
                    {formatTien(doanhThu.phanHeTong)}
                  </Typography>
                </Paper>
              </Box>

              {/* Bảng phân chia từng GV */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "14px",
                  border: `1px solid ${NEUTRAL.divider}`,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: NEUTRAL.bg }}>
                      <TableCell
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Giảng viên
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Tỷ lệ
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Nhận được
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Lịch sử
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {doanhThu.phanChiaGiangVien.map((gv) => (
                      <TableRow
                        key={gv.idGiangVien}
                        sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              src={gv.anhDaiDien || ""}
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: `${MAU.chinh}22`,
                                color: MAU.chinh,
                                fontSize: 14,
                                fontWeight: 700,
                              }}
                            >
                              {gv.hoTen?.[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                  color: NEUTRAL.textPrimary,
                                }}
                              >
                                {gv.hoTen || "Chưa có tên"}
                              </Typography>
                              {gv.laChuSoHuu && (
                                <Chip
                                  label="Chủ sở hữu"
                                  size="small"
                                  sx={{
                                    fontSize: 10,
                                    height: 18,
                                    bgcolor: `${MAU.chinh}14`,
                                    color: MAU.chinh,
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${gv.tyLeChiaDoanhThu}%`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              bgcolor: "#EFF6FF",
                              color: "#2563EB",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 15,
                              color: "#16A34A",
                            }}
                          >
                            {formatTien(gv.soTienNhan)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() =>
                              moLichSu(gv.idGiangVien, gv.hoTen || "Giảng viên")
                            }
                            sx={{
                              color: "#94A3B8",
                              "&:hover": {
                                color: MAU.chinh,
                                bgcolor: `${MAU.chinh}10`,
                              },
                            }}
                          >
                            <HistoryRoundedIcon sx={{ fontSize: 19 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          ))}

        {/* ── Dialog: Lịch sử doanh thu theo giảng viên ── */}
        {/* Đứng độc lập (sibling), KHÔNG bao bất kỳ khối Tab nào bên trong,
            vì MUI Dialog không mount children khi open=false. */}
        <Dialog
          open={!!lichSuTarget}
          onClose={() => setLichSuTarget(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 800 }}>
            Lịch sử doanh thu — {lichSuTarget?.ten}
          </DialogTitle>
          <DialogContent sx={{ maxHeight: "70vh" }}>
            {loadingLichSu ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress sx={{ color: MAU.chinh }} />
              </Box>
            ) : (
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
                  Thay đổi tỷ lệ
                </Typography>
                {lichSuTyLe.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: NEUTRAL.grey, mb: 2 }}>
                    Chưa có thay đổi nào.
                  </Typography>
                ) : (
                  lichSuTyLe.map((ls, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 0.75,
                      }}
                    >
                      <Typography sx={{ fontSize: 13, color: NEUTRAL.textSecondary }}>
                        {new Date(ls.ngayThayDoi).toLocaleDateString("vi-VN")}
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        {ls.tyLeCu}% → {ls.tyLeMoi}%
                      </Typography>
                    </Box>
                  ))
                )}

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
                  Theo đơn hàng
                </Typography>
                {lichSuDonHang.length === 0 ? (
                  <Typography sx={{ fontSize: 13, color: NEUTRAL.grey }}>
                    Chưa có đơn hàng nào ghi nhận.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>
                          Ngày
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: 12, fontWeight: 700 }}
                        >
                          Tỷ lệ
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: 12, fontWeight: 700 }}
                        >
                          Nhận được
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lichSuDonHang.map((dh) => (
                        <TableRow key={dh.idDonHang}>
                          <TableCell sx={{ fontSize: 13 }}>
                            {new Date(dh.ngayGhiNhan).toLocaleDateString(
                              "vi-VN",
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: 13 }}>
                            {dh.tyLeChiaDoanhThu}%
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#16A34A",
                            }}
                          >
                            {formatTien(dh.soTienNhan)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Tab 1: Học viên ── */}
        {tab === 1 &&
          (loadingHV ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: MAU.chinh }} />
            </Box>
          ) : !hocVien ? null : (
            <Box>
              {/* Stat cards */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                  gap: 2,
                  mb: 4,
                }}
              >
                <StatCard
                  icon={<PeopleOutlinedIcon />}
                  label="Tổng học viên"
                  value={hocVien.tongHocVien}
                  color={MAU.chinh}
                />
                <StatCard
                  icon={<TrendingUpIcon />}
                  label="Mới 30 ngày"
                  value={hocVien.hocVienMoi30Ngay}
                  color="#2563EB"
                />
                <StatCard
                  icon={<CheckCircleOutlineIcon />}
                  label="Đang học"
                  value={hocVien.dangHoc}
                  color="#16A34A"
                />
                <StatCard
                  icon={<SchoolOutlinedIcon />}
                  label="Hết hạn"
                  value={hocVien.hetHan}
                  color={STATUS.warningDark}
                />
              </Box>

              {/* Bộ lọc năm */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, color: NEUTRAL.textPrimary }}
                >
                  Học viên đăng ký theo tháng
                </Typography>
                <FormControl size="small">
                  <Select
                    value={namChon}
                    onChange={(e) => {
                      setNamChon(Number(e.target.value));
                    }}
                    sx={{
                      fontSize: 13,
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: NEUTRAL.divider,
                      },
                    }}
                  >
                    {namOptions.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Chart học viên */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "14px",
                  border: `1px solid ${NEUTRAL.divider}`,
                  mb: 4,
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={chartDataHV}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F5" />
                    <XAxis
                      dataKey="thang"
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(val) => [val ?? 0, "Học viên"]}
                      labelFormatter={(l) => `Tháng ${l}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="soLuong"
                      stroke={MAU.chinh}
                      strokeWidth={2.5}
                      dot={{ fill: MAU.chinh, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              {/* Danh sách học viên gần đây */}
              <Typography
                sx={{ fontWeight: 800, fontSize: 16, color: NEUTRAL.textPrimary, mb: 2 }}
              >
                Học viên đăng ký gần đây
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "14px",
                  border: `1px solid ${NEUTRAL.divider}`,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: NEUTRAL.bg }}>
                      <TableCell
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Học viên
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Ngày đăng ký
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Trạng thái
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Tiến độ
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                      >
                        Giá
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hocVien.danhSachHocVien.map((hv) => (
                      <TableRow
                        key={hv.idHocVien}
                        sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              src={hv.anhDaiDien || ""}
                              sx={{
                                width: 34,
                                height: 34,
                                bgcolor: "#EFF6FF",
                                color: "#2563EB",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {hv.hoTen?.[0]}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: NEUTRAL.textPrimary,
                                }}
                              >
                                {hv.hoTen || "Ẩn danh"}
                              </Typography>
                              <Typography
                                sx={{ fontSize: 11, color: NEUTRAL.grey }}
                              >
                                {hv.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, color: NEUTRAL.textSecondary }}>
                            {hv.thoiGianDK
                              ? new Date(hv.thoiGianDK).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "—"}
                          </Typography>
                          {hv.ngayHetHan && (
                            <Typography sx={{ fontSize: 11, color: NEUTRAL.grey }}>
                              Hết hạn:{" "}
                              {new Date(hv.ngayHetHan).toLocaleDateString(
                                "vi-VN",
                              )}
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
                              fontWeight: 700,
                              fontSize: 11,
                              bgcolor:
                                hv.isDangKy &&
                                hv.ngayHetHan &&
                                new Date(hv.ngayHetHan) >= new Date()
                                  ? "#DCFCE7"
                                  : hv.ngayHetHan &&
                                      new Date(hv.ngayHetHan) < new Date()
                                    ? "#FEF3C7"
                                    : "#F3F4F6",
                              color:
                                hv.isDangKy &&
                                hv.ngayHetHan &&
                                new Date(hv.ngayHetHan) >= new Date()
                                  ? "#16A34A"
                                  : hv.ngayHetHan &&
                                      new Date(hv.ngayHetHan) < new Date()
                                    ? STATUS.warningDark
                                    : "#6B7280",
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
                                width: 70,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "#F1F2F5",
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
                                        ? MAU.chinh
                                        : STATUS.warningDark,
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: NEUTRAL.textSecondary,
                              }}
                            >
                              {Math.round(hv.phanTramHoanThanh ?? 0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: MAU.chinh,
                            }}
                          >
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
          ))}
      </Box>
      {/* ── Tab 2: Engagement ── */}
      {tab === 2 &&
        (loadingEG ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: MAU.chinh }} />
          </Box>
        ) : !engagement ? null : (
          <Box>
            {/* Card tổng quan Course Engagement */}
            <Typography
              sx={{ fontWeight: 800, fontSize: 16, color: NEUTRAL.textPrimary, mb: 2 }}
            >
              Course Engagement
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
                gap: 2,
                mb: 4,
              }}
            >
              <StatCard
                icon={<PeopleOutlinedIcon />}
                label="Học viên đã đăng ký"
                value={engagement.hocVienDaDangKy}
                color={MAU.chinh}
              />
              <StatCard
                icon={<PlayCircleOutlineIcon />}
                label="Học viên đã bắt đầu học"
                value={engagement.hocVienDaBatDauHoc}
                color="#2563EB"
              />
              <StatCard
                icon={<AccessTimeIcon />}
                label="Tổng thời gian học"
                value={`${engagement.tongThoiGianHocGio.toLocaleString("vi-VN")} giờ`}
                color={STATUS.warningDark}
              />
              <StatCard
                icon={<MenuBookOutlinedIcon />}
                label="Bài giảng được xem"
                value={engagement.luotXemBaiGiang.toLocaleString("vi-VN")}
                color={COLORS.purpleAI}
              />
              <StatCard
                icon={<TrendingUpIcon />}
                label="Tỷ lệ hoàn thành"
                value={`${engagement.tyLeHoanThanhTrungBinh}%`}
                color="#16A34A"
              />
              <StatCard
                icon={<LocalFireDepartmentIcon />}
                label="Học viên đang hoạt động"
                value={engagement.hocVienDangHoatDong}
                color={STATUS.error}
              />
            </Box>

            {/* Bảng theo bài giảng */}
            <Typography
              sx={{ fontWeight: 800, fontSize: 16, color: NEUTRAL.textPrimary, mb: 2 }}
            >
              Thống kê theo bài giảng
            </Typography>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "14px",
                border: `1px solid ${NEUTRAL.divider}`,
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: NEUTRAL.bg }}>
                    <TableCell
                      sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                    >
                      Bài giảng
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                    >
                      <VisibilityOutlinedIcon
                        sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }}
                      />
                      Lượt xem
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, fontSize: 13, color: NEUTRAL.textSecondary }}
                    >
                      Hoàn thành
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {baiGiangList.map((bg) => (
                    <TableRow
                      key={bg.idBaiGiang}
                      sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: NEUTRAL.textPrimary,
                          }}
                        >
                          {bg.tenBaiGiang || "Chưa có tên"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontSize: 14, color: NEUTRAL.textSecondary }}>
                          {bg.luotXem.toLocaleString("vi-VN")}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "#F1F2F5",
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
                                      ? MAU.chinh
                                      : STATUS.warningDark,
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 13,
                              color: NEUTRAL.textPrimary,
                              minWidth: 32,
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
        ))}
    </AuthGuard>
  );
}
