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

export interface QuyenCuaToiDto {
  laChuSoHuu: boolean;
  visible: boolean;
  manage: boolean;
  performance: boolean;
  qnA: boolean;
  reviews: boolean;
  assignments: boolean;
  materials: boolean;
  promotions: boolean;
}

export interface LichSuNhanTheoDonDto {
  idDonHang: string;
  tyLeChiaDoanhThu: number;
  giaLucDat: number;
  soTienGiam: number;
  soTienNhan: number;
  ngayGhiNhan: string;
}

export interface LichSuThayDoiTyLeDto {
  tyLeCu: number;
  tyLeMoi: number;
  ngayThayDoi: string;
}

export interface DanhSachGiangVienDto {
  danhSachCongTac: GiangVienCongTacDto[];
  danhSachDangMoi: LoiMoiDangChoDto[];
}

export interface CapNhatQuyenHangLoatItem extends CapNhatQuyenRequest {
  idGiangVien: string;
}

export interface CapNhatQuyenHangLoatRequest {
  danhSach: CapNhatQuyenHangLoatItem[];
}

// ── MỚI: lời mời "xin áp dụng khuyến mãi" (Admin -> giảng viên sở hữu) ──
export interface LoiMoiKhuyenMaiChoXacNhanDto {
  id: string;
  idKhuyenMai: string;
  maGiamGia?: string;
  phanTramGiam?: number;
  ngayBatDauKM?: string;
  ngayKetThucKM?: string;
  idKhoaHoc: string;
  tenKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  tenNguoiMoi?: string;
  anhNguoiMoi?: string;
  trangThai: "Pending" | "Accepted" | "Rejected";
  ngayMoi: string;
}

export interface LoiMoiApDungKhuyenMaiDto {
  idLoiMoi?: string;
  idKhoaHoc: string;
  tenKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  idGiangVienDuocMoi?: string;
  tenGiangVien?: string;
  trangThai: string;
  ngayMoi?: string;
  ngayPhanHoi?: string;
}
export interface KhoaHocEduverseDealsDto {
  id: string;
  tieuDe: string;
  hinhAnhKhoaHoc?: string;
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

  async CapNhatQuyenHangLoat(
    idKhoaHoc: string,
    request: CapNhatQuyenHangLoatRequest,
  ) {
    const res = await apiService.put(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/cap-nhat-quyen-hang-loat`,
      request,
    );
    return res.data;
  }

  async GetLichSuDonHang(
    idKhoaHoc: string,
    idGiangVien: string,
  ): Promise<LichSuNhanTheoDonDto[]> {
    const res = await apiService.get<LichSuNhanTheoDonDto[]>(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/giang-vien/${idGiangVien}/lich-su-don-hang`,
    );
    return res.data;
  }

  async GetLichSuTyLe(
    idKhoaHoc: string,
    idGiangVien: string,
  ): Promise<LichSuThayDoiTyLeDto[]> {
    const res = await apiService.get<LichSuThayDoiTyLeDto[]>(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/giang-vien/${idGiangVien}/lich-su-ty-le`,
    );
    return res.data;
  }

  async GetQuyenCuaToi(idKhoaHoc: string): Promise<QuyenCuaToiDto> {
    const res = await apiService.get<QuyenCuaToiDto>(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/quyen-cua-toi`,
    );
    return res.data;
  }

  // ── MỚI: lời mời xin áp dụng khuyến mãi ─────────────────────────────
  // Lưu ý: 2 endpoint này ở Controller dùng return Ok(...) trực tiếp,
  // KHÔNG bọc trong DataResponse<T> như các endpoint còn lại — nên
  // res.data ở đây CHÍNH LÀ mảng/kết quả, không phải res.data.data.
  async GetLoiMoiKhuyenMaiCuaToi(): Promise<LoiMoiKhuyenMaiChoXacNhanDto[]> {
    const res = await apiService.get<LoiMoiKhuyenMaiChoXacNhanDto[]>(
      "/LoiMoiGiangVien/loimoi-khuyenmai-cuatoi",
    );
    return res.data ?? [];
  }

  async PhanHoiKhuyenMai(idLoiMoi: string, dongY: boolean) {
    const res = await apiService.post(
      `/LoiMoiGiangVien/loimoi-khuyenmai-phanhoi/${idLoiMoi}?dongY=${dongY}`,
    );
    return res.data;
  }
  async GetTrangThaiEduverseDeals(idKhoaHoc: string): Promise<boolean> {
    const res = await apiService.get<boolean>(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/eduverse-deals`,
    );
    return res.data ?? false;
  }

  async ThamGiaEduverseDeals(idKhoaHoc: string) {
    const res = await apiService.post(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/eduverse-deals/tham-gia`,
    );
    return res.data;
  }

  async HuyEduverseDeals(idKhoaHoc: string) {
    const res = await apiService.post(
      `/LoiMoiGiangVien/khoa-hoc/${idKhoaHoc}/eduverse-deals/huy`,
    );
    return res.data;
  }

  async GetKhoaHocEduverseDeals(): Promise<KhoaHocEduverseDealsDto[]> {
    const res = await apiService.get<KhoaHocEduverseDealsDto[]>(
      "/LoiMoiGiangVien/khoa-hoc/eduverse-deals/danh-sach",
    );
    return res.data ?? [];
  }
}

export default new LoiMoiGiangVienService();
