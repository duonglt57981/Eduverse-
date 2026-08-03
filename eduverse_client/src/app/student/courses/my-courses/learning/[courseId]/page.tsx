/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/student/courses/my-courses/learning/[courseId]/page.tsx

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Stack,
  useTheme,
  alpha,
  useMediaQuery,
  Drawer,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  MenuBook as MenuBookIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  VideoLibrary as VideoLibraryIcon,
  School as SchoolIcon,
} from "@mui/icons-material";

import { VideoPlayer } from "./components/VideoPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { StatsBar } from "./components/StatsBar";
import { CourseSkeleton } from "./components/CourseSkeleton";
import { SidebarContent } from "./components/SidebarContent";
import { QuizContainer } from "./components/quiz/QuizContainer";

import { useCourseData } from "./hooks/useCourseData";
import { useProgress } from "./hooks/useProgress";
import { useVideoPlayer } from "./hooks/useVideoPlayer";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";

import DOMPurify from "dompurify";

const PRIMARY_RED = "#8B1313";
const PRIMARY_RED_DARK = "#7F1D1D";
const SIDEBAR_W = 380;
const HEADER_H = 68;

// Interface khớp với response thực tế từ BE (camelCase)
interface PhanHocApi {
  id?: string;
  tenPhan?: string;
  thuTuSapXep?: number;
  danhSachBaiGiang?: BaiGiangType[];
  danhSachBaiKiemTra?: BaiKiemTraDto[];
}

// Interface cho thông tin giảng viên từ API
interface ThongTinGiangVien {
  id?: string;
  hoTen?: string;
  anhDaiDien?: string;
  tieuSu?: string;
  gioiThieu?: string;
  chucVu?: string;
  email?: string;
}

// ─────────────────────────────────────────────────────────
// VideoArea
// ─────────────────────────────────────────────────────────
interface VideoAreaProps {
  loading: boolean;
  hasLessons: boolean;
  baiGiang: BaiGiangType | null;
  isVideoFullMounted: boolean;
  showMini: boolean;
  currentSavedTime: number | undefined;
  currentIsCompleted: boolean | undefined;
  onTimeUpdate: (ct: number) => void;
  onEnded: () => void;
  lastSavedTimeRef: { current: number };
  setCurrentSavedTime: (t: number | undefined) => void;
}

