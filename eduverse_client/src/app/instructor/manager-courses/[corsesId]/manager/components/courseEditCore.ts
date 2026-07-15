import { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
import { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";

export const MAU = {
  chinh: "#8B1313",
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

// Tính tổng thời lượng (giây) từ danh sách bài giảng
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
export const SO_TU_MO_TA_TOI_THIEU = 200;

export function demSoTu(vanBan: string): number {
  const text = vanBan.replace(/<[^>]*>/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
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
  thongTin: KhoaHocType,
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
  if (phans.length === 0 || !coBaiGiangCoVideo) {
    danhSachThieu.push({
      id: "noi-dung",
      nhan: "Chưa có nội dung bài giảng",
      moTa: "Thêm ít nhất 1 phần học với 1 bài giảng đã tải video.",
      diChuyenDen: "curriculum",
    });
  }

  // Kiểm tra bài kiểm tra rỗng (nếu có)
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

  if (!thongTin.tieuDe || thongTin.tieuDe.trim().length < 10) {
    danhSachThieu.push({
      id: "tieu-de",
      nhan: "Tên khóa học chưa đủ rõ ràng",
      moTa: "Nhập tên khóa học tối thiểu 10 ký tự.",
      diChuyenDen: "basics",
    });
  }

  const soTuMoTa = demSoTu(thongTin.moTa || "");
  if (soTuMoTa < SO_TU_MO_TA_TOI_THIEU) {
    danhSachThieu.push({
      id: "mo-ta",
      nhan: "Mô tả khóa học chưa đủ dài",
      moTa: `Mô tả cần tối thiểu ${SO_TU_MO_TA_TOI_THIEU} từ (hiện tại: ${soTuMoTa} từ).`,
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
