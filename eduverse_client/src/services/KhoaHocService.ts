import { KhoaHocType } from "../types/khoaHoc/dto";
import { apiService } from "./index";

export default class KhoaHocService {
  async getLearningKhoaHoc(
    idDangKyKhoaHoc: string,
  ): Promise<KhoaHocType> {
    const response = await apiService.get<KhoaHocType>(
      `/KhoaHoc/get-learning/${idDangKyKhoaHoc}`,
    );

    return response.data;
  }

  async getmyKhoaHoc( isNguoiDung : string): Promise<KhoaHocType[]> {
    const response = await apiService.get<KhoaHocType[]>(
      `/KhoaHoc/get-khoahoc-dangki/${isNguoiDung}`,
    );
    return response.data;
  }
}
