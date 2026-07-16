/* eslint-disable @typescript-eslint/no-explicit-any */
export const COLORS = {
  primary: "#8B1313",
  primaryDark: "#5A171F",
  primarySoft: "#F4E3DE",
  ink: "#241A1C",
  inkSoft: "#5C4B47",
  paper: "#FBF7F4",
  paperRaised: "#FFFFFF",
  line: "#E2D5CF",
  gold: "#A9772F",
  goldSoft: "#F7EDDD",
  success: "#3F7A4E",
  successSoft: "#E7F1E8",
  danger: "#AE3A2E",
  dangerSoft: "#F8E9E6",
};

export const FONTS = {
  display: `'Fraunces', 'Georgia', serif`,
  body: `'Inter', 'Roboto', 'Helvetica Neue', sans-serif`,
};

export const boxSx = {
  border: `1px solid ${COLORS.line}`,
  borderRadius: 2,
  bgcolor: COLORS.paperRaised,
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
