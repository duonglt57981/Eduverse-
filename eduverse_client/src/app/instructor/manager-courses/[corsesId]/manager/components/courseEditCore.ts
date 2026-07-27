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

export const THOI_LUONG_TOI_THIEU_GIAY = 30 * 60;
export const SO_KY_TU_TIEU_DE_TOI_THIEU = 10;
export const SO_KY_TU_MO_TA_TOI_THIEU = 200;
export const SO_KY_TU_MO_TA_TOI_DA = 9999;

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
