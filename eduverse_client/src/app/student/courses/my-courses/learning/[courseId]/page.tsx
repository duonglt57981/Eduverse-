/* eslint-disable react-hooks/preserve-manual-memoization */
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
  Paper,
  Chip,
  LinearProgress,
} from "@mui/material";
import { EduAvatar } from "@/src/components/common/EduAvatar";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  MenuBook as MenuBookIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  VideoLibrary as VideoLibraryIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { VideoPlayer } from "./components/VideoPlayer";
import { MiniPlayer } from "./components/MiniPlayer";
import { StatsBar } from "./components/StatsBar";
import { CourseSkeleton } from "./components/CourseSkeleton";
import { SidebarContent } from "./components/SidebarContent";
import { DanhGiaDialog } from "./components/DanhGiaDialog";

import { useCourseData } from "./hooks/useCourseData";
import { useProgress } from "./hooks/useProgress";
import { useVideoPlayer } from "./hooks/useVideoPlayer";
import { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
import { BaiKiemTraDto } from "@/src/types/baiKiemTra/Dto/baiKiemTraDto";

import DOMPurify from "dompurify";
import { apiService } from "@/src/services";
import { QuizSession } from "./components/quiz/QuizSession";

import { Drawer, Tab, Tabs } from "@mui/material";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import { QnAPanel } from "./components/QnAPanel";

import { useSearchParams } from "next/navigation";

const PRIMARY_RED = BRAND.main;
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

import { parseJwtPayload } from "@/src/utils/jwt";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

function getUserIdFromToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const token = localStorage.getItem("AccessToken");
  if (!token) return undefined;
  try {
    const payload = parseJwtPayload(token);
    if (!payload) return undefined;
    const keys = [
      "sub",
      "id",
      "userId",
      "nameid",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    ];
    for (const key of keys) {
      if (payload[key]) return String(payload[key]);
    }
  } catch {}
  return undefined;
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
  onPlayStateChange?: (isPlaying: boolean) => void;
  autoPlay?: boolean;
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
  onPlayStateChange,
  autoPlay = true,
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
          autoPlay={autoPlay}
          onPlayStateChange={onPlayStateChange}
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
  danhSachGiangVien?: ThongTinGiangVien[];
}

