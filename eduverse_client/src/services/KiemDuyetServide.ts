import { apiService } from ".";
import { KhoaHocType } from "../types/khoaHoc/Dto/dto";
import {
  KhoaHocKiemDuyetListDto,
  KiemDuyetDetailDto,
  KiemDuyetKhoaHocDto,
  KiemDuyetSearchDto,
} from "../types/KiemDuyet/Dto/dto";
import { KiemDuyetKhoaHocRequest } from "../types/KiemDuyet/Request/request";
import { ApiResponse } from "../types/types";

export default class KiemDuyetService {
  async GetListKiemDuyetKhoaHoc(
    search: KiemDuyetSearchDto,
  ): Promise<ApiResponse<KhoaHocKiemDuyetListDto[]>> {
    try {
      const response = await apiService.get<
        ApiResponse<KhoaHocKiemDuyetListDto[]>
      >("/KiemDuyetKhoaHoc/kiemduyet-khoahoc-getdanhsach", {
        params: search,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async GetDetailKiemDuyetKhoaHoc(
    idKhoaHoc: string,
  ): Promise<ApiResponse<KiemDuyetDetailDto>> {
    try {
      const response = await apiService.get<KiemDuyetDetailDto>(
        `/KiemDuyetKhoaHoc/kiemduyet-khoahoc-getdetail/${idKhoaHoc}`,
      );

      return response;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async KiemDuyetKhoaHoc(
    request: KiemDuyetKhoaHocRequest,
  ): Promise<ApiResponse<KiemDuyetKhoaHocDto>> {
    try {
      const response = await apiService.post<ApiResponse<KiemDuyetKhoaHocDto>>(
        `KiemDuyetKhoaHoc/kiemduyet-khoahoc`,
        request,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async KiemDuyetBaiGiang(
    request: KiemDuyetKhoaHocRequest,
  ): Promise<ApiResponse<KiemDuyetKhoaHocDto>> {
    try {
      const response = await apiService.post<ApiResponse<KiemDuyetKhoaHocDto>>(
        `/KiemDuyetKhoaHoc/kiemduyet-baigiang`,
        request,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async KiemDuyetTaiLieu(
    request: KiemDuyetKhoaHocRequest,
  ): Promise<ApiResponse<KiemDuyetKhoaHocDto>> {
    try {
      const response = await apiService.post<ApiResponse<KiemDuyetKhoaHocDto>>(
        `/KiemDuyetKhoaHoc/kiemduyet-tailieu`,
        request,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async GetLichSuKiemDuyet(
    idKhoaHoc: string,
  ): Promise<ApiResponse<KiemDuyetDetailDto>> {
    try {
      const response = await apiService.get<ApiResponse<KiemDuyetDetailDto>>(
        `/KiemDuyetKhoaHoc/kiemduyet-khoahoc-getdetail/${idKhoaHoc}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }
}
