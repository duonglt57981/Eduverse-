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
  Pagination,
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
import StudentHomeShell from "@/src/components/dashboard/StudentHomeShell";

import { KhoaHocDangKiSearch, KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import KhoaHocService from "@/src/services/KhoaHocService";

// ─── constants ────────────────────────────────────────────────────────────────

const RED = BRAND.main;
const RED_HOVER = "#7F1D1D";
const TEXT_MAIN = CSSVAR.textPrimary;
const TEXT_MUTED = CSSVAR.textSecondary;
const PAGE_SIZE = 9;

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

import { parseJwtPayload } from "@/src/utils/jwt";
import { BRAND, CSSVAR, STATUS } from "@/src/theme/tokens";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  return parseJwtPayload(token);
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
  totalPage?: number;
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

function extractPaginationInfo(response: unknown): {
  totalCount: number;
  totalPage: number;
  pageIndex: number;
  pageSize: number;
} {
  const defaultResult = {
    totalCount: 0,
    totalPage: 1,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  };

  if (!response) return defaultResult;

  // Nếu response là PagedList trực tiếp
  if (isPagedList<KhoaHocType>(response)) {
    return {
      totalCount: response.totalCount ?? 0,
      totalPage: response.totalPage ?? 1,
      pageIndex: response.pageIndex ?? 1,
      pageSize: response.pageSize ?? PAGE_SIZE,
    };
  }

  // Nếu response là ApiResponse chứa PagedList
  if (isApiResponse<unknown>(response)) {
    const inner = response.data;
    if (isPagedList<KhoaHocType>(inner)) {
      return {
        totalCount: inner.totalCount ?? 0,
        totalPage: inner.totalPage ?? 1,
        pageIndex: inner.pageIndex ?? 1,
        pageSize: inner.pageSize ?? PAGE_SIZE,
      };
    }
  }

  return defaultResult;
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

const waveLine = keyframes`
  0% { transform: scaleX(0); opacity: 0; }
  50% { transform: scaleX(1); opacity: 0.6; }
  100% { transform: scaleX(0); opacity: 0; }
`;

// ─── styled components ────────────────────────────────────────────────────────

const CourseCard = styled(Card)(() => ({
  cursor: "pointer",
  borderRadius: 20,
  border: `1px solid ${CSSVAR.divider}`,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  overflow: "hidden",
  backgroundColor: CSSVAR.paper,
  position: "relative",
  "&:hover": {
    boxShadow:
      "0 8px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
    borderColor: "#CBD5E1",
  },
  "&:hover img": {
    transform: "scale(1.04)",
  },
}));

const ThumbBox = styled(Box)({
  position: "relative",
  paddingTop: "56.25%",
  overflow: "hidden",
  backgroundColor: CSSVAR.paperAlt,
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
  border: `1px solid ${CSSVAR.divider}`,
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  backgroundColor: CSSVAR.paper,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
    borderColor: "#CBD5E1",
  },
}));

