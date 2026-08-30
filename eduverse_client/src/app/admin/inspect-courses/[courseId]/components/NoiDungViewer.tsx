"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Dialog,
  Tooltip,
  alpha,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import HighQualityRoundedIcon from "@mui/icons-material/HighQualityRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";

try {
  if (typeof videojs !== "undefined" && (videojs as any).log) {
    (videojs as any).log.level("off");
  }
} catch (_) {}
import {
  COLORS,
  FONTS,
  getFileKind,
  getFileName,
  isTrangThaiCho,
} from "../types/constants";
import StatusChip from "./StatusChip";
import LyDoTuChoiInput from "./LyDoTuChoiInput";
import { BRAND, COLORS as TOKEN_COLORS, CSSVAR } from "@/src/theme/tokens";
import { cleanHtmlContent, isHtmlContent, stripHtml } from "@/src/utils/htmlHelpers";

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
const VIDEO_JS_STYLES = (PRIMARY_RED: string) => `
  /* ===== RESET OVERRIDES ===== */
  .video-js,
  .video-js * {
    box-sizing: border-box !important;
  }

  .video-js {
    font-family: inherit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    font-size: 14px !important;
    color: #fff !important;
    width: 100% !important;
    height: 100% !important;
    background-color: #000 !important;
  }

  .video-js .vjs-tech {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }

  .video-js .vjs-poster {
    background-size: cover !important;
    background-position: center !important;
  }

  /* Ẩn tuyệt đối các thành phần thừa gây rác giao diện */
  .video-js .vjs-live-control,
  .video-js .vjs-seek-to-live-control,
  .video-js .vjs-live-display,
  .video-js .vjs-chapters-button,
  .video-js .vjs-descriptions-button,
  .video-js .vjs-audio-button,
  .video-js .vjs-subs-caps-button,
  .video-js .vjs-subtitles-button,
  .video-js .vjs-captions-button,
  .video-js .vjs-picture-in-picture-control,
  .video-js .vjs-remaining-time,
  .video-js .vjs-remaining-time-display,
  .video-js .vjs-time-control.vjs-remaining-time,
  .video-js .vjs-time-control:not(.vjs-current-time):not(.vjs-time-divider):not(.vjs-duration),
  .video-js .vjs-spacer,
  .video-js .vjs-custom-control-spacer,
  .video-js .vjs-modal-dialog,
  .video-js .vjs-text-track-settings {
    display: none !important;
  }

  /* ===== CONTROL BAR ===== */
  .video-js .vjs-control-bar {
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    z-index: 2 !important;
    background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 60%, transparent 100%) !important;
    height: 64px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    padding: 16px 12px 10px 12px !important;
    gap: 0 !important;
    font-size: 13px !important;
    overflow: visible !important;
  }

  .video-js .vjs-control-bar > * {
    order: 10 !important;
  }

  .video-js .vjs-control {
    flex: 0 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 1 !important;
  }

  /* ===== PROGRESS BAR (Stretched on top with prominent red head dot) ===== */
  .video-js .vjs-progress-control {
    position: absolute !important;
    top: 6px !important;
    left: 12px !important;
    right: 12px !important;
    width: calc(100% - 24px) !important;
    height: 12px !important;
    display: flex !important;
    align-items: center !important;
    cursor: pointer !important;
    z-index: 3 !important;
  }
  .video-js .vjs-progress-control .vjs-progress-holder {
    margin: 0 !important;
    height: 4px !important;
    border-radius: 2px !important;
    background-color: rgba(255,255,255,0.25) !important;
    transition: height 0.15s ease !important;
    width: 100% !important;
  }
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 6px !important;
  }
  .video-js .vjs-play-progress {
    background-color: #FF0000 !important;
    border-radius: 2px !important;
  }
  .video-js .vjs-play-progress:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -6px !important;
    width: 14px !important;
    height: 14px !important;
    background-color: #FF0000 !important;
    border: 2px solid #FFFFFF !important;
    border-radius: 50% !important;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.9) !important;
    transform: translateY(-50%) !important;
    display: block !important;
    transition: transform 0.15s ease !important;
  }
  .video-js .vjs-progress-control:hover .vjs-play-progress:before {
    transform: translateY(-50%) scale(1.15) !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.35) !important;
    border-radius: 2px !important;
  }
  .video-js .vjs-load-progress div {
    background: transparent !important;
  }

  /* ===== BUTTONS & PILLS ===== */
  /* [LEFT GROUP] 1. Play/Pause circular glass pill */
  .video-js .vjs-control-bar .vjs-play-control {
    order: 1 !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    cursor: pointer !important;
    margin: 0 8px 0 0 !important;
    transition: all 0.2s ease !important;
  }
  .video-js .vjs-control-bar .vjs-play-control:hover {
    background: rgba(255, 255, 255, 0.24) !important;
    transform: scale(1.05) !important;
  }

  /* [LEFT GROUP] 2. Volume circular glass pill with smooth slider expand */
  .video-js .vjs-control-bar .vjs-volume-panel {
    order: 2 !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 18px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease !important;
    overflow: hidden !important;
    padding: 0 !important;
    margin: 0 8px 0 0 !important;
    cursor: pointer !important;
    z-index: 5 !important;
  }
  .video-js .vjs-control-bar .vjs-volume-panel:hover,
  .video-js .vjs-control-bar .vjs-volume-panel:focus-within,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-slider-active,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-volume-panel-horizontal:hover,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-slider-active,
  .video-js .vjs-control-bar .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-hover {
    width: 120px !important;
    background: rgba(255, 255, 255, 0.18) !important;
  }
  .video-js .vjs-mute-control {
    width: 36px !important;
    height: 36px !important;
    flex: 0 0 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .video-js .vjs-volume-control {
    flex: 1 1 auto !important;
    display: flex !important;
    align-items: center !important;
    margin: 0 !important;
    padding: 0 10px 0 0 !important;
    height: 100% !important;
    opacity: 0 !important;
    width: 0 !important;
    transition: opacity 0.2s ease, width 0.2s ease !important;
    pointer-events: none !important;
  }
  .video-js .vjs-volume-panel:hover .vjs-volume-control,
  .video-js .vjs-volume-panel:focus-within .vjs-volume-control,
  .video-js .vjs-volume-panel.vjs-slider-active .vjs-volume-control,
  .video-js .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-slider-active .vjs-volume-control,
  .video-js .vjs-volume-panel.vjs-hover .vjs-volume-control {
    opacity: 1 !important;
    width: 74px !important;
    pointer-events: auto !important;
  }
  .video-js .vjs-volume-bar {
    width: 100% !important;
    height: 4px !important;
    border-radius: 2px !important;
    background-color: rgba(255, 255, 255, 0.3) !important;
    margin: 0 !important;
    cursor: pointer !important;
    position: relative !important;
    transition: height 0.15s ease !important;
  }
  .video-js .vjs-volume-panel:hover .vjs-volume-bar,
  .video-js .vjs-volume-panel.vjs-slider-active .vjs-volume-bar {
    height: 5px !important;
  }
  .video-js .vjs-volume-level {
    background-color: #FFFFFF !important;
    height: 100% !important;
    border-radius: 2px !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
  }
  .video-js .vjs-volume-level:before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    right: -5px !important;
    width: 10px !important;
    height: 10px !important;
    background-color: #FFFFFF !important;
    border-radius: 50% !important;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.9) !important;
    transform: translateY(-50%) !important;
    display: block !important;
  }

  /* [LEFT GROUP] 3. Time display: Single unified seamless glass capsule pill (0 gaps, 0 internal seams) */
  .video-js .vjs-control-bar .vjs-current-time {
    order: 3 !important;
    height: 36px !important;
    border-top-left-radius: 18px !important;
    border-bottom-left-radius: 18px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-right: none !important;
    padding: 0 2px 0 12px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    font-variant-numeric: tabular-nums !important;
    letter-spacing: 0.02em !important;
    color: #FFFFFF !important;
  }
  .video-js .vjs-current-time-display {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .video-js .vjs-control-bar .vjs-time-divider {
    order: 4 !important;
    height: 36px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-left: none !important;
    border-right: none !important;
    padding: 0 4px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: unset !important;
    color: rgba(255, 255, 255, 0.6) !important;
    font-size: 12.5px !important;
  }
  .video-js .vjs-control-bar .vjs-duration {
    order: 5 !important;
    height: 36px !important;
    border-top-right-radius: 18px !important;
    border-bottom-right-radius: 18px !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-left: none !important;
    padding: 0 12px 0 2px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    font-variant-numeric: tabular-nums !important;
    letter-spacing: 0.02em !important;
    color: #FFFFFF !important;
  }
  .video-js .vjs-duration-display {
    background: transparent !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* [RIGHT GROUP] 4. Playback rate: order 100 + margin-left: auto pushes entire right group to the absolute far right */
  .video-js .vjs-control-bar .vjs-playback-rate {
    order: 100 !important;
    margin-left: auto !important;
    margin-right: 8px !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  .video-js .vjs-control-bar .vjs-playback-rate:hover {
    background: rgba(255, 255, 255, 0.24) !important;
    transform: scale(1.05) !important;
  }
  .video-js .vjs-playback-rate .vjs-playback-rate-value {
    font-size: 12px !important;
    font-weight: 700 !important;
    line-height: 36px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* [RIGHT GROUP] 5. Fullscreen control: order 101 (sits directly at the right border) */
  .video-js .vjs-control-bar .vjs-fullscreen-control {
    order: 101 !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    margin: 0 !important;
  }
  .video-js .vjs-control-bar .vjs-fullscreen-control:hover {
    background: rgba(255, 255, 255, 0.24) !important;
    transform: scale(1.05) !important;
  }

  .video-js .vjs-button > .vjs-icon-placeholder:before {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 18px !important;
    line-height: 1 !important;
    height: 100% !important;
    width: 100% !important;
  }

  /* Big play button */
  .video-js .vjs-big-play-button {
    background-color: rgba(15, 23, 42, 0.75) !important;
    backdrop-filter: blur(10px) !important;
    border: 2px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 50% !important;
    width: 68px !important;
    height: 68px !important;
    line-height: 64px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
    padding: 0 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    font-size: 2.6em !important;
    color: #fff !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
  }
  .video-js:hover .vjs-big-play-button {
    background-color: ${PRIMARY_RED} !important;
    border-color: ${PRIMARY_RED} !important;
    transform: translate(-50%, -50%) scale(1.08) !important;
    box-shadow: 0 12px 36px rgba(139, 19, 19, 0.6) !important;
  }
  .video-js.vjs-playing .vjs-big-play-button {
    display: none !important;
  }

  /* Menu popup */
  .video-js .vjs-menu-button-popup .vjs-menu {
    position: absolute !important;
    bottom: 3.2em !important;
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
  }
  .video-js .vjs-menu-content {
    background-color: rgba(15, 23, 42, 0.95) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    border-radius: 12px !important;
    padding: 6px 0 !important;
    box-shadow: 0 12px 32px rgba(0,0,0,0.6) !important;
  }
  .video-js .vjs-menu-item {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 8px 18px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    cursor: pointer !important;
  }
  .video-js .vjs-menu-item.vjs-selected {
    background-color: rgba(255,255,255,0.18) !important;
    color: #fff !important;
    font-weight: 700 !important;
  }
  .video-js .vjs-menu-item:hover {
    background-color: rgba(255,255,255,0.12) !important;
  }

  .video-js .vjs-slider {
    border-radius: 2px !important;
  }
  .video-js .vjs-loading-spinner,
  .video-js.vjs-waiting .vjs-loading-spinner,
  .video-js.vjs-seeking .vjs-loading-spinner {
    display: none !important;
  }
`;

