// src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const token = localStorage.getItem("token");

  if (admin && token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
