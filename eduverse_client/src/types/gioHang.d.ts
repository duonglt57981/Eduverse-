export interface GioHangChiTietDto {
  id: string;
  idKhoaHoc?: string;
  tenKhoaHoc?: string;
  hinhAnh?: string;
  gia?: number;
  giaGoc?: number;
  daChon?: boolean;
  thoiGianThem?: string;
  tenTacGia?: string;    
  tongThoiLuong?: number; 
  tongBaiGiang?: number;  
}

export interface GioHangDto {
  gioHangId: string;
  items: GioHangChiTietDto[];
  tongTien: number;
  tongTienDaChon: number;
  soLuongDaChon: number;
}
