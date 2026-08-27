/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PercentIcon from "@mui/icons-material/Percent";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import { useState, useEffect, useCallback, useMemo } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import LoiMoiGiangVienService, {
  LoiMoiChoXacNhanDto,
  LoiMoiKhuyenMaiChoXacNhanDto,
} from "@/src/services/LoiMoiGiangVienService";
import { BRAND, NEUTRAL, STATUS } from "@/src/theme/tokens";

// Danh sách quyền với icon và nhãn trực quan
const DANH_SACH_QUYEN_HIEN_THI = [
  {
    key: "manage",
    nhan: "Quản lý nội dung",
    icon: ArticleOutlinedIcon,
    mota: "Chỉnh sửa bài học, chương học và video",
  },
  {
    key: "performance",
    nhan: "Xem thống kê",
    icon: PieChartOutlinedIcon,
    mota: "Xem báo cáo doanh thu & học viên",
  },
  {
    key: "qnA",
    nhan: "Hỏi đáp (Q&A)",
    icon: ForumOutlinedIcon,
    mota: "Trả lời thắc mắc của học viên",
  },
  {
    key: "reviews",
    nhan: "Đánh giá",
    icon: RateReviewOutlinedIcon,
    mota: "Xem và phản hồi đánh giá khóa học",
  },
  {
    key: "assignments",
    nhan: "Bài tập & Quiz",
    icon: AssignmentOutlinedIcon,
    mota: "Chấm điểm và tạo câu hỏi kiểm tra",
  },
  {
    key: "materials",
    nhan: "Tài liệu học tập",
    icon: DescriptionOutlinedIcon,
    mota: "Tải lên và quản lý tài liệu đính kèm",
  },
  {
    key: "promotions",
    nhan: "Khuyến mãi",
    icon: LocalOfferIcon,
    mota: "Tạo và theo dõi các mã giảm giá",
  },
];

// Badge trạng thái thiết kế sắc nét
function TrangThaiChip({ trangThai }: { trangThai: string }) {
  const map: Record<
    string,
    { nhan: string; mau: string; nen: string; vieng: string; icon: any }
  > = {
    Pending: {
      nhan: "Chờ xác nhận",
      mau: "#B45309",
      nen: "#FEF3C7",
      vieng: "#FDE68A",
      icon: HourglassEmptyIcon,
    },
    Accepted: {
      nhan: "Đã chấp nhận",
      mau: "#15803D",
      nen: "#DCFCE7",
      vieng: "#BBF7D0",
      icon: CheckCircleOutlinedIcon,
    },
    Rejected: {
      nhan: "Đã từ chối",
      mau: "#B91C1C",
      nen: "#FEE2E2",
      vieng: "#FECACA",
      icon: CancelOutlinedIcon,
    },
  };

  const cfg = map[trangThai] ?? {
    nhan: trangThai,
    mau: "#475569",
    nen: "#F1F5F9",
    vieng: "#E2E8F0",
    icon: InfoOutlinedIcon,
  };

  const IconComp = cfg.icon;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: "999px",
        bgcolor: cfg.nen,
        border: `1px solid ${cfg.vieng}`,
        color: cfg.mau,
        fontWeight: 700,
        fontSize: "0.78rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <IconComp sx={{ fontSize: 14 }} />
      <span>{cfg.nhan}</span>
    </Box>
  );
}

