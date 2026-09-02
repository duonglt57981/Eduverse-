/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  SearchRounded,
  FavoriteBorderOutlined,
  ShoppingCartOutlined,
  MailOutlineRounded,
  NotificationsNoneRounded,
  SettingsRounded,
  LogoutRounded,
  MenuRounded,
  CalendarMonthRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  ClickAwayListener,
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
  Badge,
} from "@mui/material";
import Swal from "sweetalert2";
import { logout } from "@/src/store/auth/AuthSlice";
import { useDispatch, useSelector } from "@/src/store/hook";
import KhoaHocService from "@/src/services/KhoaHocService";
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { EduAvatar } from "@/src/components/common/EduAvatar";
import { alpha } from "@mui/material/styles";
import { BRAND, CSSVAR } from "@/src/theme/tokens";
import { useFavorite } from "@/src/features/favorite/hooks/useFavorite";
import { getGioHang } from "@/src/store/gioHang/GioHangSlice";
import WishlistHoverPopover from "./header/WishlistHoverPopover";
import CartHoverPopover from "./header/CartHoverPopover";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  onNotificationClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  unreadNotificationCount?: number;
}

const EMPTY_ROLES: string[] = [];

export default function DashboardHeader({
  onMenuClick,
  onNotificationClick,
  unreadNotificationCount = 0,
}: DashboardHeaderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname() || "/";

  const user = useSelector((state: any) => state.auth.user);
  const roles = useSelector((state: any) => state.auth.roles) || EMPTY_ROLES;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [khoaHocService] = useState(() => new KhoaHocService());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KhoaHocType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { favorites, favoriteCount, fetchFavorites } = useFavorite();
  const gioHang = useSelector((state: any) => state.gioHang.gioHang);
  const cartItemsCount = gioHang?.items?.length ?? 0;

  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [favAnchorEl, setFavAnchorEl] = useState<HTMLElement | null>(null);
  const [cartAnchorEl, setCartAnchorEl] = useState<HTMLElement | null>(null);
  const favBtnRef = React.useRef<HTMLDivElement | null>(null);
  const cartBtnRef = React.useRef<HTMLDivElement | null>(null);
  const favLeaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cartLeaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      void fetchFavorites();
      void dispatch(getGioHang());
    }
  }, [user, dispatch, fetchFavorites]);

  const handleFavMouseEnter = () => {
    if (favLeaveTimer.current) {
      clearTimeout(favLeaveTimer.current);
      favLeaveTimer.current = null;
    }
    if (favBtnRef.current) {
      setFavAnchorEl(favBtnRef.current);
    }
    setIsFavOpen(true);
  };
  const handleFavMouseLeave = () => {
    if (favLeaveTimer.current) clearTimeout(favLeaveTimer.current);
    favLeaveTimer.current = setTimeout(() => {
      setIsFavOpen(false);
    }, 250);
  };

  const handleCartMouseEnter = () => {
    if (cartLeaveTimer.current) {
      clearTimeout(cartLeaveTimer.current);
      cartLeaveTimer.current = null;
    }
    if (cartBtnRef.current) {
      setCartAnchorEl(cartBtnRef.current);
    }
    setIsCartOpen(true);
  };
  const handleCartMouseLeave = () => {
    if (cartLeaveTimer.current) clearTimeout(cartLeaveTimer.current);
    cartLeaveTimer.current = setTimeout(() => {
      setIsCartOpen(false);
    }, 250);
  };

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (typeof window !== "undefined" && user?.email) {
        const stored = localStorage.getItem(`user_avatar_${user.email}`);
        if (stored) {
          setUserAvatar(stored);
        }
      }
    };
    window.addEventListener("avatar_updated", handleAvatarUpdate);
    handleAvatarUpdate();
    return () =>
      window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, [user?.email]);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    const result = await Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: BRAND.main,
      cancelButtonColor: CSSVAR.textMuted,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await dispatch(logout());
      router.replace("/auth/login");
    }
  };

  const hoTen = user?.hoTen || "Học viên EduVerse";
  const userInitials = hoTen
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const getHomeRoute = () => {
    if (
      pathname.startsWith("/personnel") ||
      roles.some(
        (r: string) =>
          r.toLowerCase() === "personnel" || r.toLowerCase() === "nhanvien",
      )
    )
      return "/personnel/approve-courses";
    if (roles.includes("Admin")) return "/admin/dashboard";
    if (roles.includes("GiaoVien")) return "/instructor/dashboard";
    return "/student/dashboard";
  };

  const [activeRole, setActiveRole] = useState<string>("HocVien");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname.startsWith("/personnel")) {
        localStorage.setItem("current_role", "personnel");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveRole("personnel");
      } else if (pathname.startsWith("/instructor")) {
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
          if (
            roles.some(
              (r: string) =>
                r.toLowerCase() === "personnel" ||
                r.toLowerCase() === "nhanvien",
            )
          ) {
            setActiveRole("personnel");
          } else if (roles.includes("GiaoVien")) {
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

  const isPersonnelMode =
    pathname.startsWith("/personnel") ||
    activeRole === "personnel" ||
    (roles.some(
      (r: string) =>
        r.toLowerCase() === "personnel" || r.toLowerCase() === "nhanvien",
    ) &&
      !pathname.startsWith("/instructor") &&
      !pathname.startsWith("/admin"));
  const isInstructorMode = !isPersonnelMode && activeRole === "GiaoVien";
  const isAdminMode = !isPersonnelMode && activeRole === "Admin";
  const isStudentMode = !isPersonnelMode && activeRole === "HocVien";

  useEffect(() => {
    const keyword = searchQuery.trim();
    if (!isInstructorMode || !keyword) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await khoaHocService.SearchWithElasticsearch(
          {
            keyword,
            pageIndex: 1,
            pageSize: 6,
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setSearchResults(response.data?.items || []);
          setIsSearchOpen(true);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
          setSearchError("Không thể tìm kiếm lúc này.");
          setIsSearchOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isInstructorMode, khoaHocService, searchQuery]);

  const submitSearch = () => {
    const keyword = searchQuery.trim();
    if (!keyword) return;

    setIsSearchOpen(false);
    router.push(`/student/explore?keyword=${encodeURIComponent(keyword)}`);
  };

  const openCourse = (courseId?: string) => {
    if (!courseId) return;

    setIsSearchOpen(false);
    router.push(`/student/enroll-courses/${courseId}`);
  };

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
        height: 74,
        zIndex: 1200,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.01)",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: "100%",
          maxWidth: "100%",
          mx: "auto",
          px: { xs: 2, md: 6 },
        }}
      >
        <Stack
          direction="row"
          sx={{
            height: "100%",
            width: "100%",
            alignItems: "center",
            gap: { xs: 1.5, md: 2.5 },
          }}
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
              px: 0.75,
              py: 0.35,
              borderRadius: "10px",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.92)"
                  : "transparent",
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
            {isPersonnelMode && (
              <Button
                onClick={() => router.push("/personnel/approve-courses")}
                sx={{
                  color: pathname.startsWith("/personnel/approve-courses")
                    ? "primary.main"
                    : "text.primary",
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: "none",
                  px: 1.5,
                  "&:hover": { color: "primary.main", bgcolor: "transparent" },
                }}
              >
                Kiểm duyệt khóa học
              </Button>
            )}

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
                  onClick={() => router.push("/instructor/manager-courses")}
                  sx={{
                    color: pathname.startsWith("/instructor/manager-courses")
                      ? "primary.main"
                      : "text.primary",
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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Người dùng
                </Button>
              </>
            )}
          </Stack>

          {/* Center Search Pill */}
          <ClickAwayListener onClickAway={() => setIsSearchOpen(false)}>
            <Box
              sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                width: "100%",
                maxWidth: 600,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Paper
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch();
                }}
                elevation={0}
                sx={{
                  width: "100%",
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  px: 2,
                  borderRadius: "999px",
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:focus-within": {
                    bgcolor: "background.paper",
                    borderColor: "primary.main",
                    boxShadow: (theme) =>
                      `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                  },
                }}
              >
                <SearchRounded
                  onClick={submitSearch}
                  sx={{
                    color: "rgba(24,24,27,0.42)",
                    fontSize: 18,
                    cursor: searchQuery.trim() ? "pointer" : "default",
                  }}
                />
                <InputBase
                  value={searchQuery}
                  onChange={(event) => {
                    const nextQuery = event.target.value;
                    setSearchQuery(nextQuery);
                    if (!nextQuery.trim()) {
                      setSearchResults([]);
                      setIsSearching(false);
                      setSearchError("");
                    }
                    if (isInstructorMode) setIsSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (isInstructorMode && searchQuery.trim().length > 0) {
                      setIsSearchOpen(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setIsSearchOpen(false);
                  }}
                  placeholder={getSearchPlaceholder()}
                  inputProps={{ "aria-label": getSearchPlaceholder() }}
                  sx={{ flex: 1, fontSize: 13.5 }}
                />
                {isInstructorMode && isSearching && (
                  <CircularProgress size={17} thickness={5} />
                )}
              </Paper>

              {isInstructorMode &&
                isSearchOpen &&
                searchQuery.trim().length > 0 && (
                  <Paper
                    elevation={8}
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      zIndex: 1300,
                      overflow: "hidden",
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {!isSearching && searchError && (
                      <Typography
                        sx={{
                          px: 2,
                          py: 2,
                          fontSize: 13.5,
                          color: "error.main",
                        }}
                      >
                        {searchError}
                      </Typography>
                    )}

                    {!isSearching &&
                      !searchError &&
                      searchResults.length === 0 && (
                        <Typography
                          sx={{
                            px: 2,
                            py: 2,
                            fontSize: 13.5,
                            color: "text.secondary",
                          }}
                        >
                          Không tìm thấy khóa học phù hợp.
                        </Typography>
                      )}

                    {searchResults.map((course) => (
                      <Box
                        key={String(course.id)}
                        component="button"
                        type="button"
                        onClick={() =>
                          openCourse(course.id ? String(course.id) : undefined)
                        }
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1.25,
                          border: 0,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                          color: "text.primary",
                          textAlign: "left",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            course.hinhAnhKhoaHoc ||
                            "/khoahoc/1-removebg-preview.png"
                          }
                          alt=""
                          sx={{
                            width: 52,
                            height: 38,
                            flexShrink: 0,
                            borderRadius: 1,
                            objectFit: "cover",
                            bgcolor: "action.hover",
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            noWrap
                            sx={{ fontSize: 13.5, fontWeight: 700 }}
                          >
                            {course.tieuDe || "Khóa học chưa có tên"}
                          </Typography>
                          <Typography
                            noWrap
                            sx={{ fontSize: 12, color: "text.secondary" }}
                          >
                            {[course.loaiKhoaHoc, course.capDo]
                              .filter(Boolean)
                              .join(" • ") || "Khóa học"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}

                    {!searchError && searchResults.length > 0 && (
                      <Button
                        fullWidth
                        onClick={submitSearch}
                        sx={{
                          py: 1.25,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Xem tất cả kết quả
                      </Button>
                    )}
                  </Paper>
                )}
            </Box>
          </ClickAwayListener>

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
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Khóa học của tôi
                </Button>
              </>
            )}

            {/* Instructor Mode Role switch */}
            {isInstructorMode && (
              <Button
                size="small"
                onClick={() => router.push("/student/dashboard")}
                sx={{
                  borderRadius: "999px",
                  bgcolor: "rgba(139, 19, 19, 0.06)",
                  border: "1px solid rgba(139, 19, 19, 0.16)",
                  color: BRAND.main,
                  px: 2,
                  py: 0.75,
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  display: { xs: "none", md: "inline-flex" },
                  alignItems: "center",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(139, 19, 19, 0.12)",
                    borderColor: BRAND.main,
                    color: BRAND.dark,
                    boxShadow: "0 4px 12px rgba(139, 19, 19, 0.12)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Chế độ Học viên
              </Button>
            )}

            {/* Admin Mode Role switch */}
            {isAdminMode && (
              <>
                <Button
                  size="small"
                  onClick={() => router.push("/student/dashboard")}
                  sx={{
                    borderRadius: "999px",
                    bgcolor: "rgba(139, 19, 19, 0.06)",
                    border: "1px solid rgba(139, 19, 19, 0.16)",
                    color: BRAND.main,
                    px: 2,
                    py: 0.75,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    display: { xs: "none", md: "inline-flex" },
                    alignItems: "center",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "rgba(139, 19, 19, 0.12)",
                      borderColor: BRAND.main,
                      color: BRAND.dark,
                      boxShadow: "0 4px 12px rgba(139, 19, 19, 0.12)",
                      transform: "translateY(-1px)",
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
                <Box
                  ref={favBtnRef}
                  onMouseEnter={handleFavMouseEnter}
                  onMouseLeave={handleFavMouseLeave}
                  sx={{ display: "inline-flex" }}
                >
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
                    <Badge
                      badgeContent={favoriteCount}
                      color="error"
                      sx={{ "& .MuiBadge-badge": { bgcolor: BRAND.main } }}
                    >
                      <FavoriteBorderOutlined fontSize="small" />
                    </Badge>
                  </IconButton>
                </Box>
                <Box
                  ref={cartBtnRef}
                  onMouseEnter={handleCartMouseEnter}
                  onMouseLeave={handleCartMouseLeave}
                  sx={{ display: "inline-flex" }}
                >
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
                    <Badge
                      badgeContent={cartItemsCount}
                      color="error"
                      sx={{ "& .MuiBadge-badge": { bgcolor: BRAND.main } }}
                    >
                      <ShoppingCartOutlined fontSize="small" />
                    </Badge>
                  </IconButton>
                </Box>
              </>
            )}

            {isInstructorMode && (
              <IconButton
                aria-label="Lời mời giảng dạy"
                onClick={() => router.push("/instructor/invites")}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "transparent",
                  color: "text.primary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <MailOutlineRounded fontSize="small" />
              </IconButton>
            )}

            <IconButton
              aria-label="Mở thông báo"
              onClick={onNotificationClick}
              sx={{
                width: 42,
                height: 42,
                bgcolor: "transparent",
                color: "text.primary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <Badge badgeContent={unreadNotificationCount} color="error">
                <NotificationsNoneRounded fontSize="small" />
              </Badge>
            </IconButton>

            {/* User Avatar dropdown */}
            <EduAvatar
              src={userAvatar || user?.anhDaiDien}
              name={hoTen}
              size={38}
              onClick={handleAvatarClick}
              sx={{
                cursor: "pointer",
                transition: "all 200ms ease",
                "&:hover": {
                  boxShadow: `0 0 0 2px rgba(139,19,19,0.45), 0 6px 14px rgba(139,19,19,0.15)`,
                  transform: "scale(1.05)",
                },
              }}
            />

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
                      color: CSSVAR.textPrimary,
                      "&:hover": {
                        bgcolor: "rgba(141,19,19,0.04)",
                        color: BRAND.main,
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
                <EduAvatar
                  src={userAvatar || user?.anhDaiDien}
                  name={hoTen}
                  size={44}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontWeight: 800,
                      fontSize: 14.5,
                      color: CSSVAR.textPrimary,
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

              {isPersonnelMode && (
                <MenuItem
                  onClick={() => router.push("/personnel/approve-courses")}
                >
                  Kiểm duyệt khóa học
                </MenuItem>
              )}

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

              {isInstructorMode && (
                <>
                  <MenuItem
                    onClick={() => router.push("/instructor/dashboard")}
                  >
                    Bảng điều khiển giảng viên
                  </MenuItem>
                  <MenuItem
                    onClick={() => router.push("/instructor/manager-courses")}
                  >
                    Quản lý khóa học
                  </MenuItem>
                  <MenuItem onClick={() => router.push("/instructor/money")}>
                    Doanh thu
                  </MenuItem>
                  <MenuItem onClick={() => router.push("/instructor/bank")}>
                    Tài khoản ngân hàng
                  </MenuItem>
                </>
              )}

              {isAdminMode && (
                <>
                  <MenuItem onClick={() => router.push("/admin/dashboard")}>
                    Bảng điều khiển admin
                  </MenuItem>
                  <MenuItem
                    onClick={() => router.push("/admin/approve-courses")}
                  >
                    Duyệt khóa học
                  </MenuItem>
                  <MenuItem onClick={() => router.push("/admin/users")}>
                    Quản lý người dùng
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

              <MenuItem
                onClick={() => {
                  const isPersonnel = roles.some(
                    (r: string) =>
                      r.toLowerCase() === "personnel" ||
                      r.toLowerCase() === "nhanvien" ||
                      r.toLowerCase() === "kiemduyet",
                  );
                  if (isPersonnel && !roles.includes("Admin")) {
                    router.push("/personnel/settings");
                  } else if (roles.includes("Admin")) {
                    router.push("/admin/settings");
                  } else if (
                    roles.includes("GiaoVien") &&
                    pathname.startsWith("/instructor")
                  ) {
                    router.push("/instructor/settings");
                  } else {
                    router.push("/settings");
                  }
                }}
              >
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

            {/* Wishlist Hover Popover */}
            <WishlistHoverPopover
              open={isFavOpen}
              anchorEl={favAnchorEl}
              onMouseEnter={handleFavMouseEnter}
              onMouseLeave={handleFavMouseLeave}
              favorites={favorites}
            />

            {/* Cart Hover Popover */}
            <CartHoverPopover
              open={isCartOpen}
              anchorEl={cartAnchorEl}
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
              gioHang={gioHang}
            />
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
