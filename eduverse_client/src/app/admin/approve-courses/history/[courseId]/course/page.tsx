/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  LinearProgress,
  Paper,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import QuizIcon from "@mui/icons-material/Quiz";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import AuthGuard from "@/src/components/AuthGuard";
import KiemDuyetService from "@/src/services/KiemDuyetServide";
import {
  KiemDuyetDetailDto,
  LichSuKiemDuyetDto,
} from "@/src/types/KiemDuyet/Dto/dto";
import { ApiResponse } from "@/src/types/types";
import { BRAND, NEUTRAL, STATUS, FONT_FAMILY, CSSVAR } from "@/src/theme/tokens";

// ======================== CONSTANTS ========================
const COLORS = {
  primary: BRAND.main,
  primaryDark: BRAND.dark,
  primarySoft: BRAND.light,
  ink: NEUTRAL.textPrimary,
  inkSoft: NEUTRAL.textSecondary,
  paper: NEUTRAL.bg,
  paperRaised: NEUTRAL.paper,
  line: NEUTRAL.divider,
  gold: STATUS.warningDark,
  goldSoft: STATUS.warningSoft,
  success: STATUS.success,
  successSoft: STATUS.successSoft,
  danger: STATUS.error,
  dangerSoft: STATUS.errorSoft,
};

const FONTS = {
  display: FONT_FAMILY,
  body: FONT_FAMILY,
};

function mix(color: string, weight: number): string {
  const w = Math.min(1, Math.max(0, weight));

  const varMatch = color.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/i);
  if (varMatch) {
    const [, varName, fallback] = varMatch;
    if (fallback) {
      return `color-mix(in srgb, var(${varName}, ${fallback}) ${
        w * 100
      }%, transparent)`;
    }
    return `color-mix(in srgb, var(${varName}) ${w * 100}%, transparent)`;
  }

  const rgbMatch = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i,
  );
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${w})`;
  }

  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${w})`;
  }

  return color;
}

const boxSx = {
  border: `1px solid ${COLORS.line}`,
  borderRadius: 2.5,
  bgcolor: COLORS.paperRaised,
  boxShadow:
    "0 1px 2px rgba(36,26,28,0.04), 0 8px 24px -18px rgba(36,26,28,0.35)",
  transition: "box-shadow .2s ease, border-color .2s ease",
};

const VIEW_MIN_HEIGHT = 300;
const VIEW_MAX_HEIGHT = 600;
const FULL_HEIGHT = "calc(100vh - 132px)";
const TOOLBAR_CROP_PX = 48;
const LOAD_TIMEOUT_MS = 30000;

const scrollbarSx = {
  overflowY: "auto" as const,
  overflowX: "hidden" as const,
  minHeight: 0,
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: mix(COLORS.primary, 0.25),
    borderRadius: 8,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: mix(COLORS.primary, 0.4),
  },
};

// ======================== UTILITY FUNCTIONS ========================
function normalizeTrangThai(trangThaiPheDuyet: unknown): string {
  if (
    typeof trangThaiPheDuyet === "string" &&
    ["DangSua", "ChoDuyet", "DangDuyet", "DaDuyet", "TuChoi"].includes(
      trangThaiPheDuyet,
    )
  ) {
    return trangThaiPheDuyet;
  }
  return "ChoDuyet";
}

function isTrangThaiCho(trangThaiPheDuyet: unknown) {
  return trangThaiPheDuyet === "ChoDuyet" || trangThaiPheDuyet === "DangDuyet";
}

function normalizeDetailResponse(res: any) {
  const isSuccess = res?.status ?? true;
  if (!isSuccess) return null;
  let data = res?.data ?? res?.result ?? res;
  if (
    data &&
    typeof data === "object" &&
    data.data &&
    !data.baiGiangs &&
    !data.taiLieus &&
    !data.baiGiangChoDuyet
  ) {
    data = data.data;
  }
  return data;
}

function getFileKind(url: string): "pdf" | "image" | "office" | "other" {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(clean)) return "image";
  if (/\.(docx?|xlsx?|pptx?)$/.test(clean)) return "office";
  return "other";
}

function getFileName(url: string, fallback: string) {
  try {
    const clean = url.split("?")[0];
    const name = clean.substring(clean.lastIndexOf("/") + 1);
    return name || fallback;
  } catch {
    return fallback;
  }
}

function sortPending(arr: any[]) {
  return [...arr].sort((x, y) => {
    const px = isTrangThaiCho(x.trangThaiPheDuyet) ? 0 : 1;
    const py = isTrangThaiCho(y.trangThaiPheDuyet) ? 0 : 1;
    return px - py;
  });
}

function demCho(arr: any[]) {
  return arr.filter((x) => isTrangThaiCho(x.trangThaiPheDuyet)).length;
}

function formatDate(date?: Date | string | null): string {
  if (!date) return "Chưa có";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Không xác định";
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Không xác định";
  }
}

function getStatusLabel(status?: string | null): string {
  const map: Record<string, string> = {
    DaDuyet: "Đã duyệt",
    TuChoi: "Từ chối",
    ChoDuyet: "Chờ duyệt",
    DangDuyet: "Đang chờ duyệt",
    DangSua: "Đang sửa",
  };
  return map[status || ""] || status || "Không xác định";
}

function getStatusColor(status?: string | null): string {
  const map: Record<string, string> = {
    DaDuyet: COLORS.success,
    TuChoi: COLORS.danger,
    ChoDuyet: COLORS.gold,
    DangDuyet: COLORS.gold,
    DangSua: COLORS.inkSoft,
  };
  return map[status || ""] || COLORS.inkSoft;
}

// ======================== CLOUDINARY HELPERS ========================
interface CloudinaryUrlInfo {
  cloudName: string;
  publicId: string;
  version: string;
  baseUrl: string;
}

function parseCloudinaryUrl(url: string): CloudinaryUrlInfo | null {
  try {
    const u = new URL(url);
    if (
      !u.hostname.includes("cloudinary.com") &&
      !u.hostname.includes("res.cloudinary.com")
    ) {
      return null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[1] !== "video" || parts[2] !== "upload") {
      return null;
    }
    const cloudName = parts[0];
    const baseUrl = `${u.origin}/${cloudName}/video/upload`;
    const afterUpload = parts.slice(3);

    let versionIdx = -1;
    for (let i = 0; i < afterUpload.length; i++) {
      if (/^v\d{8,}$/.test(afterUpload[i])) {
        versionIdx = i;
        break;
      }
    }

    let version = "";
    let publicIdSegments: string[];
    if (versionIdx !== -1) {
      version = afterUpload[versionIdx];
      publicIdSegments = afterUpload.slice(versionIdx + 1);
    } else {
      let startIdx = 0;
      for (let i = 0; i < afterUpload.length - 1; i++) {
        if (
          /^(sp_|vc_|ac_|f_|q_|w_|h_|c_|fl_|so_|du_|br_|fps_)/.test(
            afterUpload[i],
          )
        ) {
          startIdx = i + 1;
        }
      }
      publicIdSegments = afterUpload.slice(startIdx);
    }

    const lastSeg = publicIdSegments[publicIdSegments.length - 1];
    publicIdSegments[publicIdSegments.length - 1] = lastSeg.replace(
      /\.[^.]+$/,
      "",
    );
    const publicId = publicIdSegments.join("/");
    if (!publicId) return null;

    return { cloudName, publicId, version, baseUrl };
  } catch {
    return null;
  }
}

function buildCloudinaryHlsUrl(
  info: CloudinaryUrlInfo,
  profile: string,
): string {
  const versionPart = info.version ? `${info.version}/` : "";
  return `${info.baseUrl}/${profile}/${versionPart}${info.publicId}.m3u8`;
}

function getOptimalHlsUrl(originalUrl: string): {
  masterUrl: string;
  cloudinaryInfo: CloudinaryUrlInfo | null;
} {
  const info = parseCloudinaryUrl(originalUrl);
  if (!info) return { masterUrl: originalUrl, cloudinaryInfo: null };
  return {
    masterUrl: buildCloudinaryHlsUrl(info, "sp_auto"),
    cloudinaryInfo: info,
  };
}

