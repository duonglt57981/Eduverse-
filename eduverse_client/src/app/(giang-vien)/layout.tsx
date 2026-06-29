"use client";

import { useState } from "react";
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
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "../../store/hook";

const PRIMARY = "#9b1c1c";
const SIDEBAR_WIDTH = 200;

const navItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    href: "/giang-vien/dashboard",
  },
  {
    label: "Bài kiểm tra",
    icon: <QuizIcon fontSize="small" />,
    href: "/giang-vien/bai-kiem-tra",
  },
  {
    label: "Khóa học",
    icon: <SchoolIcon fontSize="small" />,
    href: "/giang-vien/khoa-hoc",
  },
  {
    label: "Học viên",
    icon: <PeopleIcon fontSize="small" />,
    href: "/giang-vien/hoc-vien",
  },
  {
    label: "Doanh thu",
    icon: <BarChartIcon fontSize="small" />,
    href: "/giang-vien/doanh-thu",
  },
  {
    label: "Q&A",
    icon: <QuestionAnswerIcon fontSize="small" />,
    href: "/giang-vien/qa",
  },
  {
    label: "Cài đặt",
    icon: <SettingsIcon fontSize="small" />,
    href: "/giang-vien/cai-dat",
  },
  {
    label: "Ngân hàng",
    icon: <AccountBalanceIcon fontSize="small" />,
    href: "/ngan-hang",
  },
];

export default function GiangVienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSelector((s) => s.auth);

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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            py: 2,
          }}
        >
          <Box
            sx={{
              px: 2.5,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
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

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: PRIMARY,
                  lineHeight: 1,
                }}
              >
                EduVerse
              </Typography>
              <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                Giảng viên
              </Typography>
            </Box>
          </Box>

          <List dense sx={{ px: 1, flex: 1 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => router.push(item.href)}
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
                      {item.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isActive ? 700 : 500,
                          }}
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

          <Box sx={{ px: 1 }}>
            <ListItemButton
              onClick={() => router.push("/trang-chu")}
              sx={{
                borderRadius: 2,
                py: 1,
                color: "#666",
                "&:hover": { bgcolor: "#f5f5f5" },
                borderLeft: "3px solid transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "#888" }}>
                <ArrowBackIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography sx={{ fontSize: 13 }}>
                    Về trang học viên
                  </Typography>
                }
              />
            </ListItemButton>
          </Box>

          <Box sx={{ px: 2, pt: 1, mt: 1, borderTop: "1px solid #f0ece8" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{ width: 28, height: 28, bgcolor: PRIMARY, fontSize: 12 }}
              >
                {user?.hoTen?.[0] ?? "G"}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                  {user?.hoTen}
                </Typography>
                <Typography
                  sx={{ fontSize: 10, color: "text.secondary" }}
                  noWrap
                >
                  Giảng viên
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
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
              placeholder="Tìm kiếm đề thi, học viên, khóa học..."
              sx={{ fontSize: 13, flex: 1, "& input": { p: 0 } }}
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Thông báo">
            <IconButton size="small">
              <Badge badgeContent={2} color="error">
                <NotificationsIcon sx={{ fontSize: 20, color: "#555" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{ width: 30, height: 30, bgcolor: PRIMARY, fontSize: 12 }}
            >
              {user?.hoTen?.[0] ?? "G"}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1 }}>
                {user?.hoTen}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                Giảng viên cao cấp
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
