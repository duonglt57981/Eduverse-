export interface KiemDuyetSearchDto extends SearchBase {
  Keyword?: string;
  TrangThaiPheDuyet?: string;
  SapXepNgay?: string;
  SapXepTen?: string;
}

export interface KhoaHocKiemDuyetListDto {
  idKhoaHoc: string; // Guid
  tieuDe: string;
  hinhAnhKhoaHoc?: string | null;
  trangThai: string;
  trangThaiPheDuyet: string;
  createBy: string;
}

export interface KiemDuyetDetailDto {
  idKhoaHoc: string;
  tieuDe?: string | null;
  moTa?: string | null;
  giaGoc?: number | null;
  loaiKhoaHoc?: string | null;
  hinhAnhKhoaHoc?: string | null;
  capDo?: string | null;
  trangThaiPheDuyet?: string | null;
  trangThai?: string | null;
  idBanGhiTruoc?: string | null;
  isBanHienTai: boolean;
  createBy?: string | null;
  lichSuKiemDuyetDto?: LichSuKiemDuyetDto;
}
export interface KiemDuyetKhoaHocDto {
  idDoiTuong?: string | null; // Guid?
  loaiDoiTuong: string;
  trangThaiPheDuyet?: string | null; // string?
  ngayDuyet?: Date | null; // DateTime?
}

export interface LichSuKiemDuyetDto {
  id: string;
  idNguoiDuyet?: string | null;
  trangThaiPheDuyet?: string | null;
  lyDo?: string | null;
  ngayDuyet?: Date | null;
  ngayTao?: Date | null;
}
