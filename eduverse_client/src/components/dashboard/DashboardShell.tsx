"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowForwardRounded,
  MenuRounded,
  NotificationsNoneRounded,
  MailOutlineRounded,
  AutoAwesomeRounded,
  StarRounded,
  SchoolRounded,
  MenuBookRounded,
  QuizRounded,
  TimelineRounded,
  CalendarMonthRounded,
  FavoriteBorderRounded,
  SettingsRounded,
  EmojiEventsRounded,
  BarChartRounded,
  PsychologyRounded,
  CloudQueueRounded,
  TrendingUpRounded,
  PeopleAltRounded,
  CategoryRounded,
  LogoutRounded,
  SearchRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  MoreVertRounded,
  LanguageRounded,
  ShoppingCartRounded,
  CreditCardRounded,
  LocalOfferRounded,
  HistoryRounded,
  PersonRounded,
  HelpOutlineRounded,
  ForumRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
  Tab,
  Tabs,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { logout } from "@/src/store/auth/AuthSlice";
import { useDispatch, useSelector } from "@/src/store/hook";
import {
  getSidebarItemsByRole,
  getSecondarySidebarItemsByRole,
  sidebarSecondaryItems,
  aiRecommendationBanners,
  footerColumnsData,
  type CourseCardItem,
} from "./dashboard-data";
import { apiService } from "@/src/services/index";

// --- CRIMSON RED DESIGN PALETTE ---
const COLORS = {
  primary: "#8D1313", // Crimson Red (Đỏ đô chủ đạo)
  primaryLight: "#B91C1C", // Light Crimson
  primaryDark: "#7F1D1D", // Dark Crimson
  bgLight: "#FFF8F6", // Premium cream-rose background
  purpleAI: "#7C3AED", // AI Accent
  gradientAI: "linear-gradient(135deg, #8D1313 0%, #7C3AED 100%)",
  gradientCrimson: "linear-gradient(90deg, #9f1717 0%, #7f1d1d 100%)",
  gradientCrimsonHover: "linear-gradient(90deg, #7f1d1d 0%, #681212 100%)",
  gradientTech: "linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)",
  white: "#FFFFFF",
};

// Custom Carousel row with next/prev navigation buttons instead of scrollbars
function CarouselRow({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 15);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 15);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Run once on load/render
      setTimeout(checkScroll, 100);

      const resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [children]);

  const handleScroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* Left Navigation Arrow */}
      {showLeft && (
        <IconButton
          onClick={() => handleScroll("left")}
          sx={{
            position: "absolute",
            left: { xs: -10, sm: -15, md: -20 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "#ffffff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: { xs: 36, md: 42 },
            height: { xs: 36, md: 42 },
            color: "#1F2937",
            "&:hover": {
              bgcolor: "#F3F4F6",
              boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
            },
            display: "inline-flex",
          }}
        >
          <ChevronLeftRounded sx={{ fontSize: { xs: 20, md: 24 } }} />
        </IconButton>
      )}

      {/* Right Navigation Arrow */}
      {showRight && (
        <IconButton
          onClick={() => handleScroll("right")}
          sx={{
            position: "absolute",
            right: { xs: -10, sm: -15, md: -20 },
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            bgcolor: "#ffffff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.06)",
            width: { xs: 36, md: 42 },
            height: { xs: 36, md: 42 },
            color: "#1F2937",
            "&:hover": {
              bgcolor: "#F3F4F6",
              boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
            },
            display: "inline-flex",
          }}
        >
          <ChevronRightRounded sx={{ fontSize: { xs: 20, md: 24 } }} />
        </IconButton>
      )}

      {/* Scrollable Row (Hidden scrollbar) */}
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          gap: 3,
          overflowX: "auto",
          pb: 1.5,
          pt: 1,
          px: 0.5,
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            display: "none",
            width: 0,
            height: 0,
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Simple Circular Progress spinner styling helper
function CircularProgressGlow() {
  return (
    <Box sx={{ position: "relative", display: "inline-flex", mb: 1.5 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "3px solid rgba(141, 19, 19, 0.1)",
          borderTopColor: COLORS.primary,
          animation: "spin 1s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
    </Box>
  );
}

// AI Learning Assistant Illustration (Pulsing glowing orb)
function AIGraphic() {
  return (
    <Box
      sx={{
        position: "relative",
        width: 140,
        height: 140,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: COLORS.gradientAI,
          boxShadow:
            "0 0 30px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
          display: "grid",
          placeItems: "center",
          animation: "pulse 3s infinite ease-in-out",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1) rotate(0deg)" },
            "50%": {
              transform: "scale(1.08) rotate(5deg)",
              boxShadow:
                "0 0 45px rgba(124, 58, 237, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
            },
          },
        }}
      >
        <PsychologyRounded sx={{ fontSize: 42, color: "#fff" }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: "1px dashed rgba(124, 58, 237, 0.3)",
          animation: "spin 25s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: "1px solid rgba(141, 19, 19, 0.1)",
          animation: "spin-reverse 20s linear infinite",
          "@keyframes spin-reverse": {
            "0%": { transform: "rotate(360deg)" },
            "100%": { transform: "rotate(0deg)" },
          },
        }}
      />
    </Box>
  );
}

// Custom Sector Icon Resolver
function SectorIcon({ iconName, color }: { iconName: string; color: string }) {
  const sx = { fontSize: 32, color };
  switch (iconName) {
    case "data":
      return <BarChartRounded sx={sx} />;
    case "ai":
      return <PsychologyRounded sx={sx} />;
    case "cloud":
      return <CloudQueueRounded sx={sx} />;
    case "marketing":
      return <TrendingUpRounded sx={sx} />;
    default:
      return <SchoolRounded sx={sx} />;
  }
}

