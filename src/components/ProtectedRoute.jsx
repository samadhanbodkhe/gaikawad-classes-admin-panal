import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useVerifyAdminTokenQuery } from "../redux/apis/authApi";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("admin"));

  // ⛔ No token or admin => go to login
  if (!token || !admin) {
    return <Navigate to="/login" replace />;
  }

  // 🧠 Call backend to verify token validity
  const { data, error, isLoading } = useVerifyAdminTokenQuery();

  useEffect(() => {
    if (error) {
      toast.error("Session expired! Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-lg font-semibold text-gray-600">
        Checking Authorization...
      </div>
    );
  }

  if (error || !data?.success) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
