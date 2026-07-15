/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  SearchRounded,
  FavoriteBorderOutlined,
  ShoppingCartOutlined,
  NotificationsNoneRounded,
  SettingsRounded,
  LogoutRounded,
  MenuRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CalendarMonthRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Avatar,
  useTheme,
} from "@mui/material";
import { logout } from "@/src/store/auth/AuthSlice";
import { useDispatch, useSelector } from "@/src/store/hook";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const theme = useTheme();

  const user = useSelector((state: any) => state.auth.user);
  const roles = useSelector((state: any) => state.auth.roles) || [];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user_avatar");
        if (stored) {
          setUserAvatar(stored);
        }
      }
    };
    window.addEventListener("avatar_updated", handleAvatarUpdate);
    handleAvatarUpdate();
    return () => window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/auth/login");
  };

  const hoTen = user?.hoTen || "Học viên EduVerse";
  const userInitials = hoTen
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const getHomeRoute = () => {
    if (roles.includes("Admin")) return "/admin/dashboard";
    if (roles.includes("GiaoVien")) return "/instructor/dashboard";
    return "/student/dashboard";
  };

  const [activeRole, setActiveRole] = useState<string>("HocVien");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname.startsWith("/instructor")) {
        localStorage.setItem("current_role", "GiaoVien");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveRole("GiaoVien");
      } else if (pathname.startsWith("/admin")) {
        localStorage.setItem("current_role", "Admin");
        setActiveRole("Admin");
      } else if (pathname.startsWith("/student/dashboard")) {
        localStorage.setItem("current_role", "HocVien");
        setActiveRole("HocVien");
      } else {
        const storedRole = localStorage.getItem("current_role");
        if (storedRole) {
          setActiveRole(storedRole);
        } else {
          if (roles.includes("GiaoVien")) {
            setActiveRole("GiaoVien");
          } else if (roles.includes("Admin")) {
            setActiveRole("Admin");
          } else {
            setActiveRole("HocVien");
          }
        }
      }
    }
  }, [pathname, roles]);

  const isInstructorMode = activeRole === "GiaoVien";
  const isAdminMode = activeRole === "Admin";
  const isStudentMode = activeRole === "HocVien";

  // Search placeholder based on mode
  const getSearchPlaceholder = () => {
    if (isAdminMode) return "Tìm kiếm báo cáo...";
    if (isInstructorMode) return "Tìm kiếm học viên, khóa học hoặc dữ liệu...";
    return "Tìm kiếm nội dung bất kỳ...";
  };

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1200,
        px: { xs: 2, md: 3.5 },
        py: 1.75,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        height: 86,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", width: "100%", minHeight: 52 }}
      >
        {/* Mobile Sidebar Toggle Button */}
        {onMenuClick && (
          <IconButton
            onClick={onMenuClick}
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              color: "primary.main",
            }}
          >
            <MenuRounded />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          sx={{
            width: { xs: 120, sm: 140, lg: 150 },
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "opacity 150ms ease",
            "&:hover": { opacity: 0.85 },
          }}
          onClick={() => router.push(getHomeRoute())}
        >
          <Image
            src="/auth/img/logo_nentrang.png"
            alt="EduVerse"
            width={150}
            height={46}
            priority
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </Box>

        {/* Left Side Links */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ display: { xs: "none", lg: "flex" }, flexShrink: 0 }}
        >
          {/* Active Navigation items based on roles / modes */}
          {isStudentMode && (
            <Button
              onClick={() => router.push("/student/explore")}
              sx={{
                color:
                  pathname === "/student/explore"
                    ? "primary.main"
                    : "text.primary",
                fontWeight: 600,
                fontSize: 14,
                textTransform: "none",
                px: 1.5,
                "&:hover": { color: "primary.main", bgcolor: "transparent" },
              }}
            >
              Khám phá
            </Button>
          )}

          {isInstructorMode && (
            <>
              <Button
                onClick={() => router.push("/student/explore")}
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Khám phá
              </Button>
              <Button
                onClick={() => router.push("/instructor/manager-courses")}
                sx={{
                  color: pathname.startsWith("/instructor/manager-courses")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Quản lý khóa học
              </Button>
              <Button
                onClick={() => router.push("/instructor/manager-promotions")}
                sx={{
                  color: pathname.startsWith("/instructor/manager-promotions")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Khuyến mãi
              </Button>
              <Button
                onClick={() => router.push("/instructor/money")}
                sx={{
                  color: pathname.startsWith("/instructor/money")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Doanh thu
              </Button>
              <Button
                onClick={() => router.push("/instructor/bank")}
                sx={{
                  color: pathname.startsWith("/instructor/bank")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Ngân hàng
              </Button>
            </>
          )}

          {isAdminMode && (
            <>
              <Button
                onClick={() => router.push("/admin/dashboard")}
                sx={{
                  color:
                    pathname === "/admin/dashboard"
                      ? "primary.main"
                      : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Bảng điều khiển
              </Button>
              <Button
                onClick={() => router.push("/admin/approve-courses")}
                sx={{
                  color:
                    pathname === "/admin/approve-courses"
                      ? "primary.main"
                      : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Duyệt khóa học
              </Button>
              <Button
                onClick={() => router.push("/admin/users")}
                sx={{
                  color:
                    pathname === "/admin/users"
                      ? "primary.main"
                      : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Người dùng
              </Button>
            </>
          )}
        </Stack>

        {/* Center Search Pill */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 600,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2.5,
              py: 1.15,
              borderRadius: 50,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
              "&:focus-within": {
                borderColor: "rgba(0,0,0,0.3)",
              },
            }}
          >
            <SearchRounded
              sx={{ color: "rgba(24,24,27,0.42)", fontSize: 18 }}
            />
            <InputBase
              placeholder={getSearchPlaceholder()}
              sx={{ flex: 1, fontSize: 13.5 }}
            />
          </Paper>
        </Box>

        {/* Right Actions & Buttons */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", flexShrink: 0 }}
        >
          {/* Student Mode Roles buttons */}
          {isStudentMode && (
            <>
              {roles.includes("GiaoVien") ? (
                <Button
                  onClick={() => router.push("/instructor/dashboard")}
                  sx={{
                    display: { xs: "none", lg: "block" },
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: 14,
                    textTransform: "none",
                    px: 1.5,
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Trang giảng viên
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/student/become-instructor")}
                  sx={{
                    display: { xs: "none", lg: "block" },
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: 14,
                    textTransform: "none",
                    px: 1.5,
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Trở thành Giảng viên
                </Button>
              )}

              <Button
                onClick={() => router.push("/student/courses/my-courses")}
                sx={{
                  display: { xs: "none", lg: "block" },
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Khóa học của tôi
              </Button>
            </>
          )}

          {/* Instructor Mode Role switch */}
          {isInstructorMode && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push("/student/dashboard")}
              startIcon={<ChevronLeftRounded />}
              sx={{
                borderRadius: "10px",
                borderColor: "divider",
                color: "text.primary",
                px: 1.5,
                py: 0.6,
                fontSize: 12.5,
                fontWeight: 600,
                textTransform: "none",
                display: { xs: "none", md: "flex" },
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(141,19,19,0.03)",
                  color: "primary.main",
                },
              }}
            >
              Chế độ Học viên
            </Button>
          )}

          {/* Admin Mode Role switch */}
          {isAdminMode && (
            <>
              {/* Extra Admin Export Controls */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={
                    <CalendarMonthRounded sx={{ color: "text.secondary" }} />
                  }
                  sx={{
                    borderRadius: "10px",
                    borderColor: "divider",
                    color: "text.primary",
                    px: 2,
                    py: 0.6,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "background.paper",
                  }}
                >
                  01 Th11 - 30 Th11
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    <ArrowForwardRounded sx={{ transform: "rotate(90deg)" }} />
                  }
                  sx={{
                    borderRadius: "10px",
                    bgcolor: "primary.main",
                    color: "#fff",
                    px: 2,
                    py: 0.6,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  Xuất báo cáo
                </Button>
              </Stack>

              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/student/dashboard")}
                startIcon={<ChevronLeftRounded />}
                sx={{
                  borderRadius: "10px",
                  borderColor: "divider",
                  color: "text.primary",
                  px: 1.5,
                  py: 0.6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  textTransform: "none",
                  display: { xs: "none", md: "flex" },
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(141,19,19,0.03)",
                    color: "primary.main",
                  },
                }}
              >
                Chế độ Học viên
              </Button>
            </>
          )}

          {/* Standard Icons */}
          {isStudentMode && (
            <>
              <IconButton
                onClick={() => router.push("/student/favorites")}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "transparent",
                  color: "text.primary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <FavoriteBorderOutlined fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => router.push("/student/cart")}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "transparent",
                  color: "text.primary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <ShoppingCartOutlined fontSize="small" />
              </IconButton>
            </>
          )}

          <IconButton
            sx={{
              width: 42,
              height: 42,
              bgcolor: "transparent",
              color: "text.primary",
              "&:hover": { color: "primary.main" },
            }}
          >
            <NotificationsNoneRounded fontSize="small" />
          </IconButton>

          {/* User Avatar dropdown */}
          <Avatar
            src={userAvatar || user?.anhDaiDien || undefined}
            onClick={handleAvatarClick}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#8B1313",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              border: "2px solid #fff",
              boxShadow: `0 0 0 2px rgba(139,19,19,0.2), 0 4px 8px rgba(0,0,0,0.06)`,
              transition: "all 200ms ease",
              cursor: "pointer",
              "&:hover": {
                boxShadow: `0 0 0 2px rgba(139,19,19,0.45), 0 6px 14px rgba(139,19,19,0.15)`,
                transform: "scale(1.05)",
              },
            }}
          >
            {userInitials}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            disableScrollLock
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
                    "&:hover": {
                      bgcolor: "rgba(141,19,19,0.04)",
                      color: "#8B1313",
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
                src={userAvatar || undefined}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                {userInitials}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  noWrap
                  sx={{
                    fontWeight: 800,
                    fontSize: 14.5,
                    color: "#1F2937",
                  }}
                >
                  {hoTen}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 11.5,
                    color: "text.secondary",
                  }}
                >
                  {user?.email || "email@example.com"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {isStudentMode && (
              <>
                <MenuItem onClick={() => router.push("/student/dashboard")}>
                  Học tập
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/cart")}>
                  Giỏ hàng của tôi
                </MenuItem>
                <MenuItem onClick={() => router.push("/student/favorites")}>
                  Danh sách mong ước
                </MenuItem>
              </>
            )}

            {roles.includes("GiaoVien") && !isInstructorMode && (
              <MenuItem onClick={() => router.push("/instructor/dashboard")}>
                Bảng điều khiển giảng viên
              </MenuItem>
            )}

            {roles.includes("Admin") && !isAdminMode && (
              <MenuItem onClick={() => router.push("/admin/dashboard")}>
                Bảng điều khiển admin
              </MenuItem>
            )}

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={() => router.push(roles.includes("Admin") ? "/admin/settings" : "/settings")}>
              <ListItemIcon sx={{ minWidth: "32px !important" }}>
                <SettingsRounded fontSize="small" />
              </ListItemIcon>
              Cài đặt tài khoản
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon sx={{ minWidth: "32px !important" }}>
                <LogoutRounded fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
}
