import { apiService } from ".";

export interface DoanhThuTheoThangDto {
  nam: number;
  thang: number;
  doanhThu: number;
  soDon: number;
}

export interface PhanChiaGiangVienDto {
  idGiangVien: string;
  hoTen?: string;
  anhDaiDien?: string;
  laChuSoHuu: boolean;
  tyLeChiaDoanhThu: number;
  soTienNhan: number;
}

export interface ThongKeDoanhThuDto {
  tongDoanhThu: number;
  doanhThuSauGiam: number;
  phanGiangVien: number;
  phanHeTong: number;
  tongDonHang: number;
  tongHocVien: number;
  doanhThuTheoThang: DoanhThuTheoThangDto[];
  phanChiaGiangVien: PhanChiaGiangVienDto[];
}

export interface HocVienTheoThangDto {
  nam: number;
  thang: number;
  soLuong: number;
}

export interface HocVienGanDayDto {
  idHocVien: string;
  hoTen?: string;
  anhDaiDien?: string;
  email?: string;
  giaDangKy?: number;
  thoiGianDK?: string;
  trangThai?: string;
  isDangKy?: boolean;
  ngayHetHan?: string;
}

export interface ThongKeHocVienDto {
  tongHocVien: number;
  hocVienMoi30Ngay: number;
  dangHoc: number;
  hetHan: number;
  hocVienTheoThang: HocVienTheoThangDto[];
  danhSachHocVien: HocVienGanDayDto[];
}

class ThongKeKhoaHocService {
  async GetDoanhThu(idKhoaHoc: string): Promise<ThongKeDoanhThuDto> {
    const res = await apiService.get(`/ThongKeKhoaHoc/${idKhoaHoc}/doanh-thu`);
    // res.data đã là ThongKeDoanhThuDto luôn, không cần .data nữa
    return res.data as ThongKeDoanhThuDto;
  }

  async GetHocVien(
    idKhoaHoc: string,
    nam?: number,
  ): Promise<ThongKeHocVienDto> {
    const params = nam ? `?nam=${nam}` : "";
    const res = await apiService.get(
      `/ThongKeKhoaHoc/${idKhoaHoc}/hoc-vien${params}`,
    );
    return res.data as ThongKeHocVienDto;
  }
}

export default new ThongKeKhoaHocService();
