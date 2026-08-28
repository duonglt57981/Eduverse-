"use client";
import { Chip, Box, alpha } from "@mui/material";
import {
  COLORS,
  FONTS,
  normalizeTrangThai,
} from "@/src/app/admin/approve-courses/types/constants";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import { CSSVAR } from "@/src/theme/tokens";

type TrangThaiConfig = {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactElement;
  stamp?: boolean;
};

const TRANG_THAI_CONFIG: Record<string, TrangThaiConfig> = {
  DangSua: {
    label: "Đang chỉnh sửa",
    color: "#64748B",
    bg: "#F1F5F9",
    border: "#E2E8F0",
    icon: <EditNoteRoundedIcon sx={{ fontSize: 14 }} />,
  },
  ChoDuyet: {
    label: "Chờ kiểm duyệt",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 14 }} />,
  },
  DangDuyet: {
    label: "Đang chờ duyệt",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 14 }} />,
  },
  DaDuyet: {
    label: "Đã duyệt",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
    stamp: true,
  },
  TuChoi: {
    label: "Từ chối",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: <CancelRoundedIcon sx={{ fontSize: 14 }} />,
    stamp: true,
  },
};

export default function StatusChip({
  trangThai,
  size = "medium",
  hidePending = false,
}: {
  trangThai: string | null | undefined;
  size?: "small" | "medium";
  hidePending?: boolean;
}) {
  const status = normalizeTrangThai(trangThai);
  if (hidePending && (status === "ChoDuyet" || status === "DangDuyet")) {
    return null;
  }
  const cfg = TRANG_THAI_CONFIG[status];
  if (!cfg) return null;

  if (cfg.stamp) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.6,
          px: size === "small" ? 1.2 : 1.6,
          py: size === "small" ? 0.35 : 0.5,
          border: `1px solid ${cfg.border}`,
          bgcolor: cfg.bg,
          borderRadius: "999px",
          color: cfg.color,
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: size === "small" ? 11 : 12.5,
          letterSpacing: "0.02em",
          lineHeight: 1,
          userSelect: "none",
          flexShrink: 0,
          boxShadow: `0 2px 6px ${alpha(cfg.color, 0.08)}`,
        }}
      >
        {cfg.icon}
        {cfg.label}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: size === "small" ? 1.2 : 1.6,
        py: size === "small" ? 0.35 : 0.5,
        border: `1px solid ${cfg.border}`,
        bgcolor: cfg.bg,
        borderRadius: "999px",
        color: cfg.color,
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: size === "small" ? 11 : 12.5,
        letterSpacing: "0.02em",
        lineHeight: 1,
        userSelect: "none",
        flexShrink: 0,
        boxShadow: `0 2px 6px ${alpha(cfg.color, 0.06)}`,
      }}
    >
      {cfg.icon}
      {cfg.label}
    </Box>
  );
}
