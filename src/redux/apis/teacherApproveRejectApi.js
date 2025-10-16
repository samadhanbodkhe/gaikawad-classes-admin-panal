// src/redux/apis/teacherApproveRejectApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherApproveRejectApi = createApi({
  reducerPath: "teacherApproveRejectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/approveReject`,
    credentials: "include",
  }),
  tagTypes: ["TeacherRequests", "Teachers"],
  endpoints: (builder) => ({
    getPendingTeachers: builder.query({
      query: () => "/teacher-requests",
      providesTags: ["TeacherRequests"],
    }),
    getAllTeachers: builder.query({
      query: () => "/getAllTeachers",
      providesTags: ["Teachers"],
    }),
    getTeacherDetails: builder.query({
      query: (id) => `/teacher-details/${id}`,
      providesTags: ["Teachers"],
    }),
    approveTeacher: builder.mutation({
      query: (id) => ({
        url: `/teacherApprove/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["TeacherRequests", "Teachers"],
    }),
    rejectTeacher: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/teacherReject/${id}`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["TeacherRequests", "Teachers"],
    }),
  }),
});

export const {
  useGetPendingTeachersQuery,
  useGetAllTeachersQuery,
  useGetTeacherDetailsQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} = teacherApproveRejectApi;