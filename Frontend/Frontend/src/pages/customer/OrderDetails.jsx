import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetails } from "../../services/orderService";
import { cancelOrder } from "../../services/orderService";
import { addFeedback } from "../../services/orderService";

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!order) {
    return <p>Order not found.</p>;
  }

  return (
    <div>
      <h2>Order #{order.orderId}</h2>

      <p>Status: {order.status}</p>

      <p>Payment: {order.paymentMethod}</p>

      <p>Shipping Address: {order.shippingAddress}</p>

      {order.trackingNumber && <p>Tracking Number: {order.trackingNumber}</p>}

      <h3>Products</h3>

      {order.items.map((item) => (
        <div key={item.productId}>
          <p>{item.productName}</p>

          <p>Quantity: {item.quantity}</p>

          <p>Unit Price: Rs. {item.unitPrice}</p>

          <p>Total: Rs. {item.totalPrice}</p>

          <hr />
        </div>
      ))}

      <h3>Total: Rs. {order.totalAmount}</h3>
    </div>
  );

  const [cancelling, setCancelling] = useState(false);

  const [cancelMessage, setCancelMessage] = useState("");

  const handleCancelOrder = async () => {
    const reason = window.prompt("Why do you want to cancel this order?");

    if (reason === null) {
      return;
    }

    try {
      setCancelling(true);

      const data = await cancelOrder(order.orderId, reason);

      setCancelMessage(data.message);

      setOrder({
        ...order,
        status: "Cancelled",
      });
    } catch (err) {
      setCancelMessage(
        err.response?.data?.message || "Unable to cancel order.",
      );
    } finally {
      setCancelling(false);
    }
  };
};
{
  order.status === "Delivered" && (
    <div>
      <h3>Leave a Review</h3>

      {order.items.map((item) => (
        <div key={item.productId}>
          <p>{item.productName}</p>

          <button
            onClick={() => {
              const rating = Number(window.prompt("Rating (1-5):"));

              const comment = window.prompt("Write your review:");

              if (rating >= 1 && rating <= 5 && comment) {
                addFeedback(order.orderId, item.productId, rating, comment)
                  .then(() => {
                    alert("Review submitted successfully.");
                  })
                  .catch((err) => {
                    alert(
                      err.response?.data?.message || "Unable to submit review.",
                    );
                  });
              }
            }}
          >
            Review Product
          </button>
        </div>
      ))}
    </div>
  );
}
export default OrderDetails;
