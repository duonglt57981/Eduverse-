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
  Tab,
  Tabs,
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
import { useState, useEffect, useCallback } from "react";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardShell from "@/src/components/dashboard/DashboardShell";
import LoiMoiGiangVienService, {
  LoiMoiChoXacNhanDto,
} from "@/src/services/LoiMoiGiangVienService";
import { BRAND, NEUTRAL, STATUS } from "@/src/theme/tokens";

const MAU = {
  chinh: BRAND.main,
  chinhDam: BRAND.dark,
  chinhNhat: BRAND.light,
  vien: NEUTRAL.divider,
};

const DANH_SACH_QUYEN_HIEN_THI = [
  { key: "manage", nhan: "Quản lý nội dung" },
  { key: "performance", nhan: "Xem thống kê" },
  { key: "qnA", nhan: "Hỏi đáp" },
  { key: "reviews", nhan: "Đánh giá" },
  { key: "assignments", nhan: "Bài tập" },
  { key: "materials", nhan: "Tài liệu" },
  { key: "promotions", nhan: "Khuyến mãi" },
];

function TrangThaiChip({ trangThai }: { trangThai: string }) {
  const map: Record<string, { nhan: string; mau: string; nen: string; vieng: string }> = {
    Pending: { nhan: "Chờ xác nhận", mau: STATUS.warningDark, nen: "#FEF3C7", vieng: "#FDE68A" },
    Accepted: { nhan: "Đã chấp nhận", mau: "#16A34A", nen: "#DCFCE7", vieng: "#BBF7D0" },
    Rejected: { nhan: "Đã từ chối", mau: STATUS.error, nen: "#FEE2E2", vieng: "#FECACA" },
  };
  const cfg = map[trangThai] ?? {
    nhan: trangThai,
    mau: "#6B7280",
    nen: "#F3F4F6",
    vieng: "#E5E7EB",
  };
  return (
    <Chip
      label={cfg.nhan}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11.5,
        color: cfg.mau,
        bgcolor: cfg.nen,
        border: `1px solid ${cfg.vieng}`,
        borderRadius: "20px",
        px: 0.5,
      }}
    />
  );
}

export default function InvitesPage() {
  const [danhSach, setDanhSach] = useState<LoiMoiChoXacNhanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dangXuLyId, setDangXuLyId] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<"all" | "pending" | "resolved">("all");
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
        message: err.message || "Lỗi tải dữ liệu",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDanhSach();
  }, [loadDanhSach]);

  const handlePhanHoi = async (id: string, dongY: boolean) => {
    setDangXuLyId(id);
    try {
      await LoiMoiGiangVienService.PhanHoi(id, dongY);
      setToast({
        open: true,
        message: dongY ? "Đã chấp nhận lời mời!" : "Đã từ chối lời mời",
        severity: "success",
      });
      await loadDanhSach();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.message || "Có lỗi xảy ra",
        severity: "error",
      });
    } finally {
      setDangXuLyId(null);
    }
  };

  const pendingList = danhSach.filter((x) => x.trangThai === "Pending");
  const resolvedList = danhSach.filter((x) => x.trangThai !== "Pending");

  const filteredList =
    tabFilter === "pending"
      ? pendingList
      : tabFilter === "resolved"
      ? resolvedList
      : danhSach;

  return (
    <AuthGuard allowedRoles={["Admin", "GiaoVien"]}>
      <DashboardShell>
        <Box sx={{ p: { xs: 2.5, md: 4.5 }, maxWidth: 900, mx: "auto" }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 4,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${MAU.chinh} 0%, ${MAU.chinhDam} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: `0 8px 16px ${MAU.chinh}33`,
                }}
              >
                <HandshakeOutlinedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: 22, md: 26 },
                    color: "#0F172A",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Lời mời cộng tác
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#64748B", mt: 0.2 }}>
                  Danh sách lời mời tham gia giảng dạy cùng các giảng viên khác
                </Typography>
              </Box>
            </Box>

            {pendingList.length > 0 && (
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: "16px !important", color: `${STATUS.warningDark} !important` }} />}
                label={`${pendingList.length} lời mời cần xử lý`}
                sx={{
                  fontWeight: 700,
                  fontSize: 12.5,
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #FDE68A",
                  py: 0.5,
                  height: "auto",
                }}
              />
            )}
          </Box>

          {/* Filter Tabs */}
          {danhSach.length > 0 && (
            <Box
              sx={{
                mb: 3,
                borderBottom: "1px solid",
                borderColor: "#E2E8F0",
              }}
            >
              <Tabs
                value={tabFilter}
                onChange={(_, v) => setTabFilter(v)}
                sx={{
                  "& .MuiTabs-indicator": {
                    bgcolor: MAU.chinh,
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                }}
              >
                <Tab
                  value="all"
                  label={`Tất cả (${danhSach.length})`}
                  sx={{
                    textTransform: "none",
                    fontWeight: tabFilter === "all" ? 800 : 600,
                    fontSize: 14,
                    color: tabFilter === "all" ? MAU.chinh : "#64748B",
                  }}
                />
                <Tab
                  value="pending"
                  label={`Chờ xác nhận (${pendingList.length})`}
                  sx={{
                    textTransform: "none",
                    fontWeight: tabFilter === "pending" ? 800 : 600,
                    fontSize: 14,
                    color: tabFilter === "pending" ? MAU.chinh : "#64748B",
                  }}
                />
                <Tab
                  value="resolved"
                  label={`Đã xử lý (${resolvedList.length})`}
                  sx={{
                    textTransform: "none",
                    fontWeight: tabFilter === "resolved" ? 800 : 600,
                    fontSize: 14,
                    color: tabFilter === "resolved" ? MAU.chinh : "#64748B",
                  }}
                />
              </Tabs>
            </Box>
          )}

          {/* Main Content */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 10,
                gap: 2,
              }}
            >
              <CircularProgress size={36} sx={{ color: MAU.chinh }} />
              <Typography sx={{ fontSize: 14, color: "#64748B", fontWeight: 500 }}>
                Đang tải thông tin lời mời...
              </Typography>
            </Box>
          ) : danhSach.length === 0 ? (
            <EmptyState />
          ) : filteredList.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                textAlign: "center",
                py: 7,
                px: 3,
                borderRadius: "20px",
                border: "1px dashed #CBD5E1",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#475569" }}>
                Không có lời mời nào trong mục này
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {filteredList.map((lm) => (
                <LoiMoiCard
                  key={lm.id}
                  loiMoi={lm}
                  dangXuLy={dangXuLyId === lm.id}
                  onPhanHoi={handlePhanHoi}
                />
              ))}
            </Box>
          )}

          {/* Notification Toast */}
          <Snackbar
            open={toast.open}
            autoHideDuration={4000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              severity={toast.severity}
              variant="filled"
              sx={{ borderRadius: "12px", fontWeight: 600 }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        </Box>
      </DashboardShell>
    </AuthGuard>
  );
}