function InstructorInfo({
  thongTinGiangVien,
  danhSachGiangVien,
}: InstructorInfoProps) {
  const list =
    danhSachGiangVien && danhSachGiangVien.length > 0
      ? danhSachGiangVien
      : thongTinGiangVien?.hoTen
        ? [thongTinGiangVien]
        : [];

  if (list.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mt: 4,
        borderRadius: "16px",
        border: `1px solid ${CSSVAR.divider}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        backgroundColor: "background.paper",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 800, mb: 2.5, color: "text.primary" }}
      >
        {list.length > 1 ? "Giảng viên" : "Giảng viên"}
      </Typography>

      <Stack spacing={3}>
        {list.map((gv, idx) => {
          const { hoTen, anhDaiDien, tieuSu, gioiThieu, id, chucVu } = gv;
          const rawBio = tieuSu || gioiThieu || "";
          const cleanBio =
            typeof rawBio === "string"
              ? rawBio.replace(/<[^>]*>/g, "").trim()
              : "";
          const bioHtml =
            cleanBio.length > 0
              ? rawBio
              : "Giảng viên chính thức tại hệ thống EduVerse, chuyên nghiên cứu và chia sẻ kiến thức chuyên môn chất lượng cao.";
          const handleClick = () => {
            if (id) window.location.href = `/instructor/profile/${id}`;
          };

          return (
            <Box
              key={id ?? idx}
              sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}
            >
              <EduAvatar
                src={anhDaiDien}
                name={hoTen}
                size={72}
                onClick={handleClick}
                sx={{
                  cursor: id ? "pointer" : "default",
                  "&:hover": id ? { transform: "scale(1.05)" } : {},
                }}
              />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: CSSVAR.textPrimary,
                    cursor: id ? "pointer" : "default",
                    "&:hover": id
                      ? { color: PRIMARY_RED, textDecoration: "underline" }
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
                      sx={{ fontSize: 18, color: PRIMARY_RED, opacity: 0.6 }}
                    />
                  )}
                </Typography>

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

                {bioHtml && (
                  <Box
                    sx={{
                      mt: 1.5,
                      fontSize: "0.875rem",
                      lineHeight: 1.8,
                      color: "text.secondary",
                      "& p": { margin: "0 0 0.75em 0" },
                      "& a": {
                        color: PRIMARY_RED,
                        textDecoration: "underline",
                      },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(bioHtml),
                    }}
                  />
                )}

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
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function KhoaHocLearningPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams();
  const pathname = usePathname();
  const courseId = (params?.courseId || params?.id) as string | undefined;

  const searchParams = useSearchParams();

  const role = pathname.split("/")[1] || "student";
  const dashboardPath = `/${role}/dashboard`;

  const [qnaDrawerBaiGiang, setQnaDrawerBaiGiang] =
    useState<BaiGiangType | null>(null);
  const [tabDuoiVideo, setTabDuoiVideo] = useState(0);

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isVideoPlayingRef = useRef(false);
  const isMiniDismissedRef = useRef(false);

  const [quizDangChon, setQuizDangChon] = useState<BaiKiemTraDto | null>(null);
  const [isVideoFullMounted, setIsVideoFullMounted] = useState(true);
  const [currentSavedTime, setCurrentSavedTime] = useState<number | undefined>(
    undefined,
  );

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [showDanhGia, setShowDanhGia] = useState(false);
  const [daDanhGia, setDaDanhGia] = useState(false);

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

  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    isVideoPlayingRef.current = isPlaying;
    setIsVideoPlaying(isPlaying);
    if (isPlaying) {
      isMiniDismissedRef.current = false;
    }
  }, []);

  const handleCloseMini = useCallback(() => {
    isMiniDismissedRef.current = true;
    isVideoPlayingRef.current = false;
    setIsVideoPlaying(false);
    setShowMini(false);
    setIsVideoFullMounted(true);
    updateCurrentSavedTime();
  }, [updateCurrentSavedTime]);

  // ── Lấy thông tin giảng viên từ khoaHoc ──
  const thongTinGiangVien = useMemo(() => {
    if (!khoaHoc) return null;
    return (
      ((khoaHoc as any).thongTinGiangVien as ThongTinGiangVien | undefined) ||
      null
    );
  }, [khoaHoc]);

  const danhSachGiangVien = useMemo(() => {
    if (!khoaHoc) return [];
    return (
      ((khoaHoc as any).danhSachGiangVien as ThongTinGiangVien[] | undefined) ??
      []
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

  useEffect(() => {
    if (!khoaHoc || danhSachTatCa.length === 0) return;

    const tab = searchParams.get("tab");
    if (tab !== "qna") return;

    const idBaiGiangParam = searchParams.get("idBaiGiang");

    if (idBaiGiangParam) {
      // Câu hỏi gắn với 1 bài giảng cụ thể → mở Drawer Q&A đúng bài đó
      const bg = danhSachTatCa.find((b) => b.id === idBaiGiangParam);
      if (bg) setQnaDrawerBaiGiang(bg);
    } else {
      // Câu hỏi chung → chuyển sang tab Q&A tổng dưới video
      setTabDuoiVideo(1);
    }
  }, [khoaHoc, danhSachTatCa, searchParams]);

  useEffect(() => {
    if (!khoaHoc?.id) return;

    (async () => {
      try {
        const res = await apiService.get(`/danhgia/kiem-tra/${khoaHoc.id}`);
        setDaDanhGia((res.data as { daDanhGia?: boolean })?.daDanhGia ?? false);
      } catch {}
    })();
  }, [khoaHoc?.id]);

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
      const isPastVideo = rect.bottom < HEADER_H;

      if (!isPastVideo) {
        isMiniDismissedRef.current = false;
        if (showMini) {
          setIsVideoFullMounted(true);
          setShowMini(false);
          updateCurrentSavedTime();
        }
        return;
      }

      // Chỉ hiển thị mini nếu video ĐANG PHÁT và chưa bị người dùng đóng
      const shouldShow =
        isPastVideo && isVideoPlayingRef.current && !isMiniDismissedRef.current;

      if (shouldShow && !showMini) {
        const currentTime = currentTimeRef.current;
        lastSavedTimeRef.current = currentTime;
        setCurrentSavedTime(currentTime);
        setIsVideoFullMounted(false);
        setShowMini(true);
      } else if (!shouldShow && showMini && !isPastVideo) {
        setIsVideoFullMounted(true);
        setShowMini(false);
        updateCurrentSavedTime();
      }
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
  const khoaHocId = khoaHoc?.id;

  const handleTimeUpdateWrapper = useCallback(
    (ct: number) => {
      handleTimeUpdate(ct, (id, time) => {
        if (khoaHocId) {
          sendProgress(id, time, khoaHocId);
        }
      });
    },
    [handleTimeUpdate, sendProgress, khoaHocId],
  );
  const handleVideoEnded = useCallback(async () => {
    if (!baiGiang?.id || !khoaHoc?.id) return;
    const thoiLuong = baiGiang.thoiLuong ?? 0;
    await sendProgress(baiGiang.id, thoiLuong, khoaHoc.id);
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
    khoaHoc?.id,
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
      isMiniDismissedRef.current = false;
      isVideoPlayingRef.current = true;
      setIsVideoPlaying(true);
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
      isMiniDismissedRef.current = false;
      isVideoPlayingRef.current = true;
      setIsVideoPlaying(true);
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

  // 🆕 Hàm tìm bài giảng kế tiếp sau một quiz
  const findNextLessonAfterQuiz = useCallback(
    (quizId: string): BaiGiangType | null => {
      const phanHocs = getPhanHocApi();
      let found = false;
      for (const phan of phanHocs) {
        const lessons = phan.danhSachBaiGiang ?? [];
        const quizzes = phan.danhSachBaiKiemTra ?? [];

        // Duyệt tuần tự: các bài giảng trước quiz trong cùng phần, sau đó quiz, rồi bài giảng sau quiz
        for (const item of [...lessons, ...quizzes]) {
          if (found && "urlBaiGiang" in item) {
            return item as BaiGiangType; // gặp bài giảng đầu tiên sau quiz
          }
          if (item.id === quizId) {
            found = true;
          }
        }

        // Nếu tìm thấy quiz ở phần này nhưng không có bài giảng tiếp theo, chuyển sang phần sau
        if (found) {
          // Tìm phần tiếp theo có bài giảng
          const nextPhan = phanHocs
            .slice(phanHocs.indexOf(phan) + 1)
            .find((p) => (p.danhSachBaiGiang?.length ?? 0) > 0);
          if (nextPhan && nextPhan.danhSachBaiGiang?.length) {
            return nextPhan.danhSachBaiGiang[0];
          }
          return null;
        }
      }
      return null;
    },
    [getPhanHocApi],
  );

  // 🆕 Hàm xử lý bỏ qua quiz
  const handleSkipQuiz = useCallback(() => {
    if (!quizDangChon) return;
    const nextLesson = findNextLessonAfterQuiz(quizDangChon.id!);
    if (nextLesson) {
      handleSelectBaiGiang(nextLesson);
    }
    // Đóng quiz
    handleCloseQuiz();
  }, [
    quizDangChon,
    handleSelectBaiGiang,
    handleCloseQuiz,
    findNextLessonAfterQuiz,
  ]);

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
        bgcolor: CSSVAR.bg,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${CSSVAR.divider}`,
          bgcolor: CSSVAR.paper,
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
                border: `1px solid ${sidebarOpen ? PRIMARY_RED : CSSVAR.divider}`,
                bgcolor: sidebarOpen ? alpha(PRIMARY_RED, 0.05) : "transparent",
                borderRadius: "10px",
                p: 1,
              }}
            >
              <MenuBookIcon
                sx={{
                  color: sidebarOpen ? PRIMARY_RED : CSSVAR.textSecondary,
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
                color: CSSVAR.textPrimary,
              }}
            >
              {khoaHoc.tieuDe}
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
            {!daDanhGia && tongBai > 0 && (
              <Button
                size="small"
                startIcon={<StarIcon />}
                onClick={() => setShowDanhGia(true)}
              >
                Đánh giá
              </Button>
            )}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                display: { xs: "none", sm: "flex" },
                bgcolor: CSSVAR.bg,
                border: `1px solid ${CSSVAR.divider}`,
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
                    backgroundColor: CSSVAR.divider,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: PRIMARY_RED,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: CSSVAR.textSecondary,
                  fontSize: "12px",
                }}
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
              <QuizSession
                idBaiKiemTra={quizDangChon.id!}
                idDangKyKhoaHoc={courseId ?? ""}
                userId={getUserIdFromToken()}
                onClose={handleCloseQuiz}
                onSkip={handleSkipQuiz} // 🆕 Truyền hàm skip
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
                  onPlayStateChange={handlePlayStateChange}
                  autoPlay={isVideoPlaying}
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
                      sx={{
                        fontWeight: 600,
                        color: CSSVAR.textSecondary,
                      }}
                    >
                      {(
                        khoaHoc.danhSachPhanHoc as unknown as PhanHocApi[]
                      )?.find((p) => p.id === idPhanPlay)?.tenPhan ?? ""}
                    </Typography>
                    <ChevronRightIcon
                      sx={{
                        fontSize: 16,
                        color: CSSVAR.textMuted,
                      }}
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
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        mb: 1.5,
                        color: CSSVAR.textPrimary,
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
                          sx={{
                            fontWeight: 600,
                            color: CSSVAR.textSecondary,
                          }}
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

                {/* ── Tabs bên dưới video ─────────────────────────────────── */}
                <Box sx={{ mt: 4 }}>
                  <Tabs
                    value={tabDuoiVideo}
                    onChange={(_, v) => setTabDuoiVideo(v)}
                    sx={{
                      borderBottom: `1px solid ${CSSVAR.divider}`,
                      mb: 3,
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 14,
                        color: CSSVAR.textSecondary,
                        minHeight: 44,
                        px: 0,
                        mr: 4,
                      },
                      "& .Mui-selected": { color: `${PRIMARY_RED} !important` },
                      "& .MuiTabs-indicator": { backgroundColor: PRIMARY_RED },
                    }}
                  >
                    <Tab label="Mô tả" />
                    <Tab
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <QuestionAnswerOutlinedIcon sx={{ fontSize: 16 }} />
                          Hỏi đáp
                        </Box>
                      }
                    />
                  </Tabs>

                  {/* Tab 0 — Mô tả */}
                  {tabDuoiVideo === 0 && (
                    <>
                      {khoaHoc.moTa && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 2.5, md: 4 },
                            borderRadius: "16px",
                            border: `1px solid ${CSSVAR.divider}`,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                            backgroundColor: "background.paper",
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              mb: 1.5,
                              color: "text.primary",
                            }}
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
                    </>
                  )}

                  {/* Tab 1 — Q&A tổng */}
                  {tabDuoiVideo === 1 && courseId && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2.5, md: 3 },
                        borderRadius: "16px",
                        border: `1px solid ${CSSVAR.divider}`,
                        minHeight: 500,
                      }}
                    >
                      <QnAPanel
                        idKhoaHoc={khoaHoc.id}
                        idBaiGiang={null}
                        laGiangVien={false}
                        idCauHoiCanMo={
                          searchParams.get("tab") === "qna"
                            ? searchParams.get("idCauHoi")
                            : null
                        }
                      />
                    </Paper>
                  )}
                </Box>

                {/* Thông tin giảng viên */}
                <InstructorInfo
                  thongTinGiangVien={thongTinGiangVien}
                  danhSachGiangVien={danhSachGiangVien}
                />
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
              onOpenQnA={(bg) => setQnaDrawerBaiGiang(bg)}
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
              onOpenQnA={(bg) => setQnaDrawerBaiGiang(bg)}
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
          onClose={handleCloseMini}
          onPlayStateChange={handlePlayStateChange}
          autoPlay={true}
          onUnmount={handleMiniUnmount}
        />
      )}
      <Drawer
        anchor="right"
        open={!!qnaDrawerBaiGiang}
        onClose={() => setQnaDrawerBaiGiang(null)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "92%", sm: 480 },
            p: 3,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {qnaDrawerBaiGiang && courseId && (
          <>
            {/* Header drawer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                pb: 1.75,
                borderBottom: `1px solid ${CSSVAR.divider}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "rgba(139,19,19,0.08)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <QuestionAnswerOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 16, color: CSSVAR.textPrimary, lineHeight: 1.25 }}
                  >
                    Hỏi đáp bài giảng
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: CSSVAR.textMuted,
                      mt: 0.25,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: { xs: 240, sm: 340 },
                    }}
                  >
                    {qnaDrawerBaiGiang.tieuDe}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={() => setQnaDrawerBaiGiang(null)}
                sx={{
                  color: "text.secondary",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Panel Q&A */}
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <QnAPanel
                idKhoaHoc={khoaHoc.id}
                idBaiGiang={qnaDrawerBaiGiang.id}
                tenBaiGiang={qnaDrawerBaiGiang.tieuDe}
                laGiangVien={false}
                idCauHoiCanMo={
                  searchParams.get("tab") === "qna"
                    ? searchParams.get("idCauHoi")
                    : null
                }
              />
            </Box>
          </>
        )}
      </Drawer>
      <DanhGiaDialog
        open={showDanhGia}
        onClose={() => setShowDanhGia(false)}
        idKhoaHoc={khoaHoc.id}
        tenKhoaHoc={khoaHoc.tieuDe}
        onSuccess={() => {
          setDaDanhGia(true);
        }}
      />
    </Box>
  );
}
