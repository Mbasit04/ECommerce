import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { logout, user } = useAuth();

  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}

      <aside className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="mb-4">Admin Panel</h4>

        <div className="mb-4">
          <small className="text-secondary">Logged in as</small>

          <div>{user?.email}</div>

          <span className="badge bg-danger mt-1">Admin</span>
        </div>

        <nav className="nav flex-column">
          <Link
            to="/admin"
            className={`nav-link text-white ${isActive("/admin")}`}
          >
            Dashboard
          </Link>

          <Link to="/admin/sellers" className="nav-link text-white">
            Sellers
          </Link>

          <Link to="/admin/customers" className="nav-link text-white">
            Customers
          </Link>

          <Link to="/admin/categories" className="nav-link text-white">
            Categories
          </Link>

          <Link to="/admin/products" className="nav-link text-white">
            Products
          </Link>

          <Link to="/admin/orders" className="nav-link text-white">
            Orders
          </Link>

          <Link to="/admin/stocks" className="nav-link text-white">
            Stocks
          </Link>

          <Link to="/admin/deals" className="nav-link text-white">
            Deals
          </Link>

          <Link to="/admin/shipping" className="nav-link text-white">
            Shipping
          </Link>

          <Link to="/admin/refunds" className="nav-link text-white">
            Refunds
          </Link>

          <Link to="/admin/reviews" className="nav-link text-white">
            Reviews
          </Link>

          <Link to="/admin/roles" className="nav-link text-white">
            Role Permissions
          </Link>
        </nav>

        <hr />

        <button className="btn btn-danger w-100" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}

      <main className="flex-grow-1">
        <div className="bg-light p-3 border-bottom">
          <h5 className="mb-0">E-Commerce Administration</h5>
        </div>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
