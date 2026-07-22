/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { COLORS } from "@/src/theme/tokens";
import { createAppTheme } from "@/src/theme/createAppTheme";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  HomeRounded,
  ExploreRounded,
  MoreVertRounded,
  AddRounded,
  TimerRounded,
  FilterListRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  Avatar,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Swal from "sweetalert2";
import { logout } from "@/src/store/auth/AuthSlice";
import { useDispatch, useSelector } from "@/src/store/hook";
import { apiService } from "@/src/services/index";

// --- CRIMSON RED DESIGN PALETTE ---

// Sidebar navigation items
const sidebarPrimaryItems = [
  { label: "Trang chủ", icon: HomeRounded, route: "/dashboard" },
  { label: "Khóa học của tôi", icon: MenuBookRounded, route: "/courses" },
  { label: "Khám phá", icon: ExploreRounded, route: "/courses" },
  {
    label: "Lộ trình học tập",
    icon: TimelineRounded,
    active: true,
    route: "/learning-paths",
  },
  { label: "Lịch học", icon: CalendarMonthRounded, route: "/dashboard" },
  { label: "Kiểm tra & Đánh giá", icon: QuizRounded, route: "/dashboard" },
  { label: "Chứng chỉ", icon: EmojiEventsRounded, route: "/dashboard" },
  { label: "Yêu thích", icon: FavoriteBorderRounded, route: "/dashboard" },
] as const;

const sidebarSecondaryItems = [
  { label: "Hồ sơ cá nhân", icon: SchoolRounded },
  { label: "Cài đặt hệ thống", icon: SettingsRounded },
] as const;

// Roadmaps Sidebar Left
const roadmapCategories = [
  "Tất cả lộ trình",
  "Lộ trình đã chỉnh sửa của tôi",
  "Công nghệ thông tin",
  "Du lịch, nhà hàng và khách sạn",
  "Điện tử và cơ khí",
  "Học chung",
  "Logistics",
  "Quản trị kinh doanh",
] as const;

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

