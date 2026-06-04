"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import KhoaHocService from "@/src/services/KhoaHocService";
import TienDoHocTapService from "@/src/services/TienDoHocTapService";
import { UpdateTienDoBaiGiangRequest } from "@/src/types/tienDoHocTap/Request/UpdateTienDoBaiGiangRequest";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/http-streaming";

import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  useTheme,
  alpha,
  styled,
  Zoom,
  Skeleton,
  TextField,
  InputAdornment,
  Tooltip,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  VideoLibrary as VideoLibraryIcon,
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  OpenInFull as OpenInFullIcon,
  Hd as HdIcon,
  SignalCellularAlt as SignalIcon,
} from "@mui/icons-material";

import { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { CloudinaryUrlInfo } from "@/src/types/Cloudinary/Dto/CloudinaryDto";

const KhoaHocSvc = new KhoaHocService();
const TienDoSvc = new TienDoHocTapService();

const SIDEBAR_W = 380;
const HEADER_H = 64;
const PRIMARY_RED = "#8B1A1A";
const PRIMARY_RED_DARK = "#6B1414";
const LOAD_TIMEOUT_MS = 30000;

// ─────────────────────────────────────────────
// Cloudinary helpers
// ─────────────────────────────────────────────
function parseCloudinaryUrl(url: string): CloudinaryUrlInfo | null {
  try {
    const u = new URL(url);
    if (
      !u.hostname.includes("cloudinary.com") &&
      !u.hostname.includes("res.cloudinary.com")
    )
      return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[1] !== "video" || parts[2] !== "upload")
      return null;
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
        )
          startIdx = i + 1;
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

// ─────────────────────────────────────────────
// Video.js CSS overrides
// ─────────────────────────────────────────────
const VIDEO_JS_STYLES = `
  .video-js .vjs-big-play-button {
    background-color: ${PRIMARY_RED} !important;
    border-color: ${PRIMARY_RED} !important;
    border-radius: 50% !important;
    width: 64px !important;
    height: 64px !important;
    line-height: 64px !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
  }
  .video-js .vjs-big-play-button:hover {
    background-color: ${PRIMARY_RED_DARK} !important;
  }
  .video-js .vjs-control-bar {
    background: linear-gradient(transparent, rgba(0,0,0,0.85)) !important;
    height: 48px !important;
    padding: 0 8px !important;
    display: flex !important;
    align-items: center !important;
  }
  .video-js .vjs-progress-control {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    display: flex !important;
    align-items: center !important;
    height: 100% !important;
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  .video-js .vjs-progress-holder {
    flex: auto !important;
    height: 5px !important;
    border-radius: 3px !important;
    transition: height 0.15s ease !important;
    cursor: pointer !important;
  }
  .video-js .vjs-progress-control:hover .vjs-progress-holder {
    height: 9px !important;
  }
  .video-js .vjs-play-progress,
  .video-js .vjs-play-progress:before {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-play-progress:before {
    top: -0.28em !important;
    font-size: 0.95em !important;
  }
  .video-js .vjs-load-progress {
    background-color: rgba(255,255,255,0.25) !important;
    border-radius: 3px !important;
  }
  .video-js .vjs-load-progress div {
    background-color: rgba(255,255,255,0.15) !important;
  }
  .video-js .vjs-slider {
    background-color: rgba(255,255,255,0.2) !important;
    border-radius: 3px !important;
  }
  .video-js .vjs-volume-level {
    background-color: ${PRIMARY_RED} !important;
  }
  .video-js .vjs-mouse-display .vjs-time-tooltip,
  .video-js .vjs-play-progress .vjs-time-tooltip {
    background: rgba(0,0,0,0.82) !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    padding: 2px 6px !important;
  }
  .video-js .vjs-menu-item.vjs-selected,
  .video-js .vjs-menu-item.vjs-selected:focus,
  .video-js .vjs-menu-item.vjs-selected:hover {
    background-color: ${PRIMARY_RED} !important;
    color: #fff !important;
  }
  .video-js .vjs-menu-item:hover {
    background-color: rgba(139,26,26,0.3) !important;
  }
  .video-js .vjs-menu-button-popup .vjs-menu {
    bottom: 2.5em !important;
  }
  .video-js {
    width: 100% !important;
    font-family: inherit !important;
  }
  .video-js .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-waiting .vjs-loading-spinner { display: none !important; }
  .video-js.vjs-seeking .vjs-loading-spinner { display: none !important; }
`;

// ─────────────────────────────────────────────
// Styled components
// ─────────────────────────────────────────────
const ProgressBar = styled(LinearProgress)({
  height: 5,
  borderRadius: 3,
  backgroundColor: alpha(PRIMARY_RED, 0.15),
  "& .MuiLinearProgress-bar": { backgroundColor: PRIMARY_RED, borderRadius: 3 },
});

const GlassPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "blur(12px)",
  borderRadius: 8,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface QualityLevel {
  index: number;
  label: string;
  bitrate: number;
  height: number;
}

const CLOUDINARY_PROFILES: Array<{
  profile: string;
  label: string;
  height: number;
  bitrate: number;
}> = [
  {
    profile: "sp_full_hd",
    label: "1080p HD",
    height: 1080,
    bitrate: 4_000_000,
  },
  { profile: "sp_hd", label: "720p HD", height: 720, bitrate: 2_000_000 },
  { profile: "sp_sd", label: "480p", height: 480, bitrate: 800_000 },
];

// ─────────────────────────────────────────────
// QualityMenu
// ─────────────────────────────────────────────
const QualityMenu = ({
  qualityLevels,
  selectedQuality,
  currentBandwidthKbps,
  onSelectQuality,
  cloudinaryInfo,
  onSelectCloudinaryProfile,
  selectedProfile,
}: {
  qualityLevels: QualityLevel[];
  selectedQuality: number | "auto";
  currentBandwidthKbps: number | null;
  onSelectQuality: (q: number | "auto") => void;
  cloudinaryInfo: CloudinaryUrlInfo | null;
  onSelectCloudinaryProfile: (profile: string | "auto") => void;
  selectedProfile: string | "auto";
}) => {
  const [open, setOpen] = useState(false);
  const useManualProfiles =
    qualityLevels.length === 0 && cloudinaryInfo !== null;

  const currentLabel = useMemo(() => {
    if (useManualProfiles) {
      if (selectedProfile === "auto") return "Tự động";
      return (
        CLOUDINARY_PROFILES.find((p) => p.profile === selectedProfile)?.label ??
        "Tự động"
      );
    }
    if (selectedQuality === "auto") {
      if (currentBandwidthKbps && currentBandwidthKbps > 0) {
        const bw =
          currentBandwidthKbps >= 1000
            ? `${(currentBandwidthKbps / 1000).toFixed(1)} Mbps`
            : `${currentBandwidthKbps} kbps`;
        return `Tự động · ${bw}`;
      }
      return "Tự động";
    }
    return (
      qualityLevels.find((q) => q.index === selectedQuality)?.label ?? "Auto"
    );
  }, [
    selectedQuality,
    qualityLevels,
    currentBandwidthKbps,
    useManualProfiles,
    selectedProfile,
  ]);

  if (qualityLevels.length === 0 && !cloudinaryInfo) return null;

  const isAutoSelected = useManualProfiles
    ? selectedProfile === "auto"
    : selectedQuality === "auto";

  return (
    <Box sx={{ position: "absolute", bottom: 52, right: 12, zIndex: 20 }}>
      {open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{ position: "fixed", inset: 0, zIndex: -1 }}
        />
      )}
      {open && (
        <Paper
          sx={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            minWidth: 180,
            py: 0.75,
            bgcolor: "rgba(18,18,18,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 1.5,
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 0.5,
              display: "block",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontSize: "0.65rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              mb: 0.5,
              pb: 0.75,
            }}
          >
            ĐỘ PHÂN GIẢI
          </Typography>

          <Box
            onClick={() => {
              if (useManualProfiles) onSelectCloudinaryProfile("auto");
              else onSelectQuality("auto");
              setOpen(false);
            }}
            sx={{
              px: 2,
              py: 0.75,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: isAutoSelected
                ? alpha(PRIMARY_RED, 0.18)
                : "transparent",
              "&:hover": { bgcolor: alpha(PRIMARY_RED, 0.12) },
              transition: "background 0.15s",
            }}
          >
            <SignalIcon
              sx={{
                fontSize: 15,
                color: isAutoSelected ? PRIMARY_RED : "rgba(255,255,255,0.45)",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: isAutoSelected ? PRIMARY_RED : "#fff",
                  fontWeight: isAutoSelected ? 700 : 400,
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                Tự động
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.2,
                }}
              >
                {useManualProfiles ? "Adaptive bitrate" : "Theo tốc độ mạng"}
              </Typography>
            </Box>
            {isAutoSelected && (
              <CheckCircleIcon
                sx={{ fontSize: 13, color: PRIMARY_RED, flexShrink: 0 }}
              />
            )}
          </Box>

          <Box sx={{ height: 1, bgcolor: "rgba(255,255,255,0.06)", my: 0.5 }} />

          {useManualProfiles
            ? CLOUDINARY_PROFILES.map((p) => {
                const isSelected = selectedProfile === p.profile;
                const isHD = p.height >= 720;
                return (
                  <Box
                    key={p.profile}
                    onClick={() => {
                      onSelectCloudinaryProfile(p.profile);
                      setOpen(false);
                    }}
                    sx={{
                      px: 2,
                      py: 0.75,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: isSelected
                        ? alpha(PRIMARY_RED, 0.18)
                        : "transparent",
                      "&:hover": { bgcolor: alpha(PRIMARY_RED, 0.12) },
                      transition: "background 0.15s",
                    }}
                  >
                    <HdIcon
                      sx={{
                        fontSize: 15,
                        color: isSelected
                          ? PRIMARY_RED
                          : isHD
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? PRIMARY_RED : "#fff",
                          fontWeight: isSelected ? 700 : 400,
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {p.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          lineHeight: 1.2,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {p.bitrate >= 1_000_000
                          ? `~${(p.bitrate / 1_000_000).toFixed(1)} Mbps`
                          : `~${Math.round(p.bitrate / 1000)} kbps`}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{ fontSize: 13, color: PRIMARY_RED, flexShrink: 0 }}
                      />
                    )}
                  </Box>
                );
              })
            : qualityLevels.map((q) => {
                const isSelected = selectedQuality === q.index;
                const isHD = q.height >= 720;
                return (
                  <Box
                    key={q.index}
                    onClick={() => {
                      onSelectQuality(q.index);
                      setOpen(false);
                    }}
                    sx={{
                      px: 2,
                      py: 0.75,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      bgcolor: isSelected
                        ? alpha(PRIMARY_RED, 0.18)
                        : "transparent",
                      "&:hover": { bgcolor: alpha(PRIMARY_RED, 0.12) },
                      transition: "background 0.15s",
                    }}
                  >
                    <HdIcon
                      sx={{
                        fontSize: 15,
                        color: isSelected
                          ? PRIMARY_RED
                          : isHD
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? PRIMARY_RED : "#fff",
                          fontWeight: isSelected ? 700 : 400,
                          display: "block",
                          lineHeight: 1.2,
                        }}
                      >
                        {q.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          lineHeight: 1.2,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {q.bitrate >= 1_000_000
                          ? `${(q.bitrate / 1_000_000).toFixed(1)} Mbps`
                          : `${Math.round(q.bitrate / 1000)} kbps`}
                      </Typography>
                    </Box>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{ fontSize: 13, color: PRIMARY_RED, flexShrink: 0 }}
                      />
                    )}
                  </Box>
                );
              })}
        </Paper>
      )}

      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          px: 1.25,
          py: 0.45,
          borderRadius: 1,
          bgcolor: open ? PRIMARY_RED : "rgba(0,0,0,0.72)",
          border: `1px solid ${open ? PRIMARY_RED : "rgba(255,255,255,0.22)"}`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 0.6,
          transition: "all 0.18s",
          "&:hover": {
            bgcolor: open ? PRIMARY_RED_DARK : "rgba(139,26,26,0.75)",
          },
          userSelect: "none",
        }}
      >
        <HdIcon sx={{ fontSize: 14, color: "#fff", flexShrink: 0 }} />
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.68rem",
            whiteSpace: "nowrap",
            maxWidth: 130,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentLabel}
        </Typography>
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────
// VideoPlayer
// ─────────────────────────────────────────────
const VideoPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
}: {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const initialTimeSetRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [loadElapsed, setLoadElapsed] = useState(0);

  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number | "auto">(
    "auto",
  );
  const [currentBandwidthKbps, setCurrentBandwidthKbps] = useState<
    number | null
  >(null);
  const [cloudinaryInfo, setCloudinaryInfo] =
    useState<CloudinaryUrlInfo | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | "auto">(
    "auto",
  );

  const activeUrlRef = useRef<string>(url);

  useEffect(() => {
    if (!document.getElementById("vjs-custom-styles")) {
      const s = document.createElement("style");
      s.id = "vjs-custom-styles";
      s.textContent = VIDEO_JS_STYLES;
      document.head.appendChild(s);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const iv = (timeoutRef as React.MutableRefObject<any>)._interval;
    if (iv) {
      clearInterval(iv);
    }
  }, []);

  const startLoadTimeout = useCallback(() => {
    clearAllTimers();
    setLoadElapsed(0);
    const intervalId = setInterval(() => setLoadElapsed((e) => e + 1), 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (timeoutRef as React.MutableRefObject<any>)._interval = intervalId;
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalId);
      setLoadTimedOut(true);
      setIsLoading(false);
    }, LOAD_TIMEOUT_MS);
  }, [clearAllTimers]);

  const applyVhsQuality = useCallback((q: number | "auto") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ql = (playerRef.current as any)?.qualityLevels?.();
    if (!ql) return;
    if (q === "auto") {
      for (let i = 0; i < ql.length; i++) ql[i].enabled = true;
    } else {
      for (let i = 0; i < ql.length; i++) ql[i].enabled = i === q;
    }
    setSelectedQuality(q);
  }, []);

  const applyCloudinaryProfile = useCallback(
    (profile: string | "auto") => {
      if (!cloudinaryInfo) return;
      const newUrl =
        profile === "auto"
          ? buildCloudinaryHlsUrl(cloudinaryInfo, "sp_auto")
          : buildCloudinaryHlsUrl(cloudinaryInfo, profile);
      setSelectedProfile(profile);
      activeUrlRef.current = newUrl;
      const p = playerRef.current;
      if (p && typeof p.src === "function") {
        const currentTime = p.currentTime?.() ?? 0;
        p.src({ src: newUrl, type: "application/x-mpegURL" });
        p.load();
        p.one("loadedmetadata", () => {
          if (currentTime > 5) p.currentTime(currentTime);
          p.play()?.catch(() => {});
        });
      }
    },
    [cloudinaryInfo],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const { masterUrl, cloudinaryInfo: info } = getOptimalHlsUrl(url);
    setCloudinaryInfo(info);
    activeUrlRef.current = masterUrl;

    setHasError(false);
    setIsLoading(true);
    setLoadTimedOut(false);
    setLoadElapsed(0);
    setQualityLevels([]);
    setSelectedQuality("auto");
    setSelectedProfile("auto");
    setCurrentBandwidthKbps(null);
    startLoadTimeout();

    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered";
    containerRef.current.appendChild(videoEl);

    const player = videojs(videoEl, {
      controls: true,
      autoplay: true,
      preload: "auto",
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
          useNetworkInformationApi: true,
          enableLowInitialPlaylist: true,
          limitRenditionByPlayerDimensions: true,
          smoothQualityChange: true,
          allowSeeksWithinUnsafeLiveWindow: true,
          handlePartialData: true,
          bandwidth: 4_000_000,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      controlBar: {
        volumePanel: { inline: false },
        progressControl: {
          seekBar: true,
        },
        remainingTimeDisplay: { displayNegative: false },
        playbackRateMenuButton: true,
        pictureInPictureToggle: false,
        chaptersButton: false,
        subtitlesButton: false,
        captionsButton: false,
        audioTrackButton: false,
        descriptionsButton: false,
      },
      sources: [{ src: masterUrl, type: "application/x-mpegURL" }],
    });

    playerRef.current = player;
    initialTimeSetRef.current = false;

    const markReady = () => {
      clearAllTimers();
      setIsLoading(false);
      setLoadTimedOut(false);
    };

    player.on("canplay", markReady);

    player.on("loadedmetadata", () => {
      markReady();
      if (
        !initialTimeSetRef.current &&
        !isCompleted &&
        savedTime &&
        savedTime > 5
      ) {
        player.currentTime(savedTime);
        initialTimeSetRef.current = true;
      }
      player.play()?.catch(() => {});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ql = (player as any).qualityLevels?.();
      if (ql) {
        const buildLevels = () => {
          const levels: QualityLevel[] = [];
          for (let i = 0; i < ql.length; i++) {
            const lv = ql[i];
            const height: number = lv.height ?? 0;
            const bitrate: number = lv.bitrate ?? 0;
            let label: string;
            if (height >= 2160) label = "4K (2160p)";
            else if (height >= 1440) label = "1440p";
            else if (height >= 1080) label = "1080p HD";
            else if (height >= 720) label = "720p HD";
            else if (height >= 480) label = "480p";
            else if (height >= 360) label = "360p";
            else if (height >= 240) label = "240p";
            else if (height > 0) label = `${height}p`;
            else label = `${Math.round(bitrate / 1000)} kbps`;
            levels.push({ index: i, label, bitrate, height });
          }
          levels.sort((a, b) => b.bitrate - a.bitrate);
          const seen = new Set<string>();
          const unique = levels.filter((l) => {
            if (seen.has(l.label)) return false;
            seen.add(l.label);
            return true;
          });
          if (unique.length > 0) setQualityLevels(unique);
        };
        buildLevels();
        ql.on("addqualitylevel", buildLevels);
        ql.on("removequalitylevel", buildLevels);
      }
    });

    player.on("playing", () => {
      clearAllTimers();
      setIsLoading(false);
      setLoadTimedOut(false);
    });

    let lastSent = 0;
    player.on("timeupdate", () => {
      const ct = player.currentTime() ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vhsStats = (player.tech(true) as any)?.vhs?.stats;
      if (vhsStats?.bandwidth > 0)
        setCurrentBandwidthKbps(Math.round(vhsStats.bandwidth / 1000));
      if (ct - lastSent >= 10) {
        lastSent = ct;
        onTimeUpdate(ct);
      }
    });

    player.on("ended", () => onEnded());

    player.on("error", () => {
      const currentSrc = player.currentSrc?.() ?? "";
      const isAutoProfile = currentSrc.includes("sp_auto");
      if (isAutoProfile && info) {
        console.warn("[VideoPlayer] sp_auto failed, falling back to sp_hd");
        const fallbackUrl = buildCloudinaryHlsUrl(info, "sp_hd");
        player.src({ src: fallbackUrl, type: "application/x-mpegURL" });
        player.load();
        player.one("error", () => {
          clearAllTimers();
          setIsLoading(false);
          setHasError(true);
        });
      } else {
        clearAllTimers();
        setIsLoading(false);
        setHasError(true);
      }
    });

    return () => {
      clearAllTimers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p: any = playerRef.current;
      playerRef.current = null;
      try {
        if (p && typeof p.isDisposed === "function" && !p.isDisposed())
          p.dispose();
      } catch (_) {}
      const container = containerRef.current;
      if (container && videoEl.parentNode === container)
        container.removeChild(videoEl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);
    setLoadElapsed(0);
    setQualityLevels([]);
    setSelectedQuality("auto");
    setSelectedProfile("auto");
    setCurrentBandwidthKbps(null);
    startLoadTimeout();
    const p = playerRef.current;
    if (p && typeof p.src === "function") {
      const { masterUrl } = getOptimalHlsUrl(url);
      activeUrlRef.current = masterUrl;
      p.src({ src: masterUrl, type: "application/x-mpegURL" });
      p.load();
    }
  }, [url, startLoadTimeout]);

  const renderOverlay = () => {
    if (hasError || loadTimedOut) {
      return (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(8,8,8,0.93)",
            gap: 1.5,
          }}
        >
          <VideoLibraryIcon
            sx={{ fontSize: 56, color: PRIMARY_RED, mb: 0.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
            {loadTimedOut ? "Tải video quá lâu" : "Không thể phát video"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              px: 4,
              maxWidth: 380,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            {loadTimedOut
              ? "Kết nối chậm hoặc nguồn video không phản hồi. Vui lòng kiểm tra đường truyền và thử lại."
              : "Có lỗi xảy ra khi phát video. Vui lòng thử lại."}
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleRetry}
            sx={{
              mt: 1,
              bgcolor: PRIMARY_RED,
              "&:hover": { bgcolor: PRIMARY_RED_DARK },
            }}
          >
            Thử lại
          </Button>
        </Box>
      );
    }
    if (isLoading) {
      const pct = Math.min((loadElapsed / (LOAD_TIMEOUT_MS / 1000)) * 100, 95);
      return (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(8,8,8,0.80)",
            gap: 2,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: `4px solid ${alpha(PRIMARY_RED, 0.25)}`,
              borderTopColor: PRIMARY_RED,
              animation: "vjs-spin 0.85s linear infinite",
              "@keyframes vjs-spin": { to: { transform: "rotate(360deg)" } },
            }}
          />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
            Đang tải bài giảng…
          </Typography>
          <Box
            sx={{
              width: 180,
              height: 3,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                borderRadius: 2,
                bgcolor: PRIMARY_RED,
                width: `${pct}%`,
                transition: "width 1s linear",
              }}
            />
          </Box>
          {loadElapsed >= 5 && (
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.45)" }}
            >
              {loadElapsed}s — File lớn, vui lòng chờ…
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#000", position: "relative" }}>
      {renderOverlay()}
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          visibility:
            isLoading || hasError || loadTimedOut ? "hidden" : "visible",
        }}
      />
      {!isLoading && !hasError && !loadTimedOut && (
        <QualityMenu
          qualityLevels={qualityLevels}
          selectedQuality={selectedQuality}
          currentBandwidthKbps={currentBandwidthKbps}
          onSelectQuality={applyVhsQuality}
          cloudinaryInfo={cloudinaryInfo}
          onSelectCloudinaryProfile={applyCloudinaryProfile}
          selectedProfile={selectedProfile}
        />
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────
// MiniPlayer
// ─────────────────────────────────────────────
const MiniPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
  onExpand,
}: {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
  onExpand: () => void;
}) => (
  <Box
    sx={{
      position: "fixed",
      bottom: 24,
      right: 24,
      width: 300,
      zIndex: 1300,
      borderRadius: 2,
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      border: `2px solid ${PRIMARY_RED}`,
    }}
  >
    <VideoPlayer
      url={url}
      savedTime={savedTime}
      isCompleted={isCompleted}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
    />
    <Tooltip title="Mở rộng">
      <IconButton
        size="small"
        onClick={onExpand}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          bgcolor: "rgba(0,0,0,0.6)",
          color: "#fff",
          "&:hover": { bgcolor: PRIMARY_RED },
        }}
      >
        <OpenInFullIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// ─────────────────────────────────────────────
