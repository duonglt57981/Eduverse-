/* eslint-disable */
export interface EntityType {
  id: string;
  createdDate?: Date;
  createdBy?: string;
  updatedDate?: Date;
  updatedBy?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status?: boolean;
  message?: string;
  errors?: string[] | null;
}

export type Response<T = any> = ApiResponse<T>;

export interface Dictionary<T = any> {
  [key: string]: T;
}

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface PagedList<T = any> {
  forEach(arg0: (c: HoSoComment) => Map<number, HoSoComment>): unknown;
  items: T[];
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

export interface DropdownOptionTree {
  value: string;
  title: string;
  children: DropdownOptionTree[];
}

//#region cũ không xài nữa
export interface ResponsePageList<T = any> {
  items: T;
  pageIndex?: int;
  pageSize?: int;
  totalCount?: int;
  totalPage?: int;
}

export interface ResponsePageInfo {
  pageIndex?: int;
  pageSize?: int;
  totalCount?: int | 0;
  totalPage?: int | 0;
}

export interface SearchBase {
  pageIndex?: int | 1;
  pageSize?: int | 20;
}

export interface DataImport {
  idFile: string;
  collection: tableConfigImport[];
}
export interface FieldAndSTTType {
  order: number;
  columnName: string;
  displayName: string;
}

export interface ConfigImport {
  order: number;
  columnName?: string;
  displayName?: string;
}
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  hoTen: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  userName: string;
  hoTen: string;
  email: string;
  roles: string[];
  anhDaiDien?: string;
}
