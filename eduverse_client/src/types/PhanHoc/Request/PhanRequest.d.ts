export interface CreatePhanRequest {
  tenPhan?: string;
  mieuTa?: string;
  idKhoaHoc?: string;
}

export interface UpdatePhanRequest {
  id?: string;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  idKhoaHoc?: string;
}
