import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/index";
import {
  TaoThanhToanDto,
  TaoThanhToanResponseDto,
  DonHangDto,
} from "../../types/thanhToan.d";

export const taoThanhToan = createAsyncThunk(
  "thanhToan/tao",
  async (dto: TaoThanhToanDto, { rejectWithValue }) => {
    try {
      const res = await apiService.post<TaoThanhToanResponseDto>(
        "/thanhtoan/tao-thanh-toan",
        dto,
      );
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        typeof err === "string" ? err : "Lỗi tạo thanh toán",
      );
    }
  },
);

export const getDonHang = createAsyncThunk(
  "thanhToan/getDonHang",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<DonHangDto[]>("/thanhtoan/don-hang");
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        typeof err === "string" ? err : "Lỗi tải đơn hàng",
      );
    }
  },
);

interface ThanhToanState {
  paymentResponse: TaoThanhToanResponseDto | null;
  donHangs: DonHangDto[];
  loading: boolean;
  error: string | null;
}

const initialState: ThanhToanState = {
  paymentResponse: null,
  donHangs: [],
  loading: false,
  error: null,
};

const thanhToanSlice = createSlice({
  name: "thanhToan",
  initialState,
  reducers: {
    clearPaymentResponse: (state) => {
      state.paymentResponse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(taoThanhToan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(taoThanhToan.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentResponse = action.payload;
      })
      .addCase(taoThanhToan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getDonHang.fulfilled, (state, action) => {
        state.donHangs = action.payload;
      });
  },
});

export const { clearPaymentResponse, clearError } = thanhToanSlice.actions;
export default thanhToanSlice.reducer;
