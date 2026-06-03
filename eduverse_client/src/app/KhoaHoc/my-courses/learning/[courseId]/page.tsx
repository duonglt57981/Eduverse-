"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import KhoaHocService from "@/src/services/KhoaHocService";
import TienDoHocTapService from "@/src/services/TienDoHocTapService";
import { BaiGiangType } from "@/src/types/BaiGiang/BaiGiangDto";
import { TaiLieuType } from "@/src/types/TaiLieu/TaiLieuDto";
import { KhoaHocType } from "@/src/types/khoaHoc/dto";
import { UpdateTienDoBaiGiangRequest } from "@/src/types/tienDoHocTap/Request/UpdateTienDoBaiGiangRequest";
import videojs from "video.js";
import "./videojs-custom.css";
import type Player from "video.js/dist/types/player";
import "@videojs/http-streaming";

import {
  Box, AppBar, Toolbar, IconButton, Typography, LinearProgress,
  Chip, Button, Collapse, List, ListItemButton, ListItemIcon,
  ListItemText, Paper, Stack, useTheme, alpha, styled, Zoom,
  Skeleton, TextField, InputAdornment, Tooltip, useMediaQuery, Drawer,
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
  School as SchoolIcon,
} from "@mui/icons-material";

const KhoaHocSvc = new KhoaHocService();
const TienDoSvc = new TienDoHocTapService();

const SIDEBAR_W = 400;
const HEADER_H = 64;
const PRIMARY_RED = "#8B1A1A";
const PRIMARY_RED_DARK = "#6B1414";

const ProgressBar = styled(LinearProgress)({
  height: 6,
  borderRadius: 3,
  backgroundColor: alpha(PRIMARY_RED, 0.2),
  "& .MuiLinearProgress-bar": {
    backgroundColor: PRIMARY_RED,
    borderRadius: 3,
  },
});

const GlassPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(12px)",
  borderRadius: 8,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

// ── VideoJS Player Component ─────────────────────────────────────
const VideoJsPlayer = ({
  url,
  savedTime,
  isCompleted,
  onTimeUpdate,
  onEnded,
}: {
  url: string;
  savedTime?: number;
  isCompleted?: boolean;
  onTimeUpdate: (time: number) => void;
  onEnded: () => void;
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      preload: "auto",
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: false,
          limitRenditionByPlayerDimensions: false,
          useNetworkInformationApi: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      sources: [
        {
          src: url,
          type: "application/x-mpegURL",
        },
      ],
    });

    playerRef.current = player;

    player.on("loadedmetadata", () => {
      if (!isCompleted && savedTime && savedTime > 0) {
        player.currentTime(savedTime);
      }
      player.play()?.catch(() => {});

      // Chọn quality cao nhất (qualityLevels từ plugin)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qualityLevels = (player as any).qualityLevels?.();
      if (qualityLevels) {
        let highestBitrate = 0;
        let highestIndex = -1;
        for (let i = 0; i < qualityLevels.length; i++) {
          if (qualityLevels[i].bitrate > highestBitrate) {
            highestBitrate = qualityLevels[i].bitrate;
            highestIndex = i;
          }
        }
        if (highestIndex >= 0) {
          for (let i = 0; i < qualityLevels.length; i++) {
            qualityLevels[i].enabled = i === highestIndex;
          }
        }
      }
    });

    let lastSent = 0;
    player.on("timeupdate", () => {
      const ct = player.currentTime() ?? 0;
      if (ct - lastSent >= 10) {
        lastSent = ct;
        onTimeUpdate(ct);
      }
    });

    player.on("ended", () => {
      onEnded();
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#000",
        "& .video-js": { width: "100%", maxHeight: "60vh" },
        "& .vjs-big-play-button": {
          bgcolor: PRIMARY_RED,
          borderColor: PRIMARY_RED,
          "&:hover": { bgcolor: PRIMARY_RED_DARK },
        },
        "& .vjs-play-progress": { bgcolor: PRIMARY_RED },
        "& .vjs-volume-level": { bgcolor: PRIMARY_RED },
        "& .vjs-selected": { color: `${PRIMARY_RED} !important` },
      }}
    >
      <div ref={videoRef} className="video-js vjs-big-play-centered" />
    </Box>
  );
};