// ======================== VIDEO.JS STYLES ========================
const VIDEO_JS_STYLES = `
  .video-js .vjs-big-play-button {
    background-color: rgba(0,0,0,0.6) !important;
    border: none !important;
    border-radius: 12px !important;
    width: 68px !important;
    height: 48px !important;
    line-height: 48px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    transition: background-color 0.2s !important;
  }
  .video-js:hover .vjs-big-play-button {
    background-color: ${COLORS.primary} !important;
  }
  .video-js .vjs-control-bar {
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%) !important;
    height: 48px !important;
    padding: 0 12px !important;
    display: flex !important;
    align-items: center !important;
  }
  .video-js .vjs-progress-control {
    position: absolute !important;
    top: -5px !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 5px !important;
    display: flex !important;
    align-items: center !important;
    cursor: pointer !important;
    transition: transform 0.1s, top 0.1s, height 0.1s !important;
  }
  .video-js .vjs-progress-control .vjs-progress-holder {
    margin: 0 12px !important;
    height: 3px !important;
    transition: height 0.1s !important;
    border-radius: 0 !important;
    background-color: rgba(255,255,255,0.2) !important;
  }
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 5px !important;
  }
  .video-js .vjs-play-progress {
    background-color: ${COLORS.primary} !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.4) !important;
  }
  .video-js .vjs-load-progress div {
    background: transparent !important;
  }
  .video-js .vjs-play-progress:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6.5px !important;
    width: 13px !important;
    height: 13px !important;
    background-color: ${COLORS.primary} !important;
    border-radius: 50% !important;
    transform: translateY(-50%) scale(0) !important;
    transition: transform 0.1s cubic-bezier(0.4,0.0,1,1) !important;
  }
  .video-js .vjs-progress-control:hover .vjs-play-progress:before {
    transform: translateY(-50%) scale(1) !important;
  }
  .video-js .vjs-slider {
    border-radius: 0 !important;
  }
  .video-js .vjs-volume-panel {
    display: flex !important;
    align-items: center !important;
    margin-right: 8px !important;
    transition: width 0.2s !important;
  }
  .video-js .vjs-volume-level {
    background-color: #fff !important;
  }
  .video-js .vjs-volume-level:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6px !important;
    width: 12px !important;
    height: 12px !important;
    background-color: #fff !important;
    border-radius: 50% !important;
    transform: translateY(-50%) !important;
  }
  .video-js .vjs-time-control {
    display: flex !important;
    align-items: center !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    font-family: "Roboto", Arial, sans-serif !important;
    padding: 0 4px !important;
    height: 48px !important;
    line-height: normal !important;
  }
  .video-js .vjs-time-divider {
    display: flex !important;
    align-items: center !important;
    padding: 0 2px !important;
    height: 48px !important;
    line-height: normal !important;
  }
  .video-js .vjs-remaining-time {
    display: none !important;
  }
  .video-js .vjs-button, .video-js .vjs-control {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 48px !important;
  }
  .video-js .vjs-button {
    width: 44px !important;
  }
  .video-js .vjs-icon-placeholder:before {
    position: static !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .video-js .vjs-mouse-display .vjs-time-tooltip,
  .video-js .vjs-play-progress .vjs-time-tooltip {
    background: rgba(28,28,28,0.9) !important;
    border-radius: 2px !important;
    font-size: 13px !important;
    font-family: "Roboto", Arial, sans-serif !important;
    padding: 5px 9px !important;
    bottom: 15px !important;
  }
  .video-js .vjs-menu-item.vjs-selected,
  .video-js .vjs-menu-item.vjs-selected:focus,
  .video-js .vjs-menu-item.vjs-selected:hover {
    background-color: rgba(255,255,255,0.1) !important;
    color: #fff !important;
  }
  .video-js .vjs-menu-item:hover {
    background-color: rgba(255,255,255,0.1) !important;
  }
  .video-js .vjs-menu-button-popup .vjs-menu {
    bottom: 2em !important;
  }
  .video-js .vjs-menu-content {
    background-color: rgba(28,28,28,0.9) !important;
    border-radius: 8px !important;
    padding: 8px 0 !important;
  }
  .video-js {
    width: 100% !important;
    font-family: "Roboto", Arial, sans-serif !important;
  }
  .video-js .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-waiting .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-seeking .vjs-loading-spinner { display: none !important; }
`;

