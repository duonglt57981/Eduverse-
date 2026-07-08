export interface ThongBao {
  id: string;
  message?: string;
  link?: string;
  fromUser?: string;
  toUser?: string;
  isRead?: boolean;
  type?: string;
  sendToFrontEndUser?: boolean;
  itemId?: string;
  itemName?: string;
  itemType?: string;
  isDisplay?: boolean;
  donViId?: string;
  email?: string;
  loaiThongBao?: string;
  productId?: string;
  productName?: string;
  tieuDe?: string;
  noiDung?: string;
  nguoiTao?: string;
  fileDinhKem?: string;
  isXuatBan?: boolean;
  daDoc?: boolean;
  thoiGianDoc?: string;
  thoiGianTao?: string;
  trangThai?: string;
  idNguoiDung?: string;
}

export interface ThongBaoRequest {
  message?: string;
  link?: string;
  fromUser?: string;
  toUser?: string;
  isRead?: boolean;
  type?: string;
  sendToFrontEndUser?: boolean;
  itemId?: string;
  itemName?: string;
  itemType?: string;
  isDisplay?: boolean;
  donViId?: string;
  email?: string;
  loaiThongBao?: string;
  productId?: string;
  productName?: string;
  tieuDe?: string;
  noiDung?: string;
  nguoiTao?: string;
  fileDinhKem?: string;
  isXuatBan?: boolean;
  daDoc?: boolean;
  thoiGianDoc?: string;
  trangThai?: string;
  idNguoiDung?: string;
}

export interface ThongBaoSearch {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  loaiThongBao?: string;
  type?: string;
  idNguoiDung?: string;
  fromUser?: string;
  toUser?: string;
  isRead?: boolean;
  isDisplay?: boolean;
  isXuatBan?: boolean;
  fromDate?: string;
  toDate?: string;
}
