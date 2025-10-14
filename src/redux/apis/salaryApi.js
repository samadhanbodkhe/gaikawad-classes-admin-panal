import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/api/v1/salary`,
    credentials: "include",
  }),
  tagTypes: ["Salary", "SalaryTeachers"],
  endpoints: (builder) => ({
    // Get all salary payments
    getAllPayments: builder.query({
      query: ({ page = 1, limit = 100, teacherId, month } = {}) => ({
        url: "/getAllPayments",
        params: { page, limit, teacherId, month }
      }),
      providesTags: ["Salary"],
    }),

    // Create salary payment
    createSalaryPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/createSalaryPayment",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Salary"],
    }),

    // Get payment by ID
    getPaymentById: builder.query({
      query: (id) => `/getPaymentById/${id}`,
    }),

    // Update salary
    updateSalary: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/updateSalary/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Salary"],
    }),

    // Delete payment
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/deletePayment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Salary"],
    }),

    // Get teachers for salary (correct endpoint)
    getSalaryTeachers: builder.query({
      query: () => "/getSalaryTeachers",
      providesTags: ["SalaryTeachers"],
    }),
  }),
});

export const {
  useGetAllPaymentsQuery,
  useCreateSalaryPaymentMutation,
  useGetPaymentByIdQuery,
  useUpdateSalaryMutation,
  useDeletePaymentMutation,
  useGetSalaryTeachersQuery,
} = salaryApi;