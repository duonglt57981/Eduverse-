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
}

export interface UpdateDanhMucRequest {
  id: string;
  tenDanhMuc: string;
  maDanhMuc?: string;
}

export interface DanhMucSearch {
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
}
