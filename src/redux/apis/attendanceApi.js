import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/attendance`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const adminToken = localStorage.getItem("adminToken");
      const teacherToken = localStorage.getItem("teacherToken");
      
      if (adminToken) {
        headers.set("Authorization", `Bearer ${adminToken}`);
      } else if (teacherToken) {
        headers.set("Authorization", `Bearer ${teacherToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Attendance", "Teachers"],
  endpoints: (builder) => ({
    getAttendances: builder.query({
      query: (params = {}) => ({
        url: "/getAttendances",
        params: {
          date: params.date,
          status: params.status,
          page: params.page,
          limit: params.limit
        }
      }),
      providesTags: ["Attendance"],
    }),
    markAttendance: builder.mutation({
      query: (attendanceData) => ({
        url: "/markAttendance",
        method: "POST",
        body: attendanceData,
      }),
      invalidatesTags: ["Attendance"],
    }),
    getAttendanceById: builder.query({
      query: (id) => `/getAttendanceById/${id}`,
    }),
    getAttendanceTeacher: builder.query({
      query: () => "/getAttendanceTeachers",
      providesTags: ["Teachers"],
    }),
  }),
});

export const {
  useGetAttendancesQuery,
  useMarkAttendanceMutation,
  useGetAttendanceByIdQuery,
  useGetAttendanceTeacherQuery,
} = attendanceApi;