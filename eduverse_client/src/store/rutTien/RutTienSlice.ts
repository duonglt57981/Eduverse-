/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/index";
import axios from "axios";

export interface NganHangDto {
  id: string;
  tenNganHang?: string;
  tenTaiKhoan?: string;
  soTaiKhoan?: string;
  hinhAnhQR?: string;
  trangThai?: string;
}

export interface YeuCauRutTienDto {
  id: string;
  soTienRut?: number;
  trangThai?: string;
  ngayYeuCau?: string;
  ngayXuLy?: string;
  tenNganHang?: string;
  soTaiKhoan?: string;
  tenTaiKhoan?: string;
  tenGiangVien?: string;
  soDuHienTai?: number;
  hinhAnhQR?: string;
}
export interface ThongBaoDto {
  id: string;
  tieuDe?: string;
  noiDung?: string;
  daDoc?: boolean;
  thoiGianDoc?: string;
  thoiGianTao?: string;
  trangThai?: string;
  loaiThongBao?: string;
  idNguoiDung?: string;
}
// ── NganHang thunks ──
export const getNganHangs = createAsyncThunk(
  "rutTien/getNganHangs",
  async () => {
    const res = await apiService.get<NganHangDto[]>("/nganhang");
    return res.data;
  },
);

export const themNganHang = createAsyncThunk(
  "rutTien/themNganHang",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await apiService.post<NganHangDto>("/nganhang", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Lỗi thêm ngân hàng",
        );
      }
      return rejectWithValue("Lỗi thêm ngân hàng");
    }
  },
);
export const xoaNganHang = createAsyncThunk(
  "rutTien/xoaNganHang",
  async (id: string) => {
    await apiService.delete(`/nganhang/${id}`);
    return id;
  },
);

// ── YeuCauRutTien thunks ──
export const getSoDu = createAsyncThunk("rutTien/getSoDu", async () => {
  const res = await apiService.get<number>("/yeucauruttien/so-du");
  return res.data;
});

export const getLichSuRutTien = createAsyncThunk(
  "rutTien/getLichSu",
  async () => {
    const res = await apiService.get<YeuCauRutTienDto[]>(
      "/yeucauruttien/cua-toi",
    );
    return res.data;
  },
);

export const taoYeuCauRutTien = createAsyncThunk(
  "rutTien/taoYeuCau",
  async (
    dto: { soTienRut: number; idNganHang: string; otp: string },
    { rejectWithValue },
  ) => {
    try {
      await apiService.post("/yeucauruttien", dto);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        return rejectWithValue(
          err.response?.data?.message ?? "Lỗi tạo yêu cầu",
        );
      }

      return rejectWithValue("Lỗi tạo yêu cầu");
    }
  },
);

export const huyYeuCau = createAsyncThunk(
  "rutTien/huyYeuCau",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/yeucauruttien/${id}/huy`);
      return id;
    } catch (e: unknown) {
      return rejectWithValue((e as any)?.response?.data?.message ?? "Lỗi");
    }
  },
);
// ── Admin thunks ──
export const getTatCaYeuCau = createAsyncThunk("rutTien/getTatCa", async () => {
  const res = await apiService.get<YeuCauRutTienDto[]>("/yeucauruttien/tat-ca");
  return res.data;
});

export const xuLyYeuCau = createAsyncThunk(
  "rutTien/xuLy",
  async (dto: { id: string; trangThai: string; ghiChu?: string }) => {
    await apiService.put(`/yeucauruttien/${dto.id}/xu-ly`, {
      trangThai: dto.trangThai,
      ghiChu: dto.ghiChu,
    });
    return dto.id;
  },
);

// ── ThongBao thunks ──
export const getThongBaoCuaToi = createAsyncThunk(
  "rutTien/getThongBao",
  async () => {
    const res = await apiService.get<ThongBaoDto[]>("/thongbao");
    return res.data;
  },
);

export const getThongBaoAdmin = createAsyncThunk(
  "rutTien/getThongBaoAdmin",
  async () => {
    const res = await apiService.get<ThongBaoDto[]>("/thongbao/admin");
    return res.data;
  },
);

export const danhDauDaDoc = createAsyncThunk(
  "rutTien/daDoc",
  async (id: string) => {
    await apiService.put(`/thongbao/${id}/da-doc`);
    return id;
  },
);

export const docTatCa = createAsyncThunk("rutTien/docTatCa", async () => {
  await apiService.put("/thongbao/doc-tat-ca");
});

// ── Slice ──
interface RutTienState {
  soDu: number;
  nganHangs: NganHangDto[];
  lichSu: YeuCauRutTienDto[];
  tatCaYeuCau: YeuCauRutTienDto[];
  thongBaos: ThongBaoDto[];
  thongBaoAdmins: ThongBaoDto[];
  loading: boolean;
  error: string | null;
}

const initialState: RutTienState = {
  soDu: 0,
  nganHangs: [],
  lichSu: [],
  tatCaYeuCau: [],
  thongBaos: [],
  thongBaoAdmins: [],
  loading: false,
  error: null,
};

const rutTienSlice = createSlice({
  name: "rutTien",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSoDu.fulfilled, (state, action) => {
        state.soDu = action.payload ?? 0;
      })
      .addCase(getNganHangs.fulfilled, (state, action) => {
        state.nganHangs = action.payload;
      })
      .addCase(themNganHang.fulfilled, (state, action) => {
        state.nganHangs.push(action.payload);
      })
      .addCase(xoaNganHang.fulfilled, (state, action) => {
        state.nganHangs = state.nganHangs.filter(
          (n) => n.id !== action.payload,
        );
      })
      .addCase(getLichSuRutTien.fulfilled, (state, action) => {
        state.lichSu = action.payload;
      })
      .addCase(getTatCaYeuCau.fulfilled, (state, action) => {
        state.tatCaYeuCau = action.payload;
      })
      .addCase(huyYeuCau.fulfilled, (state, action) => {
        state.lichSu = state.lichSu.map((y) =>
          y.id === action.payload ? { ...y, trangThai: "DaHuy" } : y,
        );
      })
      .addCase(xuLyYeuCau.fulfilled, (state, action) => {
        state.tatCaYeuCau = state.tatCaYeuCau.filter(
          (y) => y.id !== action.payload,
        );
      })
      .addCase(getThongBaoCuaToi.fulfilled, (state, action) => {
        state.thongBaos = action.payload;
      })
      .addCase(getThongBaoAdmin.fulfilled, (state, action) => {
        state.thongBaoAdmins = action.payload;
      })
      .addCase(danhDauDaDoc.fulfilled, (state, action) => {
        const tb = state.thongBaos.find((t) => t.id === action.payload);
        if (tb) tb.daDoc = true;
      })
      .addCase(docTatCa.fulfilled, (state) => {
        state.thongBaos = state.thongBaos.map((t) => ({ ...t, daDoc: true }));
      });
  },
});

export default rutTienSlice.reducer;
