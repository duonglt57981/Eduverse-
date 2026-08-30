"use client";

import { Box, Chip, alpha } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const TRANG_THAI_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  ChoDuyet: {
    label: "Chờ duyệt",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: <PendingRoundedIcon sx={{ fontSize: "14px !important" }} />,
  },
  DangDuyet: {
    label: "Đang duyệt",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    icon: <HourglassEmptyRoundedIcon sx={{ fontSize: "14px !important" }} />,
  },
  DaDuyet: {
    label: "Đã duyệt",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: "14px !important" }} />,
  },
  TuChoi: {
    label: "Từ chối",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <CancelRoundedIcon sx={{ fontSize: "14px !important" }} />,
  },
  DangSua: {
    label: "Đang sửa",
    color: "#64748B",
    bg: "#F1F5F9",
    border: "#E2E8F0",
    icon: <EditNoteRoundedIcon sx={{ fontSize: "14px !important" }} />,
  },
  XemXet: {
    label: "Xem xét",
    color: "#0284C7",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    icon: <VisibilityRoundedIcon sx={{ fontSize: "14px !important" }} />,
  },
};

export default function StatusChip({
  trangThai,
  size = "small",
  hidePending = false,
}: {
  trangThai?: string;
  size?: "small" | "medium";
  hidePending?: boolean;
}) {
  if (hidePending && (trangThai === "ChoDuyet" || trangThai === "DangDuyet")) {
    return null;
  }
  const config = TRANG_THAI_CONFIG[trangThai ?? ""] || {
    label: trangThai || "Không rõ",
    color: "#64748B",
    bg: "#F1F5F9",
    border: "#E2E8F0",
    icon: null,
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.65,
        px: size === "small" ? 1.25 : 1.5,
        py: size === "small" ? 0.35 : 0.5,
        borderRadius: "999px",
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontWeight: 800,
        fontSize: size === "small" ? 12 : 13,
        letterSpacing: "0.01em",
        boxShadow: `0 1px 4px ${alpha(config.color, 0.08)}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: config.color,
        }}
      >
        {config.icon}
      </Box>
      <span>{config.label}</span>
    </Box>
  );
}