// ── TaiLieuDropdown ──────────────────────────────────────────────
const TaiLieuDropdown = ({ danhSachTaiLieu }: { danhSachTaiLieu: TaiLieuType[] }) => {
  const [open, setOpen] = useState(false);
  const [downloading, setDL] = useState<string | null>(null);

  const extractDriveId = useCallback((url: string) => {
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }, []);

  const handleDownload = useCallback(async (tl: TaiLieuType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tl.url) return;
    const key = tl.id ?? tl.url;
    setDL(key);
    try {
      const driveId = extractDriveId(tl.url);
      if (driveId) {
        window.open(`https://drive.google.com/uc?export=download&id=${driveId}`, "_blank");
      } else {
        const res = await fetch(tl.url, { mode: "cors", cache: "no-store" });
        const blob = await res.blob();
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href; a.download = tl.tenTaiLieu ?? "tai-lieu";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(href);
      }
    } catch { window.open(tl.url, "_blank"); }
    finally { setTimeout(() => setDL(null), 3000); }
  }, [extractDriveId]);

  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
      <ListItemButton onClick={() => setOpen(v => !v)} sx={{ pl: 6, py: 1.5 }}>
        <AttachFileIcon sx={{ fontSize: 16, color: PRIMARY_RED, mr: 1 }} />
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
              <Paper key={key} variant="outlined" sx={{
                display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
                bgcolor: isLoading ? alpha(PRIMARY_RED, 0.1) : "background.paper",
                borderRadius: 2, transition: "all 0.2s",
              }}>
                {isPdf
                  ? <PictureAsPdfIcon sx={{ color: PRIMARY_RED, fontSize: 20 }} />
                  : <DescriptionIcon sx={{ color: "#2980b9", fontSize: 20 }} />}
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                  {isLoading ? "Đang tải xuống..." : tl.tenTaiLieu}
                </Typography>
                <Chip label={tl.loaiTaiLieu} size="small" sx={{
                  bgcolor: isPdf ? alpha(PRIMARY_RED, 0.15) : alpha("#2980b9", 0.15),
                  color: isPdf ? PRIMARY_RED : "#2980b9", fontWeight: 500,
                }} />
                {!isLoading && (
                  <Tooltip title="Tải xuống">
                    <IconButton size="small" onClick={e => handleDownload(tl, e)} sx={{ color: PRIMARY_RED }}>
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

// ── StatsBar ─────────────────────────────────────────────────────
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
        <Box key={i} sx={{
          flex: 1, display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
          borderRight: i < items.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : "none",
        }}>
          <Box sx={{ color: PRIMARY_RED, opacity: 0.7 }}>{item.icon}</Box>
          <Box>
            <Typography variant="caption" color="text.secondary">{item.title}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.label}</Typography>
          </Box>
        </Box>
      ))}
    </GlassPaper>
  );
};

// ── Skeleton ─────────────────────────────────────────────────────
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

