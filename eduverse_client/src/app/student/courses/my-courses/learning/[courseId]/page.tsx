// src/app/khoa-hoc/page.tsx

"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
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
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  MenuBook as MenuBookIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  VideoLibrary as VideoLibraryIcon,
} from "@mui/icons-material";

// Import components
import { VideoPlayer } from "./components/VideoPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { StatsBar } from "./components/StatsBar";
import { CourseSkeleton } from "./components/CourseSkeleton";
import { SidebarContent } from "./components/SidebarContent";
import { QuizContainer } from "./components/quiz/QuizContainer";

// Import hooks
import { useCourseData } from "./hooks/useCourseData";
import { useProgress } from "./hooks/useProgress";
import { useVideoPlayer } from "./hooks/useVideoPlayer";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";
import BaiKiemTraService from "@/src/services/BaiKiemTraService";

const baiKiemTraSvc = new BaiKiemTraService();

// Constants
const PRIMARY_RED = "#8B1A1A";
const PRIMARY_RED_DARK = "#6B1414";
const SIDEBAR_W = 380;
const HEADER_H = 64;

export default function KhoaHocLearningPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const courseId = (params?.courseId || params?.id) as string | undefined;

  console.log("📌 [KhoaHocLearningPage] courseId:", courseId);

  // ── Hooks ──
  const { khoaHoc, loading, error, danhSachTatCa, setDanhSachTatCa } =
    useCourseData(courseId);
  const {
    progressMap,
    setProgressMap,
    sendProgress,
    isBaiHoanThanh,
    initProgress,
  } = useProgress();
  const {
    baiGiang,
    setBaiGiang,
    currentIdx,
    coTiepTheo,
    chonBaiGiang,
    phanDangMo,
    setPhanDangMo,
    idPhanPlay,
    handleTimeUpdate,
    lastUpdateTimeRef,
  } = useVideoPlayer();

  // ── Local state ──
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMini, setShowMini] = useState(false);

  // ── Quiz state ──
  const [quizTheoPhan, setQuizTheoPhan] = useState<
    Map<string, BaiKiemTraDto[]>
  >(new Map());
  const [quizDangChon, setQuizDangChon] = useState<BaiKiemTraDto | null>(null);

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

  // ── Init progress from data ──
  useEffect(() => {
    if (danhSachTatCa.length > 0) {
      console.log(
        "🔄 [KhoaHocLearningPage] Init progress, số bài:",
        danhSachTatCa.length,
      );
      initProgress(danhSachTatCa);
    }
  }, [danhSachTatCa, initProgress]);

  // ── Load quiz theo phần học ──
  useEffect(() => {
    const idDangKy = khoaHoc?.idDangKiKhoaHoc;
    if (!idDangKy) return;

    baiKiemTraSvc
      .GetQuizToLearning(idDangKy)
      .then((res) => {
        const danhSachTheoPhan = res.data?.danhSachTheoPhan ?? [];
        const map = new Map<string, BaiKiemTraDto[]>();
        danhSachTheoPhan.forEach((phan) => {
          if (phan.idPhan) {
            map.set(phan.idPhan, phan.danhSachBaiKiemTra ?? []);
          }
        });
        setQuizTheoPhan(map);
      })
      .catch((err) => {
        console.error("❌ [KhoaHocLearningPage] Lỗi tải quiz:", err);
      });
  }, [khoaHoc?.idDangKiKhoaHoc]);

  // ── Auto select first incomplete lesson ──
  useEffect(() => {
    if (danhSachTatCa.length > 0 && !baiGiang) {
      console.log("🔄 [KhoaHocLearningPage] Auto select first lesson");
      const first =
        danhSachTatCa.find((l) => !l.daHoanThanh) ?? danhSachTatCa[0];
      chonBaiGiang(first, danhSachTatCa);
    }
  }, [danhSachTatCa, baiGiang, chonBaiGiang]);

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
      chonBaiGiang(danhSachTatCa[idx + 1], danhSachTatCa);
    }
  }, [baiGiang, danhSachTatCa, sendProgress, chonBaiGiang, courseId]);

  const handleSelectBaiGiang = useCallback(
    (bg: BaiGiangType) => {
      setQuizDangChon(null);
      chonBaiGiang(bg, danhSachTatCa);
    },
    [chonBaiGiang, danhSachTatCa],
  );

  const handleSelectQuiz = useCallback((quiz: BaiKiemTraDto) => {
    setQuizDangChon(quiz);
  }, []);

  const handleCloseQuiz = useCallback(() => {
    setQuizDangChon(null);
  }, []);

  const togglePhan = useCallback((id: string, playingPhanId?: string) => {
    if (id === playingPhanId) return;
    setPhanDangMo((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }, []);

  const goToNextLesson = useCallback(() => {
    const n = currentIdx + 1;
    if (n < danhSachTatCa.length) {
      chonBaiGiang(danhSachTatCa[n], danhSachTatCa);
    }
  }, [currentIdx, danhSachTatCa, chonBaiGiang]);

  // ── Current video data ──
  const currentSavedTime = baiGiang?.id
    ? (progressMap.get(baiGiang.id)?.thoiGianXem ?? baiGiang.thoiGianXem)
    : baiGiang?.thoiGianXem;
  const currentIsCompleted = baiGiang?.id
    ? progressMap.get(baiGiang.id)?.daHoanThanh
    : baiGiang?.daHoanThanh;

  // ── Render video area ──
  const renderVideoArea = () => {
    if (loading) {
      return <CourseSkeleton />;
    }

    if (!danhSachTatCa.length) {
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

    // Có video hợp lệ
    return (
      <VideoPlayer
        key={baiGiang.id}
        url={baiGiang.urlBaiGiang}
        savedTime={currentSavedTime}
        isCompleted={currentIsCompleted}
        onTimeUpdate={handleTimeUpdateWrapper}
        onEnded={handleVideoEnded}
      />
    );
  };

  // ── Loading & Error ──
  if (loading) {
    console.log("⏳ [KhoaHocLearningPage] Loading...");
    return <CourseSkeleton />;
  }

  if (error) {
    console.log("❌ [KhoaHocLearningPage] Error:", error);
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
    console.log("⚠️ [KhoaHocLearningPage] Không có dữ liệu khóa học");
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
          <Stack direction="row" spacing={1.5} justifyContent="center">
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

  console.log("✅ [KhoaHocLearningPage] Render với khóa học:", khoaHoc.tieuDe);
  console.log("📚 [KhoaHocLearningPage] Số bài học:", danhSachTatCa.length);

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
                border: `1.5px solid ${
                  sidebarOpen ? PRIMARY_RED : theme.palette.divider
                }`,
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
              <Box
                sx={{
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: alpha(PRIMARY_RED, 0.15),
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: PRIMARY_RED,
                    width: `${phanTramHoanThanh}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {soBaiHoanThanh}/{tongBai}
              </Typography>
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
          {/* Quiz section (thay video khi đang chọn quiz) */}
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
                idDangKyKhoaHoc={khoaHoc.idDangKiKhoaHoc ?? ""}
                canRetake={quizDangChon.choLamLai ?? true}
                onClose={handleCloseQuiz}
              />
            </Box>
          ) : (
            <>
              {/* Video section */}
              <Box ref={videoSectionRef} sx={{ flexShrink: 0 }}>
                {renderVideoArea()}
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
                    variant="outlined"
                    sx={{ p: 2, mt: 2, borderRadius: 2 }}
                  >
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

        {/* Sidebar toggle tab */}
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
          url={baiGiang.urlBaiGiang}
          savedTime={currentSavedTime}
          isCompleted={currentIsCompleted}
          onTimeUpdate={handleTimeUpdateWrapper}
          onEnded={handleVideoEnded}
          onExpand={scrollToVideo}
        />
      )}
    </Box>
  );
}
