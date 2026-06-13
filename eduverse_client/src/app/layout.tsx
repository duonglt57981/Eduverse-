"use client";
import React from "react";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "../store/providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});


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
                {children}
              {/* </ConfigProvider> */}
            </Providers>
          </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
