import api from './api';

export const getSellerProducts = async () => {
  const response = await api.get('/Seller/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/Seller/products', productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/Seller/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/Seller/products/${productId}`);
  return response.data;
};

export const getSellerOrders = async () => {
  const response = await api.get('/Seller/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId, statusData) => {
  const response = await api.put(`/Seller/orders/${orderId}/shipping`, statusData);
  return response.data;
};

export const updateSellerShipping = updateOrderStatus;

export const getSellerDashboard = async () => {
  const response = await api.get("/Seller/dashboard");
  return response.data;
};

export const getSellerProfile = async () => {
  const response = await api.get("/Seller/profile");
  return response.data;
};

export const updateSellerProfile = async (profileData) => {
  const response = await api.put(
    "/Seller/profile",
    profileData
  );

  return response.data;
};

export const getSellerProductById = async (id) => {
  const response = await api.get(`/Seller/products/${id}`);
  return response.data;
};

export const deleteSellerProduct = async (id) => {
  const response = await api.delete(`/Seller/products/${id}`);
  return response.data;
};

export const changeSellerPassword = async (passwordData) => {
  const response = await api.put(
    "/Seller/change-password",
    passwordData
  );
  return response.data;
};
export const getSellerCategories = async () => {
  const response = await api.get("/Seller/categories");
  return response.data;
};
export const addSellerProduct = async (productData) => {
  const response = await api.post(
    "/Seller/products",
    productData
  );

  return response.data;
};
export const updateSellerProduct = async (
  id,
  productData
) => {
  const response = await api.put(
    `/Seller/products/${id}`,
    productData
  );

  return response.data;
};
export const increaseSellerStock = async (
  productId,
  stockData
) => {
  const response = await api.put(
    `/Seller/stocks/${productId}/increase`,
    stockData
  );

  return response.data;
};
export const decreaseSellerStock = async (
  productId,
  stockData
) => {
  const response = await api.put(
    `/Seller/stocks/${productId}/decrease`,
    stockData
  );

  return response.data;
};

export const getSellerStockHistory = async (productId) => {
  const response = await api.get(`/Seller/products/${productId}/stock-history`);
  return response.data;
};

export const getAllSellerStockHistory = async () => {
  const response = await api.get('/Seller/stocks/history');
  return response.data;
};

// =========================
// DEAL MANAGEMENT
// =========================

export const getSellerDeals = async () => {
  const response = await api.get('/Seller/deals');
  return response.data;
};

export const getSellerDealById = async (id) => {
  const response = await api.get(`/Seller/deals/${id}`);
  return response.data;
};

export const createSellerDeal = async (dealData) => {
  const response = await api.post('/Seller/deals', dealData);
  return response.data;
};

export const updateSellerDeal = async (id, dealData) => {
  const response = await api.put(`/Seller/deals/${id}`, dealData);
  return response.data;
};

export const deleteSellerDeal = async (id) => {
  const response = await api.delete(`/Seller/deals/${id}`);
  return response.data;
};
