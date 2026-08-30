export interface KhoaHocDto {
  id: string;
  tieuDe?: string;
  moTa?: string;
  gia?: number;
  giaGoc?: number;
  loaiKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  uRLViewPreviewKhoaHoc?: string;
  capDo?: string;
  tongThoiLuong?: number;
  tongBaiGiang?: number;
  soLuongHocVien?: number;
  trangThai?: number;
  trangThaiPheDuyet?: number;
  ngayTao?: string;
  daYeuThich?: boolean;
  daDangKy?: boolean;
}

export interface BaiGiangDto {
  id: string;
  tieuDe?: string;
  loaiBaiGiang?: string;
  urlBaiGiang?: string;
  thuTuSapXep?: number;
  thoiLuong?: number;
  laBaiGiangFree?: boolean;
  trangThai?: number;
  lyDoTuChois: LyDoTuChoiDto;
  taiLieus?: TaiLieuDto[];
  danhSachTaiLieu?: TaiLieuDto[];
}

export interface PhanDto {
  id: string;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  baiGiangs?: BaiGiangDto[];
  idBanGhiTruoc: string | null;
}

export interface KhoaHocDetailDto extends KhoaHocDto {
  phans?: PhanDto[];
}

export interface DanhMucDto {
  id: string;
  tenDanhMuc?: string;
}

export interface KhoaHocQueryDto {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  danhMucId?: string;
  capDo?: string;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  totalPage: number;
  pageIndex: number;
  pageSize: number;
}
