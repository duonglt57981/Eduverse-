import { apiService } from ".";
import { TaoThanhToanResult } from "../types/ThanhToan/Dto/dto";
import {
  TaoThanhToanRequest,
  WebhookRequest,
} from "../types/ThanhToan/Request/request";
import { ApiResponse } from "../types/types";

export default class ThanhToanService {
  async taoThanhToan(
    request: TaoThanhToanRequest,
  ): Promise<ApiResponse<TaoThanhToanResult>> {
    try {
      const response = await apiService.post<ApiResponse<TaoThanhToanResult>>(
        "/ThanhToan/tao-thanh-toan",
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async thanhToanWebhook(
    request: WebhookRequest,
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiService.post<{ success: boolean }>(
        "/ThanhToan/webhook",
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error processing webhook:", error);
      throw error;
    }
  }
}
