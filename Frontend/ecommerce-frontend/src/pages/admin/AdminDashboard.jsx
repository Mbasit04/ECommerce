import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getAdminDashboard } from "../../services/adminService";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState({
    totalCustomers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      if (data) {
        setDashboard({
          totalCustomers: data.totalCustomers ?? 0,
          totalSellers: data.totalSellers ?? 0,
          totalProducts: data.totalProducts ?? 0,
          totalOrders: data.totalOrders ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          pendingOrders: data.pendingOrders ?? 0,
        });
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Welcome to the E-Commerce Admin Panel</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Customers</h6>
              <h2>{dashboard.totalCustomers}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Sellers</h6>
              <h2>{dashboard.totalSellers}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Products</h6>
              <h2>{dashboard.totalProducts}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Orders</h6>
              <h2>{dashboard.totalOrders}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Total Revenue</h5>
              <h2>
                PKR {Number(dashboard.totalRevenue).toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Pending Orders</h5>
              <h2>{dashboard.pendingOrders}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
