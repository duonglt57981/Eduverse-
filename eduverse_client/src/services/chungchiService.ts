import { apiService } from "./index";
import {
  ChungChiDto,
  CreateChungChiRequest,
  UpdateChungChiRequest,
  ChungChiSearch,
} from "@/src/types/chungchi";
import { ApiResponse, PagedList } from "@/src/types/types";

// TODO: Backend API endpoints for ChungChi are not implemented yet
// This service assumes the following API endpoints exist:
// - GET /api/chungchi - Get list with pagination
// - GET /api/chungchi/{id} - Get by ID
// - POST /api/chungchi - Create new
// - PUT /api/chungchi - Update
// - DELETE /api/chungchi/{id} - Delete

export const chungChiService = {
  async getList(
    search?: ChungChiSearch
  ): Promise<ApiResponse<PagedList<ChungChiDto>>> {
    const params = new URLSearchParams();
    if (search?.keyword) params.append("keyword", search.keyword);
    if (search?.trangThai) params.append("trangThai", search.trangThai);
    if (search?.pageIndex) params.append("pageIndex", String(search.pageIndex));
    if (search?.pageSize) params.append("pageSize", String(search.pageSize));

    const queryString = params.toString();
    const url = `/chungchi${queryString ? `?${queryString}` : ""}`;
    return apiService.get<PagedList<ChungChiDto>>(url);
  },

  async getById(id: string): Promise<ApiResponse<ChungChiDto>> {
    return apiService.get<ChungChiDto>(`/chungchi/${id}`);
  },

  async create(
    data: CreateChungChiRequest
  ): Promise<ApiResponse<ChungChiDto>> {
    return apiService.post<ChungChiDto>("/chungchi", data);
  },

  async update(
    data: UpdateChungChiRequest
  ): Promise<ApiResponse<ChungChiDto>> {
    return apiService.put<ChungChiDto>("/chungchi", data);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiService.delete<boolean>(`/chungchi/${id}`);
  },

  async getByUser(): Promise<ApiResponse<ChungChiDto[]>> {
    // TODO: This endpoint needs to be implemented on backend
    // Returns all certificates for the current user
    return apiService.get<ChungChiDto[]>("/chungchi/user");
  },

  async verifyCertificate(id: string): Promise<ApiResponse<ChungChiDto>> {
    // TODO: This endpoint needs to be implemented on backend
    // Verify a certificate
    return apiService.post<ChungChiDto>(`/chungchi/${id}/verify`);
  },

  async downloadPdf(id: string): Promise<Blob> {
    // TODO: This endpoint needs to be implemented on backend
    // Download certificate as PDF
    return apiService.getBlob(`/chungchi/${id}/download`);
  },

  async uploadExternalCertificate(
    file: File
  ): Promise<ApiResponse<ChungChiDto>> {
    // TODO: This endpoint needs to be implemented on backend
    // Upload external certificate (PDF or image)
    const formData = new FormData();
    formData.append("file", file);
    return apiService.post<ChungChiDto>("/chungchi/upload", formData);
  },
};
