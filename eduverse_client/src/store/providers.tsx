"use client";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ThemeSettingsProvider } from "../contexts/ThemeSettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeSettingsProvider>{children}</ThemeSettingsProvider>
      </QueryClientProvider>
    </Provider>
  );
}
