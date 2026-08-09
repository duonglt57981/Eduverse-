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
  createdId?: string;

  danhSachPhanHoc?: PhanHocType[];
  giangVien?: GiangVienType;
}

export interface KhoaHocDetailType {
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
  createdBy?: string;
  createdId?: string;

  danhSachPhanHoc?: PhanHocType[];
  danhSachDanhMuc?: string[];
  giangVien?: GiangVienType;
}

export type KhoaHocSearch = SearchBase & {
  keyword?: string;
  tieuDe?: string;
  capDo?: string;
  loaiKhoaHoc?: string;
  danhMucId?: string;
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
  trangThai?: string;
  sapXepNgay?: string;
  sapXepTen?: string;
  sapXepHocVienNhieuNhat?: boolean;
  userId?: string;
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

export interface GiangVieType {
  id?: string;
  hoTen?: string;
  avatar?: string;
  tieuSu?: string;
  email?: string;
}

export interface GiangVienKhoaHocDto {
  thongTinGiangVien: AppUser;
  khoaHocs: PagedList<KhoaHocType>;
  tongHocVienDangHoc?: number;
  tongHocVienDangKy?: number;
}

export interface SearchBase {
  pageIndex?: int | 1;
  pageSize?: int | 20;
}

export interface AppUser {
  id: string;

  userName?: string;
  normalizedUserName?: string;

  email?: string;
  normalizedEmail?: string;
  emailConfirmed: boolean;

  phoneNumber?: string;
  phoneNumberConfirmed: boolean;

  twoFactorEnabled: boolean;
  lockoutEnd?: Date;
  lockoutEnabled: boolean;
  accessFailedCount: number;

  hoTen?: string;
  gioiTinh?: number;
  anhDaiDien?: string;
  chucVu?: string;
  idDonVi: string;
  diaChi?: string;
  ngaySinh?: Date;
  tieuSu?: string;
  anhBia?: string;
  gioiThieu?: string;
  soDuTaiKhoan?: number;

  currentSessionId?: string;
  currentDeviceInfo?: string;
  currentSessionAt?: Date;

  createdDate: Date;
  createdBy?: string;
  createdId?: string;

  updatedDate: Date;
  updatedBy?: string;
  updatedId?: string;

  isDeleted: boolean;
  deletedDate?: Date;
  deletedId?: string;
}
