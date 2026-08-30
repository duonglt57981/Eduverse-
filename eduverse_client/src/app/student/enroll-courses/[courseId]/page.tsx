/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BRAND, CSSVAR } from "@/src/theme/tokens";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "@/src/store/hook";
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Alert,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  CircularProgress,
  Snackbar,
  alpha,
  IconButton,
  TextField,
  Fade,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import AllInclusiveRoundedIcon from "@mui/icons-material/AllInclusiveRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import DangKiService from "@/src/services/DangKiService";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, GiangVienKhoaHocDto } from "@/src/types/khoaHoc/Dto/dto";
import { apiService } from "@/src/services/index";
import danhGiaService, {
  DanhGiaKhoaHocDto,
} from "@/src/services/DanhGiaService";

// ─── constants & animations ───────────────────────────────────────────────────

const RED = BRAND.main;
const RED_DARK = "#7f1d1d";
const RED_LIGHT = "#fef2f2";
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const GIANG_VIEN_COURSES_PAGE_SIZE = 3;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5);
  }
  70% {
    box-shadow: 0 0 0 16px rgba(220, 38, 38, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
`;

// ─── styled components ────────────────────────────────────────────────────────

const HeroBanner = styled(Box)(() => ({
  background:
    "linear-gradient(135deg, #191b1f 0%, #111215 55%, #1f0a0a 100%)",
  borderRadius: 24,
  padding: "2rem 2.25rem",
  marginBottom: "1.5rem",
  position: "relative",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-30%",
    right: "-10%",
    width: "450px",
    height: "450px",
    background: `radial-gradient(circle, ${alpha(RED, 0.32)} 0%, transparent 70%)`,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: "-20%",
    left: "10%",
    width: "250px",
    height: "250px",
    background: `radial-gradient(circle, ${alpha(RED, 0.1)} 0%, transparent 70%)`,
    pointerEvents: "none",
  },
}));

const SidebarCard = styled(Paper)(() => ({
  borderRadius: 24,
  border: "1px solid rgba(141, 19, 19, 0.12)",
  boxShadow: "0 20px 45px -10px rgba(141, 19, 19, 0.12), 0 10px 25px rgba(0, 0, 0, 0.04)",
  overflow: "hidden",
  position: "sticky",
  top: 24,
  backgroundColor: "#ffffff",
  transition: "box-shadow 0.3s ease",
}));

const ThumbBox = styled(Box)<{ bgimg?: string }>(({ bgimg }) => ({
  position: "relative",
  paddingTop: "56.25%",
  background: bgimg
    ? `#141517 url(${bgimg}) center/cover no-repeat`
    : "linear-gradient(135deg, #24272c, #16181b)",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)",
  },
}));

const SectionCard = styled(Paper)(() => ({
  borderRadius: 22,
  border: "1px solid rgba(0, 0, 0, 0.07)",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.03)",
  padding: "2rem",
  backgroundColor: "#ffffff",
  transition: "box-shadow 0.25s ease",
}));

const LessonRow = styled(Box)<{ clickable?: number }>(({ clickable }) => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 12px",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
  fontSize: 13.5,
  borderRadius: 12,
  cursor: clickable ? "pointer" : "default",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:last-child": { borderBottom: "none" },
  "&:hover": clickable
    ? {
        backgroundColor: RED_LIGHT,
        transform: "translateX(4px)",
      }
    : undefined,
}));

