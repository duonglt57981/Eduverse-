/* eslint-disable @typescript-eslint/no-explicit-any */
import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";

// ===== Type cho thông tin khóa học cơ bản =====
export type ThongTinKhoaHocCoBan = {
  tieuDe?: string;
  moTa?: string;
  capDo?: string;
  hinhAnhKhoaHoc?: string;
  giaGoc?: number;
  trangThai?: string;
  trangThaiPheDuyet?: string;
};

export const MAU = {
  chinh: "#7A1F2B",
  chinhDam: "#611722",
  chinhNhat: "#FDF2F3",
  vien: "#E7DADC",
  chuDen: "#1A1A1A",
  chuXam: "#6A6F73",
  canhBaoNen: "#FFF4E5",
  canhBaoChu: "#B26A00",
  loiNen: "#FDECEC",
  loiChu: "#C62828",
  thanhCongNen: "#EAF7EE",
  thanhCongChu: "#1B8A4C",
};

export type TrangThaiKhoaHoc =
  | "DangSua"
  | "ChoDuyet"
  | "DangDuyet"
  | "DaDuyet"
  | "TuChoi";

export function thongTinTrangThai(trangThai: TrangThaiKhoaHoc): {
  nhan: string;
  mau: "default" | "warning" | "success" | "error" | "info";
} {
  switch (trangThai) {
    case "DangSua":
      return { nhan: "Đang sửa", mau: "default" };
    case "ChoDuyet":
      return { nhan: "Chờ duyệt", mau: "warning" };
    case "DangDuyet":
      return { nhan: "Đang duyệt", mau: "info" };
    case "DaDuyet":
      return { nhan: "Đã duyệt", mau: "success" };
    case "TuChoi":
      return { nhan: "Từ chối", mau: "error" };
    default:
      return { nhan: trangThai, mau: "default" };
  }
}

export function laDangSua(entity: any): boolean {
  return (
    entity?.trangThai === "DangSua" || entity?.trangThaiPheDuyet === "DangSua"
  );
}

export function tinhTongThoiLuongGiay(phans: PhanHocType[]): number {
  return phans.reduce(
    (tongPhan, phan) =>
      tongPhan +
      (phan.DanhSachBaiGiang ?? []).reduce(
        (tongMuc, bg) => tongMuc + (bg.thoiLuong ?? 0),
        0,
      ),
    0,
  );
}

export function demTongSoBaiGiang(phans: PhanHocType[]): number {
  return phans.reduce(
    (tong, phan) => tong + (phan.DanhSachBaiGiang ?? []).length,
    0,
  );
}

export const THOI_LUONG_TOI_THIEU_GIAY = 30 * 60;
export const SO_BAI_GIANG_TOI_THIEU = 5;
export const SO_KY_TU_TIEU_DE_TOI_THIEU = 10;
export const SO_KY_TU_MO_TA_TOI_THIEU = 200;
export const SO_KY_TU_MO_TA_TOI_DA = 9999;

// ===== VALIDATION CONSTANTS =====
// Phần
export const SO_KY_TU_TEN_PHAN_TOI_THIEU = 3;
export const SO_KY_TU_TEN_PHAN_TOI_DA = 99;

// Bài giảng
export const SO_KY_TU_TIEU_DE_BG_TOI_THIEU = 3;
export const SO_KY_TU_TIEU_DE_BG_TOI_DA = 99;

// Tài liệu
export const SO_KY_TU_TEN_TAI_LIEU_TOI_THIEU = 3;
export const SO_KY_TU_TEN_TAI_LIEU_TOI_DA = 99;

// Bài kiểm tra
export const SO_KY_TU_TEN_BAI_KIEM_TRA_TOI_THIEU = 3;
export const SO_KY_TU_TEN_BAI_KIEM_TRA_TOI_DA = 99;
export const SO_KY_TU_MO_TA_BAI_KIEM_TRA_TOI_THIEU = 10;
export const SO_KY_TU_MO_TA_BAI_KIEM_TRA_TOI_DA = 200;

