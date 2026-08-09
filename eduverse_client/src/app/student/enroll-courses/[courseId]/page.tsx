/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlayCircleIcon from "@mui/icons-material/PlayCircleRounded";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import DevicesIcon from "@mui/icons-material/Devices";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Rating from "@mui/material/Rating";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";
import DangKiService from "@/src/services/DangKiService";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType, GiangVienKhoaHocDto } from "@/src/types/khoaHoc/Dto/dto";
import { apiService } from "@/src/services/index";

interface DanhGiaDto {
  id: string;
  soSao: number;
  noiDung?: string;
  ngayTao: string;
  idNguoiDung?: string;
  tenNguoiDung?: string;
  anhDaiDien?: string;
}

interface DanhGiaKhoaHocDto {
  tongSoDanhGia: number;
  diemTrungBinh: number;
  phanBoSao: Record<number, number>;
  danhSach: DanhGiaDto[];
}

// ─── constants ────────────────────────────────────────────────────────────────

const RED = "#8B1313";
const RED_HOVER = "#6B1010";
const RED_SOFT = "#fdf2f2";
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const GIANG_VIEN_COURSES_PAGE_SIZE = 4;

// ─── styled components ────────────────────────────────────────────────────────

const HeroBanner = styled(Box)(() => ({
  background: "linear-gradient(135deg, #1c1d1f 0%, #141414 100%)",
  borderRadius: 14,
  padding: "1.5rem 1.75rem",
  marginBottom: "1rem",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: 260,
    height: "100%",
    background: `radial-gradient(circle at top right, ${alpha(RED, 0.35)}, transparent 70%)`,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -50,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${alpha(RED, 0.12)}, transparent 70%)`,
    pointerEvents: "none",
  },
}));

const SidebarCard = styled(Paper)(() => ({
  borderRadius: 20,
  border: "1px solid #f3d9d9",
  boxShadow: "0 16px 40px rgba(141,19,19,0.10)",
  overflow: "hidden",
  position: "sticky",
  top: 24,
}));

const ThumbBox = styled(Box)<{ bgimg?: string }>(({ bgimg }) => ({
  position: "relative",
  paddingTop: "56%",
  background: bgimg
    ? `#1c1d1f url(${bgimg}) center/cover no-repeat`
    : "#1c1d1f",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)",
  },
}));

const SectionCard = styled(Paper)(() => ({
  borderRadius: 20,
  border: "1px solid #f3d9d9",
  boxShadow: "0 6px 24px rgba(141,19,19,0.06)",
  padding: "1.75rem",
  transition: "box-shadow 0.25s ease",
}));

const PhanCard = styled(Paper)(() => ({
  borderRadius: 18,
  border: "1px solid #f3d9d9",
  boxShadow: "0 6px 20px rgba(141,19,19,0.05)",
  overflow: "hidden",
}));

const LessonRow = styled(Box)<{ clickable?: number }>(({ clickable }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 8px",
  borderBottom: "1px solid #f6e9e9",
  fontSize: 13,
  borderRadius: 10,
  cursor: clickable ? "pointer" : "default",
  transition: "background-color 0.18s ease, transform 0.18s ease",
  "&:last-child": { borderBottom: "none" },
  "&:hover": clickable
    ? {
      backgroundColor: RED_SOFT,
    }
    : undefined,
}));

