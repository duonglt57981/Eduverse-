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
    data: { provider: string; email?: string; name?: string; providerKey?: string; token?: string },
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

export const sendRegisterOtp = createAsyncThunk(
  "auth/sendRegisterOtp",
  async (data: { email: string; userName: string }, { rejectWithValue }) => {
    try {
      const res = await apiService.post<string>("/auth/send-register-otp", data);
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Gửi mã OTP thất bại";
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
/** Kênh nhận mã OTP khi khôi phục mật khẩu. */
export type OtpChannel = "Email" | "Sms";

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (
    payload: { identifier: string; channel?: OtpChannel },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiService.post("/auth/forgot-password", {
        identifier: payload.identifier,
        channel: payload.channel ?? "Email",
      });
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Có lỗi xảy ra";
      return rejectWithValue(message);
    }
  },
);

/** Gửi mã OTP để xác minh số điện thoại (yêu cầu đã đăng nhập). */
export const sendPhoneOtp = createAsyncThunk(
  "auth/sendPhoneOtp",
  async (phoneNumber: string, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/send-phone-otp", { phoneNumber });
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Không gửi được mã xác minh";
      return rejectWithValue(message);
    }
  },
);

/** Xác nhận OTP để đánh dấu số điện thoại đã xác minh. */
export const confirmPhoneOtp = createAsyncThunk(
  "auth/confirmPhoneOtp",
  async (data: { phoneNumber: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await apiService.post("/auth/confirm-phone-otp", data);
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Xác minh thất bại";
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
    data: {
      identifier: string;
      channel?: OtpChannel;
      resetToken: string;
      newPassword: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiService.post("/auth/reset-password", {
        ...data,
        channel: data.channel ?? "Email",
      });
      return res.message;
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Có lỗi xảy ra";
      return rejectWithValue(message);
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (
    data: { identifier: string; channel?: OtpChannel; otp: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiService.post<string>("/auth/verify-otp", {
        ...data,
        channel: data.channel ?? "Email",
      });
      return res.data; // reset token ngắn hạn
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : "Xác minh OTP thất bại";
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
    updateAccessToken: (state, action) => {
      if (state.user) {
        state.user.accessToken = action.payload;
      }
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
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;
