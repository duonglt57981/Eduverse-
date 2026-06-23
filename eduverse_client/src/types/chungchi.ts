export interface ChungChiDto {
  id: string;
  maSoChungChi: string | null;
  tenChungChi: string | null;
  urlChungChi: string | null;
  ngayCap: string | null;
  ngayHetHan: string | null;
  trangThai: string | null;
  tongThoiGianHoc: number | null;
  diemTongKet: number | null;
  ngayTao: string | null;
  idDangKi: string | null;
  idKhoaHoc: string | null;
  // Additional fields from related entities (if API returns)
  tenKhoaHoc?: string;
  tenGiangVien?: string;
  anhDaiDien?: string;
}

export interface CreateChungChiRequest {
  tenChungChi?: string;
  urlChungChi?: string;
  ngayCap?: string;
  ngayHetHan?: string;
  trangThai?: string;
  idKhoaHoc?: string;
}

export interface UpdateChungChiRequest {
  id: string;
  tenChungChi?: string;
  urlChungChi?: string;
  ngayCap?: string;
  ngayHetHan?: string;
  trangThai?: string;
}

export interface ChungChiSearch {
  keyword?: string;
  trangThai?: string;
  pageIndex?: number;
  pageSize?: number;
}

export type ChungChiFilterType = "all" | "verified" | "pending" | "expired";
