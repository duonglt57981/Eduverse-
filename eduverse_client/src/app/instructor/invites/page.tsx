/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
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
import { EduAvatar } from "@/src/components/common/EduAvatar";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PercentIcon from "@mui/icons-material/Percent";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ClearIcon from "@mui/icons-material/Clear";
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

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

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

// ── CARD YÊU CẦU ÁP DỤNG KHUYẾN MÃI TỪ ADMIN (ĐỒNG BỘ NGUYÊN BẢN VỚI LỜI MỜI) ──────────────────────────
function LoiMoiKhuyenMaiCard({
  loiMoi,
  dangXuLy,
  onOpenConfirm,
}: {
  loiMoi: LoiMoiKhuyenMaiChoXacNhanDto;
  dangXuLy: boolean;
  onOpenConfirm: (loiMoi: LoiMoiKhuyenMaiChoXacNhanDto, dongY: boolean) => void;
}) {
  const isPending = loiMoi.trangThai === "Pending";
  const hasDateRange = Boolean(loiMoi.ngayBatDauKM || loiMoi.ngayKetThucKM);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: isPending
          ? "1.5px solid rgba(139, 19, 19, 0.28)"
          : "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isPending
          ? "0 12px 32px -8px rgba(139, 19, 19, 0.10), 0 4px 12px rgba(0, 0, 0, 0.03)"
          : "0 4px 16px rgba(0, 0, 0, 0.03)",
        "&:hover": {
          borderColor: isPending ? BRAND.main : "#CBD5E1",
          transform: "translateY(-3px)",
          boxShadow: isPending
            ? "0 18px 40px -10px rgba(139, 19, 19, 0.18), 0 6px 18px rgba(0, 0, 0, 0.04)"
            : "0 10px 24px -4px rgba(0, 0, 0, 0.06)",
        },
      }}
    >
      {/* ── Top Header Banner ── */}
      {isPending ? (
        <Box
          sx={{
            background:
              "linear-gradient(90deg, #8B1313 0%, #A81B1B 45%, #6D0F0F 100%)",
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
              <LocalOfferIcon sx={{ fontSize: 13, color: "#FEF08A" }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.78rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Yêu cầu áp dụng mã giảm giá từ Quản trị viên
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
            <span>Ngày gửi: {formatDate(loiMoi.ngayMoi)}</span>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocalOfferIcon sx={{ fontSize: 14, color: "#64748B" }} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.76rem",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Lịch sử yêu cầu khuyến mãi
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
            Ngày gửi: {formatDate(loiMoi.ngayMoi)}
          </Typography>
        </Box>
      )}

      {/* ── Main Body ── */}
      <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Course Info & Details */}
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
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "#94A3B8",
                    fontWeight: 600,
                  }}
                >
                  EduVerse Course
                </Typography>
              </Box>
            )}
          </Box>

          {/* Details */}
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
                {loiMoi.tenKhoaHoc || "Khóa học"}
              </Typography>
              <TrangThaiChip trangThai={loiMoi.trangThai} />
            </Box>

            {/* Admin / Sender Info */}
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
              <EduAvatar
                src={loiMoi.anhNguoiMoi}
                name={loiMoi.tenNguoiMoi || "Admin EduVerse"}
                size={30}
              />
              <Typography sx={{ fontSize: "0.84rem", color: "#64748B" }}>
                Người gửi yêu cầu:{" "}
                <strong style={{ color: "#0F172A", fontWeight: 700 }}>
                  {loiMoi.tenNguoiMoi || "Admin EduVerse"}
                </strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Key Highlights: Discount Deal & Duration ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
            mt: 3,
          }}
        >
          {/* Voucher Code & Discount Value */}
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
              border: "1px solid #FECACA",
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.04)",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: BRAND.main,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 4px 10px ${BRAND.main}30`,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#991B1B",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Mã giảm giá áp dụng
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  mt: 0.25,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    color: BRAND.main,
                    lineHeight: 1.2,
                    letterSpacing: "0.02em",
                  }}
                >
                  {loiMoi.maGiamGia || "DEAL"}
                </Typography>
                <Chip
                  label={`GIẢM ${loiMoi.phanTramGiam}%`}
                  size="small"
                  sx={{
                    bgcolor: BRAND.main,
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.74rem",
                    height: 22,
                    borderRadius: "6px",
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Timeframe & Campaign details */}
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
              border: "1px solid #E2E8F0",
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
                bgcolor: "#0284C7",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(2, 132, 199, 0.25)",
              }}
            >
              <AccessTimeOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#0369A1",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Thời hạn chương trình
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1.3,
                  mt: 0.25,
                }}
              >
                {hasDateRange
                  ? `${formatDate(loiMoi.ngayBatDauKM)} — ${formatDate(loiMoi.ngayKetThucKM)}`
                  : "Theo chiến dịch khuyến mãi của EduVerse"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Request Context Note ── */}
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: "14px",
            bgcolor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: 18, color: BRAND.main, mt: 0.2, flexShrink: 0 }}
          />
          <Typography
            sx={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.55 }}
          >
            Quản trị viên{" "}
            <strong style={{ color: "#0F172A", fontWeight: 700 }}>
              {loiMoi.tenNguoiMoi || "Admin EduVerse"}
            </strong>{" "}
            muốn áp dụng chương trình khuyến mãi mã{" "}
            <strong style={{ color: BRAND.main, fontWeight: 800 }}>
              {loiMoi.maGiamGia}
            </strong>{" "}
            (giảm <strong>{loiMoi.phanTramGiam}%</strong>) cho khóa học này nhằm
            thúc đẩy chiến dịch quảng bá và gia tăng số lượng học viên đăng ký.
          </Typography>
        </Box>
      </Box>

      {/* ── Action Footer for Pending ── */}
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
            Đồng ý áp dụng
          </Button>
        </Box>
      )}
    </Paper>
  );
}