const CourseProgress = styled(LinearProgress)(() => ({
  height: 3,
  backgroundColor: CSSVAR.divider,
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
          color: CSSVAR.textPrimary,
          mb: 1.5,
        }}
      >
        {isNetwork ? "Mất kết nối Internet" : "Hệ thống đang bảo trì"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: CSSVAR.textSecondary,
          maxWidth: 320,
          mx: "auto",
          fontSize: 14.5,
          lineHeight: 1.6,
        }}
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
    [CSSVAR.bg, CSSVAR.textSecondary],
    [CSSVAR.paperAlt, CSSVAR.textSecondary],
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
        // Dùng color-mix() thay vì alpha() vì fg có thể là CSS var(--...)
        background: `linear-gradient(135deg, ${bg}, color-mix(in srgb, ${fg} 8%, transparent))`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: 36,
          fontWeight: 800,
          color: fg,
          opacity: 0.4,
          letterSpacing: "1px",
        }}
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
    pageSize: PAGE_SIZE,
  });

  // ── course data state ──────────────────────────────────────────────────────
  const [courses, setCourses] = useState<KhoaHocType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(
    userId ? null : AUTH_ERROR,
  );
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [overallStats, setOverallStats] = useState<{
    total: number;
    inProgress: number;
    completed: number;
    avg: number;
  }>({
    total: 0,
    inProgress: 0,
    completed: 0,
    avg: 0,
  });

  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  // ── fetch overall stats (all enrolled courses) ──────────────────────────────
  const fetchOverallStats = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await khoaHocService.GetListDangKi({
        pageIndex: 1,
        pageSize: 1000,
      });
      const allItems = extractCourseItems(response);
      const total = allItems.length;
      const inProgress = allItems.filter(
        (c) => (c.phanTramHoanThanh ?? 0) > 0 && (c.phanTramHoanThanh ?? 0) < 100,
      ).length;
      const completed = allItems.filter(
        (c) => (c.phanTramHoanThanh ?? 0) >= 100,
      ).length;
      const avg =
        total > 0
          ? Math.round(
              allItems.reduce((s, c) => s + (c.phanTramHoanThanh ?? 0), 0) /
                total,
            )
          : 0;
      setOverallStats({ total, inProgress, completed, avg });
    } catch (err) {
      console.error("Error fetching overall course stats:", err);
    }
  }, [khoaHocService, userId]);

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
        pageSize: PAGE_SIZE, // Luôn cố định pageSize = 10
      };

      if (searchParams.sapXepNgay) {
        search.sapXepNgay = searchParams.sapXepNgay;
      } else if (searchParams.sapXepTen) {
        search.sapXepTen = searchParams.sapXepTen;
      }

      const response = await khoaHocService.GetListDangKi(search);
      const items = extractCourseItems(response);

      // Lấy thông tin phân trang
      const pagination = extractPaginationInfo(response);

      setCourses(items);
      setTotalCount(pagination.totalCount);
      setTotalPage(pagination.totalPage);
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
      setCourses([]);
      setTotalCount(0);
      setTotalPage(1);
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
    searchParams.pageIndex,
    userId,
    debouncedFetch,
  ]);

  // ── effect: initial load ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    const load = async () => {
      if (!isMounted) return;
      await Promise.all([fetchCourses(), fetchOverallStats()]);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [userId, fetchCourses, fetchOverallStats]);

  // ── online/offline listeners ──────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      if (errorDetail?.type === "network" && userId) {
        fetchCourses();
        fetchOverallStats();
      }
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
  }, [errorDetail?.type, fetchCourses, fetchOverallStats, userId]);

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
    fetchOverallStats();
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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    setSearchParams((prev: KhoaHocDangKiSearch) => ({
      ...prev,
      pageIndex: page,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── render helpers ──────────────────────────────────────────────────────────
  const renderStats = () => {
    const statItems = [
      {
        icon: <SchoolIcon sx={{ fontSize: 22 }} />,
        val: overallStats.total,
        lbl: "Đã đăng ký",
        bg: "rgba(153, 27, 27, 0.06)",
        color: RED,
      },
      {
        icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
        val: overallStats.inProgress,
        lbl: "Đang học",
        bg: "rgba(217, 119, 6, 0.06)",
        color: STATUS.warningDark,
      },
      {
        icon: <CheckCircleIcon sx={{ fontSize: 22 }} />,
        val: overallStats.completed,
        lbl: "Hoàn thành",
        bg: "rgba(22, 163, 74, 0.06)",
        color: "#16A34A",
      },
      {
        icon: <VideoLibraryIcon sx={{ fontSize: 22 }} />,
        val: `${overallStats.avg}%`,
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
                    color: CSSVAR.textPrimary,
                  }}
                >
                  {s.val}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: CSSVAR.textSecondary,
                    fontWeight: 500,
                    mt: 0.5,
                  }}
                >
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
            sx={{
              mb: 4,
              mt: 3,
              borderRadius: "14px",
              "& .MuiAlert-icon": { fontSize: 24 },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 0.5, textAlign: "left" }}
            >
              {isAuthError
                ? "Phiên đăng nhập hết hạn"
                : errorDetail.type === "network"
                  ? "Lỗi kết nối mạng"
                  : "Lỗi hệ thống"}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: "left" }}>
              {errorDetail.message}
            </Typography>
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
                  },
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
                  },
                }}
              >
                Thử lại
              </Button>
            )}
            <Button
              component={Link}
              href="/"
              color="inherit"
              sx={{
                textDecoration: "none",
                textTransform: "none",
                fontWeight: 700,
              }}
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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 1.5,
              color: CSSVAR.textPrimary,
            }}
          >
            Chưa có khóa học nào
          </Typography>
          <Typography
            sx={{
              color: CSSVAR.textSecondary,
              mb: 4,
              fontSize: 15,
            }}
          >
            Hành trình học tập của bạn đang chờ đợi. Hãy khám phá kho khóa học
            đa dạng của chúng tôi để bắt đầu ngay!
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
              },
            }}
          >
            Khám phá khóa học
          </Button>
        </Box>
      );
    }

    // Có dữ liệu: hiển thị grid với lớp phủ loading (nếu đang tải)
    return (
      <Box>
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

              return (
                <Grid
                  key={registrationId || course.id}
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                >
                  <CourseCard
                    onClick={() => handleCourseClick(registrationId)}
                    sx={{
                      borderRadius: "18px",
                      border: `1px solid ${CSSVAR.divider}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                      overflow: "hidden",
                      bgcolor: CSSVAR.paper,
                      "&:hover": {
                        boxShadow: "0 12px 28px -8px rgba(139, 19, 19, 0.12)",
                        borderColor: "rgba(139, 19, 19, 0.3)",
                        "& .play-glass-btn": {
                          transform: "translate(-50%, -50%) scale(1.15)",
                          background: `linear-gradient(135deg, ${BRAND.main} 0%, ${STATUS.errorDark} 100%)`,
                          color: "#ffffff",
                          boxShadow: "0 10px 24px rgba(139,19,19,0.45)",
                        },
                        "& .course-card-title": {
                          color: RED,
                        },
                      },
                    }}
                  >
                    <ThumbBox
                      sx={{
                        position: "relative",
                        paddingTop: "52%",
                        overflow: "hidden",
                        background: hasImg
                          ? `linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%), url(${course.hinhAnhKhoaHoc}) center/cover no-repeat`
                          : CSSVAR.paperAlt,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
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
                          sx={{ opacity: 0.92 }}
                        />
                      ) : (
                        <ThumbPlaceholder title={course.tieuDe} />
                      )}

                      {/* Glassmorphic Play Button Overlay */}
                      <Box
                        className="play-glass-btn"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.88)",
                          backdropFilter: "blur(12px)",
                          color: RED,
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
                          transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                          zIndex: 2,
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 26, ml: 0.2 }} />
                      </Box>

                      {/* Percentage Badge */}
                      {progress > 0 && progress < 100 && (
                        <Chip
                          label={`${progress}%`}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: `linear-gradient(135deg, ${BRAND.main} 0%, ${STATUS.errorDark} 100%)`,
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            height: 20,
                            px: 0.6,
                            boxShadow: "0 4px 12px rgba(139,19,19,0.35)",
                            zIndex: 2,
                          }}
                        />
                      )}

                      {progress >= 100 && (
                        <Chip
                          label="100% ✓"
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: `linear-gradient(135deg, ${STATUS.success} 0%, #059669 100%)`,
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "0.72rem",
                            height: 20,
                            px: 0.6,
                            boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
                            zIndex: 2,
                          }}
                        />
                      )}

                      {progress === 0 && (
                        <Chip
                          label="Chưa học"
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            background: "rgba(15, 23, 42, 0.75)",
                            backdropFilter: "blur(8px)",
                            color: "#E2E8F0",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: 20,
                            px: 0.6,
                            zIndex: 2,
                          }}
                        />
                      )}
                    </ThumbBox>

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        "&:last-child": { pb: 2 },
                      }}
                    >
                      <Typography
                        className="course-card-title"
                        sx={{
                          fontWeight: 800,
                          fontSize: 14,
                          lineHeight: 1.35,
                          color: CSSVAR.textPrimary,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          height: 38,
                          transition: "color 200ms ease",
                        }}
                      >
                        {course.tieuDe}
                      </Typography>

                      <Stack direction="row" spacing={1.5} sx={{ mb: 0.25 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <MenuBookIcon
                            sx={{
                              fontSize: 14,
                              color: CSSVAR.textMuted,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: CSSVAR.textSecondary,
                              fontWeight: 600,
                              fontSize: 11.5,
                            }}
                          >
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
                              sx={{
                                fontSize: 14,
                                color: CSSVAR.textMuted,
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: CSSVAR.textSecondary,
                                fontWeight: 600,
                                fontSize: 11.5,
                              }}
                            >
                              {minutes} phút
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      <Box sx={{ mb: 0.5 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: CSSVAR.textSecondary,
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          >
                            Tiến độ
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: progressColor,
                              fontSize: 11,
                            }}
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
                            borderRadius: 99,
                            bgcolor: "rgba(0,0,0,0.06)",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 99,
                              background: isCompleted
                                ? `linear-gradient(90deg, #34D399 0%, ${STATUS.success} 100%)`
                                : `linear-gradient(90deg, #F43F5E 0%, ${BRAND.main} 100%)`,
                              boxShadow: isCompleted
                                ? "0 2px 8px rgba(16,185,129,0.35)"
                                : "0 2px 8px rgba(139,19,19,0.3)",
                            },
                          }}
                        />
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        startIcon={
                          isCompleted ? (
                            <CheckCircleIcon
                              sx={{ fontSize: "15px !important" }}
                            />
                          ) : (
                            <PlayArrowIcon
                              sx={{ fontSize: "15px !important" }}
                            />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(registrationId);
                        }}
                        sx={{
                          textTransform: "none",
                          fontWeight: 800,
                          borderRadius: "10px",
                          py: 0.8,
                          fontSize: 12.5,
                          bgcolor: isCompleted
                            ? "rgba(16, 185, 129, 0.09)"
                            : "rgba(139, 19, 19, 0.08)",
                          color: isCompleted ? "#059669" : RED,
                          border: isCompleted
                            ? "1px solid rgba(16, 185, 129, 0.22)"
                            : "1px solid rgba(139, 19, 19, 0.2)",
                          boxShadow: "none",
                          transition: "all 240ms ease",
                          "&:hover": {
                            background: isCompleted
                              ? `linear-gradient(135deg, ${STATUS.success} 0%, #059669 100%)`
                              : `linear-gradient(135deg, ${BRAND.main} 0%, ${BRAND.dark} 100%)`,
                            color: "#ffffff",
                            borderColor: "transparent",
                            boxShadow: isCompleted
                              ? "0 6px 20px rgba(16,185,129,0.35)"
                              : "0 6px 20px rgba(139,19,19,0.35)",
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

        {/* Phân trang */}
        {totalPage > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              pt: 2,
              borderTop: `1px solid ${CSSVAR.divider}`,
            }}
          >
            <Pagination
              count={totalPage}
              page={searchParams.pageIndex}
              onChange={handlePageChange}
              shape="rounded"
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 600,
                  borderRadius: "10px",
                },
                "& .Mui-selected": {
                  bgcolor: `${RED} !important`,
                  color: "#fff",
                  "&:hover": {
                    bgcolor: `${RED_HOVER} !important`,
                  },
                },
                "& .MuiPaginationItem-root:hover": {
                  bgcolor: alpha(RED, 0.08),
                },
              }}
            />
          </Box>
        )}
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
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, mb: 0.5, textAlign: "left" }}
          >
            🔐 Phiên đăng nhập hết hạn
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "left" }}>
            {AUTH_ERROR.message}
          </Typography>
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
              },
            }}
          >
            Đăng nhập lại
          </Button>
          <Button
            component={Link}
            href="/"
            color="inherit"
            sx={{
              textDecoration: "none",
              textTransform: "none",
              fontWeight: 700,
            }}
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
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: TEXT_MAIN, letterSpacing: "-0.5px" }}
        >
          Khóa học của tôi
        </Typography>
        <Typography sx={{ color: TEXT_MUTED, fontSize: 15 }}>
          Tiếp tục hành trình chinh phục tri thức và hoàn thành các khóa học của
          bạn
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
              bgcolor: CSSVAR.paper,
              "& fieldset": { borderColor: CSSVAR.divider },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: RED },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon
                  sx={{
                    color: CSSVAR.textMuted,
                    mr: 1,
                    fontSize: 20,
                  }}
                />
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 160 } }}>
          <InputLabel
            id="sort-select-label"
            sx={{ fontSize: 14, "&.Mui-focused": { color: RED } }}
          >
            Sắp xếp
          </InputLabel>
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
              bgcolor: CSSVAR.paper,
              "&.MuiOutlinedInput-root": {
                "& fieldset": { borderColor: CSSVAR.divider },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
                "&.Mui-focused fieldset": { borderColor: RED },
              },
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
      <StudentHomeShell>
        <MyCoursesContent />
      </StudentHomeShell>
    </AuthGuard>
  );
}
