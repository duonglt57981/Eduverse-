import { apiService } from ".";
import { DangKyKhoaHocMienPhiDto } from "../types/DangKi/Dto/dto";
import { ApiResponse } from "../types/types";

export default class DangKiService {
  async DangKiKhoaHocMienPhi(
    idKhoaHoc: string,
  ): Promise<ApiResponse<DangKyKhoaHocMienPhiDto>> {
    try {
      const response = await apiService.post<
        ApiResponse<DangKyKhoaHocMienPhiDto>
      >("/DangKiKhoaHoc/dangki-khoahoc{idKhoaHoc}");
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }
}
