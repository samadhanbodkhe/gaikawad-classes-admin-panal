import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../apis/authApi";

const authSlice = createSlice({
    name: "authSlice",
    initialState: {
        admin: JSON.parse(localStorage.getItem("admin")) || null,
        adminToken: localStorage.getItem("adminToken") || null,
    },
    reducers: {},
    extraReducers: builder => builder
        .addMatcher(authApi.endpoints.verifyAdmin.matchFulfilled, (state, { payload }) => {
            state.admin = payload.admin;
            state.adminToken = payload.token;
            localStorage.setItem("admin", JSON.stringify(payload.admin));
            localStorage.setItem("adminToken", payload.token);
        })
        .addMatcher(authApi.endpoints.logoutAdmin.matchFulfilled, (state) => {
            state.admin = null;
            state.adminToken = null;
            localStorage.removeItem("admin");
            localStorage.removeItem("adminToken");
        })
});

export default authSlice.reducer;
