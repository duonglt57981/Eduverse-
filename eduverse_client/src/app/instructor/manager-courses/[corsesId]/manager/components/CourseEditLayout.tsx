"use client";

import { ReactNode, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import {
  MAU,
  TrangThaiKhoaHoc,
  thongTinTrangThai,
  ThongTinKhoaHocCoBan,
} from "./courseEditCore";
import CourseStatusAction from "./CourseStatusAction";
import type { MucThieu } from "./courseEditCore";

export interface MucSidebar {
  key: string;
  nhan: string;
  hoanThanh: boolean;
}

export interface NhomSidebar {
  tieuDe: string;
  muc: MucSidebar[];
}

interface Props {
  children: ReactNode;
  tenKhoaHoc: string;
  trangThai: TrangThaiKhoaHoc;
  thoiLuongDaTai: string;
  thongTinKhoaHoc: ThongTinKhoaHocCoBan;
  phans: PhanHocType[];
  lyDoTuChoi?: string | null;
  nhomSidebar?: NhomSidebar[];
  activeKey: string;
  loading?: boolean;
  idKhoaHoc?: string;
  onBack: () => void;
  onNavigateSidebar: (key: string) => void;
  onGuiPheDuyet: () => Promise<void>;
  onDiChuyenDenTuValidate: (diChuyenDen: MucThieu["diChuyenDen"]) => void;
  onRefreshData?: () => void;
}

export default function CourseEditLayout({
  children,
  tenKhoaHoc,
  trangThai,
  thoiLuongDaTai,
  thongTinKhoaHoc,
  phans,
  lyDoTuChoi,
  nhomSidebar = [],
  activeKey,
  loading = false,
  idKhoaHoc,
  onBack,
  onNavigateSidebar,
  onGuiPheDuyet,
  onDiChuyenDenTuValidate,
}: Props) {
  const trangThaiHienThi = thongTinTrangThai(trangThai);

  const isReadOnly = trangThai !== "DangSua";

  // Xác định màu sắc nhãn trạng thái tinh tế hơn
  const getStatusChipStyles = (status: TrangThaiKhoaHoc) => {
    switch (status) {
      case "DaDuyet":
        return { bgcolor: "#DCFCE7", color: "#16A34A" };
      case "TuChoi":
        return { bgcolor: "#FEE2E2", color: "#DC2626" };
      case "ChoDuyet":
        return { bgcolor: "#FEF3C7", color: "#D97706" };
      case "DangDuyet":
        return { bgcolor: "#EFF6FF", color: "#2563EB" };
      default:
        return { bgcolor: "#F3F4F6", color: "#4B5563" };
    }
  };

  const statusStyles = getStatusChipStyles(trangThai);

  // Hàm xử lý xem trước - mở trang xem trước khóa học
  const handleXemTruoc = () => {
    // Lấy id từ props hoặc từ URL
    const courseId = idKhoaHoc || window.location.pathname.split("/")[4];
    if (!courseId) {
      console.warn("Không có ID khóa học để xem trước");
      return;
    }
    // Mở trang xem trước trong tab mới
    window.open(
      `/instructor/manager-courses/draft/${courseId}/learn`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#F8F9FB",
        }}
      >
        <CircularProgress sx={{ color: MAU.chinh }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <Box sx={{ bgcolor: "#1c1d1f", color: "#fff" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 4 },
            py: 1.5,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* Left section: Back button & Title & Status */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            {/* Back Button */}
            <Box
              onClick={onBack}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onBack();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                color: "#D1D5DB",
                py: 0.8,
                px: 1.2,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                },
                "&:focus-visible": {
                  outline: `2px solid ${MAU.chinh}`,
                },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                Quay lại
              </Typography>
            </Box>

            <Box
              sx={{
                width: "1px",
                height: 20,
                bgcolor: "rgba(255,255,255,0.15)",
                flexShrink: 0,
              }}
            />

            {/* Course Title */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 15, sm: 16, md: 17 },
                color: "#ffffff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 80,
                maxWidth: { xs: 180, sm: 260, md: 380, lg: 500 },
              }}
              title={tenKhoaHoc}
            >
              {tenKhoaHoc || "Chưa đặt tên"}
            </Typography>

            {/* Status Chip */}
            <Chip
              label={trangThaiHienThi.nhan}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: 11,
                bgcolor: statusStyles.bgcolor,
                color: statusStyles.color,
                borderRadius: "6px",
                px: 0.5,
                flexShrink: 0,
              }}
            />

            {/* Duration text */}
            <Typography
              sx={{
                fontSize: 13,
                color: "#9CA3AF",
                display: { xs: "none", md: "block" },
                flexShrink: 0,
              }}
            >
              | {thoiLuongDaTai}
            </Typography>
          </Box>

          {/* Right section: Action Buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {/* Preview Button - Luôn hoạt động */}
            <Button
              onClick={handleXemTruoc}
              variant="outlined"
              sx={{
                color: "#D1D5DB",
                borderColor: "rgba(255,255,255,0.3)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                py: 0.8,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#ffffff",
                },
                "&:focus-visible": {
                  outline: `2px solid ${MAU.chinh}`,
                },
              }}
            >
              Xem trước
            </Button>

            {/* Approval Action Component */}
            <CourseStatusAction
              trangThai={trangThai}
              thongTinKhoaHoc={thongTinKhoaHoc}
              phans={phans}
              lyDoTuChoi={lyDoTuChoi}
              onGuiPheDuyet={onGuiPheDuyet}
              onDiChuyenDen={onDiChuyenDenTuValidate}
            />

            {/* Settings button */}
            <IconButton
              size="small"
              sx={{
                color: "#D1D5DB",
                p: 1,
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                },
              }}
              aria-label="Cài đặt khóa học"
            >
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Box
          component="nav"
          sx={{
            width: 280,
            flexShrink: 0,
            px: 3,
            py: 4,
            bgcolor: "#ffffff",
            borderRight: "1px solid #E5E7EB",
            display: { xs: "none", md: "block" },
          }}
        >
          {Array.isArray(nhomSidebar) &&
            nhomSidebar.map((nhom) => (
              <Box key={nhom.tieuDe} sx={{ mb: 3.5 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    mb: 2,
                    color: "#9CA3AF",
                  }}
                >
                  {nhom.tieuDe}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {nhom.muc.map((m) => {
                    const dangChon = m.key === activeKey;
                    return (
                      <Box
                        key={m.key}
                        onClick={() => {
                          onNavigateSidebar(m.key);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            onNavigateSidebar(m.key);
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1.2,
                          pl: dangChon ? 1.5 : 2,
                          borderLeft: dangChon
                            ? `3px solid ${MAU.chinh}`
                            : "3px solid transparent",
                          cursor: "pointer",
                          borderRadius: dangChon ? "0 8px 8px 0" : "8px",
                          bgcolor: dangChon ? "#FFF1F2" : "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: dangChon ? "#FFF1F2" : "#F3F4F6",
                          },
                          "&:focus-visible": {
                            outline: `2px solid ${MAU.chinh}`,
                          },
                        }}
                      >
                        {m.hoanThanh ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: MAU.chinh }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "#9CA3AF" }}
                          />
                        )}
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: dangChon ? 700 : 500,
                            color: dangChon ? MAU.chinh : "#374151",
                            transition: "color 0.2s ease",
                          }}
                        >
                          {m.nhan}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
        </Box>

        <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, py: 4, minWidth: 0 }}>
          {isReadOnly && (
            <Box
              sx={{
                mb: 3,
                px: 2.5,
                py: 1.5,
                borderRadius: "12px",
                bgcolor: "#FFFBEB",
                border: "1px solid #FDE68A",
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                boxShadow: "0 2px 8px rgba(251,191,36,0.03)",
              }}
            >
              <Typography
                sx={{ fontSize: 13.5, color: "#D97706", fontWeight: 600 }}
              >
                {trangThai === "DaDuyet"
                  ? "✅ Khóa học đã được duyệt — bạn chỉ có thể xem nội dung."
                  : trangThai === "TuChoi"
                    ? "❌ Khóa học bị từ chối — bạn chỉ có thể xem nội dung."
                    : "⏳ Khóa học đang trong quá trình duyệt — bạn chỉ có thể xem nội dung."}
              </Typography>
            </Box>
          )}

          {children}
        </Box>
      </Box>
    </Box>
  );
}
