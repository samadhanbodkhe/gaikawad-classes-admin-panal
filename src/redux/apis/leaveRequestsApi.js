import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const leaveRequestsApi = createApi({
    reducerPath: "leaveRequestsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/leaveRequest`,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.adminToken;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["LeaveRequests"],
    endpoints: (builder) => ({
        // Get all leave requests with filters
        getLeaveRequests: builder.query({
            query: (params = {}) => ({
                url: "/getLeaveRequests",
                params: {
                    page: params.page || 1,
                    limit: params.limit || 50,
                    status: params.status || ""
                }
            }),
            providesTags: ["LeaveRequests"]
        }),

        // Process leave request (approve/reject)
        processLeaveRequest: builder.mutation({
            query: ({ id, status }) => ({
                url: `/processLeaveRequest/${id}`,
                method: "PUT",
                body: { status }
            }),
            invalidatesTags: ["LeaveRequests"]
        }),

        // Get leave request by ID
        getLeaveRequestById: builder.query({
            query: (id) => `/getLeaveRequestById/${id}`,
            providesTags: ["LeaveRequests"]
        })
    }),
});

export const {
    useGetLeaveRequestsQuery,
    useProcessLeaveRequestMutation,
    useGetLeaveRequestByIdQuery
} = leaveRequestsApi;