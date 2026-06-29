import { apiService } from ".";
import {
  GetToUpdatePhanDto,
  PhanHocType,
} from "../types/PhanHoc/Dto/PhanHocdto";
import {
  CreatePhanRequest,
  UpdatePhanRequest,
} from "../types/PhanHoc/Request/PhanRequest";
import { ApiResponse } from "../types/types";

export default class PhanService {
  // 1. Lấy thông tin phần học để cập nhật
  async GetToUpdatePhan(
    idPhan: string,
  ): Promise<ApiResponse<GetToUpdatePhanDto>> {
    try {
      const response = await apiService.get<ApiResponse<GetToUpdatePhanDto>>(
        `/KhoaHoc/phanhoc-get-toupdate/${idPhan}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching phan hoc for update:", error);
      throw error;
    }
  }

  async CreatePhanHoc(
    request: CreatePhanRequest,
  ): Promise<ApiResponse<PhanHocType>> {
    try {
      const response = await apiService.post<ApiResponse<PhanHocType>>(
        "/KhoaHoc/phanhoc",
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating phan hoc:", error);
      throw error;
    }
  }

  async UpdatePhanHoc(
    request: UpdatePhanRequest,
  ): Promise<ApiResponse<PhanHocType>> {
    try {
      const response = await apiService.put<ApiResponse<PhanHocType>>(
        `/KhoaHoc/phanhoc/${request.id}`,
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating phan hoc:", error);
      throw error;
    }
  }

  async DeletePhanHoc(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `/KhoaHoc/phanhoc/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting phan hoc:", error);
      throw error;
    }
  }
}