// TaiLieuDropdown
// ─────────────────────────────────────────────
const TaiLieuDropdown = ({
  danhSachTaiLieu,
}: {
  danhSachTaiLieu: TaiLieuType[];
}) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDL] = useState<string | null>(null);

  const extractDriveId = useCallback((url: string) => {
    for (const p of [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
    ]) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }, []);

  const handleDownload = useCallback(
    async (tl: TaiLieuType, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!tl.url) return;
      const key = tl.id ?? tl.url;
      setDL(key);
      try {
        const driveId = extractDriveId(tl.url);
        if (driveId) {
          window.open(
            `https://drive.google.com/uc?export=download&id=${driveId}`,
            "_blank",
          );
        } else {
          const res = await fetch(tl.url, { mode: "cors", cache: "no-store" });
          const blob = await res.blob();
          const getExt = () => {
            const nameExt = (tl.tenTaiLieu ?? "").match(
              /\.([a-zA-Z0-9]+)$/,
            )?.[1];
            if (nameExt) return nameExt.toLowerCase();
            const urlExt = tl
              .url!.split("?")[0]
              .match(/\.([a-zA-Z0-9]+)$/)?.[1];
            if (urlExt) return urlExt.toLowerCase();
            const ct = res.headers.get("Content-Type") ?? blob.type;
            const ctMap: Record<string, string> = {
              "application/pdf": "pdf",
              "application/msword": "doc",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                "docx",
              "application/vnd.ms-excel": "xls",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                "xlsx",
              "application/vnd.ms-powerpoint": "ppt",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                "pptx",
              "image/jpeg": "jpg",
              "image/png": "png",
              "image/gif": "gif",
              "text/plain": "txt",
            };
            const matched = Object.keys(ctMap).find((k) => ct.includes(k));
            return matched ? ctMap[matched] : "pdf";
          };
          const ext = getExt();
          const baseName = (tl.tenTaiLieu ?? "tai-lieu").replace(
            /\.[a-zA-Z0-9]+$/,
            "",
          );
          const fileName = `${baseName}.${ext}`;
          const href = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = href;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(href);
        }
      } catch {
        window.open(tl.url, "_blank");
      } finally {
        setTimeout(() => setDL(null), 3000);
      }
    },
    [extractDriveId],
  );

  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
      <ListItemButton
        onClick={() => setOpen((v) => !v)}
        sx={{ pl: 4, py: 0.75 }}
      >
        <AttachFileIcon sx={{ fontSize: 14, color: PRIMARY_RED, mr: 0.75 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flex: 1, fontWeight: 500 }}
        >
          {danhSachTaiLieu.length} tài liệu
        </Typography>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 16 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        )}
      </ListItemButton>
      <Collapse in={open}>
        <Stack sx={{ pl: 4, pr: 1.5, pb: 1, gap: 0.5 }}>
          {danhSachTaiLieu.map((tl, idx) => {
            const isPdf = tl.loaiTaiLieu === "PDF";
            const key = tl.id ?? tl.url ?? idx;
            const isLoading = downloading === key;
            return (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isLoading
                    ? alpha(PRIMARY_RED, 0.08)
                    : alpha("#000", 0.02),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {isPdf ? (
                  <PictureAsPdfIcon
                    sx={{ fontSize: 15, color: PRIMARY_RED, flexShrink: 0 }}
                  />
                ) : (
                  <DescriptionIcon
                    sx={{ fontSize: 15, color: "#2980b9", flexShrink: 0 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{ flex: 1, fontWeight: 500 }}
                  noWrap
                >
                  {isLoading ? "Đang tải..." : tl.tenTaiLieu}
                </Typography>
                {!isLoading && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleDownload(tl, e)}
                    sx={{ color: PRIMARY_RED, p: 0.3 }}
                  >
                    <DownloadIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
};

// ─────────────────────────────────────────────
// StatsBar
// ─────────────────────────────────────────────
const StatsBar = ({ khoaHoc }: { khoaHoc: KhoaHocType }) => {
  const theme = useTheme();
  const items = [
    {
      icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
      label: khoaHoc.tongThoiLuong
        ? `${Math.floor(khoaHoc.tongThoiLuong / 3600)}h ${Math.floor((khoaHoc.tongThoiLuong % 3600) / 60)}p`
        : "0h 0p",
      title: "Thời lượng",
    },
    {
      icon: <MenuBookIcon sx={{ fontSize: 16 }} />,
      label: `${khoaHoc.tongBaiGiang ?? 0} bài`,
      title: "Bài giảng",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 16 }} />,
      label: (khoaHoc.soLuongHocVien ?? 0).toLocaleString("vi-VN"),
      title: "Học viên",
    },
  ];
  return (
    <GlassPaper sx={{ display: "flex", borderRadius: 2, overflow: "hidden" }}>
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.25,
            borderRight:
              i < items.length - 1
                ? `1px solid ${alpha(theme.palette.divider, 0.5)}`
                : "none",
          }}
        >
          <Box sx={{ color: PRIMARY_RED, opacity: 0.75, display: "flex" }}>
            {item.icon}
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", lineHeight: 1.2 }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, lineHeight: 1.3 }}
            >
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </GlassPaper>
  );
};

// ─────────────────────────────────────────────
// CourseSkeleton
// ─────────────────────────────────────────────
const CourseSkeleton = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Skeleton variant="rectangular" width={110} height={34} />
        <Skeleton variant="text" sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={100} height={36} />
      </Toolbar>
    </AppBar>
    <Box sx={{ flex: 1, display: "flex" }}>
      <Box sx={{ flex: 1, p: 3 }}>
        <Skeleton
          variant="rectangular"
          height={360}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton variant="text" width="60%" height={36} />
        <Skeleton variant="rounded" height={70} sx={{ mt: 2 }} />
      </Box>
      <Skeleton
        variant="rectangular"
        width={380}
        sx={{ borderLeft: 1, borderColor: "divider" }}
      />
    </Box>
  </Box>
);

// ─────────────────────────────────────────────
// KhoaHocPage (main)
// ─────────────────────────────────────────────
export default function KhoaHocPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const courseId = (params?.courseId || params?.id) as string | undefined;

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [baiGiang, setBaiGiang] = useState<BaiGiangType | null>(null);

  const [progressMap, setProgressMap] = useState<
    Map<string, { daHoanThanh: boolean; thoiGianXem: number }>
  >(new Map());
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);

  const [phanDangMo, setPhanDangMo] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMini, setShowMini] = useState(false);

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const updatingRef = useRef<Record<string, boolean>>({});

  // ── Progress helpers ──
  const isBaiHoanThanh = useCallback(
    (bgId: string) => progressMap.get(bgId)?.daHoanThanh === true,
    [progressMap],
  );

  const tongBai = danhSachTatCa.length;

  const soBaiHoanThanh = useMemo(
    () =>
      danhSachTatCa.filter((b) => progressMap.get(b.id!)?.daHoanThanh === true)
        .length,
    [danhSachTatCa, progressMap],
  );

  const phanTramHoanThanh = useMemo(
    () => (tongBai === 0 ? 0 : Math.round((soBaiHoanThanh / tongBai) * 100)),
    [tongBai, soBaiHoanThanh],
  );

  // ── Mini player visibility ──
  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!videoSectionRef.current || !baiGiang?.urlBaiGiang) {
        setShowMini(false);
        return;
      }
      const rect = videoSectionRef.current.getBoundingClientRect();
      setShowMini(rect.bottom < HEADER_H);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [baiGiang]);

  const scrollToVideo = useCallback(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const flatten = useCallback((d: KhoaHocType | null): BaiGiangType[] => {
    if (!d) return [];
    return d.danhSachPhanHoc?.flatMap((p) => p.danhSachBaiGiang ?? []) ?? [];
  }, []);

  // ── Send progress to API ──
  // FIX: Sau khi API trả về, đọc trangThai từ response để cập nhật progressMap
  // Backend dùng ngưỡng 90% để đánh dấu HoanThanh, không tự tính ở frontend nữa
  const sendProgress = useCallback(
    async (baiGiangId: string, thoiGianXem: number) => {
      if (!courseId || !baiGiangId || updatingRef.current[baiGiangId]) return;
      updatingRef.current[baiGiangId] = true;

      // Cập nhật thoiGianXem optimistic (không đổi trạng thái hoàn thành ở đây)
      setProgressMap((prev) => {
        const next = new Map(prev);
        const current = prev.get(baiGiangId);
        // Chỉ cập nhật thoiGianXem, giữ nguyên daHoanThanh hiện tại
        next.set(baiGiangId, {
          daHoanThanh: current?.daHoanThanh ?? false,
          thoiGianXem,
        });
        return next;
      });

      try {
        const request: UpdateTienDoBaiGiangRequest = {
          idDangKyKhoaHoc: courseId,
          idBaiGiang: baiGiangId,
          thoiGianXem: Math.floor(thoiGianXem),
          LanCuoiXem: new Date(),
        };

        // FIX: Dùng response từ API để xác định trạng thái hoàn thành chính xác
        // Backend trả về TienDoHocTapType có trường trangThai: "HoanThanh" | "DangHoc"
        const response = await TienDoSvc.updateTienDoBaiGiang(request);

        const daHoanThanh = response?.trangThai === "HoanThanh";

        setProgressMap((prev) => {
          const next = new Map(prev);
          next.set(baiGiangId, {
            daHoanThanh,
            thoiGianXem: response?.thoiGianXem ?? thoiGianXem,
          });
          return next;
        });
      } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err);
        // Rollback về trạng thái trước nếu lỗi
        setProgressMap((prev) => {
          const next = new Map(prev);
          const current = prev.get(baiGiangId);
          if (current) {
            next.set(baiGiangId, {
              daHoanThanh: current.daHoanThanh,
              thoiGianXem: current.thoiGianXem,
            });
          }
          return next;
        });
      } finally {
        delete updatingRef.current[baiGiangId];
      }
    },
    [courseId],
  );

  const chonBaiGiang = useCallback((bg: BaiGiangType) => {
    setBaiGiang(bg);
    if (bg.idPhan) setPhanDangMo(new Set([bg.idPhan]));
    lastUpdateTimeRef.current[bg.id!] = 0;
    setTimeout(
      () => mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
      50,
    );
  }, []);

  const handleTimeUpdate = useCallback(
    (ct: number) => {
      if (!baiGiang?.id) return;
      const last = lastUpdateTimeRef.current[baiGiang.id] ?? 0;
      if (ct - last >= 10) {
        lastUpdateTimeRef.current[baiGiang.id] = ct;
        sendProgress(baiGiang.id, ct);
      }
    },
    [baiGiang, sendProgress],
  );

  // FIX: Khi video kết thúc, gửi thoiLuong đầy đủ để backend tính đủ ngưỡng 90%
  // và dùng response để cập nhật trạng thái hoàn thành
  const handleVideoEnded = useCallback(async () => {
    if (!baiGiang?.id) return;
    const thoiLuong = baiGiang.thoiLuong ?? 0;
    await sendProgress(baiGiang.id, thoiLuong);
    const idx = danhSachTatCa.findIndex((b) => b.id === baiGiang.id);
    if (idx !== -1 && idx + 1 < danhSachTatCa.length) {
      chonBaiGiang(danhSachTatCa[idx + 1]);
    }
  }, [baiGiang, danhSachTatCa, sendProgress, chonBaiGiang]);

  const togglePhan = useCallback((id: string, playingPhanId?: string) => {
    if (id === playingPhanId) return;
    setPhanDangMo((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const filteredPhanHocs = useMemo(() => {
    if (!khoaHoc?.danhSachPhanHoc) return [];
    if (!searchTerm.trim()) return khoaHoc.danhSachPhanHoc;
    const lower = searchTerm.toLowerCase();
    return khoaHoc.danhSachPhanHoc
      .map((phan) => ({
        ...phan,
        danhSachBaiGiang:
          phan.danhSachBaiGiang?.filter((bg: BaiGiangType) =>
            bg.tieuDe?.toLowerCase().includes(lower),
          ) ?? [],
      }))
      .filter((phan) => phan.danhSachBaiGiang.length > 0);
  }, [khoaHoc, searchTerm]);

  // ── Load data ──
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) {
        setError("Không tìm thấy ID");
        setLoading(false);
        return;
      }
      if (!/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(courseId)) {
        setError("ID không đúng định dạng GUID");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await KhoaHocSvc.getLearningKhoaHoc(courseId);
        const data = res.data;
        setKhoaHoc(data);

        const ds = flatten(data);
        setDanhSachTatCa(ds);

        const initMap = new Map<
          string,
          { daHoanThanh: boolean; thoiGianXem: number }
        >();
        for (const bg of ds) {
          if (bg.id) {
            initMap.set(bg.id, {
              daHoanThanh: bg.daHoanThanh === true,
              thoiGianXem: bg.thoiGianXem ?? 0,
            });
          }
        }
        setProgressMap(initMap);

        if (ds.length > 0) {
          const first = ds.find((l) => !l.daHoanThanh) ?? ds[0];
          setBaiGiang(first);
          if (first.idPhan) setPhanDangMo(new Set([first.idPhan]));
          lastUpdateTimeRef.current[first.id!] = 0;
        }
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 401 || status === 403)
          setError("Bạn không có quyền truy cập.");
        else if (status === 404) setError("Không tìm thấy khóa học.");
        else setError("Có lỗi xảy ra. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId]);

  const currentIdx = danhSachTatCa.findIndex((b) => b.id === baiGiang?.id);
  const coTiepTheo = currentIdx !== -1 && currentIdx < danhSachTatCa.length - 1;
  const idPhanPlay = baiGiang?.idPhan;

  const currentSavedTime = baiGiang?.id
    ? (progressMap.get(baiGiang.id)?.thoiGianXem ?? baiGiang.thoiGianXem)
    : baiGiang?.thoiGianXem;
  const currentIsCompleted = baiGiang?.id
    ? progressMap.get(baiGiang.id)?.daHoanThanh
    : baiGiang?.daHoanThanh;

  if (loading) return <CourseSkeleton />;
  if (error)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <GlassPaper sx={{ maxWidth: 480, p: 4, textAlign: "center" }}>
          <Typography
            variant="h6"
            color="error"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Lỗi truy cập
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            href="/"
            sx={{
              bgcolor: PRIMARY_RED,
              "&:hover": { bgcolor: PRIMARY_RED_DARK },
            }}
          >
            Về trang chủ
          </Button>
        </GlassPaper>
      </Box>
    );
  if (!khoaHoc) return null;

  // ── Sidebar content ──
  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `2px solid ${PRIMARY_RED}`,
          bgcolor: "grey.50",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          sx={{
            mb: 1.5,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Nội dung khóa học
          </Typography>
          {isMobile && (
            <IconButton size="small" onClick={() => setSidebarOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm bài giảng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1.5 }}
        />
        <ProgressBar
          variant="determinate"
          value={phanTramHoanThanh}
          sx={{ mb: 0.5 }}
        />
        <Typography variant="caption" color="text.secondary">
          {soBaiHoanThanh}/{tongBai} bài · {phanTramHoanThanh}%
        </Typography>
      </Box>

      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {filteredPhanHocs.map((phan, idx) => {
          const isOpen = phanDangMo.has(phan.id!);
          const isPlaying = phan.id === idPhanPlay;
          const doneCnt =
            phan.danhSachBaiGiang?.filter(
              (b: BaiGiangType) => progressMap.get(b.id!)?.daHoanThanh === true,
            ).length ?? 0;
          const totalMin = Math.floor(
            (phan.danhSachBaiGiang?.reduce(
              (s: number, b: BaiGiangType) => s + (b.thoiLuong ?? 0),
              0,
            ) ?? 0) / 60,
          );
          return (
            <Box key={phan.id ?? idx}>
              <ListItemButton
                onClick={() => togglePhan(phan.id!, idPhanPlay)}
                sx={{
                  bgcolor: isPlaying ? alpha(PRIMARY_RED, 0.07) : "transparent",
                  borderLeft: `3px solid ${isPlaying ? PRIMARY_RED : "transparent"}`,
                  py: 1.25,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700 }}
                    color={isPlaying ? PRIMARY_RED : "text.primary"}
                    noWrap
                  >
                    {phan.thuTuSapXep ?? idx + 1}. {phan.tenPhan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doneCnt}/{phan.danhSachBaiGiang?.length ?? 0} bài ·{" "}
                    {totalMin}p
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
                  {phan.danhSachBaiGiang?.map((bg: BaiGiangType, i: number) => {
                    const bgDone =
                      progressMap.get(bg.id!)?.daHoanThanh === true;
                    const isSelected = baiGiang?.id === bg.id;
                    return (
                      <Box key={bg.id ?? i}>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => chonBaiGiang(bg)}
                          sx={{
                            pl: 3,
                            py: 1,
                            borderLeft: `3px solid ${isSelected ? PRIMARY_RED : "transparent"}`,
                            bgcolor: isSelected
                              ? alpha(PRIMARY_RED, 0.05)
                              : "transparent",
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            {bgDone ? (
                              <CheckCircleIcon
                                sx={{ color: PRIMARY_RED, fontSize: 18 }}
                              />
                            ) : (
                              <PlayArrowIcon
                                sx={{
                                  color: isSelected
                                    ? PRIMARY_RED
                                    : "text.disabled",
                                  fontSize: 18,
                                }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isSelected ? 600 : 400,
                                  lineHeight: 1.4,
                                }}
                                color={
                                  isSelected ? PRIMARY_RED : "text.primary"
                                }
                              >
                                {bg.tieuDe}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {Math.floor((bg.thoiLuong ?? 0) / 60)}p
                                {(bg.thoiLuong ?? 0) % 60}s
                              </Typography>
                            }
                          />
                        </ListItemButton>
                        {(bg.danhSachTaiLieu?.length ?? 0) > 0 && (
                          <TaiLieuDropdown
                            danhSachTaiLieu={bg.danhSachTaiLieu!}
                          />
                        )}
                      </Box>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
        {filteredPhanHocs.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary" variant="body2">
              Không tìm thấy bài giảng.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: `2px solid ${PRIMARY_RED}`,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(8px)",
          flexShrink: 0,
        }}
      >
        <Toolbar sx={{ minHeight: HEADER_H, gap: 2, px: { xs: 2, md: 3 } }}>
          <Image
            src="/khoahoc/1-removebg-preview.png"
            alt="EduVerse"
            width={110}
            height={36}
            style={{ objectFit: "contain" }}
            priority
          />
          {isMobile && (
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{
                border: `1.5px solid ${sidebarOpen ? PRIMARY_RED : theme.palette.divider}`,
                bgcolor: sidebarOpen ? alpha(PRIMARY_RED, 0.1) : "transparent",
              }}
            >
              <MenuBookIcon
                sx={{
                  color: sidebarOpen ? PRIMARY_RED : "inherit",
                  fontSize: 20,
                }}
              />
            </IconButton>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap variant="subtitle1" sx={{ fontWeight: 700 }}>
              {khoaHoc.tieuDe}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}
            >
              <Typography variant="caption" color="text.secondary">
                Tiến độ
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: PRIMARY_RED }}
              >
                {phanTramHoanThanh}%
              </Typography>
            </Box>
            <Box sx={{ width: { xs: 70, sm: 110 } }}>
              <ProgressBar variant="determinate" value={phanTramHoanThanh} />
              <Typography variant="caption" color="text.secondary">
                {soBaiHoanThanh}/{tongBai}
              </Typography>
            </Box>
            {coTiepTheo && (
              <Button
                variant="contained"
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => {
                  const n = currentIdx + 1;
                  if (n < danhSachTatCa.length) chonBaiGiang(danhSachTatCa[n]);
                }}
                sx={{
                  bgcolor: PRIMARY_RED,
                  "&:hover": { bgcolor: PRIMARY_RED_DARK },
                  whiteSpace: "nowrap",
                }}
              >
                Tiếp
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ── Body ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Main content */}
        <Box
          ref={mainScrollRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Video section */}
          <Box ref={videoSectionRef} sx={{ flexShrink: 0 }}>
            {baiGiang?.urlBaiGiang ? (
              <VideoPlayer
                key={baiGiang.id}
                url={baiGiang.urlBaiGiang}
                savedTime={currentSavedTime}
                isCompleted={currentIsCompleted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />
            ) : (
              <Box
                sx={{
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#0c0c0c",
                }}
              >
                <VideoLibraryIcon
                  sx={{
                    fontSize: 72,
                    color: alpha(PRIMARY_RED, 0.45),
                    mb: 1.5,
                  }}
                />
                <Typography color="text.secondary" variant="h6">
                  Chọn bài giảng để bắt đầu học
                </Typography>
              </Box>
            )}
          </Box>

          {/* Info section */}
          <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
            {baiGiang && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ mb: 1.5, alignItems: "center", flexWrap: "wrap" }}
              >
                <Typography variant="caption" color="text.secondary">
                  {khoaHoc.danhSachPhanHoc?.find((p) => p.id === idPhanPlay)
                    ?.tenPhan ?? ""}
                </Typography>
                <ChevronRightIcon
                  sx={{ fontSize: 14, color: "text.disabled" }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: PRIMARY_RED }}
                >
                  {baiGiang.tieuDe}
                </Typography>
              </Stack>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                mb: 2,
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {baiGiang?.tieuDe ?? khoaHoc.tieuDe}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", flexWrap: "wrap" }}
                >
                  {baiGiang && (
                    <Typography variant="caption" color="text.secondary">
                      Bài {currentIdx + 1}/{danhSachTatCa.length} ·{" "}
                      {Math.floor((baiGiang.thoiLuong ?? 0) / 60)}p
                      {(baiGiang.thoiLuong ?? 0) % 60}s
                    </Typography>
                  )}
                  {baiGiang && isBaiHoanThanh(baiGiang.id!) && (
                    <Chip
                      label="✓ Hoàn thành"
                      size="small"
                      variant="outlined"
                      icon={
                        <CheckCircleIcon sx={{ fontSize: "14px !important" }} />
                      }
                      sx={{
                        color: PRIMARY_RED,
                        borderColor: PRIMARY_RED,
                        height: 22,
                      }}
                    />
                  )}
                </Stack>
              </Box>
              {coTiepTheo && (
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => {
                    const n = currentIdx + 1;
                    if (n < danhSachTatCa.length)
                      chonBaiGiang(danhSachTatCa[n]);
                  }}
                  sx={{
                    bgcolor: PRIMARY_RED,
                    "&:hover": { bgcolor: PRIMARY_RED_DARK },
                    flexShrink: 0,
                  }}
                >
                  Bài tiếp theo
                </Button>
              )}
            </Stack>

            <StatsBar khoaHoc={khoaHoc} />

            {khoaHoc.moTa && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 0.75 }}
                >
                  Mô tả khóa học
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {khoaHoc.moTa}
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Desktop sidebar */}
        {!isMobile && (
          <Box
            sx={{
              width: sidebarOpen ? SIDEBAR_W : 0,
              flexShrink: 0,
              transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
              borderLeft: sidebarOpen
                ? `1px solid ${theme.palette.divider}`
                : "none",
              bgcolor: "background.paper",
              overflow: "hidden",
              height: "100%",
            }}
          >
            {sidebarContent}
          </Box>
        )}

        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            anchor="right"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{ "& .MuiDrawer-paper": { width: "85%", maxWidth: 360 } }}
          >
            {sidebarContent}
          </Drawer>
        )}

        {/* Sidebar toggle tab */}
        {!sidebarOpen && !isMobile && (
          <Zoom in>
            <Box
              onClick={() => setSidebarOpen(true)}
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: PRIMARY_RED,
                borderRadius: "8px 0 0 8px",
                cursor: "pointer",
                boxShadow: `-3px 0 14px ${alpha(PRIMARY_RED, 0.4)}`,
                width: 30,
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                transition: "all 0.2s",
                "&:hover": { width: 36, bgcolor: PRIMARY_RED_DARK },
              }}
            >
              <ChevronLeftIcon sx={{ color: "#fff", fontSize: 18 }} />
              <Typography
                sx={{
                  writingMode: "vertical-rl",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                NỘI DUNG
              </Typography>
            </Box>
          </Zoom>
        )}
      </Box>

      {/* Mini player */}
      {showMini && baiGiang?.urlBaiGiang && (
        <MiniPlayer
          url={baiGiang.urlBaiGiang}
          savedTime={currentSavedTime}
          isCompleted={currentIsCompleted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onExpand={scrollToVideo}
        />
      )}
    </Box>
  );
}
