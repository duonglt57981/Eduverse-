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
    // TODO:
    // const response = await apiService.get<FavoriteCourse[]>("/DanhSachYeuThich/get-data");
    // return response;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: true,
          message: "Lấy danh sách yêu thích thành công",
          data: getLocalFavorites(),
        });
      }, 500);
    });
  },

  /**
   * POST /api/DanhSachYeuThich/them?khoaHocId={id}
   * Thêm khóa học vào danh sách yêu thích
   */
  async addFavorite(khoaHocId: string): Promise<ApiResponse<FavoriteCourse>> {
    // TODO:
    // const response = await apiService.post<FavoriteCourse>(`/DanhSachYeuThich/them?khoaHocId=${khoaHocId}`);
    // return response;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const course = MOCK_COURSES.find((c) => c.id === khoaHocId);
        if (!course) {
          return reject(new Error("Không tìm thấy khóa học"));
        }
        const current = getLocalFavorites();
        const exists = current.find((item) => item.khoaHocId === khoaHocId);
        if (exists) {
          return resolve({
            status: true,
            message: "Khóa học đã có trong danh sách yêu thích",
            data: exists,
          });
        }

        const favId = `fav-${Math.random().toString(36).substring(2, 11)}`;
        const newFavorite = mapToFavoriteCourse(course, favId);
        
        current.push(newFavorite);
        saveLocalFavorites(current);

        resolve({
          status: true,
          message: "Đã thêm vào danh sách yêu thích thành công",
          data: newFavorite,
        });
      }, 500);
    });
  },

  /**
   * DELETE /api/DanhSachYeuThich/xoa-theo-id/{id}
   * Xóa khóa học khỏi danh sách yêu thích
   */
  async removeFavorite(khoaHocId: string): Promise<ApiResponse<boolean>> {
    // TODO:
    // const response = await apiService.delete<boolean>(`/DanhSachYeuThich/xoa-theo-id/${khoaHocId}`);
    // return response;

    return new Promise((resolve) => {
      setTimeout(() => {
        const current = getLocalFavorites();
        // Supports removing either by course ID or by wishlist relation ID
        const updated = current.filter(
          (item) => item.khoaHocId !== khoaHocId && item.id !== khoaHocId
        );
        saveLocalFavorites(updated);

        resolve({
          status: true,
          message: "Đã xóa khỏi danh sách yêu thích thành công",
          data: true,
        });
      }, 500);
    });
  },
};
