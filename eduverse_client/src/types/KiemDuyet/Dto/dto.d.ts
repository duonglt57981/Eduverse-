export interface KiemDuyetSearchDto extends SearchBase {
  Keyword?: string;
  TrangThaiPheDuyet?: string; // "ChoDuyet" | "DangDuyet"
  SapXepNgay?: string; // "Moi" | "Cu"
  SapXepTen?: string; // "AZ" | "ZA"
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
  baiGiangChoDuyet: BaiGiangChoDuyetDto[];
  taiLieuChoDuyet: TaiLieuChoDuyetDto[];
  createBy?: string | null;
}

export interface BaiGiangChoDuyetDto {
  idBaiGiang: string; // Guid
  tieuDe?: string | null;
  loaiBaiGiang?: string | null;
  urlBaiGiang?: string | null;
  thoiLuong?: number | null; // int?
  laBaiGiangFree?: boolean | null; // bool?
  trangThai?: string | null;
  trangThaiPheDuyet?: string | null;
  idPhan: string; // Guid
  isBanHienTai: boolean;
  idBanGhiTruoc?: string | null; // Guid?
}

export interface TaiLieuChoDuyetDto {
  idTaiLieu: string; // Guid
  loaiTaiLieu?: string | null;
  tenTaiLieu?: string | null;
  url?: string | null;
  idDocument?: string | null;
  trangThai?: string | null;
  trangThaiPheDuyet?: string | null;
  idBaiGiang: string; // Guid
  createBy?: string | null;
}

export interface KiemDuyetKhoaHocDto {
  idDoiTuong?: string | null; // Guid?
  loaiDoiTuong: string;
  trangThaiPheDuyet?: string | null; // string?
  ngayDuyet?: Date | null; // DateTime?
}
