export interface KhoaHocType {
  id?: Guid;
  tieuDe?: string;
  moTa?: string;
  gia?: number;
  giaGoc?: number;
  loaiKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  urlViewPreviewKhoaHoc?: string;
  capDo?: string;
  tongThoiLuong?: number;
  tongBaiGiang?: number;
  ngayTao?: Date;
  ngayCapNhat?: Date;
  soLuongHocVien?: number;
  trangThaiPheDuyet?: string;
  trangThai?: string;
  idBanGhiTruoc?: string | null;
  tongBaiGiang?: number;
  tongTaiLieu?: number;
  isBanHienTai?: boolean;
  daDangKy: boolean;

  idDangKiKhoaHoc?: string;
  ngayDangKy: Date;
  soBaiGiangHoanThanh: number;
  phanTramHoanThanh: double;

  danhSachPhanHoc?: PhanHocType[];
}

export type KhoaHocSearch = SearchBase & {
  keyword?: string;
  tieuDe?: string;
  capDo?: string;
  loaiKhoaHoc?: string;
  giaFrom?: number | null;
  giaTo?: number | null;
  tongBaiGiangFrom?: number | null;
  tongBaiGiangTo?: number | null;
  isFree?: boolean | null;
  sortPrice?: string;
};

export interface GetToUpdateKhoaHoc {
  id?: string;
  tieuDe?: string;
  moTa?: string;
  gia?: number;
  giaGoc?: number;
  capDo?: string;
  urlHinhAnh?: string;
  danhSachDanhMuc?: string[];
}
