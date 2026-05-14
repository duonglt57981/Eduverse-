"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiService } from "../../../services/index";

export default function VerifyEmailPage() {
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
        setTimeout(() => router.push("/auth"), 2500);
      })
      .catch(() => {
        setMsg("Link xác thực không hợp lệ hoặc đã hết hạn");
      });
  }, [params, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{ok ? "✅" : "⏳"}</div>
        <h2 style={{ marginBottom: 8 }}>{msg}</h2>
        {ok && (
          <p style={{ color: "#777" }}>Đang chuyển về trang đăng nhập...</p>
        )}
        {!ok && <p style={{ color: "#777" }}>Vui lòng chờ...</p>}
      </div>
    </div>
  );
}
