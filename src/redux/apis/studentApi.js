// src/apis/studentApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/student`,
    credentials: "include",
  }),
  tagTypes: ["Student"],
  endpoints: (builder) => ({
    getAllStudents: builder.query({
      query: () => ({
        url: "/getAllStudents",
        method: "GET",
      }),
      providesTags: ["Student"],
    }),
    getStudentById: builder.query({
      query: (id) => ({
        url: `/getStudentById/${id}`,
        method: "GET",
      }),
      providesTags: ["Student"],
    }),
    getFeeSummary: builder.query({
      query: () => ({
        url: "/getFeeSummary",
        method: "GET",
      }),
    }),
  }),
});

export const { 
  useGetAllStudentsQuery, 
  useGetStudentByIdQuery,
  useGetFeeSummaryQuery,
} = studentApi;