// Sidebar Navigation Render Helper
function SidebarContent({
  onLogout,
  roles = [],
}: {
  onLogout: () => void;
  roles?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  // If not in instructor view, filter out 'GiaoVien' role for sidebar items,
  // so that the sidebar falls back to student items.
  // Similarly filter out 'Admin' if not in admin view.
  const activeRoles = useMemo(() => {
    let list = [...roles];
    if (!pathname.startsWith("/instructor")) {
      list = list.filter((r) => r !== "GiaoVien");
    }
    if (!pathname.startsWith("/admin")) {
      list = list.filter((r) => r !== "Admin");
    }
    return list;
  }, [roles, pathname]);

  const sidebarItems = getSidebarItemsByRole(activeRoles);

  const getRoleBadge = () => {
    if (activeRoles.includes("Admin"))
      return {
        label: "Admin",
        color: "#DC2626",
        bg: "rgba(220, 38, 38, 0.08)",
      };
    if (activeRoles.includes("GiaoVien"))
      return {
        label: "Giảng viên",
        color: "#7C3AED",
        bg: "rgba(124, 58, 237, 0.08)",
      };
    return null;
  };

  const roleBadge = getRoleBadge();

  const getHomeRoute = () => {
    if (activeRoles.includes("Admin")) return "/admin/dashboard";
    if (activeRoles.includes("GiaoVien")) return "/instructor/dashboard";
    return "/student/dashboard";
  };

  const getRouteByLabel = (label: string) => {
    const isInstructorView = pathname.startsWith("/instructor");
    const isAdminView = pathname.startsWith("/admin");

    // Instructor roles
    if (isInstructorView && roles.includes("GiaoVien")) {
      switch (label) {
        case "Dashboard":
          return "/instructor/dashboard";
        case "Bài kiểm tra":
          return "/instructor/tests";
        case "Khóa học":
          return "/instructor/manager-courses";
        case "Học viên":
          return "/instructor/students";
        case "Doanh thu":
          return "/instructor/revenue";
        case "Q&A":
          return "/instructor/qa";
        case "Cài đặt":
          return "/instructor/settings";
        case "Ngân hàng":
          return "/instructor/bank";
        default:
          return "/instructor/dashboard";
      }
    }

    // Admin roles
    if (isAdminView && roles.includes("Admin")) {
      switch (label) {
        case "Dashboard":
          return "/admin/dashboard";
        case "Người dùng":
          return "/admin/users";
        case "Vai trò":
          return "/admin/roles";
        case "Danh mục":
          return "/admin/categories";
        case "Khóa học":
          return "/admin/approve-courses";
        case "Bài giảng":
          return "/admin/lectures";
        case "Bài kiểm tra":
          return "/admin/tests";
        case "Khuyến mãi":
          return "/admin/promotions";
        case "Thanh toán":
          return "/admin/payments";
        case "Thông báo":
          return "/admin/notifications";
        case "Cài đặt":
          return "/admin/settings";
        case "Rút tiền":
          return "/admin/withdrawal-request";
        default:
          return "/admin/dashboard";
      }
    }

    // Fallback to Student roles (or default)
    switch (label) {
      case "Trang chủ":
        return "/student/dashboard";
      case "Khóa học của tôi":
        return "/student/courses/my-courses";
      case "Khám phá":
        return "/student/explore";
      case "Giỏ hàng":
        return "/student/gio-hang";
      case "Yêu thích":
        return "/student/favorites";
      case "Hồ sơ":
        return "/student/profile";
      case "Cài đặt":
        return "/student/settings";
      case "":
        return "/student/enroll-courses";
      default:
        return "/student/dashboard";
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: COLORS.white,
      }}
    >
      <Box sx={{ px: 2, py: 3, flex: 1 }}>
        {/* Instructor CTA */}
        {!roles.includes("Admin") && !pathname.startsWith("/instructor") && (
          <Box sx={{ px: 0, mb: 2.5 }}>
            {roles.includes("GiaoVien") ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push("/instructor/dashboard")}
                startIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                }
                sx={{
                  borderRadius: "14px",
                  bgcolor: COLORS.primary,
                  color: "#fff",
                  py: 1.3,
                  fontSize: 13.5,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "0 4px 16px rgba(141,19,19,0.2)",
                  "&:hover": {
                    bgcolor: COLORS.primaryDark,
                    boxShadow: "0 6px 20px rgba(141,19,19,0.3)",
                  },
                }}
              >
                Dashboard Giảng viên
              </Button>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #4A0E0E 0%, #8D1313 100%)",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(141,19,19,0.25)",
                  },
                }}
                onClick={() => router.push("/student/profile")}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.5 }}>
                  🎓 Trở thành Giảng viên
                </Typography>
                <Typography
                  sx={{ fontSize: 11, opacity: 0.8, lineHeight: 1.5 }}
                >
                  Đăng ký để tạo và quản lý khóa học của riêng bạn.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
        <List disablePadding>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const itemRoute = getRouteByLabel(item.label);
            const isActive = pathname === itemRoute;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => router.push(itemRoute)}
                sx={{
                  mb: 0.5,
                  borderRadius: "16px",
                  px: 2,
                  py: 1.25,
                  color: isActive ? COLORS.primary : "rgba(31,41,55,0.72)",
                  bgcolor: isActive ? "rgba(141,19,19,0.05)" : "transparent",
                  borderLeft: isActive
                    ? `4px solid ${COLORS.primary}`
                    : "4px solid transparent",
                  transition: "all 200ms ease",
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(141,19,19,0.08)"
                      : "rgba(141,19,19,0.03)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <Icon fontSize="medium" />
                </ListItemIcon>
                <Typography
                  sx={{ fontSize: 14.5, fontWeight: isActive ? 700 : 500 }}
                >
                  {item.label}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        <List disablePadding>
          {getSecondarySidebarItemsByRole(roles).map((item) => {
            const Icon = item.icon;
            return (
              <ListItemButton
                key={item.label}
                sx={{
                  mb: 0.5,
                  borderRadius: "16px",
                  px: 2,
                  py: 1.25,
                  color: "rgba(31,41,55,0.72)",
                  "&:hover": { bgcolor: "rgba(141,19,19,0.03)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <Icon fontSize="medium" />
                </ListItemIcon>
                <Typography sx={{ fontSize: 14.5, fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

// Course Card component with hover overlays & lifting animations
function CourseCard({ course }: { course: CourseCardItem }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        flexShrink: 0,
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.07)",
        bgcolor: COLORS.white,
        position: "relative",
        transition:
          "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 16px 36px rgba(141, 19, 19, 0.08)",
          "& .course-overlay": {
            opacity: 1,
          },
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 140,
          background: course.thumbnailGradient,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 80%)",
          }}
        />
        <Typography
          sx={{
            color: "#fff",
            fontSize: 32,
            fontWeight: 900,
            opacity: 0.15,
            userSelect: "none",
          }}
        >
          EduVerse
        </Typography>

        {/* Level badge */}
        <Chip
          label={course.level}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(255, 255, 255, 0.9)",
            color: COLORS.primary,
            fontWeight: 700,
            fontSize: 11,
            height: 22,
          }}
        />

        {/* Hover overlay with button */}
        <Box
          className="course-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(141, 19, 19, 0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 200ms ease",
          }}
        >
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: COLORS.white,
              color: COLORS.primary,
              borderRadius: "50px",
              fontWeight: 800,
              px: 2.5,
              py: 1,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: "#FFF5F7",
              },
            }}
          >
            Xem chi tiết
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.4,
            height: 42,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            color: "#1F2937",
          }}
        >
          {course.title}
        </Typography>
        <Typography sx={{ mt: 0.8, fontSize: 13, color: "rgba(31,41,55,0.6)" }}>
          {course.instructor}
        </Typography>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
            pt: 1.5,
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <StarRounded sx={{ color: "#F59E0B", fontSize: 18 }} />
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}
            >
              {course.rating}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: "rgba(31,41,55,0.5)" }}
          >
            <PeopleAltRounded sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
              {course.studentsCount.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

// MAIN RENDER COMPONENT
export default function DashboardShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const roles = useSelector((s) => s.auth.roles) || [];
  const user = useSelector((s) => s.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Custom states
  const [activeContinueTab, setActiveContinueTab] = useState<
    "courses" | "assigned" | "paths" | "certs" | "tests"
  >("courses");
  const [selectedSkill, setSelectedSkill] = useState<string>("AI");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiService.get<any>("/dashboard");
        if (response.status && response.data) {
          setDashboardData(response.data);
        } else {
          setError(response.message || "Không thể lấy dữ liệu Dashboard");
        }
      } catch (err: any) {
        setError(
          typeof err === "string" ? err : "Đã xảy ra lỗi khi tải dữ liệu",
        );
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/auth/login");
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: { main: COLORS.primary },
          background: { default: COLORS.bgLight, paper: COLORS.white },
          text: { primary: "#1F2937", secondary: "#4B5563" },
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily:
            '"Be Vietnam Pro","Roboto",system-ui,-apple-system,Segoe UI,Arial,sans-serif',
          h3: { fontWeight: 900, letterSpacing: "-1.0px" },
          h4: { fontWeight: 900, letterSpacing: "-0.7px" },
          button: { textTransform: "none", fontWeight: 800 },
        },
      }),
    [],
  );

  const sidebarWidth = 280;
  const headerHeight = "76px";

  const continueItems = useMemo(() => {
    if (!dashboardData?.continueLearning) return [];
    switch (activeContinueTab) {
      case "courses":
        return dashboardData.continueLearning.courses || [];
      case "paths":
        return dashboardData.continueLearning.paths || [];
      case "certs":
        return dashboardData.continueLearning.certificates || [];
      case "tests":
        return dashboardData.continueLearning.assessments || [];
      default:
        return [];
    }
  }, [activeContinueTab, dashboardData]);

  const filteredSkillsCourses = useMemo(() => {
    if (!dashboardData?.skillsCourses) return [];
    const skill = selectedSkill.toLowerCase();
    return dashboardData.skillsCourses.filter((course: any) => {
      const title = (course.title || "").toLowerCase();
      if (skill === "ai")
        return (
          title.includes("ai") ||
          title.includes("machine learning") ||
          title.includes("llm") ||
          title.includes("python") ||
          title.includes("chatbot")
        );
      if (skill === "cloud")
        return (
          title.includes("cloud") ||
          title.includes("aws") ||
          title.includes("microservices") ||
          title.includes("docker")
        );
      if (skill === "design")
        return (
          title.includes("design") ||
          title.includes("ui") ||
          title.includes("ux") ||
          title.includes("html") ||
          title.includes("css") ||
          title.includes("giao diện")
        );
      if (skill === "data science")
        return (
          title.includes("data") ||
          title.includes("python") ||
          title.includes("sql") ||
          title.includes("dữ liệu") ||
          title.includes("microservices")
        );
      if (skill === "marketing")
        return (
          title.includes("marketing") ||
          title.includes("seo") ||
          title.includes("ads") ||
          title.includes("marketing")
        );
      return true;
    });
  }, [selectedSkill, dashboardData]);

  if (!authChecked || loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            bgcolor: COLORS.bgLight,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 4,
              py: 3,
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.06)",
              bgcolor: COLORS.white,
              textAlign: "center",
            }}
          >
            <CircularProgressGlow />
            <Typography
              sx={{
                mt: 2,
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.primary,
              }}
            >
              {!authChecked
                ? "Đang xác thực tài khoản..."
                : "Đang tải dữ liệu học tập..."}
            </Typography>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100vh",
          bgcolor: COLORS.bgLight,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          pt: headerHeight,
        }}
      >
        {/* ========================================================= */}
        {/* 1. HEADER NAVIGATION (Fixed)                              */}
        {/* ========================================================= */}
        <Box
          component="header"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            zIndex: 1200,
            px: { xs: 2, md: 4 },
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { xs: "inline-flex", lg: "none" },
                color: COLORS.primary,
              }}
            >
              <MenuRounded />
            </IconButton>

            {/* Logo */}
            <Box
              onClick={() => {
                router.push(getHomeRoute());
              }}
              sx={{
                width: { xs: 110, sm: 130, lg: 150 },
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <Image
                src="/auth/img/logo_nentrang.png"
                alt="EduVerse"
                width={150}
                height={46}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </Box>
          </Stack>

          {/* Search bar (Center) */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              maxWidth: 720,
              mx: { md: 3, lg: 5 },
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 0.85,
              borderRadius: "50px",
              bgcolor: COLORS.white,
              border: "1px solid rgba(0,0,0,0.12)",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
              "&:focus-within": {
                borderColor: "rgba(0,0,0,0.3)",
                boxShadow: "0 0 0 3px rgba(0,0,0,0.03)",
              },
            }}
          >
            <SearchRounded sx={{ color: "rgba(0,0,0,0.35)", fontSize: 18 }} />
            <InputBase
              placeholder={
                pathname.startsWith("/admin")
                  ? "Tìm kiếm báo cáo..."
                  : pathname.startsWith("/instructor")
                    ? "Tìm kiếm học viên, khóa học hoặc dữ liệu..."
                    : "Tìm kiếm nội dung bất kỳ"
              }
              sx={{ flex: 1, fontSize: 13.5, fontWeight: 400 }}
            />
          </Paper>

          {/* Actions & Avatar (Right) */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", flexShrink: 0 }}
          >
            {/* Search Toggle Mobile */}
            <IconButton
              sx={{
                display: { xs: "flex", md: "none" },
                color: "rgba(31,41,55,0.65)",
              }}
            >
              <SearchRounded />
            </IconButton>

            {roles.includes("Admin") && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={
                    <CalendarMonthRounded
                      sx={{ color: "rgba(31,41,55,0.6)" }}
                    />
                  }
                  endIcon={
                    <ChevronRightRounded
                      sx={{
                        transform: "rotate(90deg)",
                        color: "rgba(31,41,55,0.6)",
                      }}
                    />
                  }
                  sx={{
                    borderRadius: "10px",
                    borderColor: "rgba(0,0,0,0.12)",
                    color: "#1F2937",
                    px: 2,
                    py: 0.8,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "#ffffff",
                    "&:hover": {
                      borderColor: "rgba(0,0,0,0.2)",
                      bgcolor: "#F9FAFB",
                    },
                  }}
                >
                  01 Th11, 2023 - 30 Th11, 2023
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    <ArrowForwardRounded sx={{ transform: "rotate(90deg)" }} />
                  }
                  sx={{
                    borderRadius: "10px",
                    bgcolor: "#8D1313",
                    color: "#ffffff",
                    px: 2,
                    py: 0.8,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#7F1D1D",
                      boxShadow: "none",
                    },
                  }}
                >
                  Xuất báo cáo
                </Button>
              </Stack>
            )}

            {/* User Avatar + Role Badge */}
            <Stack
              direction="row"
              sx={{ alignItems: "center", pl: 0.5, gap: 1.5 }}
            >
              {roles.includes("GiaoVien") && (
                <>
                  {pathname.startsWith("/instructor") ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push("/student/dashboard")}
                      startIcon={<ChevronLeftRounded />}
                      sx={{
                        borderRadius: "10px",
                        borderColor: "rgba(0,0,0,0.12)",
                        color: "#1F2937",
                        px: 1.5,
                        py: 0.6,
                        fontSize: 12.5,
                        fontWeight: 600,
                        textTransform: "none",
                        display: { xs: "none", md: "flex" },
                        "&:hover": {
                          borderColor: COLORS.primary,
                          bgcolor: "rgba(141,19,19,0.03)",
                          color: COLORS.primary,
                        },
                      }}
                    >
                      Học viên
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push("/instructor/dashboard")}
                      endIcon={<ChevronRightRounded />}
                      sx={{
                        borderRadius: "10px",
                        borderColor: "rgba(0,0,0,0.12)",
                        color: "#1F2937",
                        px: 1.5,
                        py: 0.6,
                        fontSize: 12.5,
                        fontWeight: 600,
                        textTransform: "none",
                        display: { xs: "none", md: "flex" },
                        "&:hover": {
                          borderColor: COLORS.primary,
                          bgcolor: "rgba(141,19,19,0.03)",
                          color: COLORS.primary,
                        },
                      }}
                    >
                      Giảng viên
                    </Button>
                  )}
                </>
              )}
              <IconButton
                sx={{
                  color: "rgba(31,41,55,0.55)",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <FavoriteBorderRounded sx={{ fontSize: 22 }} />
              </IconButton>
              <IconButton
                onClick={() => router.push("/student/cart")}
                sx={{
                  color: "rgba(31,41,55,0.55)",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <ShoppingCartRounded sx={{ fontSize: 22 }} />
              </IconButton>
              <IconButton
                sx={{
                  color: "rgba(31,41,55,0.55)",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <NotificationsNoneRounded sx={{ fontSize: 22 }} />
              </IconButton>
              {pathname.startsWith("/instructor") && (
                <IconButton
                  sx={{
                    color: "rgba(31,41,55,0.55)",
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </IconButton>
              )}

              <Stack
                sx={{
                  display: { xs: "none", sm: "flex" },
                  textAlign: "right",
                  mr: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1F2937",
                    lineHeight: 1.3,
                  }}
                >
                  {pathname.startsWith("/admin")
                    ? "Admin Panel"
                    : pathname.startsWith("/instructor")
                      ? `GS. ${dashboardData?.welcomeStats?.userName || "Giảng viên"}`
                      : dashboardData?.welcomeStats?.userName || "Học viên"}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: COLORS.primary,
                    letterSpacing: "0.3px",
                  }}
                >
                  {pathname.startsWith("/admin")
                    ? "SUPER ADMINISTRATOR"
                    : pathname.startsWith("/instructor")
                      ? "Premium Instructor"
                      : "Học viên"}
                </Typography>
              </Stack>
              <Avatar
                src={dashboardData?.welcomeStats?.avatarUrl || undefined}
                onClick={handleAvatarClick}
                sx={{
                  width: 38,
                  height: 38,
                  fontSize: 13.5,
                  fontWeight: 800,
                  bgcolor: "#111827",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {dashboardData?.welcomeStats?.userName
                  ? dashboardData.welcomeStats.userName
                      .split(" ")
                      .pop()
                      ?.substring(0, 2)
                      .toUpperCase()
                  : user?.hoTen
                    ? user.hoTen.split(" ").pop()?.substring(0, 2).toUpperCase()
                    : "HV"}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      width: 290,
                      overflow: "visible",
                      filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.08))",
                      mt: 1.5,
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: "12px",
                      "& .MuiMenuItem-root": {
                        px: 2.5,
                        py: 1.1,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#1F2937",
                        fontFamily: '"Be Vietnam Pro", sans-serif',
                        "&:hover": {
                          bgcolor: "rgba(141,19,19,0.04)",
                          color: "#8D1313",
                        },
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {/* Header User info */}
                <Box
                  sx={{
                    px: 2.5,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar
                    src={dashboardData?.welcomeStats?.avatarUrl || undefined}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "#111827",
                      fontWeight: 800,
                    }}
                  >
                    {dashboardData?.welcomeStats?.userName
                      ? dashboardData.welcomeStats.userName
                          .split(" ")
                          .pop()
                          ?.substring(0, 2)
                          .toUpperCase()
                      : user?.hoTen
                        ? user.hoTen
                            .split(" ")
                            .pop()
                            ?.substring(0, 2)
                            .toUpperCase()
                        : "HV"}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontWeight: 800,
                        fontSize: 14.5,
                        color: "#1F2937",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                      >
                      {dashboardData?.welcomeStats?.userName ||
                        user?.hoTen ||
                        "Học viên"}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: 11.5,
                        color: "text.secondary",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {user?.email || "email@example.com"}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

                {/* Section 1 */}
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Học tập
                </MenuItem>
                <MenuItem
                  onClick={() => router.push("/student/cart")}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "inherit", fontWeight: "inherit" }}
                  >
                    Giỏ hàng của tôi
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "#7C3AED",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    1
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/favorites")}>
                  Danh sách mong ước
                </MenuItem>
                {roles.includes("GiaoVien") && (
                  <MenuItem
                    onClick={() => router.push("/instructor/dashboard")}
                  >
                    Bảng điều khiển của giảng viên
                  </MenuItem>
                )}

                <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

                {/* Section 2 */}
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Thông báo.
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Tin nhắn
                </MenuItem>

                <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

                {/* Section 3 */}
                <MenuItem onClick={() => router.push("/settings")}>
                  Cài đặt tài khoản
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Phương thức thanh toán
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Thuê bao
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Ưu đãi Udemy
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Lịch sử mua
                </MenuItem>

                <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

                {/* Section 4 */}
                <MenuItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "inherit", fontWeight: "inherit" }}
                  >
                    Ngôn ngữ
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: "center", color: "text.secondary" }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                      Tiếng Việt
                    </Typography>
                    <LanguageRounded sx={{ fontSize: 16 }} />
                  </Stack>
                </MenuItem>

                <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

                {/* Section 5 */}
                <MenuItem onClick={() => router.push("/student/profile")}>
                  Hồ sơ công khai
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/profile")}>
                  Chỉnh sửa hồ sơ
                </MenuItem>

                <Divider sx={{ my: 0.5, borderColor: "rgba(0,0,0,0.06)" }} />

                {/* Section 6 */}
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Trợ giúp và Hỗ trợ
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: "#DC2626",
                    "&:hover": {
                      bgcolor: "rgba(220,38,38,0.04)",
                      color: "#B91C1C",
                    },
                  }}
                >
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Box>

        {/* ========================================================= */}
        {/* SIDEBAR DRAWER (COLLAPSED FOR MOBILE/TABLET)              */}
        {/* ========================================================= */}
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              width: sidebarWidth,
              boxSizing: "border-box",
              mt: headerHeight,
              height: `calc(100% - ${headerHeight})`,
              boxShadow: "12px 0 24px rgba(0,0,0,0.03)",
              borderRight: "1px solid rgba(0,0,0,0.06)",
            },
          }}
        >
          <SidebarContent onLogout={handleLogout} roles={roles} />
        </Drawer>

        {/* ========================================================= */}
        {/* MAIN LAYOUT STRUCTURE                                     */}
        {/* ========================================================= */}
        <Box
          sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          {/* 1. LEFT SIDEBAR (Desktop Fixed) */}
          <Box
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              display: { xs: "none", lg: "block" },
              borderRight: "1px solid rgba(0,0,0,0.06)",
              height: "100%",
              bgcolor: COLORS.white,
            }}
          >
            <SidebarContent onLogout={handleLogout} roles={roles} />
          </Box>

          {/* 2. MAIN CONTENT SCROLL AREA (Expanded Single Column Layout) */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 2, md: 5 },
              py: 3,
              display: "flex",
              justifyContent: "center",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "1280px",
                display: "flex",
                flexDirection: "column",
                gap: 4.5,
              }}
            >
              {children ? (
                children
              ) : (
                <>
                  {/* ========================================================= */}
                  {/* 2. WELCOME SECTION                                        */}
                  {/* ========================================================= */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      borderRadius: "24px",
                      bgcolor: COLORS.white,
                      border: "1px solid rgba(141,19,19,0.06)",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(141,19,19,0.015)",
                    }}
                  >
                    {/* Glowing background highlights */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -100,
                        right: -100,
                        width: 250,
                        height: 250,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)",
                        zIndex: 0,
                      }}
                    />

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 3,
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {/* User profile details */}
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        sx={{
                          alignItems: "center",
                          textAlign: { xs: "center", md: "left" },
                        }}
                      >
                        <Avatar
                          src={
                            dashboardData?.welcomeStats?.avatarUrl || undefined
                          }
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "rgba(141, 19, 19, 0.05)",
                            color: COLORS.primary,
                            fontSize: 28,
                            fontWeight: 900,
                            boxShadow: "0 10px 24px rgba(141,19,19,0.08)",
                          }}
                        >
                          {dashboardData?.welcomeStats?.userName
                            ? dashboardData.welcomeStats.userName
                                .split(" ")
                                .pop()
                                ?.substring(0, 1)
                                .toUpperCase()
                            : "A"}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: { xs: 24, md: 28 },
                              fontWeight: 900,
                              color: "#1F2937",
                            }}
                          >
                            Chào mừng trở lại,{" "}
                            {dashboardData?.welcomeStats?.userName} 👋
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 14.5,
                              color: "rgba(31,41,55,0.6)",
                              maxWidth: 550,
                            }}
                          >
                            {dashboardData?.welcomeStats?.subtitle}
                          </Typography>

                          {/* Quick Stats list */}
                          <Stack
                            direction="row"
                            spacing={2.5}
                            sx={{
                              mt: 2.5,
                              flexWrap: "wrap",
                              justifyContent: {
                                xs: "center",
                                md: "flex-start",
                              },
                              gap: 1.5,
                            }}
                          >
                            <Chip
                              icon={<SchoolRounded sx={{ fontSize: "18px" }} />}
                              label={`${dashboardData?.welcomeStats?.totalCourses || 0} Khóa học`}
                              sx={{
                                bgcolor: "rgba(141, 19, 19, 0.05)",
                                color: COLORS.primary,
                                fontWeight: 700,
                                fontSize: 13,
                                height: 32,
                                border: "1px solid rgba(141,19,19,0.08)",
                                borderRadius: "50px",
                                "& .MuiChip-icon": {
                                  color: COLORS.primary,
                                  ml: 1.5,
                                },
                              }}
                            />
                            <Chip
                              icon={
                                <TimelineRounded sx={{ fontSize: "18px" }} />
                              }
                              label={`${dashboardData?.welcomeStats?.progressPercent || 0}% Tiến độ`}
                              sx={{
                                bgcolor: "rgba(141, 19, 19, 0.05)",
                                color: COLORS.primary,
                                fontWeight: 700,
                                fontSize: 13,
                                height: 32,
                                border: "1px solid rgba(141,19,19,0.08)",
                                borderRadius: "50px",
                                "& .MuiChip-icon": {
                                  color: COLORS.primary,
                                  ml: 1.5,
                                },
                              }}
                            />
                            <Chip
                              icon={
                                <EmojiEventsRounded sx={{ fontSize: "18px" }} />
                              }
                              label={`${dashboardData?.welcomeStats?.certificatesCount || 0} Chứng chỉ`}
                              sx={{
                                bgcolor: "rgba(141, 19, 19, 0.05)",
                                color: COLORS.primary,
                                fontWeight: 700,
                                fontSize: 13,
                                height: 32,
                                border: "1px solid rgba(141,19,19,0.08)",
                                borderRadius: "50px",
                                "& .MuiChip-icon": {
                                  color: COLORS.primary,
                                  ml: 1.5,
                                },
                              }}
                            />
                          </Stack>
                        </Box>
                      </Stack>

                      {/* AI Learning Assistant graphic on right */}
                      <Box>
                        <AIGraphic />
                      </Box>
                    </Stack>
                  </Paper>

                  {/* ========================================================= */}
                  {/* 3. AI RECOMMENDATION BANNER (2 Horizontal Cards)           */}
                  {/* ========================================================= */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 3,
                      mb: 1,
                    }}
                  >
                    {aiRecommendationBanners.map((banner) => (
                      <Paper
                        key={banner.id}
                        elevation={0}
                        sx={{
                          p: 3.5,
                          borderRadius: "24px",
                          background: banner.bgGradient,
                          color: "#fff",
                          minHeight: 210,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 12px 30px rgba(141, 19, 19, 0.05)",
                          transition:
                            "transform 200ms ease, box-shadow 200ms ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow:
                              banner.type === "ai_recommend"
                                ? "0 16px 36px rgba(124, 58, 237, 0.2)"
                                : "0 16px 36px rgba(14, 165, 233, 0.2)",
                          },
                        }}
                      >
                        {/* Vector graphic accents */}
                        <Box
                          sx={{
                            position: "absolute",
                            right: -30,
                            bottom: -30,
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        />

                        <Box sx={{ zIndex: 1 }}>
                          {banner.type === "ai_recommend" ? (
                            <Chip
                              icon={
                                <AutoAwesomeRounded sx={{ fontSize: "14px" }} />
                              }
                              label="AI CÁ NHÂN HÓA"
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.15)",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: 11,
                                mb: 2,
                                borderRadius: "50px",
                                "& .MuiChip-icon": {
                                  color: "#fff",
                                  ml: 1,
                                },
                              }}
                            />
                          ) : (
                            <Chip
                              icon={<QuizRounded sx={{ fontSize: "14px" }} />}
                              label="KIỂM TRA NĂNG LỰC"
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.15)",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: 11,
                                mb: 2,
                                borderRadius: "50px",
                                "& .MuiChip-icon": {
                                  color: "#fff",
                                  ml: 1,
                                },
                              }}
                            />
                          )}
                          <Typography
                            sx={{
                              fontSize: 20,
                              fontWeight: 900,
                              letterSpacing: "-0.3px",
                              mb: 1,
                            }}
                          >
                            {banner.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13.5,
                              lineHeight: 1.6,
                              opacity: 0.88,
                              mb: 3.5,
                              maxWidth: "90%",
                            }}
                          >
                            {banner.description}
                          </Typography>
                        </Box>

                        <Box sx={{ zIndex: 1 }}>
                          <Button
                            variant="contained"
                            endIcon={<ArrowForwardRounded />}
                            sx={{
                              bgcolor: COLORS.white,
                              color:
                                banner.type === "ai_recommend"
                                  ? COLORS.primary
                                  : "#0284C7",
                              fontWeight: 800,
                              borderRadius: "50px",
                              px: 3,
                              py: 1.25,
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.92)",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            {banner.buttonText}
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  {/* ========================================================= */}
                  {/* 4. HOÀN THÀNH NỐT PHẦN BẠN ĐANG LÀM DỞ                     */}
                  {/* ========================================================= */}
                  <Box sx={{ mt: 2.5 }}>
                    <Typography
                      sx={{
                        fontSize: 21,
                        fontWeight: 900,
                        mb: 2,
                        color: "#1F2937",
                      }}
                    >
                      Hoàn thành nốt phần bạn đang làm dở
                    </Typography>

                    {/* Tabs */}
                    <Tabs
                      value={activeContinueTab}
                      onChange={(_, val) => setActiveContinueTab(val)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        mb: 2.5,
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        "& .MuiTabs-indicator": {
                          bgcolor: COLORS.primary,
                          height: 3,
                          borderRadius: "3px",
                        },
                        "& .MuiTab-root": {
                          textTransform: "none",
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: "rgba(31,41,55,0.5)",
                          minWidth: 100,
                          px: 1.5,
                          "&.Mui-selected": {
                            color: COLORS.primary,
                          },
                        },
                      }}
                    >
                      <Tab value="courses" label="Khóa học" />
                      <Tab
                        value="assigned"
                        label="Các khóa học được chỉ định"
                      />
                      <Tab value="paths" label="Lộ trình học tập" />
                      <Tab value="certs" label="Luyện thi chứng chỉ" />
                      <Tab value="tests" label="Bài đánh giá" />
                    </Tabs>

                    {/* Tab Content rendering logic */}
                    {activeContinueTab === "courses" && (
                      <CarouselRow>
                        {dashboardData?.continueLearning?.courses?.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (item: any) => (
                            <Paper
                              key={item.id}
                              elevation={0}
                              sx={{
                                width: 290,
                                flexShrink: 0,
                                p: 2.5,
                                borderRadius: "20px",
                                border: "1px solid rgba(0,0,0,0.06)",
                                bgcolor: COLORS.white,
                                transition:
                                  "transform 200ms ease, box-shadow 200ms ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 12px 28px rgba(0,0,0,0.04)",
                                },
                              }}
                            >
                              {/* Course Thumbnail placeholder */}
                              <Box
                                sx={{
                                  height: 120,
                                  borderRadius: "14px",
                                  background: item.thumbnailGradient,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  position: "relative",
                                  overflow: "hidden",
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#fff",
                                    fontSize: 28,
                                    fontWeight: 900,
                                    opacity: 0.15,
                                  }}
                                >
                                  EduVerse
                                </Typography>
                                <Chip
                                  label={item.contentType}
                                  size="small"
                                  sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    left: 8,
                                    bgcolor: "rgba(0, 0, 0, 0.65)",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 10,
                                    height: 20,
                                  }}
                                />
                              </Box>

                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  lineHeight: 1.4,
                                  height: 42,
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  color: "#1F2937",
                                }}
                              >
                                {item.title}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 1,
                                  fontSize: 12.5,
                                  color: "rgba(31,41,55,0.5)",
                                  fontWeight: 600,
                                }}
                              >
                                {item.duration}
                              </Typography>

                              {/* Progress Bar */}
                              <Stack
                                direction="row"
                                sx={{
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mt: 2,
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "rgba(31,41,55,0.4)",
                                  }}
                                >
                                  Tiến độ
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: COLORS.primary,
                                  }}
                                >
                                  {item.progress}%
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={item.progress}
                                sx={{
                                  height: 6,
                                  borderRadius: "3px",
                                  bgcolor: "rgba(141,19,19,0.06)",
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: "3px",
                                    background: `linear-gradient(90deg, ${COLORS.primaryLight}, ${COLORS.primary})`,
                                  },
                                }}
                              />

                              {/* Continue Button */}
                              <Button
                                fullWidth
                                variant="outlined"
                                endIcon={
                                  <ArrowForwardRounded fontSize="small" />
                                }
                                sx={{
                                  mt: 2,
                                  py: 1,
                                  borderRadius: "12px",
                                  border: "1px solid rgba(141,19,19,0.12)",
                                  color: COLORS.primary,
                                  fontWeight: 800,
                                  fontSize: 13,
                                  "&:hover": {
                                    border: `1px solid ${COLORS.primary}`,
                                    bgcolor: "rgba(141,19,19,0.04)",
                                  },
                                }}
                              >
                                Tiếp tục học
                              </Button>
                            </Paper>
                          ),
                        )}
                      </CarouselRow>
                    )}

                    {activeContinueTab === "assigned" && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: "24px",
                          border: "1px solid rgba(141,19,19,0.06)",
                          bgcolor: COLORS.white,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 2,
                          boxShadow: "0 8px 24px rgba(141,19,19,0.01)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: "#1F2937",
                          }}
                        >
                          Chưa có khóa học nào được chỉ định
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14.5,
                            color: "rgba(31,41,55,0.6)",
                            maxWidth: 650,
                            lineHeight: 1.6,
                          }}
                        >
                          Chưa có khóa học nào được chỉ định cho bạn. Khi khóa
                          học được chỉ định cho bạn, khóa học sẽ xuất hiện ở
                          đây.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => router.push("/courses")}
                          sx={{
                            background: COLORS.gradientCrimson,
                            color: "#fff",
                            borderRadius: "12px",
                            px: 3.5,
                            py: 1.25,
                            fontWeight: 800,
                            "&:hover": {
                              background: COLORS.gradientCrimsonHover,
                            },
                          }}
                        >
                          Khám phá khóa học
                        </Button>
                      </Paper>
                    )}

                    {activeContinueTab === "paths" && (
                      <CarouselRow>
                        {/* Mock learning paths from user's screen */}
                        <Paper
                          elevation={0}
                          sx={{
                            width: 320,
                            flexShrink: 0,
                            p: 3,
                            borderRadius: "20px",
                            border: "1px solid rgba(0,0,0,0.07)",
                            bgcolor: COLORS.white,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            height: 160,
                            position: "relative",
                            overflow: "hidden",
                            transition:
                              "transform 200ms ease, box-shadow 200ms ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "rgba(31,41,55,0.4)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Lộ trình học tập
                            </Typography>
                            <Typography
                              sx={{
                                mt: 1.5,
                                fontSize: 16,
                                fontWeight: 800,
                                color: "#1F2937",
                                lineHeight: 1.4,
                              }}
                            >
                              Poly - SYB3013 - Khởi sự doanh nghiệp_SP2026
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: "rgba(31,41,55,0.5)",
                              fontWeight: 600,
                            }}
                          >
                            4/4 mục đã hoàn thành
                          </Typography>
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: COLORS.gradientCrimson,
                            }}
                          />
                        </Paper>

                        <Paper
                          elevation={0}
                          sx={{
                            width: 320,
                            flexShrink: 0,
                            p: 3,
                            borderRadius: "20px",
                            border: "1px solid rgba(0,0,0,0.07)",
                            bgcolor: COLORS.white,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            height: 160,
                            position: "relative",
                            overflow: "hidden",
                            transition:
                              "transform 200ms ease, box-shadow 200ms ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "rgba(31,41,55,0.4)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Lộ trình học tập
                            </Typography>
                            <Typography
                              sx={{
                                mt: 1.5,
                                fontSize: 16,
                                fontWeight: 800,
                                color: "#1F2937",
                                lineHeight: 1.4,
                              }}
                            >
                              Poly - SOF1021 - Nhập môn kỹ thuật phần mềm -
                              FA2025
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              color: "rgba(31,41,55,0.5)",
                              fontWeight: 600,
                            }}
                          >
                            4/4 mục đã hoàn thành
                          </Typography>
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: COLORS.gradientCrimson,
                            }}
                          />
                        </Paper>

                        {/* Backend API learning paths */}
                        {dashboardData?.continueLearning?.paths?.map(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (item: any) => (
                            <Paper
                              key={item.id}
                              elevation={0}
                              sx={{
                                width: 320,
                                flexShrink: 0,
                                p: 3,
                                borderRadius: "20px",
                                border: "1px solid rgba(0,0,0,0.07)",
                                bgcolor: COLORS.white,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: 160,
                                position: "relative",
                                overflow: "hidden",
                                transition:
                                  "transform 200ms ease, box-shadow 200ms ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                                },
                              }}
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "rgba(31,41,55,0.4)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {item.contentType || "Lộ trình học tập"}
                                </Typography>
                                <Typography
                                  sx={{
                                    mt: 1.5,
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "#1F2937",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {item.title}
                                </Typography>
                              </Box>
                              <Stack
                                direction="row"
                                sx={{
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: "rgba(31,41,55,0.5)",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.duration || "Đang thực hiện"}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: COLORS.primary,
                                    fontWeight: 800,
                                  }}
                                >
                                  {item.progress}%
                                </Typography>
                              </Stack>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: 4,
                                  background: `linear-gradient(90deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} ${item.progress}%, rgba(0,0,0,0.06) ${item.progress}%)`,
                                }}
                              />
                            </Paper>
                          ),
                        )}
                      </CarouselRow>
                    )}

                    {activeContinueTab === "certs" && (
                      <CarouselRow>
                        {/* Mock certificate from user's screen */}
                        <Paper
                          elevation={0}
                          sx={{
                            width: 440,
                            flexShrink: 0,
                            p: 2.5,
                            borderRadius: "20px",
                            border: "1px solid rgba(0,0,0,0.07)",
                            bgcolor: COLORS.white,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2.5,
                            transition:
                              "transform 200ms ease, box-shadow 200ms ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2.5}
                            sx={{ alignItems: "center" }}
                          >
                            {/* Custom CSS Styled ISTQB logo badge */}
                            <Box
                              sx={{
                                width: 68,
                                height: 68,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid rgba(141,19,19,0.1)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#fff",
                                  fontSize: 10,
                                  fontWeight: 900,
                                  letterSpacing: "0.5px",
                                }}
                              >
                                ISTQB
                              </Typography>
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 12,
                                  width: "70%",
                                  height: 3,
                                  borderRadius: "2px",
                                  background: "#EF4444",
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "#1F2937",
                                  lineHeight: 1.4,
                                  maxWidth: 280,
                                }}
                              >
                                ISTQB® Certified Tester Foundation Level (CTFL)
                              </Typography>
                              <Typography
                                sx={{
                                  mt: 0.5,
                                  fontSize: 13,
                                  color: "rgba(31,41,55,0.4)",
                                  fontWeight: 700,
                                }}
                              >
                                Brightest
                              </Typography>
                            </Box>
                          </Stack>
                          <IconButton size="small">
                            <MoreVertRounded />
                          </IconButton>
                        </Paper>

                        {/* Backend API certificates */}
                        {dashboardData?.continueLearning?.certificates?.map(
                          (item: any) => (
                            <Paper
                              key={item.id}
                              elevation={0}
                              sx={{
                                width: 440,
                                flexShrink: 0,
                                p: 2.5,
                                borderRadius: "20px",
                                border: "1px solid rgba(0,0,0,0.07)",
                                bgcolor: COLORS.white,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2.5,
                                transition:
                                  "transform 200ms ease, box-shadow 200ms ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2.5}
                                sx={{ alignItems: "center" }}
                              >
                                <Box
                                  sx={{
                                    width: 68,
                                    height: 68,
                                    borderRadius: "50%",
                                    background:
                                      item.thumbnailGradient ||
                                      COLORS.gradientCrimson,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                  }}
                                >
                                  <SchoolRounded sx={{ fontSize: 28 }} />
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 15,
                                      fontWeight: 800,
                                      color: "#1F2937",
                                      lineHeight: 1.4,
                                      maxWidth: 280,
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "rgba(31,41,55,0.4)",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {item.duration || "EduVerse"}
                                  </Typography>
                                </Box>
                              </Stack>
                              <IconButton size="small">
                                <MoreVertRounded />
                              </IconButton>
                            </Paper>
                          ),
                        )}
                      </CarouselRow>
                    )}

                    {activeContinueTab === "tests" && (
                      <Stack spacing={3}>
                        {/* Mock promotional assessment banner from user's screen */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: { xs: 3, md: 4 },
                            borderRadius: "24px",
                            border: "1px solid rgba(141,19,19,0.06)",
                            bgcolor: COLORS.white,
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 3,
                            boxShadow: "0 8px 24px rgba(141,19,19,0.015)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 20,
                                fontWeight: 900,
                                color: "#1F2937",
                              }}
                            >
                              Đánh giá các kỹ năng của bạn
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 14.5,
                                color: "rgba(31,41,55,0.6)",
                                maxWidth: 580,
                                lineHeight: 1.6,
                              }}
                            >
                              Làm bài đánh giá và nhận các đề xuất nội dung đáp
                              ứng nhu cầu học tập của bạn.
                            </Typography>
                            <Button
                              variant="contained"
                              sx={{
                                background: COLORS.gradientCrimson,
                                color: "#fff",
                                borderRadius: "12px",
                                px: 3.5,
                                py: 1.25,
                                fontWeight: 800,
                                "&:hover": {
                                  background: COLORS.gradientCrimsonHover,
                                },
                              }}
                            >
                              Khám phá bài đánh giá
                            </Button>
                          </Box>

                          {/* Right illustration mock checklist vector */}
                          <Box
                            sx={{
                              width: 140,
                              height: 100,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: COLORS.primary,
                              opacity: 0.85,
                            }}
                          >
                            <svg
                              width="100"
                              height="80"
                              viewBox="0 0 100 80"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="5"
                                y="5"
                                width="60"
                                height="45"
                                rx="5"
                                stroke={COLORS.primary}
                                strokeWidth="3"
                                fill="#fff"
                              />
                              <line
                                x1="15"
                                y1="18"
                                x2="35"
                                y2="18"
                                stroke={COLORS.primary}
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                              <line
                                x1="15"
                                y1="28"
                                x2="45"
                                y2="28"
                                stroke={COLORS.primary}
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                              <line
                                x1="15"
                                y1="38"
                                x2="50"
                                y2="38"
                                stroke={COLORS.primary}
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                              {/* Hand index finger cursor */}
                              <path
                                d="M55 42 L62 30 C63 28, 66 28, 67 30 L69 34 L78 20 C79 18, 82 18, 83 20 L88 35 L88 55 C88 62, 80 68, 72 68 L60 68 C55 68, 50 63, 50 58 L50 48 Z"
                                fill={COLORS.primary}
                                opacity="0.9"
                              />
                              {/* Radiating click clicks */}
                              <line
                                x1="82"
                                y1="12"
                                x2="86"
                                y2="6"
                                stroke={COLORS.primary}
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <line
                                x1="91"
                                y1="18"
                                x2="98"
                                y2="18"
                                stroke={COLORS.primary}
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <line
                                x1="86"
                                y1="26"
                                x2="92"
                                y2="30"
                                stroke={COLORS.primary}
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Box>
                        </Paper>

                        {/* Backend API tests list */}
                        {dashboardData?.continueLearning?.assessments?.map(
                          (item: any) => (
                            <Paper
                              key={item.id}
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: "20px",
                                border: "1px solid rgba(0,0,0,0.07)",
                                bgcolor: COLORS.white,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                transition:
                                  "transform 200ms ease, box-shadow 200ms ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2.5}
                                sx={{ alignItems: "center" }}
                              >
                                <Box
                                  sx={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: "12px",
                                    background:
                                      item.thumbnailGradient ||
                                      COLORS.gradientCrimson,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#fff",
                                  }}
                                >
                                  <QuizRounded sx={{ fontSize: 24 }} />
                                </Box>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 16,
                                      fontWeight: 800,
                                      color: "#1F2937",
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "rgba(31,41,55,0.4)",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {item.contentType} • {item.duration}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Button
                                variant="outlined"
                                sx={{
                                  borderRadius: "10px",
                                  borderColor: COLORS.primary,
                                  color: COLORS.primary,
                                  fontWeight: 800,
                                  "&:hover": {
                                    borderColor: COLORS.primaryDark,
                                    bgcolor: "rgba(141,19,19,0.04)",
                                  },
                                }}
                              >
                                Làm bài thi
                              </Button>
                            </Paper>
                          ),
                        )}
                      </Stack>
                    )}
                  </Box>

                  {/* ========================================================= */}
                  {/* 5. LĨNH VỰC HỌC TIẾP THEO                                 */}
                  {/* ========================================================= */}
                  <Box>
                    <Typography
                      sx={{ fontSize: 21, fontWeight: 900, color: "#1F2937" }}
                    >
                      Lĩnh vực nên học tiếp theo
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: "rgba(31,41,55,0.5)",
                        mb: 2.5,
                        mt: 0.5,
                      }}
                    >
                      Được đề xuất dựa trên hành vi học tập của bạn.
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr",
                          md: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 2.5,
                      }}
                    >
                      {(dashboardData?.nextSectors || []).map((sec: any) => (
                        <Paper
                          key={sec.id}
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: "20px",
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: COLORS.white,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "all 200ms ease",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: COLORS.primary,
                              boxShadow: `0 10px 24px rgba(141, 19, 19, 0.04)`,
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Box>
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: "14px",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "rgba(141, 19, 19, 0.05)",
                                mb: 2,
                              }}
                            >
                              <SectorIcon
                                iconName={sec.iconName}
                                color={COLORS.primary}
                              />
                            </Box>

                            <Typography
                              sx={{
                                fontSize: 16,
                                fontWeight: 900,
                                mb: 1.5,
                                color: "#1F2937",
                              }}
                            >
                              {sec.title}
                            </Typography>

                            <Stack spacing={0.75}>
                              {(sec.subfields || []).map(
                                (sub: string, i: number) => (
                                  <Typography
                                    key={i}
                                    sx={{
                                      fontSize: 13,
                                      color: "rgba(31,41,55,0.6)",
                                      fontWeight: 500,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      "&:before": {
                                        content: '""',
                                        width: 5,
                                        height: 5,
                                        borderRadius: "50%",
                                        bgcolor: COLORS.primary,
                                        display: "inline-block",
                                      },
                                    }}
                                  >
                                    {sub}
                                  </Typography>
                                ),
                              )}
                            </Stack>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Box>

                  {/* ========================================================= */}
                  {/* 6. DỰA TRÊN KỸ NĂNG BẠN QUAN TÂM                           */}
                  {/* ========================================================= */}
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      sx={{
                        fontSize: 21,
                        fontWeight: 900,
                        mb: 2,
                        color: "#1F2937",
                      }}
                    >
                      Dựa trên kỹ năng bạn quan tâm
                    </Typography>

                    {/* Skill Badges */}
                    <Stack
                      direction="row"
                      spacing={1.25}
                      sx={{ mb: 2.5, flexWrap: "wrap", gap: 1 }}
                    >
                      {(dashboardData?.interestedSkills || []).map(
                        (badge: string) => {
                          const isActive = selectedSkill === badge;
                          return (
                            <Chip
                              key={badge}
                              label={badge}
                              onClick={() => setSelectedSkill(badge)}
                              sx={{
                                bgcolor: isActive
                                  ? COLORS.primary
                                  : "rgba(0,0,0,0.03)",
                                color: isActive
                                  ? "#fff"
                                  : "rgba(31,41,55,0.65)",
                                fontWeight: 700,
                                fontSize: 13.5,
                                px: 1,
                                py: 2,
                                borderRadius: "50px",
                                border: isActive
                                  ? `1px solid ${COLORS.primary}`
                                  : "1px solid rgba(0,0,0,0.05)",
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: isActive
                                    ? COLORS.primary
                                    : "rgba(141, 19, 19, 0.05)",
                                  color: isActive ? "#fff" : COLORS.primary,
                                },
                                transition: "all 150ms ease",
                              }}
                            />
                          );
                        },
                      )}
                    </Stack>

                    {/* Skill based courses Carousel */}
                    <CarouselRow>
                      {(filteredSkillsCourses || []).map((course: any) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </CarouselRow>
                  </Box>

                  {/* ========================================================= */}
                  {/* 7. CÁC KHÓA HỌC HÀNG ĐẦU CHÚNG TÔI CHỌN CHO BẠN             */}
                  {/* ========================================================= */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 21,
                        fontWeight: 900,
                        mb: 2.5,
                        color: "#1F2937",
                      }}
                    >
                      Các khóa học hàng đầu chúng tôi chọn cho bạn
                    </Typography>

                    {/* Premium Featured Hero Card */}
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: "24px",
                        overflow: "hidden",
                        border: "1px solid rgba(141, 19, 19, 0.08)",
                        bgcolor: COLORS.white,
                        mb: 3.5,
                        boxShadow: "0 15px 35px rgba(141, 19, 19, 0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
                        }}
                      >
                        {/* Left: Thumbnail image with overlay design */}
                        <Box
                          sx={{
                            height: { xs: 240, md: "100%" },
                            minHeight: { md: 340 },
                            background:
                              dashboardData?.premiumSelection
                                ?.thumbnailGradient,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "radial-gradient(circle, rgba(255,255,255,0.08), transparent 85%)",
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#fff",
                              fontSize: 48,
                              fontWeight: 900,
                              opacity: 0.08,
                            }}
                          >
                            PREMIUM
                          </Typography>
                          <Chip
                            icon={<StarRounded sx={{ fontSize: "15px" }} />}
                            label="LỰA CHỌN HÀNG ĐẦU"
                            sx={{
                              position: "absolute",
                              top: 20,
                              left: 20,
                              bgcolor: "rgba(255,255,255,0.95)",
                              color: COLORS.primary,
                              fontWeight: 900,
                              fontSize: 11,
                              height: 26,
                              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              "& .MuiChip-icon": {
                                color: `${COLORS.primary} !important`,
                                ml: 1.25,
                              },
                            }}
                          />
                        </Box>

                        {/* Right: Info details */}
                        <Box
                          sx={{
                            p: { xs: 3, md: 4.5 },
                            pt: { xs: 4, md: 5 },
                            pb: { xs: 4, md: 5 },
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: COLORS.primaryLight,
                              mb: 1,
                            }}
                          >
                            KHÓA HỌC ĐẶC BIỆT
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 20,
                              fontWeight: 900,
                              lineHeight: 1.35,
                              mb: 1.5,
                              color: "#1F2937",
                            }}
                          >
                            {dashboardData?.premiumSelection?.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13.5,
                              lineHeight: 1.6,
                              color: "rgba(31,41,55,0.6)",
                              mb: 3,
                            }}
                          >
                            {dashboardData?.premiumSelection?.description}
                          </Typography>

                          <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography
                              sx={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: "#1F2937",
                              }}
                            >
                              Giảng viên:{" "}
                              <span
                                style={{
                                  fontWeight: 500,
                                  color: "rgba(31,41,55,0.7)",
                                }}
                              >
                                {dashboardData?.premiumSelection?.instructor}
                              </span>
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={2.5}
                              sx={{ alignItems: "center" }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{ alignItems: "center" }}
                              >
                                <StarRounded
                                  sx={{ color: "#F59E0B", fontSize: 18 }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#1F2937",
                                  }}
                                >
                                  {dashboardData?.premiumSelection?.rating}
                                </Typography>
                              </Stack>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  color: "rgba(31,41,55,0.5)",
                                  fontWeight: 500,
                                }}
                              >
                                👥{" "}
                                {dashboardData?.premiumSelection?.studentsCount?.toLocaleString()}{" "}
                                học viên
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="contained"
                              sx={{
                                background: COLORS.gradientCrimson,
                                color: "#fff",
                                fontWeight: 800,
                                borderRadius: "12px",
                                px: 3,
                                py: 1.25,
                                "&:hover": {
                                  background: COLORS.gradientCrimsonHover,
                                },
                              }}
                            >
                              Xem khóa học
                            </Button>
                            <Button
                              variant="outlined"
                              sx={{
                                borderColor: "rgba(141, 19, 19, 0.25)",
                                color: COLORS.primary,
                                fontWeight: 800,
                                borderRadius: "12px",
                                px: 2.5,
                                py: 1.25,
                                "&:hover": {
                                  borderColor: COLORS.primary,
                                  bgcolor: "rgba(141, 19, 19, 0.03)",
                                },
                              }}
                            >
                              Thêm vào danh sách
                            </Button>
                          </Stack>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Underneath related courses Carousel */}
                    <CarouselRow>
                      {(
                        dashboardData?.premiumSelection?.relatedCourses || []
                      ).map((course: any) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </CarouselRow>
                  </Box>

                  {/* ========================================================= */}
                  {/* 8. VÌ BẠN ĐÃ ĐĂNG KÝ KHÓA HỌC NÀY                            */}
                  {/* ========================================================= */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 21,
                        fontWeight: 900,
                        mb: 0.5,
                        color: "#1F2937",
                      }}
                    >
                      Vì bạn đã học &quot;
                      {dashboardData?.historyRecommendation?.basedOnCourse}
                      &quot;
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: "rgba(31,41,55,0.5)",
                        mb: 2.5,
                      }}
                    >
                      Đề xuất từ động cơ trí tuệ nhân tạo (AI Recommendation
                      Engine).
                    </Typography>

                    <CarouselRow>
                      {(
                        dashboardData?.historyRecommendation?.courses || []
                      ).map((course: any) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </CarouselRow>
                  </Box>

                  {/* ========================================================= */}
                  {/* 12. FOOTER (Tại chân trang)                               */}
                  {/* ========================================================= */}
                  <Box
                    component="footer"
                    sx={{
                      mt: 8,
                      pt: 5,
                      borderTop: "1px solid rgba(141, 19, 19, 0.08)",
                      color: "rgba(31,41,55,0.56)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr 1fr",
                          md: "1.2fr 1fr 1fr 1fr 0.8fr",
                        },
                        gap: 4,
                      }}
                    >
                      {/* Brand description column */}
                      <Box sx={{ gridColumn: { xs: "span 2", md: "span 1" } }}>
                        <Typography
                          sx={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: COLORS.primary,
                          }}
                        >
                          EduVerse
                        </Typography>
                        <Typography
                          sx={{
                            mt: 1.5,
                            fontSize: 13,
                            lineHeight: 1.7,
                            maxWidth: 220,
                          }}
                        >
                          Nền tảng đào tạo cao cấp cá nhân hóa bằng Trí tuệ nhân
                          tạo (AI). Đồng hành cùng bạn thăng tiến sự nghiệp.
                        </Typography>
                      </Box>

                      {/* Footer Dynamic columns */}
                      {footerColumnsData.map((col) => (
                        <Box key={col.title}>
                          <Typography
                            sx={{
                              fontSize: 14.5,
                              fontWeight: 900,
                              color: "#1F2937",
                              mb: 2,
                            }}
                          >
                            {col.title}
                          </Typography>
                          <Stack spacing={1}>
                            {col.links.map((link) => (
                              <Typography
                                key={link.label}
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  "&:hover": { color: COLORS.primary },
                                }}
                              >
                                {link.label}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      ))}

                      {/* Social Connect Column */}
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 14.5,
                            fontWeight: 900,
                            color: "#1F2937",
                            mb: 2,
                          }}
                        >
                          Kết nối
                        </Typography>
                        <Stack spacing={1}>
                          {["Facebook", "LinkedIn", "Youtube"].map((soc) => (
                            <Typography
                              key={soc}
                              sx={{
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                                "&:hover": { color: COLORS.primary },
                              }}
                            >
                              {soc}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    </Box>

                    {/* Copyright row */}
                    <Box
                      sx={{
                        mt: 5,
                        py: 3,
                        borderTop: "1px solid rgba(0,0,0,0.04)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>
                        © 2026 EduVerse Learning Platform. Tất cả các quyền được
                        bảo lưu.
                      </Typography>
                      <Stack direction="row" spacing={3}>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 500,
                            cursor: "pointer",
                            "&:hover": { color: COLORS.primary },
                          }}
                        >
                          Chính sách bảo mật
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 12.5,
                            fontWeight: 500,
                            cursor: "pointer",
                            "&:hover": { color: COLORS.primary },
                          }}
                        >
                          Điều khoản sử dụng
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
