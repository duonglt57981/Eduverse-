import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/index";
import {
  KhoaHocDto,
  KhoaHocDetailDto,
  DanhMucDto,
  KhoaHocQueryDto,
  PagedResultDto,
} from "../../types/khoaHoc.d";

export const getKhoaHocPaged = createAsyncThunk(
  "khoaHoc/getPaged",
  async (query: KhoaHocQueryDto, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (query.pageIndex) params.append("pageIndex", String(query.pageIndex));
      if (query.pageSize) params.append("pageSize", String(query.pageSize));
      if (query.search) params.append("search", query.search);
      if (query.danhMucId) params.append("danhMucId", query.danhMucId);
      if (query.capDo) params.append("capDo", query.capDo);
      const res = await apiService.get<PagedResultDto<KhoaHocDto>>(
        `/khoahoc/paged?${params}`,
      );
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        typeof err === "string" ? err : "Lỗi tải khóa học",
      );
    }
  },
);

export const getKhoaHocById = createAsyncThunk(
  "khoaHoc/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await apiService.get<KhoaHocDetailDto>(`/khoahoc/${id}`);
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        typeof err === "string" ? err : "Lỗi tải chi tiết khóa học",
      );
    }
  },
);

export const getDanhMuc = createAsyncThunk(
  "khoaHoc/getDanhMuc",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<DanhMucDto[]>("/khoahoc/danh-muc");
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(
        typeof err === "string" ? err : "Lỗi tải danh mục",
      );
    }
  },
);

export const toggleYeuThich = createAsyncThunk(
  "khoaHoc/toggleYeuThich",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.post(`/khoahoc/${id}/yeu-thich`);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(typeof err === "string" ? err : "Lỗi");
    }
  },
);

export const getYeuThich = createAsyncThunk(
  "khoaHoc/getYeuThich",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<KhoaHocDto[]>("/khoahoc/yeu-thich");
      return res.data;
    } catch (err: unknown) {
      return rejectWithValue(typeof err === "string" ? err : "Lỗi");
    }
  },
);

export const getKhoaHocDaDangKy = createAsyncThunk(
  "khoaHoc/getDaDangKy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiService.get<PagedResultDto<KhoaHocDto>>(
        "/khoahoc/da-dang-ky"
      );
      return res.data?.items ?? [];
    } catch (err: unknown) {
      return rejectWithValue(typeof err === "string" ? err : "Lỗi");
    }
  },
);

interface KhoaHocState {
  pagedResult: PagedResultDto<KhoaHocDto> | null;
  detail: KhoaHocDetailDto | null;
  danhMucs: DanhMucDto[];
  yeuThiches: KhoaHocDto[];
  daDangKys: KhoaHocDto[];
  loading: boolean;
  error: string | null;
}

const initialState: KhoaHocState = {
  pagedResult: null,
  detail: null,
  danhMucs: [],
  yeuThiches: [],
  daDangKys: [],
  loading: false,
  error: null,
};

const khoaHocSlice = createSlice({
  name: "khoaHoc",
  initialState,
  reducers: {
    clearDetail: (state) => {
      state.detail = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getKhoaHocPaged.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKhoaHocPaged.fulfilled, (state, action) => {
        state.loading = false;
        state.pagedResult = action.payload;
      })
      .addCase(getKhoaHocPaged.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getKhoaHocById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getKhoaHocById.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload;
      })
      .addCase(getKhoaHocById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getDanhMuc.fulfilled, (state, action) => {
        state.danhMucs = action.payload;
      })

      .addCase(toggleYeuThich.fulfilled, (state, action) => {
        const id = action.payload;
        if (state.detail?.id === id)
          state.detail.daYeuThich = !state.detail.daYeuThich;
        const item = state.pagedResult?.items.find((k) => k.id === id);
        if (item) item.daYeuThich = !item.daYeuThich;
      })

      .addCase(getYeuThich.fulfilled, (state, action) => {
        state.yeuThiches = action.payload;
      })
      .addCase(getKhoaHocDaDangKy.fulfilled, (state, action) => {
        state.daDangKys = action.payload;
      });
  },
});

export const { clearDetail, clearError } = khoaHocSlice.actions;
export default khoaHocSlice.reducer;
