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
  mieuTa: string; // Lưu HTML
}

// Bài giảng: bắt buộc có video, có cờ miễn phí, không còn loại/mô tả rich-text.
export interface BaiGiangForm {
  tieuDe: string;
  laBaiGiangFree: boolean;
  videoFile: File | null;
}

export interface CourseForm {
  tieuDe: string;
  moTa: string; // Lưu HTML
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


export type ApiListShape<T> =
  | T[]
  | { data?: T[] | null; items?: T[] | null }
  | null
  | undefined;
