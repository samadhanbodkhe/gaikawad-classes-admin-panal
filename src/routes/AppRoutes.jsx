import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import RevenueReports from "../subscriptions/RevenueReports";
import TransactionList from "../subscriptions/TransactionList";
import Customers from "../pages/Customers";
import Billing from "../pages/Billing";
import Salary from "../pages/Salary";
import Attendance from "../pages/Attendance";
import TeacherAR from "../pages/TeacherAR";
import Leaverequest from "../pages/Leaverequest";
import Dashboard from "../pages/Dashboard";
import Student from "../pages/Student";
import Login from "../pages/Login";
import NotFound from "../components/NotFound";
import PublicRoute from "../components/PublicRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Schedule from "../pages/Schedule";

const AppRoutes = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="leaverequest" element={<Leaverequest />} />
          <Route path="teacherAR" element={<TeacherAR />} />
          <Route path="billing" element={<Billing />} />
          <Route path="salary" element={<Salary />} />
          <Route path="revenuereports" element={<RevenueReports />} />
          <Route path="transactionlist" element={<TransactionList />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="student" element={<Student />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
