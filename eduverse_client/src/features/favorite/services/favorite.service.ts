/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/src/services";
import { ApiResponse } from "@/src/types/types";
import { FavoriteCourse } from "../types/favorite.type";

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
   * Lấy danh sách khóa học yêu thích và đồng bộ giá tiền chính xác từ hệ thống khóa học
   */
  async getFavorites(): Promise<ApiResponse<FavoriteCourse[]>> {
    const [favRes, courseRes] = await Promise.allSettled([
      apiService.get<any>("/DanhSachYeuThich/get-data?pageSize=-1"),
      apiService.get<any>("/KhoaHoc/khoahoc-list?pageSize=100"),
    ]);

    const favData: any = favRes.status === "fulfilled" ? favRes.value : null;
    const courseData: any = courseRes.status === "fulfilled" ? courseRes.value : null;

    const items = favData?.data?.items || favData?.items || [];
    const courseItems = courseData?.data?.items || courseData?.items || [];

    // Map course ID to real course details
    const courseMap = new Map<string, any>();
    if (Array.isArray(courseItems)) {
      courseItems.forEach((kh: any) => {
        if (kh.id) courseMap.set(String(kh.id), kh);
      });
    }

    const mapped: FavoriteCourse[] = items.map((item: any) => {
      const courseId = String(item.idKhoaHoc || item.khoaHocId || item.id || "");
      const matchedCourse = courseMap.get(courseId);

      // Determine accurate price: check backend item fields first, then matched course
      let realPrice: number = 0;
      if (typeof item.giaTien === "number" && item.giaTien > 0) {
        realPrice = item.giaTien;
      } else if (typeof item.gia === "number" && item.gia > 0) {
        realPrice = item.gia;
      } else if (matchedCourse && typeof matchedCourse.gia === "number") {
        realPrice = matchedCourse.gia;
      } else if (typeof item.giaTien === "number") {
        realPrice = item.giaTien;
      }

      return {
        id: item.id || courseId,
        khoaHocId: courseId,
        tieuDe: item.tenKhoaHoc || item.tieuDe || matchedCourse?.tieuDe || "Khóa học",
        moTa: item.moTa || matchedCourse?.moTa || "",
        hinhAnh:
          item.hinhAnh ||
          item.hinhAnhKhoaHoc ||
          matchedCourse?.hinhAnhKhoaHoc ||
          matchedCourse?.urlHinhAnh ||
          "",
        giangVien:
          item.giangVien ||
          item.tenGiangVien ||
          matchedCourse?.tenGiangVien ||
          matchedCourse?.createdBy ||
          "Giảng viên EduVerse",
        giaTien: realPrice,
        createdDate: item.createdDate || item.ngayTao || new Date().toISOString(),
        isFavorite: true,
      };
    });

    return {
      status: favData?.status ?? true,
      message: favData?.message ?? "",
      data: mapped,
    };
  },

  /**
   * POST /api/DanhSachYeuThich/them?khoaHocId={id}
   * Thêm khóa học vào danh sách yêu thích
   */
  async addFavorite(khoaHocId: string): Promise<ApiResponse<FavoriteCourse>> {
    const response = await apiService.post<any>(
      `/DanhSachYeuThich/them?khoaHocId=${khoaHocId}`,
    );
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
        isFavorite: true,
      },
    };
  },

  /**
   * DELETE /api/DanhSachYeuThich/xoa-theo-khoahoc/{id}
   * Xóa khóa học khỏi danh sách yêu thích
   */
  async removeFavorite(khoaHocId: string): Promise<ApiResponse<boolean>> {
    const response = await apiService.delete<any>(
      `/DanhSachYeuThich/xoa-theo-khoahoc/${khoaHocId}`,
    );
    return {
      status: response.status,
      message: response.message,
      data: response.status ?? false,
    };
  },
};
