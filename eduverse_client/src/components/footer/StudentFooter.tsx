"use client";

import React from "react";
import { Box, Typography, Stack, Grid, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneEnabledRoundedIcon from "@mui/icons-material/PhoneEnabledRounded";
import { CSSVAR } from "@/src/theme/tokens";

export default function StudentFooter() {
  const currentYear = new Date().getFullYear();

  const studentLinks = [
    {
      title: "Học tập",
      links: [
        { label: "Khám phá khóa học", href: "/student/explore" },
        { label: "Khóa học của tôi", href: "/student/courses/my-courses" },
        { label: "Tiếp tục học", href: "/student/dashboard" },
        { label: "Danh sách yêu thích", href: "/student/favorites" },
        { label: "Giỏ hàng", href: "/student/cart" },
      ]
    },
    {
      title: "Hỗ trợ học viên",
      links: [
        { label: "Trung tâm trợ giúp", href: "/contact" },
        { label: "Câu hỏi thường gặp", href: "/contact" },
        { label: "Hướng dẫn học tập", href: "/about-us" },
        { label: "Liên hệ hỗ trợ", href: "/contact" },
        { label: "Báo cáo sự cố", href: "/contact" },
      ]
    },
    {
      title: "Chính sách",
      links: [
        { label: "Điều khoản sử dụng", href: "/auth/terms" },
        { label: "Chính sách bảo mật", href: "/auth/privacy" },
        { label: "Chính sách hoàn tiền", href: "/auth/terms" },
        { label: "Quyền riêng tư", href: "/auth/privacy" },
        { label: "Quy định cộng đồng", href: "/auth/terms" },
      ]
    }
  ];

  const linkSx = {
    fontSize: 13.5,
    color: "text.secondary",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 150ms ease, transform 150ms ease",
    "&:hover": {
      color: "primary.main",
      transform: "translateX(3px)",
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
        bgcolor: (theme) => theme.palette.mode === "dark" ? "background.paper" : CSSVAR.paperAlt,
        borderTop: "1px solid",
        borderColor: "divider",
        py: { xs: 4, md: 5 },
        px: { xs: 5, sm: 6, md: 10 },
        mt: "auto",
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Grid Layout cho Desktop và Tablet */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Grid container spacing={4} sx={{ justifyContent: "space-between" }}>
            {/* Cột 1: Thông tin EduVerse */}
            <Grid size={{ xs: 12, sm: 3, md: 4.5 }}>
              <Stack spacing={2}>
                <Box
                  component="img"
                  src="/auth/img/logo_nentrang.png"
                  alt="EduVerse Logo"
                  sx={{ height: 34, width: "auto", alignSelf: "flex-start" }}
                />
                <Typography sx={{ fontSize: 13.5, color: "text.secondary", lineHeight: 1.6, pr: { md: 4 } }}>
                  EduVerse là nền tảng học trực tuyến giúp bạn phát triển kiến thức, kỹ năng và xây dựng lộ trình học tập phù hợp.
                </Typography>
                
                {/* Thông tin liên hệ */}
                <Stack spacing={1} sx={{ pt: 1 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <EmailRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
                      support@eduverse.edu.vn
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <PhoneEnabledRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography sx={{ fontSize: 13.5, color: "text.secondary", fontWeight: 600 }}>
                      1900 8888 66
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            {/* Cột 2, 3, 4: Link Groups */}
            {studentLinks.map((group) => (
              <Grid size={{ xs: 12, sm: 3, md: 2.2 }} key={group.title}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", mb: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
            {/* Nhãn hiệu EduVerse di động */}
            <Box sx={{ px: 1, mb: 1 }}>
              <Box
                component="img"
                src="/auth/img/logo_nentrang.png"
                alt="EduVerse Logo"
                sx={{ height: 30, width: "auto", mb: 1.5 }}
              />
              <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                EduVerse là nền tảng học trực tuyến giúp bạn phát triển kiến thức, kỹ năng và xây dựng lộ trình học tập phù hợp.
              </Typography>
              <Stack spacing={1} sx={{ pt: 1.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <EmailRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    support@eduverse.edu.vn
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <PhoneEnabledRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
                    1900 8888 66
                  </Typography>
                </Stack>
              </Stack>
            </Box>
            
            {/* Accordions */}
            <Box>
              {studentLinks.map((group) => (
                <Accordion
                  key={group.title}
                  elevation={0}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:before": { display: "none" },
                    bgcolor: "transparent",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
                    sx={{ px: 1, py: 0.5 }}
                  >
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
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

        <Divider sx={{ my: 3, borderColor: "divider" }} />

        {/* Khu vực cuối Footer */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 1, sm: 0 }
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", fontWeight: 500, textAlign: { xs: "center", sm: "left" } }}>
            © {currentYear} EduVerse. Nền tảng học trực tuyến dành cho mọi người.
          </Typography>
          
          <Stack direction="row" spacing={3} sx={{ justifyContent: "center" }}>
            <Typography
              component={Link}
              href="/auth/privacy"
              sx={{ fontSize: 12.5, color: "text.secondary", textDecoration: "none", fontWeight: 500, "&:hover": { color: "primary.main" } }}
            >
              Chính sách bảo mật
            </Typography>
            <Typography
              component={Link}
              href="/auth/terms"
              sx={{ fontSize: 12.5, color: "text.secondary", textDecoration: "none", fontWeight: 500, "&:hover": { color: "primary.main" } }}
            >
              Điều khoản sử dụng
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
