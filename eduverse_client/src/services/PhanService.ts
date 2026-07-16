import { apiService } from ".";
import { PhanDto } from "../types/khoaHoc";
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
        `/Phanhoc/phanhoc-get-toupdate/${idPhan}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching phan hoc for update:", error);
      throw error;
    }
  }

  async GetListPhanManager(idKhoaHoc: string): Promise<ApiResponse<PhanDto[]>> {
    try {
      const response = await apiService.get<PhanDto[]>(
        `/PhanHoc/phanhoc-getlistformanager/${idKhoaHoc}`,
      );
      return response;
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
        "/PhanHoc/phanhoc-create",
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
        `/PhanHoc/phanhoc-update`,
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
        `/PhanHoc/phanhoc-delete/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting phan hoc:", error);
      throw error;
    }
  }
}
