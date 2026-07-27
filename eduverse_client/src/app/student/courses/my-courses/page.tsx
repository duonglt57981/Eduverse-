"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Paper,
  Stack,
  alpha,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  debounce,
  SelectChangeEvent,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import SignalWifiOffIcon from "@mui/icons-material/SignalWifiOff";
import LoginIcon from "@mui/icons-material/Login";
import SearchIcon from "@mui/icons-material/Search";
import AuthGuard from "@/src/components/AuthGuard";
import StudentDashboardShell from "@/src/components/dashboard/StudentDashboardShell";

import { KhoaHocDangKiSearch, KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import KhoaHocService from "@/src/services/KhoaHocService";

// ─── constants ────────────────────────────────────────────────────────────────

const RED = "#8B1313";
const RED_HOVER = "#6B1010";
const RED_LIGHT = "#B22222";

// ─── token helpers ────────────────────────────────────────────────────────────

function getRawToken(): string | null {
  if (typeof window === "undefined") return null;
  const possibleKeys = [
    "AccessToken",
    "accessToken",
    "token",
    "jwt",
    "authToken",
  ];
  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getUserIdFromToken(): string | null {
  const token = getRawToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const possibleKeys = [
    "sub",
    "id",
    "userId",
    "user_id",
    "nameid",
    "unique_name",
    "username",
    "UserName",
    "email",
    "Email",
    "Id",
    "UserID",
    "ID",
    "User_Id",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  ];

  for (const key of possibleKeys) {
    const val = payload[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val);
    }
  }
  return null;
}

// ─── type helpers ─────────────────────────────────────────────────────────────

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

interface ErrorWithResponse {
  response?: { status?: number; data?: unknown };
}

function hasResponse(err: unknown): err is ErrorWithResponse {
  return typeof err === "object" && err !== null && "response" in err;
}

function isValidImage(url?: string): boolean {
  if (!url) return false;
  const t = url.trim();
  if (!t || t === "không có" || t === "aaaaaaaa") return false;
  return t.startsWith("http");
}

type ErrorDetail = { type: "backend" | "network" | "auth"; message: string };

const AUTH_ERROR: ErrorDetail = {
  type: "auth",
  message: "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.",
};

// ─── API response type helpers ──────────────────────────────────────────────

interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

interface PagedList<T> {
  items: T[];
  totalCount?: number;
  pageIndex?: number;
  pageSize?: number;
}

function isPagedList<T>(value: unknown): value is PagedList<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray((value as { items: unknown }).items)
  );
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return typeof value === "object" && value !== null && "data" in value;
}

function extractCourseItems(response: unknown): KhoaHocType[] {
  if (Array.isArray(response)) {
    return response as KhoaHocType[];
  }
  if (isPagedList<KhoaHocType>(response)) {
    return response.items;
  }
  if (isApiResponse<unknown>(response)) {
    const inner = response.data;
    if (Array.isArray(inner)) {
      return inner as KhoaHocType[];
    }
    if (isPagedList<KhoaHocType>(inner)) {
      return inner.items;
    }
  }
  return [];
}

// ─── animations ───────────────────────────────────────────────────────────────

const pulseRing = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.2; }
  100% { transform: scale(0.8); opacity: 0.5; }
`;

const shakeIcon = keyframes`
  0%, 100% { transform: translate(0,0) rotate(0deg); }
  20% { transform: translate(-2px,2px) rotate(-5deg); }
  40% { transform: translate(2px,-2px) rotate(5deg); }
  60% { transform: translate(-1px,1px) rotate(-3deg); }
  80% { transform: translate(1px,-1px) rotate(3deg); }
`;

const blinkText = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const waveLine = keyframes`
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1); opacity: 0.6; }
  100% { transform: scaleX(0); opacity: 0; }
