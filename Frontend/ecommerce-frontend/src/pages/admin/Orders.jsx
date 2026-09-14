import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import { getAdminOrders } from "../../services/adminService";

// Backend serializes the OrderStatus struct as { value: <int> }.
// Map numeric values to display names so the table renders correctly.
const ORDER_STATUS_NAMES = {
  1: "Pending",
  2: "Confirmed",
  3: "Processing",
  4: "Shipped",
  5: "Delivered",
  6: "Cancelled",
  7: "Refunded",
};

const toStatusName = (status) => {
  if (status === null || status === undefined) return "Unknown";
  if (typeof status === "string") return status;
  if (typeof status === "object") {
    if (typeof status.value === "number") {
      return ORDER_STATUS_NAMES[status.value] || `Status #${status.value}`;
    }
    if (typeof status.name === "string") return status.name;
  }
  return "Unknown";
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await getAdminOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Orders error:", error);

      toast.error(error.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (toStatusName(status)) {
      case "Pending":
        return "bg-warning text-dark";

      case "Confirmed":
        return "bg-info text-dark";

      case "Processing":
        return "bg-info text-dark";

      case "Shipped":
        return "bg-primary";

      case "Delivered":
        return "bg-success";

      case "Cancelled":
        return "bg-danger";

      case "Refunded":
        return "bg-secondary";

      default:
        return "bg-dark";
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2>Order Management</h2>

        <p className="text-muted">View and manage all customer orders.</p>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {orders.length === 0 ? (
            <div className="alert alert-info">No orders found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId || order.id}>
                      <td>#{order.orderId || order.id}</td>

                      <td>
                        {order.customerName ||
                          order.customer?.name ||
                          order.customer?.fullName ||
                          order.customerEmail ||
                          "-"}
                      </td>

                      <td>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        PKR {Number(order.totalAmount || 0).toLocaleString()}
                      </td>

                      <td>{order.paymentMethod || "-"}</td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(order.status)}`}
                        >
                          {toStatusName(order.status)}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/admin/orders/${order.orderId || order.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
