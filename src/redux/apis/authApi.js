import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL}/adminAuth`,
        credentials: "include"
    }),
    tagTypes: ["auth"],
    endpoints: (builder) => ({
        loginAdmin: builder.mutation({
            query: (userData) => ({
                url: "/Admin-login",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["auth"],
        }),

        verifyAdmin: builder.mutation({
            query: (otpData) => ({
                url: "/Admin-verifyOtp",
                method: "POST",
                body: otpData,
            }),
            invalidatesTags: ["auth"],
            transformResponse: (response) => {
                if (response?.admin) {
                    localStorage.setItem("admin", JSON.stringify(response.admin));
                }
                return response;
            }
        }),

        logoutAdmin: builder.mutation({
            query: () => ({
                url: "/logout-admin",
                method: "POST",
            }),
            invalidatesTags: ["auth"],
            transformResponse: (response) => {
                localStorage.removeItem("admin");
                return response;
            },
        }),
         getAdminProfile: builder.query({
      query: () => ({
        url: "/getAdminProfile",
        method: "GET",
      }),
      providesTags: ["auth"],
    }),
    }),
});

export const {
    useLoginAdminMutation,
    useVerifyAdminMutation,
    useLogoutAdminMutation,
    useGetAdminProfileQuery
} = authApi;