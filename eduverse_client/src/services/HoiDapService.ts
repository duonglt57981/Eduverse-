/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from ".";

export interface DatCauHoiRequest {
  idKhoaHoc: string;
  idBaiGiang?: string | null;
  noiDung: string;
}

export interface TraLoiRequest {
  idCauHoi: string;
  noiDung: string;
}

export interface SearchHoiDapRequest {
  idKhoaHoc: string;
  idBaiGiang?: string | null;
  keyword?: string;
  chiCuaToi?: boolean;
  sapXep?: "MoiNhat" | "NhieuTraLoi" | "DaGhim";
  pageNumber?: number;
  pageSize?: number;
  chuaTraLoi?: boolean;
  chuaDoc?: boolean;
  nhieuLike?: boolean;
}

export interface TraLoiDto {
  id: string;
  noiDung: string;
  laGiangVien: boolean;
  ghimTraLoi: boolean;
  soLike: number;
  daLike: boolean;
  nguoiTraLoiId?: string;
  nguoiTraLoiTen?: string;
  nguoiTraLoiAnh?: string;
  ngayTao: string;
  laCuaToi: boolean;
}

export interface HoiDapDto {
  id: string;
  idBaiGiang?: string;
  tenBaiGiang?: string;
  noiDung: string;
  daGhim: boolean;
  daDong: boolean;
  soTraLoi: number;
  nguoiHoiId?: string;
  nguoiHoiTen?: string;
  nguoiHoiAnh?: string;
  ngayTao: string;
  laCuaToi: boolean;
  tongLike?: number;
  danhSachTraLoi: TraLoiDto[];
}

export interface ReplyRequest {
  idCauHoi: string;
  idTraLoiDuocReply: string;
  noiDung: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

class HoiDapService {
  async GetDanhSach(
    request: SearchHoiDapRequest,
  ): Promise<PagedResult<HoiDapDto>> {
    console.log("📤 GetDanhSach called với:", request);
    const params = new URLSearchParams();
    Object.entries(request).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    const res = await apiService.get(`/HoiDap/danh-sach?${params.toString()}`);

    console.log("🔍 HoiDap GetDanhSach raw:", res.data);

    // Thử cả 2 cấu trúc:
    const rawData = res.data as any;

    // Nếu BE wrap { message, data: { items, ... } }
    if (rawData?.data?.items) {
      const d = rawData.data;
      console.log("✅ Dùng rawData.data.items:", d.items);
      return {
        items: d.items ?? [],
        totalCount: d.totalCount ?? 0,
        pageNumber: d.pageIndex ?? 1,
        pageSize: d.pageSize ?? 10,
        totalPages: d.totalPage ?? 0,
      };
    }

    // Nếu BE trả thẳng { items, totalCount, ... }
    if (rawData?.items) {
      console.log("✅ Dùng rawData.items:", rawData.items);
      return {
        items: rawData.items ?? [],
        totalCount: rawData.totalCount ?? 0,
        pageNumber: rawData.pageIndex ?? 1,
        pageSize: rawData.pageSize ?? 10,
        totalPages: rawData.totalPage ?? 0,
      };
    }

    console.log("❌ Không parse được response");
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
    };
  }
  async GetDanhSachChoGiangVien(
    request: SearchHoiDapRequest,
  ): Promise<PagedResult<HoiDapDto>> {
    const params = new URLSearchParams();
    Object.entries(request).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    console.log("📤 GetDanhSachChoGiangVien request:", request);
    const res = await apiService.get(
      `/HoiDap/giang-vien/danh-sach?${params.toString()}`,
    );
    console.log("📥 GetDanhSachChoGiangVien raw response:", res.data);

    const rawData = res.data as any;
    const d = rawData?.data?.items
      ? rawData.data
      : rawData?.items
        ? rawData
        : null;

    if (!d) {
      console.log(
        "❌ Không parse được — kiểm tra rawData.message:",
        rawData?.message,
      );
    }

    return {
      items: d?.items ?? [],
      totalCount: d?.totalCount ?? 0,
      pageNumber: d?.pageIndex ?? 1,
      pageSize: d?.pageSize ?? 10,
      totalPages: d?.totalPage ?? 0,
    };
  }

  async GhimTopAnswer(idTraLoi: string, ghim: boolean): Promise<void> {
    await apiService.put(`/HoiDap/${idTraLoi}/top-answer?ghim=${ghim}`);
  }

  async GetChiTiet(idCauHoi: string): Promise<HoiDapDto> {
    const res = await apiService.get(`/HoiDap/${idCauHoi}`);
    console.log("🔎 res (chưa .data):", res);
    return (res as { data: HoiDapDto }).data;
  }

  async DatCauHoi(request: DatCauHoiRequest): Promise<HoiDapDto> {
    const res = await apiService.post("/HoiDap/dat-cau-hoi", request);
    return (res as { data: HoiDapDto }).data;
  }

  async TraLoi(request: TraLoiRequest): Promise<TraLoiDto> {
    const res = await apiService.post("/HoiDap/tra-loi", request);
    return (res as { data: TraLoiDto }).data;
  }

  async ToggleLike(idTraLoi: string): Promise<number> {
    const res = await apiService.post(`/HoiDap/${idTraLoi}/like`);
    return (res as { data: number }).data ?? 0;
  }

  async Reply(request: ReplyRequest): Promise<TraLoiDto> {
    const res = await apiService.post("/HoiDap/reply", request);
    return (res as { data: TraLoiDto }).data;
  }

  async GhimCauHoi(idCauHoi: string, ghim: boolean): Promise<void> {
    await apiService.put(`/HoiDap/${idCauHoi}/ghim?ghim=${ghim}`);
  }

  async GhimTraLoi(idTraLoi: string, ghim: boolean): Promise<void> {
    await apiService.put(`/HoiDap/${idTraLoi}/ghim-tra-loi?ghim=${ghim}`);
  }

  async DongCauHoi(idCauHoi: string, dong: boolean): Promise<void> {
    await apiService.put(`/HoiDap/${idCauHoi}/dong?dong=${dong}`);
  }

  async XoaCauHoi(idCauHoi: string): Promise<void> {
    await apiService.delete(`/HoiDap/cau-hoi/${idCauHoi}`);
  }

  async XoaTraLoi(idTraLoi: string): Promise<void> {
    await apiService.delete(`/HoiDap/tra-loi/${idTraLoi}`);
  }
}

export default new HoiDapService();
