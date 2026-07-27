import { PhanDto } from "../../khoaHoc";
import { PhanHocType } from "../../PhanHoc/Dto/PhanHocdto";

export interface KhoaHocType {
  id?: Guid;
  tieuDe?: string;
  moTa?: string;
  gia?: number;
  giaGoc?: number;
  loaiKhoaHoc?: string;
  hinhAnhKhoaHoc?: string;
  urlViewPreviewKhoaHoc?: string;
  capDo?: string;
  tongThoiLuong?: number;
  tongBaiGiang?: number;
  ngayTao?: Date;
  ngayCapNhat?: Date;
  soLuongHocVien?: number;
  trangThaiPheDuyet?: string;
  trangThai?: string;
  idBanGhiTruoc?: string | null;
  tongBaiGiang?: number;
  tongTaiLieu?: number;
  isBanHienTai?: boolean;
  daDangKy: boolean;

  idDangKiKhoaHoc?: string;
  ngayDangKy: Date;
  soBaiGiangHoanThanh: number;
  phanTramHoanThanh: double;

  danhSachPhanHoc?: PhanHocType[];
  createdBy?: string;
}

export type KhoaHocSearch = SearchBase & {
  keyword?: string;
  tieuDe?: string;
  capDo?: string;
  loaiKhoaHoc?: string;
  giaFrom?: number | null;
  giaTo?: number | null;
  tongBaiGiangFrom?: number | null;
  tongBaiGiangTo?: number | null;
  isFree?: boolean | null;
  sortPrice?: string;
};

export type KhoaHocDangKiSearch = SearchBase & {
  keyword?: string;
  trangThai?:
    | "TatCa"
    | "DaDuyet"
    | "ChoDuyet"
    | "DangDuyet"
    | "TuChoi"
    | "DangSua";
  sapXepNgay?: "Cu" | "Moi";
  sapXepTen?: "AZ" | "ZA";
};

export type KhoaHocManagerSearch = SearchBase & {
  keyword?: string;

  // "TatCa" | "DaDuyet" | "ChoDuyet" | "DangDuyet" | "TuChoi" | "DangSua"
  trangThai?: string;

  // "Cu" | "Moi"
  sapXepNgay?: string;

  // "AZ" | "ZA"
  sapXepTen?: string;

  sapXepHocVienNhieuNhat?: boolean;
};

export interface GetToUpdateKhoaHoc {
  id?: string;
  tieuDe?: string;
  moTa?: string;
  gia?: number;
  giaGoc?: number;
  capDo?: string;
  urlHinhAnh?: string;
  trangThai?: string;
  trangThaiPheDuyet?: string;
  danhSachDanhMuc?: string[];
}

export interface KhoaHocDraftResultType {
  khoaHoc: KhoaHocType;
  phan: PhanHocType;
}