function VideoArea({
  loading,
  hasLessons,
  baiGiang,
  isVideoFullMounted,
  showMini,
  currentSavedTime,
  currentIsCompleted,
  onTimeUpdate,
  onEnded,
  lastSavedTimeRef,
  setCurrentSavedTime,
}: VideoAreaProps) {
  if (loading) {
    return <CourseSkeleton />;
  }

  if (!hasLessons) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          color: "text.secondary",
        }}
      >
        <VideoLibraryIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="h6">Chưa có bài giảng</Typography>
        <Typography variant="body2">
          Khóa học này chưa có nội dung bài giảng.
        </Typography>
      </Box>
    );
  }

  if (!baiGiang) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "var(--ev-paper-alt, #fafafa)",
        }}
      >
        <MenuBookIcon sx={{ fontSize: 72, color: alpha(PRIMARY_RED, 0.2) }} />
        <Typography variant="h6" color="text.secondary">
          Chọn bài giảng để bắt đầu học
        </Typography>
      </Box>
    );
  }

  if (!baiGiang.urlBaiGiang) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "var(--ev-paper-alt, #fafafa)",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Bài giảng này chưa có video
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {baiGiang.tieuDe}
        </Typography>
      </Box>
    );
  }

  if (isVideoFullMounted && !showMini) {
    return (
      <Box sx={{ width: "100%", height: "100%", bgcolor: "#000" }}>
        <VideoPlayer
          key={baiGiang.id}
          url={baiGiang.urlBaiGiang}
          savedTime={currentSavedTime}
          isCompleted={currentIsCompleted}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          mini={false}
          autoPlay={true}
          onUnmount={(time) => {
            lastSavedTimeRef.current = time;
            setCurrentSavedTime(time);
          }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%", bgcolor: "#000" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.3)" }}>
          Đang phát ở chế độ thu nhỏ
        </Typography>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────
// InstructorInfo: Component hiển thị thông tin giảng viên
// ─────────────────────────────────────────────────────────
interface InstructorInfoProps {
  thongTinGiangVien?: ThongTinGiangVien | null;
}

function InstructorInfo({ thongTinGiangVien }: InstructorInfoProps) {
  // Nếu không có thông tin giảng viên, không hiển thị gì
  if (!thongTinGiangVien || !thongTinGiangVien.hoTen) {
    return null;
  }

  const { hoTen, anhDaiDien, tieuSu, gioiThieu, id, chucVu } =
    thongTinGiangVien;
  const bioHtml = tieuSu || gioiThieu || "";

  const handleClick = () => {
    if (id) {
      window.location.href = `/instructor/profile/${id}`;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mt: 4,
        borderRadius: "16px",
        border: "1px solid var(--ev-divider, #ECE7E4)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        backgroundColor: "background.paper",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 800, mb: 2.5, color: "text.primary" }}
      >
        Giảng viên
      </Typography>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
        {/* Avatar */}
        <Avatar
          src={anhDaiDien}
          alt={hoTen}
          sx={{
            width: 72,
            height: 72,
            bgcolor: PRIMARY_RED,
            fontSize: 28,
            fontWeight: 700,
            flexShrink: 0,
            border: `3px solid ${alpha(PRIMARY_RED, 0.15)}`,
          }}
        >
          {hoTen.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Tên giảng viên */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "var(--ev-text-primary, #1F2937)",
              cursor: id ? "pointer" : "default",
              "&:hover": id
                ? {
                    color: PRIMARY_RED,
                    textDecoration: "underline",
                  }
                : {},
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            onClick={handleClick}
          >
            {hoTen}
            {id && (
              <ChevronRightIcon
                sx={{
                  fontSize: 18,
                  color: PRIMARY_RED,
                  opacity: 0.6,
                }}
              />
            )}
          </Typography>

          {/* Chức vụ */}
          {chucVu && (
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "text.secondary",
                mt: 0.25,
              }}
            >
              {chucVu}
            </Typography>
          )}

          {/* Tiểu sử - hiển thị HTML, không thu gọn */}
          {bioHtml && (
            <Box
              sx={{
                mt: 1.5,
                fontSize: "0.875rem",
                lineHeight: 1.8,
                color: "text.secondary",
                "& p": { margin: "0 0 0.75em 0" },
                "& ul, & ol": {
                  paddingLeft: "1.5em",
                  margin: "0.5em 0 0.75em 0",
                },
                "& li": { marginBottom: "0.25em" },
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  margin: "0.75em 0 0.25em 0",
                  fontWeight: 700,
                  color: "text.primary",
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 1,
                  margin: "0.5em 0",
                },
                "& a": {
                  color: PRIMARY_RED,
                  textDecoration: "underline",
                  "&:hover": { color: PRIMARY_RED_DARK },
                },
                "& blockquote": {
                  borderLeft: `4px solid ${PRIMARY_RED}`,
                  paddingLeft: "1.5em",
                  margin: "0.75em 0",
                  color: "text.secondary",
                  fontStyle: "italic",
                },
              }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(bioHtml),
              }}
            />
          )}

          {/* Badge giảng viên */}
          <Box
            sx={{
              mt: 1.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: "20px",
              bgcolor: alpha(PRIMARY_RED, 0.08),
              color: PRIMARY_RED,
            }}
          >
            <SchoolIcon sx={{ fontSize: 14 }} />
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              GIẢNG VIÊN
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

export default function KhoaHocLearningPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const pathname = usePathname();
  const courseId = (params?.courseId || params?.id) as string | undefined;

  const role = pathname.split("/")[1] || "student";
  const dashboardPath = `/${role}/dashboard`;

  console.log("📌 [KhoaHocLearningPage] courseId:", courseId);

  // ── Hooks ──
  const { khoaHoc, loading, error, danhSachTatCa, getPhanHocApi } =
    useCourseData(courseId);
  const { progressMap, sendProgress, isBaiHoanThanh, initProgress } =
    useProgress();
  const {
    baiGiang,
    currentIdx,
    coTiepTheo,
    chonBaiGiang,
    phanDangMo,
    setPhanDangMo,
    idPhanPlay,
    handleTimeUpdate,
    currentTimeRef,
    lastSavedTimeRef,
  } = useVideoPlayer();

  // ── Local state ──
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMini, setShowMini] = useState(false);
  const [quizDangChon, setQuizDangChon] = useState<BaiKiemTraDto | null>(null);
  const [isVideoFullMounted, setIsVideoFullMounted] = useState(true);
  const [currentSavedTime, setCurrentSavedTime] = useState<number | undefined>(
    undefined,
  );

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // ── Lấy thông tin giảng viên từ khoaHoc ──
  const thongTinGiangVien = useMemo(() => {
    if (!khoaHoc) return null;
    return (
      ((khoaHoc as any).thongTinGiangVien as ThongTinGiangVien | undefined) ||
      null
    );
  }, [khoaHoc]);

  // ── Stats ──
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

  // ── Quiz theo phần ──
  const quizTheoPhan = useMemo(() => {
    const map = new Map<string, BaiKiemTraDto[]>();
    getPhanHocApi().forEach((phan: PhanHocApi) => {
      const validQuizzes = (phan.danhSachBaiKiemTra ?? []).filter(
        (q) =>
          q.isBanHienTai === true &&
          q.trangThai !== "NgungHoatDong" &&
          q.trangThai !== "DaXoa",
      );
      if (phan.id && validQuizzes.length > 0) {
        map.set(phan.id, validQuizzes);
      }
    });
    return map;
  }, [getPhanHocApi]);

  // ── Update current saved time ──
  const updateCurrentSavedTime = useCallback(() => {
    if (!baiGiang?.id) {
      setCurrentSavedTime(undefined);
      return;
    }

    if (lastSavedTimeRef.current > 0) {
      setCurrentSavedTime(lastSavedTimeRef.current);
      return;
    }

    const progress = progressMap.get(baiGiang.id);
    if (progress?.thoiGianXem && progress.thoiGianXem > 0) {
      setCurrentSavedTime(progress.thoiGianXem);
      return;
    }

    setCurrentSavedTime(baiGiang.thoiGianXem);
  }, [baiGiang, progressMap, lastSavedTimeRef]);

  // ── Init progress ──
  useEffect(() => {
    if (danhSachTatCa.length > 0) {
      console.log(
        "🔄 [KhoaHocLearningPage] Init progress, số bài:",
        danhSachTatCa.length,
      );
      initProgress(danhSachTatCa);
    }
  }, [danhSachTatCa, initProgress]);

  // ── Auto select first lesson ──
  useEffect(() => {
    if (danhSachTatCa.length > 0 && !baiGiang) {
      console.log("🔄 [KhoaHocLearningPage] Auto select first lesson");
      const first =
        danhSachTatCa.find((l) => !l.daHoanThanh) ?? danhSachTatCa[0];
      chonBaiGiang(first, danhSachTatCa);
    }
  }, [danhSachTatCa, baiGiang, chonBaiGiang]);

  useEffect(() => {
    updateCurrentSavedTime();
  }, [baiGiang?.id, updateCurrentSavedTime]);

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
      const shouldShow = rect.bottom < HEADER_H;

      if (shouldShow && !showMini) {
        const currentTime = currentTimeRef.current;
        lastSavedTimeRef.current = currentTime;
        setCurrentSavedTime(currentTime);
        setIsVideoFullMounted(false);
      } else if (!shouldShow && showMini) {
        setIsVideoFullMounted(true);
        updateCurrentSavedTime();
      }

      setShowMini(shouldShow);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(onScroll, 100);

    return () => el.removeEventListener("scroll", onScroll);
  }, [
    baiGiang,
    showMini,
    currentTimeRef,
    lastSavedTimeRef,
    updateCurrentSavedTime,
  ]);

  const scrollToVideo = useCallback(() => {
    setIsVideoFullMounted(true);
    setShowMini(false);
    updateCurrentSavedTime();
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [updateCurrentSavedTime]);

  // ── Handlers ──
  const handleTimeUpdateWrapper = useCallback(
    (ct: number) => {
      handleTimeUpdate(ct, (id, time) => {
        if (courseId) sendProgress(id, time, courseId);
      });
    },
    [handleTimeUpdate, sendProgress, courseId],
  );

  const handleVideoEnded = useCallback(async () => {
    if (!baiGiang?.id || !courseId) return;
    const thoiLuong = baiGiang.thoiLuong ?? 0;
    await sendProgress(baiGiang.id, thoiLuong, courseId);
    const idx = danhSachTatCa.findIndex((b) => b.id === baiGiang.id);
    if (idx !== -1 && idx + 1 < danhSachTatCa.length) {
      lastSavedTimeRef.current = 0;
      currentTimeRef.current = 0;
      setCurrentSavedTime(undefined);
      chonBaiGiang(danhSachTatCa[idx + 1], danhSachTatCa);
    }
  }, [
    baiGiang,
    danhSachTatCa,
    sendProgress,
    chonBaiGiang,
    courseId,
    lastSavedTimeRef,
    currentTimeRef,
  ]);

  const handleSelectBaiGiang = useCallback(
    (bg: BaiGiangType) => {
      setQuizDangChon(null);
      lastSavedTimeRef.current = 0;
      currentTimeRef.current = 0;
      setCurrentSavedTime(undefined);
      setIsVideoFullMounted(true);
      setShowMini(false);
      chonBaiGiang(bg, danhSachTatCa);
    },
    [chonBaiGiang, danhSachTatCa, lastSavedTimeRef, currentTimeRef],
  );

  const handleSelectQuiz = useCallback((quiz: BaiKiemTraDto) => {
    setQuizDangChon(quiz);
  }, []);

  const handleCloseQuiz = useCallback(() => {
    setQuizDangChon(null);
  }, []);

  const handleMiniUnmount = useCallback(
    (time: number) => {
      lastSavedTimeRef.current = time;
      setCurrentSavedTime(time);
    },
    [lastSavedTimeRef],
  );

  const togglePhan = useCallback(
    (id: string, playingPhanId?: string) => {
      if (id === playingPhanId) return;
      setPhanDangMo((prev) => {
        const s = new Set(prev);
        if (s.has(id)) {
          s.delete(id);
        } else {
          s.add(id);
        }
        return s;
      });
    },
    [setPhanDangMo],
  );

  const goToNextLesson = useCallback(() => {
    const n = currentIdx + 1;
    if (n < danhSachTatCa.length) {
      lastSavedTimeRef.current = 0;
      currentTimeRef.current = 0;
      setCurrentSavedTime(undefined);
      setIsVideoFullMounted(true);
      setShowMini(false);
      chonBaiGiang(danhSachTatCa[n], danhSachTatCa);
    }
  }, [
    currentIdx,
    danhSachTatCa,
    chonBaiGiang,
    lastSavedTimeRef,
    currentTimeRef,
  ]);

  // ── Current video data ──
  const currentIsCompleted = baiGiang?.id
    ? progressMap.get(baiGiang.id)?.daHoanThanh
    : baiGiang?.daHoanThanh;

  // ── Loading & Error ──
  if (loading) {
    return <CourseSkeleton />;
  }

  if (error) {
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
        <Paper sx={{ maxWidth: 480, p: 4, textAlign: "center" }}>
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
        </Paper>
      </Box>
    );
  }

  if (!khoaHoc) {
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
        <Paper sx={{ maxWidth: 480, p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Không tải được khóa học
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Dữ liệu khóa học trống hoặc không hợp lệ. Vui lòng thử lại.
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: "center" }}
          >
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Tải lại
            </Button>
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
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ── Render ──
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--ev-bg, #F7F5F2)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: "1px solid var(--ev-divider, #ECE7E4)",
          bgcolor: "var(--ev-paper, #FFFFFF)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
          flexShrink: 0,
        }}
      >
        <Toolbar
          sx={{
            minHeight: HEADER_H,
            height: HEADER_H,
            gap: 3,
            px: { xs: 2, md: 3 },
          }}
        >
          <Box
            sx={{
              width: { xs: 110, sm: 130, lg: 150 },
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link
              href={dashboardPath}
              style={{ display: "block", width: "100%" }}
            >
              <Image
                src="/auth/img/logo_nentrang.png"
                alt="EduVerse"
                width={150}
                height={46}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </Link>
          </Box>
          {isMobile && (
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{
                border: `1px solid ${sidebarOpen ? PRIMARY_RED : "#ECE7E4"}`,
                bgcolor: sidebarOpen ? alpha(PRIMARY_RED, 0.05) : "transparent",
                borderRadius: "10px",
                p: 1,
              }}
            >
              <MenuBookIcon
                sx={{
                  color: sidebarOpen ? PRIMARY_RED : "#4B5563",
                  fontSize: 20,
                }}
              />
            </IconButton>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "14px", sm: "16px" },
                color: "var(--ev-text-primary, #1F2937)",
              }}
            >
              {khoaHoc.tieuDe}
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                display: { xs: "none", sm: "flex" },
                bgcolor: "var(--ev-paper-alt, #F7F5F2)",
                border: "1px solid var(--ev-divider, #ECE7E4)",
                px: 2,
                py: 0.75,
                borderRadius: "10px",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: PRIMARY_RED, fontSize: "12px" }}
              >
                {phanTramHoanThanh}%
              </Typography>
              <Box sx={{ width: 100 }}>
                <LinearProgress
                  variant="determinate"
                  value={phanTramHoanThanh}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: "var(--ev-divider, #ECE7E4)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: PRIMARY_RED,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: "var(--ev-text-secondary, #4B5563)", fontSize: "12px" }}
              >
                {soBaiHoanThanh}/{tongBai} bài
              </Typography>
            </Stack>
            {coTiepTheo && (
              <Button
                variant="contained"
                size="medium"
                endIcon={<NavigateNextIcon />}
                onClick={goToNextLesson}
                sx={{
                  bgcolor: PRIMARY_RED,
                  color: "#ffffff",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "14px",
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: PRIMARY_RED_DARK,
                    boxShadow: "none",
                  },
                  whiteSpace: "nowrap",
                }}
              >
                Tiếp
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Body */}
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
          {quizDangChon ? (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <QuizContainer
                baiKiemTra={{
                  id: quizDangChon.id!,
                  tieuDe: quizDangChon.tenBaiKiemTra,
                  moTa: quizDangChon.moTa,
                  thoiGianGioiHan: quizDangChon.gioiHanThoiGian ?? null,
                  soLuongCauHoi: quizDangChon.soCauHoi,
                  diemDat: quizDangChon.diemDat,
                  soLanLamToiDa: quizDangChon.soLanLamToiDa,
                }}
                idDangKyKhoaHoc={courseId ?? ""}
                onClose={handleCloseQuiz}
              />
            </Box>
          ) : (
            <>
              <Box
                ref={videoSectionRef}
                sx={{
                  flexShrink: 0,
                  bgcolor: "#000",
                  width: "100%",
                  height: {
                    xs: "56.25vw",
                    md: `calc(100vh - ${HEADER_H}px)`,
                  },
                }}
              >
                <VideoArea
                  loading={loading}
                  hasLessons={danhSachTatCa.length > 0}
                  baiGiang={baiGiang}
                  isVideoFullMounted={isVideoFullMounted}
                  showMini={showMini}
                  currentSavedTime={currentSavedTime}
                  currentIsCompleted={currentIsCompleted}
                  onTimeUpdate={handleTimeUpdateWrapper}
                  onEnded={handleVideoEnded}
                  lastSavedTimeRef={lastSavedTimeRef}
                  setCurrentSavedTime={setCurrentSavedTime}
                />
              </Box>

              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  flex: 1,
                  maxWidth: 1200,
                  mx: "auto",
                  width: "100%",
                }}
              >
                {baiGiang && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "var(--ev-text-secondary, #4B5563)" }}
                    >
                      {(
                        khoaHoc.danhSachPhanHoc as unknown as PhanHocApi[]
                      )?.find((p) => p.id === idPhanPlay)?.tenPhan ?? ""}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16, color: "var(--ev-text-muted, #8A7676)" }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: PRIMARY_RED }}
                    >
                      {baiGiang.tieuDe}
                    </Typography>
                  </Stack>
                )}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  sx={{
                    mb: 4,
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        mb: 1.5,
                        color: "var(--ev-text-primary, #1F2937)",
                        fontSize: { xs: "20px", sm: "24px" },
                      }}
                    >
                      {baiGiang?.tieuDe ?? khoaHoc.tieuDe}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center", flexWrap: "wrap" }}
                    >
                      {baiGiang && (
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "var(--ev-text-secondary, #4B5563)" }}
                        >
                          Bài {currentIdx + 1}/{danhSachTatCa.length} ·{" "}
                          {Math.floor((baiGiang.thoiLuong ?? 0) / 60)}p{" "}
                          {(baiGiang.thoiLuong ?? 0) % 60}s
                        </Typography>
                      )}
                      {baiGiang && isBaiHoanThanh(baiGiang.id!) && (
                        <Chip
                          label="Hoàn thành"
                          size="small"
                          sx={{
                            bgcolor: "#DCFCE7",
                            color: "#15803D",
                            fontWeight: 800,
                            fontSize: "12px",
                            height: 24,
                            px: 0.5,
                            border: "none",
                            "& .MuiChip-icon": { color: "#15803D" },
                          }}
                          icon={
                            <CheckCircleIcon
                              sx={{ fontSize: "14px !important" }}
                            />
                          }
                        />
                      )}
                    </Stack>
                  </Box>
                  {coTiepTheo && (
                    <Button
                      variant="contained"
                      size="medium"
                      endIcon={<NavigateNextIcon />}
                      onClick={goToNextLesson}
                      sx={{
                        bgcolor: PRIMARY_RED,
                        color: "#ffffff",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "14px",
                        textTransform: "none",
                        px: 2.5,
                        py: 1,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: PRIMARY_RED_DARK,
                          boxShadow: "none",
                        },
                        flexShrink: 0,
                      }}
                    >
                      Bài tiếp theo
                    </Button>
                  )}
                </Stack>

                <StatsBar khoaHoc={khoaHoc} />

                {/* Mô tả khóa học - hiển thị toàn bộ, không thu gọn */}
                {khoaHoc.moTa && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 4 },
                      mt: 4,
                      borderRadius: "16px",
                      border: "1px solid var(--ev-divider, #ECE7E4)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                      backgroundColor: "background.paper",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}
                    >
                      Mô tả khóa học
                    </Typography>

                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        lineHeight: 1.7,
                        color: "text.secondary",
                        "& p": { margin: "0 0 0.75em 0" },
                        "& ul, & ol": {
                          paddingLeft: "1.5em",
                          margin: "0.5em 0 0.75em 0",
                        },
                        "& li": { marginBottom: "0.25em" },
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                          margin: "0.75em 0 0.25em 0",
                          fontWeight: 700,
                          color: "text.primary",
                        },
                        "& img": {
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: 1,
                          margin: "0.5em 0",
                        },
                        "& a": {
                          color: PRIMARY_RED,
                          textDecoration: "underline",
                          "&:hover": { color: PRIMARY_RED_DARK },
                        },
                        "& blockquote": {
                          borderLeft: `4px solid ${PRIMARY_RED}`,
                          paddingLeft: "1.5em",
                          margin: "0.75em 0",
                          color: "text.secondary",
                          fontStyle: "italic",
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(khoaHoc.moTa),
                      }}
                    />
                  </Paper>
                )}

                {/* Thông tin giảng viên */}
                <InstructorInfo thongTinGiangVien={thongTinGiangVien} />
              </Box>
            </>
          )}
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
            <SidebarContent
              khoaHoc={khoaHoc}
              baiGiang={baiGiang}
              phanDangMo={phanDangMo}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onTogglePhan={togglePhan}
              onSelectBaiGiang={handleSelectBaiGiang}
              progressMap={progressMap}
              phanTramHoanThanh={phanTramHoanThanh}
              soBaiHoanThanh={soBaiHoanThanh}
              tongBai={tongBai}
              idPhanPlay={idPhanPlay}
              quizTheoPhan={quizTheoPhan}
              idQuizDangChon={quizDangChon?.id}
              onSelectQuiz={handleSelectQuiz}
            />
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
            <SidebarContent
              khoaHoc={khoaHoc}
              baiGiang={baiGiang}
              phanDangMo={phanDangMo}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onTogglePhan={togglePhan}
              onSelectBaiGiang={handleSelectBaiGiang}
              progressMap={progressMap}
              phanTramHoanThanh={phanTramHoanThanh}
              soBaiHoanThanh={soBaiHoanThanh}
              tongBai={tongBai}
              idPhanPlay={idPhanPlay}
              quizTheoPhan={quizTheoPhan}
              idQuizDangChon={quizDangChon?.id}
              onSelectQuiz={handleSelectQuiz}
              isMobile={true}
              onCloseMobile={() => setSidebarOpen(false)}
            />
          </Drawer>
        )}

        {/* Sidebar toggle */}
        {!sidebarOpen && !isMobile && (
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
        )}
      </Box>

      {/* Mini player */}
      {showMini && baiGiang?.urlBaiGiang && (
        <MiniPlayer
          key={`mini-${baiGiang.id}`}
          url={baiGiang.urlBaiGiang}
          savedTime={currentSavedTime}
          isCompleted={currentIsCompleted}
          onTimeUpdate={handleTimeUpdateWrapper}
          onEnded={handleVideoEnded}
          onExpand={scrollToVideo}
          autoPlay={true}
          onUnmount={handleMiniUnmount}
        />
      )}
    </Box>
  );
}
