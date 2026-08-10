/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from ".";

export interface PhanHoiDanhGiaDto {
  id: string;
  noiDung: string;
  ngayTao: string;
  hoTenGV?: string;
  anhGV?: string;
}

export interface DanhGiaDto {
  id: string;
  soSao: number;
  noiDung?: string;
  ngayTao: string;
  idNguoiDung?: string;
  hoTenNguoiDung?: string;
  anhNguoiDung?: string;
  phanHoi?: PhanHoiDanhGiaDto;
}

export interface DanhGiaKhoaHocDto {
  tongSoDanhGia: number;
  diemTrungBinh: number;
  phanBoSao: Record<number, number>;
  danhSach: DanhGiaDto[];
}

class DanhGiaService {
  async GetByKhoaHoc(idKhoaHoc: string): Promise<DanhGiaKhoaHocDto> {
    const res = await apiService.get(`/danhgia/khoa-hoc/${idKhoaHoc}`);
    const raw = res.data as any;
    return raw?.data ?? raw;
  }

  async PhanHoi(idDanhGia: string, noiDung: string): Promise<void> {
    await apiService.post("/danhgia/phan-hoi", { idDanhGia, noiDung });
  }

  async SuaPhanHoi(idPhanHoi: string, noiDung: string): Promise<void> {
    await apiService.put(`/danhgia/phan-hoi/${idPhanHoi}`, noiDung);
  }

  async XoaPhanHoi(idPhanHoi: string): Promise<void> {
    await apiService.delete(`/danhgia/phan-hoi/${idPhanHoi}`);
  }
}

export default new DanhGiaService();
