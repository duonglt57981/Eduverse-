/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/src/services";
import { ApiResponse } from "@/src/types/types";
import { FavoriteCourse } from "../types/favorite.type";
import { MOCK_COURSES, mapToFavoriteCourse } from "../mock/favorite.mock";

const STORAGE_KEY = "eduverse_wishlist";

// Helper to get raw favorites from localStorage
const getLocalFavorites = (): FavoriteCourse[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveLocalFavorites = (favorites: FavoriteCourse[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
};

export const favoriteService = {
  /**
   * GET /api/DanhSachYeuThich/get-data
   * Lấy danh sách khóa học yêu thích
   */
  async getFavorites(): Promise<ApiResponse<FavoriteCourse[]>> {
    const response = await apiService.get<any>("/DanhSachYeuThich/get-data?pageSize=-1");
    const items = response.data?.items || [];
    const mapped: FavoriteCourse[] = items.map((item: any) => ({
      id: item.id,
      khoaHocId: item.idKhoaHoc,
      tieuDe: item.tenKhoaHoc || "",
      moTa: item.moTa || "",
      hinhAnh: item.hinhAnh || "",
      giangVien: item.giangVien || "Giảng viên EduVerse",
      giaTien: item.giaTien || 0,
      createdDate: item.createdDate,
      isFavorite: true
    }));
    return {
      status: response.status,
      message: response.message,
      data: mapped,
    };
  },

  /**
   * POST /api/DanhSachYeuThich/them?khoaHocId={id}
   * Thêm khóa học vào danh sách yêu thích
   */
  async addFavorite(khoaHocId: string): Promise<ApiResponse<FavoriteCourse>> {
    const response = await apiService.post<any>(`/DanhSachYeuThich/them?khoaHocId=${khoaHocId}`);
    return {
      status: response.status,
      message: response.message,
      data: {
        id: response.data?.id,
        khoaHocId: response.data?.idKhoaHoc || khoaHocId,
        tieuDe: "",
        moTa: "",
        hinhAnh: "",
        giangVien: "",
        giaTien: 0,
        createdDate: response.data?.createdDate || new Date().toISOString(),
        isFavorite: true
      }
    };
  },

  /**
   * DELETE /api/DanhSachYeuThich/xoa-theo-khoahoc/{id}
   * Xóa khóa học khỏi danh sách yêu thích
   */
  async removeFavorite(khoaHocId: string): Promise<ApiResponse<boolean>> {
    const response = await apiService.delete<any>(`/DanhSachYeuThich/xoa-theo-khoahoc/${khoaHocId}`);
    return {
      status: response.status,
      message: response.message,
      data: response.data
    };
  },
};
