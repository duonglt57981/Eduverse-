"use client";
import { Chip, Box } from "@mui/material";
import {
  COLORS,
  FONTS,
  normalizeTrangThai,
} from "@/src/app/admin/approve-courses/types/constants"; // removed TrangThaiKiemDuyet
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";

// Define the config type with optional stamp
type TrangThaiConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactElement;
  stamp?: boolean;
};

const TRANG_THAI_CONFIG: Record<string, TrangThaiConfig> = {
  DangSua: {
    label: "Đang sửa",
    color: COLORS.inkSoft,
    bg: "#F1EBE8",
    icon: <EditNoteRoundedIcon sx={{ fontSize: 15 }} />,
  },
  ChoDuyet: {
    label: "Chờ duyệt",
    color: COLORS.gold,
    bg: COLORS.goldSoft,
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 15 }} />,
  },
  DangDuyet: {
    label: "Đang chờ duyệt",
    color: COLORS.gold,
    bg: COLORS.goldSoft,
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 15 }} />,
  },
  DaDuyet: {
    label: "Đã duyệt",
    color: COLORS.success,
    bg: COLORS.successSoft,
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />,
    stamp: true,
  },
  TuChoi: {
    label: "Từ chối",
    color: COLORS.danger,
    bg: COLORS.dangerSoft,
    icon: <CancelRoundedIcon sx={{ fontSize: 15 }} />,
    stamp: true,
  },
};

export default function StatusChip({
  trangThai,
  size = "medium",
}: {
  trangThai: string | null | undefined;
  size?: "small" | "medium";
}) {
  const status = normalizeTrangThai(trangThai);
  const cfg = TRANG_THAI_CONFIG[status];

  if (cfg.stamp) {
    const rotate = status === "DaDuyet" ? "-6deg" : "4deg";
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: size === "small" ? 1 : 1.4,
          py: size === "small" ? 0.2 : 0.4,
          border: `1.5px solid ${cfg.color}`,
          borderRadius: "3px",
          color: cfg.color,
          transform: `rotate(${rotate})`,
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: size === "small" ? 10.5 : 12,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          lineHeight: 1,
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {cfg.icon}
        {cfg.label}
      </Box>
    );
  }

  return (
    <Chip
      size="small"
      icon={cfg.icon}
      label={cfg.label}
      sx={{
        color: cfg.color,
        bgcolor: cfg.bg,
        fontWeight: 600,
        fontSize: size === "small" ? 11 : 12,
        height: size === "small" ? 22 : 24,
        borderRadius: 1,
        flexShrink: 0,
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
}
