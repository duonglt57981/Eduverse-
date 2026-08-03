/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { COLORS } from "@/src/theme/tokens";

import { useEffect, useMemo, useState } from "react";
import { apiService } from "@/src/services/index";
import CvViewerDialog from "@/src/components/common/CvViewerDialog";
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
  VisibilityRounded as VisibilityRoundedIcon,
} from "@mui/icons-material";

// Crimson palette matches the design theme

// SVG-based monthly revenue line chart
function RevenueLineChart({
  data,
  labels,
  period,
  onPeriodChange,
  lastUpdated,
}: {
  data: number[];
  labels: string[];
  period: string;
  onPeriodChange: (p: string) => void;
  lastUpdated: Date | null;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 1000;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 40;
  const paddingBottom = 40;

  const maxVal = Math.max(...data, 1000000);
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingLeft - paddingRight;

  const points = useMemo(() => {
    return data.map((val, idx) => {
      const x = paddingLeft + (idx * chartWidth) / (data.length - 1);
      const y = height - paddingBottom - (val / maxVal) * chartHeight;
      return { x, y, val };
    });
  }, [data, chartWidth, chartHeight, maxVal]);

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

  const fillPath = useMemo(() => {
    if (points.length === 0) return "";
    return `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }, [points, linePath]);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // Cả trục dùng CHUNG một đơn vị, chọn theo giá trị lớn nhất.
  // Trước đây mỗi vạch tự chọn đơn vị nên trục lẫn lộn "2 tr" với "505,800",
  // và hai vạch khác nhau cùng làm tròn thành "2 tr".
  const yUnit =
    maxVal >= 1000000000
      ? { chia: 1000000000, ten: " tỷ", le: 2 }
      : maxVal >= 1000000
        ? { chia: 1000000, ten: " tr", le: 2 }
        : maxVal >= 1000
          ? { chia: 1000, ten: " N", le: 1 }
          : { chia: 1, ten: "", le: 0 };

  const formatYLabel = (val: number) => {
    if (val === 0) return "0";
    const v = val / yUnit.chia;
    // Bỏ số 0 thừa ở cuối phần thập phân: 2.50 -> 2,5
    const so = v.toFixed(yUnit.le).replace(/\.?0+$/, "");
    return so.replace(".", ",") + yUnit.ten;
  };

  // Format giá trị hiển thị trong tooltip
  const formatTooltipVal = (val: number) => {
    if (val === 0) return "0đ";
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + " tỷ đ";
    if (val >= 1000000) return (val / 1000000).toFixed(1) + " tr đ";
    return val.toLocaleString("vi-VN") + "đ";
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
          <Typography
            sx={{
              fontSize: 13,
              color: "var(--ev-text-muted, rgba(31,41,55,0.48))",
            }}
          >
            {period === "month"
              ? "Doanh thu nền tảng (30%) theo từng ngày trong tháng này."
              : period === "quarter"
                ? "Doanh thu nền tảng (30%) theo từng tháng trong quý này."
                : "Doanh thu nền tảng (30%) theo từng tháng trong năm nay."}
          </Typography>

        </Box>
        <Tabs
          value={period}
          onChange={(_, val) => onPeriodChange(val)}
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
              color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
              transition: "color 200ms",
              "&.Mui-selected": { color: "#FFFFFF" },
            },
          }}
        >
          <Tab value="month" label="Tháng này" />
          <Tab value="quarter" label="Quý này" />
          <Tab value="year" label="Năm này" />
        </Tabs>
      </Stack>

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
                  fill="var(--ev-text-muted, rgba(31,41,55,0.4))"
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

          {/* Vertical guide line when hovered */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <line
              x1={points[hoveredIdx].x}
              y1={paddingTop}
              x2={points[hoveredIdx].x}
              y2={height - paddingBottom}
              stroke="rgba(141,19,19,0.2)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
          )}

          {/* Fill */}
          <path d={fillPath} fill="url(#chartGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.primary}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;

            // Tính vị trí tooltip: tránh bị cắt ở 2 cạnh trái/phải
            const tooltipW = 140;
            const tooltipH = 52;
            let tx = p.x - tooltipW / 2;
            if (tx < paddingLeft) tx = paddingLeft;
            if (tx + tooltipW > width - paddingRight)
              tx = width - paddingRight - tooltipW;
            // Tránh bị cắt trên cùng
            const ty =
              p.y < paddingTop + tooltipH + 16 ? p.y + 16 : p.y - tooltipH - 12;
            const arrowUp = ty > p.y; // mũi tên hướng lên khi tooltip ở dưới điểm

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Vùng hit vô hình rộng hơn để dễ hover */}
                <rect
                  x={p.x - 20}
                  y={paddingTop}
                  width={40}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    {/* Box nền */}
                    <rect
                      x={tx}
                      y={ty}
                      width={tooltipW}
                      height={tooltipH}
                      rx={10}
                      ry={10}
                      fill="var(--ev-text-primary, #1F2937)"
                      style={{
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
                      }}
                    />
                    {/* Mũi tên */}
                    {arrowUp ? (
                      // Tooltip ở dưới điểm → mũi tên chỉ lên
                      <polygon
                        points={`${p.x - 7},${ty} ${p.x + 7},${ty} ${p.x},${ty - 8}`}
                        fill="var(--ev-text-primary, #1F2937)"
                      />
                    ) : (
                      // Tooltip ở trên điểm → mũi tên chỉ xuống
                      <polygon
                        points={`${p.x - 7},${ty + tooltipH} ${p.x + 7},${ty + tooltipH} ${p.x},${ty + tooltipH + 8}`}
                        fill="var(--ev-text-primary, #1F2937)"
                      />
                    )}
                    {/* Label tháng */}
                    <text
                      x={tx + tooltipW / 2}
                      y={ty + 20}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.55)"
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fontFamily: '"Be Vietnam Pro"',
                      }}
                    >
                      {period === "month"
                        ? `Ngày ${labels[idx] ?? idx + 1}`
                        : `Tháng ${(labels[idx] ?? "").replace("Th", "") || idx + 1}`}
                    </text>
                    {/* Giá trị */}
                    <text
                      x={tx + tooltipW / 2}
                      y={ty + 38}
                      textAnchor="middle"
                      fill="var(--ev-paper, #FFFFFF)"
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        fontFamily: '"Be Vietnam Pro"',
                      }}
                    >
                      {formatTooltipVal(p.val)}
                    </text>
                  </g>
                )}

                {/* Circle data point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 4}
                  fill={isHovered ? COLORS.primaryLight : COLORS.primary}
                  stroke={COLORS.white}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{ transition: "r 120ms, fill 120ms" }}
                />

                {/* Month label */}
                <text
                  x={p.x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  fill={
                    isHovered
                      ? COLORS.primary
                      : "var(--ev-text-muted, rgba(31,41,55,0.5))"
                  }
                  style={{
                    fontSize: 11,
                    fontWeight: isHovered ? 800 : 600,
                    fontFamily: '"Be Vietnam Pro"',
                    transition: "fill 120ms",
                  }}
                >
                  {labels[idx] ?? String(idx + 1)}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Paper>
  );
}

// SVG bar chart for student growth
function StudentGrowthChart({ data }: { data: number[] }) {
  const maxVal = Math.max(...data, 1);
  const labels = ["Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11"];
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Tính nhãn 7 tháng gần nhất từ hiện tại
  const monthLabels = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      return `Th${d.getMonth() + 1}`;
    });
  }, []);

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
        sx={{ fontWeight: 800, color: COLORS.textDark, mb: 0.5 }}
      >
        Tăng trưởng học viên
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          color: "var(--ev-text-muted, rgba(31,41,55,0.48))",
          mb: 3,
        }}
      >
        Số học viên unique đăng ký khóa học theo từng tháng.
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
          const isHovered = hoveredIdx === idx;
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;

          return (
            <Stack
              key={idx}
              spacing={0}
              sx={{
                alignItems: "center",
                flex: 1,
                position: "relative",
                height: "100%",
                justifyContent: "flex-end",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip phía trên cột */}
              {isHovered && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: `calc(${pct}% + 36px)`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "var(--ev-text-primary, #1F2937)",
                    color: "#FFFFFF",
                    borderRadius: "10px",
                    px: 1.5,
                    py: 0.8,
                    fontSize: 12,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    zIndex: 20,
                    pointerEvents: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                    // Mũi tên chỉ xuống
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderWidth: "6px 6px 0",
                      borderStyle: "solid",
                      borderColor: "#1F2937 transparent transparent",
                    },
                  }}
                >
                  {val.toLocaleString("vi-VN")} HV
                </Box>
              )}

              {/* Cột bar */}
              <Box
                sx={{
                  width: { xs: 22, sm: 30 },
                  height: `${Math.max(pct, 2)}%`,
                  borderRadius: "8px 8px 4px 4px",
                  background: isHovered
                    ? `linear-gradient(180deg, #DC2626 0%, ${COLORS.primary} 100%)`
                    : isLatest
                      ? `linear-gradient(180deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 100%)`
                      : "rgba(141,19,19,0.10)",
                  transition:
                    "height 400ms cubic-bezier(0.4,0,0.2,1), background 150ms",
                  boxShadow: isHovered
                    ? "0 6px 20px rgba(141,19,19,0.25)"
                    : "none",
                  mb: 1.5,
                }}
              />

              {/* Label tháng */}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: isHovered || isLatest ? 800 : 600,
                  color: isHovered
                    ? COLORS.primary
                    : isLatest
                      ? COLORS.primary
                      : "var(--ev-text-muted, rgba(31,41,55,0.4))",
                  transition: "color 150ms",
                  lineHeight: 1,
                }}
              >
                {monthLabels[idx] ?? labels[idx]}
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
      <Typography
        sx={{
          fontSize: 13,
          color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
          mb: 3,
        }}
      >
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
                color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
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
                      borderColor: "var(--ev-divider, rgba(0,0,0,0.1))",
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
          color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
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
  const [invoiceTotal, setInvoiceTotal] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  // Hộp thoại xem chi tiết yêu cầu nâng cấp giảng viên
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<any>(null);
  // Trình xem hồ sơ CV ngay trong trang, không phải rời đi tab khác
  const [cvOpen, setCvOpen] = useState(false);
  // Bộ lọc yêu cầu theo trạng thái: "all" | 0 (chờ duyệt) | 1 (đã duyệt) | 2 (đã từ chối)
  const [statusFilter, setStatusFilter] = useState<"all" | 0 | 1 | 2>("all");
  // Khoảng thời gian của biểu đồ doanh thu: month | quarter | year
  const [revenuePeriod, setRevenuePeriod] = useState("year");
  // Mốc lần lấy dữ liệu gần nhất, để hiển thị "Cập nhật lúc ..."
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
    const fetchInvoiceTotal = async () => {
      try {
        const res = await apiService.get<any>(
          "/ThanhToan/admin/tong-doanh-thu",
        );
        if (res.status && res.data != null) {
          const raw =
            typeof res.data === "number"
              ? res.data
              : (res.data.tongTien ??
                res.data.total ??
                res.data.totalAmount ??
                0);
          setInvoiceTotal(raw);
        }
      } catch {
        /* silent */
      }
    };
    void fetchInvoiceTotal();
  }, []);

  useEffect(() => {
    if (adminActiveTab === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRequests();
    }
  }, [adminActiveTab]);

  useEffect(() => {
    let huy = false;

    // silent = làm mới ngầm, không bật màn hình chờ để biểu đồ không nhấp nháy
    const fetchAdminData = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await apiService.get<any>(
          `/dashboard?role=Admin&period=${revenuePeriod}`,
        );
        if (huy) return;
        if (res.status && res.data) {
          setDashboardData(res.data);
          setLastUpdated(new Date());
          setError(null);
        } else if (!silent) {
          setError(res.message || "Không thể lấy dữ liệu Admin Dashboard");
        }
      } catch (err: any) {
        if (huy || silent) return;
        setError(
          typeof err === "string" ? err : "Đã xảy ra lỗi khi tải dữ liệu",
        );
      } finally {
        if (!huy && !silent) setLoading(false);
      }
    };

    fetchAdminData();

    // Làm mới ngầm mỗi 30 giây để số liệu bám sát thực tế
    const dinhKy = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      void fetchAdminData(true);
    }, 30000);

    // Quay lại tab sau khi rời đi thì lấy lại ngay, không đợi hết 30 giây
    const khiHienLai = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        void fetchAdminData(true);
      }
    };
    document.addEventListener("visibilitychange", khiHienLai);

    return () => {
      huy = true;
      clearInterval(dinhKy);
      document.removeEventListener("visibilitychange", khiHienLai);
    };
  }, [revenuePeriod]);

  // Danh sách sau khi lọc + số lượng từng trạng thái (tính tại chỗ, không gọi thêm API)
  const requestCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 0).length,
    approved: requests.filter((r) => r.status === 1).length,
    rejected: requests.filter((r) => r.status === 2).length,
  };
  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

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

  // Destructure with default values to prevent undefined errors
  const {
    welcomeStats,
    revenueTrend,
    revenueLabels,
    studentGrowth,
    bestSellingCourses,
    heatmap,
    recentActivities,
  } = dashboardData;

  // % xu hướng THẬT từ API (không fix cứng)
  const fmtTrend = (p: number) => `${(p ?? 0) > 0 ? "+" : ""}${p ?? 0}%`;
  const trendUp = (p: number) =>
    (p ?? 0) > 0 ? true : (p ?? 0) < 0 ? false : null;

  const cardStats = [
    {
      title: "DOANH THU NỀN TẢNG (30%)",
      value: invoiceTotal.toLocaleString("vi-VN") + "đ",
      // thêm tooltip để thấy số gốc
      trend: fmtTrend(welcomeStats.revenueTrendPct),
      isUp: trendUp(welcomeStats.revenueTrendPct),
      icon: (
        <MonetizationOnRounded sx={{ color: COLORS.primary, fontSize: 22 }} />
      ),
      iconBg: "rgba(141,19,19,0.05)",
    },
    {
      title: "TỔNG HỌC VIÊN",
      value: (welcomeStats.totalStudents || 0).toLocaleString(),
      trend: fmtTrend(welcomeStats.studentsTrendPct),
      isUp: trendUp(welcomeStats.studentsTrendPct),
      icon: <PeopleRounded sx={{ color: "#7C3AED", fontSize: 22 }} />,
      iconBg: "rgba(124,58,237,0.05)",
    },
    {
      title: "TỔNG KHÓA HỌC",
      value: (welcomeStats.totalCourses || 0).toString(),
      trend: fmtTrend(welcomeStats.coursesTrendPct),
      isUp: trendUp(welcomeStats.coursesTrendPct),
      icon: <SchoolRounded sx={{ color: "#0EA5E9", fontSize: 22 }} />,
      iconBg: "rgba(14,165,233,0.05)",
    },
    {
      title: "TỶ LỆ HOÀN THÀNH",
      value: `${welcomeStats.completionRate || 0}%`,
      trend: fmtTrend(welcomeStats.completionTrendPct),
      isUp: trendUp(welcomeStats.completionTrendPct),
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
            color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
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
                      color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
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
          <RevenueLineChart
            data={revenueTrend}
            labels={revenueLabels ?? []}
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
            lastUpdated={lastUpdated}
          />

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
                              color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
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
          <Typography
            sx={{
              fontSize: 13,
              color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
              mb: 3,
            }}
          >
            Xem xét và phê duyệt hoặc từ chối các yêu cầu nâng cấp vai trò từ
            Học viên.
          </Typography>

          {/* Bộ lọc theo trạng thái */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: "wrap", rowGap: 1, mb: 2.5 }}
          >
            {(
              [
                { key: "all", label: "Tất cả", count: requestCounts.all },
                { key: 0, label: "Chờ duyệt", count: requestCounts.pending },
                { key: 1, label: "Đã duyệt", count: requestCounts.approved },
                { key: 2, label: "Đã từ chối", count: requestCounts.rejected },
              ] as const
            ).map((opt) => {
              const active = statusFilter === opt.key;
              return (
                <Chip
                  key={String(opt.key)}
                  label={`${opt.label} (${opt.count})`}
                  onClick={() => setStatusFilter(opt.key)}
                  sx={{
                    fontWeight: 800,
                    fontSize: 12.5,
                    borderRadius: "10px",
                    cursor: "pointer",
                    color: active ? "#FFFFFF" : COLORS.textSecondary,
                    bgcolor: active
                      ? COLORS.primary
                      : "var(--ev-paper-alt, rgba(0,0,0,0.035))",
                    border: active
                      ? "1px solid transparent"
                      : "1px solid var(--ev-divider, rgba(0,0,0,0.10))",
                    "&:hover": {
                      bgcolor: active
                        ? COLORS.primaryDark
                        : "var(--ev-hover, rgba(141,19,19,0.06))",
                    },
                  }}
                />
              );
            })}
          </Stack>

          {loadingRequests ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
              <CircularProgress sx={{ color: COLORS.primary }} />
            </Box>
          ) : filteredRequests.length === 0 ? (
            <Typography
              sx={{
                py: 6,
                color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {requests.length === 0
                ? "Không có yêu cầu nâng cấp nào."
                : "Không có yêu cầu nào ở trạng thái này."}
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
                      color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                      fontWeight: 800,
                    }}
                  >
                    <th style={{ padding: "12px 8px" }}>Học viên</th>
                    <th style={{ padding: "12px 8px" }}>Chuyên môn</th>
                    <th style={{ padding: "12px 8px" }}>Trạng thái</th>
                    <th style={{ padding: "12px 8px", textAlign: "center" }}>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
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
                            color: "var(--ev-text-muted, rgba(31,41,55,0.4))",
                            fontWeight: 600,
                          }}
                        >
                          {req.email} • {req.phoneNumber || "Không có sđt"}
                        </Typography>
                      </td>
                      <td
                        style={{
                          padding: "16px 8px",
                          fontWeight: 600,
                          maxWidth: 320,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={req.chuyenMon}
                      >
                        {req.chuyenMon}
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
                      <td style={{ padding: "16px 8px", textAlign: "center" }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "nowrap",
                          }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setDetailRequest(req);
                              setDetailOpen(true);
                            }}
                            sx={{
                              ...ACTION_BTN,
                              color: COLORS.textSecondary,
                              borderColor:
                                "var(--ev-divider, rgba(0,0,0,0.14))",
                              "&:hover": {
                                color: COLORS.primary,
                                borderColor: COLORS.primary,
                                bgcolor:
                                  "var(--ev-hover, rgba(141,19,19,0.04))",
                              },
                            }}
                          >
                            Chi tiết
                          </Button>

                          {req.status === 0 && (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                onClick={() => handleApprove(req.id)}
                                sx={{
                                  ...ACTION_BTN,
                                  bgcolor: COLORS.green,
                                  color: "#FFFFFF",
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
                                  ...ACTION_BTN,
                                  color: COLORS.primary,
                                  borderColor:
                                    "var(--ev-brand-border, rgba(141,19,19,0.32))",
                                  "&:hover": {
                                    borderColor: COLORS.primary,
                                    bgcolor:
                                      "var(--ev-brand-tint, rgba(141,19,19,0.05))",
                                  },
                                }}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
                        </Stack>
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
              color: "var(--ev-text-secondary, rgba(31,41,55,0.6))",
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
            sx={{
              color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
              fontWeight: 800,
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            sx={{
              bgcolor: COLORS.primary,
              color: "#FFFFFF",
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

      {/* Trình xem hồ sơ CV */}
      <CvViewerDialog
        open={cvOpen}
        onClose={() => setCvOpen(false)}
        cvUrl={detailRequest?.cvUrl}
        hoTen={detailRequest?.hoTen || detailRequest?.userName}
        requestId={detailRequest?.id}
      />

      {/* Hộp thoại xem chi tiết yêu cầu nâng cấp giảng viên */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Stack spacing={0.3}>
              <Typography
                sx={{ fontSize: 17, fontWeight: 900, color: COLORS.textDark }}
              >
                Chi tiết yêu cầu nâng cấp giảng viên
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
                  fontWeight: 600,
                }}
              >
                {detailRequest?.createdDate
                  ? `Gửi ngày ${new Date(detailRequest.createdDate).toLocaleString("vi-VN")}`
                  : "Hồ sơ đăng ký trở thành giảng viên"}
              </Typography>
            </Stack>
            <Chip
              size="small"
              label={
                detailRequest?.status === 1
                  ? "Đã duyệt"
                  : detailRequest?.status === 2
                    ? "Đã từ chối"
                    : "Chờ duyệt"
              }
              sx={{
                fontWeight: 800,
                fontSize: 11.5,
                color:
                  detailRequest?.status === 1
                    ? COLORS.green
                    : detailRequest?.status === 2
                      ? COLORS.primary
                      : "#EA580C",
                bgcolor:
                  detailRequest?.status === 1
                    ? "rgba(22,163,74,0.12)"
                    : detailRequest?.status === 2
                      ? "rgba(141,19,19,0.12)"
                      : "rgba(234,88,12,0.12)",
              }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{ borderColor: "var(--ev-divider, rgba(0,0,0,0.08))" }}
        >
          {detailRequest && (
            <Stack spacing={2.2} sx={{ py: 0.5 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2.2}
                sx={{ flexWrap: "wrap" }}
              >
                <DetailField
                  label="Học viên"
                  value={detailRequest.hoTen || detailRequest.userName}
                  flex
                />
                <DetailField label="Email" value={detailRequest.email} flex />
                <DetailField
                  label="Số điện thoại"
                  value={detailRequest.phoneNumber}
                  flex
                />
              </Stack>

              <DetailField label="Chuyên môn" value={detailRequest.chuyenMon} />
              <DetailField
                label="Kinh nghiệm giảng dạy"
                value={detailRequest.kinhNghiem}
              />
              <DetailField
                label="Bằng cấp / Chứng chỉ"
                value={detailRequest.bangCap}
              />
              <DetailField
                label="Lý do muốn trở thành giảng viên"
                value={detailRequest.lyDo}
              />

              <Stack spacing={0.6}>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 900,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
                  }}
                >
                  Hồ sơ CV
                </Typography>
                {detailRequest.cvUrl ? (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disableElevation
                      startIcon={<VisibilityRoundedIcon sx={{ fontSize: 17 }} />}
                      onClick={() => setCvOpen(true)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 800,
                        borderRadius: "10px",
                        bgcolor: COLORS.primary,
                        color: "#fff",
                        "&:hover": { bgcolor: COLORS.primaryDark },
                      }}
                    >
                      Xem CV
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        window.open(detailRequest.cvUrl, "_blank", "noopener,noreferrer")
                      }
                      sx={{
                        textTransform: "none",
                        fontWeight: 800,
                        borderRadius: "10px",
                        color: COLORS.primary,
                        borderColor: "var(--ev-brand-border, rgba(141,19,19,0.25))",
                      }}
                    >
                      Mở tab mới
                    </Button>
                  </Stack>
                ) : (
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      fontStyle: "italic",
                      color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
                    }}
                  >
                    Học viên chưa đính kèm CV
                  </Typography>
                )}
              </Stack>

              {detailRequest.adminNotes && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    bgcolor: "var(--ev-brand-tint, rgba(141,19,19,0.05))",
                    border:
                      "1px solid var(--ev-brand-border, rgba(141,19,19,0.14))",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 900,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: COLORS.primary,
                      mb: 0.6,
                    }}
                  >
                    Phản hồi của quản trị viên
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      color: COLORS.textDark,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {detailRequest.adminNotes}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{
              color: "var(--ev-text-muted, rgba(31,41,55,0.5))",
              fontWeight: 800,
              textTransform: "none",
            }}
          >
            Đóng
          </Button>
          {detailRequest?.status === 0 && (
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedRequest(detailRequest);
                  setDetailOpen(false);
                  setDialogOpen(true);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "10px",
                  color: COLORS.primary,
                  borderColor: "var(--ev-brand-border, rgba(141,19,19,0.28))",
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleApprove(detailRequest.id);
                  setDetailOpen(false);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "10px",
                  bgcolor: COLORS.green,
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": { bgcolor: COLORS.green, opacity: 0.9 },
                }}
              >
                Duyệt yêu cầu
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// Kiểu dùng chung cho các nút ở cột "Thao tác" — giữ chiều cao và bề rộng đồng nhất
const ACTION_BTN = {
  textTransform: "none" as const,
  whiteSpace: "nowrap" as const,
  fontWeight: 800,
  fontSize: 12.5,
  borderRadius: "8px",
  minWidth: 82,
  height: 32,
  px: 1.5,
  boxShadow: "none",
};

// Ô hiển thị một trường thông tin trong hộp thoại chi tiết
function DetailField({
  label,
  value,
  flex,
}: {
  label: string;
  value?: string | null;
  flex?: boolean;
}) {
  return (
    <Stack spacing={0.6} sx={flex ? { flex: 1, minWidth: 180 } : undefined}>
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 900,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "var(--ev-text-muted, rgba(31,41,55,0.45))",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 13.5,
          lineHeight: 1.65,
          fontWeight: 600,
          color: value
            ? COLORS.textDark
            : "var(--ev-text-muted, rgba(31,41,55,0.45))",
          fontStyle: value ? "normal" : "italic",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value || "Không có thông tin"}
      </Typography>
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
        color: isUp ? COLORS.green : "#DC2626",
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
