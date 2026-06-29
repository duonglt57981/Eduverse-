export interface Certificate {
  id: string;
  maSoChungChi: string;
  tenChungChi: string;
  tenKhoaHoc: string;
  ngayCap: string; // ISO date string or YYYY-MM-DD
  diemTongKet: number; // e.g. 9.2 or 92
  tongThoiGianHoc: number; // in hours
  trangThai: string; // e.g. "Hoạt động" | "Đang chờ" | "Thu hồi"
  thumbnail: string; // url to certificate thumbnail image
}

export interface CertificateFilters {
  keyword: string;
  trangThai: string; // "Tất cả" | "Hoạt động" | "Đang chờ" | "Thu hồi"
  sortBy: string; // "newest" | "oldest" | "highest_score" | "lowest_score"
}

export interface CertificateStats {
  tongSoChungChi: number;
  tyLeHoanThanh: number; // in percentage, e.g. 85
  khoaHocDaHoanThanh: number;
  chungChiMoiNhat: Certificate | null;
}
