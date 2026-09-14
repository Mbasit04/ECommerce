import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from "../../services/adminService";
import { markCodPaymentAsPaid } from "../../services/paymentService";

// Backend serializes the OrderStatus struct as { value: <int> }.
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
  if (status === null || status === undefined) return "";
  if (typeof status === "string") return status;
  if (typeof status === "object") {
    if (typeof status.value === "number") {
      return ORDER_STATUS_NAMES[status.value] || "";
    }
    if (typeof status.name === "string") return status.name;
  }
  return "";
};

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [status, setStatus] = useState("");

  const [trackingNumber, setTrackingNumber] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);

      const data = await getAdminOrderById(id);

      setOrder(data);

      setStatus(toStatusName(data.status));

      setTrackingNumber(data.trackingNumber || "");
    } catch (error) {
      console.error("Order details error:", error);

      toast.error(error.response?.data?.message || "Unable to load order.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setSaving(true);

      await updateAdminOrderStatus(id, {
        status: status,
        trackingNumber: trackingNumber || null,
      });

      toast.success("Order updated successfully.");

      await loadOrder();
    } catch (error) {
      console.error("Update order error:", error);

      toast.error(error.response?.data?.message || "Unable to update order.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCodPaid = async () => {
    try {
      await markCodPaymentAsPaid(order.orderId || order.id);

      toast.success("COD payment marked as paid.");

      await loadOrder();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to update COD payment."
      );
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading order...</div>;
  }

  if (!order) {
    return <div className="alert alert-danger">Order not found.</div>;
  }

  const customer = order.customer || {};

  const items = order.items || order.orderItems || [];

  const paymentMethodType = order.paymentMethodType || order.paymentMethod || "COD";
  const paymentStatusStr = typeof order.paymentStatus === "number"
    ? (order.paymentStatus === 2 ? "Paid" : "Pending")
    : (order.paymentStatus || "Pending");

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Order #{order.orderId || order.id}</h2>

          <p className="text-muted">Order details and shipping information</p>
        </div>

        <Link to="/admin/orders" className="btn btn-secondary">
          Back to Orders
        </Link>
      </div>

      {/* CUSTOMER INFORMATION */}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Customer Information</h5>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <strong>Name</strong>

              <p>
                {order.customerName ||
                  customer.name ||
                  customer.fullName ||
                  "-"}
              </p>
            </div>

            <div className="col-md-4">
              <strong>Email</strong>

              <p>{order.customerEmail || customer.email || "-"}</p>
            </div>

            <div className="col-md-4">
              <strong>Customer ID</strong>

              <p>{order.customerId || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER INFORMATION */}

      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Order Information</h5>

          {(paymentMethodType === "COD" || order.paymentMethod === "COD") &&
            (paymentStatusStr === "Pending" || order.paymentStatus === 1) && (
              <button
                className="btn btn-success btn-sm"
                onClick={handleMarkCodPaid}
              >
                Mark COD as Paid
              </button>
            )}
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <strong>Order Date</strong>

              <p>
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div className="col-md-3">
              <strong>Payment Method</strong>

              <p>{paymentMethodType}</p>
            </div>

            <div className="col-md-3">
              <strong>Payment Status</strong>

              <p>
                <span className={`badge ${paymentStatusStr === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                  {paymentStatusStr}
                </span>
                {order.paidAt && <span className="d-block small text-muted">Paid At: {new Date(order.paidAt).toLocaleDateString()}</span>}
              </p>
            </div>

            <div className="col-md-3">
              <strong>Total Amount</strong>

              <p className="fw-bold">
                PKR {Number(order.totalAmount || 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <strong>Shipping Address</strong>

            <p>{order.shippingAddress || "-"}</p>
          </div>
        </div>
      </div>

      {/* ORDER ITEMS */}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Order Items</h5>
        </div>

        <div className="card-body">
          {items.length === 0 ? (
            <div className="alert alert-info">No order items found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || item.productId || index}>
                      <td>{item.productName || item.product?.name || "-"}</td>

                      <td>{item.quantity}</td>

                      <td>
                        PKR {Number(item.unitPrice || 0).toLocaleString()}
                      </td>

                      <td>
                        PKR {Number(item.totalPrice || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* STATUS AND SHIPPING */}

      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Order Status & Shipping</h5>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Order Status</label>

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">-- Select status --</option>

                <option value="Pending">Pending</option>

                <option value="Confirmed">Confirmed</option>

                <option value="Processing">Processing</option>

                <option value="Shipped">Shipped</option>

                <option value="Delivered">Delivered</option>

                <option value="Cancelled">Cancelled</option>

                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Tracking Number</label>

              <input
                type="text"
                className="form-control"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </div>

          <button
            className="btn btn-success mt-4"
            onClick={handleUpdateStatus}
            disabled={saving}
          >
            {saving ? "Updating..." : "Update Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
