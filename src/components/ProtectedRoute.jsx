import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useVerifyTokenQuery } from "../redux/apis/authApi";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("admin") || "null");

  if (!token || !admin) return <Navigate to="/login" replace />;

  const { data, error, isLoading } = useVerifyTokenQuery();

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
