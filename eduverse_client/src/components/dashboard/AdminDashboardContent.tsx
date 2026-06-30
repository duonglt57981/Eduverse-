"use client";

import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/src/services/index";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import {
  TrendingUpRounded,
  TrendingFlatRounded,
  MonetizationOnRounded,
  PeopleRounded,
  SchoolRounded,
  AssignmentTurnedInRounded,
  StarRounded,
  FiberManualRecordRounded,
} from "@mui/icons-material";

// Crimson palette matches the design theme
const COLORS = {
  primary: "#8D1313", // Crimson Red
  primaryLight: "#B91C1C", // Light Crimson
  primaryDark: "#7F1D1D", // Dark Crimson
  bgLight: "#FFF8F6", // Premium cream-rose background
  white: "#FFFFFF",
  textDark: "#1F2937",
  textSecondary: "#4B5563",
  green: "#10B981",
  grey: "#9CA3AF",
};

// SVG-based monthly revenue line chart
function RevenueLineChart({ data }: { data: number[] }) {
  const [activeTab, setActiveTab] = useState("month");

  const width = 1000;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 40;
  const paddingBottom = 40;

  const maxVal = Math.max(...data, 1000000);
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  // Calculate coordinates
  const points = useMemo(() => {
    return data.map((val, idx) => {
      const x = paddingLeft + (idx * chartWidth) / (data.length - 1);
      const y = height - paddingBottom - (val / maxVal) * chartHeight;
      return { x, y, val };
    });
  }, [data, chartWidth, chartHeight, maxVal]);

  // Construct curved SVG line path using bezier curves
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + chartWidth / (data.length - 1) / 2;
      const cpY1 = curr.y;
      const cpX2 = next.x - chartWidth / (data.length - 1) / 2;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  }, [points, chartWidth, data.length]);

  // Closed path for fill area under the line
  const fillPath = useMemo(() => {
    if (points.length === 0) return "";
    return `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }, [points, linePath]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const formatYLabel = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + " tỷ";
    if (val >= 1000000) return (val / 1000000).toFixed(0) + " tr";
    return val.toLocaleString();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: "24px",
        border: "1px solid rgba(141,19,19,0.06)",
        bgcolor: COLORS.white,
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: COLORS.textDark }}
          >
            Phân tích doanh thu
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(31,41,55,0.48)" }}>
            Lợi nhuận gộp hàng tháng và doanh số bán hàng hàng ngày.
          </Typography>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 32,
            bgcolor: "rgba(141,19,19,0.04)",
            borderRadius: "10px",
            p: 0.5,
            "& .MuiTabs-indicator": {
              bgcolor: COLORS.primary,
              height: "100%",
              borderRadius: "8px",
              zIndex: 0,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 12.5,
              fontWeight: 700,
              minHeight: 28,
              minWidth: 70,
              py: 0.5,
              px: 1.5,
              zIndex: 1,
              color: "rgba(31,41,55,0.5)",
              transition: "color 200ms",
              "&.Mui-selected": {
                color: "#ffffff",
              },
            },
          }}
        >
          <Tab value="month" label="Tháng này" />
          <Tab value="quarter" label="Quý này" />
          <Tab value="year" label="Năm này" />
        </Tabs>
      </Stack>

      {/* SVG Chart */}
      <Box sx={{ width: "100%", overflowX: "auto", mt: 1 }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="auto"
          style={{ minWidth: 720 }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.25" />
              <stop
                offset="100%"
                stopColor={COLORS.primary}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, idx) => {
            const y = paddingTop + (1 - tick) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(0,0,0,0.04)"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(31,41,55,0.4)"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: '"Be Vietnam Pro"',
                  }}
                >
                  {formatYLabel(tick * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Fill under the curve */}
          <path d={fillPath} fill="url(#chartGradient)" />

          {/* Curved Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Data Points and tooltips */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={COLORS.primary}
                stroke={COLORS.white}
                strokeWidth={1.5}
                style={{ cursor: "pointer", transition: "r 150ms" }}
              />
              <text
                x={p.x}
                y={height - paddingBottom + 20}
                textAnchor="middle"
                fill="rgba(31,41,55,0.5)"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: '"Be Vietnam Pro"',
                }}
              >
                Th{idx + 1}
              </text>
            </g>
          ))}
        </svg>
      </Box>
    </Paper>
  );
}

// SVG bar chart for student growth
function StudentGrowthChart({ data }: { data: number[] }) {
  const maxVal = Math.max(...data, 100);
  const labels = ["Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11"];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: "24px",
        border: "1px solid rgba(141,19,19,0.06)",
        bgcolor: COLORS.white,
        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: COLORS.textDark, mb: 3 }}
      >
        Tăng trưởng học viên
      </Typography>

      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: 180,
          px: 1,
          mt: 2,
        }}
      >
        {data.map((val, idx) => {
          const isLatest = idx === data.length - 1;
          const pct = (val / maxVal) * 100;
          return (
            <Stack
              key={idx}
              spacing={1.5}
              sx={{ alignItems: "center", flex: 1 }}
            >
              <Box
                sx={{
                  width: { xs: 20, sm: 28 },
                  height: `${pct}%`,
                  minHeight: 8,
                  borderRadius: "6px",
                  background: isLatest
                    ? `linear-gradient(180deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 100%)`
                    : "rgba(141,19,19,0.08)",
                  transition: "height 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    opacity: 0.85,
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isLatest ? COLORS.primary : "rgba(31,41,55,0.4)",
                }}
              >
                {labels[idx] || `Th${idx + 5}`}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

// GitHub-like heatmap contribution grid
function LearningActivityHeatmap({ data }: { data: number[] }) {
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ Nhật",
  ];

  // Reshape data into 7 rows (days) by 20 columns (weeks)
  const grid = useMemo(() => {
    const rows: number[][] = Array.from({ length: 7 }, () => []);
    data.forEach((val, idx) => {
      const rowIdx = idx % 7;
      rows[rowIdx].push(val);
    });
    return rows;
  }, [data]);

  const getColor = (val: number) => {
    if (val === 0) return "rgba(141,19,19,0.02)";
    if (val === 1) return "rgba(141,19,19,0.1)";
    if (val === 2) return "rgba(141,19,19,0.25)";
    if (val === 3) return "rgba(141,19,19,0.5)";
    return COLORS.primary; // 4+
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        borderRadius: "24px",
        border: "1px solid rgba(141,19,19,0.06)",
        bgcolor: COLORS.white,
        height: "100%",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: COLORS.textDark, mb: 1 }}
      >
        Hoạt động học tập (Heatmap)
      </Typography>
      <Typography sx={{ fontSize: 13, color: "rgba(31,41,55,0.5)", mb: 3 }}>
        Tần suất hoạt động học tập và tương tác của hệ thống.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
        {/* Day labels */}
        <Stack
          spacing={1}
          sx={{ justifyContent: "space-around", pr: 1, py: 0.5 }}
        >
          {days.map((day, idx) => (
            <Typography
              key={idx}
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(31,41,55,0.4)",
                height: 14,
              }}
            >
              {idx % 2 === 0 ? day : ""}
            </Typography>
          ))}
        </Stack>

        {/* Grid cells */}
        <Stack spacing={0.8} sx={{ flex: 1 }}>
          {grid.map((row, rIdx) => (
            <Stack key={rIdx} direction="row" spacing={0.8}>
              {row.map((val, cIdx) => (
                <Box
                  key={cIdx}
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "3px",
                    bgcolor: getColor(val),
                    border: "1px solid rgba(0,0,0,0.02)",
                    transition: "transform 100ms",
                    "&:hover": {
                      transform: "scale(1.18)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      borderColor: "rgba(0,0,0,0.1)",
                    },
                  }}
                  title={`Hoạt động: ${val}`}
                />
              ))}
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Legend */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 3,
          alignItems: "center",
          justifyContent: "flex-end",
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(31,41,55,0.4)",
        }}
      >
        <Typography variant="caption">Ít</Typography>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "2px",
            bgcolor: "rgba(141,19,19,0.02)",
          }}
        />
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "2px",
            bgcolor: "rgba(141,19,19,0.1)",
          }}
        />
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "2px",
            bgcolor: "rgba(141,19,19,0.25)",
          }}
        />
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "2px",
            bgcolor: "rgba(141,19,19,0.5)",
          }}
        />
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "2px",
            bgcolor: COLORS.primary,
          }}
        />
        <Typography variant="caption">Nhiều</Typography>
      </Stack>
    </Paper>
  );
}

// Main component
export default function AdminDashboardContent() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs and request states
  const [adminActiveTab, setAdminActiveTab] = useState(0);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await apiService.get<any>("/admin/instructor-requests");
      if (res.status && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.log("Error fetching instructor requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await apiService.post<any>(
        `/admin/instructor-requests/${id}/approve`,
      );
      if (res.status) {
        fetchRequests();
      } else {
        alert(res.message || "Lỗi khi phê duyệt");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi hệ thống khi phê duyệt");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      const res = await apiService.post<any>(
        `/admin/instructor-requests/${selectedRequest.id}/reject`,
        {
          adminNotes: rejectNotes,
        },
      );
      if (res.status) {
        setDialogOpen(false);
        setRejectNotes("");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(res.message || "Lỗi khi từ chối");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi hệ thống khi từ chối");
    }
  };

  useEffect(() => {
    if (adminActiveTab === 1) {
      fetchRequests();
    }
  }, [adminActiveTab]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const res = await apiService.get<any>("/dashboard");
        if (res.status && res.data) {
          setDashboardData(res.data);
        } else {
          setError(res.message || "Không thể lấy dữ liệu Admin Dashboard");
        }
      } catch (err: any) {
        setError(
          typeof err === "string" ? err : "Đã xảy ra lỗi khi tải dữ liệu",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{ display: "grid", placeItems: "center", minHeight: 350, py: 10 }}
      >
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (error || !dashboardData) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: "center",
          border: "1px solid rgba(127,29,29,0.1)",
          bgcolor: "#FFF0F0",
        }}
      >
        <Typography sx={{ color: "#b42318", fontWeight: 700 }}>
          {error || "Có lỗi xảy ra khi đồng bộ dữ liệu."}
        </Typography>
      </Paper>
    );
  }

  const {
    welcomeStats,
    revenueTrend,
    studentGrowth,
    bestSellingCourses,
    heatmap,
    recentActivities,
  } = dashboardData;

  const cardStats = [
    {
      title: "TỔNG DOANH THU",
      value: (welcomeStats.totalRevenue || 0).toLocaleString("vi-VN") + "đ",
      trend: "+12.5%",
      isUp: true,
      icon: (
        <MonetizationOnRounded sx={{ color: COLORS.primary, fontSize: 22 }} />
      ),
      iconBg: "rgba(141,19,19,0.05)",
    },
    {
      title: "TỔNG HỌC VIÊN",
      value: (welcomeStats.totalStudents || 0).toLocaleString(),
      trend: "+8.2%",
      isUp: true,
      icon: <PeopleRounded sx={{ color: "#7C3AED", fontSize: 22 }} />,
      iconBg: "rgba(124,58,237,0.05)",
    },
    {
      title: "TỔNG KHÓA HỌC",
      value: (welcomeStats.totalCourses || 0).toString(),
      trend: "-0.0%",
      isUp: null,
      icon: <SchoolRounded sx={{ color: "#0EA5E9", fontSize: 22 }} />,
      iconBg: "rgba(14,165,233,0.05)",
    },
    {
      title: "TỶ LỆ HOÀN THÀNH",
      value: `${welcomeStats.completionRate || 0}%`,
      trend: "+4.1%",
      isUp: true,
      icon: (
        <AssignmentTurnedInRounded sx={{ color: "#10B981", fontSize: 22 }} />
      ),
      iconBg: "rgba(16,185,129,0.05)",
    },
  ];

  return (
    <Stack spacing={4.5} sx={{ width: "100%" }}>
      {/* 1. Header welcome */}
      <Box>
        <Typography
          variant="h4"
          sx={{ fontSize: 28, fontWeight: 900, color: COLORS.textDark }}
        >
          Báo cáo & Thống kê
        </Typography>
        <Typography
          sx={{ mt: 0.5, fontSize: 14.5, color: COLORS.textSecondary }}
        >
          {welcomeStats.subtitle}
        </Typography>
      </Box>

      {/* Horizontal Tab Navigation */}
      <Tabs
        value={adminActiveTab}
        onChange={(_, val) => setAdminActiveTab(val)}
        sx={{
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          "& .MuiTabs-indicator": {
            bgcolor: COLORS.primary,
            height: 3,
            borderRadius: "3px",
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: 14.5,
            fontWeight: 800,
            color: "rgba(31,41,55,0.5)",
            px: 2,
            pb: 1.5,
            "&.Mui-selected": { color: COLORS.primary },
          },
        }}
      >
        <Tab label="Thống kê tổng quan" />
        <Tab label="Duyệt giảng viên" />
      </Tabs>

      {adminActiveTab === 0 && (
        <>
          {/* 2. Indicators Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr 1fr",
              },
              gap: 3,
            }}
          >
            {cardStats.map((stat, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: COLORS.white,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  position: "relative",
                }}
              >
                {/* Header info */}
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: "rgba(31,41,55,0.4)",
                      letterSpacing: "0.4px",
                    }}
                  >
                    {stat.title}
                  </Typography>
                  {/* Trend */}
                  <ChipTrend value={stat.trend} isUp={stat.isUp} />
                </Stack>

                {/* Content info */}
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    mt: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: COLORS.textDark,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "12px",
                      bgcolor: stat.iconBg,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>

          {/* 3. Revenue Trend Chart */}
          <RevenueLineChart data={revenueTrend} />

          {/* 4. Split Row: Student growth & Best Selling */}
          <Grid container spacing={3.5} sx={{ width: "100%", m: 0 }}>
            <Grid size={{ xs: 12, md: 7 }} sx={{ p: 0 }}>
              <StudentGrowthChart data={studentGrowth} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ p: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: "24px",
                  border: "1px solid rgba(141,19,19,0.06)",
                  bgcolor: COLORS.white,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: COLORS.textDark, mb: 3 }}
                >
                  Khóa học bán chạy nhất
                </Typography>

                <Stack spacing={3}>
                  {bestSellingCourses.map((course: any, idx: number) => {
                    const colors = [COLORS.primary, "#7C3AED", "#0EA5E9"];
                    return (
                      <Stack key={idx} spacing={1}>
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                bgcolor: "rgba(0,0,0,0.04)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <StarRounded
                                sx={{ color: "#F59E0B", fontSize: 16 }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: COLORS.textDark,
                              }}
                            >
                              {course.title}
                            </Typography>
                          </Stack>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: COLORS.textDark,
                            }}
                          >
                            {course.percentage}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={course.percentage}
                          sx={{
                            height: 6,
                            borderRadius: "3px",
                            bgcolor: "rgba(0,0,0,0.04)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: "3px",
                              bgcolor: colors[idx % colors.length],
                            },
                          }}
                        />
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* 5. Split Row: Heatmap & Recent activity */}
          <Grid container spacing={3.5} sx={{ width: "100%", m: 0 }}>
            <Grid size={{ xs: 12, md: 7 }} sx={{ p: 0 }}>
              <LearningActivityHeatmap data={heatmap} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ p: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: "24px",
                  border: "1px solid rgba(141,19,19,0.06)",
                  bgcolor: COLORS.white,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: COLORS.textDark, mb: 3 }}
                >
                  Hoạt động trực tuyến
                </Typography>

                <Stack spacing={2.5}>
                  {recentActivities.map((act: any, idx: number) => {
                    const getIconColor = () => {
                      if (act.type === "registration") return COLORS.green;
                      if (act.type === "quiz") return "#3B82F6";
                      return "#F59E0B";
                    };
                    return (
                      <Stack
                        key={idx}
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <FiberManualRecordRounded
                          sx={{
                            color: getIconColor(),
                            fontSize: 12,
                            mt: 0.5,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: COLORS.textDark,
                              lineHeight: 1.3,
                            }}
                          >
                            {act.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 11.5,
                              color: "rgba(31,41,55,0.4)",
                              mt: 0.5,
                              fontWeight: 600,
                            }}
                          >
                            {act.time} • {act.subtitle}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {adminActiveTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: COLORS.white,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: COLORS.textDark, mb: 1 }}
          >
            Danh sách yêu cầu nâng cấp Giảng viên
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(31,41,55,0.5)", mb: 3 }}>
            Xem xét và phê duyệt hoặc từ chối các yêu cầu nâng cấp vai trò từ
            Học viên.
          </Typography>

          {loadingRequests ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Box>
          ) : requests.length === 0 ? (
            <Typography
              sx={{
                py: 6,
                color: "rgba(31,41,55,0.4)",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Không có yêu cầu nâng cấp nào.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13.5px",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid rgba(0,0,0,0.06)",
                      color: "rgba(31,41,55,0.5)",
                      fontWeight: 800,
                    }}
                  >
                    <th style={{ padding: "12px 8px" }}>Học viên</th>
                    <th style={{ padding: "12px 8px" }}>Chuyên môn</th>
                    <th style={{ padding: "12px 8px" }}>Kinh nghiệm</th>
                    <th style={{ padding: "12px 8px" }}>Lý do</th>
                    <th style={{ padding: "12px 8px" }}>Trạng thái</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    >
                      <td style={{ padding: "16px 8px" }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: COLORS.textDark,
                          }}
                        >
                          {req.hoTen || req.userName}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "11px",
                            color: "rgba(31,41,55,0.4)",
                            fontWeight: 600,
                          }}
                        >
                          {req.email} • {req.phoneNumber || "Không có sđt"}
                        </Typography>
                      </td>
                      <td style={{ padding: "16px 8px", fontWeight: 600 }}>
                        {req.chuyenMon}
                      </td>
                      <td
                        style={{
                          padding: "16px 8px",
                          color: "rgba(31,41,55,0.7)",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={req.kinhNghiem}
                      >
                        {req.kinhNghiem}
                      </td>
                      <td
                        style={{
                          padding: "16px 8px",
                          color: "rgba(31,41,55,0.7)",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={req.lyDo}
                      >
                        {req.lyDo}
                      </td>
                      <td style={{ padding: "16px 8px" }}>
                        {req.status === 0 ? (
                          <Chip
                            label="Chờ duyệt"
                            size="small"
                            sx={{
                              bgcolor: "rgba(245, 158, 11, 0.08)",
                              color: "#D97706",
                              fontWeight: 700,
                            }}
                          />
                        ) : req.status === 1 ? (
                          <Chip
                            label="Đã duyệt"
                            size="small"
                            sx={{
                              bgcolor: "rgba(16, 185, 129, 0.08)",
                              color: "#059669",
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Từ chối"
                            size="small"
                            sx={{
                              bgcolor: "rgba(239, 68, 68, 0.08)",
                              color: "#DC2626",
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </td>
                      <td style={{ padding: "16px 8px", textAlign: "right" }}>
                        {req.status === 0 && (
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleApprove(req.id)}
                              sx={{
                                bgcolor: COLORS.green,
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: "8px",
                                "&:hover": { bgcolor: "#059669" },
                              }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedRequest(req);
                                setDialogOpen(true);
                              }}
                              sx={{
                                color: COLORS.primary,
                                borderColor: COLORS.primary,
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: "8px",
                                "&:hover": {
                                  borderColor: COLORS.primaryDark,
                                  bgcolor: "rgba(141,19,19,0.04)",
                                },
                              }}
                            >
                              Từ chối
                            </Button>
                          </Stack>
                        )}
                        {req.status !== 0 && (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "rgba(31,41,55,0.4)",
                              fontWeight: 700,
                            }}
                          >
                            {req.status === 1 ? "Đã duyệt" : "Đã từ chối"}
                          </Typography>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </Paper>
      )}

      {/* Rejection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            sx={{ fontSize: 16.5, fontWeight: 900, color: COLORS.textDark }}
          >
            Từ chối yêu cầu nâng cấp giảng viên
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: 13,
              color: "rgba(31,41,55,0.6)",
              mb: 2,
              lineHeight: 1.5,
            }}
          >
            Nhập lý do phản hồi hoặc ý kiến từ chối gửi đến học viên:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Lý do từ chối"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Ví dụ: Hồ sơ chuyên môn chưa phù hợp với yêu cầu của hệ thống."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: "rgba(31,41,55,0.5)", fontWeight: 800 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            sx={{
              bgcolor: COLORS.primary,
              color: "#fff",
              fontWeight: 800,
              borderRadius: "10px",
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: COLORS.primaryDark, boxShadow: "none" },
            }}
          >
            Từ chối yêu cầu
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// Trend badge component
function ChipTrend({ value, isUp }: { value: string; isUp: boolean | null }) {
  if (isUp === null) {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          bgcolor: "rgba(156,163,175,0.08)",
          color: COLORS.grey,
          borderRadius: "50px",
          px: 1,
          py: 0.4,
          alignItems: "center",
        }}
      >
        <TrendingFlatRounded sx={{ fontSize: 13 }} />
        <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{value}</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{
        bgcolor: isUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
        color: isUp ? COLORS.green : "#EF4444",
        borderRadius: "50px",
        px: 1,
        py: 0.4,
        alignItems: "center",
      }}
    >
      <TrendingUpRounded
        sx={{ fontSize: 13, transform: isUp ? "none" : "rotate(90deg)" }}
      />
      <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{value}</Typography>
    </Stack>
  );
}
