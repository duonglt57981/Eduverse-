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
    const params = new URLSearchParams();
    Object.entries(request).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        params.append(k, String(v));
      }
    });
    const res = await apiService.get(`/HoiDap/danh-sach?${params.toString()}`);

    // Thêm dòng này để xem cấu trúc thực tế
    console.log("🔍 HoiDap response:", JSON.stringify(res.data, null, 2));

    const data = res.data as {
      items: HoiDapDto[];
      pageIndex: number;
      pageSize: number;
      totalCount: number;
      totalPage: number;
    };
    return {
      items: data.items ?? [],
      totalCount: data.totalCount ?? 0,
      pageNumber: data.pageIndex ?? 1,
      pageSize: data.pageSize ?? 10,
      totalPages: data.totalPage ?? 0,
    };
  }

  async GetChiTiet(idCauHoi: string): Promise<HoiDapDto> {
    const res = await apiService.get(`/HoiDap/${idCauHoi}`);
    return res.data as HoiDapDto;
  }
  async DatCauHoi(request: DatCauHoiRequest): Promise<HoiDapDto> {
    const res = await apiService.post("/HoiDap/dat-cau-hoi", request);
    return res.data as HoiDapDto;
  }

  async TraLoi(request: TraLoiRequest): Promise<TraLoiDto> {
    const res = await apiService.post("/HoiDap/tra-loi", request);
    return res.data as TraLoiDto;
  }

  async Reply(request: ReplyRequest): Promise<TraLoiDto> {
    const res = await apiService.post("/HoiDap/reply", request);
    return res.data as TraLoiDto;
  }

  async ToggleLike(idTraLoi: string): Promise<number> {
    const res = await apiService.post(`/HoiDap/${idTraLoi}/like`);
    return (res.data as number) ?? 0;
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
