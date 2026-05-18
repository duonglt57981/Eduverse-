"use client";
import React from "react";
import { Providers } from "../store/providers";


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
      <body className="dir-ltr">
        <div className="App">
          <Providers>
            {/* <ConfigProvider theme={lightTheme} locale={viVN}> */}
              {children}
            {/* </ConfigProvider> */}
          </Providers>
        </div>
      </body>
    </html>
  );
}