export interface StartQuizRequest {
  idDangKi: string;
  idBaiKiemTra: string;
}

export interface SubmitQuizRequest {
  idLanLamBaiKiemTra: string;
  cauTraLois: CauTraLoiRequest[];
}

export interface AutoSaveRequest {
  idLanLamBaiKiemTra: string;
  idCauHoi: string;
  idDapAnChons: string[];
}

export interface UpdateBaiKiemTraRequest {
  idBaiKiemTra?: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  diemDat?: number;
  gioiHanThoiGian?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
  danhSachCauHoi: UpdateCauHoiRequest[];
}

export interface CreateBaiKiemTraRequest {
  idPhan?: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  diemDat?: number;
  gioiHanThoiGian?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
  danhSachCauHoi: CreateCauHoiRequest[];
}
