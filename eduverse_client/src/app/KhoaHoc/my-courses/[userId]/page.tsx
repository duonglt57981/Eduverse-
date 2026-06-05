"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Container, Box, Typography, Grid, Card, CardContent,
  Button, Chip, CircularProgress, Alert, LinearProgress,
  Paper, Stack, useTheme, alpha,
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
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";

const RED = "#8B1A1A";
const RED_HOVER = "#6B1414";
const RED_LIGHT = "#B22222";
const RED_BG = "#F9F5F5";

// Animation keyframes
const pulseRing = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.2; }
  100% { transform: scale(0.8); opacity: 0.5; }
`;

const shakeIcon = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  20% { transform: translate(-2px, 2px) rotate(-5deg); }
  40% { transform: translate(2px, -2px) rotate(5deg); }
  60% { transform: translate(-1px, 1px) rotate(-3deg); }
  80% { transform: translate(1px, -1px) rotate(3deg); }
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

// Styled components
const CourseCard = styled(Card)(() => ({
  cursor: "pointer",
  borderRadius: 16,
  border: `1px solid #fde8e8`,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
  boxShadow: `0 2px 12px rgba(192,57,43,0.07)`,
  overflow: "hidden",
  backgroundColor: "#fff",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: `0 12px 32px rgba(192,57,43,0.18)`,
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
  top: 0, left: 0,
  width: "100%", height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s ease",
});

