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
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  MenuBook as MenuBookIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  VideoLibrary as VideoLibraryIcon,
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
const PRIMARY_RED_DARK = "#6B1414";
const SIDEBAR_W = 380;
const HEADER_H = 86;

// Interface khớp với response thực tế từ BE (camelCase)
interface PhanHocApi {
  id?: string;
  tenPhan?: string;
  thuTuSapXep?: number;
  danhSachBaiGiang?: BaiGiangType[];
  danhSachBaiKiemTra?: BaiKiemTraDto[];
}

// ─────────────────────────────────────────────────────────
// VideoArea: tách ra thành component riêng NGOÀI component cha
// để tránh lỗi react-hooks/static-components (component không
// được tạo lại mỗi lần render, giữ được state con ổn định).
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
          height: 280,
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
          height: 280,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fafafa",
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
          height: 280,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fafafa",
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

  // Chỉ render VideoPlayer full khi isVideoFullMounted = true và không ở chế độ mini
  if (isVideoFullMounted && !showMini) {
    return (
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
    );
  }

  // Khi ở chế độ mini, hiển thị placeholder để giữ layout
  return (
    <Box sx={{ width: "100%", aspectRatio: "16/9", bgcolor: "#000" }}>
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
      if (phan.id && (phan.danhSachBaiKiemTra?.length ?? 0) > 0) {
        map.set(phan.id, phan.danhSachBaiKiemTra!);
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

    // Ưu tiên thời gian đã lưu từ lastSavedTimeRef (khi chuyển mini -> full)
    if (lastSavedTimeRef.current > 0) {
      setCurrentSavedTime(lastSavedTimeRef.current);
      return;
    }

    // Fallback: từ progress map
    const progress = progressMap.get(baiGiang.id);
    if (progress?.thoiGianXem && progress.thoiGianXem > 0) {
      setCurrentSavedTime(progress.thoiGianXem);
      return;
    }

    // Fallback cuối cùng: từ bài giảng
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

  // ── Cập nhật currentSavedTime khi bài giảng đang phát thay đổi ──
  // Bắt buộc dùng useEffect (KHÔNG thể tính trong lúc render) vì
  // updateCurrentSavedTime() cần đọc lastSavedTimeRef.current — theo
  // Rules of React, ref chỉ được đọc trong effect/event handler, không
  // được đọc trong lúc render (nếu không sẽ bị lỗi react-hooks/refs).
  // Vì vậy đây là trường hợp hợp lệ để tắt có chủ đích rule
  // set-state-in-effect (không phải lách luật, mà do ràng buộc kỹ thuật
  // của việc đọc ref).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cần đọc lastSavedTimeRef (ref) nên không thể tính giá trị này lúc render
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
      // Hiển thị mini khi video section đã cuộn qua khỏi header
      const shouldShow = rect.bottom < HEADER_H;

      if (shouldShow && !showMini) {
        // Chuyển sang mini: lưu thời gian hiện tại
        const currentTime = currentTimeRef.current;
        lastSavedTimeRef.current = currentTime;
        setCurrentSavedTime(currentTime);
        setIsVideoFullMounted(false);
      } else if (!shouldShow && showMini) {
        // Chuyển về full: sẽ remount VideoPlayer với thời gian đã lưu
        setIsVideoFullMounted(true);
        // Cập nhật lại thời gian
        updateCurrentSavedTime();
      }

      setShowMini(shouldShow);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    // Initial check
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
    // Mở rộng mini: chuyển về full
    setIsVideoFullMounted(true);
    setShowMini(false);
    // Cập nhật lại thời gian
    updateCurrentSavedTime();
    // Cuộn lên video section
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
      // Reset thời gian khi chuyển bài
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
      // Reset các ref thời gian
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
      // Reset thời gian khi chuyển bài
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
        bgcolor: "grey.50",
        overflow: "hidden",
      }}
    >
      {/* Header */}
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
          <Box sx={{ width: { xs: 120, sm: 140, lg: 170 }, cursor: "pointer" }}>
            <Link
              href={dashboardPath}
              style={{ display: "block", width: "100%" }}
            >
              <Image
                src="/auth/img/logo_nentrang.png"
                alt="EduVerse"
                width={170}
                height={52}
                style={{ width: "100%", height: "auto", display: "block" }}
                priority
              />
            </Link>
          </Box>
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
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                display: { xs: "none", sm: "flex" },
                bgcolor: alpha(PRIMARY_RED, 0.05),
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: PRIMARY_RED }}
              >
                {phanTramHoanThanh}%
              </Typography>
              <Box sx={{ width: 80 }}>
                <LinearProgress
                  variant="determinate"
                  value={phanTramHoanThanh}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(PRIMARY_RED, 0.15),
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: PRIMARY_RED,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {soBaiHoanThanh}/{tongBai}
              </Typography>
            </Stack>
            {coTiepTheo && (
              <Button
                variant="contained"
                size="small"
                endIcon={<NavigateNextIcon />}
                onClick={goToNextLesson}
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
              <Box ref={videoSectionRef} sx={{ flexShrink: 0 }}>
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
                    spacing={0.75}
                    sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {(
                        khoaHoc.danhSachPhanHoc as unknown as PhanHocApi[]
                      )?.find((p) => p.id === idPhanPlay)?.tenPhan ?? ""}
                    </Typography>
                    <ChevronRightIcon
                      sx={{ fontSize: 16, color: "text.disabled" }}
                    />
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
                      variant="h5"
                      sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}
                    >
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
                          {Math.floor((baiGiang.thoiLuong ?? 0) / 60)}p{" "}
                          {(baiGiang.thoiLuong ?? 0) % 60}s
                        </Typography>
                      )}
                      {baiGiang && isBaiHoanThanh(baiGiang.id!) && (
                        <Chip
                          label="✓ Hoàn thành"
                          size="small"
                          variant="outlined"
                          icon={
                            <CheckCircleIcon
                              sx={{ fontSize: "14px !important" }}
                            />
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
                      onClick={goToNextLesson}
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
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      mt: 3,
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                      boxShadow: `0px 2px 10px ${alpha(theme.palette.common.black, 0.03)}`,
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

      {/* Mini player - Chỉ hiển thị khi showMini = true và có video */}
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
