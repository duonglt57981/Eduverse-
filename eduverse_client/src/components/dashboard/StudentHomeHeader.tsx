/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  SearchRounded,
  FavoriteBorderOutlined,
  ShoppingCartOutlined,
  NotificationsNoneRounded,
  SettingsRounded,
  LogoutRounded,
  SchoolRounded,
  MenuBookRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  InputBase,
  Stack,
  Typography,
  Button,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Avatar,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Swal from "sweetalert2";
import { logout } from "@/src/store/auth/AuthSlice";
import { useDispatch, useSelector } from "@/src/store/hook";
import { clearGioHang } from "@/src/store/gioHang/GioHangSlice";
import { useSignalR } from "@/src/hook/useSignalR";
import { thongBaoService } from "@/src/services/ThongBaoService";
import { ThongBao } from "@/src/types/thongbao";

const RED = "#991B1B"; // Đỏ đô
const RED_TINT = "#FEF2F2"; // Primary soft
const BORDER = "#E5E7EB"; // Border light
const INK = "#111827"; // Text title
const INK2 = "#374151"; // Text body
const HEADER_H = 74;

export default function StudentHomeHeader() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const user = useSelector((state: any) => state.auth.user);
  const roles = useSelector((state: any) => state.auth.roles) || [];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiAnchorEl, setNotiAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [selectedNoti, setSelectedNoti] = useState<ThongBao | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const [notificationsResponse, unreadResponse] = await Promise.all([
          thongBaoService.getMyNotifications(),
          thongBaoService.getUnreadCount(),
        ]);

        if (notificationsResponse.status && notificationsResponse.data) {
          setNotifications(notificationsResponse.data);
        }
        if (
          unreadResponse.status &&
          typeof unreadResponse.data === "number"
        ) {
          setUnreadCount(unreadResponse.data);
        }
      } catch (error) {
        console.error("Không thể tải thông báo:", error);
      }
    };

    void loadNotifications();
  }, [user]);

  useSignalR("ReceiveNotification", (notification: ThongBao) => {
    setNotifications((current) => {
      if (current.some((item) => item.id === notification.id)) return current;
      return [notification, ...current].slice(0, 50);
    });
    setUnreadCount((current) => current + 1);
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (typeof window !== "undefined" && user?.email) {
        const stored = localStorage.getItem(`user_avatar_${user.email}`);
        if (stored) setUserAvatar(stored);
      }
    };
    window.addEventListener("avatar_updated", handleAvatarUpdate);
    handleAvatarUpdate();
    return () =>
      window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, [user?.email]);

  const handleLogout = async () => {
    setAnchorEl(null);
    const result = await Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: RED,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await dispatch(logout());
      dispatch(clearGioHang());
      router.replace("/auth/login");
    }
  };

  const handleNotificationClick = async (notification: ThongBao) => {
    setNotiAnchorEl(null);

    if (!notification.daDoc && !notification.isRead) {
      try {
        const response = await thongBaoService.markAsRead(notification.id);
        if (response.status) {
          setNotifications((current) =>
            current.map((item) =>
              item.id === notification.id
                ? { ...item, daDoc: true, isRead: true }
                : item,
            ),
          );
          setUnreadCount((current) => Math.max(0, current - 1));
        }
      } catch (error) {
        console.error("Không thể đánh dấu thông báo đã đọc:", error);
      }
    }

    if (notification.link) {
      router.push(notification.link);
    } else {
      setSelectedNoti(notification);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await thongBaoService.markAllAsRead();
      if (response.status) {
        setNotifications((current) =>
          current.map((item) => ({ ...item, daDoc: true, isRead: true })),
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Không thể đánh dấu tất cả thông báo đã đọc:", error);
    }
  };

  const hoTen = user?.hoTen || "Học viên EduVerse";
  const email = user?.email || "";
  const userInitials =
    hoTen
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "HV";

  const isInstructor = roles.includes("GiaoVien");
  const go = (path: string) => {
    setAnchorEl(null);
    router.push(path);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchQuery.trim();
    const queryString = keyword
      ? `?keyword=${encodeURIComponent(keyword)}`
      : "";
    router.push(`/student/explore${queryString}`);
  };

  const isExploreActive = pathname === "/student/explore";
  const isMyCoursesActive = pathname === "/student/courses/my-courses";

  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_H,
        zIndex: 1200,
        bgcolor: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: `1px solid rgba(0, 0, 0, 0.08)`,
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
          {/* Logo */}
          <Box
            onClick={() => router.push("/student/dashboard")}
            sx={{
              width: { xs: 120, sm: 140, lg: 150 },
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "opacity 150ms ease",
              "&:hover": { opacity: 0.85 },
            }}
          >
            <Image
              src="/auth/img/logo_nentrang.png"
              alt="EduVerse"
              width={150}
              height={46}
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </Box>

          {/* Khám phá */}
          <Button
            onClick={() => {
              window.dispatchEvent(new Event("eduverse:reset-explore"));
              router.push("/student/explore");
            }}
            sx={{
              display: { xs: "none", md: "inline-flex" },
              textTransform: "none",
              fontWeight: isExploreActive ? 700 : 600,
              fontSize: 14.5,
              color: isExploreActive ? RED : "#374151",
              bgcolor: isExploreActive ? "rgba(153, 27, 27, 0.05)" : "transparent",
              borderRadius: "20px",
              px: 2,
              py: 0.6,
              flexShrink: 0,
              transition: "all 200ms ease",
              "&:hover": { color: RED, bgcolor: "rgba(153, 27, 27, 0.08)" },
            }}
          >
            Khám phá
          </Button>

          {/* Search */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{
              flex: 1,
              maxWidth: 520,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              bgcolor: "#F3F4F6",
              border: `1px solid rgba(0, 0, 0, 0.05)`,
              borderRadius: "999px",
              px: 2,
              height: 44,
              transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
              "&:focus-within": {
                bgcolor: "#fff",
                borderColor: RED,
                boxShadow: "0 0 0 3px rgba(153, 27, 27, 0.1)",
              },
            }}
          >
            <IconButton
              type="submit"
              aria-label="Tìm kiếm khóa học"
              size="small"
              sx={{ p: 0.25, color: "#9CA3AF" }}
            >
              <SearchRounded sx={{ fontSize: 20 }} />
            </IconButton>
            <InputBase
              placeholder="Tìm kiếm nội dung bất kỳ..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              inputProps={{ "aria-label": "Từ khóa tìm kiếm" }}
              sx={{ flex: 1, fontSize: 14, color: INK }}
            />
          </Box>

          {/* Spacer to push right actions to the far right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right actions */}
          <Stack
            direction="row"
            sx={{ alignItems: "center", gap: 0.75, flexShrink: 0 }}
          >
            <Button
              onClick={() =>
                router.push(
                  isInstructor
                    ? "/instructor/dashboard"
                    : "/student/become-instructor",
                )
              }
              sx={{
                display: { xs: "none", lg: "inline-flex" },
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13.5,
                color: RED,
                bgcolor: "transparent",
                border: `1.5px solid ${RED}`,
                borderRadius: "20px",
                px: 2.2,
                py: 0.5,
                whiteSpace: "nowrap",
                transition: "all 200ms ease",
                "&:hover": {
                  bgcolor: RED_TINT,
                  borderColor: RED,
                  boxShadow: "0 4px 12px rgba(153, 27, 27, 0.08)",
                },
              }}
            >
              {isInstructor ? "Trang giảng viên" : "Trở thành Giảng viên"}
            </Button>
            <Button
              onClick={() => router.push("/student/courses/my-courses")}
              sx={{
                display: { xs: "none", lg: "inline-flex" },
                textTransform: "none",
                fontWeight: isMyCoursesActive ? 700 : 600,
                fontSize: 14.5,
                color: isMyCoursesActive ? RED : "#374151",
                bgcolor: isMyCoursesActive ? "rgba(153, 27, 27, 0.05)" : "transparent",
                borderRadius: "20px",
                px: 2,
                py: 0.6,
                whiteSpace: "nowrap",
                transition: "all 200ms ease",
                "&:hover": { color: RED, bgcolor: "rgba(153, 27, 27, 0.08)" },
              }}
            >
              Khóa học của tôi
            </Button>

            <IconButton
              onClick={() => router.push("/student/favorites")}
              sx={{
                color: pathname === "/student/favorites" ? RED : "#4B5563",
                p: 1.1,
                borderRadius: "50%",
                transition: "all 200ms ease",
                "&:hover": { color: RED, bgcolor: "rgba(153, 27, 27, 0.05)", transform: "scale(1.05)" },
              }}
            >
              <FavoriteBorderOutlined sx={{ fontSize: 21 }} />
            </IconButton>
            <IconButton
              onClick={() => router.push("/student/cart")}
              sx={{
                color: pathname === "/student/cart" ? RED : "#4B5563",
                p: 1.1,
                borderRadius: "50%",
                transition: "all 200ms ease",
                "&:hover": { color: RED, bgcolor: "rgba(153, 27, 27, 0.05)", transform: "scale(1.05)" },
              }}
            >
              <ShoppingCartOutlined sx={{ fontSize: 21 }} />
            </IconButton>
            <IconButton
              aria-label="Mở thông báo"
              onClick={(event) => setNotiAnchorEl(event.currentTarget)}
              sx={{
                color: "#4B5563",
                p: 1.1,
                borderRadius: "50%",
                transition: "all 200ms ease",
                "&:hover": { color: RED, bgcolor: "rgba(153, 27, 27, 0.05)", transform: "scale(1.05)" },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" sx={{ "& .MuiBadge-badge": { bgcolor: RED } }}>
                <NotificationsNoneRounded sx={{ fontSize: 21 }} />
              </Badge>
            </IconButton>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5, p: 0.25 }}>
              <Avatar
                src={userAvatar || user?.anhDaiDien || undefined}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: RED,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "2px solid #fff",
                  boxShadow: `0 0 0 2px rgba(153, 27, 27, 0.15), 0 4px 8px rgba(0,0,0,0.06)`,
                  transition: "all 200ms ease",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: `0 0 0 2px rgba(153, 27, 27, 0.4), 0 6px 14px rgba(153, 27, 27, 0.15)`,
                    transform: "scale(1.05)",
                  },
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Stack>
        </Stack>
      </Box>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                mt: 1,
                minWidth: 236,
                borderRadius: "14px",
                border: `1px solid ${BORDER}`,
                boxShadow: "0 12px 32px rgba(24,24,27,0.12)",
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: INK }}>
              {hoTen}
            </Typography>
            {email && (
              <Typography sx={{ fontSize: 12.5, color: INK2 }}>{email}</Typography>
            )}
          </Box>
          <Divider />
          <MenuItem onClick={() => go("/student/dashboard")} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <SchoolRounded sx={{ fontSize: 20, color: INK2 }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Học tập</Typography>
          </MenuItem>
          <MenuItem onClick={() => go("/student/courses/my-courses")} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <MenuBookRounded sx={{ fontSize: 20, color: INK2 }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              Khóa học của tôi
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => go("/student/cart")} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <ShoppingCartOutlined sx={{ fontSize: 20, color: INK2 }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Giỏ hàng</Typography>
          </MenuItem>
          <MenuItem onClick={() => go("/student/favorites")} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <FavoriteBorderOutlined sx={{ fontSize: 20, color: INK2 }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              Danh sách mong ước
            </Typography>
          </MenuItem>
          {isInstructor && (
            <MenuItem onClick={() => go("/instructor/dashboard")} sx={{ py: 1.1 }}>
              <ListItemIcon>
                <WorkspacePremiumRounded sx={{ fontSize: 20, color: INK2 }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                Trang giảng viên
              </Typography>
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => go("/settings")} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <SettingsRounded sx={{ fontSize: 20, color: INK2 }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Cài đặt</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <LogoutRounded sx={{ fontSize: 20, color: RED }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: RED }}>
              Đăng xuất
            </Typography>
          </MenuItem>
        </Menu>

        <Popover
          anchorEl={notiAnchorEl}
          open={Boolean(notiAnchorEl)}
          onClose={() => setNotiAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                width: { xs: "calc(100vw - 24px)", sm: 360 },
                maxHeight: 480,
                borderRadius: "16px",
                border: `1px solid ${BORDER}`,
                boxShadow: "0 12px 32px rgba(24,24,27,0.12)",
              },
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: INK }}>
              Thông báo
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{
                  color: RED,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>

          <Box sx={{ maxHeight: 390, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <Box sx={{ px: 2, py: 5, textAlign: "center" }}>
                <NotificationsNoneRounded
                  sx={{ fontSize: 36, color: "#CBD5E1", mb: 1 }}
                />
                <Typography sx={{ color: INK2, fontSize: 14 }}>
                  Chưa có thông báo
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => {
                const isRead = notification.daDoc || notification.isRead;
                return (
                  <Box
                    key={notification.id}
                    onClick={() => void handleNotificationClick(notification)}
                    sx={{
                      position: "relative",
                      p: 2,
                      pl: 2.5,
                      cursor: "pointer",
                      bgcolor: isRead ? "#fff" : "rgba(139,19,19,0.04)",
                      borderBottom: `1px solid ${BORDER}`,
                      "&:hover": { bgcolor: "#F8FAFC" },
                    }}
                  >
                    {!isRead && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: 24,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: RED,
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        fontWeight: isRead ? 600 : 800,
                        color: INK,
                      }}
                    >
                      {notification.tieuDe ||
                        notification.type ||
                        "Thông báo"}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 12.5,
                        color: INK2,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      {notification.noiDung || notification.message}
                    </Typography>
                    {notification.thoiGianTao && (
                      <Typography sx={{ mt: 0.75, fontSize: 11, color: "#94A3B8" }}>
                        {new Date(notification.thoiGianTao).toLocaleString(
                          "vi-VN",
                        )}
                      </Typography>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Popover>

        <Dialog
          open={Boolean(selectedNoti)}
          onClose={() => setSelectedNoti(null)}
          slotProps={{
            paper: { sx: { width: "100%", maxWidth: 480, borderRadius: "16px" } },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: INK }}>
            {selectedNoti?.tieuDe || selectedNoti?.type || "Chi tiết thông báo"}
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#374151", whiteSpace: "pre-wrap" }}>
              {selectedNoti?.noiDung || selectedNoti?.message}
            </Typography>
            {selectedNoti?.thoiGianTao && (
              <Typography sx={{ mt: 2, fontSize: 12, color: INK2 }}>
                {new Date(selectedNoti.thoiGianTao).toLocaleString("vi-VN")}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSelectedNoti(null)}
              sx={{ color: RED, fontWeight: 700 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
