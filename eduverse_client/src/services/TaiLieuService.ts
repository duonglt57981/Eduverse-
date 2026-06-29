import { apiService } from ".";
import { TaiLieuType } from "../types/TaiLieu/Dto/TaiLieuDto";
import { CreateTaiLieuRequest } from "../types/TaiLieu/Request/TaiLieuRequest";
import { ApiResponse } from "../types/types";

export default class TaiLieuService {
  async CreateTaiLieu(
    request: CreateTaiLieuRequest,
  ): Promise<ApiResponse<TaiLieuType>> {
    try {
      const response = await apiService.post<ApiResponse<TaiLieuType>>(
        "/KhoaHoc/tailieu",
        request,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating tai lieu:", error);
      throw error;
    }
  }

  async DeleteTaiLieu(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `/KhoaHoc/tailieu/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting tai lieu:", error);
      throw error;
    }
  }
}
