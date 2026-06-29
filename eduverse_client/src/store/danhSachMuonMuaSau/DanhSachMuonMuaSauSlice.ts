import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/index";
import { DanhSachMuonMuaSauDto } from "../../types/danhSachMuonMuaSau.d";

export const getDanhSachMuaSau = createAsyncThunk<DanhSachMuonMuaSauDto[], void>(
  "muaSau/getAll",
  async () => {
    const res = await apiService.get<DanhSachMuonMuaSauDto[]>("/danhsachmuonmuasau");
    return res.data;
  }
);

export const luuMuaSau = createAsyncThunk<void, string>(
  "muaSau/luu",
  async (khoaHocId) => {
    await apiService.post(`/danhsachmuonmuasau/${khoaHocId}`);
  }
);

export const xoaKhoiMuaSau = createAsyncThunk<void, string>(
  "muaSau/xoa",
  async (khoaHocId) => {
    await apiService.delete(`/danhsachmuonmuasau/${khoaHocId}`);
  }
);

export const chuyenVaoGioHang = createAsyncThunk<void, string>(
  "muaSau/chuyenVaoGioHang",
  async (khoaHocId) => {
    await apiService.post(`/danhsachmuonmuasau/${khoaHocId}/chuyen-vao-gio-hang`);
  }
);

interface State {
  items: DanhSachMuonMuaSauDto[];
  loading: boolean;
}

const initialState: State = { items: [], loading: false };

const slice = createSlice({
  name: "muaSau",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDanhSachMuaSau.pending, (state) => { state.loading = true; })
      .addCase(getDanhSachMuaSau.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getDanhSachMuaSau.rejected, (state) => { state.loading = false; });
  },
});

export default slice.reducer;