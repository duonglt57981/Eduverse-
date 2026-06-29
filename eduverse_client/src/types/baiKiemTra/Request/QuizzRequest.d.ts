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
