import { BaiGiangType } from "../BaiGiang/Dto/BaiGiangDto";

export interface PhanHocType {
  id?: Guid;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  ngayTao?: Date;
  idKhoaHoc?: Guid;
  thuTuSapXep?: number;
  DanhSachBaiGiang?: BaiGiangType[];
  DanhDachBaiKiemTra?: BaiKiemTraDto[];
}

export interface GetToUpdatePhanDto {
  id?: string;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  thuTuSapXep?: number;
}
