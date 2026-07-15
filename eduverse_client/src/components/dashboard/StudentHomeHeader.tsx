/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Avatar,
} from "@mui/material";
import { logout } from "@/src/store/auth/AuthSlice";
import { useDispatch, useSelector } from "@/src/store/hook";

const RED = "#8B1313";
const RED_DARK = "#6D0F0F";
const RED_TINT = "#FBEFEF";
const BORDER = "#ECE7E4";
const INK = "#1F2937";
const INK2 = "#6B7280";
const HEADER_H = 74;

export default function StudentHomeHeader() {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: any) => state.auth.user);
  const roles = useSelector((state: any) => state.auth.roles) || [];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user_avatar");
        if (stored) setUserAvatar(stored);
      }
    };
    window.addEventListener("avatar_updated", handleAvatarUpdate);
    handleAvatarUpdate();
    return () =>
      window.removeEventListener("avatar_updated", handleAvatarUpdate);
  }, []);

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logout());
    router.replace("/auth/login");
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
        borderBottom: `1px solid rgba(0, 0, 0, 0.06)`,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.015)",
      }}
    >
      <Stack
        direction="row"
        sx={{
          height: "100%",
          width: "100%",
          px: { xs: 2, md: 4 },
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
          onClick={() => router.push("/student/explore")}
          sx={{
            display: { xs: "none", md: "inline-flex" },
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14.5,
            color: "#374151",
            borderRadius: "20px",
            px: 2,
            py: 0.6,
            flexShrink: 0,
            transition: "all 200ms ease",
            "&:hover": { color: RED, bgcolor: "rgba(139,19,19,0.05)" },
          }}
        >
          Khám phá
        </Button>

        {/* Search */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 520,
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            bgcolor: "#F8FAFC",
            border: `1px solid rgba(0, 0, 0, 0.08)`,
            borderRadius: "999px",
            px: 2,
            height: 44,
            transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
            "&:focus-within": {
              bgcolor: "#fff",
              borderColor: RED,
              boxShadow: "0 4px 20px rgba(139,19,19,0.08), 0 0 0 3px rgba(139,19,19,0.08)",
            },
          }}
        >
          <SearchRounded sx={{ fontSize: 20, color: "#94A3B8" }} />
          <InputBase
            placeholder="Tìm kiếm nội dung bất kỳ..."
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
              bgcolor: "rgba(139,19,19,0.06)",
              border: "1px solid rgba(139,19,19,0.12)",
              borderRadius: "20px",
              px: 2.2,
              py: 0.6,
              whiteSpace: "nowrap",
              transition: "all 200ms ease",
              "&:hover": {
                bgcolor: RED_TINT,
                borderColor: RED,
                boxShadow: "0 4px 12px rgba(139,19,19,0.08)",
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
              fontWeight: 600,
              fontSize: 14.5,
              color: "#374151",
              borderRadius: "20px",
              px: 2,
              py: 0.6,
              whiteSpace: "nowrap",
              transition: "all 200ms ease",
              "&:hover": { color: RED, bgcolor: "rgba(139,19,19,0.05)" },
            }}
          >
            Khóa học của tôi
          </Button>

          <IconButton
            onClick={() => router.push("/student/favorites")}
            sx={{
              color: "#4B5563",
              p: 1.1,
              transition: "all 200ms ease",
              "&:hover": { color: RED, bgcolor: "rgba(139,19,19,0.05)", transform: "scale(1.08)" },
            }}
          >
            <FavoriteBorderOutlined sx={{ fontSize: 21 }} />
          </IconButton>
          <IconButton
            onClick={() => router.push("/student/cart")}
            sx={{
              color: "#4B5563",
              p: 1.1,
              transition: "all 200ms ease",
              "&:hover": { color: RED, bgcolor: "rgba(139,19,19,0.05)", transform: "scale(1.08)" },
            }}
          >
            <ShoppingCartOutlined sx={{ fontSize: 21 }} />
          </IconButton>
          <IconButton
            sx={{
              color: "#4B5563",
              p: 1.1,
              transition: "all 200ms ease",
              "&:hover": { color: RED, bgcolor: "rgba(139,19,19,0.05)", transform: "scale(1.08)" },
            }}
          >
            <NotificationsNoneRounded sx={{ fontSize: 21 }} />
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
          </IconButton>
        </Stack>

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
      </Stack>
    </Box>
  );
}