// ======================== STATUS CHIP COMPONENT ========================
function StatusChip({
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

  const configs: Record<
    string,
    {
      label: string;
      color: string;
      bg: string;
      icon: React.ReactElement;
      stamp?: boolean;
    }
  > = {
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

  const cfg = configs[status];

  if (cfg?.stamp) {
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
      icon={cfg?.icon}
      label={cfg?.label}
      sx={{
        color: cfg?.color,
        bgcolor: cfg?.bg,
        fontWeight: 600,
        fontSize: size === "small" ? 11 : 12,
        height: size === "small" ? 22 : 24,
        borderRadius: 1,
        flexShrink: 0,
        "& .MuiChip-icon": { color: cfg?.color },
      }}
    />
  );
}

// ======================== REJECTION REASON ICON ========================
function RejectionReasonIcon({ lyDo }: { lyDo?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!lyDo) return null;
  return (
    <>
      <Tooltip title="Lý do từ chối">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          sx={{
            color: COLORS.danger,
            "&:hover": { bgcolor: mix(COLORS.danger, 0.08) },
          }}
        >
          <WarningAmberRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberRoundedIcon color="error" />
          Lý do từ chối
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {lyDo}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ======================== MO TA KHOA HOC COMPONENT ========================
function MoTaKhoaHoc({ html }: { html: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box>
      <Box
        sx={{
          fontFamily: FONTS.body,
          fontSize: "14px",
          lineHeight: 1.75,
          color: COLORS.inkSoft,
          maxHeight: expanded ? "none" : 120,
          overflow: "hidden",
          position: "relative",
          display: "flow-root",
          width: "100%",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          transition: "max-height .2s ease",
          "& p": { m: 0, mb: 1 },
          "& ul": { pl: 3, m: 0, mb: 1 },
          "& img, & video, & iframe, & table": {
            maxWidth: "100%",
            height: "auto",
          },
          ...(!expanded && {
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              background: `linear-gradient(to bottom, ${mix("#ffffff", 0)}, #ffffff)`,
            },
          }),
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Button
        size="small"
        onClick={() => setExpanded((v) => !v)}
        sx={{
          textTransform: "none",
          mt: 0.5,
          px: 0,
          minWidth: 0,
          color: COLORS.primary,
          fontWeight: 600,
          "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
        }}
      >
        {expanded ? "Thu gọn" : "Xem thêm"}
      </Button>
    </Box>
  );
}

// ======================== LICH SU KIEM DUYET COMPONENT ========================
function LichSuKiemDuyet({ lichSu }: { lichSu?: LichSuKiemDuyetDto | null }) {
  if (!lichSu) return null;

  const status = lichSu.trangThaiPheDuyet;
  const statusLabel = getStatusLabel(status);
  const statusColor = getStatusColor(status);

  return (
    <Box
      sx={{
        ...boxSx,
        p: 2.5,
        bgcolor: mix(COLORS.paper, 0.6),
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
        <HistoryRoundedIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: COLORS.ink,
            fontFamily: FONTS.body,
          }}
        >
          Lịch sử kiểm duyệt
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: COLORS.ink, fontWeight: 500 }}
          >
            Trạng thái:
          </Typography>
          <Chip
            label={statusLabel}
            sx={{
              bgcolor: mix(statusColor, 0.1),
              color: statusColor,
              fontWeight: 600,
              borderRadius: 1,
            }}
          />
        </Box>

        {lichSu.ngayDuyet && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <CalendarTodayRoundedIcon
                sx={{ fontSize: 16, color: COLORS.inkSoft }}
              />
              <Typography
                variant="body2"
                sx={{ color: COLORS.ink, fontWeight: 500 }}
              >
                Ngày duyệt:
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
              {formatDate(lichSu.ngayDuyet)}
            </Typography>
          </Box>
        )}

        {lichSu.ngayTao && !lichSu.ngayDuyet && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <CalendarTodayRoundedIcon
                sx={{ fontSize: 16, color: COLORS.inkSoft }}
              />
              <Typography
                variant="body2"
                sx={{ color: COLORS.ink, fontWeight: 500 }}
              >
                Ngày tạo:
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
              {formatDate(lichSu.ngayTao)}
            </Typography>
          </Box>
        )}

        {lichSu.idNguoiDuyet && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
              <PersonRoundedIcon sx={{ fontSize: 16, color: COLORS.inkSoft }} />
              <Typography
                variant="body2"
                sx={{ color: COLORS.ink, fontWeight: 500 }}
              >
                Người duyệt:
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
              {lichSu.idNguoiDuyet}
            </Typography>
          </Box>
        )}

        {lichSu.lyDo && (
          <Box sx={{ mt: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ color: COLORS.ink, fontWeight: 500, mb: 0.75 }}
            >
              Lý do:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: mix(COLORS.danger, 0.04),
                border: `1px solid ${mix(COLORS.danger, 0.15)}`,
                borderRadius: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: COLORS.inkSoft,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {lichSu.lyDo}
              </Typography>
            </Paper>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// ======================== KHOI TEN KHOA HOC COMPONENT ========================
function KhoiTenKhoaHoc({ detail }: { detail: KiemDuyetDetailDto }) {
  return (
    <Box sx={{ ...boxSx, p: 2.5 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        {detail?.hinhAnhKhoaHoc && (
          <Avatar
            variant="rounded"
            src={detail.hinhAnhKhoaHoc}
            sx={{
              width: 229,
              height: 139,
              borderRadius: 2,
              border: `1px solid ${COLORS.line}`,
            }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, spacing: 1 }}
          >
            <Typography
              sx={{
                fontFamily: FONTS.display,
                fontWeight: 600,
                fontSize: 22,
                color: COLORS.ink,
                flex: 1,
                minWidth: 200,
              }}
            >
              {detail?.tieuDe || "Tên khóa học"}
            </Typography>
          </Stack>
          {detail && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ mt: 0.75, flexWrap: "wrap" }}
            >
              <Typography variant="caption" sx={{ color: COLORS.inkSoft }}>
                Giảng viên: {detail.createBy || "Không xác định"}
              </Typography>
              {detail.loaiKhoaHoc && (
                <Chip
                  label={detail.loaiKhoaHoc}
                  size="small"
                  sx={{ bgcolor: "#F1EBE8", color: COLORS.inkSoft }}
                />
              )}
              {detail.capDo && (
                <Chip
                  label={`Cấp độ: ${detail.capDo}`}
                  size="small"
                  sx={{ bgcolor: "#F1EBE8", color: COLORS.inkSoft }}
                />
              )}
              {detail.giaGoc != null && (
                <Chip
                  label={`Giá: ${detail.giaGoc.toLocaleString()} VND`}
                  size="small"
                  sx={{ bgcolor: "#F1EBE8", color: COLORS.inkSoft }}
                />
              )}
            </Stack>
          )}

          {/* 👇 THÊM DÒNG DANH MỤC (xuống dòng) */}
          {detail?.danhMucs && detail.danhMucs.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: COLORS.inkSoft,
                display: "block",
                width: "100%",
                mt: 0.5,
              }}
            >
              Danh mục: {detail.danhMucs.join(", ")}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

// ======================== KHOI TU CHOI FORM COMPONENT ========================
function KhoiTuChoiForm({
  ghiChu,
  onChange,
  onCancel,
  onConfirm,
  actionLoading,
}: any) {
  return (
    <Box
      sx={{
        border: `1px solid ${mix(COLORS.danger, 0.3)}`,
        borderRadius: 2,
        bgcolor: COLORS.dangerSoft,
        p: 2,
      }}
    >
      <TextField
        label="Lý do từ chối"
        multiline
        minRows={2}
        fullWidth
        autoFocus
        value={ghiChu}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập lý do để giảng viên chỉnh sửa lại..."
        size="small"
        sx={{ bgcolor: CSSVAR.paper, borderRadius: 1 }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
        <Button
          size="small"
          onClick={onCancel}
          sx={{ textTransform: "none", color: COLORS.inkSoft }}
        >
          Hủy
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onConfirm}
          disabled={!ghiChu.trim() || actionLoading}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            bgcolor: COLORS.danger,
            "&:hover": { bgcolor: "#8F2E24" },
          }}
        >
          Xác nhận từ chối
        </Button>
      </Stack>
    </Box>
  );
}

// ======================== CAU HOI ROW COMPONENT (đã sửa hiển thị HTML) ========================
function CauHoiRow({ cauHoi }: { cauHoi: any }) {
  const [expanded, setExpanded] = useState(false);
  const dapAns: any[] = cauHoi.dapAns ?? [];

  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        border: `1px solid ${COLORS.line}`,
        bgcolor: COLORS.paper,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        onClick={() => setExpanded((v) => !v)}
        sx={{
          alignItems: "center",
          cursor: dapAns.length > 0 ? "pointer" : "default",
        }}
      >
        <HelpOutlineRoundedIcon sx={{ color: COLORS.inkSoft, fontSize: 14 }} />
        <Box
          sx={{
            flex: 1,
            color: COLORS.ink,
            fontSize: 13,
            wordBreak: "break-word",
            "& strong": { fontWeight: 700 },
            "& p": { m: 0 },
          }}
          dangerouslySetInnerHTML={{
            __html:
              cauHoi.noiDungCauHoi ?? cauHoi.tenCauHoi ?? cauHoi.tieuDe ?? "",
          }}
        />
        {dapAns.length > 0 && (
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              color: COLORS.inkSoft,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform .15s",
            }}
          />
        )}
      </Stack>
      {dapAns.length > 0 && (
        <Collapse in={expanded}>
          <Stack spacing={0.5} sx={{ mt: 0.75, ml: 2.25 }}>
            {dapAns.map((da: any, daIndex: number) => (
              <Stack
                key={da.idDapAn ?? da.id ?? daIndex}
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                {da.dapAnDung || da.isDung || da.laDapAnDung ? (
                  <CheckCircleIcon
                    sx={{ color: COLORS.primary, fontSize: 14 }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ color: COLORS.inkSoft, fontSize: 14 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      da.dapAnDung || da.isDung || da.laDapAnDung
                        ? COLORS.ink
                        : COLORS.inkSoft,
                    fontWeight:
                      da.dapAnDung || da.isDung || da.laDapAnDung ? 600 : 400,
                  }}
                  noWrap
                >
                  {da.noiDungDapAn ?? da.tieuDe}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}

// ======================== VIDEO PLAYER COMPONENT (đã sửa fallback) ========================
const VideoPlayer = React.memo(function VideoPlayer({
  url,
  minHeight,
  maxHeight,
  isFullscreen = false,
}: {
  url: string;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleFallback = useCallback(() => {
    setUseFallback(true);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { masterUrl } = useMemo(() => getOptimalHlsUrl(url), [url]);
  const isHls = useMemo(() => masterUrl.includes(".m3u8"), [masterUrl]);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setLoadTimedOut(false);
    setRetryCount(0);
  }, [url]);

  useEffect(() => {
    if (useFallback && !isHls) {
      const video = videoRef.current;
      if (!video) return;

      setIsLoading(true);
      setHasError(false);
      setLoadTimedOut(false);
      video.load();

      const timeout = setTimeout(() => {
        setLoadTimedOut(true);
        setIsLoading(false);
      }, LOAD_TIMEOUT_MS);

      const onCanPlay = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setLoadTimedOut(false);
      };

      const onError = () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(true);
      };

      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("loadeddata", onCanPlay);
      video.addEventListener("error", onError);

      return () => {
        clearTimeout(timeout);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("loadeddata", onCanPlay);
        video.removeEventListener("error", onError);
      };
    }
  }, [useFallback, isHls, masterUrl]);

  const handleRetry = useCallback(() => {
    if (retryCount >= 3) {
      setHasError(true);
      return;
    }
    setRetryCount((prev) => prev + 1);
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);

    const video = videoRef.current;
    if (video) {
      video.load();
    }
  }, [retryCount]);

  const containerSx = useMemo(
    () => ({
      width: "100%",
      aspectRatio: "16/9",
      bgcolor: "#000",
      position: "relative" as const,
      isolation: "isolate" as const,
      overflow: "hidden" as const,
      borderRadius: 2,
      flexShrink: 0,
    }),
    [],
  );

  const overlaySx = useMemo(
    () => ({
      position: "absolute" as const,
      inset: 0,
      zIndex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
      bgcolor: "#000",
    }),
    [],
  );

  if (!useFallback) {
    return (
      <VideoJsPlayer
        url={url}
        minHeight={minHeight}
        maxHeight={maxHeight}
        isFullscreen={isFullscreen}
        onFallback={handleFallback}
      />
    );
  }

  if (isHls) {
    return (
      <Box sx={containerSx}>
        <Box sx={overlaySx}>
          <Typography sx={{ color: "#fff", textAlign: "center", px: 2 }}>
            Video ở định dạng HLS (streaming) không thể phát với trình duyệt
            hiện tại.
            <br />
            Vui lòng sử dụng trình duyệt hỗ trợ (Chrome, Edge, Firefox mới).
          </Typography>
          <Button
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            sx={{ mt: 2, color: "#fff", borderColor: "#fff" }}
          >
            Mở video trực tiếp
          </Button>
        </Box>
      </Box>
    );
  }

  // Fallback HTML5 video với bắt lỗi
  return (
    <Box sx={containerSx}>
      {isLoading && !hasError && !loadTimedOut && (
        <Box sx={overlaySx}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `4px solid ${mix(COLORS.primary, 0.25)}`,
              borderTopColor: COLORS.primary,
              animation: "spin 0.85s linear infinite",
              "@keyframes spin": {
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "#fff" }}>
            Đang tải video...
          </Typography>
        </Box>
      )}

      {(hasError || loadTimedOut) && (
        <Box sx={overlaySx}>
          <Typography sx={{ color: "#fff", textAlign: "center", px: 2 }}>
            {loadTimedOut
              ? "Tải video quá lâu. Vui lòng thử lại."
              : retryCount >= 3
                ? "Không thể phát video. Vui lòng tải xuống để xem."
                : "Không thể phát video. Vui lòng thử lại."}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleRetry}
            disabled={retryCount >= 3}
            sx={{
              textTransform: "none",
              bgcolor: COLORS.primary,
              "&:hover": { bgcolor: COLORS.primaryDark },
              "&:disabled": {
                bgcolor: COLORS.inkSoft,
              },
            }}
          >
            {retryCount >= 3 ? "Tải xuống video" : "Thử lại"}
          </Button>
          {retryCount >= 3 && (
            <Button
              variant="outlined"
              size="small"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textTransform: "none",
                color: "#fff",
                borderColor: "#fff",
                "&:hover": {
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                },
              }}
            >
              Tải xuống
            </Button>
          )}
        </Box>
      )}

      <video
        ref={videoRef}
        controls
        preload="metadata"
        playsInline
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          visibility:
            isLoading || hasError || loadTimedOut ? "hidden" : "visible",
        }}
        onError={() => {
          if (!hasError && !loadTimedOut) {
            setHasError(true);
            setIsLoading(false);
          }
        }}
      >
        <source src={masterUrl} type="video/mp4" />
        <p style={{ color: "#fff", padding: 16 }}>
          Trình duyệt của bạn không hỗ trợ phát video.
        </p>
      </video>
    </Box>
  );
});

VideoPlayer.displayName = "VideoPlayer";

