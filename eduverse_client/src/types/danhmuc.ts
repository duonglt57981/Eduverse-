export interface DanhMucDto {
  id: string;
  tenDanhMuc: string;
  ngayTao: string | null;
  trangThai: string | null;
  maDanhMuc?: string;
}

export interface CreateDanhMucRequest {
  tenDanhMuc: string;
  maDanhMuc?: string;
  trangThai?: string;
}

export interface UpdateDanhMucRequest {
  id: string;
  tenDanhMuc: string;
  maDanhMuc?: string;
  trangThai?: string;
}

export interface DanhMucSearch {
  keyword?: string;
  trangThai?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface DanhMucStatsDto {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  linkedCoursesCount: number;
}