// ── CARD LỜI MỜI CỘNG TÁC GIẢNG DẠY ─────────────────────────────────────────
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
      {/* ── Top Header Banner ── */}
      {isPending ? (
        <Box
          sx={{
            background:
              "linear-gradient(90deg, #8B1313 0%, #A81B1B 45%, #6D0F0F 100%)",
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
              Lời mời hợp tác giảng dạy mới chờ bạn phản hồi
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
            <span>Ngày mời: {formatDate(loiMoi.ngayMoi)}</span>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HandshakeOutlinedIcon sx={{ fontSize: 14, color: "#64748B" }} />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.76rem",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Lịch sử lời mời cộng tác giảng dạy
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
            Ngày mời: {formatDate(loiMoi.ngayMoi)}
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
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "#94A3B8",
                    fontWeight: 600,
                  }}
                >
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
              <EduAvatar
                src={loiMoi.anhNguoiMoi}
                name={loiMoi.tenNguoiMoi || "Giảng viên chính"}
                size={30}
              />
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
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#9A3412",
                    marginLeft: 6,
                  }}
                >
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
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
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

// ── MODAL XÁC NHẬN PHẢN HỒI LỜI MỜI GIẢNG DẠY ──────────────────────────
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
              bgcolor: dongY
                ? "rgba(22, 163, 74, 0.12)"
                : "rgba(220, 38, 38, 0.12)",
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
            <Typography
              sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}
            >
              {dongY
                ? "Xác nhận tham gia cộng tác"
                : "Từ chối lời mời cộng tác"}
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
              <Typography
                sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}
              >
                {loiMoi.tenNguoiMoi || "Giảng viên"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Tỷ lệ chia doanh thu:
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#C2410C" }}
              >
                {loiMoi.tyLeChiaDoanhThu}%
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Hiển thị công khai:
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: loiMoi.visible ? "#16A34A" : "#64748B",
                }}
              >
                {loiMoi.visible ? "Có" : "Không"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {dongY ? (
          <Alert
            severity="success"
            sx={{ borderRadius: "12px", fontSize: "0.85rem" }}
          >
            Sau khi đồng ý, khóa học sẽ xuất hiện trong mục{" "}
            <strong>Quản lý khóa học</strong> của bạn cùng các quyền hạn tương
            ứng.
          </Alert>
        ) : (
          <Alert
            severity="warning"
            sx={{ borderRadius: "12px", fontSize: "0.85rem" }}
          >
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
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
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

// ── MODAL XÁC NHẬN PHẢN HỒI YÊU CẦU KHUYẾN MÃI TỪ ADMIN ───────────────────────
function ConfirmPromoDialog({
  open,
  loiMoi,
  dongY,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loiMoi: LoiMoiKhuyenMaiChoXacNhanDto | null;
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
              bgcolor: dongY
                ? "rgba(22, 163, 74, 0.12)"
                : "rgba(220, 38, 38, 0.12)",
              color: dongY ? "#16A34A" : STATUS.error,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {dongY ? (
              <LocalOfferIcon sx={{ fontSize: 24 }} />
            ) : (
              <CloseIcon sx={{ fontSize: 24 }} />
            )}
          </Box>
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#0F172A" }}
            >
              {dongY
                ? "Đồng ý áp dụng mã giảm giá"
                : "Từ chối áp dụng mã giảm giá"}
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>
              {dongY
                ? "Khóa học của bạn sẽ được kích hoạt khuyến mãi theo chiến dịch"
                : "Thông báo từ chối sẽ được gửi đến Quản trị viên"}
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
              mb: 1.2,
            }}
          >
            {loiMoi.tenKhoaHoc}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Mã giảm giá:
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", fontWeight: 800, color: BRAND.main }}
              >
                {loiMoi.maGiamGia}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Mức giảm giá:
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#C2410C" }}
              >
                {loiMoi.phanTramGiam}%
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                Quản trị viên yêu cầu:
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}
              >
                {loiMoi.tenNguoiMoi || "Admin EduVerse"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {dongY ? (
          <Alert
            severity="success"
            sx={{ borderRadius: "12px", fontSize: "0.85rem" }}
          >
            Khi đồng ý, học viên có thể nhập mã giảm giá này khi thanh toán khóa
            học để nhận ưu đãi.
          </Alert>
        ) : (
          <Alert
            severity="warning"
            sx={{ borderRadius: "12px", fontSize: "0.85rem" }}
          >
            Bạn có chắc chắn không muốn áp dụng mã giảm giá này cho khóa học?
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
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
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

// ── EMPTY STATE & HƯỚNG DẪN ───────────────────────────────────────────────
function EmptyState({
  category,
}: {
  category: "all" | "invites" | "promotions";
}) {
  const isPromoOnly = category === "promotions";

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
          {isPromoOnly ? (
            <LocalOfferIcon sx={{ fontSize: 44 }} />
          ) : (
            <HandshakeOutlinedIcon sx={{ fontSize: 44 }} />
          )}
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
          {isPromoOnly
            ? "Chưa có yêu cầu khuyến mãi nào"
            : "Chưa có lời mời cộng tác hay yêu cầu nào"}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.92rem",
            color: "#64748B",
            maxWidth: 520,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          {isPromoOnly
            ? "Khi Quản trị viên EduVerse đề xuất chiến dịch khuyến mãi hoặc áp dụng mã giảm giá đặc biệt cho khóa học của bạn, thông tin chi tiết sẽ hiển thị tại đây."
            : "Khi có giảng viên khác mời bạn cùng hợp tác giảng dạy hoặc Quản trị viên đề xuất chương trình khuyến mãi cho khóa học của bạn, toàn bộ yêu cầu sẽ hiển thị tập trung tại đây."}
        </Typography>
      </Paper>

      {/* Value Proposition Showcase */}
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
          Lợi ích vượt trội từ Lời mời cộng tác & Chương trình khuyến mãi
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
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.92rem",
                color: "#1E293B",
                mb: 0.5,
              }}
            >
              Doanh thu phân chia tự động
            </Typography>
            <Typography
              sx={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5 }}
            >
              Thu nhập từ mỗi đơn hàng được ghi nhận và phân bổ minh bạch theo tỷ
              lệ thỏa thuận chính xác.
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
              <LocalOfferIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.92rem",
                color: "#1E293B",
                mb: 0.5,
              }}
            >
              Tối ưu hóa chuyển đổi
            </Typography>
            <Typography
              sx={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5 }}
            >
              Tham gia các chiến dịch khuyến mãi của Admin giúp khóa học tiếp
              cận hàng ngàn học viên tiềm năng.
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
              <VerifiedUserOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "0.92rem",
                color: "#1E293B",
                mb: 0.5,
              }}
            >
              Quyền hạn rõ ràng
            </Typography>
            <Typography
              sx={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.5 }}
            >
              Kiểm soát chi tiết quyền biên tập, thống kê, hỏi đáp, tài liệu và
              hiển thị đồng tác giả.
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
  const [dsKhuyenMai, setDsKhuyenMai] = useState<
    LoiMoiKhuyenMaiChoXacNhanDto[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "invites" | "promotions"
  >("all");
  const [tabFilter, setTabFilter] = useState<"all" | "pending" | "resolved">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Process States
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [dangXuLyKM, setDangXuLyKM] = useState<string | null>(null);

  // Dialog State for Teaching Collaboration
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    loiMoi: LoiMoiChoXacNhanDto | null;
    dongY: boolean;
  }>({
    open: false,
    loiMoi: null,
    dongY: true,
  });

  // Dialog State for Promotion Application
  const [confirmPromoDialog, setConfirmPromoDialog] = useState<{
    open: boolean;
    loiMoi: LoiMoiKhuyenMaiChoXacNhanDto | null;
    dongY: boolean;
  }>({
    open: false,
    loiMoi: null,
    dongY: true,
  });

  // Toast State
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invitesData, promosData] = await Promise.all([
        LoiMoiGiangVienService.GetLoiMoiCuaToi(),
        LoiMoiGiangVienService.GetLoiMoiKhuyenMaiCuaToi(),
      ]);
      setDanhSach(invitesData || []);
      setDsKhuyenMai(promosData || []);
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Lỗi tải dữ liệu lời mời & yêu cầu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Teaching Collaboration Invites
  const handleOpenConfirmInvite = (
    loiMoi: LoiMoiChoXacNhanDto,
    dongY: boolean,
  ) => {
    setConfirmDialog({
      open: true,
      loiMoi,
      dongY,
    });
  };

  const handleCloseConfirmInvite = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const handleExecutePhanHoiInvite = async () => {
    if (!confirmDialog.loiMoi) return;
    const { id } = confirmDialog.loiMoi;
    const dongY = confirmDialog.dongY;

    setDangXuLyId(id);
    try {
      await LoiMoiGiangVienService.PhanHoi(id, dongY);
      setToast({
        open: true,
        message: dongY
          ? "Đã chấp nhận lời mời cộng tác thành công!"
          : "Đã từ chối lời mời cộng tác.",
        severity: "success",
      });
      handleCloseConfirmInvite();
      await loadData();
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

  // Handle Promo Application Invites
  const handleOpenConfirmPromo = (
    loiMoi: LoiMoiKhuyenMaiChoXacNhanDto,
    dongY: boolean,
  ) => {
    setConfirmPromoDialog({
      open: true,
      loiMoi,
      dongY,
    });
  };

  const handleCloseConfirmPromo = () => {
    setConfirmPromoDialog((prev) => ({ ...prev, open: false }));
  };

  const handleExecutePhanHoiPromo = async () => {
    if (!confirmPromoDialog.loiMoi) return;
    const { id } = confirmPromoDialog.loiMoi;
    const dongY = confirmPromoDialog.dongY;

    setDangXuLyKM(id);
    try {
      await LoiMoiGiangVienService.PhanHoiKhuyenMai(id, dongY);
      setToast({
        open: true,
        message: dongY
          ? "Đã đồng ý áp dụng chương trình khuyến mãi thành công!"
          : "Đã từ chối chương trình khuyến mãi.",
        severity: "success",
      });
      handleCloseConfirmPromo();
      await loadData();
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

  // Memoized Counts
  const pendingInvites = useMemo(
    () => danhSach.filter((x) => x.trangThai === "Pending"),
    [danhSach],
  );
  const resolvedInvites = useMemo(
    () => danhSach.filter((x) => x.trangThai !== "Pending"),
    [danhSach],
  );

  const pendingPromos = useMemo(
    () => dsKhuyenMai.filter((x) => x.trangThai === "Pending"),
    [dsKhuyenMai],
  );
  const resolvedPromos = useMemo(
    () => dsKhuyenMai.filter((x) => x.trangThai !== "Pending"),
    [dsKhuyenMai],
  );

  const totalPending = pendingInvites.length + pendingPromos.length;

  // Unified items list
  type UnifiedItem =
    | { type: "invite"; data: LoiMoiChoXacNhanDto; date: string }
    | { type: "promo"; data: LoiMoiKhuyenMaiChoXacNhanDto; date: string };

  const allItems: UnifiedItem[] = useMemo(() => {
    const invites: UnifiedItem[] = danhSach.map((item) => ({
      type: "invite",
      data: item,
      date: item.ngayMoi,
    }));
    const promos: UnifiedItem[] = dsKhuyenMai.map((item) => ({
      type: "promo",
      data: item,
      date: item.ngayMoi,
    }));
    return [...invites, ...promos].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [danhSach, dsKhuyenMai]);

  // Filtered List calculation
  const filteredItems = useMemo(() => {
    let items = allItems;

    // 1. Filter by category
    if (selectedCategory === "invites") {
      items = items.filter((x) => x.type === "invite");
    } else if (selectedCategory === "promotions") {
      items = items.filter((x) => x.type === "promo");
    }

    // 2. Filter by status
    if (tabFilter === "pending") {
      items = items.filter((x) => x.data.trangThai === "Pending");
    } else if (tabFilter === "resolved") {
      items = items.filter((x) => x.data.trangThai !== "Pending");
    }

    // 3. Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter((item) => {
        if (item.type === "invite") {
          return (
            item.data.tenKhoaHoc?.toLowerCase().includes(q) ||
            item.data.tenNguoiMoi?.toLowerCase().includes(q)
          );
        } else {
          return (
            item.data.tenKhoaHoc?.toLowerCase().includes(q) ||
            item.data.tenNguoiMoi?.toLowerCase().includes(q) ||
            item.data.maGiamGia?.toLowerCase().includes(q) ||
            `${item.data.phanTramGiam}%`.includes(q)
          );
        }
      });
    }

    return items;
  }, [allItems, selectedCategory, tabFilter, searchTerm]);

  // Dynamic counts for status pills based on current category
  const currentCategoryPool = useMemo(() => {
    if (selectedCategory === "invites") return allItems.filter((x) => x.type === "invite");
    if (selectedCategory === "promotions") return allItems.filter((x) => x.type === "promo");
    return allItems;
  }, [allItems, selectedCategory]);

  const countAllInCat = currentCategoryPool.length;
  const countPendingInCat = currentCategoryPool.filter(
    (x) => x.data.trangThai === "Pending",
  ).length;
  const countResolvedInCat = currentCategoryPool.filter(
    (x) => x.data.trangThai !== "Pending",
  ).length;

  // Category Configuration
  const categoryConfig = [
    {
      key: "all" as const,
      label: "Tất cả yêu cầu",
      icon: AutoAwesomeIcon,
      totalCount: allItems.length,
      pendingCount: totalPending,
    },
    {
      key: "invites" as const,
      label: "Lời mời giảng dạy",
      icon: HandshakeOutlinedIcon,
      totalCount: danhSach.length,
      pendingCount: pendingInvites.length,
    },
    {
      key: "promotions" as const,
      label: "Yêu cầu mã giảm giá",
      icon: LocalOfferIcon,
      totalCount: dsKhuyenMai.length,
      pendingCount: pendingPromos.length,
    },
  ];

  // Status Filter Tabs
  const statusTabsConfig = [
    { key: "all" as const, label: "Tất cả", count: countAllInCat },
    {
      key: "pending" as const,
      label: "Chờ xác nhận",
      count: countPendingInCat,
    },
    {
      key: "resolved" as const,
      label: "Đã xử lý",
      count: countResolvedInCat,
    },
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
              mb: 3.5,
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
                    Lời mời & Yêu cầu
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.92rem", color: "#64748B", mt: 0.5 }}
                  >
                    Quản lý lời mời tham gia giảng dạy và yêu cầu áp dụng mã
                    giảm giá từ Quản trị viên
                  </Typography>
                </Box>
              </Box>

              {/* Quick Status Chips */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {pendingInvites.length > 0 && (
                  <Chip
                    clickable
                    onClick={() => {
                      setSelectedCategory("invites");
                      setTabFilter("pending");
                    }}
                    icon={
                      <AutoAwesomeIcon
                        sx={{
                          fontSize: "16px !important",
                          color: "#B45309 !important",
                        }}
                      />
                    }
                    label={`${pendingInvites.length} lời mời giảng dạy`}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      bgcolor: "#FEF3C7",
                      color: "#92400E",
                      border: "1px solid #FDE68A",
                      py: 1,
                      height: "auto",
                      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.15)",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "#FDE68A",
                      },
                    }}
                  />
                )}

                {pendingPromos.length > 0 && (
                  <Chip
                    clickable
                    onClick={() => {
                      setSelectedCategory("promotions");
                      setTabFilter("pending");
                    }}
                    icon={
                      <LocalOfferIcon
                        sx={{
                          fontSize: "15px !important",
                          color: "#FFFFFF !important",
                        }}
                      />
                    }
                    label={`${pendingPromos.length} deal khuyến mãi`}
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      bgcolor: BRAND.main,
                      color: "#FFFFFF",
                      py: 1,
                      height: "auto",
                      boxShadow: `0 2px 10px ${BRAND.main}30`,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: BRAND.dark,
                      },
                    }}
                  />
                )}

                {totalPending === 0 && (
                  <Chip
                    icon={
                      <CheckCircleOutlinedIcon
                        sx={{
                          fontSize: "16px !important",
                          color: "#15803D !important",
                        }}
                      />
                    }
                    label="Đã xử lý tất cả yêu cầu"
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      bgcolor: "#DCFCE7",
                      color: "#15803D",
                      border: "1px solid #BBF7D0",
                      py: 1,
                      height: "auto",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Paper>

          {/* ── Main Category Selector (Segmented Cards) ── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
              gap: 1.5,
              mb: 3,
            }}
          >
            {categoryConfig.map((cat) => {
              const isActive = selectedCategory === cat.key;
              const IconComp = cat.icon;

              return (
                <Paper
                  key={cat.key}
                  component="button"
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  elevation={0}
                  sx={{
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    p: 2,
                    borderRadius: "18px",
                    bgcolor: isActive ? "#FFFFFF" : "#FAF8F6",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: isActive ? BRAND.main : "#E2E8F0",
                    boxShadow: isActive
                      ? `0 8px 20px -6px ${BRAND.main}20, 0 2px 6px rgba(0,0,0,0.04)`
                      : "none",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    "&:hover": {
                      bgcolor: "#FFFFFF",
                      borderColor: isActive ? BRAND.main : "#CBD5E1",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        bgcolor: isActive ? BRAND.main : "#F1F5F9",
                        color: isActive ? "#FFFFFF" : "#64748B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <IconComp sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          color: isActive ? "#0F172A" : "#475569",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cat.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.76rem",
                          color: "#94A3B8",
                          fontWeight: 600,
                        }}
                      >
                        {cat.totalCount} mục tổng cộng
                      </Typography>
                    </Box>
                  </Box>

                  {cat.pendingCount > 0 ? (
                    <Chip
                      label={`${cat.pendingCount} chờ`}
                      size="small"
                      sx={{
                        bgcolor: isActive ? "#FEF2F2" : "#FEF3C7",
                        color: isActive ? BRAND.main : "#92400E",
                        border: `1px solid ${isActive ? "#FECACA" : "#FDE68A"}`,
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        height: 22,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: "999px",
                        bgcolor: "#F1F5F9",
                        color: "#64748B",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {cat.totalCount}
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          {/* ── Status Filter Bar & Search Box ── */}
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
            {/* Status Pills */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {statusTabsConfig.map((tab) => {
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
                      height: 44,
                      boxSizing: "border-box",
                      borderRadius: "14px",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      fontFamily: "inherit",
                      bgcolor: isActive ? BRAND.main : "transparent",
                      color: isActive ? "#FFFFFF" : "#64748B",
                      transition:
                        "background-color 0.15s ease, color 0.15s ease",
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
                        px: 0.9,
                        py: 0.2,
                        borderRadius: "999px",
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        bgcolor: isActive
                          ? "rgba(255, 255, 255, 0.25)"
                          : "#E2E8F0",
                        color: isActive ? "#FFFFFF" : "#475569",
                        minWidth: 20,
                        lineHeight: 1.2,
                      }}
                    >
                      {tab.count}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Search Box */}
            <TextField
              placeholder="Tìm theo khóa học, người gửi, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        sx={{ p: 0.5 }}
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                maxWidth: { xs: "100%", sm: 320 },
                "& .MuiOutlinedInput-root": {
                  height: 44,
                  borderRadius: "14px",
                  bgcolor: "#F8FAFC",
                  fontSize: "0.88rem",
                  "& input": {
                    py: "10px",
                    px: "4px",
                  },
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": {
                    borderColor: BRAND.main,
                    borderWidth: "1.5px",
                  },
                },
              }}
            />
          </Paper>

          {/* ── Main List Content ── */}
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
              <Typography
                sx={{ fontSize: "0.92rem", color: "#64748B", fontWeight: 600 }}
              >
                Đang tải danh sách lời mời & yêu cầu...
              </Typography>
            </Box>
          ) : allItems.length === 0 ? (
            <EmptyState category={selectedCategory} />
          ) : filteredItems.length === 0 ? (
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
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "#475569",
                  mb: 0.5,
                }}
              >
                Không tìm thấy yêu cầu phù hợp
              </Typography>
              <Typography sx={{ fontSize: "0.86rem", color: "#94A3B8", mb: 2 }}>
                {searchTerm
                  ? `Không có lời mời hoặc yêu cầu nào khớp với "${searchTerm}"`
                  : "Chưa có dữ liệu trong mục lọc này"}
              </Typography>
              {searchTerm && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSearchTerm("")}
                  sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    color: BRAND.main,
                    borderColor: BRAND.main,
                  }}
                >
                  Xóa từ khóa tìm kiếm
                </Button>
              )}
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
              {filteredItems.map((item) => {
                if (item.type === "invite") {
                  return (
                    <LoiMoiCard
                      key={`invite-${item.data.id}`}
                      loiMoi={item.data}
                      dangXuLy={dangXuLyId === item.data.id}
                      onOpenConfirm={handleOpenConfirmInvite}
                    />
                  );
                } else {
                  return (
                    <LoiMoiKhuyenMaiCard
                      key={`promo-${item.data.id}`}
                      loiMoi={item.data}
                      dangXuLy={dangXuLyKM === item.data.id}
                      onOpenConfirm={handleOpenConfirmPromo}
                    />
                  );
                }
              })}
            </Box>
          )}

          {/* ── Confirmation Dialog for Teaching Collaboration ── */}
          <ConfirmActionDialog
            open={confirmDialog.open}
            loiMoi={confirmDialog.loiMoi}
            dongY={confirmDialog.dongY}
            loading={Boolean(dangXuLyId)}
            onClose={handleCloseConfirmInvite}
            onConfirm={handleExecutePhanHoiInvite}
          />

          {/* ── Confirmation Dialog for Promotion Application ── */}
          <ConfirmPromoDialog
            open={confirmPromoDialog.open}
            loiMoi={confirmPromoDialog.loiMoi}
            dongY={confirmPromoDialog.dongY}
            loading={Boolean(dangXuLyKM)}
            onClose={handleCloseConfirmPromo}
            onConfirm={handleExecutePhanHoiPromo}
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