// ── THIẾT KẾ MỚI: Card Yêu cầu Áp dụng Khuyến mại ──────────────────────────
function LoiMoiKhuyenMaiCard({
  loiMoi,
  dangXuLy,
  onPhanHoi,
}: {
  loiMoi: LoiMoiKhuyenMaiChoXacNhanDto;
  dangXuLy: boolean;
  onPhanHoi: (id: string, dongY: boolean) => void;
}) {
  const isPending = loiMoi.trangThai === "Pending";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: `1px solid ${isPending ? "rgba(139, 19, 19, 0.2)" : "#E2E8F0"}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        p: { xs: 2.5, sm: 3 },
        position: "relative",
        boxShadow: isPending
          ? "0 10px 25px -8px rgba(139, 19, 19, 0.08)"
          : "0 2px 8px rgba(0, 0, 0, 0.02)",
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: isPending ? BRAND.main : "#CBD5E1",
          transform: isPending ? "translateY(-2px)" : "none",
          boxShadow: isPending
            ? "0 14px 30px -8px rgba(139, 19, 19, 0.14)"
            : "0 4px 12px rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      {isPending && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: BRAND.main,
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {/* Course Thumbnail */}
        <Box
          sx={{
            width: { xs: "100%", sm: 72 },
            height: { xs: 120, sm: 72 },
            borderRadius: "16px",
            flexShrink: 0,
            bgcolor: "#F8FAFC",
            overflow: "hidden",
            position: "relative",
            border: "1px solid #E2E8F0",
          }}
        >
          {loiMoi.hinhAnhKhoaHoc ? (
            <Image
              src={loiMoi.hinhAnhKhoaHoc}
              alt={loiMoi.tenKhoaHoc || "Khóa học"}
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#F1F5F9",
              }}
            >
              <SchoolOutlinedIcon sx={{ color: "#94A3B8", fontSize: 32 }} />
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              mb: 0.75,
              flexWrap: "wrap",
            }}
          >
            {/* Voucher code badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.4,
                borderRadius: "8px",
                bgcolor: "#FEF2F2",
                border: "1px dashed #F87171",
                color: BRAND.main,
                fontWeight: 800,
                fontSize: "0.82rem",
                letterSpacing: "0.03em",
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 14 }} />
              <span>{loiMoi.maGiamGia || "DEAL"}</span>
            </Box>

            {/* Discount percentage */}
            <Chip
              label={`GIẢM ${loiMoi.phanTramGiam}%`}
              size="small"
              sx={{
                backgroundColor: BRAND.main,
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.75rem",
                borderRadius: "6px",
                height: 24,
              }}
            />

            {!isPending && <TrangThaiChip trangThai={loiMoi.trangThai} />}
          </Box>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.02rem",
              color: "#0F172A",
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {loiMoi.tenKhoaHoc}
          </Typography>

          <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
            Quản trị viên{" "}
            <strong style={{ color: "#1E293B", fontWeight: 700 }}>
              {loiMoi.tenNguoiMoi || "EduVerse Admin"}
            </strong>{" "}
            muốn áp dụng chương trình khuyến mãi này cho khóa học của bạn.
          </Typography>
        </Box>

        {/* Actions */}
        {isPending ? (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignSelf: { xs: "stretch", sm: "center" },
              justifyContent: { xs: "flex-end", sm: "flex-start" },
            }}
          >
            <Button
              variant="outlined"
              size="medium"
              startIcon={
                dangXuLy ? <CircularProgress size={16} color="inherit" /> : <CloseIcon />
              }
              disabled={dangXuLy}
              onClick={() => onPhanHoi(loiMoi.id, false)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "12px",
                borderColor: "#FECACA",
                color: STATUS.error,
                bgcolor: "#FFFFFF",
                px: 2.5,
                "&:hover": {
                  bgcolor: "#FEF2F2",
                  borderColor: "#EF4444",
                },
              }}
            >
              Từ chối
            </Button>
            <Button
              variant="contained"
              size="medium"
              startIcon={
                dangXuLy ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <CheckIcon />
                )
              }
              disabled={dangXuLy}
              onClick={() => onPhanHoi(loiMoi.id, true)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: "12px",
                bgcolor: BRAND.main,
                px: 3,
                boxShadow: `0 4px 14px ${BRAND.main}30`,
                "&:hover": {
                  bgcolor: BRAND.dark,
                  boxShadow: `0 6px 18px ${BRAND.main}45`,
                },
              }}
            >
              Đồng ý
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8" }}>
              Đã xử lý
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ── THIẾT KẾ MỚI: Card Lời Mời Cộng Tác Giảng Dạy ─────────────────────────
function LoiMoiCard({
  loiMoi,
  dangXuLy,
  onOpenConfirm,
}: {
  loiMoi: LoiMoiChoXacNhanDto;
  dangXuLy: boolean;
  onOpenConfirm: (loiMoi: LoiMoiChoXacNhanDto, dongY: boolean) => void;
}) {
  const isPending = loiMoi.trangThai === "Pending";
  const quyenDuocCap = DANH_SACH_QUYEN_HIEN_THI.filter(
    (q) => (loiMoi as any)[q.key] === true,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: isPending
          ? "1.5px solid rgba(139, 19, 19, 0.25)"
          : "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isPending
          ? "0 12px 32px -8px rgba(139, 19, 19, 0.09), 0 4px 12px rgba(0, 0, 0, 0.03)"
          : "0 4px 16px rgba(0, 0, 0, 0.03)",
        "&:hover": {
          borderColor: isPending ? BRAND.main : "#CBD5E1",
          transform: "translateY(-3px)",
          boxShadow: isPending
            ? "0 18px 40px -10px rgba(139, 19, 19, 0.16), 0 6px 18px rgba(0, 0, 0, 0.04)"
            : "0 10px 24px -4px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      {/* ── Top Header Banner for Pending Invites ── */}
      {isPending ? (
        <Box
          sx={{
            background: "linear-gradient(90deg, #8B1313 0%, #A81B1B 45%, #6D0F0F 100%)",
            px: { xs: 2.5, sm: 3.5 },
            py: 1,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 13, color: "#FEF08A" }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.78rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Lời mời hợp tác mới chờ bạn phản hồi
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              opacity: 0.95,
              fontSize: "0.78rem",
              fontWeight: 500,
            }}
          >
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
            <span>{new Date(loiMoi.ngayMoi).toLocaleDateString("vi-VN")}</span>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 0.9,
            bgcolor: "#F8FAFC",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.76rem",
              color: "#64748B",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Lịch sử lời mời cộng tác
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
            Ngày mời: {new Date(loiMoi.ngayMoi).toLocaleDateString("vi-VN")}
          </Typography>
        </Box>
      )}

      {/* ── Main Body ── */}
      <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Course Info + Inviter Info Row */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "flex-start",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Course Thumbnail */}
          <Box
            sx={{
              width: { xs: "100%", md: 160 },
              height: { xs: 170, md: 105 },
              borderRadius: "18px",
              flexShrink: 0,
              bgcolor: "#F1F5F9",
              overflow: "hidden",
              position: "relative",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            {loiMoi.hinhAnhKhoaHoc ? (
              <Image
                src={loiMoi.hinhAnhKhoaHoc}
                alt={loiMoi.tenKhoaHoc || "Khóa học"}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#F8FAFC",
                  gap: 0.5,
                }}
              >
                <SchoolOutlinedIcon sx={{ color: "#94A3B8", fontSize: 36 }} />
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 600 }}>
                  EduVerse Course
                </Typography>
              </Box>
            )}
          </Box>

          {/* Details & Status */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                mb: 1.25,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.08rem", sm: "1.2rem" },
                  color: "#0F172A",
                  lineHeight: 1.35,
                  letterSpacing: "-0.015em",
                }}
              >
                {loiMoi.tenKhoaHoc || "Chưa có tên khóa học"}
              </Typography>
              <TrangThaiChip trangThai={loiMoi.trangThai} />
            </Box>

            {/* Inviter Info */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.25,
                p: "4px 12px 4px 4px",
                borderRadius: "999px",
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
              }}
            >
              <Avatar
                src={loiMoi.anhNguoiMoi || ""}
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: 13,
                  fontWeight: 800,
                  bgcolor: BRAND.main,
                  color: "#FFFFFF",
                }}
              >
                {loiMoi.tenNguoiMoi?.[0]?.toUpperCase() || "G"}
              </Avatar>
              <Typography sx={{ fontSize: "0.84rem", color: "#64748B" }}>
                Giảng viên mời:{" "}
                <strong style={{ color: "#0F172A", fontWeight: 700 }}>
                  {loiMoi.tenNguoiMoi || "Giảng viên chính"}
                </strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Key Highlights: Revenue Split & Public Listing ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
            mt: 3,
          }}
        >
          {/* Revenue Split Card */}
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
              border: "1px solid #FED7AA",
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.04)",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "#EA580C",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(234, 88, 12, 0.25)",
              }}
            >
              <PercentIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#9A3412",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Tỷ lệ chia doanh thu
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  color: "#C2410C",
                  lineHeight: 1.2,
                }}
              >
                {loiMoi.tyLeChiaDoanhThu}%
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9A3412", marginLeft: 6 }}>
                  trên mỗi đơn bán
                </span>
              </Typography>
            </Box>
          </Box>

          {/* Visibility Status Card */}
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              background: loiMoi.visible
                ? "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
                : "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
              border: `1px solid ${loiMoi.visible ? "#BBF7D0" : "#E2E8F0"}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: loiMoi.visible ? "#16A34A" : "#64748B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: loiMoi.visible
                  ? "0 4px 10px rgba(22, 163, 74, 0.25)"
                  : "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {loiMoi.visible ? (
                <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />
              ) : (
                <VisibilityOffOutlinedIcon sx={{ fontSize: 22 }} />
              )}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: loiMoi.visible ? "#166534" : "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Hiển thị giảng viên
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: loiMoi.visible ? "#15803D" : "#334155",
                  lineHeight: 1.3,
                }}
              >
                {loiMoi.visible
                  ? "Công khai trong danh sách GV"
                  : "Ẩn thông tin công khai"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Granted Permissions Section ── */}
        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 18, color: BRAND.main }} />
            <Typography
              sx={{
                fontSize: "0.82rem",
                fontWeight: 800,
                color: "#334155",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Các quyền quản trị được ủy quyền ({quyenDuocCap.length})
            </Typography>
          </Box>

          {quyenDuocCap.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                gap: 1.25,
              }}
            >
              {quyenDuocCap.map((q) => {
                const Icon = q.icon;
                return (
                  <Box
                    key={q.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      p: 1.25,
                      borderRadius: "12px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#F1F5F9",
                        borderColor: "#CBD5E1",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        bgcolor: "rgba(139, 19, 19, 0.08)",
                        color: BRAND.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 16 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#1E293B",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {q.nhan}
                      </Typography>
                    </Box>
                    <CheckIcon sx={{ fontSize: 16, color: "#16A34A" }} />
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "#F8FAFC",
                border: "1px dashed #CBD5E1",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.84rem", color: "#94A3B8" }}>
                Lời mời này không cấp thêm quyền quản trị khóa học đặc biệt.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Action Footer for Pending Invitations ── */}
      {isPending && (
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 2,
            bgcolor: "#FAF8F6",
            borderTop: "1px solid rgba(139, 19, 19, 0.12)",
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            size="medium"
            startIcon={
              dangXuLy ? (
                <CircularProgress size={16} sx={{ color: STATUS.error }} />
              ) : (
                <CloseIcon />
              )
            }
            disabled={dangXuLy}
            onClick={() => onOpenConfirm(loiMoi, false)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              borderRadius: "12px",
              px: 3,
              py: 1,
              borderColor: "#FECACA",
              color: STATUS.error,
              bgcolor: "#FFFFFF",
              "&:hover": {
                bgcolor: "#FEE2E2",
                borderColor: "#EF4444",
              },
            }}
          >
            Từ chối
          </Button>

          <Button
            variant="contained"
            size="medium"
            startIcon={
              dangXuLy ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <CheckIcon />
              )
            }
            disabled={dangXuLy}
            onClick={() => onOpenConfirm(loiMoi, true)}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              fontSize: "0.9rem",
              borderRadius: "12px",
              px: 4,
              py: 1.1,
              boxShadow: `0 4px 14px ${BRAND.main}35`,
              background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
              color: "#FFFFFF",
              "&:hover": {
                background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.darker} 100%)`,
                boxShadow: `0 8px 20px ${BRAND.main}45`,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Chấp nhận lời mời
          </Button>
        </Box>
      )}
    </Paper>
  );
}

// ── THIẾT KẾ MỚI: Modal Xác nhận phản hồi lời mời ──────────────────────────
function ConfirmActionDialog({
  open,
  loiMoi,
  dongY,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loiMoi: LoiMoiChoXacNhanDto | null;
  dongY: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!loiMoi) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            p: 1,
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.2)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              bgcolor: dongY ? "rgba(22, 163, 74, 0.12)" : "rgba(220, 38, 38, 0.12)",
              color: dongY ? "#16A34A" : STATUS.error,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {dongY ? (
              <HandshakeOutlinedIcon sx={{ fontSize: 24 }} />
            ) : (
              <CloseIcon sx={{ fontSize: 24 }} />
            )}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}>
              {dongY ? "Xác nhận tham gia cộng tác" : "Từ chối lời mời cộng tác"}
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>
              {dongY
                ? "Bạn sẽ trở thành giảng viên cộng tác của khóa học này"
                : "Hành động này sẽ gửi thông báo từ chối đến người mời"}
            </Typography>
          </Box>
        </Box>
        {!loading && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "18px",
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            mb: 2.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1rem",
              color: "#0F172A",
              mb: 1,
            }}
          >
            {loiMoi.tenKhoaHoc}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Giảng viên chính:
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>
                {loiMoi.tenNguoiMoi || "Giảng viên"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Tỷ lệ chia doanh thu:
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#C2410C" }}>
                {loiMoi.tyLeChiaDoanhThu}%
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Hiển thị công khai:
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: loiMoi.visible ? "#16A34A" : "#64748B" }}>
                {loiMoi.visible ? "Có" : "Không"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {dongY ? (
          <Alert severity="success" sx={{ borderRadius: "12px", fontSize: "0.85rem" }}>
            Sau khi đồng ý, khóa học sẽ xuất hiện trong mục <strong>Quản lý khóa học</strong> của bạn cùng các quyền hạn tương ứng.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ borderRadius: "12px", fontSize: "0.85rem" }}>
            Bạn có chắc chắn muốn từ chối lời mời này không?
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            px: 3,
            borderColor: "#CBD5E1",
            color: "#475569",
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            borderRadius: "12px",
            px: 3.5,
            bgcolor: dongY ? BRAND.main : STATUS.error,
            color: "#FFFFFF",
            "&:hover": {
              bgcolor: dongY ? BRAND.dark : STATUS.errorDark,
            },
          }}
        >
          {dongY ? "Xác nhận đồng ý" : "Xác nhận từ chối"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── THIẾT KẾ MỚI: Empty State và Hướng Dẫn Cộng Tác ────────────────────────
function EmptyState() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          py: { xs: 6, md: 7 },
          px: { xs: 3, md: 6 },
          borderRadius: "24px",
          border: `1px solid ${NEUTRAL.divider}`,
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F6 100%)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-50px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "240px",
            height: "240px",
            background: `radial-gradient(circle, ${BRAND.main}12 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Icon Circle */}
        <Box
          sx={{
            width: 88,
            height: 88,
            borderRadius: "28px",
            background: `linear-gradient(135deg, ${BRAND.main}18 0%, ${BRAND.main}06 100%)`,
            border: `2px solid ${BRAND.main}25`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            color: BRAND.main,
            boxShadow: `0 8px 24px ${BRAND.main}15`,
          }}
        >
          <HandshakeOutlinedIcon sx={{ fontSize: 44 }} />
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.3rem",
            color: "#0F172A",
            mb: 1,
            letterSpacing: "-0.015em",
          }}
        >
          Chưa có lời mời cộng tác nào
        </Typography>

        <Typography
          sx={{
            fontSize: "0.92rem",
            color: "#64748B",
            maxWidth: 480,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Khi có giảng viên khác mời bạn cùng hợp tác giảng dạy hoặc quản lý khóa học,
          thông tin lời mời và tỷ lệ chia sẻ doanh thu sẽ hiển thị tại đây.
        </Typography>
      </Paper>

      {/* Collaboration Benefits Showcase */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 3.5 },
          borderRadius: "24px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.05rem",
            color: "#0F172A",
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
          }}
        >
          <InfoOutlinedIcon sx={{ color: BRAND.main, fontSize: 22 }} />
          Lợi ích vượt trội khi cộng tác giảng dạy trên EduVerse
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 2.25,
              borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: "rgba(234, 88, 12, 0.1)",
                color: "#EA580C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#1E293B", mb: 0.5 }}>
              Chia sẻ doanh thu tự động
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5 }}>
              Thu nhập từ mỗi đơn hàng được ghi nhận và phân chia minh bạch theo tỷ lệ đã thỏa thuận.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.25,
              borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: "rgba(139, 19, 19, 0.1)",
                color: BRAND.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
            >
              <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#1E293B", mb: 0.5 }}>
              Phân quyền linh hoạt
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5 }}>
              Kiểm soát chi tiết quyền quản lý tài liệu, bài giảng, hỏi đáp, chấm bài và khuyến mãi.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.25,
              borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #F1F5F9",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: "rgba(22, 163, 74, 0.1)",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#1E293B", mb: 0.5 }}>
              Xây dựng uy tín cá nhân
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5 }}>
              Được vinh danh và hiển thị đồng tác giả công khai trên trang chi tiết khóa học.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

