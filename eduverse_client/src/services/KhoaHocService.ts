import { KhoaHocType } from "../types/khoaHoc/dto";
import { ApiResponse, PagedList } from "../types/types";
import { apiService } from "./index";

export default class KhoaHocService {
  async getLearningKhoaHoc(
    idDangKyKhoaHoc: string,
  ): Promise<ApiResponse<KhoaHocType>> {
    try {
      const response = await apiService.get<KhoaHocType>(
        `/KhoaHoc/get-learning/${idDangKyKhoaHoc}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching learning course:", error);
      throw error;
    }
  }

  async getmyKhoaHoc(isNguoiDung: string): Promise<KhoaHocType[]> {
    try {
      const response = await apiService.get<PagedList<KhoaHocType>>(
        `/KhoaHoc/get-khoahoc-dangki/${isNguoiDung}?pageIndex=1&pageSize=100`,
      );
      return response.data.items ?? [];
    } catch (error) {
      console.error("Error fetching my courses:", error);
      return [];
    }
  }
}
