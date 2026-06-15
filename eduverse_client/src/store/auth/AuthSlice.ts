import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/index";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../../types/types.d";

export const login = createAsyncThunk(
  "auth/login",
  async (data: LoginRequest, { rejectWithValue }) => {
    try {
      const res = await apiService.post<AuthResponse>("/auth/login", data);
      if (typeof window !== "undefined") {
        localStorage.setItem("AccessToken", res.data.accessToken);
      }
      return res.data;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Đăng nhập thất bại";
      return rejectWithValue(message);
    }
  },
);

export const externalLogin = createAsyncThunk(
  "auth/externalLogin",
  async (
    data: { provider: string; email: string; name?: string; providerKey: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiService.post<AuthResponse>("/auth/external-login", data);
      if (typeof window !== "undefined") {
        localStorage.setItem("AccessToken", res.data.accessToken);
      }
      return res.data;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Đăng nhập bên ngoài thất bại";
      return rejectWithValue(message);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const res = await apiService.post<string>("/auth/register", data);
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Đăng ký thất bại";
      return rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiService.post("/auth/logout");
      if (typeof window !== "undefined") {
        localStorage.removeItem("AccessToken");
      }
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Đăng xuất thất bại";
      return rejectWithValue(message);
    }
  },
);
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/forgot-password", { email });
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Có lỗi xảy ra";
      return rejectWithValue(message);
    }
  },
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (
    data: { oldPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiService.post("/auth/change-password", data);
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Có lỗi xảy ra";
      return rejectWithValue(message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    data: { userId?: string; email?: string; token: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiService.post("/auth/reset-password", data);
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Có lỗi xảy ra";
      return rejectWithValue(message);
    }
  },
);

interface AuthState {
  user: AuthResponse | null;
  roles: string[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  roles: [],
  loading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(externalLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(externalLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.roles = action.payload.roles || [];
      })
      .addCase(externalLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.roles = action.payload.roles || [];
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload as string;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.roles = [];
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload as string;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload as string;
        state.user = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload as string;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;