// ======================== CONSTANTS ========================
const VIEW_MIN_HEIGHT = 360;
const VIEW_MAX_HEIGHT = 640;
const LOAD_TIMEOUT_MS = 30000;

interface QualityLevel {
  index: number;
  label: string;
  bitrate: number;
  height: number;
}

// ======================== MAIN COMPONENT ========================
export default function NoiDungViewer({
  selected,
  onSaveLyDo,
}: {
  selected: any;
  onSaveLyDo?: (
    loai: "baiGiang" | "baiKiemTra",
    id: string | number,
    lyDo: string,
  ) => Promise<void>;
}) {
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
          p: 4,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "20px",
            bgcolor: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <SchoolRoundedIcon sx={{ fontSize: 32, color: BRAND.main }} />
        </Box>
        <Typography
          sx={{
            color: "#0F172A",
            fontFamily: FONTS.display,
            fontWeight: 800,
            fontSize: 16,
            mb: 0.5,
          }}
        >
          Chọn nội dung để xem xét
        </Typography>
        <Typography sx={{ color: "#64748B", fontSize: 13.5, maxWidth: 360 }}>
          Vui lòng nhấp vào một bài giảng, tài liệu hoặc bài kiểm tra ở danh sách
          bên phải để bắt đầu xem xét nội dung.
        </Typography>
      </Box>
    );
  }

  const { loai, item, lyDoTarget } = selected;
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

  const target = lyDoTarget || { loai, item };
  const targetLoai = target.loai;
  const targetItem = target.item;
  const targetId =
    targetLoai === "baiGiang"
      ? (targetItem?.idBaiGiang ?? targetItem?.id)
      : (targetItem?.idBaiKiemTra ?? targetItem?.id);
  const showLyDoForm =
    (targetLoai === "baiGiang" || targetLoai === "baiKiemTra") &&
    typeof onSaveLyDo === "function" &&
    Boolean(targetId);

  let currentLyDo = "";
  const lyDoData = targetItem?.lyDoTuChois;
  if (lyDoData) {
    if (Array.isArray(lyDoData) && lyDoData.length > 0) {
      currentLyDo = lyDoData
        .map((l: any) => l.lyDo || "")
        .filter(Boolean)
        .join(", ");
    } else if (typeof lyDoData === "object" && lyDoData.lyDo) {
      currentLyDo = lyDoData.lyDo;
    } else if (typeof lyDoData === "string") {
      currentLyDo = lyDoData;
    }
  }
  if (!currentLyDo && typeof targetItem?.lyDoTuChoi === "string") {
    currentLyDo = targetItem.lyDoTuChoi;
  }
  if (!currentLyDo && Array.isArray(targetItem?.lyDoTuChoi)) {
    currentLyDo = targetItem.lyDoTuChoi.filter(Boolean).join(", ");
  }

  const targetTaiLieus: any[] = Array.isArray(targetItem?.taiLieus)
    ? targetItem.taiLieus
    : [];
  const scopeNote =
    targetLoai === "baiGiang" &&
    (loai === "taiLieu" || targetTaiLieus.length > 0)
      ? "Áp dụng chung cho bài giảng này và tất cả tài liệu đính kèm bên dưới."
      : undefined;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Header of Viewer */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          mb: 2.25,
          pb: 2,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            bgcolor:
              loai === "baiGiang"
                ? "#FEF2F2"
                : loai === "taiLieu"
                  ? "#F0F9FF"
                  : "#FEF2F2",
            color:
              loai === "baiGiang"
                ? BRAND.main
                : loai === "taiLieu"
                  ? "#0284C7"
                  : BRAND.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {loai === "baiGiang" ? (
            <OndemandVideoRoundedIcon sx={{ fontSize: 22 }} />
          ) : loai === "taiLieu" ? (
            <InsertDriveFileRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <QuizRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: FONTS.display,
              fontWeight: 800,
              fontSize: { xs: 16, sm: 18 },
              color: "#0F172A",
              lineHeight: 1.3,
            }}
            noWrap
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#64748B", fontWeight: 600, fontSize: 12 }}
          >
            {loai === "baiGiang"
              ? "Nội dung bài giảng video"
              : loai === "taiLieu"
                ? "Tài liệu học tập đính kèm"
                : "Bài kiểm tra đánh giá kiến thức"}
          </Typography>
        </Box>

        <StatusChip trangThai={item.trangThaiPheDuyet} />

        {url && !isTest && (
          <Tooltip title="Mở toàn màn hình">
            <IconButton
              size="small"
              onClick={() => setOpenFull(true)}
              sx={{
                color: "#64748B",
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                p: 0.85,
                transition: "all 0.15s ease",
                "&:hover": {
                  color: BRAND.main,
                  borderColor: alpha(BRAND.main, 0.4),
                  bgcolor: "#FEF2F2",
                },
              }}
            >
              <FullscreenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Main Content Body */}
      <Box sx={{ mb: 2.5, position: "relative" }}>
        <ViewerBody
          loai={loai}
          url={url}
          item={item}
          minHeight={VIEW_MIN_HEIGHT}
          maxHeight={VIEW_MAX_HEIGHT}
        />
      </Box>

      {/* Ghi chú / Lý do từ chối */}
      {showLyDoForm && (
        <LyDoTuChoiInput
          key={`${targetLoai}-${targetId}`}
          idDoiTuong={targetId}
          loaiDoiTuong={targetLoai === "baiGiang" ? "BaiGiang" : "BaiKiemTra"}
          initialValue={currentLyDo}
          scopeNote={scopeNote}
          onSave={(lyDo) => onSaveLyDo(targetLoai, targetId, lyDo)}
        />
      )}

      {/* Fullscreen Dialog */}
      {url && !isTest && (
        <Dialog
          open={openFull}
          onClose={() => setOpenFull(false)}
          fullWidth
          maxWidth="lg"
          slotProps={{
            paper: {
              sx: {
                borderRadius: "20px",
                bgcolor: "#0B0B0F",
                color: "#FFFFFF",
                height: "92vh",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              },
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              px: 3,
              py: 1.75,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              bgcolor: "#121218",
              flexShrink: 0,
            }}
          >
            {loai === "baiGiang" ? (
              <PlayCircleFilledRoundedIcon sx={{ color: BRAND.main }} />
            ) : (
              <InsertDriveFileRoundedIcon sx={{ color: "#38BDF8" }} />
            )}
            <Typography
              sx={{
                flex: 1,
                fontFamily: FONTS.display,
                fontWeight: 700,
                fontSize: 16,
                color: "#F8FAFC",
              }}
              noWrap
            >
              {title}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setOpenFull(false)}
              sx={{
                color: "#94A3B8",
                "&:hover": { color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box
            sx={{
              p: 2,
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <ViewerBody
              loai={loai}
              url={url}
              item={item}
              minHeight={0}
              maxHeight="100%"
              isFullscreen
            />
          </Box>
        </Dialog>
      )}
    </Box>
  );
}

// ======================== VIEWER BODY ========================
function ViewerBody({
  loai,
  url,
  item,
  minHeight,
  maxHeight,
  isFullscreen = false,
}: {
  loai: string;
  url: string | null;
  item: any;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
}) {
  // Bài kiểm tra
  if (loai === "baiKiemTra") {
    const cauHois: any[] =
      item.cauHois ??
      item.danhSachCauHois ??
      item.danhSachCauHoi ??
      item.DanhSachCauHois ??
      [];
    return (
      <Box
        sx={{
          minHeight,
          maxHeight,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          p: { xs: 2, sm: 3 },
          borderRadius: "16px",
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(BRAND.main, 0.2),
            borderRadius: 8,
          },
        }}
      >
        {cauHois.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <QuizRoundedIcon sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
            <Typography sx={{ color: "#64748B", fontWeight: 600 }}>
              Bài kiểm tra này chưa có câu hỏi nào được thiết lập.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                pb: 1,
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#0F172A",
                  fontFamily: FONTS.display,
                }}
              >
                Danh sách câu hỏi kiểm tra
              </Typography>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: "999px",
                  bgcolor: "#FEF2F2",
                  border: `1px solid ${alpha(BRAND.main, 0.2)}`,
                  color: BRAND.main,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Tổng {cauHois.length} câu hỏi
              </Box>
            </Stack>

            {cauHois.map((ch: any, idx: number) => {
              const dapAns: any[] =
                ch.dapAns ??
                ch.danhSachDapAns ??
                ch.danhSachDapAn ??
                ch.DanhSachDapAns ??
                ch.luaChons ??
                [];
              const rawQuestion =
                ch.noiDungCauHoi ||
                ch.noiDung ||
                ch.tenCauHoi ||
                ch.tieuDe ||
                `Câu hỏi ${idx + 1}`;
              const questionContent = cleanHtmlContent(rawQuestion);
              const isHtml = isHtmlContent(questionContent);
              const rawTitle = ch.tenCauHoi ? cleanHtmlContent(ch.tenCauHoi) : "";
              const showTitle =
                Boolean(rawTitle) &&
                rawTitle !== questionContent &&
                rawTitle !== `Câu hỏi ${idx + 1}` &&
                stripHtml(rawTitle) !== stripHtml(questionContent);

              return (
                <Paper
                  key={ch.idCauHoi ?? ch.id ?? idx}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "1px solid #E2E8F0",
                    bgcolor: "#FFFFFF",
                    borderRadius: "14px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: alpha(BRAND.main, 0.3),
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        bgcolor: "#FEF2F2",
                        color: BRAND.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 12.5,
                        flexShrink: 0,
                        mt: 0.1,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {showTitle && (
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#0F172A",
                            fontSize: 14.5,
                            mb: 0.5,
                          }}
                        >
                          {stripHtml(rawTitle)}
                        </Typography>
                      )}
                      {isHtml ? (
                        <Box
                          sx={{
                            fontSize: 14.5,
                            color: "#0F172A",
                            lineHeight: 1.6,
                            fontWeight: 600,
                            "& p": { m: 0, mb: 0.5, "&:last-child": { mb: 0 } },
                            "& strong": { fontWeight: 700 },
                            "& img": { maxWidth: "100%", height: "auto", borderRadius: "8px" },
                          }}
                          dangerouslySetInnerHTML={{ __html: questionContent }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#0F172A",
                            fontSize: 14.5,
                            lineHeight: 1.5,
                          }}
                        >
                          {questionContent}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {dapAns.length > 0 && (
                    <Stack spacing={1} sx={{ pl: 4.5 }}>
                      {dapAns.map((da: any, daIdx: number) => {
                        const isCorrect =
                          da.isCorrect === true ||
                          da.dung === true ||
                          da.laDapAnDung === true ||
                          da.dapAnDung === true ||
                          da.isDung === true;
                        const rawAnswer =
                          da.noiDungDapAn ??
                          da.noiDung ??
                          da.tieuDe ??
                          da.luaChon ??
                          da.tenDapAn ??
                          "";
                        const answerText = cleanHtmlContent(rawAnswer);
                        const isAnswerHtml = isHtmlContent(answerText);

                        return (
                          <Box
                            key={da.idDapAn ?? da.id ?? daIdx}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.25,
                              p: 1.25,
                              borderRadius: "10px",
                              border: `1px solid ${isCorrect ? "#BBF7D0" : "#F1F5F9"}`,
                              bgcolor: isCorrect ? "#F0FDF4" : "#F8FAFC",
                            }}
                          >
                            {isCorrect ? (
                              <CheckCircleRoundedIcon
                                sx={{ color: "#16A34A", fontSize: 18, flexShrink: 0 }}
                              />
                            ) : (
                              <RadioButtonUncheckedRoundedIcon
                                sx={{ color: "#94A3B8", fontSize: 18, flexShrink: 0 }}
                              />
                            )}
                            {isAnswerHtml ? (
                              <Box
                                sx={{
                                  fontSize: 13.5,
                                  color: isCorrect ? "#166534" : "#334155",
                                  fontWeight: isCorrect ? 700 : 500,
                                  flex: 1,
                                  wordBreak: "break-word",
                                  "& p": { m: 0 },
                                  "& strong": { fontWeight: 700 },
                                }}
                                dangerouslySetInnerHTML={{ __html: answerText }}
                              />
                            ) : (
                              <Typography
                                sx={{
                                  fontSize: 13.5,
                                  color: isCorrect ? "#166534" : "#334155",
                                  fontWeight: isCorrect ? 700 : 500,
                                  flex: 1,
                                  wordBreak: "break-word",
                                }}
                              >
                                {answerText || "(Trống)"}
                              </Typography>
                            )}
                            {isCorrect && (
                              <Box
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: "#16A34A",
                                  bgcolor: "#DCFCE7",
                                  px: 1,
                                  py: 0.2,
                                  borderRadius: "6px",
                                }}
                              >
                                Đáp án đúng
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    );
  }

  // Không có URL
  if (!url) {
    return (
      <Box
        sx={{
          minHeight,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#F8FAFC",
          border: "1px dashed #CBD5E1",
          borderRadius: "16px",
          p: 4,
          textAlign: "center",
        }}
      >
        <HelpOutlineRoundedIcon sx={{ fontSize: 40, color: "#94A3B8", mb: 1 }} />
        <Typography sx={{ color: "#64748B", fontWeight: 600 }}>
          Mục này chưa được tải lên file hoặc liên kết phát trực tiếp.
        </Typography>
      </Box>
    );
  }

  // Video
  if (loai === "baiGiang") {
    return (
      <VideoPlayer
        url={url}
        minHeight={minHeight}
        maxHeight={maxHeight}
        isFullscreen={isFullscreen}
      />
    );
  }

  // Tài liệu
  return (
    <TaiLieuPreview
      url={url}
      tenTaiLieu={item.tenTaiLieu || item.tieuDe || "Tài liệu"}
      minHeight={minHeight}
      maxHeight={maxHeight}
      isFullscreen={isFullscreen}
    />
  );
}

// ======================== VIDEO PLAYER ========================
function VideoPlayer({
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

  const handleFallback = useCallback(() => {
    setUseFallback(true);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { masterUrl } = getOptimalHlsUrl(url);
  const isHls = masterUrl.includes(".m3u8");

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
      video.addEventListener("canplay", onCanPlay);
      video.addEventListener("loadeddata", onCanPlay);
      video.addEventListener("error", () => {
        clearTimeout(timeout);
        setIsLoading(false);
        setHasError(true);
      });
      return () => {
        clearTimeout(timeout);
        video.removeEventListener("canplay", onCanPlay);
        video.removeEventListener("loadeddata", onCanPlay);
      };
    }
  }, [useFallback, isHls, masterUrl]);

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

  const getVideoType = (src: string): string => {
    if (src.includes(".m3u8")) return "application/x-mpegURL";
    if (src.endsWith(".webm")) return "video/webm";
    if (src.endsWith(".ogg")) return "video/ogg";
    if (src.endsWith(".mov")) return "video/quicktime";
    if (src.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  };

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: isFullscreen ? "unset" : "16/9",
        height: isFullscreen ? "100%" : "auto",
        bgcolor: "#0B0B0F",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
      }}
    >
      {isLoading && !hasError && !loadTimedOut && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "rgba(11, 11, 15, 0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: BRAND.main,
              animation: "spin 0.85s linear infinite",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#E2E8F0", fontWeight: 600, letterSpacing: "0.02em" }}
          >
            Đang tải dữ liệu video...
          </Typography>
        </Box>
      )}

      {(hasError || loadTimedOut) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            background: "radial-gradient(ellipse at center, #1E1E28 0%, #0B0B0F 100%)",
            p: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "rgba(220, 38, 38, 0.12)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <OndemandVideoRoundedIcon sx={{ fontSize: 28, color: "#F87171" }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#F8FAFC", fontWeight: 700, fontSize: 15, mb: 0.5 }}>
              {loadTimedOut
                ? "Quá thời gian tải video"
                : "Không thể phát video này"}
            </Typography>
            <Typography sx={{ color: "#94A3B8", fontSize: 13, maxWidth: 360 }}>
              Định dạng video hoặc kết nối máy chủ streaming đang gặp gián đoạn.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                setHasError(false);
                setLoadTimedOut(false);
                setIsLoading(true);
                const video = videoRef.current;
                if (video) video.load();
              }}
              sx={{
                textTransform: "none",
                bgcolor: BRAND.main,
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
                "&:hover": { bgcolor: BRAND.dark },
              }}
            >
              Thử lại
            </Button>
            <Button
              variant="outlined"
              size="small"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewRoundedIcon />}
              sx={{
                textTransform: "none",
                borderColor: "rgba(255,255,255,0.2)",
                color: "#F8FAFC",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              Mở liên kết
            </Button>
          </Stack>
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
      >
        <source src={masterUrl} type={getVideoType(masterUrl)} />
      </video>
    </Box>
  );
}

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

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | "auto">("auto");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const { masterUrl } = getOptimalHlsUrl(url);
  const isHls = masterUrl.includes(".m3u8");

  const getVideoType = (src: string): string => {
    if (src.includes(".m3u8")) return "application/x-mpegURL";
    if (src.endsWith(".webm")) return "video/webm";
    if (src.endsWith(".ogg")) return "video/ogg";
    if (src.endsWith(".mov")) return "video/quicktime";
    if (src.endsWith(".avi")) return "video/x-msvideo";
    return "video/mp4";
  };

  useEffect(() => {
    let s = document.getElementById("vjs-kiemduyet-styles") as HTMLStyleElement;
    if (!s) {
      s = document.createElement("style");
      s.id = "vjs-kiemduyet-styles";
      document.head.appendChild(s);
    }
    s.textContent = VIDEO_JS_STYLES(BRAND.main);
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
    timeoutRef.current = setTimeout(() => {
      clearAllTimers();
      setLoadTimedOut(true);
      setIsLoading(false);
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setHasError(false);
    setIsLoading(true);
    setLoadTimedOut(false);
    setQualityLevels([]);
    setSelectedQuality("auto");
    autoSelectedRef.current = false;
    startLoadTimeout();

    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered";
    container.appendChild(videoEl);

    try {
      const player = videojs(videoEl, {
        controls: true,
        autoplay: false,
        preload: "auto",
        fluid: true,
        fill: true,
        responsive: true,
        aspectRatio: "16:9",
        liveui: false,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        html5: {
          vhs: isHls
            ? {
                overrideNative: true,
                useNetworkInformationApi: true,
                enableLowInitialPlaylist: true,
                smoothQualityChange: true,
                handlePartialData: true,
                bandwidth: 4_000_000,
              }
            : undefined,
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false,
        },
        controlBar: {
          playToggle: true,
          volumePanel: { inline: true },
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          progressControl: { seekBar: true },
          liveDisplay: false,
          seekToLive: false,
          playbackRateMenuButton: true,
          pictureInPictureToggle: false,
          subsCapsButton: false,
          audioTrackButton: false,
          fullscreenToggle: true,
        },
        sources: [
          {
            src: masterUrl,
            type: getVideoType(masterUrl),
            crossOrigin: "anonymous",
          },
        ],
      });

      playerRef.current = player;

      const markReady = () => {
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
              const levels: QualityLevel[] = [];
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

      player.on("error", () => {
        clearAllTimers();
        setIsLoading(false);
        setHasError(true);
      });

      return () => {
        clearAllTimers();
        const p: any = playerRef.current;
        playerRef.current = null;
        try {
          if (p && typeof p.isDisposed === "function" && !p.isDisposed()) {
            p.dispose();
          }
        } catch {}
        if (container && videoEl.parentNode === container) {
          container.removeChild(videoEl);
        }
      };
    } catch (err) {
      console.error("Video.js init error:", err);
      onFallback();
    }
  }, [masterUrl, isHls, startLoadTimeout, onFallback, applyQuality]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);
    startLoadTimeout();
    const p = playerRef.current;
    if (p && typeof p.load === "function") {
      p.load();
    }
  }, [startLoadTimeout]);

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: isFullscreen ? "unset" : "16/9",
        height: isFullscreen ? "100%" : "auto",
        bgcolor: "#0B0B0F",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "& .video-js": {
            width: "100%",
            height: "100%",
          },
        }}
      />

      {/* Quality Badge Selector */}
      {qualityLevels.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
          }}
        >
          <Button
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            startIcon={<HighQualityRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              bgcolor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(8px)",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 700,
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              px: 1.25,
              py: 0.4,
              "&:hover": {
                bgcolor: "rgba(15, 23, 42, 0.9)",
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            {selectedQuality === "auto"
              ? "Tự động"
              : qualityLevels.find((q) => q.index === selectedQuality)?.label ||
                "Độ phân giải"}
          </Button>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  bgcolor: "#1E1E28",
                  color: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                },
              },
            }}
          >
            <MenuItem
              selected={selectedQuality === "auto"}
              onClick={() => applyQuality("auto")}
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              Tự động (Khuyên dùng)
            </MenuItem>
            {qualityLevels.map((q) => (
              <MenuItem
                key={q.index}
                selected={selectedQuality === q.index}
                onClick={() => applyQuality(q.index)}
                sx={{ fontSize: 13, fontWeight: 600 }}
              >
                {q.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}

      {/* Loading Overlay */}
      {isLoading && !hasError && !loadTimedOut && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "rgba(11, 11, 15, 0.85)",
            backdropFilter: "blur(6px)",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: BRAND.main,
              animation: "spin 0.85s linear infinite",
              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
          <Typography variant="body2" sx={{ color: "#E2E8F0", fontWeight: 600 }}>
            Đang tải dữ liệu video...
          </Typography>
        </Box>
      )}

      {/* Error Overlay */}
      {(hasError || loadTimedOut) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            background: "radial-gradient(ellipse at center, #1E1E28 0%, #0B0B0F 100%)",
            p: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "rgba(220, 38, 38, 0.12)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <OndemandVideoRoundedIcon sx={{ fontSize: 28, color: "#F87171" }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#F8FAFC", fontWeight: 700, fontSize: 15, mb: 0.5 }}>
              {loadTimedOut
                ? "Quá thời gian tải video"
                : "Không thể phát video này"}
            </Typography>
            <Typography sx={{ color: "#94A3B8", fontSize: 13, maxWidth: 360 }}>
              Định dạng video hoặc kết nối máy chủ streaming đang gặp gián đoạn.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleRetry}
              sx={{
                textTransform: "none",
                bgcolor: BRAND.main,
                fontWeight: 700,
                borderRadius: "8px",
                px: 2,
                "&:hover": { bgcolor: BRAND.dark },
              }}
            >
              Thử lại
            </Button>
            <Button
              variant="outlined"
              size="small"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewRoundedIcon />}
              sx={{
                textTransform: "none",
                borderColor: "rgba(255,255,255,0.2)",
                color: "#F8FAFC",
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              Mở liên kết
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

// ======================== TÀI LIỆU PREVIEW ========================
function TaiLieuPreview({
  url,
  tenTaiLieu,
  minHeight,
  maxHeight,
  isFullscreen = false,
}: {
  url: string;
  tenTaiLieu: string;
  minHeight: string | number;
  maxHeight: string | number;
  isFullscreen?: boolean;
}) {
  const kind = getFileKind(url);
  const fileName = getFileName(url, tenTaiLieu);

  const fillSx = isFullscreen
    ? { height: "100%", flex: 1 }
    : { minHeight, maxHeight };

  const frameBox = (children: React.ReactNode) => (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
        ...fillSx,
      }}
    >
      {children}
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
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
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
          border: "1px solid #E2E8F0",
          bgcolor: "#0F172A",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "16px",
          overflow: "hidden",
          ...fillSx,
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
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />,
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{
        width: "100%",
        maxWidth: "100%",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        border: "1px dashed #CBD5E1",
        bgcolor: "#F8FAFC",
        borderRadius: "16px",
        textAlign: "center",
        ...fillSx,
      }}
    >
      <InsertDriveFileRoundedIcon sx={{ fontSize: 44, color: "#64748B" }} />
      <Box>
        <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: 15, mb: 0.5 }}>
          {fileName}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Định dạng tài liệu này chưa hỗ trợ xem trước trực tiếp trên trang.
        </Typography>
      </Box>
      <Button
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        startIcon={<OpenInNewRoundedIcon />}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          borderRadius: "10px",
          bgcolor: BRAND.main,
          px: 2.5,
          "&:hover": { bgcolor: BRAND.dark },
        }}
      >
        Mở tài liệu trong tab mới
      </Button>
    </Stack>
  );
}
