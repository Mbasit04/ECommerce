import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SellerRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "Seller") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;
