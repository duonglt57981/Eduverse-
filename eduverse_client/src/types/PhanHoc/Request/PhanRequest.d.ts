export interface CreatePhanRequest {
  tenPhan?: string;
  mieuTa?: string;
  idKhoaHoc?: string;
  thuTuSapXep?: number;
}

export interface UpdatePhanRequest {
  id?: string;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  idKhoaHoc?: string;
  thuTuSapXep?: number;
}
