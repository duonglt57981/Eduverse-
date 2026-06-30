import {
  GetToUpdateKhoaHoc,
  KhoaHocSearch,
  KhoaHocType,
} from "../types/khoaHoc/Dto/dto";
import {
  CreateKhoaHocRequest,
  UpdateKhoaHocRequest,
} from "../types/khoaHoc/Request/request";
import { ApiResponse, PagedList } from "../types/types";
import { apiService } from "./index";

export default class KhoaHocService {
  // lấy danh sách khi chưa đăng nhập
  async GetList(
    searchParams?: KhoaHocSearch,
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

      const response =
        await apiService.get<ApiResponse<PagedList<KhoaHocType>>>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching course list:", error);
      throw error;
    }
  }

  // lấy danh sách khi có user khóa học nào đã dăng kí kh hiện lại
  async GetListByUser(
    searchParams?: KhoaHocSearch,
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
      const response =
        await apiService.get<ApiResponse<PagedList<KhoaHocType>>>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching learning course by user:", error);
      throw error;
    }
  }

  async GetListDangKi(): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      const response = await apiService.get<
        ApiResponse<PagedList<KhoaHocType>>
      >(`/KhoaHoc/khoahoc-dangki`);
      return response.data;
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
      const response = await apiService.get<ApiResponse<KhoaHocType>>(
        `/KhoaHoc/khoahoc-preview/${idKhoaHoc}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching preview course:", error);
      throw error;
    }
  }

  async getLearningKhoaHoc(
    idDangKyKhoaHoc: string,
  ): Promise<ApiResponse<KhoaHocType>> {
    try {
      const response = await apiService.get<ApiResponse<KhoaHocType>>(
        `/KhoaHoc/khoahoc-learning/${idDangKyKhoaHoc}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching learning course:", error);
      throw error;
    }
  }

  async ChuyenTTDangSua(id: string): Promise<ApiResponse<KhoaHocType>> {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await apiService.post<ApiResponse<KhoaHocType>>(
        "/KhoaHoc/khoahoc-chuyentrangthai-dangsua",
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

  async ChuyenTTChoDuyet(id: string): Promise<ApiResponse<KhoaHocType>> {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await apiService.post<ApiResponse<KhoaHocType>>(
        "/KhoaHoc/khoahoc-chuyentrangthai-choduyet",
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

  //Lấy thông tin khóa học để cập nhật
  async GetToUpdateKhoaHoc(
    idKhoaHoc: string,
  ): Promise<ApiResponse<GetToUpdateKhoaHoc>> {
    try {
      const response = await apiService.get<ApiResponse<GetToUpdateKhoaHoc>>(
        `/KhoaHoc/khoahoc-get-toupdatekhoahoc/${idKhoaHoc}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course for update:", error);
      throw error;
    }
  }

  async GetListForManager(
    searchParams?: KhoaHocSearch,
  ): Promise<ApiResponse<PagedList<KhoaHocType>>> {
    try {
      // Tạo query string từ searchParams
      const params = new URLSearchParams();

      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const queryString = params.toString();
      const url = `/KhoaHoc/khoahoc-getlist-formanager${queryString ? `?${queryString}` : ""}`;

      const response =
        await apiService.get<ApiResponse<PagedList<KhoaHocType>>>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching course list for manager:", error);
      throw error;
    }
  }

  async CreateKhoaHoc(
    request: CreateKhoaHocRequest,
  ): Promise<ApiResponse<KhoaHocType>> {
    try {
      const response = await apiService.post<ApiResponse<KhoaHocType>>(
        "/KhoaHoc/khoahoc-create",
        request,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
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
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  }

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