// Câu hỏi
export const SO_KY_TU_NOI_DUNG_CAU_HOI_TOI_THIEU = 3;
export const SO_KY_TU_NOI_DUNG_CAU_HOI_TOI_DA = 200;
export const SO_DAP_AN_TOI_THIEU = 2;
export const SO_DAP_AN_TOI_DA = 15;

// Đáp án
export const SO_KY_TU_NOI_DUNG_DAP_AN_TOI_THIEU = 1;
export const SO_KY_TU_NOI_DUNG_DAP_AN_TOI_DA = 99;

// ===== UTILITY FUNCTIONS =====
export function demSoKyTuKhongTinhKhoangTrang(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text.replace(/\s+/g, "").length;
}

export function demSoKyTuKhongTinhKhoangTrangDauCuoi(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text.trim().length;
}

export function trimString(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text.trim();
}

export function isOnlySpaces(text: string): boolean {
  if (!text || typeof text !== "string") return true;
  return text.trim().length === 0;
}

// Chuyển nội dung HTML (từ RichTextEditor) sang văn bản thuần để đếm/kiểm tra
// chính xác - loại bỏ thẻ HTML, giải mã entity phổ biến, và thay các thẻ
// xuống dòng/khối bằng khoảng trắng để tránh dính chữ giữa các đoạn.
export function layNoiDungThuanTuyTuHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/blockquote)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/[ \t\f\v]+/g, " ");
}

export function isNoiDungHtmlRong(html: string): boolean {
  return layNoiDungThuanTuyTuHtml(html).trim().length === 0;
}

// Đếm số ký tự của nội dung HTML, không tính khoảng trắng đầu/cuối
// (khoảng trắng ở giữa vẫn được tính) - dùng cho nội dung câu hỏi/đáp án
// lấy từ RichTextEditor.
export function demSoKyTuHtmlKhongTinhKhoangTrangDauCuoi(html: string): number {
  return layNoiDungThuanTuyTuHtml(html).trim().length;
}

// ===== VALIDATION FUNCTIONS =====