// ── Main Component ───────────────────────────────────────────────
export default function KhoaHocPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const courseId = (params?.courseId || params?.id) as string;

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [baiGiang, setBaiGiang] = useState<BaiGiangType | null>(null);
  const [danhSachTatCa, setDanhSachTatCa] = useState<BaiGiangType[]>([]);
  const [phanDangMo, setPhanDangMo] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState("");

  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  const updatingRef = useRef<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const flatten = useCallback((d: KhoaHocType | null): BaiGiangType[] => {
    if (!d) return [];
    return d.danhSachPhanHoc?.flatMap(p => p.danhSachBaiGiang ?? []) ?? [];
  }, []);

  const isBaiHoanThanh = useCallback(
    (bgId: string) => danhSachTatCa.find(b => b.id === bgId)?.daHoanThanh === true,
    [danhSachTatCa]
  );

  const tongBai = danhSachTatCa.length;
  const soBaiHoanThanh = danhSachTatCa.filter(b => b.daHoanThanh).length;
  const phanTramHoanThanh = useMemo(
    () => tongBai === 0 ? 0 : Math.round((soBaiHoanThanh / tongBai) * 100),
    [tongBai, soBaiHoanThanh]
  );

  const sendProgress = useCallback(async (baiGiangId: string, thoiGianXem: number) => {
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
      const res = await KhoaHocSvc.getLearningKhoaHoc(courseId);
      const refreshed = res.data;
      setKhoaHoc(refreshed);
      setDanhSachTatCa(flatten(refreshed));
      return refreshed;
    } catch (err) {
      console.error("Lỗi cập nhật tiến độ:", err);
      return null;
    } finally {
      delete updatingRef.current[baiGiangId];
    }
  }, [courseId, flatten]);

  const chonBaiGiang = useCallback((bg: BaiGiangType) => {
    setBaiGiang(bg);
    if (bg.idPhan) setPhanDangMo(prev => new Set([...prev, bg.idPhan!]));
    lastUpdateTimeRef.current[bg.id!] = 0;
  }, []);

  const handleTimeUpdate = useCallback((ct: number) => {
    if (!baiGiang?.id) return;
    const last = lastUpdateTimeRef.current[baiGiang.id] ?? 0;
    if (ct - last >= 10) {
      lastUpdateTimeRef.current[baiGiang.id] = ct;
      sendProgress(baiGiang.id, ct);
    }
  }, [baiGiang, sendProgress]);

  const handleVideoEnded = useCallback(async () => {
    if (!baiGiang?.id) return;
    const refreshed = await sendProgress(baiGiang.id, baiGiang.thoiLuong ?? 0);
    const currentList = refreshed ? flatten(refreshed) : danhSachTatCa;
    const idx = currentList.findIndex(b => b.id === baiGiang.id);
    if (idx !== -1) {
      let nextIdx = idx + 1;
      while (nextIdx < currentList.length && currentList[nextIdx].daHoanThanh) nextIdx++;
      if (nextIdx < currentList.length) chonBaiGiang(currentList[nextIdx]);
    }
  }, [baiGiang, danhSachTatCa, sendProgress, chonBaiGiang, flatten]);

  const togglePhan = useCallback((id: string, playingId?: string) => {
    if (id === playingId) return;
    setPhanDangMo(prev => {
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
      .map(phan => ({
        ...phan,
        danhSachBaiGiang: phan.danhSachBaiGiang?.filter((bg: BaiGiangType) =>
          bg.tieuDe?.toLowerCase().includes(lower)
        ) ?? [],
      }))
      .filter(phan => phan.danhSachBaiGiang.length > 0);
  }, [khoaHoc, searchTerm]);

  // Fetch khóa học
  useEffect(() => {
    const loadData = async () => {
      if (!courseId) { setError("Không tìm thấy ID"); setLoading(false); return; }
      const isValidGuid = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(courseId);
      if (!isValidGuid) { setError("ID không đúng định dạng GUID"); setLoading(false); return; }
      try {
        setLoading(true);
        const res = await KhoaHocSvc.getLearningKhoaHoc(courseId);
        const data = res.data;
        setKhoaHoc(data);
        const ds = flatten(data);
        setDanhSachTatCa(ds);
        if (ds.length > 0) chonBaiGiang(ds.find(l => !l.daHoanThanh) ?? ds[0]);
        if (data?.danhSachPhanHoc) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setPhanDangMo(new Set(data.danhSachPhanHoc.map((p: any) => p.id!).filter(Boolean)));
        }
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (err as any)?.response?.status;
        if (status === 401 || status === 403) setError("Bạn không có quyền truy cập.");
        else if (status === 404) setError("Không tìm thấy khóa học.");
        else setError("Có lỗi xảy ra. Vui lòng thử lại.");
      } finally { setLoading(false); }
    };
    loadData();
  }, [courseId, flatten, chonBaiGiang]);

  const currentIdx = danhSachTatCa.findIndex(b => b.id === baiGiang?.id);
  const coTiepTheo = currentIdx !== -1 && currentIdx < danhSachTatCa.length - 1;
  const idPhanPlay = baiGiang?.idPhan;

  if (loading) return <CourseSkeleton />;

  if (error) return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <GlassPaper sx={{ maxWidth: 500, p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom sx={{ fontWeight: 700 }}>Lỗi truy cập</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
        <Button variant="contained" href="/" sx={{ bgcolor: PRIMARY_RED, "&:hover": { bgcolor: PRIMARY_RED_DARK } }}>Về trang chủ</Button>
      </GlassPaper>
    </Box>
  );

  if (!khoaHoc) return null;

  const sidebarContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: `2px solid ${PRIMARY_RED}`, bgcolor: "grey.50" }}>
        <Stack direction="row" sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Nội dung khóa học</Typography>
          {isMobile && <IconButton onClick={() => setSidebarOpen(false)}><CloseIcon /></IconButton>}
        </Stack>
        <TextField
          fullWidth size="small" placeholder="Tìm kiếm bài giảng..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}><CloseIcon fontSize="small" /></IconButton>
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
                  bgcolor: isPlaying ? alpha(PRIMARY_RED, 0.08) : "transparent",
                  borderLeft: `3px solid ${isPlaying ? PRIMARY_RED : "transparent"}`,
                  py: 1.5,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} color={isPlaying ? PRIMARY_RED : "text.primary"}>
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
                          pl: 4, py: 1.5,
                          borderLeft: `3px solid ${baiGiang?.id === bg.id ? PRIMARY_RED : "transparent"}`,
                          bgcolor: baiGiang?.id === bg.id ? alpha(PRIMARY_RED, 0.05) : "transparent",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {bg.daHoanThanh
                            ? <CheckCircleIcon sx={{ color: PRIMARY_RED, fontSize: 20 }} />
                            : <PlayArrowIcon sx={{ color: baiGiang?.id === bg.id ? PRIMARY_RED : "text.disabled", fontSize: 20 }} />
                          }
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: baiGiang?.id === bg.id ? 600 : 400 }} color={baiGiang?.id === bg.id ? PRIMARY_RED : "text.primary"}>
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
            <Typography color="text.secondary">Không tìm thấy bài giảng.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "grey.50" }}>
      {/* Header */}
      <AppBar position="sticky" color="default" elevation={0} sx={{
        borderBottom: `2px solid ${PRIMARY_RED}`,
        bgcolor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: "blur(8px)",
      }}>
        <Toolbar sx={{ minHeight: HEADER_H, gap: 2, px: { xs: 2, md: 3 } }}>
          <Image src="/khoahoc/1-removebg-preview.png" alt="EduVerse" width={120} height={40} style={{ objectFit: "contain" }} priority />
          <IconButton
            onClick={() => setSidebarOpen(true)}
            sx={{
              border: `1.5px solid ${sidebarOpen ? PRIMARY_RED : theme.palette.divider}`,
              bgcolor: sidebarOpen ? alpha(PRIMARY_RED, 0.1) : "transparent",
              display: { xs: "flex", md: isMobile ? "flex" : "none" },
            }}
          >
            <MenuBookIcon sx={{ color: sidebarOpen ? PRIMARY_RED : "inherit" }} />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap variant="subtitle1" sx={{ fontWeight: 700 }}>{khoaHoc.tieuDe}</Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: PRIMARY_RED }}>{phanTramHoanThanh}%</Typography>
            </Box>
            <Box sx={{ width: { xs: 80, sm: 120 } }}>
              <ProgressBar variant="determinate" value={phanTramHoanThanh} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {soBaiHoanThanh}/{tongBai}
            </Typography>
            {coTiepTheo && (
              <Button
                variant="contained" size="small" endIcon={<NavigateNextIcon />}
                onClick={() => {
                  let n = currentIdx + 1;
                  while (n < danhSachTatCa.length && danhSachTatCa[n].daHoanThanh) n++;
                  if (n < danhSachTatCa.length) chonBaiGiang(danhSachTatCa[n]);
                }}
                sx={{ bgcolor: PRIMARY_RED, "&:hover": { bgcolor: PRIMARY_RED_DARK } }}
              >
                Tiếp
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box ref={containerRef} sx={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Video Player */}
          {baiGiang?.urlBaiGiang ? (
            <VideoJsPlayer
              key={baiGiang.id}
              url={baiGiang.urlBaiGiang}
              savedTime={baiGiang.thoiGianXem}
              isCompleted={baiGiang.daHoanThanh}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          ) : (
            <Box sx={{ height: "45vh", minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#0c0c0c" }}>
              <VideoLibraryIcon sx={{ fontSize: 80, color: alpha(PRIMARY_RED, 0.5), mb: 2 }} />
              <Typography color="text.secondary" variant="h6">Chọn bài giảng để bắt đầu học</Typography>
            </Box>
          )}

          {/* Content Info */}
          <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 4 } }}>
            {baiGiang && (
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  {khoaHoc.danhSachPhanHoc?.find(p => p.id === idPhanPlay)?.tenPhan ?? ""}
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: PRIMARY_RED }}>{baiGiang.tieuDe}</Typography>
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
                    <Chip label="✓ Đã hoàn thành" size="small" variant="outlined" icon={<CheckCircleIcon />} sx={{ color: PRIMARY_RED, borderColor: PRIMARY_RED }} />
                  )}
                </Stack>
              </Box>
              {coTiepTheo && (
                <Button
                  variant="contained" endIcon={<NavigateNextIcon />}
                  onClick={() => {
                    let n = currentIdx + 1;
                    while (n < danhSachTatCa.length && danhSachTatCa[n].daHoanThanh) n++;
                    if (n < danhSachTatCa.length) chonBaiGiang(danhSachTatCa[n]);
                  }}
                  sx={{ bgcolor: PRIMARY_RED, "&:hover": { bgcolor: PRIMARY_RED_DARK } }}
                >
                  Bài tiếp theo
                </Button>
              )}
            </Stack>

            <StatsBar khoaHoc={khoaHoc} />

            {khoaHoc.moTa && (
              <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Mô tả khóa học</Typography>
                <Typography variant="body2" color="text.secondary">{khoaHoc.moTa}</Typography>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Sidebar Desktop */}
        {!isMobile && (
          <Box sx={{
            width: sidebarOpen ? SIDEBAR_W : 0,
            flexShrink: 0,
            transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            borderLeft: sidebarOpen ? `1px solid ${theme.palette.divider}` : "none",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}>
            {sidebarContent}
          </Box>
        )}

        {/* Sidebar Mobile */}
        {isMobile && (
          <Drawer anchor="right" open={sidebarOpen} onClose={() => setSidebarOpen(false)}
            sx={{ "& .MuiDrawer-paper": { width: "85%", maxWidth: 360 } }}>
            {sidebarContent}
          </Drawer>
        )}

        {/* Floating button */}
        {!sidebarOpen && !isMobile && (
          <Zoom in>
            <Box
              onClick={() => setSidebarOpen(true)}
              sx={{
                position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
                zIndex: 1100, bgcolor: PRIMARY_RED, borderRadius: "8px 0 0 8px",
                cursor: "pointer", boxShadow: `-3px 0 14px ${alpha(PRIMARY_RED, 0.4)}`,
                width: 32, py: 3, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 1, transition: "all 0.2s",
                "&:hover": { width: 38, bgcolor: PRIMARY_RED_DARK },
              }}
            >
              <ChevronLeftIcon sx={{ color: "#fff", fontSize: 20 }} />
              <Typography sx={{ writingMode: "vertical-rl", color: "#fff", fontSize: 10, fontWeight: 700 }}>NỘI DUNG</Typography>
            </Box>
          </Zoom>
        )}
      </Box>
    </Box>
  );
}