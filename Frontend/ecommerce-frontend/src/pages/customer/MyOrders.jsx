import React, { useEffect, useState } from "react";
import { requestRefund, getMyOrders } from "../../services/orderService";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundMessage, setRefundMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (orderId) => {
    const reason = window.prompt("Why do you want a refund?");
    if (reason === null) return;

    if (!reason.trim()) {
      setRefundMessage("Refund reason is required.");
      return;
    }

    try {
      setRefundLoading(true);
      const data = await requestRefund(orderId, reason);
      setRefundMessage(`Refund request #${data.refundId} submitted successfully.`);
      await loadOrders();
    } catch (err) {
      setRefundMessage(err.response?.data?.message || "Unable to request refund.");
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>My Orders</h2>

      {refundMessage && <p style={{ color: "blue" }}>{refundMessage}</p>}

      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.orderId}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "4px"
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

            {order.status === "Delivered" && (
              <button
                onClick={() => handleRefund(order.orderId)}
                disabled={refundLoading}
                style={{ marginLeft: "10px" }}
              >
                {refundLoading ? "Submitting..." : "Request Refund"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
