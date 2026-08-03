"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "../../../services/index";

function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Đang xác thực email...");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const userId = params.get("userId");
    const token = params.get("token");

    if (!userId || !token) {
      queueMicrotask(() => {
        setMsg("Link không hợp lệ");
      });
      return;
    }

    apiService
      .get(
        `/auth/verify-email?userId=${userId}&token=${encodeURIComponent(token)}`,
      )
      .then(() => {
        setOk(true);
        setMsg("Xác thực email thành công!");
        setTimeout(() => router.push("/auth/login"), 2500);
      })
      .catch(() => {
        setMsg("Link xác thực không hợp lệ hoặc đã hết hạn");
      });
  }, [params, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ev-bg, #F7F5F2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          '"Be Vietnam Pro","Roboto",system-ui,-apple-system,"Segoe UI",Arial,sans-serif',
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "var(--ev-paper, #FFFFFF)",
          border: "1px solid var(--ev-divider, #ECE7E4)",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(24,18,20,0.06)",
          padding: "40px 32px",
          maxWidth: 420,
          width: "100%",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>{ok ? "✅" : "⏳"}</div>
        <h2 style={{ margin: "0 0 8px", color: "var(--ev-text-primary, #1F2937)", fontWeight: 800, fontSize: 22 }}>{msg}</h2>
        {ok && (
          <p style={{ color: "var(--ev-text-secondary, #4B5563)", margin: 0 }}>Đang chuyển về trang đăng nhập...</p>
        )}
        {!ok && <p style={{ color: "var(--ev-text-secondary, #4B5563)", margin: 0 }}>Vui lòng chờ...</p>}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--ev-bg, #F7F5F2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ev-text-primary, #1F2937)", fontFamily: '"Be Vietnam Pro","Roboto",system-ui,-apple-system,"Segoe UI",Arial,sans-serif' }}>
        <h2>Đang tải...</h2>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
