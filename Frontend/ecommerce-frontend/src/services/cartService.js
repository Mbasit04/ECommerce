import api from "./api";

export const getCart = async () => {
  const response = await api.get("/Customer/cart");
  return response.data;
};

export const addToCart = async (productId, quantity) => {
  const response = await api.post("/Customer/cart", {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (cartItemId, quantity) => {
  const response = await api.put(`/Customer/cart/${cartItemId}`, {
    quantity,
  });
  return response.data;
};

export const removeFromCart = async (cartItemId) => {
  const response = await api.delete(`/Customer/cart/${cartItemId}`);
  return response.data;
};

export const removeCartItem = removeFromCart;

export const clearCart = async () => {
  const response = await api.delete("/Customer/cart");
  return response.data;
};
