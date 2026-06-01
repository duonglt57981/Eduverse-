export interface BaiGiangType {
  id?: Guid;
  tieuDe?: string;
  loaiBaiGiang?: string;
  idVideoBaiGiang?: string;
  urlBaiGiang?: string;
  thuTuSapXep?: number;
  thoiLuong?: number;
  laBaiGiangFree?: boolean;
  trangThai?: string;
  idPhan?: Guid;
  
  daHoanThanh?: boolean;
  thoiGianXem?: number;

  danhSachTaiLieu?: TaiLieuType[];
  tienDoHocTap?: TienDoHocTapType;
}
