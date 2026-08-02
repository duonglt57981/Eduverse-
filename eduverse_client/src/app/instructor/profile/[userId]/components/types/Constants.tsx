// src/app/instructor/profile/[userId]/components/Constants.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AppUser,
  GiangVienKhoaHocDto,
  KhoaHocType,
} from "@/src/types/khoaHoc/Dto/dto";

/**
 * Định dạng số tiền theo VNĐ. Trả về "Miễn phí" nếu giá = 0.
 */
export const formatGiaTien = (gia?: number): string => {
  if (gia === undefined || gia === null || gia === 0) return "Miễn phí";
  return gia.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

/**
 * Định dạng tổng thời lượng (phút) -> "Xh Ym"
 */
export const formatThoiLuong = (phut?: number): string => {
  if (!phut || phut <= 0) return "0 phút";
  const gio = Math.floor(phut / 60);
  const phutConLai = phut % 60;
  if (gio === 0) return `${phutConLai} phút`;
  if (phutConLai === 0) return `${gio} giờ`;
  return `${gio}h ${phutConLai}p`;
};

/**
 * Định dạng số lượng lớn -> 1.2k, 3.4tr, giống Udemy
 */
export const formatSoLuong = (soLuong?: number): string => {
  const n = soLuong ?? 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
};

/**
 * Trích xuất tên hiển thị an toàn, fallback về userName rồi email
 */
export const trichXuatTenHienThi = (giangVien?: AppUser): string => {
  if (!giangVien) return "Giảng viên";
  return (
    giangVien.hoTen || giangVien.userName || giangVien.email || "Giảng viên"
  );
};

/**
 * Trích xuất dữ liệu GiangVienKhoaHocDto từ nhiều dạng response khác nhau.
 * QUAN TRỌNG: giữ lại tongHocVienDangHoc / tongHocVienDangKy (và mọi field
 * khác) thay vì chỉ pick 2 field thongTinGiangVien/khoaHocs — nếu không,
 * các số liệu này sẽ bị loại bỏ ngay tại bước extract.
 */
export const trichXuatGiangVienKhoaHoc = (
  res: any,
): GiangVienKhoaHocDto | null => {
  const candidate =
    res?.data ?? res?.data?.data ?? res?.Data ?? res?.data?.Data ?? res;

  if (!candidate) return null;

  if (candidate.thongTinGiangVien && candidate.khoaHocs) {
    return {
      ...candidate,
      thongTinGiangVien: candidate.thongTinGiangVien,
      khoaHocs: candidate.khoaHocs,
      tongHocVienDangHoc: candidate.tongHocVienDangHoc,
      tongHocVienDangKy: candidate.tongHocVienDangKy,
    };
  }

  if (candidate.ThongTinGiangVien && candidate.KhoaHocs) {
    return {
      ...candidate,
      thongTinGiangVien: candidate.ThongTinGiangVien,
      khoaHocs: candidate.KhoaHocs,
      tongHocVienDangHoc:
        candidate.tongHocVienDangHoc ?? candidate.TongHocVienDangHoc,
      tongHocVienDangKy:
        candidate.tongHocVienDangKy ?? candidate.TongHocVienDangKy,
    };
  }

  return null;
};

export const tinhTongHocVien = (danhSach: KhoaHocType[]): number =>
  danhSach.reduce((tong, kh) => tong + (kh.soLuongHocVien ?? 0), 0);

export const CAP_DO_MAU: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  "Cơ bản": "success",
  "Trung cấp": "warning",
  "Nâng cao": "error",
};
