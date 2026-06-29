// src/app/instructor/manager-courses/types/constants.tsx
import {
  Box,
  Card,
  Button,
  Chip,
  alpha,
  styled,
  keyframes,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ClearIcon from "@mui/icons-material/Clear";
import React from "react";
import { Versionable } from "./index";

// ─── Brand colors ─────────────────────────────────────────────────────────────
export const R = "#8D1313";
export const RH = "#6B1010";
export const RL = "#B22222";

// ─── Status config ────────────────────────────────────────────────────────────
interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactElement;
}

export const STATUS_MAP: Record<string, StatusConfig> = {
  HoatDong: {
    label: "Hoạt động",
    color: "#2e7d32",
    bg: "#e8f5e9",
    icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
  },
  DaDuyet: {
    label: "Đã duyệt",
    color: "#1565c0",
    bg: "#e3f2fd",
    icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
  },
  ChoDuyet: {
    label: "Chờ duyệt",
    color: "#e65100",
    bg: "#fff3e0",
    icon: <PendingIcon sx={{ fontSize: 13 }} />,
  },
  DangDuyet: {
    label: "Đang duyệt",
    color: "#6a1b9a",
    bg: "#f3e5f5",
    icon: <PendingIcon sx={{ fontSize: 13 }} />,
  },
  DangSua: {
    label: "Đang sửa",
    color: "#37474f",
    bg: "#eceff1",
    icon: <EditNoteIcon sx={{ fontSize: 13 }} />,
  },
  NgungHoatDong: {
    label: "Ngừng HĐ",
    color: "#b71c1c",
    bg: "#ffebee",
    icon: <ClearIcon sx={{ fontSize: 13 }} />,
  },
  TuChoi: {
    label: "Từ chối",
    color: "#b71c1c",
    bg: "#ffebee",
    icon: <ClearIcon sx={{ fontSize: 13 }} />,
  },
};

const DEFAULT_STATUS: Omit<StatusConfig, "icon"> & {
  icon?: React.ReactElement;
} = {
  label: "—",
  color: "#555",
  bg: "#eee",
  icon: undefined,
};

export function statusChip(status?: string) {
  const known = status ? STATUS_MAP[status] : undefined;
  const s = known ?? { ...DEFAULT_STATUS, label: status ?? "—" };

  return (
    <Chip
      icon={s.icon}
      label={s.label}
      size="small"
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
        "& .MuiChip-icon": { color: s.color, ml: "6px" },
      }}
    />
  );
}

// ─── Animations ───────────────────────────────────────────────────────────────
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
export const PageWrap = styled(Box)({
  minHeight: "100vh",
  background: "#f9f4f4",
  padding: "24px 28px",
});

// MUI v9: Card no longer accepts arbitrary props like `selected` directly on styled.
// Use a wrapper approach with sx instead, or cast via `shouldForwardProp`.
export const KhoaHocCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ selected }) => ({
  borderRadius: 14,
  border: `1.5px solid ${selected ? R : "#f0dada"}`,
  cursor: "pointer",
  transition: "all 0.2s",
  background: selected ? `linear-gradient(135deg,#fff5f5,#fff)` : "#fff",
  boxShadow: selected
    ? `0 4px 20px ${alpha(R, 0.18)}`
    : "0 2px 8px rgba(0,0,0,0.05)",
  animation: `${fadeIn} 0.3s ease`,
  "&:hover": {
    borderColor: alpha(R, 0.5),
    boxShadow: `0 6px 24px ${alpha(R, 0.14)}`,
  },
}));

export const PhanRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "depth",
})<{ depth?: number }>(({ depth = 0 }) => ({
  borderRadius: 10,
  border: "1px solid #f0dada",
  marginBottom: 8,
  background: "#fff",
  marginLeft: depth * 16,
  animation: `${fadeIn} 0.25s ease`,
}));

export const BaiGiangRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #fde8e8",
  marginBottom: 6,
  background: "#fffafa",
  animation: `${fadeIn} 0.2s ease`,
  "&:hover": { background: "#fff5f5" },
});

export const TaiLieuRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px dashed #fcc",
  marginBottom: 4,
  background: "#fffefe",
  animation: `${fadeIn} 0.2s ease`,
});

export const ActionBtn = styled(Button)({
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 8,
  fontSize: "0.8rem",
  padding: "5px 14px",
});

export const RedBtn = styled(ActionBtn)({
  background: R,
  color: "#fff",
  "&:hover": { background: RH },
});

export const OutlineBtn = styled(ActionBtn)({
  border: `1.5px solid ${alpha(R, 0.4)}`,
  color: R,
  "&:hover": { background: alpha(R, 0.06), borderColor: R },
});

export const SectionHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  cursor: "pointer",
  "&:hover": { background: alpha(R, 0.03) },
});

export const UploadZone = styled(Box)({
  border: `2px dashed ${alpha(R, 0.35)}`,
  borderRadius: 10,
  padding: "20px 16px",
  textAlign: "center",
  cursor: "pointer",
  background: alpha(R, 0.02),
  transition: "all 0.2s",
  "&:hover": { background: alpha(R, 0.05), borderColor: R },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function fmtTime(secs?: number) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}p` : `${m} phút`;
}

export function isValidImg(url?: string) {
  if (!url) return false;
  const t = url.trim();
  return t.startsWith("http") && t !== "aaaaaaaa";
}

export function isDraftCourse(course: Versionable): boolean {
  return !!course.idBanGhiTruoc;
}

export function isCurrentVersion(course: Versionable): boolean {
  return course.isBanHienTai === true;
}

export function isLockedApprovedCourse(course: {
  trangThaiPheDuyet?: string;
  isBanHienTai?: boolean;
}): boolean {
  return course.trangThaiPheDuyet === "DaDuyet" && course.isBanHienTai === true;
}

export function getVersionType(
  item: Versionable,
): "current" | "draft" | "unknown" {
  if (isCurrentVersion(item) && !isDraftCourse(item)) return "current";
  if (isDraftCourse(item)) return "draft";
  return "unknown";
}

/**
 * Group versions by parent id (idBanGhiTruoc)
 */
export function groupVersions<T extends Versionable>(
  items: T[],
): Record<string, { current: T | null; drafts: T[] }> {
  const groups: Record<string, { current: T | null; drafts: T[] }> = {};
  const processed = new Set<string>();

  // Find current versions first
  for (const item of items) {
    if (isCurrentVersion(item) && !isDraftCourse(item) && item.id) {
      processed.add(item.id);
      groups[item.id] = {
        current: item,
        drafts: items.filter((i) => i.idBanGhiTruoc === item.id),
      };
    }
  }

  // Handle remaining items (drafts without current version)
  for (const item of items) {
    if (!processed.has(item.id!) && item.id) {
      if (item.idBanGhiTruoc && !groups[item.idBanGhiTruoc]) {
        const current = items.find(
          (i) => i.id === item.idBanGhiTruoc && isCurrentVersion(i),
        );
        if (current) {
          groups[current.id!] = {
            current,
            drafts: items.filter((i) => i.idBanGhiTruoc === current.id),
          };
          processed.add(current.id!);
        } else {
          groups[item.id] = { current: null, drafts: [item] };
          processed.add(item.id);
        }
      } else if (!item.idBanGhiTruoc) {
        groups[item.id] = { current: item, drafts: [] };
        processed.add(item.id);
      }
    }
  }

  return groups;
}
