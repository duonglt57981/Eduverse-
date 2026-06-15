import { BaiGiangType } from "../BaiGiang/Dto/BaiGiangDto";

export interface PhanHocType {
  id?: Guid;
  tenPhan?: string;
  mieuTa?: string;
  thuTuSapXep?: number;
  ngayTao?: Date;
  idKhoaHoc?: Guid;

  DanhSachBaiGiang?: BaiGiangType[];
}
 