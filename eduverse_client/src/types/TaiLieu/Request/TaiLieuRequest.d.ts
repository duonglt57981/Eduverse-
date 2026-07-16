export interface CreateTaiLieuRequest {
  tenTaiLieu?: string;
  trangThai?: string;
  idBaiGiang: string;
  document: File; // IFormFile trong C#
}

export interface UpdateTaiLieuRequest {
  id?: string;
  tenTaiLieu?: string;
  url?: string;
  idDocument?: string;
  trangThai?: string;
  idBaiGiang?: string;
  document?: File;
}