// ======================== VIDEO.JS PLAYER ========================
function VideoJsPlayer({
  url,
  minHeight,
  maxHeight,
  isFullscreen = false,
  onFallback,
}: {
  url: string;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
  onFallback: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSelectedRef = useRef(false);
  const mountedRef = useRef(true);

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [loadElapsed, setLoadElapsed] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const [qualityLevels, setQualityLevels] = useState<any[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | "auto">(
    "auto",
  );
  const [currentBandwidthKbps, setCurrentBandwidthKbps] = useState<
    number | null
  >(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const { masterUrl } = useMemo(() => getOptimalHlsUrl(url), [url]);
  const isHls = useMemo(() => masterUrl.includes(".m3u8"), [masterUrl]);

  const getVideoType = useCallback((src: string): string => {
    if (src.includes(".m3u8")) return "application/x-mpegURL";
    if (src.endsWith(".webm")) return "video/webm";
    if (src.endsWith(".ogg")) return "video/ogg";
    if (src.endsWith(".mov")) return "video/quicktime";
    if (src.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  }, []);

  useEffect(() => {
    if (!document.getElementById("vjs-kiemduyet-styles")) {
      const s = document.createElement("style");
      s.id = "vjs-kiemduyet-styles";
      s.textContent = VIDEO_JS_STYLES;
      document.head.appendChild(s);
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startLoadTimeout = useCallback(() => {
    clearAllTimers();
    if (!mountedRef.current) return;

    setLoadElapsed(0);
    intervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        setLoadElapsed((e) => e + 1);
      }
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      if (mountedRef.current) {
        setLoadTimedOut(true);
        setIsLoading(false);
      }
    }, LOAD_TIMEOUT_MS);
  }, [clearAllTimers]);

  const applyQuality = useCallback((q: number | "auto") => {
    const ql = (playerRef.current as any)?.qualityLevels?.();
    if (ql) {
      for (let i = 0; i < ql.length; i++) {
        ql[i].enabled = q === "auto" ? true : i === q;
      }
    }
    setSelectedQuality(q);
    setMenuAnchor(null);
  }, []);

  const handleRetry = useCallback(() => {
    if (retryCount >= 3) {
      onFallback();
      return;
    }

    setRetryCount((prev) => prev + 1);
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);
    setLoadElapsed(0);
    startLoadTimeout();

    const p = playerRef.current;
    if (p && typeof p.load === "function") {
      try {
        p.load();
      } catch (err) {
        console.error("Error reloading video:", err);
        onFallback();
      }
    } else {
      onFallback();
    }
  }, [retryCount, startLoadTimeout, onFallback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setHasError(false);
    setIsLoading(true);
    setLoadTimedOut(false);
    setLoadElapsed(0);
    setQualityLevels([]);
    setSelectedQuality("auto");
    setCurrentBandwidthKbps(null);
    autoSelectedRef.current = false;
    startLoadTimeout();

    if (playerRef.current) {
      try {
        playerRef.current.dispose();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }

    const oldVideo = container.querySelector("video");
    if (oldVideo) {
      container.removeChild(oldVideo);
    }

    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered";
    videoEl.setAttribute("playsinline", "true");
    container.appendChild(videoEl);

    let isMounted = true;

    import("video.js")
      .then((videojsModule) => {
        if (!isMounted) return;

        const videojs = videojsModule.default;

        try {
          const player = videojs(videoEl, {
            controls: true,
            autoplay: false,
            preload: "auto",
            fluid: true,
            fill: true,
            responsive: true,
            aspectRatio: "16:9",
            html5: {
              vhs: isHls
                ? {
                    overrideNative: true,
                    useNetworkInformationApi: true,
                    enableLowInitialPlaylist: false,
                    smoothQualityChange: true,
                    handlePartialData: true,
                    bandwidth: 8_000_000,
                  }
                : undefined,
              nativeVideoTracks: false,
              nativeAudioTracks: false,
              nativeTextTracks: false,
            },
            controlBar: {
              volumePanel: { inline: false },
              pictureInPictureToggle: false,
              chaptersButton: false,
              subtitlesButton: false,
              captionsButton: false,
              audioTrackButton: false,
              descriptionsButton: false,
            },
            sources: [
              {
                src: masterUrl,
                type: getVideoType(masterUrl),
              },
            ],
          });

          if (!isMounted) {
            try {
              player.dispose();
            } catch {
              /* ignore */
            }
            return;
          }

          playerRef.current = player;

          const markReady = () => {
            if (!isMounted) return;
            clearAllTimers();
            setIsLoading(false);
            setLoadTimedOut(false);
          };

          player.on("loadedmetadata", () => {
            markReady();

            if (isHls) {
              const ql = (player as any).qualityLevels?.();
              if (ql) {
                const buildLevels = () => {
                  if (!isMounted) return;
                  const levels: any[] = [];
                  for (let i = 0; i < ql.length; i++) {
                    const lv = ql[i];
                    const h: number = lv.height ?? 0;
                    const bitrate: number = lv.bitrate ?? 0;
                    let label: string;
                    if (h >= 2160) label = "4K (2160p)";
                    else if (h >= 1440) label = "1440p";
                    else if (h >= 1080) label = "1080p HD";
                    else if (h >= 720) label = "720p HD";
                    else if (h >= 480) label = "480p";
                    else if (h >= 360) label = "360p";
                    else if (h >= 240) label = "240p";
                    else if (h > 0) label = `${h}p`;
                    else label = `${Math.round(bitrate / 1000)} kbps`;
                    levels.push({ index: i, label, bitrate, height: h });
                  }
                  levels.sort((a, b) => b.bitrate - a.bitrate);
                  const seen = new Set<string>();
                  const unique = levels.filter((l) => {
                    if (seen.has(l.label)) return false;
                    seen.add(l.label);
                    return true;
                  });
                  if (unique.length > 0) {
                    setQualityLevels(unique);
                    if (!autoSelectedRef.current) {
                      autoSelectedRef.current = true;
                      applyQuality(unique[0].index);
                    }
                  }
                };
                buildLevels();
                ql.on("addqualitylevel", buildLevels);
                ql.on("removequalitylevel", buildLevels);
              }
            }
          });

          player.on("playing", markReady);
          player.on("canplay", markReady);

          player.on("timeupdate", () => {
            if (!isHls) return;
            const tech = player.tech(true);
            const vhs = (tech as any)?.vhs;
            if (vhs?.stats?.bandwidth) {
              setCurrentBandwidthKbps(Math.round(vhs.stats.bandwidth / 1000));
            }
          });

          player.on("error", (err: any) => {
            console.error("Video.js error:", err);
            clearAllTimers();
            if (isMounted) {
              setIsLoading(false);
              setHasError(true);
            }
          });

          player.on("dispose", () => {
            clearAllTimers();
          });
        } catch (err) {
          console.error("Video.js init error:", err);
          if (isMounted) {
            onFallback();
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load video.js:", err);
        if (isMounted) {
          onFallback();
        }
      });

    return () => {
      isMounted = false;
      clearAllTimers();

      const p = playerRef.current;
      playerRef.current = null;

      try {
        if (p && typeof p.isDisposed === "function" && !p.isDisposed()) {
          p.dispose();
        }
      } catch {
        // ignore
      }

      if (container && videoEl.parentNode === container) {
        try {
          container.removeChild(videoEl);
        } catch {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    masterUrl,
    isHls,
    getVideoType,
    onFallback,
    applyQuality,
    clearAllTimers,
    startLoadTimeout,
  ]);

  const containerStyle = useMemo(() => {
    if (isFullscreen) {
      return {
        width: "100%",
        height: "100%",
        minHeight: minHeight,
        maxHeight: maxHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative" as const,
        isolation: "isolate" as const,
        overflow: "hidden" as const,
        borderRadius: 2,
        flexShrink: 0,
        bgcolor: "#000",
      };
    }
    return {
      width: "100%",
      aspectRatio: "16/9",
      position: "relative" as const,
      isolation: "isolate" as const,
      overflow: "hidden" as const,
      borderRadius: 2,
      flexShrink: 0,
      bgcolor: "#000",
    };
  }, [isFullscreen, minHeight, maxHeight]);

  return (
    <Box sx={containerStyle}>
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: isFullscreen ? "100%" : "100%",
          visibility:
            isLoading || hasError || loadTimedOut ? "hidden" : "visible",
          "& .video-js": {
            width: "100% !important",
            height: "100% !important",
          },
        }}
      />

      {!isLoading &&
        !hasError &&
        !loadTimedOut &&
        isHls &&
        qualityLevels.length > 0 && (
          <>
            <Tooltip title="Chất lượng video">
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  bgcolor: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                }}
              >
                <HighQualityRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={() => setMenuAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: "rgba(28,28,28,0.95)",
                    color: "#fff",
                    borderRadius: 2,
                    minWidth: 180,
                  },
                },
              }}
            >
              <MenuItem
                selected={selectedQuality === "auto"}
                onClick={() => applyQuality("auto")}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemText
                  primary="Tự động"
                  secondary={
                    currentBandwidthKbps
                      ? `${(currentBandwidthKbps / 1000).toFixed(1)} Mbps`
                      : undefined
                  }
                  slotProps={{
                    secondary: {
                      sx: { color: "rgba(255,255,255,0.5)" },
                    },
                  }}
                />
              </MenuItem>
              {qualityLevels.map((lv) => (
                <MenuItem
                  key={lv.index}
                  selected={selectedQuality === lv.index}
                  onClick={() => applyQuality(lv.index)}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  {lv.index === qualityLevels[0]?.index && (
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <HighQualityRoundedIcon
                        fontSize="small"
                        sx={{ color: COLORS.primary }}
                      />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    inset={lv.index !== qualityLevels[0]?.index}
                    primary={lv.label}
                  />
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

      {isLoading && !hasError && !loadTimedOut && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            bgcolor: "#000",
          }}
        >
          <CircularProgress
            size={44}
            thickness={4}
            sx={{
              color: COLORS.primary,
            }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Đang tải video{loadElapsed >= 5 ? ` (${loadElapsed}s)…` : "…"}
          </Typography>
        </Box>
      )}

      {(hasError || loadTimedOut) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            bgcolor: "#000",
            px: 3,
          }}
        >
          <Typography sx={{ color: "#fff", textAlign: "center" }}>
            {loadTimedOut
              ? "Tải video quá lâu. Vui lòng kiểm tra kết nối và thử lại."
              : retryCount >= 3
                ? "Không thể phát video. Vui lòng tải xuống để xem."
                : "Không thể phát video. Vui lòng thử lại."}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={handleRetry}
              disabled={retryCount >= 3}
              sx={{
                textTransform: "none",
                bgcolor: COLORS.primary,
                "&:hover": { bgcolor: COLORS.primaryDark },
                "&:disabled": {
                  bgcolor: COLORS.inkSoft,
                },
              }}
            >
              {retryCount >= 3 ? "Tải xuống" : "Thử lại"}
            </Button>
            {retryCount >= 3 && (
              <Button
                variant="outlined"
                size="small"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textTransform: "none",
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                  },
                }}
              >
                Mở trực tiếp
              </Button>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

// ======================== TAI LIEU PREVIEW COMPONENT ========================
function TaiLieuPreview({
  url,
  tenTaiLieu,
  minHeight,
  maxHeight,
}: {
  url: string;
  tenTaiLieu: string;
  minHeight: string | number;
  maxHeight: string | number;
}) {
  const kind = getFileKind(url);
  const fileName = getFileName(url, tenTaiLieu);

  const frameBox = (children: React.ReactNode) => (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        border: `1px solid ${COLORS.line}`,
        minHeight: minHeight,
        maxHeight: maxHeight,
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );

  if (kind === "pdf") {
    return frameBox(
      <iframe
        src={url}
        title={fileName}
        width="100%"
        height="100%"
        scrolling="no"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `calc(100% + ${TOOLBAR_CROP_PX}px)`,
          maxWidth: "100%",
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
      />,
    );
  }

  if (kind === "image") {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          border: `1px solid ${COLORS.line}`,
          bgcolor: "#F5F1EE",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: minHeight,
          maxHeight: maxHeight,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={url}
          alt={fileName}
          sx={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "block",
            objectFit: "contain",
          }}
        />
      </Box>
    );
  }

  if (kind === "office") {
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    return frameBox(
      <iframe
        src={viewerUrl}
        title={fileName}
        width="100%"
        height="100%"
        scrolling="no"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `calc(100% + ${TOOLBAR_CROP_PX}px)`,
          maxWidth: "100%",
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
      />,
    );
  }

  return (
    <Stack
      spacing={1.5}
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        minHeight: minHeight,
        maxHeight: maxHeight,
        border: `1px dashed ${COLORS.line}`,
        bgcolor: COLORS.paper,
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
        Định dạng file này chưa hỗ trợ xem trước trực tiếp.
      </Typography>
      <Button
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        startIcon={<OpenInNewRoundedIcon />}
        sx={{
          textTransform: "none",
          borderColor: COLORS.primary,
          color: COLORS.primary,
          "&:hover": {
            borderColor: COLORS.primaryDark,
            bgcolor: mix(COLORS.primary, 0.04),
          },
        }}
      >
        Mở tài liệu
      </Button>
    </Stack>
  );
}

// ======================== NOI DUNG VIEWER COMPONENT (đã sửa hiển thị HTML câu hỏi) ========================
function NoiDungViewer({ selected }: { selected: any }) {
  const [openFull, setOpenFull] = useState(false);

  if (!selected) {
    return (
      <Box
        sx={{
          minHeight: VIEW_MIN_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SchoolRoundedIcon
          sx={{ fontSize: 40, color: mix(COLORS.primary, 0.2), mb: 1.5 }}
        />
        <Typography sx={{ color: COLORS.inkSoft, fontFamily: FONTS.body }}>
          Chọn một bài giảng hoặc tài liệu bên phải để xem nội dung
        </Typography>
      </Box>
    );
  }

  const { loai, item } = selected;
  const title =
    loai === "baiGiang"
      ? item.tenBaiGiang || item.tieuDe || "Bài giảng"
      : loai === "taiLieu"
        ? item.tenTaiLieu || item.tieuDe || "Tài liệu"
        : item.tenBaiKiemTra || item.tieuDe || "Bài kiểm tra";

  const url =
    item.duongDan ??
    item.url ??
    item.videoUrl ??
    item.fileUrl ??
    item.link ??
    item.urlBaiGiang ??
    null;

  const isTest = loai === "baiKiemTra";

  const renderViewerBody = () => {
    if (loai === "baiKiemTra") {
      const cauHois: any[] = item.cauHois ?? [];
      return (
        <Box
          sx={{
            minHeight: VIEW_MIN_HEIGHT,
            maxHeight: VIEW_MAX_HEIGHT,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            isolation: "isolate",
            contain: "layout paint",
            bgcolor: "#f9f6f4",
            border: `1px solid ${COLORS.line}`,
            p: 2,
            borderRadius: 2,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mix(COLORS.primary, 0.2),
              borderRadius: "8px",
            },
          }}
        >
          {cauHois.length === 0 ? (
            <Typography
              sx={{ color: COLORS.inkSoft, textAlign: "center", mt: 4 }}
            >
              Bài kiểm tra chưa có câu hỏi.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: COLORS.ink,
                    fontFamily: FONTS.display,
                  }}
                >
                  Danh sách câu hỏi
                </Typography>
                <Typography
                  sx={{ fontSize: 14, color: COLORS.inkSoft, fontWeight: 500 }}
                >
                  {cauHois.length} câu hỏi
                </Typography>
              </Box>

              {cauHois.map((ch: any, idx: number) => (
                <Paper
                  key={ch.idCauHoi ?? idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${COLORS.line}`,
                    backgroundColor: CSSVAR.paper,
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    },
                    position: "relative",
                    isolation: "isolate",
                    overflow: "hidden",
                    borderRadius: 2,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                  >
                    <Box
                      sx={{
                        minWidth: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: mix(COLORS.primary, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: COLORS.primary,
                        }}
                      >
                        {idx + 1}
                      </Typography>
                    </Box>
                    {/* Hiển thị HTML cho câu hỏi */}
                    <Box
                      sx={{
                        fontWeight: 600,
                        color: COLORS.ink,
                        fontSize: 15,
                        lineHeight: 1.5,
                        flex: 1,
                        wordBreak: "break-word",
                        "& strong": { fontWeight: 700 },
                        "& p": { m: 0 },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: ch.noiDungCauHoi ?? ch.tieuDe ?? "",
                      }}
                    />
                  </Box>

                  <Box sx={{ ml: 4.5, mt: 1.5 }}>
                    <Stack spacing={0.75}>
                      {(ch.dapAns ?? []).map((da: any, daIdx: number) => {
                        const isCorrect =
                          da.dapAnDung || da.isDung || da.laDapAnDung;
                        return (
                          <Box
                            key={da.idDapAn ?? daIdx}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 0.75,
                              borderRadius: 1,
                              backgroundColor: isCorrect
                                ? mix(COLORS.success, 0.08)
                                : "transparent",
                              transition: "background-color 0.15s",
                            }}
                          >
                            {isCorrect ? (
                              <CheckCircleIcon
                                sx={{
                                  color: COLORS.success,
                                  fontSize: 18,
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <RadioButtonUncheckedIcon
                                sx={{
                                  color: COLORS.inkSoft,
                                  fontSize: 18,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: isCorrect ? COLORS.ink : COLORS.inkSoft,
                                fontWeight: isCorrect ? 600 : 400,
                                fontSize: 14,
                              }}
                            >
                              {da.noiDungDapAn ?? da.tieuDe}
                            </Typography>
                            {isCorrect && (
                              <Box
                                component="span"
                                sx={{
                                  ml: "auto",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: COLORS.success,
                                  backgroundColor: mix(COLORS.success, 0.12),
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                }}
                              >
                                Đúng
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      );
    }

    if (!url) {
      return (
        <Box
          sx={{
            minHeight: VIEW_MIN_HEIGHT,
            maxHeight: VIEW_MAX_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: COLORS.paper,
            border: `1px dashed ${COLORS.line}`,
            position: "relative",
            isolation: "isolate",
            overflow: "hidden",
            borderRadius: 2,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: COLORS.inkSoft }}>
            Chưa có nội dung để xem trước.
          </Typography>
        </Box>
      );
    }

    if (loai === "baiGiang") {
      return (
        <VideoPlayer
          url={url}
          minHeight={VIEW_MIN_HEIGHT}
          maxHeight={VIEW_MAX_HEIGHT}
        />
      );
    }

    return (
      <TaiLieuPreview
        url={url}
        tenTaiLieu={item.tenTaiLieu || item.tieuDe || "Tài liệu"}
        minHeight={VIEW_MIN_HEIGHT}
        maxHeight={VIEW_MAX_HEIGHT}
      />
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
        {loai === "baiGiang" ? (
          <PlayArrowIcon sx={{ color: COLORS.primary }} />
        ) : loai === "taiLieu" ? (
          <AttachFileIcon sx={{ color: COLORS.primary }} />
        ) : (
          <QuizIcon sx={{ color: COLORS.primary }} />
        )}
        <Typography
          sx={{
            flex: 1,
            fontFamily: FONTS.display,
            fontWeight: 600,
            fontSize: 18,
            color: COLORS.ink,
          }}
          noWrap
        >
          {title}
        </Typography>
        {/* KHÔNG HIỂN THỊ StatusChip Ở ĐÂY (theo yêu cầu) */}
        {url && !isTest && (
          <Tooltip title="Xem toàn màn hình">
            <IconButton
              size="small"
              onClick={() => setOpenFull(true)}
              sx={{
                color: COLORS.inkSoft,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 1.5,
                "&:hover": {
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                },
              }}
            >
              <FullscreenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Box sx={{ mb: 2, position: "relative" }}>{renderViewerBody()}</Box>

      {url && !isTest && (
        <Dialog
          open={openFull}
          onClose={() => setOpenFull(false)}
          fullWidth
          maxWidth="lg"
          slotProps={{
            paper: {
              sx: { borderRadius: 2, bgcolor: COLORS.paperRaised ?? "#fff" },
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              px: 2,
              py: 1.25,
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            {loai === "baiGiang" ? (
              <PlayArrowIcon sx={{ color: COLORS.primary }} />
            ) : (
              <AttachFileIcon sx={{ color: COLORS.primary }} />
            )}
            <Typography
              sx={{
                flex: 1,
                fontFamily: FONTS.display,
                fontWeight: 600,
                fontSize: 17,
                color: COLORS.ink,
              }}
              noWrap
            >
              {title}
            </Typography>
            <IconButton size="small" onClick={() => setOpenFull(false)}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ p: 2 }}>
            {loai === "baiGiang" ? (
              <VideoPlayer
                url={url}
                minHeight={VIEW_MIN_HEIGHT}
                maxHeight={FULL_HEIGHT}
                isFullscreen
              />
            ) : (
              <TaiLieuPreview
                url={url}
                tenTaiLieu={item.tenTaiLieu || item.tieuDe || "Tài liệu"}
                minHeight={VIEW_MIN_HEIGHT}
                maxHeight={FULL_HEIGHT}
              />
            )}
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

// ======================== SIDEBAR COMPONENT ========================
function KiemDuyetSidebar({
  detail,
  selected,
  onSelectContent,
}: {
  detail: any;
  selected: any;
  onSelectContent: (
    loai: "baiGiang" | "taiLieu" | "baiKiemTra",
    item: any,
  ) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openPhan, setOpenPhan] = useState<Record<string, boolean>>({});
  const [openTaiLieu, setOpenTaiLieu] = useState<Record<string, boolean>>({});
  const [openBaiKiemTra, setOpenBaiKiemTra] = useState<Record<string, boolean>>(
    {},
  );

  // Sử dụng useMemo cho các dữ liệu phụ thuộc vào detail
  const phans = useMemo(
    () => detail?.phans ?? detail?.phanHocs ?? [],
    [detail],
  );
  const flatBaiGiang = useMemo(
    () => detail?.baiGiangs ?? detail?.baiGiangChoDuyet ?? [],
    [detail],
  );
  const flatTaiLieu = useMemo(
    () => detail?.taiLieus ?? detail?.taiLieuChoDuyet ?? [],
    [detail],
  );
  const flatBaiKiemTra = useMemo(
    () => detail?.baiKiemTras ?? detail?.baiKiemTraChoDuyet ?? [],
    [detail],
  );

  const togglePhan = (id: string) =>
    setOpenPhan((p) => ({ ...p, [id]: p[id] === false ? true : !p[id] }));
  const toggleTaiLieu = (id: string) =>
    setOpenTaiLieu((p) => ({ ...p, [id]: !p[id] }));
  const toggleBaiKiemTra = (id: string) =>
    setOpenBaiKiemTra((p) => ({ ...p, [id]: !p[id] }));

  const isActive = (loai: "baiGiang" | "taiLieu" | "baiKiemTra", item: any) => {
    if (!selected || selected.loai !== loai) return false;
    const key =
      loai === "baiGiang"
        ? "idBaiGiang"
        : loai === "taiLieu"
          ? "idTaiLieu"
          : "idBaiKiemTra";
    return (selected.item[key] ?? selected.item.id) === (item[key] ?? item.id);
  };

  const taiLieuOfBaiGiang = useCallback(
    (bg: any) => {
      if (Array.isArray(bg.taiLieus) && bg.taiLieus.length > 0)
        return sortPending(bg.taiLieus);
      return sortPending(
        flatTaiLieu.filter((tl: any) => tl.idBaiGiang === bg.idBaiGiang),
      );
    },
    [flatTaiLieu],
  );

  const baiKiemTraOfPhan = useCallback(
    (phan: any, phanId: any) => {
      if (Array.isArray(phan.baiKiemTras) && phan.baiKiemTras.length > 0)
        return sortPending(phan.baiKiemTras);
      return sortPending(
        flatBaiKiemTra.filter((bkt: any) => bkt.idPhan === phanId),
      );
    },
    [flatBaiKiemTra],
  );

  const filteredPhans = useMemo(() => {
    if (!searchTerm.trim()) return phans;
    const lower = searchTerm.toLowerCase();
    const match = (s?: string) => (s ?? "").toLowerCase().includes(lower);
    return phans
      .map((phan: any, idx: number) => {
        const id = phan.id ?? phan.idPhan ?? `phan-${idx}`;
        const baiGiangs = (
          Array.isArray(phan.baiGiangs)
            ? phan.baiGiangs
            : flatBaiGiang.filter((bg: any) => bg.idPhan === id)
        ).filter(
          (bg: any) =>
            match(bg.tenBaiGiang) ||
            match(bg.tieuDe) ||
            taiLieuOfBaiGiang(bg).some(
              (tl: any) => match(tl.tenTaiLieu) || match(tl.tieuDe),
            ),
        );
        const baiKiemTras = baiKiemTraOfPhan(phan, id).filter(
          (bkt: any) => match(bkt.tenBaiKiemTra) || match(bkt.tieuDe),
        );
        if (
          match(phan.tenPhan) ||
          baiGiangs.length > 0 ||
          baiKiemTras.length > 0
        ) {
          return { ...phan, baiGiangs, baiKiemTras };
        }
        return null;
      })
      .filter(Boolean) as any[];
  }, [phans, searchTerm, flatBaiGiang, taiLieuOfBaiGiang, baiKiemTraOfPhan]);

  const { tongSo, tongSoCho } = useMemo(() => {
    let tong = 0;
    let cho = 0;
    const countBg = (bg: any) => {
      tong += 1;
      if (isTrangThaiCho(bg.trangThaiPheDuyet)) cho += 1;
      taiLieuOfBaiGiang(bg).forEach((tl: any) => {
        tong += 1;
        if (isTrangThaiCho(tl.trangThaiPheDuyet)) cho += 1;
      });
    };
    if (phans.length > 0) {
      phans.forEach((phan: any, idx: number) => {
        const id = phan.id ?? phan.idPhan ?? `phan-${idx}`;
        const baiGiangs = Array.isArray(phan.baiGiangs)
          ? phan.baiGiangs
          : flatBaiGiang.filter((bg: any) => bg.idPhan === id);
        baiGiangs.forEach(countBg);
        baiKiemTraOfPhan(phan, id).forEach((bkt: any) => {
          tong += 1;
          if (isTrangThaiCho(bkt.trangThaiPheDuyet)) cho += 1;
        });
      });
    } else {
      flatBaiGiang.forEach((bg: any) => countBg(bg));
      flatBaiKiemTra.forEach((bkt: any) => {
        tong += 1;
        if (isTrangThaiCho(bkt.trangThaiPheDuyet)) cho += 1;
      });
    }
    return { tongSo: tong, tongSoCho: cho };
  }, [
    phans,
    flatBaiGiang,
    flatBaiKiemTra,
    taiLieuOfBaiGiang,
    baiKiemTraOfPhan,
  ]);

  const phanTram =
    tongSo > 0 ? Math.round(((tongSo - tongSoCho) / tongSo) * 100) : 100;

  // ---------- RENDER TAI LIEU (đã xóa StatusChip, thêm RejectionReasonIcon) ----------
  const renderTaiLieu = (bg: any) => {
    const taiLieus = taiLieuOfBaiGiang(bg);
    if (taiLieus.length === 0) return null;
    const bgId = bg.idBaiGiang ?? bg.id;
    const open = openTaiLieu[bgId] ?? false;
    const soCho = demCho(taiLieus);
    return (
      <Box sx={{ borderTop: `1px solid ${COLORS.line}` }}>
        <ListItemButton
          onClick={() => toggleTaiLieu(bgId)}
          sx={{ pl: 4, py: 0.75 }}
        >
          <AttachFileIcon
            sx={{ fontSize: 14, color: COLORS.primary, mr: 0.75 }}
          />
          <Typography
            variant="caption"
            sx={{ flex: 1, fontWeight: 500, color: COLORS.inkSoft }}
          >
            {taiLieus.length} tài liệu
          </Typography>
          {soCho > 0 && (
            <Chip
              label={`${soCho} chờ duyệt`}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: COLORS.gold,
                color: "#fff",
                mr: 0.5,
              }}
            />
          )}
          {open ? (
            <ExpandLessIcon sx={{ fontSize: 16 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          )}
        </ListItemButton>
        <Collapse in={open}>
          <Stack sx={{ pl: 4, pr: 1.5, pb: 1, gap: 0.5 }}>
            {taiLieus.map((tl: any, idx: number) => {
              const active = isActive("taiLieu", tl);
              const pending = isTrangThaiCho(tl.trangThaiPheDuyet);
              return (
                <Box
                  key={tl.idTaiLieu ?? tl.id ?? idx}
                  onClick={() => onSelectContent("taiLieu", tl)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    transition: "background-color .15s, border-color .15s",
                    border: `1px solid ${
                      active
                        ? COLORS.primary
                        : pending
                          ? COLORS.gold
                          : COLORS.line
                    }`,
                    bgcolor: active
                      ? mix(COLORS.primary, 0.08)
                      : pending
                        ? COLORS.goldSoft
                        : "transparent",
                  }}
                >
                  <AttachFileIcon
                    sx={{
                      fontSize: 14,
                      color: pending ? COLORS.gold : COLORS.primary,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      flex: 1,
                      fontWeight: active || pending ? 600 : 400,
                      color: COLORS.ink,
                    }}
                    noWrap
                  >
                    {tl.tenTaiLieu ?? tl.tieuDe}
                  </Typography>
                  {/* CHỈ HIỂN THỊ ICON LÝ DO NẾU KHÓA HỌC BỊ TỪ CHỐI VÀ CÓ LÝ DO */}
                  {detail.trangThaiPheDuyet === "TuChoi" && (
                    <RejectionReasonIcon lyDo={tl.lyDoTuChois} />
                  )}
                </Box>
              );
            })}
          </Stack>
        </Collapse>
      </Box>
    );
  };

  // ---------- RENDER BAI GIANG (đã xóa StatusChip, thêm RejectionReasonIcon) ----------
  const renderBaiGiang = (bg: any) => {
    const active = isActive("baiGiang", bg);
    const pending = isTrangThaiCho(bg.trangThaiPheDuyet);
    const bgId = bg.idBaiGiang ?? bg.id;
    return (
      <Box key={bgId}>
        <ListItemButton
          selected={active}
          onClick={() => onSelectContent("baiGiang", bg)}
          sx={{
            pl: 3.5,
            pr: 2.5,
            py: 1.1,
            borderLeft: `3px solid ${
              active ? COLORS.primary : pending ? COLORS.gold : "transparent"
            }`,
            bgcolor: active
              ? mix(COLORS.primary, 0.08)
              : pending
                ? COLORS.goldSoft
                : "transparent",
            transition: "all 0.2s",
            "&:hover": { bgcolor: mix(COLORS.primary, 0.05) },
          }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <PlayArrowIcon
              sx={{
                color: active
                  ? COLORS.primary
                  : pending
                    ? COLORS.gold
                    : COLORS.inkSoft,
                fontSize: 18,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active || pending ? 600 : 400,
                  lineHeight: 1.4,
                  color: active ? COLORS.primary : COLORS.ink,
                }}
                noWrap
              >
                {bg.tenBaiGiang ?? bg.tieuDe}
              </Typography>
            }
          />
          {/* CHỈ HIỂN THỊ ICON LÝ DO NẾU KHÓA HỌC BỊ TỪ CHỐI VÀ CÓ LÝ DO */}
          {detail.trangThaiPheDuyet === "TuChoi" && (
            <RejectionReasonIcon lyDo={bg.lyDoTuChois} />
          )}
        </ListItemButton>
        {renderTaiLieu(bg)}
      </Box>
    );
  };

  // ---------- RENDER BAI KIEM TRA ----------
  const renderBaiKiemTra = (bkt: any) => {
    const active = isActive("baiKiemTra", bkt);
    const pending = isTrangThaiCho(bkt.trangThaiPheDuyet);
    const bktId = bkt.idBaiKiemTra ?? bkt.id;
    const cauHois: any[] = bkt.cauHois ?? [];
    return (
      <Box key={bktId}>
        <ListItemButton
          selected={active}
          onClick={() => onSelectContent("baiKiemTra", bkt)}
          sx={{
            pl: 3,
            py: 1,
            borderLeft: `3px solid ${
              active ? COLORS.primary : pending ? COLORS.gold : "transparent"
            }`,
            bgcolor: active
              ? mix(COLORS.primary, 0.08)
              : pending
                ? COLORS.goldSoft
                : "transparent",
          }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <QuizIcon
              sx={{
                color: active
                  ? COLORS.primary
                  : pending
                    ? COLORS.gold
                    : COLORS.inkSoft,
                fontSize: 18,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{
                  fontWeight: active || pending ? 600 : 400,
                  lineHeight: 1.4,
                  color: active ? COLORS.primary : COLORS.ink,
                }}
                noWrap
              >
                {bkt.tenBaiKiemTra ?? bkt.tieuDe}
              </Typography>
            }
            secondary={
              cauHois.length > 0 ? (
                <Typography variant="caption" sx={{ color: COLORS.inkSoft }}>
                  {cauHois.length} câu hỏi
                </Typography>
              ) : undefined
            }
          />
          {/* CHỈ HIỂN THỊ ICON LÝ DO NẾU KHÓA HỌC BỊ TỪ CHỐI VÀ CÓ LÝ DO */}
          {detail.trangThaiPheDuyet === "TuChoi" && (
            <RejectionReasonIcon lyDo={bkt.lyDoTuChois} />
          )}
          {/* ĐÃ XÓA IconButton mở rộng và Collapse bên dưới */}
        </ListItemButton>
        {/* KHÔNG CÒN Collapse chứa câu hỏi */}
      </Box>
    );
  };

  const noiDungRong =
    phans.length === 0 &&
    flatBaiGiang.length === 0 &&
    flatTaiLieu.length === 0 &&
    flatBaiKiemTra.length === 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${COLORS.line}`,
          bgcolor: COLORS.paperRaised,
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: COLORS.inkSoft,
            fontFamily: FONTS.body,
            mb: 1.25,
          }}
        >
          Nội dung khóa học
        </Typography>

        <TextField
          size="small"
          fullWidth
          placeholder="Tìm bài giảng, tài liệu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 1.5,
            bgcolor: CSSVAR.paper,
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              "& fieldset": { borderColor: COLORS.line },
              "&:hover fieldset": { borderColor: COLORS.primary },
              "&.Mui-focused fieldset": { borderColor: COLORS.primary },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: COLORS.inkSoft }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: COLORS.ink }}
          >
            Tiến độ kiểm duyệt
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: tongSoCho > 0 ? COLORS.gold : COLORS.success,
            }}
          >
            {phanTram}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={phanTram}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: mix(COLORS.gold, 0.15),
            "& .MuiLinearProgress-bar": {
              backgroundColor: tongSoCho > 0 ? COLORS.gold : COLORS.success,
              borderRadius: 3,
            },
            mb: 0.75,
          }}
        />
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "right", color: COLORS.inkSoft }}
        >
          {tongSoCho} / {tongSo} mục đang chờ duyệt
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {noiDungRong ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
              Khóa học chưa có nội dung.
            </Typography>
          </Box>
        ) : phans.length > 0 ? (
          <>
            {filteredPhans.map((phan: any, phanIndex: number) => {
              const id = phan.id ?? phan.idPhan ?? `phan-${phanIndex}`;
              const baiGiangs = sortPending(
                Array.isArray(phan.baiGiangs) ? phan.baiGiangs : [],
              );
              const baiKiemTras = sortPending(
                Array.isArray(phan.baiKiemTras) ? phan.baiKiemTras : [],
              );
              const soCho = demCho(baiGiangs) + demCho(baiKiemTras);
              const isOpen = openPhan[id] !== false;

              return (
                <Box key={id}>
                  <ListItemButton
                    onClick={() => togglePhan(id)}
                    sx={{
                      bgcolor: soCho > 0 ? COLORS.goldSoft : "transparent",
                      borderLeft: `3px solid ${
                        soCho > 0 ? COLORS.gold : "transparent"
                      }`,
                      py: 1.5,
                      px: 2.5,
                      transition: "background-color 0.2s",
                      "&:hover": { bgcolor: mix(COLORS.primary, 0.05) },
                    }}
                  >
                    <FolderRoundedIcon
                      sx={{ color: COLORS.gold, fontSize: 18, mr: 1.25 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: COLORS.ink }}
                        noWrap
                      >
                        {phanIndex + 1}. {phan.tenPhan}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: COLORS.inkSoft }}
                      >
                        {baiGiangs.length + baiKiemTras.length} mục
                        {soCho > 0 ? ` · ${soCho} chờ duyệt` : ""}
                      </Typography>
                    </Box>
                    {isOpen ? (
                      <ExpandLessIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: 20 }} />
                    )}
                  </ListItemButton>
                  <Collapse in={isOpen}>
                    <List disablePadding>
                      {baiGiangs.map((bg: any) => renderBaiGiang(bg))}
                      {baiKiemTras.map((bkt: any) => renderBaiKiemTra(bkt))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
            {filteredPhans.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: COLORS.inkSoft }}>
                  Không tìm thấy nội dung phù hợp.
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <List disablePadding>
            {sortPending(flatBaiGiang).map((bg: any) => renderBaiGiang(bg))}
            {sortPending(flatBaiKiemTra).map((bkt: any) =>
              renderBaiKiemTra(bkt),
            )}
          </List>
        )}
      </Box>
    </Box>
  );
}

