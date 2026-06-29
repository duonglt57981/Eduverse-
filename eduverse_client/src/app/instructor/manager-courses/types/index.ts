// src/app/instructor/manager-courses/types/index.ts
export type { KhoaHocType } from "@/src/types/khoaHoc/Dto/dto";
export type { PhanHocType } from "@/src/types/PhanHoc/Dto/PhanHocdto";
export type { BaiGiangType } from "@/src/types/BaiGiang/Dto/BaiGiangDto";
export type { TaiLieuType } from "@/src/types/TaiLieu/Dto/TaiLieuDto";
export type { DanhMucDto } from "@/src/types/danhmuc";

export type ToastSeverity = "success" | "error" | "info";

export interface ToastState {
  msg: string;
  sev: ToastSeverity;
}

export interface PhanForm {
  tenPhan: string;
  mieuTa: string;
}

export interface BaiGiangForm {
  tieuDe: string;
  loaiBaiGiang: string;
  thoiLuong: string;
}

export interface CourseForm {
  tieuDe: string;
  moTa: string;
  gia: string;
  giaGoc: string;
  capDo: string;
  idDanhMucList: string[];
}

export interface MenuAnchorState<T> {
  el: HTMLElement;
  data: T;
}

// ─── Group version types ──────────────────────────────────────────────────────

export interface VersionGroup<T> {
  current: T | null;
  drafts: T[];
  all: T[];
}

export interface Versionable {
  id?: string;
  idBanGhiTruoc?: string | null;
  isBanHienTai?: boolean;
}
