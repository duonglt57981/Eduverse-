"use client";
import React from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "../store/providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import {
  LandingNavbar,
  LandingFooter,
  LandingThemeProvider,
} from "../components/landing/landing-shared";
import { useSelector } from "@/src/store/hook";
import AuthenticatedFooter from "../components/footer/AuthenticatedFooter";
import StudentFooter from "../components/footer/StudentFooter";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

function RouteLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const user = useSelector((state) => state.auth.user);
  const roles = useSelector((state) => state.auth.roles) || [];

  const isPublicRoute = !(
    pathname.startsWith("/admin") ||
    pathname.startsWith("/personnel") ||
    (pathname === "/instructor" || pathname.startsWith("/instructor/")) ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/auth") ||
    pathname === "/learning-paths" ||
    pathname === "/settings"
  );

  const role = roles.includes("GiaoVien") ? "GiaoVien" : roles.includes("Admin") ? "Admin" : "HocVien";

  if (isPublicRoute) {
    return (
      <LandingThemeProvider>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
          <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <LandingNavbar activePath={pathname} />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              {children}
            </Box>
            {user ? (
              role === "HocVien" ? (
                <StudentFooter />
              ) : (
                <AuthenticatedFooter role={role} />
              )
            ) : (
              <LandingFooter />
            )}
          </Box>
        </Box>
      </LandingThemeProvider>
    );
  }

  return <>{children}</>;
}

/**
 * Chạy TRƯỚC khi React hydrate để tránh nháy nền sáng khi đang ở chế độ tối.
 * Đọc lựa chọn trong localStorage, tự suy ra chế độ khi chọn "system",
 * rồi bơm sẵn biến CSS vào <html>. Chỉ đụng tới giao diện, không có nghiệp vụ.
 */
const THEME_INIT_SCRIPT = `
(function(){
  try{
    var m = localStorage.getItem('eduverse_theme_mode') || 'light';
    if (m === 'system') {
      m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var d = m === 'dark';
    var v = d
      ? {bg:'#0F1216',paper:'#171B21',alt:'#1E232B',tp:'#F2F5F9',ts:'#B4BCC8',tm:'#8B95A3',
         g:'#6B7583',dv:'rgba(255,255,255,0.10)',bt:'rgba(139,19,19,0.18)',
         bb:'rgba(196,74,74,0.32)',hv:'rgba(255,255,255,0.06)',sl:'rgba(196,74,74,0.16)'}
      : {bg:'#F7F5F2',paper:'#FFFFFF',alt:'#FBFAF9',tp:'#1F2937',ts:'#4B5563',tm:'#8A7676',
         g:'#9CA3AF',dv:'#ECE7E4',bt:'#FBEFEF',bb:'#F0DEDE',hv:'rgba(24,18,20,0.04)',
         sl:'rgba(139,19,19,0.08)'};
    var r = document.documentElement;
    r.style.setProperty('--ev-bg',v.bg);
    r.style.setProperty('--ev-paper',v.paper);
    r.style.setProperty('--ev-paper-alt',v.alt);
    r.style.setProperty('--ev-text-primary',v.tp);
    r.style.setProperty('--ev-text-secondary',v.ts);
    r.style.setProperty('--ev-text-muted',v.tm);
    r.style.setProperty('--ev-grey',v.g);
    r.style.setProperty('--ev-divider',v.dv);
    r.style.setProperty('--ev-brand-tint',v.bt);
    r.style.setProperty('--ev-brand-border',v.bb);
    r.style.setProperty('--ev-hover',v.hv);
    r.style.setProperty('--ev-selected',v.sl);
    r.style.colorScheme = m;
    r.setAttribute('data-ev-mode', m);
    document.body && (document.body.style.backgroundColor = v.bg);
  }catch(e){}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appTitle = process.env.NEXT_PUBLIC_APP_NAME
    ?.replace(/\r?\n|\r/g, " ")
    ?.replace(/\s+/g, " ")
    ?.trim();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>{appTitle}</title>
        {/* Chống nháy nền sáng khi tải trang ở chế độ tối */}
        {typeof window === "undefined" && (
          <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        )}
      </head>
      <body className={`${beVietnamPro.className} dir-ltr`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <div className="App">
            <Providers>
              {/* <ConfigProvider theme={lightTheme} locale={viVN}> */}
                <RouteLayoutWrapper>{children}</RouteLayoutWrapper>
              {/* </ConfigProvider> */}
            </Providers>
          </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
