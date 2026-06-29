export interface TaoThanhToanDto {
  khoaHocIds: string[];
  maGiamGia?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface TaoThanhToanResponseDto {
  donHangId: string;
  maGiaoDich?: string;
  checkoutUrl?: string;
  qrCode?: string;
  soTien: number;
}

export interface DonHangChiTietDto {
  idKhoaHoc?: string;
  tenKhoaHoc?: string;
  giaLucDat?: number;
}

export interface DonHangDto {
  id: string;
  maGiaoDich?: string;
  soTienThanhToan?: number;
  soTienGiamGia?: number;
  trangThai?: int;
  trangThaiText?: string;
  ngayTao?: string;
  chiTiets?: DonHangChiTietDto[];
}
