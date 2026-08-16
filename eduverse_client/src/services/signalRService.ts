/* eslint-disable */
import * as signalR from "@microsoft/signalr";

// Lấy base URL từ biến môi trường
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

console.log("[SignalR] BASE_URL:", BASE_URL);

/**
 * Lấy Access Token từ localStorage
 */
function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("AccessToken") || "";
}

/**
 * Xây dựng URL đầy đủ cho SignalR Hub
 * - Tự động thêm tiền tố /api nếu BASE_URL chưa có
 * - Loại bỏ dấu / trùng lặp
 */
function buildHubUrl(hubPath: string): string {
  // Đảm bảo BASE_URL không có dấu / cuối
  let base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

  // Nếu BASE_URL rỗng (lỗi cấu hình), fallback về domain hiện tại
  if (!base) {
    base = typeof window !== "undefined" ? window.location.origin : "";
    console.warn(
      "[SignalR] BASE_URL is empty, using window.location.origin:",
      base,
    );
  }

  // SignalR Hub được map trực tiếp ở root (vd: /courseHub), KHÔNG nằm dưới /api
  // như các REST Controller. Nên phải loại bỏ /api khỏi base trước khi ghép.
  base = base.replace(/\/api\/?$/, "");

  // Đảm bảo hubPath bắt đầu bằng /
  const path = hubPath.startsWith("/") ? hubPath : "/" + hubPath;

  const fullUrl = `${base}${path}`;
  console.log("[SignalR] Built URL:", fullUrl);
  return fullUrl;
}

/**
 * Tạo HubConnection với cấu hình chuẩn
 */
export function createHubConnection(hubPath: string): signalR.HubConnection {
  const url = buildHubUrl(hubPath);

  // Kiểm tra nếu đang ở production nhưng URL vẫn là localhost -> cảnh báo
  if (process.env.NODE_ENV === "production" && url.includes("localhost")) {
    console.error(
      "[SignalR] Production environment but URL points to localhost!",
    );
  }

  return new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: getAccessToken,
      // Đảm bảo gửi token qua query string cho cả WebSocket và LongPolling
      // (SignalR tự động xử lý)
    })
    .build();
}

/**
 * Connection cho CourseHub
 */
export const createCourseHubConnection = () =>
  createHubConnection("/courseHub");

/**
 * Connection cho NotificationHub
 */
export const createNotificationHubConnection = () =>
  createHubConnection("/notificationHub");
