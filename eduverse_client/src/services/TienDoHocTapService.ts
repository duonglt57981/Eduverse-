import { TienDoHocTapType } from "../types/tienDoHocTap/Dto/tienDoHocTapDto";
import { UpdateTienDoBaiGiangRequest } from "../types/tienDoHocTap/Request/UpdateTienDoBaiGiangRequest";
import { apiService } from "./index";

export default class TienDoHocTapService {
  async updateTienDoBaiGiang(
    request: UpdateTienDoBaiGiangRequest,
  ): Promise<TienDoHocTapType> {
    const response = await apiService.post<TienDoHocTapType>(
      `/TienDoHocTap/updatetiendo-baigiang`,
      request,
    );

    return response.data;
  }
}
