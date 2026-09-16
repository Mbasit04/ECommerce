import React, { useEffect, useState } from "react";
import {
  getAdminShipping,
  getAdminShippingByOrderId,
} from "../../services/adminService";

const AdminShipping = () => {
  const [shipping, setShipping] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadShipping = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminShipping();

      setShipping(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load shipping information."
      );
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (orderId) => {
    try {
      setDetailsLoading(true);

      const data =
        await getAdminShippingByOrderId(orderId);

      setSelectedOrder(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load order shipping details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadShipping();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-success";

      case "Shipped":
        return "bg-primary";

      case "Cancelled":
        return "bg-danger";

      case "Pending":
        return "bg-warning text-dark";

      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Shipping Management
          </h2>

          <p className="text-muted mb-0">
            Monitor order shipping and tracking information.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadShipping}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-2">
            Loading shipping information...
          </p>
        </div>
      ) : shipping.length === 0 ? (
        <div className="alert alert-info">
          No shipping records found.
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>City</th>
                    <th>Tracking Number</th>
                    <th>Status</th>
                    <th>Shipped</th>
                    <th>Delivered</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {shipping.map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <strong>
                          #{order.orderId}
                        </strong>
                      </td>

                      <td>
                        {order.customerName}
                      </td>

                      <td>
                        {order.city || "-"}
                      </td>

                      <td>
                        {order.trackingNumber ? (
                          <span className="fw-semibold">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-muted">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      <td>
                        {order.shippedAt
                          ? new Date(
                              order.shippedAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {order.deliveredAt
                          ? new Date(
                              order.deliveredAt
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            viewDetails(order.orderId)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="text-center mt-4">
          <div
            className="spinner-border"
            role="status"
          ></div>
        </div>
      )}

      {selectedOrder && !detailsLoading && (
        <div className="card shadow-sm mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Order #{selectedOrder.orderId}
            </h5>

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() =>
                setSelectedOrder(null)
              }
            >
              Close
            </button>
          </div>

          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-6">
                <h6>Customer Information</h6>

                <p className="mb-1">
                  <strong>Name:</strong>{" "}
                  {selectedOrder.customerName}
                </p>

                <p className="mb-1">
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.phoneNumber || "-"}
                </p>
              </div>

              <div className="col-md-6">
                <h6>Shipping Information</h6>

                <p className="mb-1">
                  <strong>City:</strong>{" "}
                  {selectedOrder.city || "-"}
                </p>

                <p className="mb-1">
                  <strong>Address:</strong>{" "}
                  {selectedOrder.shippingAddress ||
                    "-"}
                </p>
              </div>

              <div className="col-md-6">
                <h6>Tracking</h6>

                <p className="mb-1">
                  <strong>Tracking Number:</strong>{" "}
                  {selectedOrder.trackingNumber ||
                    "Not assigned"}
                </p>

                <p className="mb-1">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge ${getStatusClass(
                      selectedOrder.orderStatus
                    )}`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </p>
              </div>

              <div className="col-md-6">
                <h6>Delivery Timeline</h6>

                <p className="mb-1">
                  <strong>Shipped:</strong>{" "}
                  {selectedOrder.shippedAt
                    ? new Date(
                        selectedOrder.shippedAt
                      ).toLocaleString()
                    : "Not shipped"}
                </p>

                <p className="mb-1">
                  <strong>Delivered:</strong>{" "}
                  {selectedOrder.deliveredAt
                    ? new Date(
                        selectedOrder.deliveredAt
                      ).toLocaleString()
                    : "Not delivered"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipping;
