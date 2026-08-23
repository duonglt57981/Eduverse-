"use client";

import React from "react";
import { Box, Typography, Stack, Grid, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { BRAND, CSSVAR } from "@/src/theme/tokens";

interface AuthenticatedFooterProps {
  role: "HocVien" | "GiaoVien" | "Admin" | string;
}

export default function AuthenticatedFooter({ role }: AuthenticatedFooterProps) {
  const currentYear = 2026;
  const isAdmin = role === "Admin";

  const COLORS = {
    bg: BRAND.main,
    textMain: CSSVAR.paper,
    textMuted: "rgba(255, 255, 255, 0.72)",
    border: "rgba(255, 255, 255, 0.12)",
    hoverColor: CSSVAR.paper,
  };

  const instructorLinkGroups = [
    {
      title: "Tài nguyên Giảng dạy",
      links: [
        { label: "Trung tâm Giảng viên", href: "/instructor/dashboard" },
        { label: "Quản lý khóa học", href: "/instructor/manager-courses" },
        { label: "Khuyến mãi & Ưu đãi", href: "/instructor/manager-promotions" },
        { label: "Doanh thu & Rút tiền", href: "/instructor/money" },
      ],
    },
    {
      title: "Hỗ trợ & Cộng đồng",
      links: [
        { label: "Cộng đồng Giảng viên", href: "/instructor/dashboard" },
        { label: "Hướng dẫn tạo khóa học", href: "/instructor/manager-courses" },
        { label: "Hỗ trợ kỹ thuật", href: "/instructor/dashboard" },
        { label: "Điều khoản Giảng viên", href: "/instructor/dashboard" },
      ],
    },
    {
      title: "EduVerse Enterprise",
      links: [
        { label: "EduVerse Business", href: "/instructor/dashboard" },
        { label: "Giới thiệu EduVerse", href: "/instructor/dashboard" },
        { label: "Tải ứng dụng mobile", href: "/instructor/dashboard" },
        { label: "Liên hệ hợp tác", href: "/instructor/dashboard" },
      ],
    },
  ];

  const adminLinkGroups = [
    {
      title: "Quản trị Hệ thống",
      links: [
        { label: "Bảng điều khiển", href: "/admin/dashboard" },
        { label: "Duyệt khóa học", href: "/admin/approve-courses" },
        { label: "Quản lý người dùng", href: "/admin/users" },
        { label: "Cài đặt hệ thống", href: "/admin/settings" },
      ],
    },
    {
      title: "Báo cáo & Giám sát",
      links: [
        { label: "Báo cáo doanh thu", href: "/admin/dashboard" },
        { label: "Nhật ký hoạt động", href: "/admin/dashboard" },
        { label: "Yêu cầu rút tiền", href: "/admin/withdrawal-request" },
        { label: "Quản lý danh mục", href: "/admin/categories" },
      ],
    },
    {
      title: "Vận hành EduVerse",
      links: [
        { label: "Trạng thái máy chủ", href: "/admin/dashboard" },
        { label: "Chính sách & Bảo mật", href: "/admin/dashboard" },
        { label: "Hỗ trợ kỹ thuật", href: "/admin/dashboard" },
        { label: "Tài liệu API", href: "/admin/dashboard" },
      ],
    },
  ];

  const linkGroups = isAdmin ? adminLinkGroups : instructorLinkGroups;
  const description = isAdmin
    ? "Hệ thống quản trị và kiểm duyệt khóa học EduVerse. Đảm bảo chất lượng đào tạo và trải nghiệm học tập tối ưu."
    : "Nền tảng giảng dạy trực tuyến EduVerse. Giúp bạn truyền tải kiến thức đến hàng triệu học viên trên toàn quốc.";

  const linkSx = {
    fontSize: 13.5,
    color: COLORS.textMuted,
    textDecoration: "none",
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
        width: "auto",
        mx: { xs: -2, sm: -3, md: -4 },
        mb: { xs: -2, md: -3 },
        bgcolor: COLORS.bg,
        borderTop: `1px solid ${COLORS.border}`,
        py: { xs: 4, md: 5 },
        px: { xs: 5, sm: 6, md: 10 },
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Grid Layout Cho Desktop/Tablet */}
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

            {linkGroups.map((group) => (
              <Grid size={{ xs: 12, sm: 3, md: 3 }} key={group.title}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: COLORS.textMain, mb: 1.5 }}>
                  {group.title}
                </Typography>
                <Stack spacing={1}>
                  {group.links.map((link) => (
                    <Link key={link.label} href={link.href} style={{ textDecoration: "none" }}>
                      <Typography sx={linkSx}>{link.label}</Typography>
                    </Link>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mobile Layout */}
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
                    color: COLORS.textMain,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: COLORS.textMain }} />}
                    sx={{ px: 1, py: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      {group.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1, pt: 0, pb: 1.5 }}>
                    <Stack spacing={0.75}>
                      {group.links.map((link) => (
                        <Link key={link.label} href={link.href} style={{ textDecoration: "none" }}>
                          <Typography sx={linkSx}>{link.label}</Typography>
                        </Link>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 3, borderColor: COLORS.border }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: COLORS.textMuted }}>
            © {currentYear} EduVerse. Tất cả quyền được bảo lưu.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link href="/student/dashboard" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: 12.5, color: COLORS.textMuted, "&:hover": { color: COLORS.hoverColor } }}>
                Quyền riêng tư
              </Typography>
            </Link>
            <Link href="/student/dashboard" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: 12.5, color: COLORS.textMuted, "&:hover": { color: COLORS.hoverColor } }}>
                Điều khoản dịch vụ
              </Typography>
            </Link>
            <Link href="/student/dashboard" style={{ textDecoration: "none" }}>
              <Typography sx={{ fontSize: 12.5, color: COLORS.textMuted, "&:hover": { color: COLORS.hoverColor } }}>
                Cài đặt Cookie
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