// Phần - chỉ validate tiêu đề
export function validateTenPhan(tenPhan: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = trimString(tenPhan);
  if (isOnlySpaces(tenPhan)) {
    return { valid: false, error: "Vui lòng nhập tiêu đề phần" };
  }
  const soKyTu = demSoKyTuKhongTinhKhoangTrangDauCuoi(tenPhan);
  if (soKyTu < SO_KY_TU_TEN_PHAN_TOI_THIEU) {
    return {
      valid: false,
      error: `Tiêu đề phần cần tối thiểu ${SO_KY_TU_TEN_PHAN_TOI_THIEU} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > SO_KY_TU_TEN_PHAN_TOI_DA) {
    return {
      valid: false,
      error: `Tiêu đề phần không được vượt quá ${SO_KY_TU_TEN_PHAN_TOI_DA} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

// Bài giảng
export function validateTieuDeBaiGiang(tieuDe: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = trimString(tieuDe);
  if (isOnlySpaces(tieuDe)) {
    return { valid: false, error: "Vui lòng nhập tiêu đề bài giảng" };
  }
  const soKyTu = demSoKyTuKhongTinhKhoangTrangDauCuoi(tieuDe);
  if (soKyTu < SO_KY_TU_TIEU_DE_BG_TOI_THIEU) {
    return {
      valid: false,
      error: `Tiêu đề bài giảng cần tối thiểu ${SO_KY_TU_TIEU_DE_BG_TOI_THIEU} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > SO_KY_TU_TIEU_DE_BG_TOI_DA) {
    return {
      valid: false,
      error: `Tiêu đề bài giảng không được vượt quá ${SO_KY_TU_TIEU_DE_BG_TOI_DA} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

// Tài liệu
export function validateTenTaiLieu(tenTaiLieu: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = trimString(tenTaiLieu);
  if (isOnlySpaces(tenTaiLieu)) {
    return { valid: false, error: "Vui lòng nhập tên tài liệu" };
  }
  const soKyTu = demSoKyTuKhongTinhKhoangTrangDauCuoi(tenTaiLieu);
  if (soKyTu < SO_KY_TU_TEN_TAI_LIEU_TOI_THIEU) {
    return {
      valid: false,
      error: `Tên tài liệu cần tối thiểu ${SO_KY_TU_TEN_TAI_LIEU_TOI_THIEU} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > SO_KY_TU_TEN_TAI_LIEU_TOI_DA) {
    return {
      valid: false,
      error: `Tên tài liệu không được vượt quá ${SO_KY_TU_TEN_TAI_LIEU_TOI_DA} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

// Bài kiểm tra
export function validateTenBaiKiemTra(tenBaiKiemTra: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = trimString(tenBaiKiemTra);
  if (isOnlySpaces(tenBaiKiemTra)) {
    return { valid: false, error: "Vui lòng nhập tiêu đề bài kiểm tra" };
  }
  const soKyTu = demSoKyTuKhongTinhKhoangTrangDauCuoi(tenBaiKiemTra);
  if (soKyTu < SO_KY_TU_TEN_BAI_KIEM_TRA_TOI_THIEU) {
    return {
      valid: false,
      error: `Tiêu đề bài kiểm tra cần tối thiểu ${SO_KY_TU_TEN_BAI_KIEM_TRA_TOI_THIEU} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > SO_KY_TU_TEN_BAI_KIEM_TRA_TOI_DA) {
    return {
      valid: false,
      error: `Tiêu đề bài kiểm tra không được vượt quá ${SO_KY_TU_TEN_BAI_KIEM_TRA_TOI_DA} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

// Bài kiểm tra - Mô tả (không bắt buộc, nếu nhập thì tối thiểu 10 - tối đa 200 ký tự)
export function validateMoTaBaiKiemTra(moTa: string): {
  valid: boolean;
  error?: string;
} {
  // Không bắt buộc nhập: bỏ qua validate nếu để trống hoặc chỉ toàn khoảng trắng
  if (!moTa || isOnlySpaces(moTa)) {
    return { valid: true };
  }

  const soKyTu = demSoKyTu(moTa);
  if (soKyTu < 10) {
    return {
      valid: false,
      error: `Mô tả bài kiểm tra cần tối thiểu 10 ký tự (không tính khoảng trắng). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > 200) {
    return {
      valid: false,
      error: `Mô tả bài kiểm tra không được vượt quá 200 ký tự (không tính khoảng trắng). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

// Câu hỏi
export function validateNoiDungCauHoi(noiDung: string): {
  valid: boolean;
  error?: string;
} {
  if (isNoiDungHtmlRong(noiDung)) {
    return { valid: false, error: "Vui lòng nhập nội dung câu hỏi" };
  }
  const soKyTu = demSoKyTuHtmlKhongTinhKhoangTrangDauCuoi(noiDung);
  if (soKyTu < SO_KY_TU_NOI_DUNG_CAU_HOI_TOI_THIEU) {
    return {
      valid: false,
      error: `Nội dung câu hỏi cần tối thiểu ${SO_KY_TU_NOI_DUNG_CAU_HOI_TOI_THIEU} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > SO_KY_TU_NOI_DUNG_CAU_HOI_TOI_DA) {
    return {
      valid: false,
      error: `Nội dung câu hỏi không được vượt quá ${SO_KY_TU_NOI_DUNG_CAU_HOI_TOI_DA} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

// Đáp án
export function validateNoiDungDapAn(noiDung: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = trimString(noiDung);
  if (isOnlySpaces(noiDung)) {
    return { valid: false, error: "Vui lòng nhập nội dung đáp án" };
  }
  const soKyTu = demSoKyTuKhongTinhKhoangTrangDauCuoi(noiDung);
  if (soKyTu < SO_KY_TU_NOI_DUNG_DAP_AN_TOI_THIEU) {
    return {
      valid: false,
      error: `Nội dung đáp án cần tối thiểu ${SO_KY_TU_NOI_DUNG_DAP_AN_TOI_THIEU} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  if (soKyTu > SO_KY_TU_NOI_DUNG_DAP_AN_TOI_DA) {
    return {
      valid: false,
      error: `Nội dung đáp án không được vượt quá ${SO_KY_TU_NOI_DUNG_DAP_AN_TOI_DA} ký tự (không tính khoảng trắng đầu cuối). Hiện tại: ${soKyTu} ký tự.`,
    };
  }
  return { valid: true };
}

export function demSoTu(vanBan: string): number {
  if (!vanBan || typeof vanBan !== "string") return 0;
  const text = vanBan.replace(/<[^>]*>/g, " ");
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

export function demSoKyTu(vanBan: string): number {
  if (!vanBan || typeof vanBan !== "string") return 0;
  const text = vanBan.replace(/<[^>]*>/g, " ");
  const khongCoKhoangTrang = text.replace(/\s+/g, "");
  return khongCoKhoangTrang.length;
}

export function demSoKyTuKeCaDauCach(vanBan: string): number {
  if (!vanBan || typeof vanBan !== "string") return 0;
  const text = vanBan.replace(/<[^>]*>/g, " ");
  return text.trim().length;
}

export interface MucThieu {
  id: string;
  nhan: string;
  moTa: string;
  diChuyenDen: "curriculum" | "basics";
}

export interface KetQuaValidate {
  hopLe: boolean;
  danhSachThieu: MucThieu[];
}

export function kiemTraDieuKienGuiDuyet(
  thongTin: ThongTinKhoaHocCoBan,
  phans: PhanHocType[],
): KetQuaValidate {
  const danhSachThieu: MucThieu[] = [];

  const tongGiay = tinhTongThoiLuongGiay(phans);
  if (tongGiay < THOI_LUONG_TOI_THIEU_GIAY) {
    const conThieuPhut = Math.ceil((THOI_LUONG_TOI_THIEU_GIAY - tongGiay) / 60);
    danhSachThieu.push({
      id: "thoi-luong",
      nhan: "Thời lượng bài giảng chưa đủ",
      moTa: `Khóa học cần tối thiểu 30 phút nội dung video. Bạn cần thêm khoảng ${conThieuPhut} phút nữa.`,
      diChuyenDen: "curriculum",
    });
  }

  const tongSoBaiGiang = demTongSoBaiGiang(phans);
  if (tongSoBaiGiang < SO_BAI_GIANG_TOI_THIEU) {
    danhSachThieu.push({
      id: "so-luong-bai-giang",
      nhan: "Chưa đủ số lượng bài giảng",
      moTa: `Khóa học cần tối thiểu ${SO_BAI_GIANG_TOI_THIEU} bài giảng. Hiện tại: ${tongSoBaiGiang} bài giảng.`,
      diChuyenDen: "curriculum",
    });
  }

  const coBaiGiangCoVideo = phans.some((p) =>
    (p.DanhSachBaiGiang ?? []).some((bg) => !!bg.urlBaiGiang),
  );
  if (!coBaiGiangCoVideo) {
    danhSachThieu.push({
      id: "noi-dung-video",
      nhan: "Chưa có bài giảng nào có video",
      moTa: "Cần ít nhất 1 bài giảng đã tải lên video.",
      diChuyenDen: "curriculum",
    });
  }

  const phanKhongCoBaiGiang = phans.filter(
    (p) => !p.DanhSachBaiGiang || p.DanhSachBaiGiang.length === 0,
  );
  if (phanKhongCoBaiGiang.length > 0) {
    const tenCacPhan = phanKhongCoBaiGiang
      .map((p) => p.tenPhan || "Chưa đặt tên")
      .join(", ");
    danhSachThieu.push({
      id: "phan-thieu-bai-giang",
      nhan: "Có phần chưa có bài giảng",
      moTa: `Các phần sau chưa có bài giảng nào: ${tenCacPhan}. Mỗi phần cần ít nhất 1 bài giảng.`,
      diChuyenDen: "curriculum",
    });
  }

  const coBaiKiemTraRong = phans.some((p) =>
    (p.DanhDachBaiKiemTra ?? []).some((kt) => (kt.cauHois ?? []).length === 0),
  );
  if (coBaiKiemTraRong) {
    danhSachThieu.push({
      id: "bai-kiem-tra-rong",
      nhan: "Có bài kiểm tra chưa có câu hỏi",
      moTa: "Thêm ít nhất 1 câu hỏi cho mỗi bài kiểm tra, hoặc xóa bài kiểm tra rỗng.",
      diChuyenDen: "curriculum",
    });
  }

  const soKyTuTieuDe = demSoKyTu(thongTin.tieuDe || "");
  if (!thongTin.tieuDe || soKyTuTieuDe < SO_KY_TU_TIEU_DE_TOI_THIEU) {
    danhSachThieu.push({
      id: "tieu-de",
      nhan: "Tên khóa học chưa đủ rõ ràng",
      moTa: `Nhập tên khóa học tối thiểu ${SO_KY_TU_TIEU_DE_TOI_THIEU} ký tự (không tính dấu cách). Hiện tại: ${soKyTuTieuDe} ký tự.`,
      diChuyenDen: "basics",
    });
  }

  const soKyTuMoTa = demSoKyTu(thongTin.moTa || "");
  if (soKyTuMoTa < SO_KY_TU_MO_TA_TOI_THIEU) {
    danhSachThieu.push({
      id: "mo-ta",
      nhan: "Mô tả khóa học chưa đủ dài",
      moTa: `Mô tả cần tối thiểu ${SO_KY_TU_MO_TA_TOI_THIEU} ký tự (không tính dấu cách). Hiện tại: ${soKyTuMoTa} ký tự.`,
      diChuyenDen: "basics",
    });
  }

  const soKyTuMoTaKeCaDauCach = demSoKyTuKeCaDauCach(thongTin.moTa || "");
  if (soKyTuMoTaKeCaDauCach > SO_KY_TU_MO_TA_TOI_DA) {
    danhSachThieu.push({
      id: "mo-ta-vuot-qua",
      nhan: "Mô tả khóa học vượt quá độ dài cho phép",
      moTa: `Mô tả tối đa ${SO_KY_TU_MO_TA_TOI_DA} ký tự (tính cả dấu cách). Hiện tại: ${soKyTuMoTaKeCaDauCach} ký tự.`,
      diChuyenDen: "basics",
    });
  }

  if (!thongTin.capDo) {
    danhSachThieu.push({
      id: "cap-do",
      nhan: "Chưa chọn cấp độ",
      moTa: "Chọn cấp độ phù hợp cho khóa học.",
      diChuyenDen: "basics",
    });
  }

  if (!thongTin.hinhAnhKhoaHoc) {
    danhSachThieu.push({
      id: "hinh-anh",
      nhan: "Chưa có hình ảnh khóa học",
      moTa: "Tải lên hình ảnh đại diện đúng chuẩn (750x422, .jpg/.png).",
      diChuyenDen: "basics",
    });
  }

  return { hopLe: danhSachThieu.length === 0, danhSachThieu };
}

export function kiemTraCoBanGhiDangSua(
  thongTin: ThongTinKhoaHocCoBan,
  phans: PhanHocType[],
): {
  coDangSua: boolean;
  chiTiet: {
    khoaHoc: boolean;
    baiGiang: boolean;
    taiLieu: boolean;
    baiKiemTra: boolean;
    cauHoi: boolean;
    dapAn: boolean;
  };
} {
  let coDangSua = false;
  const chiTiet = {
    khoaHoc: false,
    baiGiang: false,
    taiLieu: false,
    baiKiemTra: false,
    cauHoi: false,
    dapAn: false,
  };

  if (laDangSua(thongTin)) {
    chiTiet.khoaHoc = true;
    coDangSua = true;
  }

  for (const phan of phans) {
    for (const bg of phan.DanhSachBaiGiang ?? []) {
      if (laDangSua(bg)) {
        chiTiet.baiGiang = true;
        coDangSua = true;
      }
      for (const tl of (bg as any).DanhSachTaiLieu ?? []) {
        if (laDangSua(tl)) {
          chiTiet.taiLieu = true;
          coDangSua = true;
        }
      }
    }

    for (const kt of phan.DanhDachBaiKiemTra ?? []) {
      if (laDangSua(kt)) {
        chiTiet.baiKiemTra = true;
        coDangSua = true;
      }
      for (const q of kt.cauHois ?? []) {
        if (laDangSua(q)) {
          chiTiet.cauHoi = true;
          coDangSua = true;
        }
        for (const da of q.dapAns ?? []) {
          if (laDangSua(da)) {
            chiTiet.dapAn = true;
            coDangSua = true;
          }
        }
      }
    }
  }

  return { coDangSua, chiTiet };
}
