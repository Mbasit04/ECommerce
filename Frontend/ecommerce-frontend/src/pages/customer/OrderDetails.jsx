import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetails, cancelOrder, addFeedback } from "../../services/orderService";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderDetails(id);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load order.");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    const reason = window.prompt("Why do you want to cancel this order?");
    if (reason === null) return;

    try {
      setCancelling(true);
      const data = await cancelOrder(order.orderId, reason);
      setCancelMessage(data.message || "Order cancelled.");
      setOrder({ ...order, status: "Cancelled" });
    } catch (err) {
      setCancelMessage(err.response?.data?.message || "Unable to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewProduct = async (productId) => {
    const ratingStr = window.prompt("Rating (1-5):");
    if (!ratingStr) return;
    const rating = Number(ratingStr);

    const comment = window.prompt("Write your review:");
    if (!comment) return;

    if (rating >= 1 && rating <= 5) {
      try {
        await addFeedback(order.orderId, productId, rating, comment);
        alert("Review submitted successfully.");
      } catch (err) {
        alert(err.response?.data?.message || "Unable to submit review.");
      }
    } else {
      alert("Invalid rating.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div>
      <h2>Order #{order.orderId}</h2>
      <p>Status: {order.status}</p>
      <p>Payment: {order.paymentMethod}</p>
      <p>Shipping Address: {order.shippingAddress}</p>
      {order.trackingNumber && <p>Tracking Number: {order.trackingNumber}</p>}

      {cancelMessage && <p style={{ color: "red" }}>{cancelMessage}</p>}

      {order.status === "Pending" && (
        <button onClick={handleCancelOrder} disabled={cancelling}>
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}

      <h3>Products</h3>
      {order.items?.map((item) => (
        <div key={item.productId} style={{ marginBottom: "15px" }}>
          <p><strong>{item.productName}</strong></p>
          <p>Quantity: {item.quantity}</p>
          <p>Unit Price: Rs. {item.unitPrice}</p>
          <p>Total: Rs. {item.totalPrice}</p>

          {order.status === "Delivered" && (
            <button onClick={() => handleReviewProduct(item.productId)}>
              Review Product
            </button>
          )}
          <hr />
        </div>
      ))}

      <h3>Total: Rs. {order.totalAmount}</h3>
    </div>
  );
};

export default OrderDetails;
