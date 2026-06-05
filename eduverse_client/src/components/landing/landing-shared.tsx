'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Chip, CssBaseline, Divider, Paper, Stack, ThemeProvider, Typography, Box, createTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { navItems } from './landing-data';

export function createLandingTheme(): Theme {
  return createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#8d1313' },
      background: { default: '#f7f3ef', paper: '#ffffff' },
      text: { primary: '#19171c', secondary: '#69656c' },
    },
    shape: { borderRadius: 2.8 },
    typography: {
      fontFamily:
        '"Be Vietnam Pro","Roboto",system-ui,-apple-system,Segoe UI,Arial,sans-serif',
      h3: { fontWeight: 900 },
      h4: { fontWeight: 900 },
      button: { textTransform: 'none', fontWeight: 800 },
    },
  });
}

export function LandingThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={createLandingTheme()}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function LandingNavbar({ activePath = '/' }: { activePath?: string }) {
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1100,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1.5, md: 1.75 },
          bgcolor: '#ffffff',
          borderBottom: '1px solid rgba(17,17,17,0.06)',
          boxShadow: '0 8px 24px rgba(24,18,20,0.04)',
        }}
      >
        <Stack
          direction="row"
          sx={{
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'space-between',
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
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={2.5}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              color: 'rgba(24,24,27,0.68)',
            }}
          >
            {navItems.map((item) => {
              const isActive = item.href === activePath;
              return (
                <Typography
                  key={item.label}
                  component={Link}
                  href={item.href}
                  sx={{
                    fontSize: 14,
                    fontWeight: isActive ? 900 : 700,
                    textDecoration: 'none',
                    color: isActive ? '#8d1313' : 'inherit',
                    '&:hover': { color: '#8d1313' },
                  }}
                >
                  {item.label}
                </Typography>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1.25}>
            <Chip
              component={Link}
              href="/auth/login"
              clickable
              label="Đăng nhập"
              sx={{
                bgcolor: 'transparent',
                color: '#19171c',
                fontWeight: 800,
              }}
            />
            <Chip
              component={Link}
              href="/auth/register"
              clickable
              label="Đăng ký"
              sx={{
                bgcolor: '#8d1313',
                color: '#fff',
                fontWeight: 900,
                '&:hover': { bgcolor: '#7a1111' },
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
  return (
    <Paper
      elevation={0}
      sx={{
        mt: { xs: 4, md: 5 },
        px: { xs: 2.5, md: 3.5 },
        py: { xs: 3, md: 4 },
        borderRadius: 2.8,
        bgcolor: '#6d0f0f',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr 1fr' },
          gap: 3,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>EduVerse</Typography>
          <Typography sx={{ mt: 1.25, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.7)' }}>
            Nền tảng e-learning thế hệ mới cho người đi làm và những ai muốn
            tăng tốc kỹ năng thực chiến.
          </Typography>
        </Box>
        {[
          { title: 'Khám phá', links: ['Khóa học mới', 'Giảng viên nổi bật', 'Sự kiện'] },
          { title: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'Chính sách bảo mật', 'Điều khoản dịch vụ'] },
          { title: 'Liên hệ', links: ['Giới thiệu', 'Chính sách', 'Điều khoản'] },
        ].map((group) => (
          <Box key={group.title}>
            <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{group.title}</Typography>
            <Stack spacing={0.9} sx={{ mt: 1.5 }}>
              {group.links.map((item) => (
                <Typography key={item} sx={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', gap: 1.5 }}>
        <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          © 2026 EduVerse. Tất cả quyền được bảo lưu.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Chính sách bảo mật
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            Điều khoản dịch vụ
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <Box sx={{ textAlign: align, maxWidth: align === 'center' ? 760 : 640 }}>
      {eyebrow ? (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.14em',
            color: '#a32020',
            textTransform: 'uppercase',
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
          letterSpacing: '-0.9px',
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
            color: 'rgba(24,24,27,0.62)',
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
}: {
  palette: readonly string[];
  badge: string;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: 200,
        borderRadius: 2.8,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 55%, ${palette[2]} 100%)`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10), transparent 18%), radial-gradient(circle at 78% 28%, rgba(255,255,255,0.08), transparent 16%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.34) 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 16,
          borderRadius: 2.8,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 18,
          height: 56,
          borderRadius: 2.8,
          bgcolor: 'rgba(255,255,255,0.06)',
          boxShadow: '0 16px 30px rgba(0,0,0,0.22)',
        }}
      />
      <Chip
        label={badge}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          bgcolor: '#8e1212',
          color: '#fff',
          fontWeight: 900,
        }}
      />
    </Box>
  );
}
