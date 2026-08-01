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

const RED = "#991B1B";
const RED_HOVER = "#7F1D1D";
const RED_LIGHT = "#D97706";
const TEXT_MAIN = "var(--ev-text-primary, #1E293B)";
const TEXT_MUTED = "var(--ev-text-muted, #64748B)";

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
  borderRadius: 20,
  border: "1px solid #E2E8F0",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  overflow: "hidden",
  backgroundColor: "var(--ev-paper, #fff)",
  position: "relative",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
    borderColor: "#CBD5E1",
  },
  "&:hover img": {
    transform: "scale(1.04)",
  }
}));

const ThumbBox = styled(Box)({
  position: "relative",
  paddingTop: "56.25%",
  overflow: "hidden",
  backgroundColor: "var(--ev-paper-alt, #F1F5F9)",
});

const ThumbImg = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
});

const StatCard = styled(Paper)(() => ({
  padding: "1.5rem 1.25rem",
  borderRadius: 16,
  border: "1px solid #E2E8F0",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  backgroundColor: "var(--ev-paper, #fff)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    transform: "translateY(-2px)",
    borderColor: "#CBD5E1",
  }
}));

const CourseProgress = styled(LinearProgress)(() => ({
  height: 3,
  backgroundColor: "var(--ev-divider, #E2E8F0)",
  "& .MuiLinearProgress-bar": {
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
            backgroundColor: alpha(RED, 0.08),
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
                backgroundColor: alpha(RED, 0.4),
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
            p: 2.5,
            borderRadius: "50%",
            backgroundColor: alpha(RED, 0.05),
          }}
        >
          {isNetwork ? (
            <SignalWifiOffIcon sx={{ fontSize: 64, color: RED }} />
          ) : (
            <CloudOffIcon sx={{ fontSize: 64, color: RED }} />
          )}
        </Box>
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: "var(--ev-text-primary, #1E293B)",
          mb: 1.5,
        }}
      >
        {isNetwork ? "Mất kết nối Internet" : "Hệ thống đang bảo trì"}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "var(--ev-text-secondary, #64748B)", maxWidth: 320, mx: "auto", fontSize: 14.5, lineHeight: 1.6 }}
      >
        {isNetwork
          ? "Vui lòng kiểm tra lại kết nối mạng Wifi/3G/4G của bạn."
          : "Máy chủ đang quá tải hoặc gặp lỗi kết nối. Chúng tôi sẽ sớm hoạt động trở lại."}
      </Typography>
    </Box>
  );
};

