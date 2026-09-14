import React, { useEffect, useState } from "react";
import { requestRefund } from "../../services/orderService";
import { getMyOrders } from "../../services/orderService";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getMyOrders();

        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (orders.length === 0) {
    return (
      <div>
        <h2>My Orders</h2>
        <p>You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.orderId}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
          }}
        >
          <h3>Order #{order.orderId}</h3>

          <p>Date: {new Date(order.orderDate).toLocaleDateString()}</p>

          <p>Items: {order.totalItems}</p>

          <p>Total: Rs. {order.totalAmount}</p>

          <p>Payment: {order.paymentMethod}</p>

          <p>Status: {order.status}</p>

          <button onClick={() => navigate(`/orders/${order.orderId}`)}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};
const [refundLoading, setRefundLoading] = useState(false);

const [refundMessage, setRefundMessage] = useState("");
const handleRefund = async () => {
  const reason = window.prompt("Why do you want a refund?");

  if (reason === null) {
    return;
  }

  if (!reason.trim()) {
    setRefundMessage("Refund reason is required.");

    return;
  }

  try {
    setRefundLoading(true);

    const data = await requestRefund(order.orderId, reason);

    setRefundMessage(
      `Refund request #${data.refundId} submitted successfully.`,
    );
  } catch (err) {
    setRefundMessage(
      err.response?.data?.message || "Unable to request refund.",
    );
  } finally {
    setRefundLoading(false);
  }
};
{order.status === "Delivered" && (
    <button
        onClick={handleRefund}
        disabled={refundLoading}
    >
        {refundLoading
            ? "Submitting..."
            : "Request Refund"}
    </button>
)}
{refundMessage && (
    <p>
        {refundMessage}
    </p>
)}
export default MyOrders;
