"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Hls from "hls.js";
import KhoaHocService from "@/src/services/KhoaHocService";
import TienDoHocTapService from "@/src/services/TienDoHocTapService";
import { BaiGiangType } from "@/src/types/BaiGiang/BaiGiangDto";
import { TaiLieuType } from "@/src/types/TaiLieu/TaiLieuDto";
import { KhoaHocType } from "@/src/types/khoaHoc/dto";
import { UpdateTienDoBaiGiangRequest } from "@/src/types/tienDoHocTap/Request/UpdateTienDoBaiGiangRequest";

// MUI imports
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
  Fade,
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
  Settings as SettingsIcon,
  VideoLibrary as VideoLibraryIcon,
  Schedule as ScheduleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";

// ─── Services ─────────────────────────────────────────────────────────────
const KhoaHocSvc = new KhoaHocService();
const TienDoSvc = new TienDoHocTapService();

// ─── Constants ───────────────────────────────────────────────────────────
const SIDEBAR_W = 400;
const HEADER_H = 64;

// ─── Types ───────────────────────────────────────────────────────────────
interface QualityLevel {
  index: number;
  label: string;
  height: number;
  bitrate?: number;
}

interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

const QUALITY_PRESETS = [
  { height: 2160, label: "4K", bitrate: 8000 },
  { height: 1440, label: "2K", bitrate: 5000 },
  { height: 1080, label: "1080p", bitrate: 3000 },
  { height: 720, label: "720p", bitrate: 2000 },
  { height: 480, label: "480p", bitrate: 1000 },
  { height: 360, label: "360p", bitrate: 600 },
];

// ─── Styled Components ────────────────────────────────────────────────────
const StyledVideo = styled("video")({
  width: "100%",
  maxHeight: "60vh",
  display: "block",
  objectFit: "contain",
  backgroundColor: "#0a0a0a",
  cursor: "pointer",
  transition: "all 0.2s",
});

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: alpha(theme.palette.error.main, 0.2),
  "& .MuiLinearProgress-bar": {
    backgroundColor: theme.palette.error.main,
    borderRadius: 3,
  },
}));

const GlassPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(12px)",
  borderRadius: 8,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// ─── Quality Menu (cải tiến giao diện) ─────────────────────────────────────
