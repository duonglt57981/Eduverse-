/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from ".";
import {
  KhoaHocKiemDuyetListDto,
  KiemDuyetDetailDto,
  KiemDuyetKhoaHocDto,
  KiemDuyetSearchDto,
  LyDoTuChoiDto,
  LyDoTuChoiRequest,
  NhanVienPheDuyetDto,
  NhanVienSearch,
  PhanCongKiemDuyetResultDto,
} from "../types/KiemDuyet/Dto/dto";
import { KiemDuyetKhoaHocRequest } from "../types/KiemDuyet/Request/request";
import { ApiResponse, PagedList } from "../types/types";

export default class KiemDuyetService {
  async GetListKiemDuyetKhoaHoc(
    search: KiemDuyetSearchDto,
  ): Promise<ApiResponse<PagedList<KhoaHocKiemDuyetListDto>>> {
    try {
      const response = await apiService.get<PagedList<KhoaHocKiemDuyetListDto>>(
        "/KiemDuyetKhoaHoc/kiemduyet-khoahoc-getdanhsach",
        {
          params: search,
        },
      );

      return response;
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

      return response;
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

  async GetDanhSachNhanVien(
    search: NhanVienSearch,
  ): Promise<ApiResponse<PagedList<NhanVienPheDuyetDto>>> {
    try {
      // Xây dựng query params từ search object
      const params = new URLSearchParams();

      if (search.keyword) {
        params.append("keyword", search.keyword);
      }
      if (search.chuaCoKhoaHoc !== undefined && search.chuaCoKhoaHoc !== null) {
        params.append("chuaCoKhoaHoc", String(search.chuaCoKhoaHoc));
      }
      if (search.sapXepTheoSoLuongKhoaHoc) {
        params.append(
          "SapXepTheoSoLuongKhoaHoc",
          search.sapXepTheoSoLuongKhoaHoc,
        );
      }
      if (search.pageIndex) {
        params.append("pageIndex", String(search.pageIndex));
      }
      if (search.pageSize) {
        params.append("pageSize", String(search.pageSize));
      }

      const queryString = params.toString();
      const url = `/KiemDuyetKhoaHoc/kiemduyet-list-nhanvienkiemduyet${queryString ? `?${queryString}` : ""}`;

      const response =
        await apiService.get<PagedList<NhanVienPheDuyetDto>>(url);
      return response;
    } catch (error: any) {
      return {
        status: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không có quyền truy cập",
        data: null,
      } as any;
    }
  }

  async PhanKhoaHocKiemDuyet(
    khoaHocs: string[],
    userId: string,
  ): Promise<ApiResponse<PhanCongKiemDuyetResultDto>> {
    try {
      const response = await apiService.put<PhanCongKiemDuyetResultDto>(
        `/KiemDuyetKhoaHoc/kiemduyet-phankhoahoc/${userId}`,
        khoaHocs,
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
      const response = await apiService.post<KiemDuyetKhoaHocDto>(
        `KiemDuyetKhoaHoc/kiemduyet-khoahoc`,
        request,
      );

      return response;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async GetLichSuKiemDuyet(
    idKhoaHoc: string,
  ): Promise<ApiResponse<KiemDuyetDetailDto>> {
    try {
      // FIX: cùng lỗi double-unwrap như GetListKiemDuyetKhoaHoc ở trên.
      const response = await apiService.get<KiemDuyetDetailDto>(
        `/KiemDuyetKhoaHoc/kiemduyet-khoahoc-getdetail/${idKhoaHoc}`,
      );

      return response;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async UpdateLyDoTuChoi(
    request: LyDoTuChoiRequest,
  ): Promise<ApiResponse<LyDoTuChoiDto>> {
    try {
      const response = await apiService.put<LyDoTuChoiDto>(
        `/KiemDuyetKhoaHoc/kiemduyet-updatelydo`,
        request,
      );

      return response;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }

  async CreateLyDoTuChoi(
    request: LyDoTuChoiRequest,
  ): Promise<ApiResponse<LyDoTuChoiDto>> {
    try {
      const response = await apiService.post<LyDoTuChoiDto>(
        `/KiemDuyetKhoaHoc/kiemduyet-createlydo`,
        request,
      );

      return response;
    } catch (error) {
      console.error("Error fetching course approval list:", error);
      throw error;
    }
  }
}
