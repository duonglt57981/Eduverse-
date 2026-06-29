"use client";

import { useEffect,useState  } from "react";
import {
  Box, Grid, Typography, Card, CardContent, Button,
  Avatar, LinearProgress, Chip, Stack, Divider,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "../../../../store/hook";
import { getSoDu, getThongBaoCuaToi, danhDauDaDoc } from "../../../../store/rutTien/RutTienSlice";
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
  
const PRIMARY = "#9b1c1c";



// Chart data tĩnh - sau này có thể thay bằng API
const revenueData = [
  { month: "T1", value: 12 },
  { month: "T2", value: 18 },
  { month: "T3", value: 15 },
  { month: "T4", value: 22 },
  { month: "T5", value: 85 },
  { month: "T6", value: 30 },
  { month: "T7", value: 25 },
];


const recentStudents = [
  { name: "Lê Minh Tuấn", course: "Marketing Cơ bản", progress: 49, time: "2 giờ trước" },
  { name: "Trần Thị Bích", course: "Thiết kế UI/UX", progress: 87, time: "5 giờ trước" },
  { name: "Nguyễn Hoàng Nam", course: "Python for Data Science", progress: 12, time: "Hôm qua" },
];

const loaiColor: Record<string, string> = {
  YeuCauRutTien: "#d97706",
  DoanhThu: "#059669",
  RutTienThanhCong: "#059669",
  RutTienTuChoi: "#dc2626",
};

export default function GiangVienDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { soDu, thongBaos } = useSelector((s) => s.rutTien);
  const formatThoiGian = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("vi-VN");
  };

  useEffect(() => {
    dispatch(getSoDu());
    dispatch(getThongBaoCuaToi());
  }, [dispatch]);
  

  const formatTien = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return `${n.toLocaleString("vi-VN")}`;
  };
  

  const stats = [
    { label: "Tổng khóa học", value: "12", icon: <TrendingUpIcon />, change: null },
    { label: "Tổng học viên", value: "1,240", icon: <PeopleIcon />, change: "+13%" },
    {
      label: "Số dư tài khoản",
      value: `${formatTien(soDu)}đ`,
      icon: <AttachMoneyIcon />,
      change: null,
      onClick: () => router.push("/giang-vien/doanh-thu"),
    },
    { label: "Rating trung bình", value: "4.9/5", icon: <StarIcon />, change: "+2%" },
  ];

  const chuaDoc = thongBaos.filter((t) => !t.daDoc);
  const recentThongBaos = thongBaos.slice(0, 4);


  return (
    <Box sx={{ p: 3 }}>
      {/* Banner */}
      <Card sx={{ borderRadius: 3, mb: 3, overflow: "hidden",
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #5c1111 100%)`, color: "#fff" }}>
        <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontSize: 13, opacity: 0.8, mb: 0.5 }}>Xin chào trở lại</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>
              Chào mừng trở lại, {user?.hoTen ?? "Giảng viên"}!
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.8, mb: 2, maxWidth: 450 }}>
              Theo dõi hiệu suất giảng dạy và phát triển khóa học của bạn.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" startIcon={<AddIcon />}
                onClick={() => router.push("/giang-vien/khoa-hoc/tao-moi")}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  borderRadius: 2, fontWeight: 700, fontSize: 13 }}>
                Tạo khóa học
              </Button>
              <Button variant="outlined"
                onClick={() => router.push("/giang-vien/doanh-thu")}
                sx={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "#fff" },
                  borderRadius: 2, fontSize: 13 }}>
                Rút tiền
              </Button>
            </Stack>
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <BarChartIcon sx={{ fontSize: 120, opacity: 0.15 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2,
              cursor: stat.onClick ? "pointer" : "default",
              "&:hover": stat.onClick ? { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" } : {} }}
              onClick={stat.onClick}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 22, color: "text.primary" }}>
                    {stat.value}
                  </Typography>
                  {stat.change && (
                    <Chip label={stat.change} size="small" sx={{ mt: 0.5,
                      bgcolor: "#f0fdf4", color: "success.main", fontWeight: 700, fontSize: 11, height: 20 }} />
                  )}
                  {stat.label === "Số dư tài khoản" && (
                    <Typography sx={{ fontSize: 10, color: PRIMARY, mt: 0.5, fontWeight: 600 }}>
                      Nhấn để rút tiền →
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#fff0f0",
                  display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                  {stat.icon}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Biểu đồ doanh thu */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2.5, mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Biểu đồ doanh thu</Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Thống kê thu nhập 7 tháng gần nhất
                </Typography>
              </Box>
              <Chip label="Năm 2024" size="small" sx={{ bgcolor: "#fff0f0", color: PRIMARY, fontWeight: 600 }} />
            </Box>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={28}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [`${v}M VNĐ`, "Doanh thu"]}
                  contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {revenueData.map((_, i) => (
                    <Cell key={i} fill={i === 4 ? PRIMARY : "#f0e8e8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Học viên mới nhất */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Học viên mới nhất</Typography>
              <Button size="small" sx={{ color: PRIMARY, fontSize: 12, fontWeight: 600 }}>
                Xem tất cả
              </Button>
            </Box>

            <Grid container sx={{ pb: 1, borderBottom: "1px solid #f0ece8", mb: 1 }}>
              {["HỌC VIÊN", "KHÓA HỌC", "TIẾN ĐỘ", "HOẠT ĐỘNG"].map((h) => (
                <Grid key={h} size={{ xs: 3 }}>
                  <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>{h}</Typography>
                </Grid>
              ))}
            </Grid>

            <Stack spacing={1.5}>
              {recentStudents.map((s, i) => (
                <Grid container key={i} sx={{ alignItems: "center" }}>
                  <Grid size={{ xs: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: PRIMARY, fontSize: 11 }}>{s.name[0]}</Avatar>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{s.name}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{s.course}</Typography>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <Box>
                      <LinearProgress variant="determinate" value={s.progress} sx={{ height: 5, borderRadius: 4,
                        bgcolor: "#f0e8e8", "& .MuiLinearProgress-bar": { bgcolor: PRIMARY } }} />
                      <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.3 }}>{s.progress}%</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 3 }}>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{s.time}</Typography>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* Tăng trưởng */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2.5, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>Tăng trưởng học viên</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Chip label="+24%" sx={{ bgcolor: "#f0fdf4", color: "success.main", fontWeight: 700 }} />
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontWeight: 800, fontSize: 24 }}>312</Typography>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>Tháng này</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Tỷ lệ hoàn thành</Typography>
            {[
              { label: "Khóa học Marketing", value: 82 },
              { label: "Thiết kế UI/UX", value: 65 },
            ].map((item, i) => (
              <Box key={i} sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography sx={{ fontSize: 12 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY }}>{item.value}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={item.value} sx={{ height: 6, borderRadius: 4,
                  bgcolor: "#f0e8e8", "& .MuiLinearProgress-bar": { bgcolor: PRIMARY } }} />
              </Box>
            ))}
          </Card>

          {/* Thông báo từ DB */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Thông báo</Typography>
                {chuaDoc.length > 0 && (
                  <Chip label={chuaDoc.length} color="error" size="small"
                    sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                )}
              </Box>
            </Box>

            {recentThongBaos.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center", py: 2 }}>
                Chưa có thông báo
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {recentThongBaos.map((t) => (
                  <Box key={t.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start",
                    cursor: "pointer", p: 0.5, borderRadius: 1,
                    bgcolor: !t.daDoc ? "#fffbf0" : "transparent",
                    "&:hover": { bgcolor: "#f9f8f6" } }}
                    onClick={() => !t.daDoc && dispatch(danhDauDaDoc(t.id))}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", mt: 0.6, flexShrink: 0,
                      bgcolor: loaiColor[t.loaiThongBao ?? ""] ?? (t.daDoc ? "#ccc" : PRIMARY) }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: !t.daDoc ? 600 : 400,
                        lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {t.tieuDe}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                        {formatThoiGian(t.thoiGianTao)}
                      </Typography>
                    </Box>
                    {!t.daDoc && (
                      <FiberManualRecordIcon sx={{ fontSize: 8, color: PRIMARY, mt: 0.5, flexShrink: 0 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            <Button fullWidth size="small"
              onClick={() => router.push("/giang-vien/thong-bao")}
              sx={{ mt: 2, color: PRIMARY, fontSize: 12 }}>
              Xem tất cả thông báo
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