const PlayBadge = styled(Box)(() => ({
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  transition: "transform 0.18s ease, background-color 0.18s ease",
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

// Id giảng viên (người tạo khóa học) — dùng để gọi API
// /KhoaHoc/khoahoc-list-bygiangvien/{userId} và để build link hồ sơ giảng
// viên /instructor/profile/{id}. Ưu tiên createdId (id tài khoản tạo khóa
// học), dự phòng giangVien.id nếu BE có populate sẵn quan hệ.
function getGiangVienId(khoaHoc: any): string | null {
  const id = khoaHoc?.createdId || khoaHoc?.giangVien?.id;
  return typeof id === "string" && isValidGuid(id) ? id : null;
}

// PagedList<T> phía BE — lấy mảng item bất kể tên field cụ thể là gì.
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

  // Thông tin giảng viên + các khóa học khác của giảng viên (hiển thị cuối trang)
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
  const [bioExpanded, setBioExpanded] = useState(false);

  const dangKiService = new DangKiService();
  const khoaHocService = new KhoaHocService();

  // ── Tải (hoặc đồng bộ lại) dữ liệu khóa học từ server ───────────────────
  // silent = true: không bật spinner toàn trang, dùng để đồng bộ ngầm sau khi
  // đăng ký thành công (tránh phải reload cả trang / bấm nút 2 lần).
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

          // Lấy idDangKi từ nhiều nguồn khả dĩ trong response
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
      } catch (err) {
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
      const res = await apiService.get<DanhGiaKhoaHocDto>(
        `/danhgia/khoa-hoc/${courseId}`,
      );
      setDanhGia(res.data);
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

  // ── Fetch dữ liệu khóa học lần đầu ──────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount is the intended sync point
    loadKhoaHoc();
  }, [loadKhoaHoc]);

  useEffect(() => {
    if (tab !== 2) return;

    const load = async () => {
      await Promise.all([loadDanhGia(), loadKiemTraDanhGia()]);
    };

    void load();
  }, [tab, loadDanhGia, loadKiemTraDanhGia]);

  // ── Fetch các khóa học khác của giảng viên (hiển thị cuối trang, kiểu Udemy) ──
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

      // Luôn đồng bộ lại dữ liệu mới nhất từ server ngay sau khi đăng ký,
      // để lấy idDangKi chuẩn — tránh tình trạng phải bấm "Vào học ngay" 2 lần.
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

        // Nếu response lỗi không kèm id, đồng bộ ngầm từ server thay vì reload.
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

  // ── Vào học ngay: nếu chưa có id hợp lệ, tự đồng bộ rồi điều hướng luôn
  // trong cùng một lần bấm, không cần reload cả trang.
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
          gap: 1.5,
          py: 12,
        }}
      >
        <CircularProgress sx={{ color: RED }} size={36} thickness={4} />
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          Đang tải khóa học...
        </Typography>
      </Box>
    );
  }

  if (pageError || !khoaHoc) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {pageError ?? "Không tìm thấy khóa học."}
      </Alert>
    );
  }

  const phanHocs = khoaHoc.danhSachPhanHoc ?? [];
  const gia = khoaHoc.gia ?? khoaHoc.giaGoc ?? 0;
  const isFree =
    khoaHoc.loaiKhoaHoc !== "Khóa học trả phí" &&
    (!khoaHoc.gia || khoaHoc.gia <= 0);

  const giangVien = khoaHoc.createdBy || "Không xác định";

  // Id giảng viên dùng để build link hồ sơ /instructor/profile/{id}
  const giangVienId = getGiangVienId(khoaHoc);

  // Thông tin giảng viên hiển thị cuối trang: ưu tiên dữ liệu đã có sẵn từ
  // khoaHoc.giangVien (trả kèm ngay trong GetKhoaHocPreview), sau đó bổ sung
  // thêm tongKhoaHoc/tongHocVien từ giangVienInfo (API khoahoc-list-bygiangvien)
  // nếu tải được — nhờ vậy khối này luôn hiển thị kể cả khi API thứ 2 lỗi
  // hoặc không xác định được id giảng viên.
  const gvGoc = (khoaHoc as any).giangVien;
  const giangVienDisplay = {
    ten: giangVienInfo?.ten || gvGoc?.hoTen || giangVien,
    avatar: giangVienInfo?.avatar ?? gvGoc?.avatar,
    moTa: giangVienInfo?.moTa ?? gvGoc?.tieuSu,
    chucDanh: giangVienInfo?.chucDanh,
    tongKhoaHoc: giangVienInfo?.tongKhoaHoc,
    tongHocVien: giangVienInfo?.tongHocVien,
  };

  const goToInstructorProfile = () => {
    if (giangVienId) router.push(`/instructor/profile/${giangVienId}`);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* ── Main column ── */}
        <Grid size={{ xs: 12, md: 8 }}>
          <HeroBanner>
            <Chip
              label={khoaHoc.loaiKhoaHoc ?? "KHÓA HỌC"}
              size="small"
              sx={{
                bgcolor: RED,
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                mb: 1.75,
                letterSpacing: 0.3,
              }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: 800,
                mb: 1.5,
                lineHeight: 1.35,
                fontSize: { xs: 20, md: 26 },
              }}
            >
              {khoaHoc.tieuDe}
            </Typography>
            <Box
              sx={{
                color: "#c9c9c9",
                fontSize: 13,
                mb: 2.5,
                lineHeight: 1.8,
                maxWidth: 560,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                "& img": { maxWidth: "100%" },
                "& ul, & ol": { pl: 2 },
                "& p": { mb: 1 },
              }}
              dangerouslySetInnerHTML={{ __html: khoaHoc.moTa || "" }}
            />

            <Typography
              onClick={giangVienId ? goToInstructorProfile : undefined}
              sx={{
                color: "#ddd",
                fontSize: 13,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: giangVienId ? "pointer" : "default",
                width: "fit-content",
                "&:hover": giangVienId ? { color: "#fff" } : undefined,
              }}
            >
              <SchoolIcon sx={{ fontSize: 16, color: RED }} />
              Giảng viên:{" "}
              <strong
                style={{
                  textDecoration: giangVienId ? "underline" : "none",
                }}
              >
                {giangVien}
              </strong>
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2.5 }}
            >
              <Stack direction="row">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: "#e0a800" }} />
                ))}
              </Stack>
              <Typography sx={{ color: "#aaa", fontSize: 12 }}>
                {khoaHoc.soLuongHocVien ?? 0} học viên
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
              {[
                {
                  icon: <AccessTimeIcon sx={{ fontSize: 14 }} />,
                  label: formatTongThoiLuong(khoaHoc.tongThoiLuong),
                },
                {
                  icon: <MenuBookIcon sx={{ fontSize: 14 }} />,
                  label: `${khoaHoc.tongBaiGiang ?? 0} bài học`,
                },
              ].map((item, i) => (
                <Stack
                  key={i}
                  direction="row"
                  spacing={0.75}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    px: 1.5,
                    py: 0.6,
                    color: "#ddd",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                  <Typography sx={{ fontSize: 12 }}>{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </HeroBanner>

          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 2.5,
              minHeight: 44,
              bgcolor: RED_SOFT,
              borderRadius: 999,
              p: 0.5,
              width: "fit-content",
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                minHeight: 36,
                borderRadius: 999,
                color: "text.secondary",
                px: 2.5,
                transition: "all 0.2s ease",
              },
              "& .Mui-selected": {
                color: "#fff !important",
                bgcolor: RED,
              },
            }}
          >
            <Tab label="Tổng quan" disableRipple />
            <Tab label={`Nội dung (${phanHocs.length})`} disableRipple />
            <Tab label="Đánh giá" disableRipple />
          </Tabs>

          <Fade in key={tab} timeout={250}>
            <Box>
              {tab === 0 && (
                <SectionCard>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>
                    Mô tả khóa học
                  </Typography>
                  <Box
                    sx={{
                      fontSize: 13.5,
                      color: "text.secondary",
                      lineHeight: 1.9,
                      mb: 3,
                      "& img": { maxWidth: "100%" },
                      "& ul, & ol": { pl: 2 },
                      "& p": { mb: 1 },
                    }}
                    dangerouslySetInnerHTML={{ __html: khoaHoc.moTa || "" }}
                  />
                  <Divider sx={{ mb: 2.5, borderColor: "#f3d9d9" }} />
                  <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                    {[
                      {
                        icon: (
                          <MenuBookIcon sx={{ fontSize: 18, color: RED }} />
                        ),
                        label: `${phanHocs.length} phần học`,
                      },
                      {
                        icon: (
                          <PlayArrowIcon sx={{ fontSize: 18, color: RED }} />
                        ),
                        label: `${khoaHoc.tongBaiGiang ?? 0} bài giảng`,
                      },
                      {
                        icon: <FolderIcon sx={{ fontSize: 18, color: RED }} />,
                        label: `${khoaHoc.tongTaiLieu ?? 0} tài liệu đính kèm`,
                      },
                    ].map((item, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        spacing={1}
                        sx={{
                          bgcolor: RED_SOFT,
                          borderRadius: 3,
                          px: 1.75,
                          py: 1,
                          alignItems: "center",
                        }}
                      >
                        {item.icon}
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "text.secondary",
                            fontWeight: 600,
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </SectionCard>
              )}

              {tab === 1 && (
                <Stack spacing={2}>
                  {phanHocs.length === 0 && (
                    <SectionCard>
                      <Typography
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      >
                        Khóa học chưa có nội dung.
                      </Typography>
                    </SectionCard>
                  )}
                  {phanHocs.map((phan: any, i: number) => (
                    <PhanCard key={phan.id ?? i}>
                      <Stack
                        direction="row"
                        sx={{
                          p: 2,
                          background: `linear-gradient(90deg, ${RED_SOFT}, #fff)`,
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.25}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              bgcolor: RED,
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {i + 1}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
                            {phan.tenPhan}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{ fontSize: 11.5, color: "text.disabled" }}
                        >
                          {(phan.danhSachBaiGiang ?? []).length} bài
                        </Typography>
                      </Stack>
                      <Box sx={{ px: 1.5, py: 0.5 }}>
                        {(phan.danhSachBaiGiang ?? []).map(
                          (bg: any, j: number) => {
                            const playable =
                              !!bg.laBaiGiangFree && !!bg.urlBaiGiang;
                            return (
                              <LessonRow
                                key={bg.id ?? j}
                                clickable={playable ? 1 : 0}
                                onClick={() => handleOpenVideo(bg)}
                              >
                                <PlayBadge
                                  sx={{
                                    bgcolor: playable
                                      ? RED_SOFT
                                      : "transparent",
                                  }}
                                >
                                  {playable ? (
                                    <PlayArrowIcon
                                      sx={{ fontSize: 16, color: RED }}
                                    />
                                  ) : (
                                    <LockIcon
                                      sx={{
                                        fontSize: 15,
                                        color: "text.disabled",
                                      }}
                                    />
                                  )}
                                </PlayBadge>
                                <Typography
                                  sx={{
                                    flex: 1,
                                    fontSize: 13,
                                    fontWeight: playable ? 600 : 400,
                                    color: playable
                                      ? "text.primary"
                                      : "text.secondary",
                                  }}
                                >
                                  {bg.tieuDe}
                                </Typography>
                                {Array.isArray(bg.danhSachTaiLieu) &&
                                  bg.danhSachTaiLieu.length > 0 && (
                                    <Chip
                                      icon={
                                        <FolderIcon sx={{ fontSize: 12 }} />
                                      }
                                      label={bg.danhSachTaiLieu.length}
                                      size="small"
                                      sx={{
                                        bgcolor: RED_SOFT,
                                        color: RED,
                                        fontSize: 10,
                                        height: 22,
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                {bg.laBaiGiangFree && (
                                  <Chip
                                    label="Miễn phí"
                                    size="small"
                                    sx={{
                                      bgcolor: "#e8f5e9",
                                      color: "#2e7d32",
                                      fontSize: 10,
                                      height: 22,
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.disabled",
                                    minWidth: 42,
                                    textAlign: "right",
                                    fontVariantNumeric: "tabular-nums",
                                  }}
                                >
                                  {formatLessonDuration(bg.thoiLuong)}
                                </Typography>
                              </LessonRow>
                            );
                          },
                        )}
                      </Box>
                    </PhanCard>
                  ))}
                </Stack>
              )}

              {tab === 2 && (
                <SectionCard>
                  {loadingDanhGia ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 6 }}
                    >
                      <CircularProgress sx={{ color: RED }} size={32} />
                    </Box>
                  ) : (
                    <>
                      {/* ── Tổng quan điểm ── */}
                      {danhGia && danhGia.tongSoDanhGia > 0 ? (
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={3}
                          sx={{ mb: 3.5, alignItems: "center" }}
                        >
                          {/* Điểm trung bình */}
                          <Box sx={{ textAlign: "center", flexShrink: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 56,
                                fontWeight: 900,
                                color: RED,
                                lineHeight: 1,
                              }}
                            >
                              {danhGia.diemTrungBinh.toFixed(1)}
                            </Typography>
                            <Rating
                              value={danhGia.diemTrungBinh}
                              readOnly
                              precision={0.1}
                              sx={{
                                "& .MuiRating-iconFilled": { color: "#e0a800" },
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "text.disabled",
                                mt: 0.5,
                              }}
                            >
                              {danhGia.tongSoDanhGia} đánh giá
                            </Typography>
                          </Box>

                          {/* Phân bổ sao */}
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
                                  sx={{ alignItems: "center", mb: 0.75 }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "text.secondary",
                                      minWidth: 8,
                                    }}
                                  >
                                    {star}
                                  </Typography>
                                  <StarIcon
                                    sx={{ fontSize: 14, color: "#e0a800" }}
                                  />
                                  <LinearProgress
                                    variant="determinate"
                                    value={pct}
                                    sx={{
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: "#f3e8e8",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor: "#e0a800",
                                        borderRadius: 4,
                                      },
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "text.disabled",
                                      minWidth: 28,
                                      textAlign: "right",
                                    }}
                                  >
                                    {count}
                                  </Typography>
                                </Stack>
                              );
                            })}
                          </Box>
                        </Stack>
                      ) : (
                        <Stack sx={{ alignItems: "center", py: 4 }} spacing={1}>
                          <StarIcon sx={{ fontSize: 40, color: "#f3e8e8" }} />
                          <Typography
                            sx={{ fontSize: 13.5, color: "text.secondary" }}
                          >
                            Chưa có đánh giá nào cho khóa học này.
                          </Typography>
                        </Stack>
                      )}

                      <Divider sx={{ mb: 3, borderColor: "#f3d9d9" }} />

                      {/* ── Form viết đánh giá ── */}
                      {enrolled && !daDanhGia && (
                        <Box
                          sx={{
                            mb: 3.5,
                            p: 2.5,
                            bgcolor: RED_SOFT,
                            borderRadius: 3,
                            border: `1px solid ${RED}22`,
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}
                          >
                            Chia sẻ đánh giá của bạn
                          </Typography>
                          <Stack
                            spacing={1}
                            sx={{ mb: 2, alignItems: "flex-start" }}
                          >
                            <Typography
                              sx={{ fontSize: 13, color: "text.secondary" }}
                            >
                              Số sao
                            </Typography>
                            <Rating
                              value={formDanhGia.soSao}
                              onChange={(_, v) =>
                                setFormDanhGia((p) => ({ ...p, soSao: v ?? 5 }))
                              }
                              size="large"
                              sx={{
                                "& .MuiRating-iconFilled": { color: "#e0a800" },
                              }}
                            />
                          </Stack>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                            value={formDanhGia.noiDung}
                            onChange={(e) =>
                              setFormDanhGia((p) => ({
                                ...p,
                                noiDung: e.target.value,
                              }))
                            }
                            sx={{
                              mb: 2,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
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
                                <CircularProgress
                                  size={14}
                                  sx={{ color: "#fff" }}
                                />
                              ) : (
                                <StarIcon />
                              )
                            }
                            sx={{
                              bgcolor: RED,
                              "&:hover": { bgcolor: RED_HOVER },
                              borderRadius: "10px",
                              fontWeight: 700,
                              textTransform: "none",
                            }}
                          >
                            {submittingDanhGia ? "Đang gửi..." : "Gửi đánh giá"}
                          </Button>
                        </Box>
                      )}

                      {enrolled && daDanhGia && (
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            bgcolor: "#f0fdf4",
                            border: "1px solid #86efac",
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <CheckCircleIcon
                            sx={{ color: "#22c55e", fontSize: 20 }}
                          />
                          <Typography
                            sx={{
                              fontSize: 13.5,
                              color: "#15803d",
                              fontWeight: 600,
                            }}
                          >
                            Bạn đã đánh giá khóa học này. Cảm ơn!
                          </Typography>
                        </Box>
                      )}

                      {!enrolled && (
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            bgcolor: "#fffbeb",
                            border: "1px solid #fde68a",
                            borderRadius: 3,
                          }}
                        >
                          <Typography sx={{ fontSize: 13, color: "#92400e" }}>
                            Bạn cần đăng ký khóa học để có thể đánh giá.
                          </Typography>
                        </Box>
                      )}

                      {/* ── Danh sách đánh giá ── */}
                      {(danhGia?.danhSach ?? []).length > 0 && (
                        <Stack spacing={2.5}>
                          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                            Đánh giá ({danhGia?.tongSoDanhGia})
                          </Typography>
                          {danhGia!.danhSach.map((dg) => (
                            <Stack key={dg.id} direction="row" spacing={2}>
                              <Avatar
                                src={dg.anhDaiDien}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: RED,
                                  fontSize: 16,
                                  flexShrink: 0,
                                }}
                              >
                                {(dg.tenNguoiDung ?? "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  sx={{ alignItems: "center", mb: 0.5 }}
                                >
                                  <Typography
                                    sx={{ fontWeight: 700, fontSize: 13.5 }}
                                  >
                                    {dg.tenNguoiDung ?? "Người dùng"}
                                  </Typography>
                                  <Rating
                                    value={dg.soSao}
                                    readOnly
                                    size="small"
                                    sx={{
                                      "& .MuiRating-iconFilled": {
                                        color: "#e0a800",
                                      },
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: 11.5,
                                      color: "text.disabled",
                                    }}
                                  >
                                    {new Date(dg.ngayTao).toLocaleDateString(
                                      "vi-VN",
                                    )}
                                  </Typography>
                                </Stack>
                                {dg.noiDung && (
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      color: "text.secondary",
                                      lineHeight: 1.7,
                                    }}
                                  >
                                    {dg.noiDung}
                                  </Typography>
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

        {/* ── Sidebar ── */}
        <Grid size={{ xs: 12, md: 4 }}>
          <SidebarCard>
            <ThumbBox bgimg={khoaHoc.hinhAnhKhoaHoc}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                {previewVideo && (
                  <Box
                    onClick={() => handleOpenPreviewVideo(previewVideo)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: alpha(RED, 0.92),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                      border: "3px solid rgba(255,255,255,0.25)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 10px 32px rgba(0,0,0,0.55)",
                      },
                    }}
                  >
                    <PlayArrowIcon sx={{ color: "#fff", fontSize: 30 }} />
                  </Box>
                )}
              </Box>

              {previewVideo && (
                <Chip
                  label="Xem thử miễn phí"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    bgcolor: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    fontSize: 10.5,
                    height: 24,
                    fontWeight: 600,
                    zIndex: 1,
                    backdropFilter: "blur(4px)",
                  }}
                />
              )}
            </ThumbBox>

            <Box sx={{ p: 2.75 }}>
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: "baseline", mb: 1.5 }}
              >
                <Typography
                  sx={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: isFree ? "#2d7a35" : RED,
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
                      fontSize: 13,
                      color: "text.disabled",
                      textDecoration: "line-through",
                    }}
                  >
                    {(khoaHoc.giaGoc ?? 0).toLocaleString("vi-VN")}₫
                  </Typography>
                )}
              </Stack>

              {!enrolled ? (
                isFree ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SchoolIcon />}
                    onClick={() => setModalOpen(true)}
                    sx={{
                      bgcolor: "#2d7a35",
                      "&:hover": { bgcolor: "#245f2a" },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      borderRadius: 2.5,
                      py: 1.35,
                      mb: 1.5,
                      boxShadow: `0 8px 20px ${alpha("#2d7a35", 0.3)}`,
                    }}
                  >
                    Đăng ký miễn phí
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={async () => {
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
                      bgcolor: RED,
                      "&:hover": { bgcolor: RED_HOVER },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      borderRadius: 2.5,
                      py: 1.35,
                      mb: 1.5,
                      boxShadow: `0 8px 20px ${alpha(RED, 0.3)}`,
                    }}
                  >
                    Mua ngay
                  </Button>
                )
              ) : (
                <Box sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: "#f0fdf4",
                      border: "1.5px solid #86efac",
                      borderRadius: "14px",
                      p: 2,
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 13.5,
                          color: "#15803d",
                        }}
                      >
                        Khóa học của bạn
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#16a34a" }}>
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
                        <SchoolIcon />
                      )
                    }
                    onClick={handleGoToLearning}
                    sx={{
                      bgcolor: "#22c55e",
                      "&:hover": { bgcolor: "#16a34a" },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 14.5,
                      borderRadius: 2.5,
                      py: 1.35,
                      boxShadow: "0 8px 20px rgba(34,197,94,0.3)",
                    }}
                  >
                    {navigatingToLearn ? "Đang mở khóa học..." : "Vào học ngay"}
                  </Button>
                </Box>
              )}

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ justifyContent: "center", mb: 2.5 }}
              >
                <VerifiedUserIcon
                  sx={{ fontSize: 14, color: "text.disabled" }}
                />
              </Stack>

              <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 1.5 }}>
                Khóa học bao gồm
              </Typography>
              <Stack spacing={1.25}>
                {[
                  {
                    icon: <PlayArrowIcon sx={{ fontSize: 17 }} />,
                    label: formatTongThoiLuong(khoaHoc.tongThoiLuong),
                  },
                  {
                    icon: <FolderIcon sx={{ fontSize: 17 }} />,
                    label: `${khoaHoc.tongTaiLieu ?? 0} tài nguyên tải về`,
                  },
                  {
                    icon: <DevicesIcon sx={{ fontSize: 17 }} />,
                    label: "Truy cập trên mọi thiết bị",
                  },
                  {
                    icon: <AllInclusiveIcon sx={{ fontSize: 17 }} />,
                    label: "Truy cập trọn đời",
                  },
                ].map((item, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        bgcolor: RED_SOFT,
                        color: RED,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{ fontSize: 12.5, color: "text.secondary" }}
                    >
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </SidebarCard>
        </Grid>
      </Grid>

      {/* ── Giảng viên & các khóa học khác (kiểu Udemy) ── */}
      <SectionCard sx={{ mt: 3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 22,
            mb: 3,
            letterSpacing: 0.2,
          }}
        >
          Giảng viên
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          sx={{ alignItems: { xs: "flex-start", sm: "flex-start" }, mb: 2.5 }}
        >
          <Box
            onClick={giangVienId ? goToInstructorProfile : undefined}
            sx={{ cursor: giangVienId ? "pointer" : "default", flexShrink: 0 }}
          >
            {giangVienDisplay.avatar ? (
              <Box
                component="img"
                src={giangVienDisplay.avatar}
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `2px solid ${RED_SOFT}`,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  bgcolor: RED,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {giangVienDisplay.ten.charAt(0).toUpperCase()}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
            <Typography
              onClick={giangVienId ? goToInstructorProfile : undefined}
              sx={{
                fontWeight: 700,
                fontSize: 19,
                color: RED,
                mb: 0.25,
                width: "fit-content",
                cursor: giangVienId ? "pointer" : "default",
                "&:hover": giangVienId
                  ? { textDecoration: "underline" }
                  : undefined,
              }}
            >
              {giangVienDisplay.ten}
            </Typography>
            {giangVienDisplay.chucDanh && (
              <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
                {giangVienDisplay.chucDanh}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Thống kê giảng viên — mỗi chỉ số một dòng, kiểu Udemy */}
        <Stack spacing={1} sx={{ mb: 2.75, maxWidth: 340 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <PlayCircleIcon sx={{ fontSize: 18, color: RED }} />
            <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
              <strong>
                {giangVienDisplay.tongKhoaHoc ?? giangVienKhoaHocs.length + 1}
              </strong>{" "}
              khóa học
            </Typography>
          </Stack>
          {typeof giangVienDisplay.tongHocVien === "number" && (
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <PeopleAltIcon sx={{ fontSize: 18, color: RED }} />
              <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
                <strong>
                  {giangVienDisplay.tongHocVien.toLocaleString("vi-VN")}
                </strong>{" "}
                học viên
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Tiểu sử giảng viên — render HTML vì nội dung được soạn từ rich-text editor */}
        {giangVienDisplay.moTa && (
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                fontSize: 13.5,
                color: "text.secondary",
                lineHeight: 1.85,
                "& p": { mb: 1 },
                "& p:last-child": { mb: 0 },
                "& ul, & ol": { pl: 2.5, mb: 1 },
                "& a": { color: RED },
                "& img": { maxWidth: "100%", borderRadius: 8 },
                "& strong, & b": { color: "text.primary" },
                ...(!bioExpanded && {
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }),
              }}
              dangerouslySetInnerHTML={{ __html: giangVienDisplay.moTa }}
            />
            <Button
              onClick={() => setBioExpanded((v) => !v)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                color: RED,
                px: 0,
                mt: 0.75,
                minWidth: 0,
                "&:hover": {
                  bgcolor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              {bioExpanded ? "Ẩn bớt" : "Hiển thị thêm"}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2.75, borderColor: "#f3d9d9" }} />

        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
            Khóa học khác của {giangVienDisplay.ten}
          </Typography>
        </Stack>

        {loadingGiangVien ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={26} sx={{ color: RED }} thickness={4} />
          </Box>
        ) : giangVienKhoaHocs.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.disabled", mb: 2 }}>
            Giảng viên chưa có khóa học nào khác.
          </Typography>
        ) : (
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
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
                      borderRadius: 3,
                      border: "1px solid #f3d9d9",
                      overflow: "hidden",
                      cursor: kh.id ? "pointer" : "default",
                      transition: "box-shadow 0.2s ease, transform 0.2s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": kh.id
                        ? {
                          boxShadow: "0 10px 26px rgba(141,19,19,0.14)",
                          transform: "translateY(-2px)",
                        }
                        : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "56%",
                        bgcolor: "#1c1d1f",
                        backgroundImage: kh.hinhAnhKhoaHoc
                          ? `url(${kh.hinhAnhKhoaHoc})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <Box sx={{ p: 1.75, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 36,
                        }}
                      >
                        {kh.tieuDe}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: khFree ? "#2d7a35" : RED,
                        }}
                      >
                        {khFree
                          ? "Miễn phí"
                          : khGia > 0
                            ? `${khGia.toLocaleString("vi-VN")}₫`
                            : "Liên hệ"}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {giangVienId && (
          <Button
            onClick={goToInstructorProfile}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13.5,
              color: RED,
              px: 0,
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            Xem thêm khóa học của {giangVienDisplay.ten}
          </Button>
        )}
      </SectionCard>

      {/* ── Confirm dialog ── */}
      <Dialog
        open={modalOpen}
        onClose={() => !registering && setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4 } } }}
      >
        <DialogContent sx={{ p: 3.5 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 0.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Xác nhận đăng ký
            </Typography>
            <IconButton
              size="small"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{ color: "text.disabled" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2.5 }}>
            {isFree
              ? "Bạn sắp đăng ký khóa học sau hoàn toàn miễn phí."
              : "Bạn sắp đăng ký khóa học sau."}
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              bgcolor: RED_SOFT,
              borderRadius: 3,
              p: 1.75,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: RED,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <SchoolIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                {khoaHoc.tieuDe}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                {khoaHoc.tongBaiGiang ?? 0} bài học ·{" "}
                {formatTongThoiLuong(khoaHoc.tongThoiLuong)}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.25}>
            <Button
              fullWidth
              variant="contained"
              disabled={registering}
              onClick={handleRegister}
              startIcon={
                registering ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : (
                  <SchoolIcon />
                )
              }
              sx={{
                bgcolor: RED,
                "&:hover": { bgcolor: RED_HOVER },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.35,
              }}
            >
              {registering ? "Đang đăng ký..." : "Xác nhận đăng ký"}
            </Button>
            <Button
              fullWidth
              variant="text"
              disabled={registering}
              onClick={() => setModalOpen(false)}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Hủy bỏ
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── Video preview player ── */}
      <Dialog
        open={videoPlayer.open}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              bgcolor: "#111214",
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.08)",
              m: 2,
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(10,10,10,0.7)",
              backdropFilter: "blur(6px)",
            },
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          sx={{
            px: 2.25,
            py: 1.5,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: alpha(RED, 0.18),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PlayCircleIcon sx={{ fontSize: 17, color: RED }} />
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 600,
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
              bgcolor: "rgba(255,255,255,0.06)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#fff",
              },
              flexShrink: 0,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Video player */}
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
              size={40}
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
            <Typography sx={{ color: "#fff", fontSize: 13 }}>
              Không thể tải video
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
          sx={{ borderRadius: 2.5 }}
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
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentDashboardShell>
        <Box sx={{ mt: 0, pb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4.5 },
              borderRadius: "28px",
              border: "1px solid rgba(141,19,19,0.06)",
              bgcolor: "var(--ev-paper, #FFFFFF)",
              boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
            }}
          >
            <CourseRegistrationContent />
          </Paper>
        </Box>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
