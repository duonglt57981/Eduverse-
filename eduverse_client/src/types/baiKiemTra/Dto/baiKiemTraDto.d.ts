// ---------- AutoSaveDapAnDto ----------
export interface AutoSaveDapAnDto {
  success: boolean;
  soCauDaLam: number;
  tongSoCau: number;
  daHoanThanh: boolean;
  nextQuestionId: string | null;
  thoiGianConLai: number;
  coGioiHan: boolean;
  message: string;
}

// ---------- CauHoiDto (dùng trong BaiKiemTraDto, CreateBaiKiemTraDto) ----------
// Giả định cấu trúc, bạn có thể bổ sung theo thực tế
export interface CauHoiDto {
  id: string;
  noiDung: string;
  dapAn: DapAnDto[];
  // ... các thuộc tính khác
}

export interface DapAnDto {
  id: string;
  noiDung: string;
  dung?: boolean;
}

// ---------- CauHoiLamBaiDto (dùng trong BaiKiemTraLamBaiDto, ContinueQuizFullDto) ----------
export interface CauHoiLamBaiDto {
  id: string;
  noiDung: string;
  dapAn: DapAnDto[];
  // ... có thể thêm các thuộc tính hiển thị cho người làm
}

// ---------- BaiKiemTraDto ----------
export interface BaiKiemTraDto {
  id?: Guid;
  idGoc?: Guid;
  tenBaiKiemTra?: string;
  moTa?: string;
  diemDat?: number;
  gioiHanThoiGian?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
  idPhan?: Guid;
  soCauHoi?: number;
  createdDate?: Date;
  isBanHienTai?: boolean;
  idBanGhiTruoc?: Guid;
  trangThai?: string;
  trangThaiPheDuyet?: string;
  isSwap?: boolean;
}

// ---------- BaiKiemTraLamBaiDto ----------
export interface BaiKiemTraLamBaiDto {
  id: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  gioiHanThoiGian?: number;
  cauHois: CauHoiLamBaiDto[];
}

// ---------- CauTraLoiSubmitDto ----------
export interface CauTraLoiSubmitDto {
  idCauHoi: string;
  idDapAnChons: string[];
}

// ---------- QuizTimeDto ----------
export interface QuizTimeDto {
  thoiGianBatDau: Date; // hoặc string (ISO)
  thoiGianDaLam: number;
  thoiGianConLai: number;
  gioiHanThoiGian: number;
  coGioiHan: boolean;
}

// ---------- TienDoQuizDto ----------
export interface TienDoQuizDto {
  soCauDaLam: number;
  tongSoCau: number;
  phanTram: number;
  daHoanThanh: boolean;
}

// ---------- ContinueQuizFullDto ----------
export interface ContinueQuizFullDto {
  idLanLamBaiKiemTra: string;
  idBaiKiemTra: string;
  tenBaiKiemTra: string;
  currentQuestionIndex: number;
  currentQuestionId?: string;
  savedAnswers: Record<string, string[]>; // key: questionId, value: list of answer ids
  allQuestions: CauHoiLamBaiDto[];
  progress: TienDoQuizDto;
  thoiGian: QuizTimeDto;
}

// ---------- CreateBaiKiemTraDto ----------
export interface CreateBaiKiemTraDto {
  id: string;
  idPhan?: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  diemDat?: number;
  gioiHanThoiGian?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
  soCauHoi?: number;
  trangThai?: string;
  trangThaiPheDuyet?: string;
  danhSachCauHoi: CauHoiDto[];
}

// ---------- HeartbeatResultDto ----------
export interface HeartbeatResultDto {
  tongThoiGianDaLam: number;
  thoiGianConLai: number;
  coGioiHan: boolean;
}

// ---------- UpdateBaiKiemTraDto ----------
export interface UpdateBaiKiemTraDto {
  id: string;
  tenBaiKiemTra?: string;
  moTa?: string;
  diemDat?: number;
  gioiHanThoiGian?: number;
  choLamLai?: boolean;
  soLanLamToiDa?: number;
  idPhan?: string;
}

export interface LanLamBaiKiemTraDto {
  id: string;
  thoiGianBatDau?: Date | null;
  thoiGianNop?: Date | null;
  dat?: boolean | null;
  lamLanThu?: number | null;
  idBaiKiemTra?: string | null;
  idNguoiDung?: string | null;
}

export interface KetQuaLanKiemTraDto {
  idLanLamBaiKiemTra: string;
  dat: boolean;
  tongDiem: number; // điểm thực tế đạt được
  soCauDung: number;
  soCauSai: number;
  tongSoCau: number;
  thoiGianNop?: string | null; // ISO string, optional
  datYeuCau: boolean;
  tongDiemToiDa: number; // luôn = 100
  thoiGianBatDau?: string | null;
  thoiGianKetThuc?: string | null;
}

export interface ReviewQuizDto {
  idLanLamBaiKiemTra: string;
  tongDiem: number;
  thoiGianNop?: string | null; // ISO string
  dat: boolean;
  cauHois: CauHoiReviewDto[];
}

export interface LichSuLamBaiDto {
  idLanLamBaiKiemTra: string;
  lamLanThu?: number | null;
  dat?: boolean | null;
  thoiGianBatDau?: Date | null;
  thoiGianNop?: Date | null;
}

export interface AutoSaveDapAnDto {
  success: boolean;
  soCauDaLam: number;
  tongSoCau: number;
  daHoanThanh: boolean;
  nextQuestionId: string | null;
  thoiGianConLai: number;
  coGioiHan: boolean;
  message: string;
}

export interface ContinueQuizFullDto {
  idLanLamBaiKiemTra: string;
  idBaiKiemTra: string;
  tenBaiKiemTra: string;
  currentQuestionIndex: number;
  currentQuestionId?: string | null;
  savedAnswers: Record<string, string[]>; // Dictionary<Guid, List<Guid>> → Record<string, string[]>
  allQuestions: CauHoiLamBaiDto[];
  progress: TienDoQuizDto;
  thoiGian: QuizTimeDto;
}

export interface HeartbeatResultDto {
  tongThoiGianDaLam: number;
  thoiGianConLai: number;
  coGioiHan: boolean;
}

export interface GetQuizToLearningDto {
  idKhoaHoc?: Guid;
  tenKhoaHoc?: string;
  danhSachTheoPhan?: PhanHocQuizDto[];
  danhSachTatCa?: BaiKiemTraDto[];
  tongSoBaiKiemTra?: number;
}

export interface PhanHocQuizDto {
  idPhan?: Guid;
  tenPhan?: string;
  thuTuSapXep?: number;
  danhSachBaiKiemTra?: BaiKiemTraDto[];
}
