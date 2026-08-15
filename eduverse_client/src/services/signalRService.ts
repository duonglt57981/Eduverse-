/* eslint-disable */
import * as signalR from "@microsoft/signalr";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("AccessToken") || "";
}

function buildHubUrl(hubPath: string): string {
  // hubPath ví dụ: "/api/courseHub" hoặc "/api/notificationHub"
  return `${BASE_URL}${hubPath}`;
}

export function createHubConnection(hubPath: string): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(buildHubUrl(hubPath), {
      accessTokenFactory: getAccessToken,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();
}

export const createCourseHubConnection = () =>
  createHubConnection("/courseHub");

export const createNotificationHubConnection = () =>
  createHubConnection("/notificationHub");
