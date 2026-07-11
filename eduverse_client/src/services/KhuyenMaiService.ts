// src/services/KhuyenMaiService.ts
import { ApiResponse } from "../types/types";
import { apiService } from "./index";
import { KhoaHocMiniDto } from "./KhoaHocService";

export interface KhuyenMaiDto {
  id: string;
  maGiamGia: string;
  phanTramGiam: number;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  soLuongHieuLuc?: number | null;
  createdDate: string;
  danhSachKhoaHoc?: KhoaHocMiniDto[];
}

export interface CreateKhuyenMaiRequest {
  maGiamGia: string;
  phanTramGiam: number;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  soLuongHieuLuc?: number | null;
  idsKhoaHoc: string[];
}

export interface UpdateKhuyenMaiRequest {
  id: string;
  maGiamGia: string;
  phanTramGiam: number;
  ngayBatDau?: string | null;
  ngayKetThuc?: string | null;
  soLuongHieuLuc?: number | null;
  idsKhoaHoc: string[];
}

export default class KhuyenMaiService {
  async GetListAll(): Promise<ApiResponse<KhuyenMaiDto[]>> {
    try {
      return await apiService.get<KhuyenMaiDto[]>(
        "/KhuyenMai/khuyenmai-getlistall",
      );
    } catch (error) {
      console.error("Error fetching promo list:", error);
      throw error;
    }
  }

  async CreateKhuyenMai(
    request: CreateKhuyenMaiRequest,
  ): Promise<ApiResponse<KhuyenMaiDto>> {
    try {
      return await apiService.post<KhuyenMaiDto>(
        "/KhuyenMai/khuyenmai-create",
        request,
      );
    } catch (error) {
      console.error("Error creating promo:", error);
      throw error;
    }
  }

  async UpdateKhuyenMai(
    request: UpdateKhuyenMaiRequest,
  ): Promise<ApiResponse<KhuyenMaiDto>> {
    try {
      return await apiService.put<KhuyenMaiDto>(
        "/KhuyenMai/khuyenmai-update",
        request,
      );
    } catch (error) {
      console.error("Error updating promo:", error);
      throw error;
    }
  }

  async DeleteKhuyenMai(id: string): Promise<ApiResponse<boolean>> {
    try {
      return await apiService.delete<boolean>(
        `/KhuyenMai/khuyenmai-delete/${id}`,
      );
    } catch (error) {
      console.error("Error deleting promo:", error);
      throw error;
    }
  }
}