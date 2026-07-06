import { apiService } from "./index";
import { ThongBao, ThongBaoRequest, ThongBaoSearch } from "@/src/types/thongbao";
import { ApiResponse, PagedList } from "@/src/types/types";

export const thongBaoService = {
  async getMyNotifications(): Promise<ApiResponse<ThongBao[]>> {
    return apiService.get<ThongBao[]>("/ThongBao");
  },

  async getNotifications(
    search?: ThongBaoSearch
  ): Promise<ApiResponse<PagedList<ThongBao>>> {
    const params = new URLSearchParams();
    if (search) {
      Object.entries(search).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          params.append(key, String(val));
        }
      });
    }
    const queryString = params.toString();
    const url = `/ThongBao/list${queryString ? `?${queryString}` : ""}`;
    return apiService.get<PagedList<ThongBao>>(url);
  },

  async getNotificationDetail(id: string): Promise<ApiResponse<ThongBao>> {
    return apiService.get<ThongBao>(`/ThongBao/${id}`);
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    return apiService.get<number>("/ThongBao/chua-doc");
  },

  async getUnreadNotifications(): Promise<ApiResponse<ThongBao[]>> {
    return apiService.get<ThongBao[]>("/ThongBao/chua-doc/danh-sach");
  },

  async createNotification(payload: ThongBaoRequest): Promise<ApiResponse<ThongBao>> {
    return apiService.post<ThongBao>("/ThongBao/Create", payload);
  },

  async updateNotification(id: string, payload: ThongBaoRequest): Promise<ApiResponse<ThongBao>> {
    return apiService.put<ThongBao>(`/ThongBao/${id}`, payload);
  },

  async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    return apiService.put<boolean>(`/ThongBao/${id}/da-doc`);
  },

  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    return apiService.put<boolean>("/ThongBao/doc-tat-ca");
  },

  async deleteNotification(id: string): Promise<ApiResponse<boolean>> {
    return apiService.delete<boolean>(`/ThongBao/${id}`);
  },
};
export default thongBaoService;
