import { createSlice } from "@reduxjs/toolkit";
import { dashboardApi } from "../apis/dashboardApi";

const dashboardSlice = createSlice({
  name: "dashboardSlice",
  initialState: {
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(dashboardApi.endpoints.getDashboardStats.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(dashboardApi.endpoints.getDashboardStats.matchFulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload?.data || null;
      })
      .addMatcher(dashboardApi.endpoints.getDashboardStats.matchRejected, (state, { error }) => {
        state.loading = false;
        state.error = error?.message || "Failed to fetch dashboard stats";
      });
  },
});

export default dashboardSlice.reducer;