// Sidebar Content Component
function SidebarContent({
  onLogout,
  currentRoute = "/learning-paths",
}: {
  onLogout: () => void;
  currentRoute?: string;
}) {
  const router = useRouter();
  const roles = useSelector((s) => s.auth.roles) || [];

  const getHomeRoute = () => {
    if (roles.includes("Admin")) return "/admin/dashboard";
    return "/student/dashboard";
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
        <List disablePadding>
          {sidebarPrimaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.route === currentRoute;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  let dest: string = item.route;
                  if (dest === "/dashboard") {
                    dest = getHomeRoute();
                  }
                  router.push(dest);
                }}
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
          {sidebarSecondaryItems.map((item) => {
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

      <Box sx={{ px: 2, py: 2, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: "16px",
            px: 2,
            py: 1.25,
            color: "rgba(31,41,55,0.72)",
            "&:hover": {
              bgcolor: "rgba(141,19,19,0.05)",
              color: COLORS.primary,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogoutRounded fontSize="medium" />
          </ListItemIcon>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            Đăng xuất
          </Typography>
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function LearningPathsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const roles = useSelector((s) => s.auth.roles) || [];

  const getHomeRoute = () => {
    if (roles.includes("Admin")) return "/admin/dashboard";
    return "/student/dashboard";
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Học viên");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Roadmap list state
  const [allPaths, setAllPaths] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Tất cả lộ trình");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        // Fetch welcome stats to get user information
        const dashboardRes = await apiService.get<any>("/dashboard");
        if (dashboardRes.status && dashboardRes.data?.welcomeStats) {
          setUserName(dashboardRes.data.welcomeStats.userName);
          setUserAvatar(dashboardRes.data.welcomeStats.avatarUrl);
        }

        // Fetch learning paths
        const pathsRes = await apiService.get<any>("/learning-paths");
        if (pathsRes.status && pathsRes.data) {
          setAllPaths(pathsRes.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải lộ trình học tập:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: COLORS.primary,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await dispatch(logout());
      router.replace("/auth/login");
    }
  };

  const theme = useMemo(
    () => createAppTheme("light", COLORS.primary, COLORS.primaryDark),
    [],
  );

  const sidebarWidth = 280;
  const headerHeight = "76px";

  // Filtered learning paths
  const filteredPaths = useMemo(() => {
    return allPaths.filter((path) => {
      // 1. Search Query
      const matchesSearch =
        searchQuery === "" ||
        path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        path.author.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Left Category Sidebar Lọc
      let matchesCategory = true;
      if (selectedCategory === "Lộ trình đã chỉnh sửa của tôi") {
        matchesCategory =
          path.author === userName || path.author === "Tạ Thị Hồng Trâm"; // Mock user-owned roadmaps
      } else if (selectedCategory !== "Tất cả lộ trình") {
        matchesCategory = path.category === selectedCategory;
      }

      // 3. Dropdown FilterType Lọc (Tất cả lộ trình, Lộ trình công ty, Lộ trình cộng đồng)
      let matchesType = true;
      if (filterType === "company") {
        matchesType = path.isCompanyPath === true;
      } else if (filterType === "community") {
        matchesType = path.isCompanyPath === false;
      }

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [allPaths, searchQuery, selectedCategory, filterType, userName]);

  if (loading) {
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
              Đang tải lộ trình học tập...
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
          minHeight: "100vh",
          bgcolor: COLORS.bgLight,
          display: "flex",
          flexDirection: "column",
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
              onClick={() => router.push(getHomeRoute())}
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
              maxHeight: 44,
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
              placeholder="Tìm kiếm nội dung bất kỳ"
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

            {/* User Avatar */}
            <Stack direction="row" sx={{ alignItems: "center", pl: 0.5 }}>
              <Avatar
                src={userAvatar || undefined}
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
                {userName
                  ? userName.split(" ").pop()?.substring(0, 2).toUpperCase()
                  : "HV"}
              </Avatar>
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
          <SidebarContent onLogout={handleLogout} />
        </Drawer>

        {/* ========================================================= */}
        {/* MAIN LAYOUT STRUCTURE                                     */}
        {/* ========================================================= */}
        <Box sx={{ display: "flex", flex: 1, pt: headerHeight }}>
          {/* 1. LEFT SIDEBAR (Desktop Fixed) */}
          <Box
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              display: { xs: "none", lg: "block" },
              borderRight: "1px solid rgba(0,0,0,0.06)",
              position: "sticky",
              top: headerHeight,
              alignSelf: "flex-start",
              height: `calc(100vh - ${headerHeight})`,
              bgcolor: COLORS.white,
            }}
          >
            <SidebarContent onLogout={handleLogout} />
          </Box>

          {/* 2. MAIN CONTENT AREA */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 2, md: 5 },
              py: 4.5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "1280px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {/* ========================================================= */}
              {/* 2.1 HERO SECTION                                          */}
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
                      "radial-gradient(circle, rgba(141,19,19,0.05) 0%, transparent 70%)",
                    zIndex: 0,
                  }}
                />

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 4,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: 26, md: 32 },
                        fontWeight: 900,
                        color: COLORS.primary,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Lộ trình học tập
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1.5,
                        fontSize: 14.5,
                        color: "rgba(31,41,55,0.65)",
                        lineHeight: 1.7,
                        maxWidth: 650,
                      }}
                    >
                      Chia sẻ kiến thức của bạn bằng cách tạo lộ trình có mục
                      tiêu rõ ràng. Tự ghi danh vào một lộ trình sẽ giúp bạn đạt
                      được mục tiêu và bù đắp các lỗ hổng kiến thức.
                    </Typography>
                  </Box>

                  {/* Right Roadmap Graphic vector mockup */}
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      background: "rgba(141,19,19,0.03)",
                      display: "grid",
                      placeItems: "center",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background: COLORS.gradientCrimson,
                        boxShadow: "0 8px 24px rgba(141, 19, 19, 0.3)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <TimelineRounded sx={{ fontSize: 48, color: "#fff" }} />
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              {/* ========================================================= */}
              {/* 2.2 SPLIT LAYOUT (Roadmaps sidebar + List content)         */}
              {/* ========================================================= */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                  gap: 4.5,
                  alignItems: "flex-start",
                }}
              >
                {/* A. ROADMAP CATEGORIES SIDEBAR */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "20px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    bgcolor: COLORS.white,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "rgba(31,41,55,0.4)",
                      px: 1.5,
                      mb: 1,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Danh mục lộ trình
                  </Typography>

                  <List disablePadding>
                    {roadmapCategories.map((cat, idx) => {
                      const isHeading =
                        cat === "Công nghệ thông tin" && idx === 2; // Insert a divider heading before
                      const isSelected = selectedCategory === cat;
                      return (
                        <Box key={cat}>
                          {idx === 2 && (
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "rgba(31,41,55,0.4)",
                                px: 1.5,
                                mt: 2,
                                mb: 1,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                              }}
                            >
                              Các lộ trình có tổ chức
                            </Typography>
                          )}
                          <ListItemButton
                            onClick={() => setSelectedCategory(cat)}
                            sx={{
                              borderRadius: "12px",
                              py: 1,
                              px: 1.5,
                              mb: 0.5,
                              color: isSelected
                                ? COLORS.primary
                                : "rgba(31,41,55,0.7)",
                              bgcolor: isSelected
                                ? "rgba(141,19,19,0.04)"
                                : "transparent",
                              borderLeft: isSelected
                                ? `3px solid ${COLORS.primary}`
                                : "3px solid transparent",
                              "&:hover": { bgcolor: "rgba(141,19,19,0.02)" },
                              transition: "all 150ms ease",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              {cat}
                            </Typography>
                          </ListItemButton>
                        </Box>
                      );
                    })}
                  </List>
                </Paper>

                {/* B. ROADMAPS CONTENT LIST AREA */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Title and Action Row */}
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{ fontSize: 22, fontWeight: 900, color: "#1F2937" }}
                      >
                        {selectedCategory}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: "rgba(31,41,55,0.5)",
                          mt: 0.5,
                        }}
                      >
                        Duyệt qua các lộ trình học tập tối ưu nhằm phát triển kỹ
                        năng nhanh chóng.
                      </Typography>
                    </Box>

                    {/* Create Button in brand Crimson color */}
                    <Button
                      variant="contained"
                      startIcon={<AddRounded />}
                      sx={{
                        background: COLORS.gradientCrimson,
                        color: "#fff",
                        borderRadius: "12px",
                        px: 2.5,
                        py: 1.25,
                        fontSize: 14,
                        fontWeight: 800,
                        "&:hover": {
                          background: COLORS.gradientCrimsonHover,
                        },
                      }}
                    >
                      Tạo lộ trình
                    </Button>
                  </Stack>

                  {/* Toolbar Filters Row */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "16px",
                      border: "1px solid rgba(0,0,0,0.07)",
                      bgcolor: COLORS.white,
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Search inside roadmaps */}
                    <Paper
                      elevation={0}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        border: "1px solid rgba(0,0,0,0.12)",
                        borderRadius: "10px",
                        width: { xs: "100%", sm: 260 },
                        bgcolor: "#FFF",
                      }}
                    >
                      <InputBase
                        placeholder="Tìm kiếm lộ trình học tập"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ flex: 1, fontSize: 13 }}
                      />
                      <IconButton size="small" sx={{ color: COLORS.primary }}>
                        <SearchRounded fontSize="small" />
                      </IconButton>
                    </Paper>

                    {/* Dropdowns Filters */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        justifyContent: "flex-end",
                      }}
                    >
                      {/* Sort Dropdown */}
                      <Select
                        size="small"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        sx={{
                          fontSize: 13,
                          borderRadius: "10px",
                          minWidth: 120,
                          "& .MuiSelect-select": { py: 1 },
                        }}
                      >
                        <MenuItem value="latest">Mới nhất</MenuItem>
                        <MenuItem value="popular">Xem nhiều nhất</MenuItem>
                      </Select>

                      {/* Path type filter dropdown */}
                      <Select
                        size="small"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{
                          fontSize: 13,
                          borderRadius: "10px",
                          minWidth: 150,
                          "& .MuiSelect-select": { py: 1 },
                        }}
                      >
                        <MenuItem value="all">Tất cả lộ trình</MenuItem>
                        <MenuItem value="company">Lộ trình công ty</MenuItem>
                        <MenuItem value="community">
                          Lộ trình cộng đồng
                        </MenuItem>
                      </Select>
                    </Stack>
                  </Paper>

                  {/* List of roadmaps */}
                  <Stack spacing={2}>
                    {filteredPaths.length > 0 ? (
                      filteredPaths.map((path) => (
                        <Paper
                          key={path.id}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: "20px",
                            border: "1px solid rgba(0,0,0,0.07)",
                            bgcolor: COLORS.white,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 200ms ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 20px rgba(141,19,19,0.03)",
                              borderColor: "rgba(141,19,19,0.15)",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2.5}
                            sx={{ alignItems: "center", flex: 1, minWidth: 0 }}
                          >
                            {/* Icon on Left */}
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: "14px",
                                bgcolor: "rgba(141, 19, 19, 0.05)",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              <TimelineRounded
                                sx={{ fontSize: 26, color: COLORS.primary }}
                              />
                            </Box>

                            {/* Center details */}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                noWrap={true}
                                sx={{
                                  fontSize: 15.5,
                                  fontWeight: 800,
                                  color: "#1F2937",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {path.title}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  color: "rgba(31,41,55,0.5)",
                                  mt: 0.5,
                                }}
                              >
                                Tác giả:{" "}
                                <span
                                  style={{ fontWeight: 600, color: "#4B5563" }}
                                >
                                  {path.author}
                                </span>
                              </Typography>

                              {/* Indicators Row */}
                              <Stack
                                direction="row"
                                spacing={2}
                                sx={{
                                  mt: 1.5,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={
                                    path.isCompanyPath
                                      ? "Lộ trình công ty"
                                      : "Lộ trình cộng đồng"
                                  }
                                  size="small"
                                  sx={{
                                    bgcolor: path.isCompanyPath
                                      ? "rgba(141, 19, 19, 0.05)"
                                      : "rgba(0, 0, 0, 0.03)",
                                    color: path.isCompanyPath
                                      ? COLORS.primary
                                      : "rgba(31, 41, 55, 0.6)",
                                    fontWeight: 700,
                                    fontSize: 10.5,
                                    height: 22,
                                  }}
                                />
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{
                                    alignItems: "center",
                                    color: "rgba(31,41,55,0.45)",
                                  }}
                                >
                                  <TimerRounded sx={{ fontSize: 15 }} />
                                  <Typography
                                    sx={{ fontSize: 12, fontWeight: 600 }}
                                  >
                                    {path.duration}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{
                                    alignItems: "center",
                                    color: "rgba(31,41,55,0.45)",
                                  }}
                                >
                                  <PeopleAltRounded sx={{ fontSize: 15 }} />
                                  <Typography
                                    sx={{ fontSize: 12, fontWeight: 600 }}
                                  >
                                    {path.enrolledCount} học viên
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          </Stack>

                          {/* Action Dot Menu */}
                          <IconButton
                            size="small"
                            sx={{ color: "rgba(0,0,0,0.4)", ml: 1.5 }}
                          >
                            <MoreVertRounded />
                          </IconButton>
                        </Paper>
                      ))
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 5,
                          borderRadius: "20px",
                          border: "1px dashed rgba(0,0,0,0.12)",
                          bgcolor: COLORS.white,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 14.5,
                            fontWeight: 600,
                            color: "rgba(31,41,55,0.4)",
                          }}
                        >
                          Không tìm thấy lộ trình học tập nào.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