{/* Premium Empty State Component */}
function EmptyState() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          py: { xs: 6, md: 8 },
          px: { xs: 3, md: 6 },
          borderRadius: "24px",
          border: `1px solid ${NEUTRAL.divider}`,
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F6 100%)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.04)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative glow */}
        <Box
          sx={{
            position: "absolute",
            top: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            height: "200px",
            background: `radial-gradient(circle, ${BRAND.main}12 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Icon Circle */}
        <Box
          sx={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${BRAND.main}15 0%, ${BRAND.main}05 100%)`,
            border: `2px solid ${BRAND.main}20`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            color: BRAND.main,
            position: "relative",
          }}
        >
          <HandshakeOutlinedIcon sx={{ fontSize: 42 }} />
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 19,
            color: "#0F172A",
            mb: 1,
            letterSpacing: "-0.01em",
          }}
        >
          Chưa có lời mời nào
        </Typography>

        <Typography
          sx={{
            fontSize: 14.5,
            color: "#64748B",
            maxWidth: 460,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Khi có giảng viên khác mời bạn cùng hợp tác quản lý hoặc giảng dạy khóa học, thông tin lời mời sẽ hiển thị tại đây.
        </Typography>
      </Paper>

      {/* Collaboration Feature Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "20px",
          bgcolor: `${BRAND.main}06`,
          border: `1px solid ${BRAND.main}20`,
          display: "flex",
          gap: 2.5,
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            bgcolor: `${BRAND.main}15`,
            color: BRAND.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 14.5,
              color: "#1E293B",
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Lợi ích khi cộng tác giảng dạy
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              mt: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 18, color: BRAND.main }} />
              <Typography sx={{ fontSize: 13, color: "#475569" }}>
                Chia sẻ tỷ lệ doanh thu khóa học minh bạch
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 18, color: BRAND.main }} />
              <Typography sx={{ fontSize: 13, color: "#475569" }}>
                Phân quyền quản lý nội dung chi tiết
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

{/* Premium Invitation Card */}
function LoiMoiCard({
  loiMoi,
  dangXuLy,
  onPhanHoi,
}: {
  loiMoi: LoiMoiChoXacNhanDto;
  dangXuLy: boolean;
  onPhanHoi?: (id: string, dongY: boolean) => void;
}) {
  const isPending = loiMoi.trangThai === "Pending";
  const quyenDuocCap = DANH_SACH_QUYEN_HIEN_THI.filter(
    (q) => (loiMoi as any)[q.key] === true
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "20px",
        border: `1px solid ${isPending ? `${BRAND.main}35` : "#E2E8F0"}`,
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        transition: "all 0.25s ease-in-out",
        boxShadow: isPending
          ? `0 10px 25px -5px ${BRAND.main}12`
          : "0 4px 12px rgba(0, 0, 0, 0.03)",
        "&:hover": {
          borderColor: isPending ? BRAND.main : "#CBD5E1",
          boxShadow: `0 12px 28px -6px ${BRAND.main}20`,
        },
      }}
    >
      {/* Pending Top Banner Indicator */}
      {isPending && (
        <Box
          sx={{
            background: `linear-gradient(90deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
            px: 3,
            py: 0.75,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.03em" }}>
              LỜI MỜI MỚI CHỜ BẠN PHẢN HỒI
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 11.5, opacity: 0.9 }}>
            {new Date(loiMoi.ngayMoi).toLocaleDateString("vi-VN")}
          </Typography>
        </Box>
      )}

      {/* Main Info Header */}
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            gap: 2.5,
            alignItems: "flex-start",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Course Thumbnail */}
          <Box
            sx={{
              width: { xs: "100%", sm: 100 },
              height: { xs: 140, sm: 64 },
              borderRadius: "14px",
              flexShrink: 0,
              bgcolor: "#F1F5F9",
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
                  bgcolor: "#F8FAFC",
                }}
              >
                <SchoolOutlinedIcon sx={{ color: "#94A3B8", fontSize: 28 }} />
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
                gap: 1.5,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 16.5,
                  color: "#0F172A",
                  lineHeight: 1.35,
                }}
              >
                {loiMoi.tenKhoaHoc || "Chưa có tên khóa học"}
              </Typography>
              <TrangThaiChip trangThai={loiMoi.trangThai} />
            </Box>

            {/* Instructor Inviter */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                flexWrap: "wrap",
              }}
            >
              <Avatar
                src={loiMoi.anhNguoiMoi || ""}
                sx={{
                  width: 26,
                  height: 26,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: BRAND.main,
                  border: "1px solid #fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {loiMoi.tenNguoiMoi?.[0]}
              </Avatar>
              <Typography sx={{ fontSize: 13.5, color: "#475569" }}>
                Giảng viên mời:{" "}
                <strong style={{ color: "#0F172A", fontWeight: 700 }}>
                  {loiMoi.tenNguoiMoi || "Giảng viên chính"}
                </strong>
              </Typography>
              {!isPending && (
                <Typography sx={{ fontSize: 12.5, color: "#94A3B8" }}>
                  · {new Date(loiMoi.ngayMoi).toLocaleDateString("vi-VN")}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: "#F1F5F9" }} />

        {/* Benefits & Permissions Breakdown */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Revenue split & Public badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${BRAND.main}12 0%, ${BRAND.main}04 100%)`,
                border: `1px solid ${BRAND.main}25`,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 18, color: BRAND.main }} />
              <Typography sx={{ fontSize: 13, color: "#334155" }}>
                Tỷ lệ chia doanh thu:{" "}
                <strong style={{ color: BRAND.main, fontSize: 14.5, fontWeight: 800 }}>
                  {loiMoi.tyLeChiaDoanhThu}%
                </strong>
              </Typography>
            </Box>

            {loiMoi.visible ? (
              <Chip
                label="Hiển thị công khai trong danh sách GV"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  bgcolor: "#DCFCE7",
                  color: "#15803D",
                  border: "1px solid #BBF7D0",
                  py: 0.25,
                }}
              />
            ) : (
              <Chip
                label="Không hiển thị công khai"
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  bgcolor: "#F1F5F9",
                  color: "#64748B",
                  border: "1px solid #E2E8F0",
                }}
              />
            )}
          </Box>

          {/* Quyền được cấp */}
          <Box>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 1,
              }}
            >
              Các quyền được cấp:
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {quyenDuocCap.length > 0 ? (
                quyenDuocCap.map((q) => (
                  <Chip
                    key={q.key}
                    icon={<CheckIcon sx={{ fontSize: "14px !important", color: `${BRAND.main} !important` }} />}
                    label={q.nhan}
                    size="small"
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: "#F8FAFC",
                      color: "#334155",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      px: 0.5,
                    }}
                  />
                ))
              ) : (
                <Typography
                  sx={{ fontSize: 13, color: "#94A3B8", fontStyle: "italic" }}
                >
                  Không có quyền bổ sung nào
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Action Footer for Pending Invitations */}
      {isPending && onPhanHoi && (
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            bgcolor: "#FAF8F6",
            borderTop: `1px solid ${BRAND.main}18`,
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              dangXuLy ? <CircularProgress size={16} sx={{ color: "#EF4444" }} /> : <CloseIcon />
            }
            disabled={dangXuLy}
            onClick={() => onPhanHoi(loiMoi.id, false)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13.5,
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
              fontSize: 13.5,
              borderRadius: "12px",
              px: 3.5,
              py: 1,
              boxShadow: `0 4px 14px ${BRAND.main}35`,
              background: `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
              color: "#FFFFFF",
              "&:hover": {
                background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.dark} 100%)`,
                boxShadow: `0 6px 18px ${BRAND.main}45`,
              },
            }}
          >
            Chấp nhận lời mời
          </Button>
        </Box>
      )}
    </Paper>
  );
}
