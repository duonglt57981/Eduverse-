import { KhoaHocType } from "../types/khoaHoc/dto";
import { apiService } from "./index";

export default class KhoaHocService {
  async getLearningKhoaHoc(
    idDangKyKhoaHoc: string,
    idNguoiDung: string,
  ): Promise<KhoaHocType> {
    const response = await apiService.get<KhoaHocType>(
      `/KhoaHoc/get-learning/${idDangKyKhoaHoc}/${idNguoiDung}`,
    );

    return response.data;
  }
}
