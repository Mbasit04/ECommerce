import api from "./api";

export const checkout = async (checkoutData) => {
  const response = await api.post("/Customer/checkout", checkoutData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/Customer/orders");
  return response.data;
};

export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/Customer/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/Customer/orders/${orderId}/cancel`, { reason });
  return response.data;
};

export const requestRefund = async (orderId, reason) => {
  const response = await api.post(`/Customer/orders/${orderId}/refund`, { reason });
  return response.data;
};

export const addFeedback = async (orderId, productId, rating, comment) => {
  const response = await api.post(
    `/Customer/orders/${orderId}/products/${productId}/feedback`,
    { rating, comment }
  );
  return response.data;
};
