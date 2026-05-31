import { KhoaHocType } from "../types/khoaHoc/dto";
import { apiService } from "./index";

export default class KhoaHocService {
  async getLearningKhoaHoc(
    idKhoaHoc: string,
    idNguoiDung: string,
  ): Promise<KhoaHocType> {
    const response = await apiService.get<KhoaHocType>(
      `/KhoaHoc/get-learning?idKhoaHoc=${idKhoaHoc}&idNguoiDung=${idNguoiDung}`,
    );

    return response.data;
  }
}
