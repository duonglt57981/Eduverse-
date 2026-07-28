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
            {user ? <AuthenticatedFooter role={role} /> : <LandingFooter />}
          </Box>
        </Box>
      </LandingThemeProvider>
    );
  }

  return <>{children}</>;
}

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
