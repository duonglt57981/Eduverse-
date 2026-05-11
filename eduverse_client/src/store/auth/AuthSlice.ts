// import { LoginResponseType } from "@/types/appUser/dto";
// import { AppUserType } from "@/types/appUser/dto";
// import { ApiResponse } from "@/types/general";
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// interface StateType {
//   AccessToken?: string;
//   User: AppUserType | null;
//   ListRole: string[] | null;
// }

// const initialState: StateType = {
//   AccessToken: "",
//   User: null,
//   ListRole: [],
// };

// export const AuthSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setLogin: (
//       state: StateType,
//       action: PayloadAction<ApiResponse<LoginResponseType>>
//     ) => {
//       if (action.payload.data && action.payload.data != null) {
//         const data = action.payload.data;
//         state.AccessToken = data.token;
//         localStorage.setItem("AccessToken", data.token || "");
//         state.User = data.user || null;
//       }
//     },
//     setUserInfo: (
//       state: StateType,
//       action: PayloadAction<ApiResponse<AppUserType>>
//     ) => {
//       if (action.payload.data != null) {
//         state.User = action.payload.data || null;
//         state.ListRole = action.payload.data?.listRole || [];
//       }
//     },
//     setListRole: (state: StateType, action: PayloadAction<ApiResponse>) => {
//       if (action.payload.data != null) {
//         state.ListRole = action.payload.data?.user?.listRole || [];
//       }
//     },

//     setLogout: (state: StateType) => {
//       localStorage.removeItem("AccessToken");
//       state.AccessToken = "";
//       state.User = null;
//       state.ListRole = null;
//     },
//   },
// });

// export const { setLogin, setUserInfo, setLogout } = AuthSlice.actions;

// export default AuthSlice.reducer;
