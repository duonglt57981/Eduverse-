// src/app/instructor/manager-courses/components/useToast.tsx
"use client";

import { useCallback, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { ToastSeverity, ToastState } from "../types";

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  // useCallback đảm bảo `show` có identity ổn định giữa các lần render,
  // tránh gây vòng lặp fetch lại vô hạn ở những nơi dùng `show` làm
  // dependency của useCallback/useEffect (VD: PhanSection, BaiGiangSection,
  // TaiLieuSection).
  const show = useCallback(
    (msg: string, sev: ToastSeverity = "success") => setToast({ msg, sev }),
    [],
  );
  const hide = useCallback(() => setToast(null), []);

  const ToastComponent = (
    <Snackbar
      open={!!toast}
      autoHideDuration={3500}
      onClose={hide}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={hide}
        severity={toast?.sev ?? "success"}
        sx={{ borderRadius: 2, minWidth: 260 }}
      >
        {toast?.msg}
      </Alert>
    </Snackbar>
  );

  return { show, ToastComponent };
}