const StatCard = styled(Paper)(() => ({
  padding: "1.25rem",
  borderRadius: 14,
  border: `1px solid #fde8e8`,
  boxShadow: `0 2px 12px rgba(192,57,43,0.06)`,
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

// Connection Lost Animation Component
const ConnectionLostAnimation = ({ type }: { type: 'backend' | 'network' }) => {
  const isNetwork = type === 'network';
  
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 120,
            height: 120,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            backgroundColor: alpha(RED, 0.15),
            animation: `${pulseRing} 2s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 160,
            height: 60,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            animation: `${shakeIcon} 0.8s ease-in-out infinite`,
            display: 'inline-block',
            p: 2,
            borderRadius: '50%',
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
      
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
        {isNetwork
          ? "Vui lòng kiểm tra kết nối mạng của bạn"
          : "Hệ thống đang gặp vấn đề, vui lòng thử lại sau"}
      </Typography>
    </Box>
  );
};

const ThumbPlaceholder = ({ title }: { title?: string }) => {
  const palettes = [
    ["#fff5f5", RED],
    ["#fde8e8", RED_LIGHT],
    ["#fff0f0", "#922b21"],
    ["#fdf2f2", "#c0392b"],
    ["#fef9f9", "#e74c3c"],
  ];
  const idx = (title?.charCodeAt(0) ?? 0) % palettes.length;
  const [bg, fg] = palettes[idx];
  const initials = title?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() ?? "KH";
  return (
    <Box sx={{
      position: "absolute", inset: 0,
      background: `linear-gradient(135deg, ${bg}, ${alpha(fg, 0.12)})`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Typography sx={{ fontSize: 40, fontWeight: 700, color: fg, opacity: 0.45 }}>
        {initials}
      </Typography>
    </Box>
  );
};

// Helper to safely extract error message
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
}

// Type guard for error objects that have a response property
interface ErrorWithResponse {
  response?: {
    status?: number;
    data?: unknown;
  };
}

function hasResponse(err: unknown): err is ErrorWithResponse {
  return typeof err === 'object' && err !== null && 'response' in err;
}

// Improved image URL validator
function isValidImage(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed === "") return false;
  // Loại bỏ các giá trị placeholder không hợp lệ
  if (trimmed === "không có" || trimmed === "aaaaaaaa") return false;
  return trimmed.startsWith("http");
}

const MyCoursesPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string | undefined;

  const [courses, setCourses] = useState<KhoaHocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetail, setErrorDetail] = useState<{ type: 'backend' | 'network' | 'auth'; message: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Tạo service instance một lần
  const khoaHocService = useMemo(() => new KhoaHocService(), []);

  const fetchCourses = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setErrorDetail(null);
    
    try {
      const items = await khoaHocService.getmyKhoaHoc(userId);
      setCourses(items);
      setErrorDetail(null);
    } catch (err: unknown) {
      console.error("Error fetching courses:", err);
      
      let type: 'backend' | 'network' | 'auth' = 'backend';
      let message = 'Không thể tải danh sách khóa học. Vui lòng thử lại sau.';
      
      const errorMessage = getErrorMessage(err);
      const isNetworkError = 
        errorMessage.includes('NetworkError') || 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('ECONNABORTED');
      
      if (!navigator.onLine) {
        type = 'network';
        message = 'Không có kết nối Internet. Vui lòng kiểm tra kết nối mạng của bạn.';
      } else if (isNetworkError) {
        type = 'network';
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (hasResponse(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          type = 'auth';
          message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.';
        } else if (status && (status >= 500 || status === 503 || status === 502)) {
          type = 'backend';
          message = 'Backend đang tạm thời không hoạt động. Vui lòng thử lại sau.';
        } else if (status === 404) {
          type = 'backend';
          message = 'Không tìm thấy API hoặc dịch vụ backend. Vui lòng liên hệ quản trị viên.';
        }
      }
      
      setErrorDetail({ type, message });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [userId, khoaHocService]);

  // Guard missing userId
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setErrorDetail({
        type: 'auth',
        message: 'Thiếu thông tin người dùng. Vui lòng đăng nhập lại.'
      });
      return;
    }
    fetchCourses();
  }, [userId, fetchCourses]);

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (errorDetail?.type === 'network') {
        fetchCourses();
      }
    };
    
    const handleOffline = () => {
      setErrorDetail({
        type: 'network',
        message: 'Mất kết nối Internet. Vui lòng kiểm tra lại kết nối mạng.'
      });
      setCourses([]);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [errorDetail?.type, fetchCourses]);

  const stats = useMemo(() => {
    const total = courses.length;
    const inProgress = courses.filter(c => (c.phanTramHoanThanh ?? 0) > 0 && (c.phanTramHoanThanh ?? 0) < 100).length;
    const completed = courses.filter(c => (c.phanTramHoanThanh ?? 0) >= 100).length;
    const avg = total > 0
      ? Math.round(courses.reduce((s, c) => s + (c.phanTramHoanThanh ?? 0), 0) / total)
      : 0;
    return { total, inProgress, completed, avg };
  }, [courses]);

  const handleCourseClick = (registrationId?: string) => {
    if (registrationId) {
      router.push(`/khoahoc/my-courses/learning/${registrationId}`);
    } else {
      console.warn('Missing course registration id');
    }
  };

  const handleRetry = () => {
    if (!userId) {
      router.push('/dang-nhap');
      return;
    }
    fetchCourses();
  };

  const handleLoginRedirect = () => {
    router.push('/dang-nhap');
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: RED }} />
      </Box>
    );
  }

  // Handle error states
  if (errorDetail) {
    const isAuthError = errorDetail.type === 'auth';
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center' }}>
          {!isAuthError && <ConnectionLostAnimation type={errorDetail.type === 'network' ? 'network' : 'backend'} />}
          <Alert 
            severity={isAuthError ? 'warning' : (errorDetail.type === 'network' ? 'warning' : 'error')} 
            sx={{ mb: 3, mt: 2, '& .MuiAlert-icon': { fontSize: 28 } }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {isAuthError ? '🔐 Phiên đăng nhập hết hạn' : (errorDetail.type === 'network' ? '⚠️ Lỗi kết nối mạng' : '⚠️ Lỗi từ hệ thống')}
            </Typography>
            <Typography variant="body2">{errorDetail.message}</Typography>
          </Alert>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
            {isAuthError ? (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleLoginRedirect}
                sx={{
                  bgcolor: RED,
                  '&:hover': { bgcolor: RED_HOVER },
                  borderRadius: 2,
                  px: 4,
                  py: 1
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
                  '&:hover': { bgcolor: RED_HOVER },
                  borderRadius: 2,
                  px: 4,
                  py: 1
                }}
              >
                Thử lại
              </Button>
            )}
            <Button component={Link} href="/" color="inherit" sx={{ textDecoration: 'none' }}>
              Quay về trang chủ
            </Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (courses.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <VideoLibraryIcon sx={{ fontSize: 72, color: alpha(RED, 0.2), mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Bạn chưa đăng ký khóa học nào</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Hãy khám phá các khóa học và bắt đầu học ngay!
        </Typography>
        <Button
          component={Link} href="/khoahoc" variant="contained" size="large"
          sx={{ bgcolor: RED, "&:hover": { bgcolor: "#922b21" }, borderRadius: 3 }}
        >
          Khám phá khóa học
        </Button>
      </Container>
    );
  }

  const statItems = [
    { icon: <SchoolIcon />, val: stats.total, lbl: "Đã đăng ký", bg: alpha(RED, 0.08), color: RED },
    { icon: <TrendingUpIcon />, val: stats.inProgress, lbl: "Đang học", bg: "#fff8e1", color: "#f57f17" },
    { icon: <CheckCircleIcon />, val: stats.completed, lbl: "Hoàn thành", bg: "#e8f5e9", color: "#2e7d32" },
    { icon: <VideoLibraryIcon />, val: `${stats.avg}%`, lbl: "Tiến độ TB", bg: "#fde8e8", color: RED_LIGHT },
  ];

  return (
    <Box sx={{ bgcolor: RED_BG, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: RED }}>
            Khóa học của tôi
          </Typography>
          <Typography color="text.secondary">
            Tiếp tục học những khóa học bạn đã đăng ký
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {statItems.map((s, i) => (
            <Grid key={i} size={{ xs: 6, sm: 3 }}>
              <StatCard>
                <Box sx={{
                  width: 46, height: 46, borderRadius: 3,
                  bgcolor: s.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: s.color, flexShrink: 0,
                }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: s.color }}>
                    {s.val}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{s.lbl}</Typography>
                </Box>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {courses.map((course) => {
            const registrationId = course.idDangKiKhoaHoc;
            const hasImg = isValidImage(course.hinhAnhKhoaHoc) && !imageErrors[registrationId!];
            const progress = course.phanTramHoanThanh ?? 0;
            const minutes = Math.floor((course.tongThoiLuong ?? 0) / 60);

            return (
              <Grid key={registrationId || course.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <CourseCard onClick={() => handleCourseClick(registrationId)}>
                  <ThumbBox>
                    {hasImg ? (
                      <ThumbImg
                        src={course.hinhAnhKhoaHoc ?? ''}
                        alt={course.tieuDe}
                        onError={() => setImageErrors(prev => ({ ...prev, [registrationId!]: true }))}
                      />
                    ) : (
                      <ThumbPlaceholder title={course.tieuDe} />
                    )}
                    {progress > 0 && progress < 100 && (
                      <Chip
                        label={`${progress}%`}
                        size="small"
                        sx={{
                          position: "absolute", bottom: 8, left: 8,
                          bgcolor: "rgba(0,0,0,0.65)", color: "#fff",
                          fontSize: "0.7rem", backdropFilter: "blur(4px)", height: 22,
                        }}
                      />
                    )}
                    {progress >= 100 && (
                      <Box sx={{
                        position: "absolute", top: 8, right: 8,
                        bgcolor: "#2e7d32", borderRadius: "50%",
                        width: 28, height: 28,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircleIcon sx={{ color: "#fff", fontSize: 18 }} />
                      </Box>
                    )}
                  </ThumbBox>

                  <CourseProgress variant="determinate" value={Math.min(progress, 100)} />

                  <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}>
                    <Typography sx={{
                      fontWeight: 700, fontSize: 14, mb: 1, lineHeight: 1.4,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {course.tieuDe}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MenuBookIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.secondary">
                          {course.tongBaiGiang ?? 0} bài
                        </Typography>
                      </Box>
                      {minutes > 0 && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                          <Typography variant="caption" color="text.secondary">
                            {minutes} phút
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: RED }}>
                          {course.soBaiGiangHoanThanh ?? 0}/{course.tongBaiGiang ?? 0} bài
                        </Typography>
                      </Box>
                      <LinearProgress   
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          height: 6, borderRadius: 3,
                          bgcolor: "#fde8e8",
                          "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: RED },
                        }}
                      />
                    </Box>

                    <Button
                      fullWidth variant="contained" size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={(e) => { e.stopPropagation(); handleCourseClick(registrationId); }}
                      sx={{
                        textTransform: "none", fontWeight: 600,
                        borderRadius: 2, bgcolor: RED,
                        "&:hover": { bgcolor: "#922b21" },
                      }}
                    >
                      {progress === 0 ? "Bắt đầu học" : progress >= 100 ? "Xem lại" : "Tiếp tục học"}
                    </Button>
                  </CardContent>
                </CourseCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default MyCoursesPage;