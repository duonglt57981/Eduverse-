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
      const response = await apiService.get<ApiResponse<BaiGiangDto[]>>(
        `/BaiGiang/baigiang-getlistformanager/${idPhan}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching phan hoc for update:", error);
      throw error;
    }
  }

  async ChuyenTTDangSua(id: string): Promise<ApiResponse<BaiGiangType>> {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await apiService.post<ApiResponse<BaiGiangType>>(
        `/BaiGiang/baigiang-chuyentrangthai-dangsua`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error changing status to 'Đang sửa':", error);
      throw error;
    }
  }

  async ChuyenTTChoDuyet(id: string): Promise<ApiResponse<BaiGiangType>> {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await apiService.post<ApiResponse<BaiGiangType>>(
        `/BaiGiang/baigiang-chuyentrangthai-choduyet`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error changing status to 'Chờ duyệt':", error);
      throw error;
    }
  }

  async CreateBaiGiang(
    request: CreateBaiGiangRequest,
  ): Promise<ApiResponse<BaiGiangType>> {
    try {
      const response = await apiService.post<ApiResponse<BaiGiangType>>(
        "/BaiGiang/baigiang-create",
        request,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 1800000,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error creating bai giang:", error);
      throw error;
    }
  }

  async UpdateBaiGiang(
    request: UpdateBaiGiangRequest,
  ): Promise<ApiResponse<BaiGiangType>> {
    try {
      const response = await apiService.put<ApiResponse<BaiGiangType>>(
        "/BaiGiang/baigiang-update",
        request,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 1800000, // 5 phút cho file lớn
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating bai giang:", error);
      throw error;
    }
  }

  async DeleteBaiGiang(idBaiGiang: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `/BaiGiang/baigiang-delete/${idBaiGiang}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting bai giang:", error);
      throw error;
    }
  }
}
