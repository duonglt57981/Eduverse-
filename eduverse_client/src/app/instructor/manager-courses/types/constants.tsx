/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/instructor/manager-courses/types/constants.tsx
"use client";

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
import { ApiListShape, Versionable } from "./index";

// ─────────────────────────────────────────────────────────────────────────
// Design tokens — phong cách Udemy
// ─────────────────────────────────────────────────────────────────────────

export const R = "#8D1313";
export const RH = "#6B1010";
export const RL = "#B22222";

export const PAGE_BG = "#f7f9fa";
export const TEXT_DARK = "#1c1d1f";
export const TEXT_GRAY = "#6a6f73";
export const TEXT_MUTED = "#9ca3af";
export const BORDER_GRAY = "#e3e5e8";
export const BORDER_GRAY_STRONG = "#d1d7dc";
export const SURFACE = "#ffffff";
export const SURFACE_SUBTLE = "#f7f9fa";

// ─── Status config ────────────────────────────────────────────────────────
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
        borderRadius: "5px",
        "& .MuiChip-icon": { color: s.color, ml: "6px" },
      }}
    />
  );
}

// ─── Helper trạng thái ──────────────────────────────────────────────
export function canGuiDuyet(status?: string): boolean {
  return status === "DangSua";
}
export function canSuaTiep(status?: string): boolean {
  return status === "ChoDuyet";
}
export function isApproved(status?: string): boolean {
  return status === "DaDuyet";
}
// Chỉ 2 trạng thái này mới khoá không cho thêm/sửa/xoá khóa học, phần, bài
// giảng, tài liệu: đang "Chờ duyệt" hoặc đang "Đang duyệt". Các trạng thái
// khác (DangSua, DaDuyet, TuChoi...) không bị chặn bởi hàm này (DaDuyet vẫn
// bị khoá riêng bởi isLockedApprovedCourse ở nơi gọi).
export function isPendingApproval(status?: string): boolean {
  return status === "ChoDuyet" || status === "DangDuyet";
}

// ─── Animations ───────────────────────────────────────────────────────────
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Layout shells ─────────────────────────────────────────────────────────
export const PageWrap = styled(Box)({
  minHeight: "100vh",
  background: "transparent",
  padding: "32px 40px",
});

// ─── Course card ────────────────────────────────────────────────────────────
export const KhoaHocCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ selected }) => ({
  borderRadius: 16,
  border: `1px solid ${selected ? R : "rgba(141, 19, 19, 0.08)"}`,
  cursor: "pointer",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  background: selected
    ? `linear-gradient(135deg, rgba(141,19,19,0.03) 0%, #fff 100%)`
    : "#fff",
  boxShadow: selected
    ? `0 10px 25px ${alpha(R, 0.08)}`
    : "0 4px 20px rgba(0, 0, 0, 0.015)",
  animation: `${fadeIn} 0.3s ease`,
  "&:hover": {
    borderColor: R,
    boxShadow: `0 12px 30px ${alpha(R, 0.1)}`,
    transform: "translateY(-2px)",
  },
}));

export const PhanRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== "depth",
})<{ depth?: number }>(({ depth = 0 }) => ({
  borderRadius: 12,
  border: "1px solid rgba(141, 19, 19, 0.06)",
  marginBottom: 10,
  background: "#fff",
  marginLeft: depth * 16,
  boxShadow: "0 2px 12px rgba(141, 19, 19, 0.01)",
  animation: `${fadeIn} 0.25s ease`,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: alpha(R, 0.3),
    boxShadow: "0 4px 16px rgba(141, 19, 19, 0.03)",
  },
}));

export const BaiGiangRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(141, 19, 19, 0.04)",
  marginBottom: 8,
  background: "#fffcfc",
  animation: `${fadeIn} 0.2s ease`,
  transition: "all 0.2s ease",
  "&:hover": {
    background: "rgba(141, 19, 19, 0.02)",
    borderColor: alpha(R, 0.15),
  },
});

export const TaiLieuRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px dashed rgba(141, 19, 19, 0.15)",
  marginBottom: 6,
  background: "#ffffff",
  animation: `${fadeIn} 0.2s ease`,
  transition: "all 0.2s ease",
  "&:hover": {
    background: "rgba(141, 19, 19, 0.01)",
    borderColor: alpha(R, 0.35),
  },
});

