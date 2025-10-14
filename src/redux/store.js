import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/authApi";
import adminAuthSlice from "./slice/authSlice"
import { dashboardApi } from "./apis/dashboardApi";
import dashboardSlice from "./slice/dashboardSlice"
import { teacherApproveRejectApi } from "./apis/teacherApproveRejectApi";
import { scheduleApi } from "./apis/scheduleApi";
import { leaveRequestsApi } from "./apis/leaveRequestsApi";
import { salaryApi } from "./apis/salaryApi";
import { attendanceApi } from "./apis/attendanceApi";
import { studentApi } from "./apis/studentApi";

const reduxStore = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [dashboardApi.reducerPath]: dashboardApi.reducer,
        [teacherApproveRejectApi.reducerPath]: teacherApproveRejectApi.reducer,
        [scheduleApi.reducerPath]: scheduleApi.reducer,
        [leaveRequestsApi.reducerPath]: leaveRequestsApi.reducer,
        [salaryApi.reducerPath]: salaryApi.reducer,
        [attendanceApi.reducerPath]: attendanceApi.reducer,
        [studentApi.reducerPath]: studentApi.reducer,
        auth: adminAuthSlice,
        dashboard: dashboardSlice,

    },
    middleware: def => [
        ...def(),
        authApi.middleware,
        dashboardApi.middleware,
        teacherApproveRejectApi.middleware,
        scheduleApi.middleware,
        leaveRequestsApi.middleware,
        salaryApi.middleware,
        attendanceApi.middleware,
        studentApi.middleware,

    ]
})

export default reduxStore