// src/redux/apis/teacherApproveRejectApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const teacherApproveRejectApi = createApi({
  reducerPath: "teacherApproveRejectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/approveReject`,
    credentials: "include",
      prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
  }),
  tagTypes: ["TeacherRequests", "Teachers"],
  endpoints: (builder) => ({
    getPendingTeachers: builder.query({
      query: () => "/teacher-requests",
      providesTags: ["TeacherRequests"],
    }),
     getRejectedTeachers: builder.query({
      query: () => '/rejected',
      providesTags: ['TeacherRequests'],
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
      invalidatesTags: ["TeacherRequests"],
    }),
  }),
});

export const {
  useGetPendingTeachersQuery,
  useGetAllTeachersQuery,
  useGetRejectedTeachersQuery,
  useGetTeacherDetailsQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} = teacherApproveRejectApi;