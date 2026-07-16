import { apiService } from ".";
import { TaiLieuType } from "../types/TaiLieu/Dto/TaiLieuDto";
import {
  CreateTaiLieuRequest,
  UpdateTaiLieuRequest,
} from "../types/TaiLieu/Request/TaiLieuRequest";
import { ApiResponse } from "../types/types";

export default class TaiLieuService {
  async GetListTaiLieuManager(
    idBaiGiang: string,
  ): Promise<ApiResponse<TaiLieuType[]>> {
    try {
      const response = await apiService.get<TaiLieuType[]>(
        `/TaiLieu/tailieu-getlistformanager/${idBaiGiang}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching phan hoc for update:", error);
      throw error;
    }
  }

  async CreateTaiLieu(
    request: CreateTaiLieuRequest,
  ): Promise<ApiResponse<TaiLieuType>> {
    try {
      const response = await apiService.post<ApiResponse<TaiLieuType>>(
        "/TaiLieu/tailieu-create",
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

  async UpdateTaiLieu(
    request: UpdateTaiLieuRequest,
  ): Promise<ApiResponse<TaiLieuType>> {
    try {
      const response = await apiService.post<ApiResponse<TaiLieuType>>(
        "/TaiLieu/tailieu-update",
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
        `/TaiLieu/tailieu-delete/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting tai lieu:", error);
      throw error;
    }
  }
}
