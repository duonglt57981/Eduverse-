import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./auth/AuthSlice";
import counterReducer from "./counter/counterSlice";
import khoaHocReducer from "./khoaHoc/KhoaHocSlice";
import gioHangReducer from "./gioHang/GioHangSlice";
import thanhToanReducer from "./thanhToan/ThanhToanSlice";
import muaSauReducer from "./danhSachMuonMuaSau/DanhSachMuonMuaSauSlice";
import rutTienReducer from "./rutTien/RutTienSlice"

// Chỉ lưu (persist) user & roles của auth.
// KHÔNG lưu loading/error/successMessage — đây là trạng thái tạm thời;
// nếu lưu lại, nút "Đăng nhập" có thể bị kẹt ở "Đang đăng nhập..." sau khi tải lại trang.
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "roles"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  counter: counterReducer,
  khoaHoc: khoaHocReducer,
  gioHang: gioHangReducer,
  thanhToan: thanhToanReducer,
  muaSau: muaSauReducer,
  rutTien: rutTienReducer,
});

// auth tự persist riêng ở trên nên loại khỏi persist gốc để tránh lưu trùng trạng thái tạm thời.
const persistConfig = { key: "root", storage, blacklist: ["auth"] };

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
