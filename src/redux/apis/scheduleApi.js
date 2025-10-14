import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scheduleApi = createApi({
    reducerPath: "scheduleApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/schedule`,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.adminToken;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Schedule", "Teacher"],
    endpoints: (builder) => ({
        getAllSchedules: builder.query({
            query: () => "/getSchedules",
            providesTags: ["Schedule"],
        }),
        createSchedule: builder.mutation({
            query: (data) => ({
                url: "/createSchedule",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Schedule"],
        }),
        updateSchedule: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/updateSchedule/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Schedule"],
        }),
        deleteSchedule: builder.mutation({
            query: (id) => ({
                url: `/deleteSchedule/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Schedule"],
        }),
        getAllTeachers: builder.query({
            query: () => "/getScheduleTeachers",
            providesTags: ["Teacher"],
        }),
        getTodaysSchedules: builder.query({
            query: () => "/getTodaysSchedules",
            providesTags: ["Schedule"],
        }),
    }),
});

export const {
    useGetAllSchedulesQuery,
    useCreateScheduleMutation,
    useUpdateScheduleMutation,
    useDeleteScheduleMutation,
    useGetAllTeachersQuery,
    useGetTodaysSchedulesQuery
} = scheduleApi;
