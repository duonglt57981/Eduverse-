export interface DanhMucDto {
  id: string;
  tenDanhMuc: string;
  ngayTao: string | null;
  trangThai: string | null;
}

export interface CreateDanhMucRequest {
  tenDanhMuc: string;
}

export interface UpdateDanhMucRequest {
  id: string;
  tenDanhMuc: string;
}

export interface DanhMucSearch {
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
}