const PlayBadge = styled(Box)(() => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "all 0.2s ease",
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatTongThoiLuong(totalSeconds?: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "0 giờ";
  const hours = totalSeconds / 3600;
  return `${hours.toFixed(1)} giờ`;
}

function formatLessonDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function extractKhoaHoc(res: any): any | null {
  if (!res) return null;
  const candidates = [res, res.data, res.data?.data, res.data?.data?.data];
  for (const c of candidates) {
    if (c && typeof c === "object" && "id" in c && "tieuDe" in c) {
      return c;
    }
  }
  return null;
}

function findFirstFreeVideo(
  khoaHoc: any,
): { url: string; title: string } | null {
  const phanHocs = khoaHoc?.danhSachPhanHoc ?? [];
  for (const phan of phanHocs) {
    const baiGiangs = phan.danhSachBaiGiang ?? [];
    for (const bg of baiGiangs) {
      if (bg.laBaiGiangFree && bg.urlBaiGiang) {
        return { url: String(bg.urlBaiGiang), title: bg.tieuDe };
      }
    }
  }
  return null;
}

function isValidGuid(id?: string | null): id is string {
  return !!id && id !== EMPTY_GUID;
}

function getGiangVienId(khoaHoc: any): string | null {
  const id = khoaHoc?.createdId || khoaHoc?.giangVien?.id;
  return typeof id === "string" && isValidGuid(id) ? id : null;
}

function extractPagedItems(paged: any): any[] {
  if (!paged) return [];
  if (Array.isArray(paged)) return paged;
  const candidates = [paged.items, paged.data, paged.list, paged.results];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function getPagedTotalCount(paged: any, fallback: number): number {
  return (
    paged?.totalCount ??
    paged?.totalItems ??
    paged?.total ??
    paged?.totalRecords ??
    fallback
  );
}

// ─── inner content ──────────────────────────────────────────────────────────────

function CourseRegistrationContent() {
  const [danhGia, setDanhGia] = useState<DanhGiaKhoaHocDto | null>(null);
  const [loadingDanhGia, setLoadingDanhGia] = useState(false);
  const [daDanhGia, setDaDanhGia] = useState(false);
  const [daMua, setDaMua] = useState(false);
  const [formDanhGia, setFormDanhGia] = useState({ soSao: 5, noiDung: "" });
  const [submittingDanhGia, setSubmittingDanhGia] = useState(false);
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params?.courseId ?? "";
  const user = useSelector((s) => s.auth.user);

  const checkAuth = (): boolean => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AccessToken")
        : null;
    if (!user && !token) {
      router.push(`/auth/login?redirect=/student/enroll-courses/${courseId}`);
      return false;
    }
    return true;
  };

  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [idDangKi, setIdDangKi] = useState<string | null>(null);
  const [navigatingToLearn, setNavigatingToLearn] = useState(false);

  const [khoaHoc, setKhoaHoc] = useState<KhoaHocType | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Video preview player
  const [videoPlayer, setVideoPlayer] = useState<{
    open: boolean;
    url: string | null;
    title: string;
  }>({ open: false, url: null, title: "" });
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const [giangVienInfo, setGiangVienInfo] = useState<{
    ten: string;
    avatar?: string;
    moTa?: string;
    chucDanh?: string;
    tongKhoaHoc?: number;
    tongHocVien?: number;
  } | null>(null);
  const [giangVienKhoaHocs, setGiangVienKhoaHocs] = useState<any[]>([]);
  const [loadingGiangVien, setLoadingGiangVien] = useState(false);
  const [bioExpandedMap, setBioExpandedMap] = useState<Record<string, boolean>>(
    {},
  );

  const dangKiService = new DangKiService();
  const khoaHocService = new KhoaHocService();

  const loadKhoaHoc = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!courseId) return null;

      if (!opts?.silent) {
        setPageLoading(true);
        setPageError(null);
      }

      try {
        const res = await khoaHocService.GetKhoaHocPreview(courseId);
        const course = extractKhoaHoc(res);

        if (course) {
          setKhoaHoc(course);
          const isEnrolled = !!course.daDangKy;
          setEnrolled(isEnrolled);

          let idDangKiFromRes: string | null = null;
          if (res?.data?.idDangKiKhoaHoc) {
            idDangKiFromRes = res.data.idDangKiKhoaHoc;
          } else if (course.idDangKi) {
            idDangKiFromRes = course.idDangKi;
          }

          if (isEnrolled && idDangKiFromRes) {
            setIdDangKi(idDangKiFromRes);
            localStorage.setItem(`enrolled_${courseId}`, idDangKiFromRes);
          } else if (isEnrolled && !idDangKiFromRes) {
            const savedId = localStorage.getItem(`enrolled_${courseId}`);
            if (savedId) setIdDangKi(savedId);
          }

          return { course, idDangKi: idDangKiFromRes, isEnrolled };
        }

        if (!opts?.silent) {
          const errMsg =
            res?.message ||
            (Array.isArray(res?.errors)
              ? res.errors.join(", ")
              : res?.errors) ||
            "Không tìm thấy khóa học.";
          setPageError(String(errMsg));
        }
        return null;
      } catch {
        if (!opts?.silent) {
          setPageError("Không tải được thông tin khóa học. Vui lòng thử lại.");
        }
        return null;
      } finally {
        if (!opts?.silent) setPageLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courseId],
  );

  const loadDanhGia = useCallback(async () => {
    if (!courseId) return;
    setLoadingDanhGia(true);
    try {
      const data = await danhGiaService.GetByKhoaHoc(courseId);
      setDanhGia(data);
    } catch {
      setDanhGia(null);
    } finally {
      setLoadingDanhGia(false);
    }
  }, [courseId]);

  const loadKiemTraDanhGia = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await apiService.get<{ daDanhGia: boolean; daMua: boolean }>(
        `/danhgia/kiem-tra/${courseId}`,
      );
      setDaDanhGia(res.data?.daDanhGia ?? false);
      setDaMua(res.data?.daMua ?? false);
    } catch {
      // ignore
    }
  }, [courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKhoaHoc();
  }, [loadKhoaHoc]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDanhGia();
  }, [loadDanhGia]);

  useEffect(() => {
    if (tab !== 2) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadKiemTraDanhGia();
  }, [tab, loadKiemTraDanhGia]);

  useEffect(() => {
    if (!khoaHoc) return;

    const giangVienId = getGiangVienId(khoaHoc);
    if (!giangVienId) return;

    let cancelled = false;

    (async () => {
      setLoadingGiangVien(true);
      try {
        const res = await apiService.get<GiangVienKhoaHocDto>(
          `/KhoaHoc/khoahoc-list-bygiangvien/${giangVienId}`,
          {
            params: {
              pageIndex: 1,
              pageSize: GIANG_VIEN_COURSES_PAGE_SIZE,
            },
          },
        );
        if (cancelled) return;

        const dto = res?.data;
        const list = extractPagedItems(dto?.khoaHocs)
          .filter((kh: any) => kh?.id !== khoaHoc.id)
          .slice(0, GIANG_VIEN_COURSES_PAGE_SIZE);
        setGiangVienKhoaHocs(list);

        const gv = dto?.thongTinGiangVien;
        setGiangVienInfo({
          ten: gv?.hoTen || String(khoaHoc.createdBy || "Không xác định"),
          avatar: gv?.anhDaiDien,
          moTa: gv?.gioiThieu || gv?.tieuSu,
          chucDanh: gv?.chucVu,
          tongKhoaHoc: getPagedTotalCount(dto?.khoaHocs, list.length + 1),
          tongHocVien: dto?.tongHocVienDangKy ?? dto?.tongHocVienDangHoc,
        });
      } catch (err) {
        console.error("Error getting course list by giang vien:", err);
        if (!cancelled) {
          setGiangVienKhoaHocs([]);
          setGiangVienInfo({
            ten: String(khoaHoc.createdBy || "Không xác định"),
          });
        }
      } finally {
        if (!cancelled) setLoadingGiangVien(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [khoaHoc]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await dangKiService.DangKiKhoaHocMienPhi(courseId);
      let id: string | null = res?.data?.idDangKi ?? null;
      const synced = await loadKhoaHoc({ silent: true });
      if (!id) id = synced?.idDangKi ?? null;

      if (id) {
        setIdDangKi(id);
        localStorage.setItem(`enrolled_${courseId}`, id);
      }

      setModalOpen(false);
      setEnrolled(true);
      setSnackbar({
        open: true,
        message: "Đăng ký thành công! Chúc bạn học tốt.",
        severity: "success",
      });
    } catch (error: any) {
      setModalOpen(false);
      const msg = error?.response?.data?.message || error?.message || "";
      if (msg.includes("đã đăng ký") || msg.includes("already registered")) {
        setEnrolled(true);

        let idFromError: string | null =
          error?.response?.data?.idDangKi || error?.response?.data?.id || null;

        if (!idFromError) {
          const synced = await loadKhoaHoc({ silent: true });
          idFromError = synced?.idDangKi ?? null;
        }

        if (idFromError) {
          setIdDangKi(idFromError);
          localStorage.setItem(`enrolled_${courseId}`, idFromError);
        }

        setSnackbar({
          open: true,
          message: "Bạn đã đăng ký khóa học này rồi.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: msg || "Đăng ký thất bại. Vui lòng thử lại.",
          severity: "error",
        });
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmitDanhGia = async () => {
    if (!courseId) return;
    setSubmittingDanhGia(true);
    try {
      await apiService.post("/danhgia", {
        idKhoaHoc: courseId,
        soSao: formDanhGia.soSao,
        noiDung: formDanhGia.noiDung,
      });
      setSnackbar({
        open: true,
        message: "Cảm ơn bạn đã đánh giá!",
        severity: "success",
      });
      setDaDanhGia(true);
      await loadDanhGia();
    } catch (e: any) {
      setSnackbar({
        open: true,
        message: e?.message ?? "Có lỗi xảy ra",
        severity: "error",
      });
    } finally {
      setSubmittingDanhGia(false);
    }
  };

  const handleGoToLearning = async () => {
    if (isValidGuid(idDangKi)) {
      router.push(`/student/courses/my-courses/learning/${idDangKi}`);
      return;
    }

    setNavigatingToLearn(true);
    try {
      const synced = await loadKhoaHoc({ silent: true });
      const freshId = synced?.idDangKi;

      if (isValidGuid(freshId)) {
        router.push(`/student/courses/my-courses/learning/${freshId}`);
      } else {
        setSnackbar({
          open: true,
          message:
            "Không tìm thấy dữ liệu đăng ký. Vui lòng thử lại sau ít phút.",
          severity: "error",
        });
      }
    } finally {
      setNavigatingToLearn(false);
    }
  };

  const handleOpenVideo = (bg: any) => {
    if (!bg.laBaiGiangFree || !bg.urlBaiGiang) return;
    setVideoPlayer({
      open: true,
      url: String(bg.urlBaiGiang),
      title: bg.tieuDe,
    });
    setIsVideoLoading(true);
  };

  const handleOpenPreviewVideo = (preview: { url: string; title: string }) => {
    setVideoPlayer({
      open: true,
      url: String(preview.url),
      title: preview.title,
    });
    setIsVideoLoading(true);
  };

  const handleCloseVideo = () => {
    setVideoPlayer({ open: false, url: null, title: "" });
    setIsVideoLoading(true);
  };

  const previewVideo = findFirstFreeVideo(khoaHoc);

  if (pageLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 14,
        }}
      >
        <CircularProgress sx={{ color: RED }} size={42} thickness={4.5} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.secondary" }}>
          Đang tải thông tin khóa học...
        </Typography>
      </Box>
    );
  }

  if (pageError || !khoaHoc) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3, p: 2 }}>
        {pageError ?? "Không tìm thấy khóa học."}
      </Alert>
    );
  }

  const phanHocs = khoaHoc.danhSachPhanHoc ?? [];
  const gia = khoaHoc.gia ?? khoaHoc.giaGoc ?? 0;
  const isFree =
    khoaHoc.loaiKhoaHoc !== "Khóa học trả phí" &&
    (!khoaHoc.gia || khoaHoc.gia <= 0);

  const danhSachGiangVienDetail: {
    id?: string;
    hoTen: string;
    anhDaiDien?: string;
    tieuSu?: string;
  }[] =
    (khoaHoc as any).danhSachGiangVien &&
    (khoaHoc as any).danhSachGiangVien.length > 0
      ? (khoaHoc as any).danhSachGiangVien
      : [
          {
            id: getGiangVienId(khoaHoc) ?? undefined,
            hoTen: khoaHoc.createdBy || "Không xác định",
          },
        ];

  const giangVienId = getGiangVienId(khoaHoc);
  const giangVienChinh = danhSachGiangVienDetail[0];
  const tenGiangVienChinh =
    giangVienInfo?.ten || giangVienChinh?.hoTen || "Không xác định";

  const goToInstructorProfile = (id?: string) => {
    if (id) router.push(`/instructor/profile/${id}`);
  };

  return (
    <Box>
      <Grid container spacing={3.5}>
        {/* ── Main column ── */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <HeroBanner>
            {/* Header badges */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2, flexWrap: "wrap", rowGap: 1 }}
            >
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
                label={khoaHoc.loaiKhoaHoc ?? "KHÓA HỌC"}
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 11.5,
                  letterSpacing: 0.5,
                  px: 0.75,
                  py: 0.25,
                  boxShadow: `0 4px 12px ${alpha(RED, 0.4)}`,
                }}
              />
              {khoaHoc.capDo && (
                <Chip
                  label={khoaHoc.capDo}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontSize: 11.5,
                    fontWeight: 600,
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
              )}
            </Stack>

            {/* Course Title */}
            <Typography
              variant="h4"
              sx={{
                color: "#ffffff",
                fontWeight: 800,
                mb: 1.75,
                lineHeight: 1.3,
                fontSize: { xs: 22, sm: 26, md: 30 },
                letterSpacing: "-0.01em",
              }}
            >
              {khoaHoc.tieuDe}
            </Typography>

            {/* Brief Description */}
            <Box
              sx={{
                color: "rgba(255, 255, 255, 0.78)",
                fontSize: 14,
                mb: 3,
                lineHeight: 1.8,
                maxWidth: 620,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                "& img": { maxWidth: "100%" },
                "& ul, & ol": { pl: 2 },
                "& p": { mb: 0.5 },
              }}
              dangerouslySetInnerHTML={{ __html: khoaHoc.moTa || "" }}
            />

            {/* Instructors Row */}
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ alignItems: "center", mb: 2.25, flexWrap: "wrap", rowGap: 1 }}
            >
              <Typography sx={{ color: "rgba(255, 255, 255, 0.65)", fontSize: 13.5, fontWeight: 500 }}>
                Giảng viên:
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center", flexWrap: "wrap" }}
              >
                {(khoaHoc.danhSachGiangVien ?? []).map((gv) => (
                  <Tooltip key={gv.id} title={`Xem hồ sơ: ${gv.hoTen}`} arrow>
                    <Chip
                      avatar={
                        <Avatar
                          src={gv.anhDaiDien}
                          sx={{
                            width: "24px !important",
                            height: "24px !important",
                            bgcolor: RED,
                            fontSize: "11px !important",
                            fontWeight: 700,
                          }}
                        >
                          {gv.hoTen.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={gv.hoTen}
                      size="small"
                      onClick={() => router.push(`/instructor/profile/${gv.id}`)}
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.12)",
                        color: "#fff",
                        fontSize: 12.5,
                        fontWeight: 650,
                        cursor: "pointer",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        backdropFilter: "blur(6px)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: alpha(RED, 0.85),
                          borderColor: RED,
                          transform: "translateY(-1px)",
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Stack>

            {/* Ratings & Enrolled Count */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              {danhGia && danhGia.tongSoDanhGia > 0 ? (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    alignItems: "center",
                    bgcolor: "rgba(234, 179, 8, 0.15)",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  <Rating
                    value={danhGia.diemTrungBinh}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{
                      "& .MuiRating-iconFilled": { color: "#facc15" },
                      "& .MuiRating-iconEmpty": {
                        color: "rgba(255,255,255,0.2)",
                      },
                    }}
                  />
                  <Typography
                    sx={{ color: "#fef08a", fontSize: 13, fontWeight: 800 }}
                  >
                    {danhGia.diemTrungBinh.toFixed(1)}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.65)", fontSize: 12 }}>
                    ({danhGia.tongSoDanhGia} đánh giá)
                  </Typography>
                </Stack>
              ) : (
                <Chip
                  label="Khóa học mới"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: 12,
                  }}
                />
              )}

              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.5,
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <PeopleAltRoundedIcon sx={{ fontSize: 15, color: "rgba(255, 255, 255, 0.7)" }} />
                <Typography sx={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>
                  {(khoaHoc.soLuongHocVien ?? 0).toLocaleString("vi-VN")} học viên
                </Typography>
              </Stack>
            </Stack>

            {/* Quick Pills */}
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1 }}>
              {[
                {
                  icon: <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />,
                  label: formatTongThoiLuong(khoaHoc.tongThoiLuong),
                },
                {
                  icon: <MenuBookRoundedIcon sx={{ fontSize: 15 }} />,
                  label: `${khoaHoc.tongBaiGiang ?? 0} bài học`,
                },
                {
                  icon: <FolderRoundedIcon sx={{ fontSize: 15 }} />,
                  label: `${khoaHoc.tongTaiLieu ?? 0} tài liệu`,
                },
              ].map((item, i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing={0.85}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    px: 1.75,
                    py: 0.75,
                    color: "rgba(255, 255, 255, 0.9)",
                    alignItems: "center",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Box sx={{ color: RED }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </HeroBanner>

          {/* Modern Tabs */}
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 3,
              minHeight: 48,
              bgcolor: "background.paper",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "16px",
              p: 0.75,
              width: "fit-content",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: 14,
                minHeight: 38,
                borderRadius: "12px",
                color: "text.secondary",
                px: 2.75,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              "& .Mui-selected": {
                color: "#fff !important",
                background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
                boxShadow: `0 4px 12px ${alpha(RED, 0.3)}`,
              },
            }}
          >
            <Tab label="Tổng quan" disableRipple />
            <Tab label={`Nội dung (${phanHocs.length})`} disableRipple />
            <Tab label={`Đánh giá ${danhGia?.tongSoDanhGia ? `(${danhGia.tongSoDanhGia})` : ""}`} disableRipple />
          </Tabs>

          <Fade in key={tab} timeout={250}>
            <Box>
              {/* TAB 0: TỔNG QUAN */}
              {tab === 0 && (
                <SectionCard>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: "text.primary", mb: 2.5 }}>
                    Mô tả khóa học
                  </Typography>
                  <Box
                    sx={{
                      fontSize: 14.5,
                      color: "text.secondary",
                      lineHeight: 1.9,
                      mb: 4,
                      "& img": { maxWidth: "100%", borderRadius: "12px" },
                      "& ul, & ol": { pl: 2.5, mb: 1.5 },
                      "& li": { mb: 0.5 },
                      "& p": { mb: 1.5 },
                      "& strong": { color: "text.primary" },
                    }}
                    dangerouslySetInnerHTML={{ __html: khoaHoc.moTa || "Chưa có mô tả chi tiết." }}
                  />

                  <Divider sx={{ mb: 3.5, borderColor: "divider" }} />

                  {/* Highlights Grid */}
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: "text.primary", mb: 2 }}>
                    Cấu trúc tổng quan
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      {
                        icon: <MenuBookRoundedIcon sx={{ fontSize: 24, color: RED }} />,
                        title: `${phanHocs.length} Chương / Phần học`,
                        subtitle: "Lộ trình học theo chuyên đề rõ ràng",
                      },
                      {
                        icon: <PlayArrowRoundedIcon sx={{ fontSize: 24, color: RED }} />,
                        title: `${khoaHoc.tongBaiGiang ?? 0} Bài giảng video`,
                        subtitle: "Nội dung thực chiến, cô đọng",
                      },
                      {
                        icon: <FolderRoundedIcon sx={{ fontSize: 24, color: RED }} />,
                        title: `${khoaHoc.tongTaiLieu ?? 0} Tài liệu đính kèm`,
                        subtitle: "Mã nguồn, slide và bài tập mẫu",
                      },
                    ].map((item, i) => (
                      <Grid key={i} size={{ xs: 12, sm: 4 }}>
                        <Box
                          sx={{
                            p: 2.25,
                            bgcolor: RED_LIGHT,
                            borderRadius: "16px",
                            border: `1px solid ${alpha(RED, 0.12)}`,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: "12px",
                              bgcolor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary", mt: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                            {item.subtitle}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>
              )}

              {/* TAB 1: NỘI DUNG KHÓA HỌC */}
              {tab === 1 && (
                <Stack spacing={2}>
                  {phanHocs.length === 0 ? (
                    <SectionCard>
                      <Typography sx={{ fontSize: 14, color: "text.secondary", textAlign: "center", py: 4 }}>
                        Khóa học hiện chưa có nội dung bài giảng.
                      </Typography>
                    </SectionCard>
                  ) : (
                    phanHocs.map((phan: any, i: number) => {
                      const baiGiangs = phan.danhSachBaiGiang ?? [];
                      const sectionDuration = baiGiangs.reduce(
                        (acc: number, curr: any) => acc + (curr.thoiLuong ?? 0),
                        0,
                      );

                      return (
                        <Accordion
                          key={phan.id ?? i}
                          defaultExpanded={i === 0}
                          elevation={0}
                          sx={{
                            borderRadius: "18px !important",
                            border: "1px solid rgba(0,0,0,0.08)",
                            overflow: "hidden",
                            "&::before": { display: "none" },
                            boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreRoundedIcon sx={{ color: RED }} />}
                            sx={{
                              bgcolor: "rgba(0,0,0,0.015)",
                              px: 2.5,
                              py: 1,
                              "&:hover": { bgcolor: "rgba(0,0,0,0.03)" },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.75}
                              sx={{ alignItems: "center", width: "100%", pr: 2 }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
                                  color: "#fff",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  boxShadow: `0 4px 10px ${alpha(RED, 0.3)}`,
                                }}
                              >
                                {i + 1}
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 14.5, color: "text.primary" }}>
                                  {phan.tenPhan}
                                </Typography>
                              </Box>
                              <Typography sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 600, flexShrink: 0 }}>
                                {baiGiangs.length} bài • {formatTongThoiLuong(sectionDuration)}
                              </Typography>
                            </Stack>
                          </AccordionSummary>

                          <AccordionDetails sx={{ p: 1.5, bgcolor: "#ffffff" }}>
                            {baiGiangs.length === 0 ? (
                              <Typography sx={{ fontSize: 13, color: "text.disabled", p: 2, textAlign: "center" }}>
                                Chưa có bài giảng trong phần này.
                              </Typography>
                            ) : (
                              baiGiangs.map((bg: any, j: number) => {
                                const playable = !!bg.laBaiGiangFree && !!bg.urlBaiGiang;

                                return (
                                  <LessonRow
                                    key={bg.id ?? j}
                                    clickable={playable ? 1 : 0}
                                    onClick={() => handleOpenVideo(bg)}
                                  >
                                    <PlayBadge
                                      sx={{
                                        bgcolor: playable ? alpha(RED, 0.1) : "rgba(0,0,0,0.04)",
                                        color: playable ? RED : "text.disabled",
                                      }}
                                    >
                                      {playable ? (
                                        <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
                                      ) : (
                                        <LockRoundedIcon sx={{ fontSize: 15 }} />
                                      )}
                                    </PlayBadge>

                                    <Typography
                                      sx={{
                                        flex: 1,
                                        fontSize: 13.5,
                                        fontWeight: playable ? 600 : 500,
                                        color: playable ? "text.primary" : "text.secondary",
                                      }}
                                    >
                                      {bg.tieuDe}
                                    </Typography>

                                    {Array.isArray(bg.danhSachTaiLieu) &&
                                      bg.danhSachTaiLieu.length > 0 && (
                                        <Chip
                                          icon={<FolderRoundedIcon sx={{ fontSize: "13px !important" }} />}
                                          label={`${bg.danhSachTaiLieu.length} tài liệu`}
                                          size="small"
                                          sx={{
                                            bgcolor: "rgba(0,0,0,0.05)",
                                            color: "text.secondary",
                                            fontSize: 11,
                                            height: 24,
                                            fontWeight: 600,
                                          }}
                                        />
                                      )}

                                    {bg.laBaiGiangFree && (
                                      <Chip
                                        label="Xem thử miễn phí"
                                        size="small"
                                        sx={{
                                          bgcolor: "#e8f5e9",
                                          color: "#2e7d32",
                                          fontSize: 11,
                                          height: 24,
                                          fontWeight: 700,
                                          border: "1px solid #c8e6c9",
                                        }}
                                      />
                                    )}

                                    <Typography
                                      sx={{
                                        fontSize: 12.5,
                                        color: "text.disabled",
                                        minWidth: 46,
                                        textAlign: "right",
                                        fontVariantNumeric: "tabular-nums",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {formatLessonDuration(bg.thoiLuong)}
                                    </Typography>
                                  </LessonRow>
                                );
                              })
                            )}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })
                  )}
                </Stack>
              )}

              {/* TAB 2: ĐÁNH GIÁ */}
              {tab === 2 && (
                <SectionCard>
                  {loadingDanhGia ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                      <CircularProgress sx={{ color: RED }} size={36} />
                    </Box>
                  ) : (
                    <>
                      {/* Rating Score Overview Card */}
                      {danhGia && danhGia.tongSoDanhGia > 0 ? (
                        <Box
                          sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: "18px",
                            background: "linear-gradient(135deg, #fffaf5, #fef2f2)",
                            border: `1px solid ${alpha(RED, 0.15)}`,
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={4}
                            sx={{ alignItems: "center" }}
                          >
                            <Box sx={{ textAlign: "center", flexShrink: 0, minWidth: 150 }}>
                              <Typography
                                sx={{
                                  fontSize: 60,
                                  fontWeight: 900,
                                  color: RED,
                                  lineHeight: 1,
                                  letterSpacing: "-1px",
                                }}
                              >
                                {danhGia.diemTrungBinh.toFixed(1)}
                              </Typography>
                              <Rating
                                value={danhGia.diemTrungBinh}
                                readOnly
                                precision={0.1}
                                sx={{
                                  my: 0.75,
                                  "& .MuiRating-iconFilled": { color: "#eab308" },
                                }}
                              />
                              <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
                                {danhGia.tongSoDanhGia} đánh giá học viên
                              </Typography>
                            </Box>

                            <Box sx={{ flex: 1, width: "100%" }}>
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = danhGia.phanBoSao[star] ?? 0;
                                const pct =
                                  danhGia.tongSoDanhGia > 0
                                    ? (count / danhGia.tongSoDanhGia) * 100
                                    : 0;

                                return (
                                  <Stack
                                    key={star}
                                    direction="row"
                                    spacing={1.5}
                                    sx={{ alignItems: "center", mb: 0.85 }}
                                  >
                                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, minWidth: 10 }}>
                                      {star}
                                    </Typography>
                                    <StarRoundedIcon sx={{ fontSize: 16, color: "#eab308" }} />
                                    <LinearProgress
                                      variant="determinate"
                                      value={pct}
                                      sx={{
                                        flex: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: "rgba(0,0,0,0.06)",
                                        "& .MuiLinearProgress-bar": {
                                          bgcolor: "#eab308",
                                          borderRadius: 4,
                                        },
                                      }}
                                    />
                                    <Typography
                                      sx={{
                                        fontSize: 12.5,
                                        color: "text.secondary",
                                        minWidth: 32,
                                        textAlign: "right",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {count}
                                    </Typography>
                                  </Stack>
                                );
                              })}
                            </Box>
                          </Stack>
                        </Box>
                      ) : (
                        <Stack sx={{ alignItems: "center", py: 5, textAlign: "center" }} spacing={1.5}>
                          <RateReviewRoundedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "text.secondary" }}>
                            Chưa có đánh giá nào cho khóa học này.
                          </Typography>
                        </Stack>
                      )}

                      {/* Write Review Form */}
                      {enrolled && !daDanhGia && (
                        <Box
                          sx={{
                            mb: 4,
                            p: 3,
                            bgcolor: RED_LIGHT,
                            borderRadius: "18px",
                            border: `1.5px solid ${alpha(RED, 0.2)}`,
                          }}
                        >
                          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "text.primary", mb: 1.5 }}>
                            Chia sẻ trải nghiệm học tập của bạn
                          </Typography>
                          <Stack spacing={1.5} sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: 13.5, color: "text.secondary", fontWeight: 600 }}>
                              Bạn đánh giá khóa học này bao nhiêu sao?
                            </Typography>
                            <Rating
                              value={formDanhGia.soSao}
                              onChange={(_, v) =>
                                setFormDanhGia((p) => ({ ...p, soSao: v ?? 5 }))
                              }
                              size="large"
                              sx={{
                                "& .MuiRating-iconFilled": { color: "#eab308" },
                              }}
                            />
                          </Stack>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Nhập cảm nhận chi tiết của bạn về nội dung, chất lượng giảng dạy..."
                            value={formDanhGia.noiDung}
                            onChange={(e) =>
                              setFormDanhGia((p) => ({
                                ...p,
                                noiDung: e.target.value,
                              }))
                            }
                            sx={{
                              mb: 2.25,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "14px",
                                bgcolor: "#fff",
                                "&.Mui-focused fieldset": { borderColor: RED },
                              },
                            }}
                          />
                          <Button
                            variant="contained"
                            disabled={submittingDanhGia}
                            onClick={handleSubmitDanhGia}
                            startIcon={
                              submittingDanhGia ? (
                                <CircularProgress size={16} sx={{ color: "#fff" }} />
                              ) : (
                                <StarRoundedIcon />
                              )
                            }
                            sx={{
                              bgcolor: RED,
                              "&:hover": { bgcolor: RED_DARK },
                              borderRadius: "12px",
                              fontWeight: 700,
                              textTransform: "none",
                              px: 3,
                              py: 1.15,
                            }}
                          >
                            {submittingDanhGia ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
                          </Button>
                        </Box>
                      )}

                      {enrolled && daDanhGia && (
                        <Box
                          sx={{
                            mb: 3.5,
                            p: 2,
                            bgcolor: "#f0fdf4",
                            border: "1px solid #86efac",
                            borderRadius: "14px",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <CheckCircleRoundedIcon sx={{ color: "#22c55e", fontSize: 22 }} />
                          <Typography sx={{ fontSize: 14, color: "#15803d", fontWeight: 700 }}>
                            Bạn đã hoàn thành đánh giá cho khóa học này. Cảm ơn bạn!
                          </Typography>
                        </Box>
                      )}

                      {!enrolled && (
                        <Box
                          sx={{
                            mb: 3.5,
                            p: 2,
                            bgcolor: "#fffbeb",
                            border: "1px solid #fde68a",
                            borderRadius: "14px",
                          }}
                        >
                          <Typography sx={{ fontSize: 13.5, color: "#92400e", fontWeight: 600 }}>
                            💡 Bạn cần đăng ký khóa học để có thể chia sẻ đánh giá.
                          </Typography>
                        </Box>
                      )}

                      {/* Reviews List */}
                      {(danhGia?.danhSach ?? []).length > 0 && (
                        <Stack spacing={3}>
                          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "text.primary" }}>
                            Nhận xét từ học viên ({danhGia?.tongSoDanhGia})
                          </Typography>
                          {danhGia!.danhSach.map((dg) => (
                            <Stack
                              key={dg.id}
                              direction="row"
                              spacing={2}
                              sx={{
                                p: 2.25,
                                borderRadius: "16px",
                                border: "1px solid rgba(0,0,0,0.06)",
                                bgcolor: "rgba(0,0,0,0.01)",
                              }}
                            >
                              <Avatar
                                src={dg.anhNguoiDung}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: RED,
                                  fontSize: 16,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                                }}
                              >
                                {(dg.hoTenNguoiDung ?? "?").charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}
                                >
                                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                                    {dg.hoTenNguoiDung ?? "Người dùng"}
                                  </Typography>
                                  <Rating
                                    value={dg.soSao}
                                    readOnly
                                    size="small"
                                    sx={{
                                      "& .MuiRating-iconFilled": { color: "#eab308" },
                                    }}
                                  />
                                  <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                                    {new Date(dg.ngayTao).toLocaleDateString("vi-VN")}
                                  </Typography>
                                </Stack>

                                {dg.noiDung && (
                                  <Typography
                                    sx={{
                                      fontSize: 13.5,
                                      color: "text.secondary",
                                      lineHeight: 1.7,
                                      mt: 0.5,
                                    }}
                                  >
                                    {dg.noiDung}
                                  </Typography>
                                )}

                                {/* Instructor response */}
                                {dg.phanHoi && (
                                  <Box
                                    sx={{
                                      mt: 2,
                                      p: 2,
                                      bgcolor: RED_LIGHT,
                                      borderRadius: "14px",
                                      borderLeft: `4px solid ${RED}`,
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ alignItems: "center", mb: 0.75 }}
                                    >
                                      <Avatar
                                        src={dg.phanHoi.anhGV}
                                        sx={{
                                          width: 26,
                                          height: 26,
                                          fontSize: 12,
                                          bgcolor: RED,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {(dg.phanHoi.hoTenGV ?? "GV").charAt(0).toUpperCase()}
                                      </Avatar>
                                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: RED }}>
                                        {dg.phanHoi.hoTenGV ?? "Giảng viên"}
                                      </Typography>
                                      <Chip
                                        label="Giảng viên"
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: 10,
                                          bgcolor: RED,
                                          color: "#fff",
                                          fontWeight: 700,
                                        }}
                                      />
                                      <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                                        {new Date(dg.phanHoi.ngayTao).toLocaleDateString("vi-VN")}
                                      </Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
                                      {dg.phanHoi.noiDung}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </>
                  )}
                </SectionCard>
              )}
            </Box>
          </Fade>
        </Grid>

        {/* ── Sidebar Column (Sticky Purchase Box) ── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <SidebarCard>
            {/* Cinematic Video Thumbnail */}
            <ThumbBox bgimg={khoaHoc.hinhAnhKhoaHoc}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                {previewVideo && (
                  <Box
                    onClick={() => handleOpenPreviewVideo(previewVideo)}
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      bgcolor: RED,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                      border: "3px solid rgba(255,255,255,0.4)",
                      animation: `${pulseAnimation} 2s infinite`,
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 36, ml: 0.5 }} />
                  </Box>
                )}
              </Box>

              {previewVideo && (
                <Chip
                  icon={<OndemandVideoRoundedIcon sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
                  label="Xem trước khóa học"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 14,
                    left: 14,
                    bgcolor: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    fontSize: 11,
                    height: 26,
                    fontWeight: 700,
                    zIndex: 2,
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              )}
            </ThumbBox>

            <Box sx={{ p: 3 }}>
              {/* Price Tag */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "baseline", mb: 2.5 }}
              >
                <Typography
                  sx={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: isFree ? "#16a34a" : RED,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {isFree
                    ? "Miễn phí"
                    : gia > 0
                      ? `${gia.toLocaleString("vi-VN")}₫`
                      : "Liên hệ"}
                </Typography>
                {Boolean(khoaHoc.giaGoc && khoaHoc.giaGoc > gia) && (
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: "text.disabled",
                      textDecoration: "line-through",
                      fontWeight: 600,
                    }}
                  >
                    {(khoaHoc.giaGoc ?? 0).toLocaleString("vi-VN")}₫
                  </Typography>
                )}
              </Stack>

              {/* Action Buttons */}
              {!enrolled ? (
                isFree ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SchoolRoundedIcon />}
                    onClick={() => {
                      if (!checkAuth()) return;
                      setModalOpen(true);
                    }}
                    sx={{
                      bgcolor: "#16a34a",
                      "&:hover": { bgcolor: "#15803d", transform: "translateY(-1px)" },
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: 15.5,
                      borderRadius: "14px",
                      py: 1.5,
                      mb: 2,
                      boxShadow: "0 10px 24px rgba(22, 163, 74, 0.3)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Đăng ký học miễn phí
                  </Button>
                ) : (
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ShoppingCartRoundedIcon />}
                      onClick={async () => {
                        if (!checkAuth()) return;
                        try {
                          await apiService.post(`/GioHang/${khoaHoc.id}`);
                          router.push("/student/cart");
                        } catch (e: any) {
                          const msg = e?.response?.data?.message ?? "";
                          const status = e?.response?.status;

                          if (status === 409) {
                            router.push("/student/cart");
                          } else if (
                            msg.includes("sở hữu") ||
                            msg.includes("đã mua")
                          ) {
                            setEnrolled(true);
                            setSnackbar({
                              open: true,
                              message: "Bạn đã sở hữu khóa học này!",
                              severity: "success",
                            });
                          } else {
                            setSnackbar({
                              open: true,
                              message: msg || "Có lỗi xảy ra",
                              severity: "error",
                            });
                          }
                        }
                      }}
                      sx={{
                        background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${RED_DARK}, #5c0f0f)`,
                          transform: "translateY(-1px)",
                        },
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 15.5,
                        borderRadius: "14px",
                        py: 1.5,
                        boxShadow: `0 10px 25px ${alpha(RED, 0.35)}`,
                        transition: "all 0.2s ease",
                      }}
                    >
                      Mua ngay
                    </Button>
                  </Stack>
                )
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      bgcolor: "#f0fdf4",
                      border: "1.5px solid #86efac",
                      borderRadius: "16px",
                      p: 2,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleRoundedIcon sx={{ color: "#fff", fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#15803d" }}>
                        Khóa học của bạn
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#16a34a", fontWeight: 600 }}>
                        Bạn đã sở hữu khóa học này
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={navigatingToLearn}
                    startIcon={
                      navigatingToLearn ? (
                        <CircularProgress size={16} sx={{ color: "#fff" }} />
                      ) : (
                        <SchoolRoundedIcon />
                      )
                    }
                    onClick={handleGoToLearning}
                    sx={{
                      bgcolor: "#16a34a",
                      "&:hover": { bgcolor: "#15803d", transform: "translateY(-1px)" },
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: 15,
                      borderRadius: "14px",
                      py: 1.5,
                      boxShadow: "0 10px 24px rgba(22, 163, 74, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {navigatingToLearn ? "Đang mở khóa học..." : "Vào học ngay"}
                  </Button>
                </Box>
              )}

              {/* Guarantees */}
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 3,
                  py: 1,
                  bgcolor: "rgba(0,0,0,0.02)",
                  borderRadius: "10px",
                }}
              >
                <VerifiedUserRoundedIcon sx={{ fontSize: 16, color: RED }} />
                <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
                  Truy cập học trọn đời • Đảm bảo uy tín
                </Typography>
              </Stack>

              {/* Features List */}
              <Box
                sx={{
                  p: 2.25,
                  borderRadius: "18px",
                  bgcolor: "rgba(0,0,0,0.02)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: 14, mb: 2, color: "text.primary" }}>
                  Khóa học bao gồm:
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    {
                      icon: <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />,
                      label: `${formatTongThoiLuong(khoaHoc.tongThoiLuong)} video theo yêu cầu`,
                    },
                    {
                      icon: <FolderRoundedIcon sx={{ fontSize: 18 }} />,
                      label: `${khoaHoc.tongTaiLieu ?? 0} tài nguyên tải về`,
                    },
                    {
                      icon: <DevicesRoundedIcon sx={{ fontSize: 18 }} />,
                      label: "Truy cập linh hoạt trên máy tính và di động",
                    },
                    {
                      icon: <AllInclusiveRoundedIcon sx={{ fontSize: 18 }} />,
                      label: "Hạn sử dụng khóa học: 6 tháng",
                    },
                    {
                      icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />,
                      label: "Chứng chỉ hoàn thành sau khi kết thúc",
                    },
                  ].map((item, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: RED_LIGHT,
                          color: RED,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
                        {item.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>
          </SidebarCard>
        </Grid>
      </Grid>

      {/* ── Giảng viên & Khóa học liên quan ── */}
      <SectionCard sx={{ mt: 4 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 22,
            mb: 3.5,
            color: "text.primary",
          }}
        >
          Giảng viên
        </Typography>

        <Stack spacing={3.5} sx={{ mb: 3 }}>
          {danhSachGiangVienDetail.map((gv, idx) => {
            const key = gv.id ?? `gv-${idx}`;
            const isExpanded = !!bioExpandedMap[key];
            const bioHtml =
              gv.tieuSu || (idx === 0 ? giangVienInfo?.moTa : undefined);

            return (
              <Box key={key}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  sx={{ alignItems: "flex-start" }}
                >
                  <Box
                    onClick={() => goToInstructorProfile(gv.id)}
                    sx={{
                      cursor: gv.id ? "pointer" : "default",
                      flexShrink: 0,
                    }}
                  >
                    {gv.anhDaiDien ? (
                      <Box
                        component="img"
                        src={gv.anhDaiDien}
                        sx={{
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `3px solid ${RED}`,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 96,
                          height: 96,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${RED}, ${RED_DARK})`,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 32,
                          fontWeight: 800,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                        }}
                      >
                        {gv.hoTen.charAt(0).toUpperCase()}
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      onClick={() => goToInstructorProfile(gv.id)}
                      sx={{
                        fontWeight: 800,
                        fontSize: 20,
                        color: RED,
                        mb: 0.5,
                        width: "fit-content",
                        cursor: gv.id ? "pointer" : "default",
                        "&:hover": gv.id
                          ? { textDecoration: "underline" }
                          : undefined,
                      }}
                    >
                      {gv.hoTen}
                    </Typography>

                    {idx === 0 && giangVienInfo?.chucDanh && (
                      <Typography sx={{ fontSize: 14, color: "text.secondary", fontWeight: 600, mb: 1 }}>
                        {giangVienInfo.chucDanh}
                      </Typography>
                    )}

                    {idx === 0 && (
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ my: 1.5, flexWrap: "wrap", rowGap: 1 }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{
                            alignItems: "center",
                            bgcolor: RED_LIGHT,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "10px",
                          }}
                        >
                          <PlayCircleFilledRoundedIcon sx={{ fontSize: 18, color: RED }} />
                          <Typography sx={{ fontSize: 13, color: "text.primary", fontWeight: 700 }}>
                            {giangVienInfo?.tongKhoaHoc ?? giangVienKhoaHocs.length + 1} khóa học
                          </Typography>
                        </Stack>

                        {typeof giangVienInfo?.tongHocVien === "number" && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{
                              alignItems: "center",
                              bgcolor: RED_LIGHT,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: "10px",
                            }}
                          >
                            <PeopleAltRoundedIcon sx={{ fontSize: 18, color: RED }} />
                            <Typography sx={{ fontSize: 13, color: "text.primary", fontWeight: 700 }}>
                              {giangVienInfo.tongHocVien.toLocaleString("vi-VN")} học viên
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    )}

                    {bioHtml && (
                      <Box sx={{ mt: 1.5 }}>
                        <Box
                          sx={{
                            fontSize: 14,
                            color: "text.secondary",
                            lineHeight: 1.85,
                            "& p": { mb: 1 },
                            "& p:last-child": { mb: 0 },
                            "& ul, & ol": { pl: 2.5, mb: 1 },
                            "& a": { color: RED },
                            "& img": { maxWidth: "100%", borderRadius: "10px" },
                            "& strong, & b": { color: "text.primary" },
                            ...(!isExpanded && {
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }),
                          }}
                          dangerouslySetInnerHTML={{ __html: bioHtml }}
                        />
                        <Button
                          onClick={() =>
                            setBioExpandedMap((m) => ({ ...m, [key]: !m[key] }))
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            fontSize: 13.5,
                            color: RED,
                            px: 0,
                            mt: 1,
                            minWidth: 0,
                            "&:hover": {
                              bgcolor: "transparent",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {isExpanded ? "Ẩn bớt" : "Hiển thị thêm"}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Stack>

                {idx < danhSachGiangVienDetail.length - 1 && (
                  <Divider sx={{ my: 3, borderColor: "divider" }} />
                )}
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ my: 3.5, borderColor: "divider" }} />

        {/* Other Courses by Instructor */}
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: "text.primary" }}>
            Khóa học khác của {tenGiangVienChinh}
          </Typography>
        </Stack>

        {loadingGiangVien ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={30} sx={{ color: RED }} thickness={4} />
          </Box>
        ) : giangVienKhoaHocs.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: "text.disabled", mb: 2 }}>
            Giảng viên hiện chưa có khóa học nào khác.
          </Typography>
        ) : (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {giangVienKhoaHocs.map((kh: any, i: number) => {
              const khGia = kh.gia ?? kh.giaGoc ?? 0;
              const khFree =
                kh.loaiKhoaHoc !== "Khóa học trả phí" &&
                (!kh.gia || kh.gia <= 0);

              return (
                <Grid key={kh.id ?? i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    onClick={() =>
                      kh.id && router.push(`/student/enroll-courses/${kh.id}`)
                    }
                    sx={{
                      borderRadius: "18px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      overflow: "hidden",
                      cursor: kh.id ? "pointer" : "default",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                      "&:hover": kh.id
                        ? {
                            boxShadow: "0 16px 36px rgba(141,19,19,0.12)",
                            transform: "translateY(-4px)",
                            borderColor: alpha(RED, 0.3),
                          }
                        : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "56.25%",
                        bgcolor: "#1c1d1f",
                        backgroundImage: kh.hinhAnhKhoaHoc
                          ? `url(${kh.hinhAnhKhoaHoc})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box sx={{ p: 2.25, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography
                        sx={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          mb: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 42,
                          color: "text.primary",
                          lineHeight: 1.4,
                        }}
                      >
                        {kh.tieuDe}
                      </Typography>
                      <Box sx={{ mt: "auto" }}>
                        <Typography
                          sx={{
                            fontSize: 16,
                            fontWeight: 900,
                            color: khFree ? "#16a34a" : RED,
                          }}
                        >
                          {khFree
                            ? "Miễn phí"
                            : khGia > 0
                              ? `${khGia.toLocaleString("vi-VN")}₫`
                              : "Liên hệ"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {giangVienId && (
          <Button
            onClick={() => goToInstructorProfile(giangVienId)}
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              fontSize: 14,
              color: RED,
              px: 0,
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Xem thêm khóa học của {tenGiangVienChinh}
          </Button>
        )}
      </SectionCard>

      {/* ── Confirm Registration Dialog ── */}
      <Dialog
        open={modalOpen}
        onClose={() => !registering && setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "24px", p: 1 } } }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Xác nhận đăng ký
            </Typography>
            <IconButton
              size="small"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{ color: "text.disabled" }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 3 }}>
            {isFree
              ? "Bạn sắp đăng ký tham gia khóa học sau hoàn toàn miễn phí."
              : "Bạn sắp đăng ký tham gia khóa học sau."}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              bgcolor: RED_LIGHT,
              borderRadius: "16px",
              p: 2,
              mb: 3,
              border: `1px solid ${alpha(RED, 0.15)}`,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <SchoolRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                {khoaHoc.tieuDe}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.25 }}>
                {khoaHoc.tongBaiGiang ?? 0} bài học • {formatTongThoiLuong(khoaHoc.tongThoiLuong)}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="contained"
              disabled={registering}
              onClick={handleRegister}
              startIcon={
                registering ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <SchoolRoundedIcon />
                )
              }
              sx={{
                bgcolor: RED,
                "&:hover": { bgcolor: RED_DARK },
                textTransform: "none",
                fontWeight: 800,
                fontSize: 15,
                borderRadius: "14px",
                py: 1.4,
                boxShadow: `0 8px 20px ${alpha(RED, 0.3)}`,
              }}
            >
              {registering ? "Đang xử lý đăng ký..." : "Xác nhận đăng ký"}
            </Button>
            <Button
              fullWidth
              variant="text"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 14,
                borderRadius: "12px",
              }}
            >
              Hủy bỏ
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Video Preview Player Modal ── */}
      <Dialog
        open={videoPlayer.open}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "24px",
              bgcolor: "#0d0e11",
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              m: 2,
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
            },
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            px: 2.5,
            py: 1.75,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: alpha(RED, 0.2),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlayCircleFilledRoundedIcon sx={{ fontSize: 20, color: RED }} />
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {videoPlayer.title}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={handleCloseVideo}
            sx={{
              color: "rgba(255,255,255,0.7)",
              bgcolor: "rgba(255,255,255,0.08)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.18)",
                color: "#fff",
              },
              flexShrink: 0,
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isVideoLoading && (
            <CircularProgress
              sx={{ color: RED, position: "absolute", zIndex: 5 }}
              size={44}
              thickness={4}
            />
          )}

          {videoPlayer.url ? (
            <Box
              component="video"
              src={videoPlayer.url}
              controls
              autoPlay
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              onCanPlay={() => setIsVideoLoading(false)}
              onError={(e) => {
                console.warn("Video error in preview:", e);
                setIsVideoLoading(false);
              }}
              onWaiting={() => setIsVideoLoading(true)}
              onPlaying={() => setIsVideoLoading(false)}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#000",
              }}
            />
          ) : (
            <Typography sx={{ color: "#fff", fontSize: 14 }}>
              Không thể tải video xem thử
            </Typography>
          )}
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── exported page ────────────────────────────────────────────────────────────

export default function CourseRegistrationPage() {
  return (
    <StudentDashboardShell>
      <Box sx={{ mt: 0, pb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4.5 },
            borderRadius: "28px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: CSSVAR.paper,
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <CourseRegistrationContent />
        </Paper>
      </Box>
    </StudentDashboardShell>
  );
}