const QualityMenu = ({
  levels,
  currentLevel,
  autoActualHeight,
  networkSpeed,
  onSelect,
  onAutoDetect,
}: {
  levels: QualityLevel[];
  currentLevel: number;
  autoActualHeight: number | null;
  networkSpeed: number | null;
  onSelect: (idx: number) => void;
  onAutoDetect?: () => void;
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const getCurrentDisplayLabel = () => {
    if (currentLevel === -1) {
      if (autoActualHeight) {
        const h = autoActualHeight;
        if (h >= 2160) return "4K";
        if (h >= 1440) return "2K";
        if (h >= 1080) return "1080p";
        if (h >= 720) return "720p";
        if (h >= 480) return "480p";
        return `${h}p`;
      }
      return "Tự động";
    }
    const level = levels.find((l) => l.index === currentLevel);
    if (!level) return "Tự động";
    if (level.height === 2160) return "4K";
    if (level.height === 1440) return "2K";
    if (level.height === 1080) return "1080p";
    if (level.height === 720) return "720p";
    if (level.height === 480) return "480p";
    if (level.height === 360) return "360p";
    return level.label;
  };

  if (levels.length <= 1) return null;

  const uniqueLevels = levels
    .filter((lv, i, arr) => lv.index === -1 || arr.findIndex((x) => x.height === lv.height) === i)
    .sort((a, b) => (a.index === -1 ? -1 : b.height - a.height));

  return (
    <Box sx={{ position: "relative" }}>
      <Tooltip title="Chất lượng video">
        <Button
          ref={anchorRef}
          onClick={() => setOpen((v) => !v)}
          variant="contained"
          sx={{
            bgcolor: alpha(theme?.palette?.common?.black || "#000", 0.7),
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: "0.75rem",
            py: 0.5,
            px: 1.5,
            minWidth: "auto",
            borderRadius: 2,
            "&:hover": { bgcolor: alpha("#000", 0.85) },
          }}
          startIcon={<SettingsIcon sx={{ fontSize: 16 }} />}
        >
          {getCurrentDisplayLabel()}
        </Button>
      </Tooltip>
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            zIndex: 1300,
            width: 260,
            bgcolor: "rgba(28,28,28,0.96)",
            backdropFilter: "blur(16px)",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              Chất lượng video
              {networkSpeed && (
                <Chip
                  size="small"
                  label={
                    networkSpeed < 5
                      ? "⚠️ Mạng yếu"
                      : networkSpeed < 10
                      ? `📶 ${networkSpeed} Mbps`
                      : `🚀 ${networkSpeed} Mbps`
                  }
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: "0.65rem",
                    bgcolor:
                      networkSpeed < 5
                        ? "rgba(255,152,0,0.2)"
                        : networkSpeed < 10
                        ? "rgba(255,193,7,0.2)"
                        : "rgba(76,175,80,0.2)",
                    color: networkSpeed < 5 ? "#ff9800" : networkSpeed < 10 ? "#ffc107" : "#4caf50",
                  }}
                />
              )}
            </Typography>
          </Box>
          {uniqueLevels.map((lv) => (
            <QualityMenuItem
              key={lv.index}
              level={lv}
              isSelected={lv.index === currentLevel}
              networkSpeed={networkSpeed}
              onSelect={() => {
                onSelect(lv.index);
                setOpen(false);
              }}
            />
          ))}
          {onAutoDetect && currentLevel !== -1 && (
            <Button
              fullWidth
              onClick={() => {
                onAutoDetect();
                setOpen(false);
              }}
              sx={{
                justifyContent: "center",
                gap: 1,
                py: 1.5,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                color: "#3ea6ff",
                "&:hover": { bgcolor: "rgba(62,166,255,0.1)" },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16 }} /> Tự động (Auto)
            </Button>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

const QualityMenuItem = ({
  level,
  isSelected,
  networkSpeed,
  onSelect,
}: {
  level: QualityLevel;
  isSelected: boolean;
  networkSpeed: number | null;
  onSelect: () => void;
}) => {
  const getDisplayLabel = () => {
    if (level.index === -1) return "Tự động (Auto)";
    if (level.height === 2160) return "4K (Ultra HD)";
    if (level.height === 1440) return "2K (QHD)";
    if (level.height === 1080) return "1080p (Full HD)";
    if (level.height === 720) return "720p (HD)";
    if (level.height === 480) return "480p (SD)";
    if (level.height === 360) return "360p (SD)";
    return level.label;
  };
  const isSuitable = () => {
    if (!networkSpeed || level.index === -1) return false;
    if (level.height === 2160 && networkSpeed >= 50) return true;
    if (level.height === 1080 && networkSpeed >= 25) return true;
    if (level.height === 720 && networkSpeed >= 10) return true;
    if (level.height === 480 && networkSpeed >= 5) return true;
    if (level.height === 360 && networkSpeed >= 2) return true;
    return false;
  };
  const warning = (() => {
    if (!networkSpeed || level.index === -1 || !level.bitrate) return null;
    if (networkSpeed < level.bitrate / 1000) return `Cần ${level.bitrate / 1000} Mbps`;
    return null;
  })();

  return (
    <ListItemButton
      onClick={onSelect}
      selected={isSelected}
      sx={{
        py: 1,
        px: 2,
        color: isSelected ? "#3ea6ff" : "#fff",
        "&.Mui-selected": {
          backgroundColor: "rgba(62, 166, 255, 0.15)",
        },
        "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
        {isSelected && <CheckCircleIcon sx={{ fontSize: 16 }} />}
      </ListItemIcon>
      <ListItemText
        primary={getDisplayLabel()}
        slotProps={{ primary: { variant: "body2", sx: { fontWeight: isSelected ? 600 : 400 } } }}
      />
      <Stack direction="row" spacing={1}>
        {isSuitable() && !isSelected && (
          <Chip label="✓ Phù hợp" size="small" sx={{ height: 18, fontSize: "0.6rem", bgcolor: "rgba(76,175,80,0.2)", color: "#4caf50" }} />
        )}
        {warning && !isSelected && (
          <Chip label={`⚠️ ${warning}`} size="small" sx={{ height: 18, fontSize: "0.6rem", bgcolor: "rgba(255,152,0,0.2)", color: "#ff9800" }} />
        )}
      </Stack>
    </ListItemButton>
  );
};

// ─── TaiLieuDropdown (cải tiến) ────────────────────────────────────────────
const TaiLieuDropdown = ({ danhSachTaiLieu }: { danhSachTaiLieu: TaiLieuType[] }) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDL] = useState<string | null>(null);
  const extractDriveId = useCallback((url: string) => {
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
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
          window.open(`https://drive.google.com/uc?export=download&id=${driveId}`, "_blank");
        } else {
          const response = await fetch(tl.url, { mode: "cors", cache: "no-store" });
          const blob = await response.blob();
          const href = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = href;
          link.download = tl.tenTaiLieu ?? "tai-lieu";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        }
      } catch {
        window.open(tl.url, "_blank");
      } finally {
        setTimeout(() => setDL(null), 3000);
      }
    },
    [extractDriveId]
  );

  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
      <ListItemButton onClick={() => setOpen((v) => !v)} sx={{ pl: 6, py: 1.5 }}>
        <AttachFileIcon sx={{ fontSize: 16, color: "error.main", mr: 1 }} />
        <ListItemText
          primary={`${danhSachTaiLieu.length} tài liệu đính kèm`}
          slotProps={{ primary: { variant: "caption", sx: { fontWeight: 500, color: "text.secondary" } } }}
        />
        {open ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
      </ListItemButton>
      <Collapse in={open}>
        <Stack spacing={1.5} sx={{ pl: 6, pr: 2, pb: 2 }}>
          {danhSachTaiLieu.map((tl, idx) => {
            const isPdf = tl.loaiTaiLieu === "PDF";
            const key = tl.id ?? tl.url ?? idx;
            const isLoading = downloading === key;
            return (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: isLoading ? alpha("#c0392b", 0.1) : "background.paper",
                  borderRadius: 2,
                  transition: "all 0.2s",
                }}
              >
                {isPdf ? (
                  <PictureAsPdfIcon sx={{ color: "error.main", fontSize: 20 }} />
                ) : (
                  <DescriptionIcon sx={{ color: "#2980b9", fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                  {isLoading ? "Đang tải xuống..." : tl.tenTaiLieu}
                </Typography>
                <Chip
                  label={tl.loaiTaiLieu}
                  size="small"
                  sx={{
                    bgcolor: isPdf ? alpha("#c0392b", 0.15) : alpha("#2980b9", 0.15),
                    color: isPdf ? "#c0392b" : "#2980b9",
                    fontWeight: 500,
                  }}
                />
                {!isLoading && (
                  <Tooltip title="Tải xuống">
                    <IconButton size="small" onClick={(e) => handleDownload(tl, e)} sx={{ color: "error.main" }}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Paper>
            );
          })}
        </Stack>
      </Collapse>
    </Box>
  );
};

// ─── StatsBar (cải tiến) ───────────────────────────────────────────────────
const StatsBar = ({ khoaHoc }: { khoaHoc: KhoaHocType }) => {
  const theme = useTheme();
  const items = [
    {
      icon: <ScheduleIcon fontSize="small" />,
      label: khoaHoc.tongThoiLuong
        ? `${Math.floor(khoaHoc.tongThoiLuong / 3600)}h ${Math.floor((khoaHoc.tongThoiLuong % 3600) / 60)}p`
        : "0h 0p",
      title: "Tổng thời lượng",
    },
    { icon: <MenuBookIcon fontSize="small" />, label: `${khoaHoc.tongBaiGiang ?? 0} bài giảng`, title: "Số bài" },
    {
      icon: <PeopleIcon fontSize="small" />,
      label: `${(khoaHoc.soLuongHocVien ?? 0).toLocaleString("vi-VN")} học viên`,
      title: "Học viên",
    },
  ];
  return (
    <GlassPaper sx={{ display: "flex", borderRadius: 3, overflow: "hidden", p: 0.5 }}>
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRight: i < items.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : "none",
          }}
        >
          <Box sx={{ color: "error.main", opacity: 0.7 }}>{item.icon}</Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </GlassPaper>
  );
};

// ─── Skeleton Loading ──────────────────────────────────────────────────────
const CourseSkeleton = () => (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Skeleton variant="rectangular" width={110} height={34} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" sx={{ flex: 1 }} />
        <Skeleton variant="rounded" width={100} height={40} />
      </Toolbar>
    </AppBar>
    <Box sx={{ flex: 1, display: "flex" }}>
      <Box sx={{ flex: 1, p: 3 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rounded" height={80} sx={{ mt: 2 }} />
      </Box>
      <Skeleton variant="rectangular" width={380} sx={{ borderLeft: 1, borderColor: "divider" }} />
    </Box>
  </Box>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function KhoaHocPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const courseId = (params?.courseld || params?.courseId) as string;

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [baiGiang, setBaiGiang] = useState<BaiGiangType | null>(null);
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);
  const [phanDangMo, setPhanDangMo] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState("");
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [autoActualHeight, setAutoActualHeight] = useState<number | null>(null);
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const updatingRef = useRef<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Network Speed
  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const updateSpeed = () => {
      if (nav.connection?.downlink) setNetworkSpeed(nav.connection.downlink);
    };
    updateSpeed();
    nav.connection?.addEventListener("change", updateSpeed);
    return () => nav.connection?.removeEventListener("change", updateSpeed);
  }, []);

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const flatten = useCallback((d: KhoaHocType | null): BaiGiangType[] => {
    if (!d) return [];
    return d.danhSachPhanHoc?.flatMap((p) => p.danhSachBaiGiang ?? []) ?? [];
  }, []);

  const isBaiHoanThanh = useCallback(
    (bgId: string) => danhSachTatCa.find((b) => b.id === bgId)?.daHoanThanh === true,
    [danhSachTatCa]
  );

  const tongBai = danhSachTatCa.length;
  const soBaiHoanThanh = danhSachTatCa.filter((b) => b.daHoanThanh).length;
  const phanTramHoanThanh = useMemo(
    () => (tongBai === 0 ? 0 : Math.round((soBaiHoanThanh / tongBai) * 100)),
    [tongBai, soBaiHoanThanh]
  );

  const sendProgress = useCallback(
    async (baiGiangId: string, thoiGianXem: number) => {
      if (!courseId || !baiGiangId) return null;
      if (updatingRef.current[baiGiangId]) return null;
      updatingRef.current[baiGiangId] = true;
      try {
        const request: UpdateTienDoBaiGiangRequest = {
          idDangKyKhoaHoc: courseId,
          idBaiGiang: baiGiangId,
          thoiGianXem: Math.floor(thoiGianXem),
          LanCuoiXem: new Date(),
        };
        await TienDoSvc.updateTienDoBaiGiang(request);
        const refreshed = await KhoaHocSvc.getLearningKhoaHoc(courseId);
        setKhoaHoc(refreshed);
        setDanhSachTatCa(flatten(refreshed));
        return refreshed;
      } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err);
        return null;
      } finally {
        delete updatingRef.current[baiGiangId];
      }
    },
    [courseId, flatten]
  );

  const chonBaiGiang = useCallback((bg: BaiGiangType) => {
    setBaiGiang(bg);
    if (bg.idPhan) setPhanDangMo((prev) => new Set([...prev, bg.idPhan!]));
    lastUpdateTimeRef.current[bg.id!] = 0;
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !baiGiang?.id) return;
    const ct = videoRef.current.currentTime;
    if (!ct || isNaN(videoRef.current.duration)) return;
    const last = lastUpdateTimeRef.current[baiGiang.id] ?? 0;
    if (ct - last >= 10) {
      lastUpdateTimeRef.current[baiGiang.id] = ct;
      sendProgress(baiGiang.id, ct);
    }
  }, [baiGiang, sendProgress]);

  const handleVideoEnded = useCallback(async () => {
    if (!baiGiang?.id) return;
    const duration = videoRef.current?.duration || baiGiang.thoiLuong || 0;
    const refreshed = await sendProgress(baiGiang.id, duration);
    const currentList = refreshed ? flatten(refreshed) : danhSachTatCa;
    const idx = currentList.findIndex((b) => b.id === baiGiang.id);
    if (idx !== -1) {
      let nextIdx = idx + 1;
      while (nextIdx < currentList.length && currentList[nextIdx].daHoanThanh) nextIdx++;
      if (nextIdx < currentList.length) chonBaiGiang(currentList[nextIdx]);
    }
  }, [baiGiang, danhSachTatCa, sendProgress, chonBaiGiang, flatten]);

  const handleSelectQuality = useCallback((idx: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    setCurrentQuality(idx);
    if (idx === -1) {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
      setAutoActualHeight(null);
    } else {
      hls.currentLevel = idx;
      hls.nextLevel = idx;
    }
  }, []);

  const handleAutoDetect = useCallback(() => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = -1;
    hls.loadLevel = -1;
    setCurrentQuality(-1);
    setAutoActualHeight(null);
  }, []);

  const togglePhan = useCallback((id: string, playingId?: string) => {
    if (id === playingId) return;
    setPhanDangMo((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  // Filter bài giảng theo từ khóa
  const filteredPhanHocs = useMemo(() => {
    if (!khoaHoc?.danhSachPhanHoc) return [];
    if (!searchTerm.trim()) return khoaHoc.danhSachPhanHoc;
    const lowerTerm = searchTerm.toLowerCase();
    return khoaHoc.danhSachPhanHoc
      .map(phan => ({
        ...phan,
        danhSachBaiGiang: phan.danhSachBaiGiang?.filter((bg: BaiGiangType) =>
          bg.tieuDe?.toLowerCase().includes(lowerTerm)
        ) ?? []
      }))
      .filter(phan => phan.danhSachBaiGiang.length > 0);
  }, [khoaHoc, searchTerm]);

  // Fetch khóa học
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) {
        setError("Không tìm thấy ID khóa học trong URL");
        setLoading(false);
        return;
      }
      
      const isValidGuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(courseId);
      if (!isValidGuid) {
        setError("ID đăng ký không đúng định dạng GUID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await KhoaHocSvc.getLearningKhoaHoc(courseId);
        setKhoaHoc(res);
        const ds = flatten(res);
        setDanhSachTatCa(ds);
        if (ds.length > 0) {
          const notCompleted = ds.find((l) => !l.daHoanThanh);
          chonBaiGiang(notCompleted ?? ds[0]);
        }
        // Auto expand all sections for better UX
        if (res.danhSachPhanHoc) {
          setPhanDangMo(new Set(res.danhSachPhanHoc.map(p => p.id!).filter(Boolean)));
        }
      } catch (err: unknown) {
        console.error(err);
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) setError("Bạn không có quyền truy cập khóa học này.");
        else if (status === 404) setError("Không tìm thấy khóa học. Vui lòng kiểm tra lại ID.");
        else setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [courseId, flatten, chonBaiGiang]);

  // HLS Player
  useEffect(() => {
    if (!baiGiang?.urlBaiGiang) return;
    const video = videoRef.current;
    if (!video) return;
    const url = baiGiang.urlBaiGiang;
    setQualityLevels([]);
    setCurrentQuality(-1);
    setAutoActualHeight(null);
    if (hlsRef.current) hlsRef.current.destroy();
    if (url.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, capLevelToPlayerSize: false, startLevel: -1 });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = data.levels
          .map((l, i) => {
            const preset = QUALITY_PRESETS.find((p) => p.height === l.height);
            return {
              index: i,
              height: l.height,
              label: preset?.label ?? `${l.height}p`,
              bitrate: preset?.bitrate ?? l.bitrate,
            };
          })
          .filter((l, i, arr) => arr.findIndex((x) => x.height === l.height) === i)
          .sort((a, b) => b.height - a.height);
        setQualityLevels([{ index: -1, label: "Auto", height: 0 }, ...levels]);
        setCurrentQuality(-1);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const height = hls.levels[data.level]?.height ?? null;
        setCurrentQuality((prev) => {
          if (prev === -1) setAutoActualHeight(height);
          return data.level;
        });
      });
    } else {
      video.src = url;
      video.load();
    }
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [baiGiang]);

  // Seek & auto play
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !baiGiang) return;
    const onCanPlay = () => {
      if (!baiGiang.daHoanThanh && baiGiang.thoiGianXem && baiGiang.thoiGianXem > 0) {
        if (Math.abs(video.currentTime - baiGiang.thoiGianXem) > 0.5) video.currentTime = baiGiang.thoiGianXem;
      }
      video.play().catch(() => {});
    };
    video.addEventListener("canplay", onCanPlay);
    if (video.readyState >= 2) onCanPlay();
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [baiGiang]);

  const currentIdx = danhSachTatCa.findIndex((b) => b.id === baiGiang?.id);
  const coTiepTheo = currentIdx !== -1 && currentIdx < danhSachTatCa.length - 1;
  const idPhanPlay = baiGiang?.idPhan;

  if (loading) return <CourseSkeleton />;

  if (error) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8f8f8", p: 3 }}>
        <GlassPaper sx={{ maxWidth: 500, p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: 700 }}>
            Lỗi truy cập
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button variant="contained" href="/" sx={{ bgcolor: theme.palette.error.main }}>
            Về trang chủ
          </Button>
        </GlassPaper>
      </Box>
    );
  }

  if (!khoaHoc) return null;

  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: `2px solid ${theme.palette.error.main}`, bgcolor: "grey.50" }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Nội dung khóa học</Typography>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
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
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />
        <ProgressBar variant="determinate" value={phanTramHoanThanh} sx={{ mb: 1 }} />
        <Typography variant="caption" color="text.secondary">
          {soBaiHoanThanh}/{tongBai} bài đã hoàn thành · {phanTramHoanThanh}%
        </Typography>
      </Box>
      <Box sx={{ overflowY: "auto", flex: 1, pb: 2 }}>
        {filteredPhanHocs.map((phan, idx) => {
          const isOpen = phanDangMo.has(phan.id!);
          const isPlaying = phan.id === idPhanPlay;
          const doneCnt = phan.danhSachBaiGiang?.filter((b: BaiGiangType) => isBaiHoanThanh(b.id!)).length ?? 0;
          const totalMin = Math.floor((phan.danhSachBaiGiang?.reduce((s: number, b: BaiGiangType) => s + (b.thoiLuong ?? 0), 0) ?? 0) / 60);
          return (
            <Box key={phan.id ?? idx}>
              <ListItemButton
                onClick={() => togglePhan(phan.id!, idPhanPlay)}
                sx={{
                  bgcolor: isPlaying ? alpha(theme.palette.error.main, 0.08) : "transparent",
                  borderLeft: `3px solid ${isPlaying ? theme.palette.error.main : "transparent"}`,
                  py: 1.5,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} color={isPlaying ? "error.main" : "text.primary"}>
                    {phan.thuTuSapXep ?? idx + 1}. {phan.tenPhan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doneCnt}/{phan.danhSachBaiGiang?.length ?? 0} bài · {totalMin} phút
                  </Typography>
                </Box>
                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={isOpen}>
                <List disablePadding>
                  {phan.danhSachBaiGiang?.map((bg: BaiGiangType, i: number) => (
                    <Box key={bg.id ?? i}>
                      <ListItemButton
                        selected={baiGiang?.id === bg.id}
                        onClick={() => chonBaiGiang(bg)}
                        sx={{ 
                          pl: 4, 
                          py: 1.5,
                          borderLeft: `3px solid ${baiGiang?.id === bg.id ? theme.palette.error.main : "transparent"}`,
                          bgcolor: baiGiang?.id === bg.id ? alpha(theme.palette.error.main, 0.05) : "transparent",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {bg.daHoanThanh ? (
                            <CheckCircleIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                          ) : (
                            <PlayArrowIcon sx={{ color: baiGiang?.id === bg.id ? theme.palette.error.main : "text.disabled", fontSize: 20 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: baiGiang?.id === bg.id ? 600 : 400 }} color={baiGiang?.id === bg.id ? "error.main" : "text.primary"}>
                              {bg.tieuDe}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {Math.floor((bg.thoiLuong ?? 0) / 60)}p{(bg.thoiLuong ?? 0) % 60}s
                            </Typography>
                          }
                        />
                      </ListItemButton>
                      {(bg.danhSachTaiLieu?.length ?? 0) > 0 && <TaiLieuDropdown danhSachTaiLieu={bg.danhSachTaiLieu!} />}
                    </Box>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
        {filteredPhanHocs.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">Không tìm thấy bài giảng phù hợp.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "grey.50" }}>
      {/* Header */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0} 
        sx={{ 
          borderBottom: `2px solid ${theme.palette.error.main}`,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ minHeight: HEADER_H, gap: 2, px: { xs: 2, md: 3 } }}>
          <Image src="/khoahoc/1-removebg-preview.png" alt="EduVerse" width={120} height={40} style={{ objectFit: "contain" }} priority />
          <IconButton
            onClick={() => setSidebarOpen(true)}
            sx={{
              border: `1.5px solid ${sidebarOpen ? theme.palette.error.main : theme.palette.divider}`,
              bgcolor: sidebarOpen ? alpha(theme.palette.error.main, 0.1) : "transparent",
              display: { xs: "flex", md: isMobile ? "flex" : "none" },
            }}
          >
            <MenuBookIcon sx={{ color: sidebarOpen ? theme.palette.error.main : "inherit" }} />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap variant="subtitle1" sx={{ fontWeight: 700 }}>
              {khoaHoc.tieuDe}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }} color="error.main">{phanTramHoanThanh}%</Typography>
            </Box>
            <Box sx={{ width: { xs: 80, sm: 120 } }}>
              <ProgressBar variant="determinate" value={phanTramHoanThanh} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {soBaiHoanThanh}/{tongBai}
            </Typography>
            {coTiepTheo && (
              <Button
                variant="contained"
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={() => {
                  let n = currentIdx + 1;
                  while (n < danhSachTatCa.length && danhSachTatCa[n].daHoanThanh) n++;
                  if (n < danhSachTatCa.length) chonBaiGiang(danhSachTatCa[n]);
                }}
                sx={{ bgcolor: theme.palette.error.main, "&:hover": { bgcolor: theme.palette.error.dark } }}
              >
                Tiếp
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box ref={containerRef} sx={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        {/* Video & Info Column */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Video Player */}
          <Box sx={{ flexShrink: 0, bgcolor: "#0a0a0a", position: "relative" }}>
            {baiGiang?.urlBaiGiang ? (
              <>
                <StyledVideo ref={videoRef} controls onTimeUpdate={handleTimeUpdate} onEnded={handleVideoEnded} />
                <Box sx={{ position: "absolute", bottom: 16, right: 16, zIndex: 10, display: "flex", gap: 1 }}>
                  <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                    <IconButton
                      onClick={toggleFullscreen}
                      sx={{
                        bgcolor: alpha("#000", 0.6),
                        color: "#fff",
                        "&:hover": { bgcolor: alpha("#000", 0.8) },
                      }}
                    >
                      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                  </Tooltip>
                  {qualityLevels.length > 1 && (
                    <QualityMenu
                      levels={qualityLevels}
                      currentLevel={currentQuality}
                      autoActualHeight={autoActualHeight}
                      networkSpeed={networkSpeed}
                      onSelect={handleSelectQuality}
                      onAutoDetect={handleAutoDetect}
                    />
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ height: "45vh", minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#0c0c0c" }}>
                <VideoLibraryIcon sx={{ fontSize: 80, color: alpha(theme.palette.error.main, 0.5), mb: 2 }} />
                <Typography color="text.secondary" variant="h6">Chọn bài giảng để bắt đầu học</Typography>
              </Box>
            )}
          </Box>

          {/* Content Info */}
          <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 4 } }}>
            {baiGiang && (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {khoaHoc.danhSachPhanHoc?.find((p) => p.id === idPhanPlay)?.tenPhan ?? ""}
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }} color="error.main">
                  {baiGiang.tieuDe}
                </Typography>
              </Stack>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3, justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {baiGiang?.tieuDe ?? khoaHoc.tieuDe}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1, alignItems: "center", flexWrap: "wrap" }}>
                  {baiGiang && (
                    <Typography variant="body2" color="text.secondary">
                      Bài {currentIdx + 1}/{danhSachTatCa.length} · {Math.floor((baiGiang.thoiLuong ?? 0) / 60)}p{(baiGiang.thoiLuong ?? 0) % 60}s
                    </Typography>
                  )}
                  {baiGiang?.laBaiGiangFree && <Chip label="Miễn phí" size="small" color="success" icon={<SchoolIcon />} />}
                  {baiGiang && isBaiHoanThanh(baiGiang.id!) && (
                    <Chip label="✓ Đã hoàn thành" size="small" color="error" variant="outlined" icon={<CheckCircleIcon />} />
                  )}
                </Stack>
              </Box>
              {coTiepTheo && (
                <Button
                  variant="contained"
                  color="error"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => {
                    let n = currentIdx + 1;
                    while (n < danhSachTatCa.length && danhSachTatCa[n].daHoanThanh) n++;
                    if (n < danhSachTatCa.length) chonBaiGiang(danhSachTatCa[n]);
                  }}
                >
                  Bài tiếp theo
                </Button>
              )}
            </Stack>
            
            <StatsBar khoaHoc={khoaHoc} />
            
            {/* Mô tả khóa học (nếu có) */}
            {khoaHoc.moTa && (
              <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2, bgcolor: "background.paper" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Mô tả khóa học</Typography>
                <Typography variant="body2" color="text.secondary">{khoaHoc.moTa}</Typography>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Sidebar - Desktop */}
        {!isMobile && (
          <Box sx={{
            width: sidebarOpen ? SIDEBAR_W : 0,
            flexShrink: 0,
            transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            borderLeft: sidebarOpen ? `1px solid ${theme.palette.divider}` : "none",
            bgcolor: "background.paper",
            overflow: "hidden",
            position: "relative",
          }}>
            {sidebarContent}
          </Box>
        )}

        {/* Sidebar - Mobile Drawer */}
        {isMobile && (
          <Drawer
            anchor="right"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{ '& .MuiDrawer-paper': { width: '85%', maxWidth: 360 } }}
          >
            {sidebarContent}
          </Drawer>
        )}

        {/* Floating button to open sidebar when closed */}
        {!sidebarOpen && !isMobile && (
          <Zoom in>
            <Box
              onClick={() => setSidebarOpen(true)}
              sx={{
                position: "fixed",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1100,
                bgcolor: theme.palette.error.main,
                borderRadius: "8px 0 0 8px",
                cursor: "pointer",
                boxShadow: `-3px 0 14px ${alpha(theme.palette.error.main, 0.4)}`,
                width: 32,
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                transition: "all 0.2s",
                "&:hover": { width: 38, bgcolor: theme.palette.error.dark }
              }}
            >
              <ChevronLeftIcon sx={{ color: "#fff", fontSize: 20 }} />
              <Typography sx={{ writingMode: "vertical-rl", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                NỘI DUNG
              </Typography>
            </Box>
          </Zoom>
        )}
      </Box>
    </Box>
  );
}