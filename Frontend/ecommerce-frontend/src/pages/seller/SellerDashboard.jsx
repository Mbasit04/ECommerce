import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSellerDashboard } from "../../services/sellerService";

const SellerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getSellerDashboard();
      setDashboard(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <h2>Seller Dashboard</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <h2>Seller Dashboard</h2>

        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Seller Dashboard</h2>
        <p className="text-muted">Welcome to your seller dashboard.</p>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Total Products</h6>

              <h2>{dashboard.totalProducts}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Total Orders</h6>

              <h2>{dashboard.totalOrders}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Pending Orders</h6>

              <h2>{dashboard.pendingOrders}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Total Sales</h6>

              <h2>Rs. {dashboard.totalSales}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Total Stock</h5>

              <h2>{dashboard.totalStock}</h2>

              <p className="text-muted mb-0">
                Total available stock across your products.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5>Seller Overview</h5>

              <p className="mb-1">Products: {dashboard.totalProducts}</p>

              <p className="mb-1">Orders: {dashboard.totalOrders}</p>

              <p className="mb-0">Pending: {dashboard.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
              <h5>Orders Received</h5>

              <p className="text-muted">
                View new orders, customer delivery addresses,
                and shipping progress.
              </p>

              <Link
                to="/seller/orders"
                className="btn btn-primary mt-auto align-self-start"
              >
                Manage Orders ({dashboard.totalOrders})
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
              <h5>COD Payments</h5>

              <p className="text-muted">
                Manage Cash on Delivery payments and mark
                collected COD payments as paid.
              </p>

              <Link
                to="/seller/orders"
                className="btn btn-success mt-auto align-self-start"
              >
                Manage COD Payments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
