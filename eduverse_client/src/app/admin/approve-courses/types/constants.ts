/* eslint-disable @typescript-eslint/no-explicit-any */
import { BRAND, NEUTRAL, STATUS, FONT_FAMILY } from "@/src/theme/tokens";
// Giữ nguyên tên khoá để không phải sửa các component đang dùng,
// chỉ trỏ GIÁ TRỊ về design system chung trong src/theme/tokens.ts.
export const COLORS = {
  primary: "#8B1313",
  primaryDark: "#6B0E0E",
  primarySoft: "rgba(139,19,19,0.08)",
  ink: "var(--ev-text-primary, #1F2937)",
  inkSoft: "var(--ev-text-secondary, #4B5563)",
  paper: "var(--ev-bg, #F7F5F2)",
  paperRaised: "var(--ev-paper, #FFFFFF)",
  line: "var(--ev-divider, #ECE7E4)",
  gold: "#D97706",
  goldSoft: "#FEF3C7",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};

// Toàn hệ thống dùng chung một bộ chữ Be Vietnam Pro.
export const FONTS = {
  display: "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif))",
  body: "var(--font-primary, var(--ev-font-family, 'Be Vietnam Pro', sans-serif))",
};

export const boxSx = {
  border: `1px solid ${COLORS.line}`,
  borderRadius: "16px",
  bgcolor: COLORS.paperRaised,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.015)",
};

export const SCROLL_AREA_HEIGHT = "calc(100vh - 220px)";

export const TABS = [
  { value: "ChoDuyet", label: "Chờ duyệt" },
  { value: "TatCa", label: "Tất cả" },
  { value: "DaDuyet", label: "Đã duyệt" },
  { value: "TuChoi", label: "Từ chối" },
];

export const PAGE_SIZE = 10;

export type TrangThaiKiemDuyet =
  | "DangSua"
  | "ChoDuyet"
  | "DangDuyet"
  | "DaDuyet"
  | "TuChoi";
export type LoaiNoiDung = "baiGiang" | "taiLieu";

export function normalizeTrangThai(
  trangThaiPheDuyet: unknown,
): TrangThaiKiemDuyet {
  if (
    typeof trangThaiPheDuyet === "string" &&
    ["DangSua", "ChoDuyet", "DangDuyet", "DaDuyet", "TuChoi"].includes(
      trangThaiPheDuyet,
    )
  ) {
    return trangThaiPheDuyet as TrangThaiKiemDuyet;
  }
  return "ChoDuyet";
}

export function isTrangThaiCho(trangThaiPheDuyet: unknown) {
  return trangThaiPheDuyet === "ChoDuyet" || trangThaiPheDuyet === "DangDuyet";
}

export function normalizeListResponse(res: any, pageSize: number) {
  const isSuccess = res?.status ?? true;
  if (!isSuccess) return { list: [], totalPage: 1 };
  const raw = res?.data ?? res;
  let list: any[] = [];
  let totalItems: number | undefined;
  let totalPageFromApi: number | undefined;
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    list =
      raw.items ??
      raw.data ??
      raw.result ??
      raw.list ??
      raw.danhSach ??
      raw.records ??
      [];
    totalItems =
      raw.totalCount ?? raw.total ?? raw.totalItems ?? raw.totalRecords;
    totalPageFromApi =
      raw.totalPage ?? raw.totalPages ?? raw.pageCount ?? raw.totalPageCount;
  }
  if (!Array.isArray(list)) list = [];
  const totalPage =
    totalPageFromApi ??
    (totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : undefined) ??
    1;
  return { list, totalPage: totalPage || 1 };
}

export function normalizeDetailResponse(res: any) {
  const isSuccess = res?.status ?? true;
  if (!isSuccess) return null;
  let data = res?.data ?? res?.result ?? res;
  if (
    data &&
    typeof data === "object" &&
    data.data &&
    !data.baiGiangs &&
    !data.taiLieus &&
    !data.baiGiangChoDuyet
  ) {
    data = data.data;
  }
  return data;
}

export function getFileKind(url: string): "pdf" | "image" | "office" | "other" {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(clean)) return "image";
  if (/\.(docx?|xlsx?|pptx?)$/.test(clean)) return "office";
  return "other";
}

export function getFileName(url: string, fallback: string) {
  try {
    const clean = url.split("?")[0];
    const name = clean.substring(clean.lastIndexOf("/") + 1);
    return name || fallback;
  } catch {
    return fallback;
  }
}