// ─── Buttons ──────────────────────────────────────────────────────────────
export const ActionBtn = styled(Button)({
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 12,
  fontSize: "0.85rem",
  padding: "8px 20px",
  boxShadow: "none",
  transition: "all 0.2s ease-in-out",
});

export const RedBtn = styled(ActionBtn)({
  background: R,
  color: "#fff",
  "&:hover": {
    background: RH,
    transform: "translateY(-1px)",
    boxShadow: "0 6px 16px rgba(141, 19, 19, 0.2)",
  },
  "&:disabled": {
    background: alpha(R, 0.35),
    color: "#fff",
  },
});

export const OutlineBtn = styled(ActionBtn)({
  border: `1.5px solid ${alpha(R, 0.4)}`,
  color: R,
  background: "transparent",
  "&:hover": {
    background: alpha(R, 0.04),
    borderColor: R,
    transform: "translateY(-1px)",
  },
});

export const SectionHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": { background: alpha(R, 0.02) },
});

export const UploadZone = styled(Box)({
  border: `2px dashed rgba(141, 19, 19, 0.2)`,
  borderRadius: 12,
  padding: "24px 20px",
  textAlign: "center",
  cursor: "pointer",
  background: "rgba(141, 19, 19, 0.01)",
  transition: "all 0.25s ease",
  "&:hover": {
    background: alpha(R, 0.04),
    borderColor: R,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────
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

export function groupVersions<T extends Versionable>(
  items: T[],
): Record<string, { current: T | null; drafts: T[] }> {
  const groups: Record<string, { current: T | null; drafts: T[] }> = {};
  const processed = new Set<string>();

  for (const item of items) {
    if (isCurrentVersion(item) && !isDraftCourse(item) && item.id) {
      processed.add(item.id);
      groups[item.id] = {
        current: item,
        drafts: items.filter((i) => i.idBanGhiTruoc === item.id),
      };
    }
  }

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

export function extractList<T>(res: ApiListShape<T>): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data ?? res.items ?? [];
}

// ─── Chuẩn hoá response API ─────────────────────────────────────────────────
// Dùng chung cho toàn bộ create/update/delete/chuyển trạng thái: response trả
// về success/status false -> lấy đúng message lỗi từ backend; success -> lấy
// data mới nhất (nếu có) để cập nhật UI lạc quan.
export interface ResolvedApiResult<T = any> {
  ok: boolean;
  data: T | null;
  errorMsg: string | null;
}

export function resolveApiResult<T = any>(result: any): ResolvedApiResult<T> {
  // Nếu gọi API không ném lỗi (axios đã throw cho status lỗi) nhưng response
  // rỗng (VD: 204 No Content khi xoá), coi là thành công — không có nghĩa là
  // "Không có phản hồi".
  if (result === null || result === undefined) {
    return { ok: true, data: null, errorMsg: null };
  }
  const explicitFail =
    result.success === false ||
    (typeof result.status === "number" && result.status >= 400);
  if (explicitFail) {
    const msg =
      result.message ||
      (Array.isArray(result.errors)
        ? result.errors.join(", ")
        : result.errors) ||
      "Thao tác thất bại";
    return { ok: false, data: null, errorMsg: msg };
  }
  const data = result.data ?? result.result ?? result.khoaHoc ?? null;
  return { ok: true, data, errorMsg: null };
}

export function getErrMsg(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const msg = (error as any).response?.data?.message;
    if (msg) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// ─── Validate file ảnh bìa (jpg/jpeg/png, tối đa 10MB) ─────────────────────
export const ALLOWED_IMG_EXT = [".jpg", ".jpeg", ".png"];
export const MAX_IMG_MB = 10;

export function getFileExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx >= 0 ? filename.slice(idx).toLowerCase() : "";
}

export function isValidImgExt(filename: string): boolean {
  return ALLOWED_IMG_EXT.includes(getFileExt(filename));
}

export function validateImgFile(file: File): string | null {
  if (!isValidImgExt(file.name)) {
    return `Ảnh chỉ chấp nhận định dạng ${ALLOWED_IMG_EXT.join(", ")}`;
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_IMG_MB) {
    return `Ảnh vượt quá ${MAX_IMG_MB}MB (hiện tại ${sizeMb.toFixed(1)}MB)`;
  }
  return null;
}
