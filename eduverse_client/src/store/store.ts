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

const persistConfig = { key: "root", storage };

const rootReducer = combineReducers({
  auth: authReducer,
  counter: counterReducer,
  khoaHoc: khoaHocReducer,
  gioHang: gioHangReducer,
  thanhToan: thanhToanReducer,
  muaSau: muaSauReducer,
  rutTien: rutTienReducer,
});

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
