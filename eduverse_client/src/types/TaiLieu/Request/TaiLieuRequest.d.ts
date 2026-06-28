export interface CreateTaiLieuRequest {
  tenTaiLieu?: string;
  trangThai?: string;
  idBaiGiang: string;
  document: File; // IFormFile trong C#
}
