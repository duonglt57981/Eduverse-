"use client";

import { ReactNode, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIosNew";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
import { MAU, TrangThaiKhoaHoc, thongTinTrangThai } from "./courseEditCore";
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
  thongTinKhoaHoc: KhoaHocType;
  phans: PhanHocType[];
  lyDoTuChoi?: string | null;
  nhomSidebar?: NhomSidebar[];
  activeKey: string;
  loading?: boolean;
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
  onBack,
  onNavigateSidebar,
  onGuiPheDuyet,
  onDiChuyenDenTuValidate,
}: Props) {
  const [anchorXemTruoc, setAnchorXemTruoc] = useState<null | HTMLElement>(
    null,
  );
  const trangThaiHienThi = thongTinTrangThai(trangThai);

  // Kiểm tra nếu đang ở trạng thái không cho phép chỉnh sửa
  const isReadOnly = trangThai !== "DangSua";

  // Xác định màu sắc nhãn trạng thái tinh tế hơn
  const getStatusChipStyles = (status: TrangThaiKhoaHoc) => {
    switch (status) {
      case "DaDuyet":
        return { bgcolor: "#DCFCE7", color: "#16A34A" }; // Green
      case "TuChoi":
        return { bgcolor: "#FEE2E2", color: "#DC2626" }; // Red
      case "ChoDuyet":
        return { bgcolor: "#FEF3C7", color: "#D97706" }; // Amber
      case "DangDuyet":
        return { bgcolor: "#EFF6FF", color: "#2563EB" }; // Blue
      default:
        return { bgcolor: "#F3F4F6", color: "#4B5563" }; // Gray for DangSua
    }
  };

  const statusStyles = getStatusChipStyles(trangThai);

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8F9FB", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
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
                color: "#4B5563",
                py: 0.8,
                px: 1.2,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "#F3F4F6",
                  color: "#111827",
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

            <Box sx={{ width: "1px", height: 20, bgcolor: "#E5E7EB", flexShrink: 0 }} />

            {/* Course Title */}
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: 15, sm: 16, md: 17 },
                color: "#111827",
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
                color: "#6B7280",
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
            {/* Preview Button */}
            <Button
              onClick={(e) => setAnchorXemTruoc(e.currentTarget)}
              variant="outlined"
              endIcon={<KeyboardArrowDownIcon />}
              sx={{
                color: "#4B5563",
                borderColor: "#D1D5DB",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 2,
                py: 0.8,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#F3F4F6",
                  borderColor: "#9CA3AF",
                  color: "#111827",
                },
                "&:focus-visible": {
                  outline: `2px solid ${MAU.chinh}`,
                },
              }}
            >
              Xem trước
            </Button>
            <Menu
              anchorEl={anchorXemTruoc}
              open={Boolean(anchorXemTruoc)}
              onClose={() => setAnchorXemTruoc(null)}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    border: "1px solid #E5E7EB",
                    mt: 0.5,
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => setAnchorXemTruoc(null)}
                sx={{ fontSize: 14, color: "#374151", py: 1 }}
              >
                Xem trang đích
              </MenuItem>
              <MenuItem
                onClick={() => setAnchorXemTruoc(null)}
                sx={{ fontSize: 14, color: "#374151", py: 1 }}
              >
                Xem chương trình giảng dạy
              </MenuItem>
            </Menu>

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
                color: "#4B5563",
                p: 1,
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                "&:hover": {
                  bgcolor: "#F3F4F6",
                  color: "#111827",
                },
              }}
              aria-label="Cài đặt khóa học"
            >
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Page Layout */}
      <Box sx={{ display: "flex", flex: 1, alignItems: "stretch" }}>
        {/* Left Sidebar Panel */}
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
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                >
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
                          if (e.key === "Enter" || e.key === " ") onNavigateSidebar(m.key);
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

        {/* Content Panel */}
        <Box sx={{ flex: 1, px: { xs: 2, sm: 3, md: 4 }, py: 4, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {/* Read-only notification box */}
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

          {/* Render children page contents */}
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
