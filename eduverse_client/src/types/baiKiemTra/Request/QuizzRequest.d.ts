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
  thuTuSapXep?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
}

export interface UpdateCauHoiRequest {
  id: string;
  tenCauHoi?: string;
  noiDungCauHoi?: string;
  doKho?: string;
  thuTuSapXep?: number;
  danhSachDapAns: UpdateDapAnRequest[];
}

export interface UpdateDapAnRequest {
  id?: string;
  noiDungDapAn?: string;
  laDapAnDung: boolean;
  thuTuSapXep?: number;
}

export interface CreateBaiKiemTraRequest {
  idPhan?: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  thuTuSapXep?: number;
}

export interface CreateCauHoiRequest {
  idBaiKiemTra: string;
  tenCauHoi?: string;
  noiDungCauHoi?: string;
  loaiCauHoi?: string;
  diem?: number;
  doKho?: string;
  thuTuSapXep?: number;
  danhSachDapAn: CreateDapAnRequest[];
}

export interface CreateDapAnRequest {
  noiDungDapAn?: string;
  laDapAnDung?: boolean;
  thuTuSapXep?: number;
}
