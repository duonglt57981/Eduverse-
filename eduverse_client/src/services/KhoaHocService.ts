import {
  GetToUpdateKhoaHoc,
  GiangVienKhoaHocDto,
  KhoaHocDangKiSearch,
  KhoaHocDraftResultType,
  KhoaHocManagerSearch,
  KhoaHocSearch,
  KhoaHocType,
} from "../types/khoaHoc/Dto/dto";
import {
  CreateKhoaHocRequest,
  UpdateKhoaHocRequest,
} from "../types/khoaHoc/Request/request";
import { ApiResponse, PagedList } from "../types/types";
import { apiService } from "./index";

export interface KhoaHocMiniDto {
  id: string;
  tieuDe: string;
  hinhAnhKhoaHoc?: string | null;
}

export default class KhoaHocService {
  // lấy danh sách khi chưa đăng nhập
  async GetList(
    searchParams?: KhoaHocSearch,
    signal?: AbortSignal,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      const params = new URLSearchParams();
      if (searchParams) {
        Object.keys(searchParams).forEach((key) => {
          const value = searchParams[key as keyof KhoaHocSearch];
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = `/KhoaHoc/khoahoc-list${queryString ? `?${queryString}` : ""}`;

      const response = await apiService.get<PagedList<KhoaHocType>>(url, {
        signal,
      });
      return response;
    } catch (error) {
      console.error("Error fetching course list:", error);
      throw error;
    }
  }

  // lấy danh sách khi có user khóa học nào đã dăng kí kh hiện lại
  async GetListByUser(
    searchParams?: KhoaHocSearch,
    signal?: AbortSignal,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      const userId = this.getUserIdFromToken();
      const params = new URLSearchParams();
      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString();
      const url = `/KhoaHoc/khoahoc-by/${userId}${queryString ? `?${queryString}` : ""}`;
      const response = await apiService.get<PagedList<KhoaHocType>>(url);
      return response;
    } catch (error) {
      console.error("Error fetching learning course by user:", error);
      throw error;
    }
  }

  async SearchWithElasticsearch(
    searchParams: KhoaHocSearch,
    signal?: AbortSignal,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    return await apiService.get<PagedList<KhoaHocType>>(
      `/KhoaHoc/search-elasticsearch?${params.toString()}`,
      { signal },
    );
  }

  async GetListDangKi(
    search: KhoaHocDangKiSearch,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      let url = `/KhoaHoc/khoahoc-dangki`;

      const params = new URLSearchParams();

      if (search?.keyword?.trim())
        params.append("keyword", search.keyword.trim());
      if (search?.sapXepNgay) params.append("sapXepNgay", search.sapXepNgay);
      else if (search?.sapXepTen) params.append("sapXepTen", search.sapXepTen);

      // pageIndex: mặc định trang 1 nếu không truyền hoặc không hợp lệ
      const pageIndex =
        search?.pageIndex !== undefined && search.pageIndex > 0
          ? search.pageIndex
          : 1;
      params.append("pageIndex", String(pageIndex));

      // pageSize: luôn mặc định = 10 nếu không truyền hoặc không hợp lệ
      const pageSize =
        search?.pageSize !== undefined && search.pageSize > 0
          ? search.pageSize
          : 10;
      params.append("pageSize", String(pageSize));

      const qs = params.toString();
      if (qs) url += "?" + qs;

      const response = await apiService.get<PagedList<KhoaHocType>>(url);

      return response;
    } catch (error) {
      console.error("Error fetching learning course:", error);
      throw error;
    }
  }

  async GetKhoaHocPreview(
    idKhoaHoc?: string,
  ): Promise<ApiResponse<KhoaHocType>> {
    if (!idKhoaHoc) {
      throw new Error("idKhoaHoc is required.");
    }

    try {
      const response = await apiService.get<KhoaHocType>(
        `/KhoaHoc/khoahoc-preview/${idKhoaHoc}`,
      );

      return response;
    } catch (error) {
      console.error("Error fetching preview course:", error);
      throw error;
    }
  }

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

