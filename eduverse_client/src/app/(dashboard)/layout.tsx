"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  InputBase,
  Badge,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import ExploreIcon from "@mui/icons-material/Explore";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QuizIcon from "@mui/icons-material/Quiz";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MailIcon from "@mui/icons-material/Mail";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "../../store/hook";
import { logout } from "../../store/auth/AuthSlice";

const PRIMARY = "#9b1c1c";
const SIDEBAR_WIDTH = 200;

const navItems = [
  {
    label: "Trang chủ",
    icon: <HomeIcon fontSize="small" />,
    href: "/trang-chu",
  },
  {
    label: "Khóa học của tôi",
    icon: <SchoolIcon fontSize="small" />,
    href: "/khoa-hoc-cua-toi",
  },
  {
    label: "Khám phá",
    icon: <ExploreIcon fontSize="small" />,
    href: "/kham-pha",
  },
  {
    label: "Lịch học",
    icon: <CalendarMonthIcon fontSize="small" />,
    href: "/lich-hoc",
  },
  { label: "Kiểm tra", icon: <QuizIcon fontSize="small" />, href: "/kiem-tra" },
  {
    label: "Chứng chỉ",
    icon: <WorkspacePremiumIcon fontSize="small" />,
    href: "/chung-chi",
  },
  {
    label: "Yêu thích",
    icon: <FavoriteIcon fontSize="small" />,
    href: "/yeu-thich",
  },
  {
    label: "Thông báo",
    icon: <NotificationsIcon fontSize="small" />,
    href: "/thong-bao",
  },
];

const bottomItems = [
  { label: "Hồ sơ", icon: <PersonIcon fontSize="small" />, href: "/ho-so" },
  {
    label: "Cài đặt",
    icon: <SettingsIcon fontSize="small" />,
    href: "/cai-dat",
  },
];

type SidebarContentProps = {
  pathname: string;
  cartCount: number;
  user?: {
    hoTen?: string | null;
    email?: string | null;
    roles?: string[] | null;
  } | null;
  onNavigate: (href: string) => void;
  onLogout: () => void;
};

function SidebarContent({
  pathname,
  cartCount,
  user,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", py: 2 }}
    >
      <Box
        sx={{ px: 2.5, mb: 3, display: "flex", alignItems: "center", gap: 1 }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: PRIMARY,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SchoolIcon sx={{ color: "#fff", fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: PRIMARY }}>
          EduVerse
        </Typography>
      </Box>

      <List dense sx={{ px: 1, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onNavigate(item.href)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  bgcolor: isActive ? "#fff0f0" : "transparent",
                  color: isActive ? PRIMARY : "#444",
                  "&:hover": { bgcolor: isActive ? "#fff0f0" : "#f5f5f5" },
                  borderLeft: isActive
                    ? `3px solid ${PRIMARY}`
                    : "3px solid transparent",
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 32, color: isActive ? PRIMARY : "#888" }}
                >
                  {item.label === "Giỏ hàng" && cartCount > 0 ? (
                    <Badge
                      badgeContent={cartCount}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: 10,
                          minWidth: 16,
                          height: 16,
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      sx={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mx: 2, mb: 1 }} />

      <List dense sx={{ px: 1 }}>
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onNavigate(item.href)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  bgcolor: isActive ? "#fff0f0" : "transparent",
                  color: isActive ? PRIMARY : "#444",
                  "&:hover": { bgcolor: "#f5f5f5" },
                  borderLeft: isActive
                    ? `3px solid ${PRIMARY}`
                    : "3px solid transparent",
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 32, color: isActive ? PRIMARY : "#888" }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      sx={{ fontSize: 13, fontWeight: isActive ? 700 : 500 }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              borderRadius: 2,
              py: 1,
              color: PRIMARY,
              "&:hover": { bgcolor: "#fff0f0" },
              borderLeft: "3px solid transparent",
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: PRIMARY }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  Đăng xuất
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { gioHang } = useSelector((s) => s.gioHang);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      router.push(
        `/kham-pha?keyword=${encodeURIComponent(searchValue.trim())}`,
      );
    }
  };
  const openMenu = Boolean(anchorEl);

  const cartCount = gioHang?.items?.length ?? 0;
  const isGiangVien = user?.roles?.includes("GiangVien");

  const handleAvatarClick = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleCloseMenu();
    await dispatch(logout());
    router.push("/auth/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f9f8f6" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#fff",
            border: "none",
            borderRight: "1px solid #f0ece8",
          },
        }}
      >
        <SidebarContent
          pathname={pathname}
          cartCount={cartCount}
          user={user}
          onNavigate={(href) => router.push(href)}
          onLogout={handleLogout}
        />
      </Drawer>

      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <Box
          sx={{
            height: 56,
            bgcolor: "#fff",
            borderBottom: "1px solid #f0ece8",
            display: "flex",
            alignItems: "center",
            px: 3,
            gap: 2,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <Box
            sx={{
              flex: 1,
              maxWidth: 400,
              bgcolor: "#f5f3f0",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
            }}
          >
            <SearchIcon sx={{ color: "#aaa", fontSize: 18, mr: 1 }} />
            <InputBase
              placeholder="Tìm kiếm khóa học, tài liệu..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              sx={{ fontSize: 13, flex: 1, "& input": { p: 0 } }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />
          <Tooltip title="Giỏ hàng">
            <IconButton size="small" onClick={() => router.push("/gio-hang")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCartIcon sx={{ fontSize: 20, color: "#555" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Thông báo">
            <IconButton size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ fontSize: 20, color: "#555" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Tin nhắn">
            <IconButton size="small">
              <MailIcon sx={{ fontSize: 20, color: "#555" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chế độ tối">
            <IconButton size="small">
              <DarkModeIcon sx={{ fontSize: 20, color: "#555" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Tài khoản">
            <Avatar
              onClick={handleAvatarClick}
              sx={{
                width: 32,
                height: 32,
                bgcolor: PRIMARY,
                fontSize: 13,
                cursor: "pointer",
                "&:hover": { opacity: 0.85 },
              }}
            >
              {user?.hoTen?.[0] ?? "U"}
            </Avatar>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 200,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f0ece8" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                {user?.hoTen}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {user?.email}
              </Typography>

              {isGiangVien && (
                <Box
                  sx={{
                    mt: 0.5,
                    display: "inline-block",
                    bgcolor: "#fff0f0",
                    color: PRIMARY,
                    fontSize: 11,
                    fontWeight: 600,
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                  }}
                >
                  Giảng viên
                </Box>
              )}
            </Box>

            {isGiangVien && (
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  router.push("/giang-vien/dashboard");
                }}
                sx={{ py: 1.2, "&:hover": { bgcolor: "#fff0f0" } }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: PRIMARY }}>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: PRIMARY }}
                >
                  Dashboard Giảng viên
                </Typography>
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                router.push("/ho-so");
              }}
              sx={{ py: 1.2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonIcon fontSize="small" sx={{ color: "#666" }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: 13 }}>Hồ sơ</Typography>
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                router.push("/cai-dat");
              }}
              sx={{ py: 1.2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <SettingsIcon fontSize="small" sx={{ color: "#666" }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: 13 }}>Cài đặt</Typography>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{ py: 1.2, "&:hover": { bgcolor: "#fff0f0" } }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LogoutIcon fontSize="small" sx={{ color: PRIMARY }} />
              </ListItemIcon>
              <Typography
                sx={{ fontSize: 13, color: PRIMARY, fontWeight: 600 }}
              >
                Đăng xuất
              </Typography>
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
