import { apiService } from "./index";
import {
  DanhMucDto,
  CreateDanhMucRequest,
  UpdateDanhMucRequest,
  DanhMucSearch,
} from "@/src/types/danhmuc";
import { ApiResponse, PagedList } from "@/src/types/types";

export const danhMucService = {
  async getList(
    search?: DanhMucSearch,
  ): Promise<ApiResponse<PagedList<DanhMucDto>>> {
    const params = new URLSearchParams();
    if (search?.keyword) params.append("keyword", search.keyword);
    if (search?.pageIndex) params.append("pageIndex", String(search.pageIndex));
    if (search?.pageSize) params.append("pageSize", String(search.pageSize));

    const queryString = params.toString();
    const url = `/danhmuc${queryString ? `?${queryString}` : ""}`;
    return apiService.get<PagedList<DanhMucDto>>(url);
  },

  async getById(id: string): Promise<ApiResponse<DanhMucDto>> {
    return apiService.get<DanhMucDto>(`/danhmuc/${id}`);
  },

  async create(data: CreateDanhMucRequest): Promise<ApiResponse<DanhMucDto>> {
    return apiService.post<DanhMucDto>("/danhmuc", data);
  },

  async update(data: UpdateDanhMucRequest): Promise<ApiResponse<DanhMucDto>> {
    return apiService.put<DanhMucDto>("/danhmuc", data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiService.delete<boolean>(`/danhmuc/${id}`);
  },

  async getAllForSidebar(): Promise<ApiResponse<DanhMucDto[]>> {
    return apiService.get<DanhMucDto[]>("/danhmuc");
  },
};