`;

// ─── styled components ────────────────────────────────────────────────────────

const CourseCard = styled(Card)(() => ({
  cursor: "pointer",
  borderRadius: 16,
  border: "1px solid #fde8e8",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition:
    "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
  boxShadow: "0 2px 12px rgba(141,19,19,0.07)",
  overflow: "hidden",
  backgroundColor: "#fff",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 12px 32px rgba(141,19,19,0.18)",
    borderColor: alpha(RED, 0.35),
  },
}));

const ThumbBox = styled(Box)({
  position: "relative",
  paddingTop: "56.25%",
  overflow: "hidden",
  backgroundColor: "#fde8e8",
});

const ThumbImg = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s ease",
});

const StatCard = styled(Paper)(() => ({
  padding: "1.25rem",
  borderRadius: 14,
  border: "1px solid #fde8e8",
  boxShadow: "0 2px 12px rgba(141,19,19,0.06)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  backgroundColor: "#fff",
}));

const CourseProgress = styled(LinearProgress)(() => ({
  height: 4,
  borderRadius: 0,
  backgroundColor: "#fde8e8",
  "& .MuiLinearProgress-bar": {
    borderRadius: 0,
    backgroundColor: RED,
  },
}));

// ─── sub-components ───────────────────────────────────────────────────────────

const ConnectionLostAnimation = ({ type }: { type: "backend" | "network" }) => {
  const isNetwork = type === "network";
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 120,
            height: 120,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            backgroundColor: alpha(RED, 0.15),
            animation: `${pulseRing} 2s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 160,
            height: 60,
            transform: "translate(-50%,-50%)",
            display: "flex",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 30,
                backgroundColor: alpha(RED, 0.6),
                borderRadius: 2,
                animation: `${waveLine} 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            animation: `${shakeIcon} 0.8s ease-in-out infinite`,
            display: "inline-block",
            p: 2,
            borderRadius: "50%",
            backgroundColor: alpha(RED, 0.1),
          }}
        >
          {isNetwork ? (
            <SignalWifiOffIcon sx={{ fontSize: 80, color: RED }} />
          ) : (
            <CloudOffIcon sx={{ fontSize: 80, color: RED }} />
          )}
        </Box>
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: RED,
          mb: 1,
          animation: `${blinkText} 1.5s ease-in-out infinite`,
        }}
      >
        {isNetwork ? "MẤT KẾT NỐI INTERNET" : "BACKEND KHÔNG HOẠT ĐỘNG"}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 300, mx: "auto" }}
      >
        {isNetwork
          ? "Vui lòng kiểm tra kết nối mạng của bạn"
          : "Hệ thống đang gặp vấn đề, vui lòng thử lại sau"}
      </Typography>
    </Box>
  );
};

const ThumbPlaceholder = ({ title }: { title?: string }) => {
  const palettes: [string, string][] = [
    ["#fff5f5", RED],
    ["#fde8e8", RED_LIGHT],
    ["#fff0f0", "#922b21"],
    ["#fdf2f2", "#c0392b"],
    ["#fef9f9", "#e74c3c"],
  ];
  const idx = (title?.charCodeAt(0) ?? 0) % palettes.length;
  const [bg, fg] = palettes[idx];
  const initials =
    title
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "KH";
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(135deg, ${bg}, ${alpha(fg, 0.12)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        sx={{ fontSize: 40, fontWeight: 700, color: fg, opacity: 0.45 }}
      >
        {initials}
      </Typography>
    </Box>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

function MyCoursesContent() {
  const router = useRouter();

  // ── userId ──────────────────────────────────────────────────────────────────
  const userId = useMemo(() => getUserIdFromToken(), []);

  // ── filter state ────────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useState<KhoaHocDangKiSearch>({
    keyword: "",
    trangThai: "TatCa",
    sapXepNgay: "Moi",
    pageIndex: 1,
    pageSize: 100,
  });

  // ── course data state ──────────────────────────────────────────────────────
  const [courses, setCourses] = useState<KhoaHocType[]>([]);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(
    userId ? null : AUTH_ERROR,
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  // ── fetch function ──────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    if (!userId) {
      setErrorDetail(AUTH_ERROR);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorDetail(null);

    try {
      const search: KhoaHocDangKiSearch = {
        keyword: searchParams.keyword?.trim() || undefined,
        trangThai:
          searchParams.trangThai === "TatCa"
            ? undefined
            : searchParams.trangThai,
        pageIndex: searchParams.pageIndex,
        pageSize: searchParams.pageSize,
      };

      if (searchParams.sapXepNgay) {
        search.sapXepNgay = searchParams.sapXepNgay;
      } else if (searchParams.sapXepTen) {
        search.sapXepTen = searchParams.sapXepTen;
      }

      const response = await khoaHocService.GetListDangKi(search);
      const items = extractCourseItems(response);
      setCourses(items);
      // Không xóa courses cũ khi bắt đầu tải
    } catch (err: unknown) {
      let type: ErrorDetail["type"] = "backend";
      let message = "Không thể tải danh sách khóa học. Vui lòng thử lại sau.";

      const msg = getErrorMessage(err);
      const isNetworkError =
        msg.includes("NetworkError") ||
        msg.includes("Failed to fetch") ||
        msg.includes("ECONNABORTED");

      if (!navigator.onLine) {
        type = "network";
        message =
          "Không có kết nối Internet. Vui lòng kiểm tra lại kết nối mạng.";
      } else if (isNetworkError) {
        type = "network";
        message =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else if (hasResponse(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          type = "auth";
          message =
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
        } else if (
          status &&
          (status >= 500 || status === 503 || status === 502)
        ) {
          type = "backend";
          message =
            "Backend đang tạm thời không hoạt động. Vui lòng thử lại sau.";
        } else if (status === 404) {
          type = "backend";
          message =
            "Không tìm thấy API hoặc dịch vụ backend. Vui lòng liên hệ quản trị viên.";
        }
      }

      setErrorDetail({ type, message });
      // Xóa danh sách cũ khi có lỗi (trừ lỗi auth thì giữ nguyên? Ở đây ta xóa để hiển thị thông báo)
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [khoaHocService, userId, searchParams]);

  // ── debounced fetch ─────────────────────────────────────────────────────────
  const debouncedFetch = useMemo(
    () => debounce(() => fetchCourses(), 400),
    [fetchCourses],
  );

  // ── effect: fetch on filter changes ────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    debouncedFetch();
    return () => debouncedFetch.clear();
  }, [
    searchParams.keyword,
    searchParams.trangThai,
    searchParams.sapXepNgay,
    searchParams.sapXepTen,
    userId,
    debouncedFetch,
  ]);

  // ── effect: initial load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    const load = async () => {
      if (!isMounted) return;
      await fetchCourses();
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userId, fetchCourses]);

  // ── online/offline listeners ──────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      if (errorDetail?.type === "network" && userId) fetchCourses();
    };
    const handleOffline = () => {
      setErrorDetail({
        type: "network",
        message: "Mất kết nối Internet. Vui lòng kiểm tra lại kết nối mạng.",
      });
      setCourses([]);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [errorDetail?.type, fetchCourses, userId]);

  // ── stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = courses.length;
    const inProgress = courses.filter(
      (c) => (c.phanTramHoanThanh ?? 0) > 0 && (c.phanTramHoanThanh ?? 0) < 100,
    ).length;
    const completed = courses.filter(
      (c) => (c.phanTramHoanThanh ?? 0) >= 100,
    ).length;
    const avg =
      total > 0
        ? Math.round(
            courses.reduce((s, c) => s + (c.phanTramHoanThanh ?? 0), 0) / total,
          )
        : 0;
    return { total, inProgress, completed, avg };
  }, [courses]);

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleCourseClick = (registrationId?: string) => {
    if (registrationId) {
      router.push(`/student/courses/my-courses/learning/${registrationId}`);
    }
  };

  const handleRetry = () => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }
    fetchCourses();
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev: KhoaHocDangKiSearch) => ({
      ...prev,
      keyword: e.target.value,
      pageIndex: 1,
    }));
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSearchParams((prev: KhoaHocDangKiSearch) => {
      const newParams: KhoaHocDangKiSearch = { ...prev, pageIndex: 1 };
      delete newParams.sapXepNgay;
      delete newParams.sapXepTen;
      if (value === "Moi") newParams.sapXepNgay = "Moi";
      else if (value === "Cu") newParams.sapXepNgay = "Cu";
      else if (value === "AZ") newParams.sapXepTen = "AZ";
      else if (value === "ZA") newParams.sapXepTen = "ZA";
      return newParams;
    });
  };

  // ── render helpers ──────────────────────────────────────────────────────────
  const renderStats = () => {
    const statItems = [
      {
        icon: <SchoolIcon />,
        val: stats.total,
        lbl: "Đã đăng ký",
        bg: alpha(RED, 0.08),
        color: RED,
      },
      {
        icon: <TrendingUpIcon />,
        val: stats.inProgress,
        lbl: "Đang học",
        bg: "#fff8e1",
        color: "#f57f17",
      },
      {
        icon: <CheckCircleIcon />,
        val: stats.completed,
        lbl: "Hoàn thành",
        bg: "#e8f5e9",
        color: "#2e7d32",
      },
      {
        icon: <VideoLibraryIcon />,
        val: `${stats.avg}%`,
        lbl: "Tiến độ TB",
        bg: "#fde8e8",
        color: RED_LIGHT,
      },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statItems.map((s, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <StatCard>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  bgcolor: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: s.color,
                  flexShrink: 0,
                }}
              >
                {s.icon}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: s.color,
                  }}
                >
                  {s.val}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.lbl}
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCourseGrid = () => {
    // Hiển thị khi đang tải lần đầu (chưa có dữ liệu)
    if (loading && courses.length === 0) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: RED }} />
        </Box>
      );
    }

    // Hiển thị lỗi
    if (errorDetail) {
      const isAuthError = errorDetail.type === "auth";
      return (
        <Box sx={{ maxWidth: 560, mx: "auto", py: 4, textAlign: "center" }}>
          {!isAuthError && (
            <ConnectionLostAnimation
              type={errorDetail.type === "network" ? "network" : "backend"}
            />
          )}
          <Alert
            severity={
              isAuthError
                ? "warning"
                : errorDetail.type === "network"
                  ? "warning"
                  : "error"
            }
            sx={{ mb: 3, mt: 2, "& .MuiAlert-icon": { fontSize: 28 } }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {isAuthError
                ? "🔐 Phiên đăng nhập hết hạn"
                : errorDetail.type === "network"
                  ? "⚠️ Lỗi kết nối mạng"
                  : "⚠️ Lỗi từ hệ thống"}
            </Typography>
            <Typography variant="body2">{errorDetail.message}</Typography>
          </Alert>
          <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
            {isAuthError ? (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => router.push("/auth/login")}
                sx={{
                  bgcolor: RED,
                  "&:hover": { bgcolor: RED_HOVER },
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                }}
              >
                Đăng nhập lại
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRetry}
                sx={{
                  bgcolor: RED,
                  "&:hover": { bgcolor: RED_HOVER },
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                }}
              >
                Thử lại
              </Button>
            )}
            <Button
              component={Link}
              href="/"
              color="inherit"
              sx={{ textDecoration: "none" }}
            >
              Quay về trang chủ
            </Button>
          </Stack>
        </Box>
      );
    }

    // Không có khóa học
    if (courses.length === 0) {
      return (
        <Box sx={{ maxWidth: 480, mx: "auto", py: 8, textAlign: "center" }}>
          <VideoLibraryIcon
            sx={{ fontSize: 72, color: alpha(RED, 0.2), mb: 2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Bạn chưa đăng ký khóa học nào
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Hãy khám phá các khóa học và bắt đầu học ngay!
          </Typography>
          <Button
            component={Link}
            href="/KhoaHoc"
            variant="contained"
            size="large"
            sx={{
              bgcolor: RED,
              "&:hover": { bgcolor: RED_HOVER },
              borderRadius: 3,
            }}
          >
            Khám phá khóa học
          </Button>
        </Box>
      );
    }

    // Có dữ liệu: hiển thị grid với lớp phủ loading (nếu đang tải)
    return (
      <Box sx={{ position: "relative" }}>
        {loading && courses.length > 0 && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.7)",
              zIndex: 1,
              borderRadius: 2,
            }}
          >
            <CircularProgress sx={{ color: RED }} />
          </Box>
        )}
        <Grid container spacing={3}>
          {courses.map((course) => {
            const registrationId = course.idDangKiKhoaHoc;
            const hasImg =
              isValidImage(course.hinhAnhKhoaHoc) &&
              !imageErrors[registrationId ?? ""];
            const progress = course.phanTramHoanThanh ?? 0;
            const minutes = Math.floor((course.tongThoiLuong ?? 0) / 60);

            return (
              <Grid
                key={registrationId || course.id}
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              >
                <CourseCard onClick={() => handleCourseClick(registrationId)}>
                  <ThumbBox>
                    {hasImg ? (
                      <ThumbImg
                        src={course.hinhAnhKhoaHoc ?? ""}
                        alt={course.tieuDe}
                        onError={() =>
                          setImageErrors((prev: Record<string, boolean>) => ({
                            ...prev,
                            [registrationId ?? ""]: true,
                          }))
                        }
                      />
                    ) : (
                      <ThumbPlaceholder title={course.tieuDe} />
                    )}
                    {progress > 0 && progress < 100 && (
                      <Chip
                        label={`${progress}%`}
                        size="small"
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          bgcolor: "rgba(0,0,0,0.65)",
                          color: "#fff",
                          fontSize: "0.7rem",
                          backdropFilter: "blur(4px)",
                          height: 22,
                        }}
                      />
                    )}
                    {progress >= 100 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "#2e7d32",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
                      </Box>
                    )}
                  </ThumbBox>

                  <CourseProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                  />

                  <CardContent
                    sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        mb: 1,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {course.tieuDe}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <MenuBookIcon
                          sx={{ fontSize: 13, color: "text.disabled" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {course.tongBaiGiang ?? 0} bài
                        </Typography>
                      </Box>
                      {minutes > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 13, color: "text.disabled" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {minutes} phút
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Box sx={{ mb: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Tiến độ
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: RED }}
                        >
                          {course.soBaiGiangHoanThanh ?? 0}/
                          {course.tongBaiGiang ?? 0} bài
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#fde8e8",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            bgcolor: RED,
                          },
                        }}
                      />
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(registrationId);
                      }}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        bgcolor: RED,
                        "&:hover": { bgcolor: RED_HOVER },
                      }}
                    >
                      {progress === 0
                        ? "Bắt đầu học"
                        : progress >= 100
                          ? "Xem lại"
                          : "Tiếp tục học"}
                    </Button>
                  </CardContent>
                </CourseCard>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // ── main render ────────────────────────────────────────────────────────────

  // Nếu không có userId (lỗi auth) thì hiển thị toàn màn hình lỗi
  if (!userId) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", py: 6, textAlign: "center" }}>
        <ConnectionLostAnimation type="backend" />
        <Alert severity="warning" sx={{ mb: 3, mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            🔐 Phiên đăng nhập hết hạn
          </Typography>
          <Typography variant="body2">{AUTH_ERROR.message}</Typography>
        </Alert>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => router.push("/auth/login")}
            sx={{
              bgcolor: RED,
              "&:hover": { bgcolor: RED_HOVER },
              borderRadius: 2,
              px: 4,
              py: 1,
            }}
          >
            Đăng nhập lại
          </Button>
          <Button
            component={Link}
            href="/"
            color="inherit"
            sx={{ textDecoration: "none" }}
          >
            Quay về trang chủ
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: RED, mb: 0.5 }}>
          Khóa học của tôi
        </Typography>
        <Typography color="text.secondary">
          Tiếp tục học những khóa học bạn đã đăng ký
        </Typography>
      </Box>

      {/* Stats */}
      {renderStats()}

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 3,
          border: "1px solid #fde8e8",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          backgroundColor: "#fefafa",
        }}
      >
        <TextField
          placeholder="Tìm kiếm khóa học..."
          value={searchParams.keyword}
          onChange={handleKeywordChange}
          size="small"
          sx={{ flexGrow: 1, minWidth: 180 }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sắp xếp</InputLabel>
          <Select
            value={
              searchParams.sapXepNgay === "Moi"
                ? "Moi"
                : searchParams.sapXepNgay === "Cu"
                  ? "Cu"
                  : searchParams.sapXepTen === "AZ"
                    ? "AZ"
                    : searchParams.sapXepTen === "ZA"
                      ? "ZA"
                      : "Moi"
            }
            onChange={handleSortChange}
            label="Sắp xếp"
          >
            <MenuItem value="Moi">Mới nhất</MenuItem>
            <MenuItem value="Cu">Cũ nhất</MenuItem>
            <MenuItem value="AZ">Tên A → Z</MenuItem>
            <MenuItem value="ZA">Tên Z → A</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Course Grid Area */}
      {renderCourseGrid()}
    </Box>
  );
}

// ─── exported page ────────────────────────────────────────────────────────────

export default function StudentCoursesPage() {
  return (
    <AuthGuard allowedRoles={["HocVien", "GiaoVien"]}>
      <StudentDashboardShell>
        <Paper
          elevation={0}
          sx={{
            p: 4.5,
            borderRadius: "24px",
            border: "1px solid rgba(141,19,19,0.06)",
            bgcolor: "#ffffff",
            boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
          }}
        >
          <MyCoursesContent />
        </Paper>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