  async ChuyenTTChoDuyetBatch(
    idKhoaHoc: string,
  ): Promise<ApiResponse<KhoaHocType[]>> {
    try {
      const response = await apiService.post<KhoaHocType[]>(
        `/KhoaHoc/khoahoc-chuyentrangthai-choduyet-batch/${idKhoaHoc}`,
      );
      return response;
    } catch (error) {
      console.error("Error batch changing status to 'Chờ duyệt':", error);
      throw error;
    }
  }

  async ChuyenTTDangSuaBatch(
    ids: string[],
  ): Promise<ApiResponse<KhoaHocType[]>> {
    try {
      const response = await apiService.post<KhoaHocType[]>(
        `/KhoaHoc/khoahoc-chuyentrangthai-dangsua-batch`,
        {
          ids,
        },
      );
      return response;
    } catch (error) {
      console.error("Error batch changing status to 'Đang sửa':", error);
      throw error;
    }
  }

  //Lấy thông tin khóa học để cập nhật
  async GetToUpdateKhoaHoc(idKhoaHoc: string): Promise<GetToUpdateKhoaHoc> {
    try {
      const response = await apiService.get<GetToUpdateKhoaHoc>(
        `/KhoaHoc/khoahoc-get-toupdatekhoahoc/${idKhoaHoc}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course for update:", error);
      throw error;
    }
  }

  async GetListForManager(
    searchParams?: KhoaHocManagerSearch,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      // Xây dựng query string thủ công để kiểm soát
      const params = new URLSearchParams();

      if (searchParams) {
        if (
          searchParams.pageIndex !== undefined &&
          searchParams.pageIndex !== null
        ) {
          params.append("pageIndex", searchParams.pageIndex.toString());
        }
        if (
          searchParams.pageSize !== undefined &&
          searchParams.pageSize !== null
        ) {
          params.append("pageSize", searchParams.pageSize.toString());
        }

        // Keyword
        if (searchParams.keyword) {
          params.append("keyword", searchParams.keyword);
        }

        // Trạng thái: nếu là "TatCa" thì không gửi (hoặc gửi undefined)
        if (searchParams.trangThai && searchParams.trangThai !== "TatCa") {
          params.append("trangThai", searchParams.trangThai);
        }

        // Sắp xếp ngày
        if (searchParams.sapXepNgay) {
          params.append("sapXepNgay", searchParams.sapXepNgay);
        }

        // Sắp xếp tên
        if (searchParams.sapXepTen) {
          params.append("sapXepTen", searchParams.sapXepTen);
        }

        // Sắp xếp học viên
        if (
          searchParams.sapXepHocVienNhieuNhat !== undefined &&
          searchParams.sapXepHocVienNhieuNhat !== null
        ) {
          params.append(
            "sapXepHocVienNhieuNhat",
            searchParams.sapXepHocVienNhieuNhat.toString(),
          );
        }
      }

      const queryString = params.toString();
      const url = `/KhoaHoc/khoahoc-getlistformanager${queryString ? `?${queryString}` : ""}`;
      console.log("URL:", url); // Kiểm tra URL

      const response = await apiService.get<PagedList<KhoaHocType>>(url);
      return response;
    } catch (error) {
      console.error("Error fetching course list for manager:", error);
      throw error;
    }
  }

  async GetListByGiangVien(
    userId: string,
    search: KhoaHocManagerSearch = { pageIndex: 1, pageSize: 10 },
  ): Promise<ApiResponse<GiangVienKhoaHocDto>> {
    try {
      return await apiService.get<GiangVienKhoaHocDto>(
        `/KhoaHoc/khoahoc-list-bygiangvien/${userId}`,
        {
          params: {
            pageIndex: search.pageIndex ?? 1,
            pageSize: search.pageSize ?? 20,
          },
        },
      );
    } catch (error) {
      console.error("Error getting course list by giang vien:", error);
      throw error;
    }
  }

  async GetListByDanhMuc(
    idKhoaHoc: string,
    search: KhoaHocManagerSearch = { pageIndex: 1, pageSize: 10 },
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      return await apiService.get<PagedList<KhoaHocType>>(
        "/KhoaHoc/khoahoc-getlistformanager",
        {
          params: {
            idKhoaHoc: idKhoaHoc,
            pageIndex: search.pageIndex ?? 1,
            pageSize: search.pageSize ?? 10,
          },
        },
      );
    } catch (error) {
      console.error("Error getting course list by danh muc:", error);
      throw error;
    }
  }

  async GetListKhoaHocPhatHanh(
    searchParams?: KhoaHocManagerSearch,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      // Xây dựng query string thủ công để kiểm soát
      const params = new URLSearchParams();

      if (searchParams) {
        if (
          searchParams.pageIndex !== undefined &&
          searchParams.pageIndex !== null
        ) {
          params.append("pageIndex", searchParams.pageIndex.toString());
        }
        if (
          searchParams.pageSize !== undefined &&
          searchParams.pageSize !== null
        ) {
          params.append("pageSize", searchParams.pageSize.toString());
        }

        // Keyword
        if (searchParams.keyword) {
          params.append("keyword", searchParams.keyword);
        }
      }

      const queryString = params.toString();
      const url = `/KhoaHoc/khoahoc-list-phathanh/${queryString ? `?${queryString}` : ""}`;
      console.log("URL:", url); // Kiểm tra URL

      const response = await apiService.get<PagedList<KhoaHocType>>(url);
      return response;
    } catch (error) {
      console.error("Error fetching course list for manager:", error);
      throw error;
    }
  }

  async CreateKhoaHoc(
    request: CreateKhoaHocRequest,
  ): Promise<ApiResponse<KhoaHocType>> {
    try {
      const response = await apiService.post<KhoaHocType>(
        "/KhoaHoc/khoahoc-create",
        request,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  async UpdateKhoaHoc(
    request: UpdateKhoaHocRequest,
  ): Promise<ApiResponse<KhoaHocType>> {
    try {
      const response = await apiService.put<ApiResponse<KhoaHocType>>(
        "/KhoaHoc/khoahoc-put",
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  }

  createFullKhoaHocDraft = async (
    idKhoaHoc: string,
  ): Promise<ApiResponse<KhoaHocDraftResultType>> => {
    const response = await apiService.post<ApiResponse<KhoaHocDraftResultType>>(
      `/KhoaHoc/createfullkhoahocdraft/${idKhoaHoc}`,
    );

    return response.data;
  };

  async DeleteKhoaHoc(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `/KhoaHoc/khoahoc-delete/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  }
  async GetApprovedListForSelect(): Promise<ApiResponse<KhoaHocMiniDto[]>> {
    try {
      return await apiService.get<KhoaHocMiniDto[]>(
        "/KhoaHoc/khoahoc-getlist-daduyet",
      );
    } catch (error) {
      console.error("Error fetching approved courses:", error);
      throw error;
    }
  }

  async GetSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiService.get<string[]>(
        `/KhoaHoc/autocomplete?query=${encodeURIComponent(query)}`,
      );
      return response;
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      throw error;
    }
  }

  async SyncElasticsearch(): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.post<string>(
        `/KhoaHoc/sync-elasticsearch`,
      );
      return response;
    } catch (error) {
      console.error("Error syncing elasticsearch:", error);
      throw error;
    }
  }

  private getUserIdFromToken(): string {
    const userStr = localStorage.getItem("AccessToken");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) return user.id;
        if (user.userId) return user.userId;
        if (user.sub) return user.sub;
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    throw new Error("User not authenticated - No userId found");
  }
}
