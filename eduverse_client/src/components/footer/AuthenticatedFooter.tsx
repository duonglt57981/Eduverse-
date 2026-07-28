"use client";

import React from "react";
import { Box, Typography, Stack, Grid, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";

interface AuthenticatedFooterProps {
  role: "HocVien" | "GiaoVien" | "Admin" | string;
}

export default function AuthenticatedFooter({ role }: AuthenticatedFooterProps) {
  const currentYear = new Date().getFullYear();
  const isInstructor = role === "GiaoVien" || role === "Admin";

  const COLORS = isInstructor
    ? {
        bg: "#8B1313", // Đỏ đô thương hiệu cho giảng viên / admin
        textMain: "#FFFFFF",
        textMuted: "rgba(255, 255, 255, 0.72)",
        border: "rgba(255, 255, 255, 0.12)",
        hoverColor: "#FFFFFF",
      }
    : {
        bg: "#1E293B", // Slate-800 xám xanh đen sang trọng cho học viên
        textMain: "#FFFFFF",
        textMuted: "#94A3B8", // Slate-400
        border: "rgba(148, 163, 184, 0.12)",
        hoverColor: "#38BDF8", // Sky blue hover
      };

  // Định nghĩa links cho Học viên
  const studentLinks = [
    {
      title: "Học tập",
      links: [
        { label: "Khám phá khóa học", href: "/student/explore" },
        { label: "Khóa học của tôi", href: "/student/courses/my-courses" },
        { label: "Danh sách yêu thích", href: "/student/favorites" },
        { label: "Giỏ hàng", href: "/student/cart" },
      ]
    },
    {
      title: "Tài khoản",
      links: [
        { label: "Hồ sơ cá nhân", href: "/settings" },
        { label: "Thông báo", href: "/student/dashboard" },
        { label: "Cài đặt tài khoản", href: "/settings" },
      ]
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Trung tâm trợ giúp", href: "/contact" },
        { label: "Liên hệ hỗ trợ", href: "/contact" },
        { label: "Điều khoản sử dụng", href: "/auth/terms" },
        { label: "Chính sách bảo mật", href: "/auth/privacy" },
      ]
    }
  ];

  // Định nghĩa links cho Giảng viên
  const instructorLinks = [
    {
      title: "Giảng dạy",
      links: [
        { label: "Quản lý khóa học", href: "/instructor/manager-courses" },
        { label: "Tạo khóa học mới", href: "/instructor/manager-courses" },
        { label: "Doanh thu", href: "/instructor/money" },
        { label: "Tài khoản ngân hàng", href: "/instructor/bank" },
      ]
    },
    {
      title: "Tài chính",
      links: [
        { label: "Doanh thu & Rút tiền", href: "/instructor/money" },
        { label: "Cài đặt ngân hàng", href: "/instructor/bank" },
        { label: "Khuyến mãi", href: "/instructor/manager-promotions" },
      ]
    },
    {
      title: "Hỗ trợ giảng viên",
      links: [
        { label: "Cài đặt tài khoản", href: "/settings" },
        { label: "Trung tâm hỗ trợ", href: "/contact" },
        { label: "Điều khoản giảng viên", href: "/auth/instructor-terms" },
        { label: "Chính sách bảo mật", href: "/auth/privacy" },
      ]
    }
  ];

  // Định nghĩa links cho Quản trị viên
  const adminLinks = [
    {
      title: "Quản trị hệ thống",
      links: [
        { label: "Bảng điều khiển", href: "/admin/dashboard" },
        { label: "Quản lý khóa học", href: "/admin/courses" },
        { label: "Duyệt khóa học", href: "/admin/approve-courses" },
        { label: "Duyệt rút tiền", href: "/admin/withdrawals" },
      ]
    },
    {
      title: "Người dùng & Báo cáo",
      links: [
        { label: "Quản lý học viên", href: "/admin/students" },
        { label: "Quản lý giảng viên", href: "/admin/instructors" },
        { label: "Thống kê doanh thu", href: "/admin/revenue" },
      ]
    },
    {
      title: "Hỗ trợ kỹ thuật",
      links: [
        { label: "Hồ sơ cá nhân", href: "/settings" },
        { label: "Cài đặt hệ thống", href: "/admin/settings" },
        { label: "Trung tâm trợ giúp", href: "/contact" },
      ]
    }
  ];

  const isAdmin = role === "Admin";
  const isGiaoVien = role === "GiaoVien";

  const linkGroups = isAdmin
    ? adminLinks
    : isGiaoVien
    ? instructorLinks
    : studentLinks;

  const description = isAdmin
    ? "Hệ thống quản trị và kiểm duyệt nội dung dành cho Quản trị viên EduVerse."
    : isGiaoVien
    ? "Công cụ hỗ trợ bạn xây dựng khóa học và phát triển hoạt động giảng dạy."
    : "Học tập, phát triển kỹ năng và chinh phục mục tiêu của bạn.";

  const linkSx = {
    fontSize: 13.5,
    color: COLORS.textMuted,
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 150ms ease",
    "&:hover": {
      color: COLORS.hoverColor,
    },
    display: "block",
    py: 0.5,
  };

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: COLORS.bg,
        borderTop: `1px solid ${COLORS.border}`,
        py: { xs: 4, md: 5 },
        px: { xs: 3, md: 6 },
      }}
    >
      {/* Wrapper dàn đều nội dung */}
      <Box sx={{ width: "100%" }}>
        
        {/* Grid Layout cho Desktop và Tablet */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Grid container spacing={4} sx={{ justifyContent: "space-between" }}>
            <Grid size={{ xs: 12, sm: 3, md: 3 }}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 22, fontWeight: 900, color: COLORS.textMain, letterSpacing: "-0.5px" }}>
                  EduVerse
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: COLORS.textMuted, lineHeight: 1.6, maxWidth: 280 }}>
                  {description}
                </Typography>
              </Stack>
            </Grid>

            {/* Link Groups */}
            {linkGroups.map((group) => (
              <Grid size={{ xs: 12, sm: 3, md: 3 }} key={group.title}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: COLORS.textMain, mb: 1.5 }}>
                  {group.title}
                </Typography>
                <Stack spacing={1}>
                  {group.links.map((link) => (
                    <Typography
                      key={link.label}
                      component={Link}
                      href={link.href}
                      sx={linkSx}
                    >
                      {link.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Accordion Layout cho Mobile */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ px: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: COLORS.textMain, mb: 1 }}>
                EduVerse
              </Typography>
              <Typography sx={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>
                {description}
              </Typography>
            </Box>
            <Box>
              {linkGroups.map((group) => (
                <Accordion
                  key={group.title}
                  elevation={0}
                  sx={{
                    borderBottom: `1px solid ${COLORS.border}`,
                    "&:before": { display: "none" },
                    bgcolor: "transparent",
                    color: COLORS.textMain
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: COLORS.textMain }} />}
                    sx={{ px: 1, py: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: COLORS.textMain }}>
                      {group.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1, pt: 0, pb: 1.5 }}>
                    <Stack spacing={1.5}>
                      {group.links.map((link) => (
                        <Typography
                          key={link.label}
                          component={Link}
                          href={link.href}
                          sx={{ ...linkSx, py: 1, minHeight: 44, display: "flex", alignItems: "center" }}
                        >
                          {link.label}
                        </Typography>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3.5, borderColor: COLORS.border }} />

        {/* Copyright area */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "center" },
            gap: 1.5,
            px: { xs: 1, sm: 0 }
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: COLORS.textMuted, fontWeight: 500, textAlign: { xs: "center", sm: "left" } }}>
            © {currentYear} EduVerse. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3} sx={{ justifyContent: "center" }}>
            <Typography
              component={Link}
              href="/auth/privacy"
              sx={{ fontSize: 12.5, color: COLORS.textMuted, textDecoration: "none", fontWeight: 500, "&:hover": { color: COLORS.hoverColor } }}
            >
              Chính sách bảo mật
            </Typography>
            <Typography
              component={Link}
              href="/auth/terms"
              sx={{ fontSize: 12.5, color: COLORS.textMuted, textDecoration: "none", fontWeight: 500, "&:hover": { color: COLORS.hoverColor } }}
            >
              Điều khoản sử dụng
            </Typography>
          </Stack>
        </Box>

      </Box>
    </Box>
  );
}
