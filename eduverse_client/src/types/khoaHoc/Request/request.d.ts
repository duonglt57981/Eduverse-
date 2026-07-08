export interface CreateKhoaHocRequest {
  tieuDe?: string;
  moTa?: string;
  giaGoc?: number;
  capDo?: string;
  img?: File;
  danhSachDanhMuc?: string[];
}

export interface UpdateKhoaHocRequest {
  idKhoaHoc?: string;
  tieuDe?: string;
  moTa?: string;
  gia?: number;
  giaGoc?: number;
  capDo?: string;
  img?: File;
  danhSachDanhMuc?: string[];
  isBanHienTai: boolean;
}
