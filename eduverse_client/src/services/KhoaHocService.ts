import { KhoaHocType } from "../types/khoaHoc/Dto/dto";
import { ApiResponse, PagedList } from "../types/types";
import { apiService } from "./index";

export default class KhoaHocService {
  async getLearningKhoaHoc(
    idDangKyKhoaHoc: string,
  ): Promise<ApiResponse<KhoaHocType>> {
    try {
      const response = await apiService.get<KhoaHocType>(
        `/KhoaHoc/khoahoc-learning/${idDangKyKhoaHoc}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching learning course:", error);
      throw error;
    }
  }

  async getmyKhoaHoc(): Promise<KhoaHocType[]> {
    try {
      const response = await apiService.get<PagedList<KhoaHocType>>(
        `/KhoaHoc/khoahoc-dangki`,
      );
      return response.data.items ?? [];
    } catch (error) {
      console.error("Error fetching my courses:", error);
      return [];
    }
  }
}
