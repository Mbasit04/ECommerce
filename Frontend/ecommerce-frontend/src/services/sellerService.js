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

// ============================================================
// SELLER CATEGORY MANAGEMENT (mirrors Admin's category page)
// ============================================================
//
// Sellers used to be blocked from creating categories — meaning a
// seller who wanted to list, say, "Toys" had to wait for an admin.
// These endpoints expose the same category CRUD the admin uses, but
// routed under /Seller/categories (which the backend also serves).

// GET /api/Seller/categories — every category in the catalog.
export const getSellerCategoriesList = async () => {
  const response = await api.get("/Seller/categories");
  return response.data;
};

// POST /api/Seller/categories — seller adds a new shared category.
export const addSellerCategory = async (categoryData) => {
  const response = await api.post(
    "/Seller/categories",
    categoryData,
  );
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


// ============================================================
// PHASE 23 — SELLER REVIEW VISIBILITY (read-only)
// ============================================================

// GET /api/Seller/reviews — only this seller's product reviews.
export const getSellerReviews = async () => {
  const response = await api.get('/Seller/reviews');
  return response.data;
};

// GET /api/Seller/reviews/{reviewId} — single review, must belong to seller.
export const getSellerReviewById = async (reviewId) => {
  const response = await api.get(
    `/Seller/reviews/${reviewId}`
  );
  return response.data;
};


// ============================================================
// PHASE 24 — CONTACT SELLER (seller-side inbox + reply)
// ============================================================

// GET /api/Seller/messages — every thread where this seller is the recipient.
export const getSellerMessages = async () => {
  const response = await api.get("/Seller/messages");
  return response.data;
};

// GET /api/Seller/messages/{conversationId} — full thread by conversation id.
// Conversation id (not customer id) so multiple product threads with the
// same customer don't collapse to the latest one.
export const getSellerConversation = async (conversationId) => {
  const response = await api.get(
    `/Seller/messages/${conversationId}`
  );
  return response.data;
};

// POST /api/Seller/messages/reply — send a reply to a customer.
export const replyToCustomer = async (
  customerId,
  productId,
  messageText,
) => {
  const response = await api.post(
    "/Seller/messages/reply",
    {
      customerId,
      productId,
      messageText,
    }
  );
  return response.data;
};

// PUT /api/Seller/messages/{messageId}/read — mark a single message as read.
export const markSellerMessageRead = async (messageId) => {
  const response = await api.put(
    `/Seller/messages/${messageId}/read`
  );
  return response.data;
};

// GET /api/Seller/messages/unread-count — used by navbar badge.
export const getSellerUnreadCount = async () => {
  const response = await api.get(
    "/Seller/messages/unread-count"
  );
  return response.data;
};
