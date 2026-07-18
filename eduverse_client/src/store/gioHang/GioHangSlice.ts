import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/index";
import { GioHangDto } from "../../types/gioHang.d";
import { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

type ApiResponse<T> = {
  status: boolean;
  message: string;
  data: T | null;
  errors: string | null;
};

export const getGioHang = createAsyncThunk<
  GioHangDto,
  void,
  { rejectValue: string }
>("gioHang/get", async (_, { rejectWithValue }) => {
  try {
    const res = await apiService.get<GioHangDto>("/giohang");
    return res.data;
  } catch (err: unknown) {
    return rejectWithValue("Lỗi tải giỏ hàng");
  }
});
export const themVaoGioHang = createAsyncThunk<
  GioHangDto,
  string,
  { rejectValue: string }
>("gioHang/them", async (khoaHocId, { rejectWithValue }) => {
  try {
    const res = await apiService.post<GioHangDto>(`/GioHang/${khoaHocId}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        err.message ||
        "Lỗi thêm vào giỏ hàng";

      return rejectWithValue(message);
    }

    return rejectWithValue("Lỗi thêm vào giỏ hàng");
  }
});

export const xoaKhoiGioHang = createAsyncThunk<
  GioHangDto,
  string,
  { rejectValue: string }
>("gioHang/xoa", async (khoaHocId, { rejectWithValue }) => {
  try {
    const res = await apiService.delete<GioHangDto>(`/giohang/${khoaHocId}`);

    return res.data;
  } catch (err: unknown) {
    return rejectWithValue(
      typeof err === "string" ? err : "Lỗi xóa khỏi giỏ hàng",
    );
  }
});

export const toggleChon = createAsyncThunk(
  "gioHang/toggleChon",
  async (khoaHocId: string, { rejectWithValue }) => {
    try {
      const res = await apiService.put<GioHangDto>(
        `/giohang/${khoaHocId}/chon`,
        {},
      );
      console.log(
        "items after toggle:",
        res.data?.items?.map((i) => ({
          id: i.idKhoaHoc,
          daChon: i.daChon,
        })),
      );
      return res.data;
    } catch (err: unknown) {
      console.log("toggleChon error:", err);
      return rejectWithValue(typeof err === "string" ? err : "Lỗi");
    }
  },
);

interface GioHangState {
  gioHang: GioHangDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: GioHangState = {
  gioHang: null,
  loading: false,
  error: null,
};

const gioHangSlice = createSlice({
  name: "gioHang",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGioHang: (state) => {
    state.gioHang = null;
    state.error = null;
    state.loading = false;
  },
  },
  extraReducers: (builder) => {
    const setLoading = (state: GioHangState) => {
      state.loading = true;
      state.error = null;
    };
    const setData = (
      state: GioHangState,
      action: PayloadAction<GioHangDto>,
    ) => {
      state.loading = false;
      state.gioHang = action.payload;
    };
    const setError = (state: GioHangState, action: PayloadAction<unknown>) => {
      state.loading = false;
      state.error = (action.payload as string) ?? "Có lỗi xảy ra";
      state.gioHang = null;
    };

    builder
      .addCase(getGioHang.pending, setLoading)
      .addCase(getGioHang.fulfilled, setData)
      .addCase(getGioHang.rejected, setError)
      .addCase(themVaoGioHang.pending, setLoading)
      .addCase(themVaoGioHang.fulfilled, setData)
      .addCase(themVaoGioHang.rejected, setError)
      .addCase(xoaKhoiGioHang.pending, setLoading)
      .addCase(xoaKhoiGioHang.fulfilled, setData)
      .addCase(xoaKhoiGioHang.rejected, setError)
      .addCase(toggleChon.pending, setLoading)
      .addCase(toggleChon.fulfilled, setData)
      .addCase(toggleChon.rejected, setError);
  },
});

export const { clearError, clearGioHang } = gioHangSlice.actions;
export default gioHangSlice.reducer;
