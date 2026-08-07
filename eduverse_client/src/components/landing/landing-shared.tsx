/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Chip,
  CssBaseline,
  Divider,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  Box,
  useMediaQuery,
} from "@mui/material";
import { createAppTheme } from "@/src/theme/createAppTheme";
import type { Theme } from "@mui/material/styles";
import { navItems } from "./landing-data";
import { useThemeSettings } from "@/src/contexts/ThemeSettingsContext";
import { useSelector } from "@/src/store/hook";
import React from "react";

export function createLandingTheme(): Theme {
  return createAppTheme();
}

export function LandingThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentAccent, themeMode } = useThemeSettings();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const activeMode =
    themeMode === "system" ? (prefersDarkMode ? "dark" : "light") : themeMode;

  const theme = React.useMemo(
    () =>
      createAppTheme(activeMode, currentAccent.value, currentAccent.hoverColor),
    [activeMode, currentAccent],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (typeof payload.exp !== "number") return false;
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
}

export function LandingNavbar({ activePath = "/" }: { activePath?: string }) {
  if (activePath.startsWith("/personnel")) {
    return null;
  }

  const user = useSelector((s) => s.auth.user);
  const hasUser = !!(
    user &&
    user.accessToken &&
    !isTokenExpired(user.accessToken)
  );

  const filteredNavItems = navItems.filter((item) => {
    if (item.href === "/favorite" && !hasUser) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1100,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, md: 1.75 },
          bgcolor: "var(--ev-paper, #ffffff)",
          borderBottom: "1px solid rgba(17,17,17,0.06)",
          boxShadow: "0 8px 24px rgba(24,18,20,0.04)",
        }}
      >
        <Stack
          direction="row"
          sx={{
            minHeight: 52,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ width: { xs: 120, sm: 150 } }}>
            <Image
              src="/auth/img/logo_nentrang.png"
              alt="EduVerse"
              width={150}
              height={46}
              priority
              style={{ width: "100%", height: "auto" }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={2.5}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              color: "var(--ev-text-muted, rgba(24,24,27,0.68))",
            }}
          >
            {filteredNavItems.map((item) => {
              const isActive = item.href === activePath;
              return (
                <Typography
                  key={item.label}
                  component={Link}
                  href={item.href}
                  sx={{
                    fontSize: 14,
                    fontWeight: isActive ? 900 : 700,
                    textDecoration: "none",
                    color: isActive ? "primary.main" : "inherit",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Stack>

          {/* Luôn hiện Đăng nhập / Đăng ký, kể cả khi phiên đăng nhập còn hiệu lực */}
          <Stack direction="row" spacing={1.25}>
            <Chip
              component={Link}
              href="/auth/login"
              clickable
              label="Đăng nhập"
              sx={{
                bgcolor: "transparent",
                border: "1px solid",
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 900,
                "&:hover": {
                  bgcolor: "var(--ev-brand-tint, rgba(139,19,19,0.08))",
                },
              }}
            />
            <Chip
              component={Link}
              href="/auth/register"
              clickable
              label="Đăng ký"
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                fontWeight: 900,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ height: { xs: 88, md: 92 } }} />
    </>
  );
}

export function LandingFooter() {
  const columns: {
    title: string;
    links: { label: string; href?: string }[];
  }[] = [
    {
      title: "Khám phá",
      links: [
        { label: "Khóa học", href: "/courses" },
        { label: "Giảng viên", href: "/instructors" },
        { label: "Lộ trình học", href: "/learning-paths" },
      ],
    },
    {
      title: "Về EduVerse",
      links: [
        { label: "Giới thiệu", href: "/about-us" },
        { label: "Liên hệ", href: "/contact" },
        { label: "Câu hỏi thường gặp", href: "/contact" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Trung tâm trợ giúp", href: "/contact" },
        { label: "Điều khoản dịch vụ" },
        { label: "Chính sách bảo mật" },
      ],
    },
  ];
  const linkSx = {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    textDecoration: "none",
    cursor: "pointer",
    width: "fit-content",
    transition: "color 150ms ease",
    "&:hover": { color: "#fff" },
  };
  return (
    <Paper
      component="footer"
      elevation={0}
      sx={{
        mt: { xs: 5, md: 8 },
        mx: { xs: -2, sm: -3, md: -4 },
        mb: { xs: -2, md: -3 },
        bgcolor: "#6d0f0f",
        borderRadius: 0,
      }}
    >
      <Box sx={{ px: { xs: 2.5, sm: 4, md: 6 }, py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "1.6fr 1fr 1fr 1fr",
            },
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
              EduVerse
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                fontSize: 13,
                lineHeight: 1.85,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 320,
              }}
            >
              Nền tảng e-learning thế hệ mới cho người đi làm và những ai muốn
              tăng tốc kỹ năng thực chiến.
            </Typography>
          </Box>
          {columns.map((column) => (
            <Box key={column.title}>
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.02em",
                }}
              >
                {column.title}
              </Typography>
              <Stack spacing={1.1} sx={{ mt: 1.75 }}>
                {column.links.map((item) =>
                  item.href ? (
                    <Typography
                      key={item.label}
                      component={Link}
                      href={item.href}
                      sx={linkSx}
                    >
                      {item.label}
                    </Typography>
                  ) : (
                    <Typography key={item.label} sx={linkSx}>
                      {item.label}
                    </Typography>
                  ),
                )}
              </Stack>
            </Box>
          ))}
        </Box>
        <Divider
          sx={{ my: { xs: 3, md: 3.5 }, borderColor: "rgba(255,255,255,0.12)" }}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
            © 2026 EduVerse. Tất cả quyền được bảo lưu.
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)" }}>
            Email hỗ trợ:{" "}
            <Box component="span" sx={{ color: "#fff", fontWeight: 700 }}>
              support@eduverse.edu.vn
            </Box>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <Box
      sx={{
        textAlign: align,
        maxWidth: align === "center" ? 760 : 640,
        mx: align === "center" ? "auto" : undefined,
      }}
    >
      {eyebrow ? (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "primary.main",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography
        variant="h3"
        sx={{
          mt: eyebrow ? 1 : 0,
          fontSize: { xs: 28, md: 42 },
          lineHeight: 1.08,
          letterSpacing: "-0.9px",
          color: "#1a1a1a",
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          sx={{
            mt: 1.5,
            fontSize: 15,
            lineHeight: 1.9,
            color: "var(--ev-text-muted, rgba(24,24,27,0.62))",
          }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}

export function CourseVisual({
  palette,
  badge,
  hinhAnhKhoaHoc,
}: {
  palette: readonly string[];
  badge: string;
  hinhAnhKhoaHoc?: string | null;
}) {
  const [imgError, setImgError] = React.useState(false);
  const hasImage = Boolean(hinhAnhKhoaHoc && !imgError);

  return (
    <Box
      sx={{
        position: "relative",
        height: 200,
        borderRadius: 2.8,
        overflow: "hidden",
        background: hasImage
          ? "var(--ev-paper-alt, #FBFAF9)"
          : `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 55%, ${palette[2]} 100%)`,
      }}
    >
      {hasImage ? (
        <Box
          component="img"
          src={hinhAnhKhoaHoc!}
          alt={badge}
          onError={() => setImgError(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      ) : (
        <>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10), transparent 18%), radial-gradient(circle at 78% 28%, rgba(255,255,255,0.08), transparent 16%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.34) 100%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 16,
              borderRadius: 2.8,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: 18,
              right: 18,
              bottom: 18,
              height: 56,
              borderRadius: 2.8,
              bgcolor: "rgba(255,255,255,0.06)",
              boxShadow: "0 16px 30px rgba(0,0,0,0.22)",
            }}
          />
        </>
      )}
      <Chip
        label={badge}
        size="small"
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          bgcolor: "primary.main",
          color: "#fff",
          fontWeight: 900,
          zIndex: 2,
        }}
      />
    </Box>
  );
}
