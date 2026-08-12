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
  idDangKy?: string; // MỚI
  hoTen?: string;
  anhDaiDien?: string;
  email?: string;
  giaDangKy?: number;
  thoiGianDK?: string;
  trangThai?: string;
  isDangKy?: boolean;
  ngayHetHan?: string;
  phanTramHoanThanh?: number;
}

export interface ThongKeHocVienDto {
  tongHocVien: number;
  hocVienMoi30Ngay: number;
  dangHoc: number;
  hetHan: number;
  hocVienTheoThang: HocVienTheoThangDto[];
  danhSachHocVien: HocVienGanDayDto[];
}

export interface BaiGiangEngagementDto {
  idBaiGiang: string;
  tenBaiGiang?: string;
  thuTu: number;
  luotXem: number;
  tyLeHoanThanh: number;
}

export interface CourseEngagementDto {
  hocVienDaDangKy: number;
  hocVienDaBatDauHoc: number;
  tongThoiGianHocGio: number;
  luotXemBaiGiang: number;
  tyLeHoanThanhTrungBinh: number;
  hocVienDangHoatDong: number;
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

  async GetBaiGiang(idKhoaHoc: string): Promise<BaiGiangEngagementDto[]> {
    const res = await apiService.get(`/ThongKeKhoaHoc/${idKhoaHoc}/bai-giang`);
    return res.data as BaiGiangEngagementDto[];
  }

  async GetEngagement(idKhoaHoc: string): Promise<CourseEngagementDto> {
    const res = await apiService.get(`/ThongKeKhoaHoc/${idKhoaHoc}/engagement`);
    return res.data as CourseEngagementDto;
  }
}

export default new ThongKeKhoaHocService();
