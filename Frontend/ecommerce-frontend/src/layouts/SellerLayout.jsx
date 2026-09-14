import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SellerLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="d-flex min-vh-100">
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="mb-4">Seller Panel</h4>

        <div className="d-flex flex-column gap-2">
          <Link
            to="/seller/dashboard"
            className="text-white text-decoration-none p-2 rounded"
          >
            Dashboard
          </Link>

          <Link
            to="/seller/profile"
            className="text-white text-decoration-none p-2 rounded"
          >
            My Profile
          </Link>

          <Link
            to="/seller/products"
            className="text-white text-decoration-none p-2 rounded"
          >
            My Products
          </Link>

          <Link
            to="/seller/products/add"
            className="text-white text-decoration-none p-2 rounded"
          >
            Add Product
          </Link>

          <Link
            to="/seller/stocks"
            className="text-white text-decoration-none p-2 rounded"
          >
            Stock Management
          </Link>

          <Link
            to="/seller/stocks/history"
            className="text-white text-decoration-none p-2 rounded"
          >
            Stock History
          </Link>

          <Link
            to="/seller/deals"
            className="text-white text-decoration-none p-2 rounded"
          >
            My Deals
          </Link>

          <Link
            to="/seller/deals/add"
            className="text-white text-decoration-none p-2 rounded"
          >
            Create Deal
          </Link>

          <Link
            to="/seller/orders"
            className="text-white text-decoration-none p-2 rounded"
          >
            Orders Received
          </Link>

          <hr />

          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      <main className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
