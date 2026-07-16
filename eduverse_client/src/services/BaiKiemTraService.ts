import {
  AutoSaveDapAnDto,
  BaiKiemTraDto,
  BaiKiemTraLamBaiDto,
  ContinueQuizFullDto,
  CreateBaiKiemTraDto,
  GetQuizToLearningDto,
  HeartbeatResultDto,
  KetQuaLanKiemTraDto,
  LanLamBaiKiemTraDto,
  LichSuLamBaiDto,
  ReviewQuizDto,
  UpdateBaiKiemTraDto,
} from "../types/baiKiemTra/Dto/baiKiemTraDto";
import { ApiResponse } from "../types/types";
import { apiService } from ".";
import {
  AutoSaveRequest,
  CreateBaiKiemTraRequest,
  StartQuizRequest,
  SubmitQuizRequest,
  UpdateBaiKiemTraRequest,
} from "../types/baiKiemTra/Request/QuizzRequest";

export default class BaiKiemTraService {
  async GetListForManager(
    idPhan: string,
  ): Promise<ApiResponse<BaiKiemTraDto[]>> {
    try {
      const response = await apiService.get<BaiKiemTraDto[]>(
        `/BaiKiemTra/getlistformanager/${idPhan}`,
      );
      return response;
    } catch (error) {
      console.error("Error getting quiz to learning:", error);
      throw error;
    }
  }

  async CreateBaiKiemTra(
    request: CreateBaiKiemTraRequest,
  ): Promise<ApiResponse<CreateBaiKiemTraDto>> {
    try {
      const response = await apiService.post<ApiResponse<CreateBaiKiemTraDto>>(
        `/BaiKiemTra/create`,
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  }

  async UpdateBaiKiemTra(
    request: UpdateBaiKiemTraRequest,
  ): Promise<ApiResponse<UpdateBaiKiemTraDto>> {
    try {
      console.log("Request gửi lên API:", JSON.stringify(request, null, 2));
      console.log(
        "Danh sách câu hỏi:",
        request.danhSachCauHoi.map((ch) => ({ id: ch.id, ten: ch.tenCauHoi })),
      );
      const response = await apiService.put<ApiResponse<UpdateBaiKiemTraDto>>(
        `/BaiKiemTra/update/${request.idBaiKiemTra}`,
        request,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating quiz:", error);
      throw error;
    }
  }

  async DeleteBaiKiemTra(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.delete<ApiResponse<boolean>>(
        `/BaiKiemTra/delete/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting quiz:", error);
      throw error;
    }
  }

  async GetQuizToLearning(
    idDangKi: string,
  ): Promise<ApiResponse<GetQuizToLearningDto>> {
    try {
      const response = await apiService.get<ApiResponse<GetQuizToLearningDto>>(
        `/BaiKiemTra/getquizz-learning/${idDangKi}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting quiz to learning:", error);
      throw error;
    }
  }

  async StartQuizz(
    startQuizRequest: StartQuizRequest,
  ): Promise<ApiResponse<LanLamBaiKiemTraDto>> {
    try {
      const response = await apiService.post<ApiResponse<LanLamBaiKiemTraDto>>(
        `/BaiKiemTra/start`,
        startQuizRequest,
      );
      return response.data;
    } catch (error) {
      console.error("Error starting quiz:", error);
      throw error;
    }
  }

  async GetQuizzForStudent(
    idBaiKiemTra: string,
  ): Promise<ApiResponse<BaiKiemTraLamBaiDto>> {
    try {
      const response = await apiService.get<ApiResponse<BaiKiemTraLamBaiDto>>(
        `/BaiKiemTra/${idBaiKiemTra}/quiz`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting quiz for student:", error);
      throw error;
    }
  }

  async SubMitQuizz(
    submitQuizRequest: SubmitQuizRequest,
  ): Promise<ApiResponse<KetQuaLanKiemTraDto>> {
    try {
      const response = await apiService.post<ApiResponse<KetQuaLanKiemTraDto>>(
        `/BaiKiemTra/submit`,
        submitQuizRequest,
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  }

  async GetReviewQuiz(
    idLanLamBai: string,
  ): Promise<ApiResponse<ReviewQuizDto>> {
    try {
      const response = await apiService.get<ApiResponse<ReviewQuizDto>>(
        `/BaiKiemTra/review/${idLanLamBai}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting review quiz:", error);
      throw error;
    }
  }

  async GetHistoryQuiz(
    idBaiKiemTra: string,
  ): Promise<ApiResponse<LichSuLamBaiDto>> {
    try {
      const userId = this.getUserIdFromToken();
      const response = await apiService.get<ApiResponse<LichSuLamBaiDto>>(
        `/BaiKiemTra/${idBaiKiemTra}/can-retake/${userId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error getting history quiz:", error);
      throw error;
    }
  }

  async AutoSaveDapAn(
    autoSaveRequest: AutoSaveRequest,
  ): Promise<ApiResponse<AutoSaveDapAnDto>> {
    try {
      const response = await apiService.post<ApiResponse<AutoSaveDapAnDto>>(
        `/BaiKiemTra/auto-save`,
        autoSaveRequest,
      );
      return response.data;
    } catch (error) {
      console.error("Error auto-saving answer:", error);
      throw error;
    }
  }

  async ContinueQuiz(
    idLanLamBaiKiemTra: string,
  ): Promise<ApiResponse<ContinueQuizFullDto>> {
    try {
      const response = await apiService.get<ApiResponse<ContinueQuizFullDto>>(
        `/BaiKiemTra/continue/${idLanLamBaiKiemTra}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error continuing quiz:", error);
      throw error;
    }
  }

  async Heartbeat(
    idLanLamBaiKiemTra: string,
  ): Promise<ApiResponse<HeartbeatResultDto>> {
    try {
      const response = await apiService.post<ApiResponse<HeartbeatResultDto>>(
        `/BaiKiemTra/heartbeat`,
        { idLanLamBaiKiemTra },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending heartbeat:", error);
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
