"use client";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../store/store";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
        {children}
    </Provider>
  );
}
