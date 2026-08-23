export interface FavoriteCourse {
  id: string;
  khoaHocId: string;
  tieuDe: string;
  moTa: string;
  hinhAnh: string;
  giangVien: string;
  giaTien: number;
  createdDate: string;
  isFavorite: boolean;
  diemDanhGiaTrungBinh?: number | null;   
  soLuongDanhGia?: number;              
  soLuongHocVien?: number;               
  capDo?: string;  
}
