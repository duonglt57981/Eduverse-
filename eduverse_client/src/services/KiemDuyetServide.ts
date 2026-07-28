import { apiService } from ".";
import { KhoaHocType } from "../types/khoaHoc/Dto/dto";
import {
  KhoaHocKiemDuyetListDto,
  KiemDuyetDetailDto,
  KiemDuyetKhoaHocDto,
  KiemDuyetSearchDto,
} from "../types/KiemDuyet/Dto/dto";
import { KiemDuyetKhoaHocRequest } from "../types/KiemDuyet/Request/request";
import { ApiResponse, PagedList } from "../types/types";

export default class KiemDuyetService {
  async GetListKiemDuyetKhoaHoc(
    search: KiemDuyetSearchDto,
  ): Promise<ApiResponse<PagedList<KhoaHocKiemDuyetListDto>>> {
    try {
      const response = await apiService.get<
        ApiResponse<PagedList<KhoaHocKiemDuyetListDto>>
      >("/KiemDuyetKhoaHoc/kiemduyet-khoahoc-getdanhsach", {
        params: search, // axios tự động chuyển object thành query string
      });

      return response.data; // response.data là ApiResponse
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

  async GetListLichSuKiemDuyet(
    search: KiemDuyetSearchDto,
  ): Promise<ApiResponse<PagedList<KhoaHocKiemDuyetListDto>>> {
    try {
      const response = await apiService.get<PagedList<KhoaHocKiemDuyetListDto>>(
        "/KiemDuyetKhoaHoc/kiemduyet-list-gethistory",
        {
          params: search, // axios tự động chuyển object thành query string
        },
      );

      return response; // response.data là ApiResponse
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async GetDetailLichSuKiemDuyet(
    idKhoaHoc: string,
  ): Promise<ApiResponse<KiemDuyetDetailDto>> {
    try {
      const response = await apiService.get<KiemDuyetDetailDto>(
        `/KiemDuyetKhoaHoc/kiemduyet-detail-gethistory/${idKhoaHoc}`,
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