const ThumbPlaceholder = ({ title }: { title?: string }) => {
  const palettes: [string, string][] = [
    ["#F8FAFC", "#64748B"],
    ["#F1F5F9", "#475569"],
    ["#EEF2F6", "#334155"],
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
        background: `linear-gradient(135deg, ${bg}, ${alpha(fg, 0.08)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        sx={{ fontSize: 36, fontWeight: 800, color: fg, opacity: 0.4, letterSpacing: "1px" }}
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
        icon: <SchoolIcon sx={{ fontSize: 22 }} />,
        val: stats.total,
        lbl: "Đã đăng ký",
        bg: "rgba(153, 27, 27, 0.06)",
        color: RED,
      },
      {
        icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
        val: stats.inProgress,
        lbl: "Đang học",
        bg: "rgba(217, 119, 6, 0.06)",
        color: "#D97706",
      },
      {
        icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
        val: stats.completed,
        lbl: "Hoàn thành",
        bg: "rgba(22, 163, 74, 0.06)",
        color: "#16A34A",
      },
      {
        icon: <VideoLibraryIcon sx={{ fontSize: 22 }} />,
        val: `${stats.avg}%`,
        lbl: "Tiến độ TB",
        bg: "rgba(37, 99, 235, 0.06)",
        color: "#2563EB",
      },
    ];

    return (
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statItems.map((s, i) => (
          <Grid key={i} size={{ xs: 6, sm: 3 }}>
            <StatCard>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
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
                    fontSize: 22,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "var(--ev-text-primary, #0F172A)",
                  }}
                >
                  {s.val}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "var(--ev-text-secondary, #64748B)", fontWeight: 500, mt: 0.5 }}>
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
            author-alert="true"
            severity={
              isAuthError
                ? "warning"
                : errorDetail.type === "network"
                  ? "warning"
                  : "error"
            }
            sx={{ mb: 4, mt: 3, borderRadius: "14px", "& .MuiAlert-icon": { fontSize: 24 } }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, textAlign: "left" }}>
              {isAuthError
                ? "Phiên đăng nhập hết hạn"
                : errorDetail.type === "network"
                  ? "Lỗi kết nối mạng"
                  : "Lỗi hệ thống"}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "left" }}>{errorDetail.message}</Typography>
          </Alert>
          <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
            {isAuthError ? (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => router.push("/auth/login")}
                sx={{
                  bgcolor: RED,
                  borderRadius: "12px",
                  px: 4,
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: RED_HOVER,
                    boxShadow: "none",
                  }
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
                  borderRadius: "12px",
                  px: 4,
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: RED_HOVER,
                    boxShadow: "none",
                  }
                }}
              >
                Thử lại
              </Button>
            )}
            <Button
              component={Link}
              href="/"
              color="inherit"
              sx={{ textDecoration: "none", textTransform: "none", fontWeight: 700 }}
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
        <Box sx={{ maxWidth: 480, mx: "auto", py: 10, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(153, 27, 27, 0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              color: RED,
            }}
          >
            <VideoLibraryIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "var(--ev-text-primary, #1E293B)" }}>
            Chưa có khóa học nào
          </Typography>
          <Typography sx={{ color: "var(--ev-text-secondary, #64748B)", mb: 4, fontSize: 15 }}>
            Hành trình học tập của bạn đang chờ đợi. Hãy khám phá kho khóa học đa dạng của chúng tôi để bắt đầu ngay!
          </Typography>
          <Button
            component={Link}
            href="/KhoaHoc"
            variant="contained"
            size="large"
            sx={{
              bgcolor: RED,
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              px: 4,
              py: 1.5,
              boxShadow: "none",
              "&:hover": {
                bgcolor: RED_HOVER,
                boxShadow: "none",
              }
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

            const isCompleted = progress >= 100;
            const progressColor = isCompleted ? "#16A34A" : RED;
            const progressBg = isCompleted ? "rgba(22, 163, 74, 0.1)" : "#F1F5F9";

            return (
              <Grid
                key={registrationId || course.id}
                size={{ xs: 12, sm: 6, md: 4 }}
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
                          bgcolor: "rgba(15, 23, 42, 0.8)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.75rem",
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
                          bgcolor: "#16A34A",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        }}
                      >
                        <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
                      </Box>
                    )}
                  </ThumbBox>

                  <CourseProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                    sx={{
                      "& .MuiLinearProgress-bar": {
                        bgcolor: progressColor,
                      }
                    }}
                  />

                  <CardContent
                    sx={{ flexGrow: 1, p: 2.5, "&:last-child": { pb: 2.5 } }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 15,
                        mb: 1.25,
                        lineHeight: 1.4,
                        color: "var(--ev-text-primary, #1E293B)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        height: 42,
                      }}
                    >
                      {course.tieuDe}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                      >
                        <MenuBookIcon
                          sx={{ fontSize: 15, color: "var(--ev-text-muted, #94A3B8)" }}
                        />
                        <Typography variant="caption" sx={{ color: "var(--ev-text-secondary, #64748B)", fontWeight: 600 }}>
                          {course.tongBaiGiang ?? 0} bài học
                        </Typography>
                      </Box>
                      {minutes > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 15, color: "var(--ev-text-muted, #94A3B8)" }}
                          />
                          <Typography variant="caption" sx={{ color: "var(--ev-text-secondary, #64748B)", fontWeight: 600 }}>
                            {minutes} phút
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Box sx={{ mb: 2.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.75,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "var(--ev-text-secondary, #64748B)", fontWeight: 600 }}>
                          Tiến độ học tập
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: progressColor }}
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
                          bgcolor: progressBg,
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 3,
                            bgcolor: progressColor,
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
                        fontWeight: 700,
                        borderRadius: "10px",
                        py: 1,
                        bgcolor: isCompleted ? "rgba(22, 163, 74, 0.08)" : RED,
                        color: isCompleted ? "#16A34A" : "#fff",
                        boxShadow: "none",
                        border: isCompleted ? "1px solid rgba(22, 163, 74, 0.2)" : "none",
                        "&:hover": {
                          bgcolor: isCompleted ? "rgba(22, 163, 74, 0.15)" : RED_HOVER,
                          boxShadow: "none",
                        },
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
      <Box sx={{ maxWidth: 560, mx: "auto", py: 8, textAlign: "center" }}>
        <ConnectionLostAnimation type="backend" />
        <Alert severity="warning" sx={{ mb: 4, mt: 3, borderRadius: "14px" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, textAlign: "left" }}>
            🔐 Phiên đăng nhập hết hạn
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "left" }}>{AUTH_ERROR.message}</Typography>
        </Alert>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => router.push("/auth/login")}
            sx={{
              bgcolor: RED,
              borderRadius: "12px",
              px: 4,
              py: 1.25,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": {
                bgcolor: RED_HOVER,
                boxShadow: "none",
              }
            }}
          >
            Đăng nhập lại
          </Button>
          <Button
            component={Link}
            href="/"
            color="inherit"
            sx={{ textDecoration: "none", textTransform: "none", fontWeight: 700 }}
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
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: TEXT_MAIN, letterSpacing: "-0.5px" }}>
          Khóa học của tôi
        </Typography>
        <Typography sx={{ color: TEXT_MUTED, fontSize: 15 }}>
          Tiếp tục hành trình chinh phục tri thức và hoàn thành các khóa học của bạn
        </Typography>
      </Box>

      {/* Stats */}
      {renderStats()}

      {/* Filter Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          alignItems: "center",
          mb: 4,
          width: "100%",
        }}
      >
        <TextField
          placeholder="Tìm kiếm khóa học..."
          value={searchParams.keyword}
          onChange={handleKeywordChange}
          size="small"
          sx={{
            flexGrow: 1,
            width: "100%",
            "& .MuiOutlinedInput-root": {
              height: 40,
              borderRadius: "12px",
              bgcolor: "var(--ev-paper, #fff)",
              "& fieldset": { borderColor: "var(--ev-divider, #E2E8F0)" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: RED },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon sx={{ color: "var(--ev-text-muted, #94A3B8)", mr: 1, fontSize: 20 }} />
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
          <InputLabel id="sort-select-label" sx={{ fontSize: 14, "&.Mui-focused": { color: RED } }}>Sắp xếp</InputLabel>
          <Select
            labelId="sort-select-label"
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
            sx={{
              height: 40,
              borderRadius: "12px",
              bgcolor: "var(--ev-paper, #fff)",
              "&.MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "var(--ev-divider, #E2E8F0)" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: RED },
              }
            }}
          >
            <MenuItem value="Moi">Mới nhất</MenuItem>
            <MenuItem value="Cu">Cũ nhất</MenuItem>
            <MenuItem value="AZ">Tên A → Z</MenuItem>
            <MenuItem value="ZA">Tên Z → A</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
            p: { xs: 2.5, md: 4.5 },
            borderRadius: "24px",
            border: "1px solid #E2E8F0",
            bgcolor: "var(--ev-paper, #ffffff)",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px 0 rgba(0, 0, 0, 0.01)",
          }}
        >
          <MyCoursesContent />
        </Paper>
      </StudentDashboardShell>
    </AuthGuard>
  );
}
