export interface CreateBaiGiangRequest {
  tieuDe?: string;
  laBaiGiangFree?: boolean;
  idPhan?: string;
  video?: File;
}

export interface UpdateBaiGiangRequest {
  idBaiGiang?: string;
  tieuDe?: string;
  thuTuSapXep?: number;
  laBaiGiangFree?: boolean;
  idPhan?: string;
  video?: File;
}
