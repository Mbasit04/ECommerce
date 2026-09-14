import api from "./api";

export const createPaymentIntent = async () => {
    const response = await api.post("/Payment/create-intent", {});
    return response.data;
};

export const confirmStripeCheckout = async (payload) => {
    const response = await api.post(
        "/Payment/confirm-checkout",
        payload
    );
    return response.data;
};

export const markCodPaymentAsPaid = async (orderId) => {
  const response = await api.put(
    `/Payment/cod/${orderId}/mark-paid`
  );

  return response.data;
};