// ======================== MAIN PAGE ========================
type ConfirmAction = "duyet" | "tuChoi" | null;

export default function ChiTietKiemDuyetKhoaHocPage() {
  const params = useParams();
  const router = useRouter();
  const idKhoaHoc = (params?.courseId as string) ?? "";

  const kiemDuyetService = useMemo(() => new KiemDuyetService(), []);

  const [detailLoading, setDetailLoading] = useState(true);
  const [detail, setDetail] = useState<KiemDuyetDetailDto | null>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [ghiChu, setGhiChu] = useState("");
  const [showTuChoi, setShowTuChoi] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchDetail = useCallback(async () => {
    if (!idKhoaHoc) {
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    try {
      const res = await kiemDuyetService.GetDetailLichSuKiemDuyet(idKhoaHoc);
      const normalizedData = normalizeDetailResponse(res);
      setDetail(normalizedData);
    } catch (error) {
      console.error("Lỗi tải chi tiết:", error);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [idKhoaHoc, kiemDuyetService]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSelectContent = (
    loai: "baiGiang" | "taiLieu" | "baiKiemTra",
    item: any,
  ) => {
    setSelectedContent({ loai, item });
  };

  const goBackToList = useCallback(() => {
    router.push("/admin/approve-courses/history");
  }, [router]);

  const handleDuyet = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res: ApiResponse<any> = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "DaDuyet",
      });

      const isSuccess = res?.status === true;

      if (isSuccess) {
        setSnackbar({
          open: true,
          message: res?.message || "✅ Duyệt khóa học thành công!",
          severity: "success",
        });
        setTimeout(() => {
          goBackToList();
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: res?.message || "❌ Duyệt khóa học thất bại",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Lỗi duyệt:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "❌ Đã xảy ra lỗi khi duyệt khóa học",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleTuChoi = async () => {
    if (!detail) return;
    setActionLoading(true);
    try {
      const res: ApiResponse<any> = await kiemDuyetService.KiemDuyetKhoaHoc({
        idKhoaHoc: detail.idKhoaHoc,
        trangThaiPheDuyet: "TuChoi",
        lyDo: ghiChu,
      });

      const isSuccess = res?.status === true;

      if (isSuccess) {
        setSnackbar({
          open: true,
          message: res?.message || "✅ Từ chối khóa học thành công!",
          severity: "success",
        });
        setTimeout(() => {
          goBackToList();
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: res?.message || "❌ Từ chối khóa học thất bại",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Lỗi từ chối:", error);
      setSnackbar({
        open: true,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "❌ Đã xảy ra lỗi khi từ chối khóa học",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setShowTuChoi(false);
      setGhiChu("");
    }
  };

  const handleDuyetClick = () => setConfirmAction("duyet");
  const handleTuChoiConfirmClick = () => setConfirmAction("tuChoi");

  const handleConfirmDialogOk = () => {
    if (confirmAction === "duyet") handleDuyet();
    else if (confirmAction === "tuChoi") handleTuChoi();
  };

  const trangThaiKhoaHoc = detail
    ? (detail.trangThaiPheDuyet ?? detail.trangThai)
    : null;
  const lichSuStatus = detail?.lichSuKiemDuyetDto?.trangThaiPheDuyet;
  const finalStatus = lichSuStatus || trangThaiKhoaHoc;
  const isChoDuyet = isTrangThaiCho(finalStatus);

  const moTa = detail?.moTa ?? "";
  const hasDescription = moTa.trim().length > 0;

  return (
    <AuthGuard allowedRoles={["Admin", "personnel"]}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 3,
          bgcolor: COLORS.paper,
          backgroundImage: `radial-gradient(${mix(
            COLORS.gold,
            0.08,
          )} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", mb: 3, flexShrink: 0 }}
        >
          <IconButton
            onClick={goBackToList}
            sx={{
              border: `1px solid ${COLORS.line}`,
              borderRadius: 1.5,
              color: COLORS.ink,
              bgcolor: COLORS.paperRaised,
              transition: "all .15s",
              "&:hover": {
                borderColor: COLORS.primary,
                color: COLORS.primary,
                bgcolor: mix(COLORS.primary, 0.05),
              },
            }}
            size="small"
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                fontFamily: FONTS.display,
                color: COLORS.ink,
                lineHeight: 1.15,
              }}
            >
              Chi tiết kiểm duyệt khóa học
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: COLORS.inkSoft,
                letterSpacing: "0.03em",
                mt: 0.25,
              }}
            >
              Xem lại nội dung và đưa ra quyết định phê duyệt
            </Typography>
          </Box>

          {!detailLoading && detail && isChoDuyet && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                disabled={actionLoading}
                onClick={() => setShowTuChoi(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: COLORS.danger,
                  color: COLORS.danger,
                  borderRadius: 1.5,
                  "&:hover": {
                    borderColor: "#8F2E24",
                    bgcolor: COLORS.dangerSoft,
                  },
                }}
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={actionLoading}
                onClick={handleDuyetClick}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: COLORS.primary,
                  borderRadius: 1.5,
                  boxShadow: `0 4px 14px -6px ${mix(COLORS.primary, 0.6)}`,
                  "&:hover": {
                    bgcolor: COLORS.primaryDark,
                    boxShadow: `0 6px 16px -6px ${mix(COLORS.primary, 0.7)}`,
                  },
                }}
              >
                {actionLoading && confirmAction === "duyet" ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  "Duyệt khóa học"
                )}
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Form từ chối */}
        {showTuChoi && (
          <Box sx={{ mb: 2, flexShrink: 0 }}>
            <KhoiTuChoiForm
              ghiChu={ghiChu}
              onChange={setGhiChu}
              onCancel={() => {
                setShowTuChoi(false);
                setGhiChu("");
              }}
              onConfirm={handleTuChoiConfirmClick}
              actionLoading={actionLoading}
            />
          </Box>
        )}

        {/* Dialog xác nhận */}
        <Dialog
          open={confirmAction !== null}
          onClose={() => {
            if (!actionLoading) setConfirmAction(null);
          }}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: { sx: { borderRadius: 2.5 } },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: FONTS.display,
              fontWeight: 700,
              color: COLORS.ink,
            }}
          >
            <HelpOutlineRoundedIcon
              sx={{
                color:
                  confirmAction === "tuChoi" ? COLORS.danger : COLORS.primary,
              }}
            />
            {confirmAction === "tuChoi"
              ? "Xác nhận từ chối khóa học"
              : "Xác nhận duyệt khóa học"}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: COLORS.inkSoft }}>
              {confirmAction === "tuChoi"
                ? "Bạn có chắc chắn muốn từ chối khóa học này không?"
                : "Bạn có chắc chắn muốn duyệt khóa học này không?"}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setConfirmAction(null)}
              disabled={actionLoading}
              sx={{ textTransform: "none", color: COLORS.inkSoft }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDialogOk}
              disabled={actionLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor:
                  confirmAction === "tuChoi" ? COLORS.danger : COLORS.primary,
                boxShadow: "none",
                "&:hover": {
                  bgcolor:
                    confirmAction === "tuChoi" ? "#8F2E24" : COLORS.primaryDark,
                  boxShadow: "none",
                },
              }}
            >
              {actionLoading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : confirmAction === "tuChoi" ? (
                "Xác nhận từ chối"
              ) : (
                "Xác nhận duyệt"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Nội dung chính */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            overflow: { xs: "auto", md: "hidden" },
          }}
        >
          {/* Cột trái */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pr: { md: 1 },
              ...scrollbarSx,
            }}
          >
            {detailLoading ? (
              <>
                <Skeleton variant="rounded" height={110} />
                <Skeleton variant="rounded" height={420} />
              </>
            ) : detail ? (
              <>
                <KhoiTenKhoaHoc detail={detail} />

                <Box sx={{ ...boxSx, p: 2.5 }}>
                  <NoiDungViewer selected={selectedContent} />
                </Box>

                {hasDescription && (
                  <Box sx={{ ...boxSx, p: 2.5 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: COLORS.inkSoft,
                        mb: 1.25,
                      }}
                    >
                      Mô tả khóa học
                    </Typography>
                    <MoTaKhoaHoc html={moTa} />
                  </Box>
                )}

                {/* Lịch sử kiểm duyệt */}
                <LichSuKiemDuyet lichSu={detail.lichSuKiemDuyetDto} />
              </>
            ) : (
              <Box
                sx={{
                  ...boxSx,
                  minHeight: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SchoolRoundedIcon
                  sx={{
                    fontSize: 40,
                    color: mix(COLORS.primary, 0.2),
                    mb: 1.5,
                  }}
                />
                <Typography sx={{ color: COLORS.inkSoft }}>
                  Không tìm thấy khóa học.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Cột phải: Sidebar */}
          <Box
            sx={{
              width: { xs: "100%", md: 380 },
              flexShrink: 0,
              pr: { md: 1 },
              ...boxSx,
              ...scrollbarSx,
            }}
          >
            {detailLoading ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                <Skeleton variant="rounded" height={90} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </Stack>
            ) : detail ? (
              <KiemDuyetSidebar
                detail={detail}
                selected={selectedContent}
                onSelectContent={handleSelectContent}
              />
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography sx={{ color: COLORS.inkSoft }}>
                  Không có dữ liệu để hiển thị.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
