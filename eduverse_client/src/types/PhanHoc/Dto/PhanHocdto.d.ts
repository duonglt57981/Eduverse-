import { BaiKiemTraDto } from "../../baiKiemTra/Dto/baiKiemTraDto";
import { BaiGiangDto } from "../../khoaHoc";
import { BaiGiangType } from "../BaiGiang/Dto/BaiGiangDto";

export interface PhanHocType {
  id?: Guid;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  ngayTao?: Date;
  idKhoaHoc?: Guid;
  DanhSachBaiGiang?: BaiGiangDto[];
  DanhDachBaiKiemTra?: BaiKiemTraDto[];
}

export interface GetToUpdatePhanDto {
  id?: string;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
}