// ── COMPONENT CHÍNH ────────────────────────────────────────────────────────
export default function InvitesPage() {
  const [danhSach, setDanhSach] = useState<LoiMoiChoXacNhanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<"all" | "pending" | "resolved">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    loiMoi: LoiMoiChoXacNhanDto | null;
    dongY: boolean;
  }>({
    open: false,
    loiMoi: null,
    dongY: true,
  });

  // State cho lời mời khuyến mãi
  const [dsKhuyenMai, setDsKhuyenMai] = useState<LoiMoiKhuyenMaiChoXacNhanDto[]>([]);
  const [dangXuLyKM, setDangXuLyKM] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadDanhSach = useCallback(async () => {
    setLoading(true);
    try {
      const data = await LoiMoiGiangVienService.GetLoiMoiCuaToi();
      setDanhSach(data);
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Lỗi tải dữ liệu lời mời cộng tác",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadKhuyenMai = useCallback(async () => {
    try {
      const data = await LoiMoiGiangVienService.GetLoiMoiKhuyenMaiCuaToi();
      setDsKhuyenMai(data);
    } catch (err: any) {
      console.error("Lỗi tải lời mời khuyến mãi:", err);
    }
  }, []);

  useEffect(() => {
    loadDanhSach();
    loadKhuyenMai();
  }, [loadDanhSach, loadKhuyenMai]);

  const handleOpenConfirm = (loiMoi: LoiMoiChoXacNhanDto, dongY: boolean) => {
    setConfirmDialog({
      open: true,
      loiMoi,
      dongY,
    });
  };

  const handleCloseConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const handleExecutePhanHoi = async () => {
    if (!confirmDialog.loiMoi) return;
    const { id } = confirmDialog.loiMoi;
    const dongY = confirmDialog.dongY;

    setDangXuLyId(id);
    try {
      await LoiMoiGiangVienService.PhanHoi(id, dongY);
      setToast({
        open: true,
        message: dongY ? "Đã chấp nhận lời mời cộng tác thành công!" : "Đã từ chối lời mời cộng tác.",
        severity: "success",
      });
      handleCloseConfirm();
      await loadDanhSach();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Có lỗi xảy ra khi xử lý phản hồi",
        severity: "error",
      });
    } finally {
      setDangXuLyId(null);
    }
  };

  const handlePhanHoiKhuyenMai = async (id: string, dongY: boolean) => {
    setDangXuLyKM(id);
    try {
      await LoiMoiGiangVienService.PhanHoiKhuyenMai(id, dongY);
      setToast({
        open: true,
        message: dongY
          ? "Đã đồng ý áp dụng chương trình khuyến mãi!"
          : "Đã từ chối chương trình khuyến mãi.",
        severity: "success",
      });
      await loadKhuyenMai();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Có lỗi xảy ra khi phản hồi khuyến mãi",
        severity: "error",
      });
    } finally {
      setDangXuLyKM(null);
    }
  };

  const pendingList = useMemo(() => danhSach.filter((x) => x.trangThai === "Pending"), [danhSach]);
  const resolvedList = useMemo(() => danhSach.filter((x) => x.trangThai !== "Pending"), [danhSach]);
  const pendingKhuyenMai = useMemo(() => dsKhuyenMai.filter((x) => x.trangThai === "Pending"), [dsKhuyenMai]);

  const filteredList = useMemo(() => {
    let list =
      tabFilter === "pending"
        ? pendingList
        : tabFilter === "resolved"
          ? resolvedList
          : danhSach;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          item.tenKhoaHoc?.toLowerCase().includes(q) ||
          item.tenNguoiMoi?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [tabFilter, pendingList, resolvedList, danhSach, searchTerm]);

  // Tab definitions with fixed label width and consistent font weight
  const tabsConfig = [
    { key: "all" as const, label: "Tất cả", count: danhSach.length },
    { key: "pending" as const, label: "Chờ xác nhận", count: pendingList.length },
    { key: "resolved" as const, label: "Đã xử lý", count: resolvedList.length },
  ];

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <DashboardShell>
        <Box
          sx={{
            p: { xs: 2, md: 4 },
            maxWidth: 1020,
            mx: "auto",
            minHeight: "calc(100vh - 120px)",
            width: "100%",
            boxSizing: "border-box",
            // scrollbarGutter ensures centered layout never shifts horizontally when content expands/contracts
            scrollbarGutter: "stable",
          }}
        >
          {/* ── Hero Header ── */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "28px",
              background: "linear-gradient(135deg, #FFFFFF 0%, #FAF8F6 100%)",
              border: "1px solid #ECE7E4",
              boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.04)",
              mb: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background decorative glow */}
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${BRAND.main}15 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 3,
                flexDirection: { xs: "column", sm: "row" },
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: "20px",
                    background: `linear-gradient(135deg, ${BRAND.main} 0%, #A81B1B 50%, ${BRAND.darker} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: `0 10px 22px ${BRAND.main}38`,
                    flexShrink: 0,
                  }}
                >
                  <HandshakeOutlinedIcon sx={{ fontSize: 32 }} />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.4rem", md: "1.75rem" },
                      color: "#0F172A",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.25,
                    }}
                  >
                    Lời mời cộng tác
                  </Typography>
                  <Typography sx={{ fontSize: "0.92rem", color: "#64748B", mt: 0.5 }}>
                    Quản lý lời mời tham gia giảng dạy và phân chia doanh thu từ các giảng viên khác
                  </Typography>
                </Box>
              </Box>

              {/* Quick Status Pill */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {pendingList.length > 0 && (
                  <Chip
                    icon={<AutoAwesomeIcon sx={{ fontSize: "16px !important", color: "#B45309 !important" }} />}
                    label={`${pendingList.length} lời mời cần xử lý`}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      bgcolor: "#FEF3C7",
                      color: "#92400E",
                      border: "1px solid #FDE68A",
                      py: 1,
                      height: "auto",
                      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.15)",
                    }}
                  />
                )}
                {pendingKhuyenMai.length > 0 && (
                  <Chip
                    icon={<LocalOfferIcon sx={{ fontSize: "15px !important", color: "#FFFFFF !important" }} />}
                    label={`${pendingKhuyenMai.length} deal khuyến mãi`}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      bgcolor: BRAND.main,
                      color: "#FFFFFF",
                      py: 1,
                      height: "auto",
                      boxShadow: `0 2px 10px ${BRAND.main}30`,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Paper>

          {/* ── Section: Yêu cầu áp dụng khuyến mãi ── */}
          {pendingKhuyenMai.length > 0 && (
            <Box sx={{ mb: 4.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      bgcolor: "rgba(139, 19, 19, 0.1)",
                      color: BRAND.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LocalOfferIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                    Yêu cầu áp dụng khuyến mãi
                  </Typography>
                </Box>

                <Chip
                  label={`${pendingKhuyenMai.length} yêu cầu`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.76rem",
                    bgcolor: "#FEF2F2",
                    color: BRAND.main,
                    border: "1px solid #FECACA",
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {pendingKhuyenMai.map((km) => (
                  <LoiMoiKhuyenMaiCard
                    key={km.id}
                    loiMoi={km}
                    dangXuLy={dangXuLyKM === km.id}
                    onPhanHoi={handlePhanHoiKhuyenMai}
                  />
                ))}
              </Box>

              <Divider sx={{ mt: 4, borderColor: "#E2E8F0" }} />
            </Box>
          )}

          {/* ── Stable Filter Bar & Search (No layout shift) ── */}
          {danhSach.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3.5,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              {/* Segmented Tab Buttons (Zero width jitter: constant font-weight 700) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {tabsConfig.map((tab) => {
                  const isActive = tabFilter === tab.key;
                  return (
                    <Box
                      key={tab.key}
                      component="button"
                      type="button"
                      onClick={() => setTabFilter(tab.key)}
                      sx={{
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        py: "10px",
                        px: "18px",
                        height: 46,
                        boxSizing: "border-box",
                        borderRadius: "14px",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        fontFamily: "inherit",
                        bgcolor: isActive ? BRAND.main : "transparent",
                        color: isActive ? "#FFFFFF" : "#64748B",
                        transition: "background-color 0.15s ease, color 0.15s ease",
                        "&:hover": {
                          bgcolor: isActive ? BRAND.dark : "#F1F5F9",
                          color: isActive ? "#FFFFFF" : "#1E293B",
                        },
                      }}
                    >
                      <span>{tab.label}</span>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          px: 1,
                          py: 0.25,
                          borderRadius: "999px",
                          fontSize: "0.76rem",
                          fontWeight: 800,
                          bgcolor: isActive ? "rgba(255, 255, 255, 0.25)" : "#E2E8F0",
                          color: isActive ? "#FFFFFF" : "#475569",
                          minWidth: 22,
                          lineHeight: 1.2,
                        }}
                      >
                        {tab.count}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Search Box - Enhanced Height & Padding */}
              <TextField
                placeholder="Tìm khóa học hoặc giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94A3B8", fontSize: 22 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  maxWidth: { xs: "100%", sm: 300 },
                  "& .MuiOutlinedInput-root": {
                    height: 46,
                    borderRadius: "14px",
                    bgcolor: "#F8FAFC",
                    fontSize: "0.9rem",
                    "& input": {
                      py: "11px",
                      px: "4px",
                    },
                    "& fieldset": { borderColor: "#E2E8F0" },
                    "&:hover fieldset": { borderColor: "#CBD5E1" },
                    "&.Mui-focused fieldset": { borderColor: BRAND.main, borderWidth: "1.5px" },
                  },
                }}
              />
            </Paper>
          )}

          {/* ── Main List Content (Fixed alignment) ── */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 12,
                gap: 2,
                minHeight: 320,
              }}
            >
              <CircularProgress size={42} sx={{ color: BRAND.main }} />
              <Typography sx={{ fontSize: "0.92rem", color: "#64748B", fontWeight: 600 }}>
                Đang tải danh sách lời mời cộng tác...
              </Typography>
            </Box>
          ) : danhSach.length === 0 ? (
            pendingKhuyenMai.length === 0 ? (
              <EmptyState />
            ) : null
          ) : filteredList.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                textAlign: "center",
                py: 8,
                px: 3,
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "24px",
                border: "1.5px dashed #CBD5E1",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#475569", mb: 0.5 }}>
                Không tìm thấy lời mời nào
              </Typography>
              <Typography sx={{ fontSize: "0.86rem", color: "#94A3B8" }}>
                {searchTerm
                  ? "Không có lời mời nào khớp với từ khóa tìm kiếm"
                  : "Chưa có lời mời nào trong mục này"}
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {filteredList.map((lm) => (
                <LoiMoiCard
                  key={lm.id}
                  loiMoi={lm}
                  dangXuLy={dangXuLyId === lm.id}
                  onOpenConfirm={handleOpenConfirm}
                />
              ))}
            </Box>
          )}

          {/* ── Confirmation Dialog ── */}
          <ConfirmActionDialog
            open={confirmDialog.open}
            loiMoi={confirmDialog.loiMoi}
            dongY={confirmDialog.dongY}
            loading={Boolean(dangXuLyId)}
            onClose={handleCloseConfirm}
            onConfirm={handleExecutePhanHoi}
          />

          {/* ── Toast Notification ── */}
          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              severity={toast.severity}
              variant="filled"
              onClose={() => setToast({ ...toast, open: false })}
              sx={{
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}
