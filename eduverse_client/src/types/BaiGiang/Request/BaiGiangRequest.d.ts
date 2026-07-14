export interface CreateBaiGiangRequest {
  tieuDe?: string;
  laBaiGiangFree?: boolean;
  idPhan?: string;
  video?: File;
  thuTuSapXep?: number;
}

export interface UpdateBaiGiangRequest {
  idBaiGiang?: string;
  tieuDe?: string;
  thuTuSapXep?: number;
  laBaiGiangFree?: boolean;
  idPhan?: string;
  video?: File;
}
