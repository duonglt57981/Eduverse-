import { apiService } from ".";

export interface GuiLoiMoiRequest {
  idKhoaHoc: string;
  email: string;
  visible: boolean;
  tyLeChiaDoanhThu: number;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
}

export interface CapNhatQuyenRequest {
  visible: boolean;
  tyLeChiaDoanhThu: number;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
}

export interface GiangVienCongTacDto {
  idGiangVien: string;
  hoTen?: string;
  anhDaiDien?: string;
  email?: string;
  laChuSoHuu: boolean;
  visible: boolean;
  tyLeChiaDoanhThu: number;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
}

export interface LoiMoiGiangVienDto {
  id: string;
  idKhoaHoc: string;
  emailDuocMoi?: string;
  trangThai?: string;
  visible: boolean;
  tyLeChiaDoanhThu: number;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
  ngayMoi: string;
  ngayPhanHoi?: string;
}

export interface LoiMoiChoXacNhanDto {
  id: string;
  idKhoaHoc: string;
  tenKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  tenNguoiMoi?: string;
  anhNguoiMoi?: string;
  trangThai: string;
  visible: boolean;
  tyLeChiaDoanhThu: number;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
  ngayMoi: string;
}
export interface LoiMoiDangChoDto {
  idLoiMoi: string;
  emailDuocMoi?: string;
  hoTenDuocMoi?: string;
  anhDaiDienDuocMoi?: string;
  visible: boolean;
  tyLeChiaDoanhThu: number;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
  ngayMoi: string;
}

export interface DanhSachGiangVienDto {
  danhSachCongTac: GiangVienCongTacDto[];
  danhSachDangMoi: LoiMoiDangChoDto[];
}

class LoiMoiGiangVienService {
  async GuiLoiMoi(request: GuiLoiMoiRequest) {
    const res = await apiService.post("/LoiMoiGiangVien/gui-loi-moi", request);
    return res.data;
  }

  async PhanHoi(idLoiMoi: string, dongY: boolean) {
    const res = await apiService.post(
      `/LoiMoiGiangVien/${idLoiMoi}/phan-hoi?dongY=${dongY}`,
    );
    return res.data;
  }

  async CapNhatQuyen(idLoiMoi: string, request: CapNhatQuyenRequest) {
    const res = await apiService.put(
      `/LoiMoiGiangVien/${idLoiMoi}/cap-nhat-quyen`,
      request,
    );
    return res.data;
  }

  async HuyLoiMoi(idLoiMoi: string) {
    const res = await apiService.delete(`/LoiMoiGiangVien/${idLoiMoi}/huy`);
    return res.data;
  }

  async GetLoiMoiCuaToi(): Promise<LoiMoiChoXacNhanDto[]> {
    const res = await apiService.get<LoiMoiChoXacNhanDto[]>(
      "/LoiMoiGiangVien/cua-toi",
    );

    return res.data;
  }

  async GetDanhSachGiangVien(idKhoaHoc: string): Promise<DanhSachGiangVienDto> {
    const res = await apiService.get<DanhSachGiangVienDto>(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/danh-sach`,
    );
    return res.data;
  }
  async CapNhatQuyenTheoGiangVien(
    idKhoaHoc: string,
    idGiangVien: string,
    request: CapNhatQuyenRequest,
  ) {
    const res = await apiService.put(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/giang-vien/${idGiangVien}/cap-nhat-quyen`,
      request,
    );
    return res.data;
  }

  async HuyTheoGiangVien(idKhoaHoc: string, idGiangVien: string) {
    const res = await apiService.delete(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/giang-vien/${idGiangVien}/huy`,
    );
    return res.data;
  }
}

export default new LoiMoiGiangVienService();
