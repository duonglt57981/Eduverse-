import { apiService } from ".";
import { BaiGiangType } from "../types/BaiGiang/Dto/BaiGiangDto";
import {
  CreateBaiGiangRequest,
  UpdateBaiGiangRequest,
} from "../types/BaiGiang/Request/BaiGiangRequest";
import { BaiGiangDto } from "../types/khoaHoc";
import { ApiResponse } from "../types/types";

export default class BaiGiangService {
  async GetListBaiGiangManager(
    idPhan: string,
  ): Promise<ApiResponse<BaiGiangDto[]>> {
    try {
      const response = await apiService.get<BaiGiangDto[]>(
        `/BaiGiang/baigiang-getlistformanager/${idPhan}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching phan hoc for update:", error);
      throw error;
    }
  }

  async CreateBaiGiang(
    request: CreateBaiGiangRequest,
  ): Promise<ApiResponse<BaiGiangType>> {
    try {
      const response = await apiService.post<BaiGiangType>(
        "/BaiGiang/baigiang-create",
        request,
        {
          timeout: 1800000,
        },
      );
      return response;
    } catch (error) {
      console.error("Error creating bai giang:", error);
      throw error;
    }
  }

  async UpdateBaiGiang(
    request: UpdateBaiGiangRequest,
  ): Promise<ApiResponse<BaiGiangType>> {
    try {
      const response = await apiService.put<BaiGiangType>(
        "/BaiGiang/baigiang-update",
        request,
        {
          timeout: 1800000, // 5 phút cho file lớn
        },
      );
      return response;
    } catch (error) {
      console.error("Error updating bai giang:", error);
      throw error;
    }
  }

  async DeleteBaiGiang(idBaiGiang: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<boolean>(
        `/BaiGiang/baigiang-delete/${idBaiGiang}`,
      );
      return response;
    } catch (error) {
      console.error("Error deleting bai giang:", error);
      throw error;
    }
  }
}
