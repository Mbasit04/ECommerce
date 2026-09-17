import api from "./api";

// =========================
// ADMIN DASHBOARD
// =========================

export const getAdminDashboard = async () => {
  const response = await api.get("/Admin/dashboard");
  return response.data;
};

// =========================
// SELLER MANAGEMENT
// =========================

export const getSellers = async () => {
  const response = await api.get("/Admin/sellers");
  return response.data;
};

export const getSellerById = async (id) => {
  const response = await api.get(`/Admin/sellers/${id}`);
  return response.data;
};

export const addSeller = async (sellerData) => {
  const response = await api.post(
    "/Admin/sellers",
    sellerData
  );

  return response.data;
};

export const updateSeller = async (id, sellerData) => {
  const response = await api.put(
    `/Admin/sellers/${id}`,
    sellerData
  );

  return response.data;
};

export const deleteSeller = async (id) => {
  const response = await api.delete(
    `/Admin/sellers/${id}`
  );

  return response.data;
};

// =========================
// CUSTOMER MANAGEMENT
// =========================

export const getCustomers = async () => {
  const response = await api.get("/Admin/customers");
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await api.get(
    `/Admin/customers/${id}`
  );

  return response.data;
};

export const addCustomer = async (customerData) => {
  const response = await api.post(
    "/Admin/customers",
    customerData
  );

  return response.data;
};

export const updateCustomer = async (
  id,
  customerData
) => {
  const response = await api.put(
    `/Admin/customers/${id}`,
    customerData
  );

  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(
    `/Admin/customers/${id}`
  );

  return response.data;
};

// =========================
// CATEGORY MANAGEMENT
// =========================

export const getCategories = async () => {
  const response = await api.get("/Admin/categories");
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(
    `/Admin/categories/${id}`
  );

  return response.data;
};

export const addCategory = async (categoryData) => {
  const response = await api.post(
    "/Admin/categories",
    categoryData
  );

  return response.data;
};

export const updateCategory = async (
  id,
  categoryData
) => {
  const response = await api.put(
    `/Admin/categories/${id}`,
    categoryData
  );

  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(
    `/Admin/categories/${id}`
  );

  return response.data;
};

// =========================
// PRODUCT MANAGEMENT
// =========================

export const getAdminProducts = async () => {
  const response = await api.get("/Admin/products");
  return response.data;
};

export const getAdminProductById = async (id) => {
  const response = await api.get(
    `/Admin/products/${id}`
  );

  return response.data;
};

export const addAdminProduct = async (productData) => {
  const response = await api.post(
    "/Admin/products",
    productData
  );

  return response.data;
};

export const updateAdminProduct = async (
  id,
  productData
) => {
  const response = await api.put(
    `/Admin/products/${id}`,
    productData
  );

  return response.data;
};

export const deleteAdminProduct = async (id) => {
  const response = await api.delete(
    `/Admin/products/${id}`
  );

  return response.data;
};

// =========================
// ORDER MANAGEMENT
// =========================

export const getAdminOrders = async () => {
  const response = await api.get("/Admin/orders");
  return response.data;
};

export const getAdminOrderById = async (id) => {
  const response = await api.get(
    `/Admin/orders/${id}`
  );

  return response.data;
};

export const updateAdminOrderStatus = async (
  id,
  orderData
) => {
  const response = await api.put(
    `/Admin/orders/${id}/status`,
    orderData
  );

  return response.data;
};

// =========================
// STOCK MANAGEMENT
// =========================

export const getAdminStocks = async () => {
  const response = await api.get("/Admin/stocks");
  return response.data;
};

export const getAdminStockHistory = async (productId) => {
  const response = await api.get(
    `/Admin/stocks/${productId}/history`
  );

  return response.data;
};

export const updateAdminStock = async (
  productId,
  stockData
) => {
  const response = await api.put(
    `/Admin/stocks/${productId}`,
    stockData
  );

  return response.data;
};

// =========================
// DEAL MANAGEMENT
// =========================

export const getAdminDeals = async () => {
  const response = await api.get("/Admin/deals");
  return response.data;
};

export const getAdminDealById = async (id) => {
  const response = await api.get(
    `/Admin/deals/${id}`
  );

  return response.data;
};

export const addAdminDeal = async (dealData) => {
  const response = await api.post(
    "/Admin/deals",
    dealData
  );

  return response.data;
};

export const updateAdminDeal = async (
  id,
  dealData
) => {
  const response = await api.put(
    `/Admin/deals/${id}`,
    dealData
  );

  return response.data;
};

export const deleteAdminDeal = async (id) => {
  const response = await api.delete(
    `/Admin/deals/${id}`
  );

  return response.data;
};

export const activateAdminDeal = async (id) => {
  const response = await api.put(
    `/Admin/deals/${id}/toggle-active`
  );

  return response.data;
};

export const deactivateAdminDeal = async (id) => {
  const response = await api.put(
    `/Admin/deals/${id}/toggle-active`
  );

  return response.data;
};

// =========================
// ADMIN SHIPPING (Step 20.7)
// =========================

export const getAdminShipping = async () => {
  const response = await api.get("/Admin/shipping");
  return response.data;
};

export const getAdminShippingByOrderId = async (orderId) => {
  const response = await api.get(
    `/Admin/shipping/${orderId}`
  );

  return response.data;
};