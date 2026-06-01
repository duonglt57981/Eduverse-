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

  SoBaiGiangHoanThanh: number;
  PhanTramHoanThanh: double;
  
  danhSachPhanHoc?: PhanHocType[];
}