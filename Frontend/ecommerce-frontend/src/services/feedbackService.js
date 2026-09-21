import api from "./api";

// ============================================================
// EXISTING ENDPOINTS — used by ProductDetails + OrderDetails
// ============================================================

// GET /api/Customer/products/{productId}/feedback — public endpoint.
// Returns the list of reviews for a product (lightweight DTO).
// Order is newest first (server-side).
export const getProductFeedback = async (productId) => {
  const response = await api.get(
    `/Customer/products/${productId}/feedback`,
  );
  return response.data;
};

// POST /api/Customer/orders/{orderId}/products/{productId}/feedback
// Requires authentication. Customers add reviews from their order details page.
export const addProductFeedback = async (
  orderId,
  productId,
  payload,
) => {
  const response = await api.post(
    `/Customer/orders/${orderId}/products/${productId}/feedback`,
    payload,
  );
  return response.data;
};


// ============================================================
// PHASE 23 — REVIEW CRUD (richer DTO with reviewer name)
// ============================================================

// GET /api/Customer/products/{productId}/reviews — public, includes customer name.
export const getProductReviews = async (productId) => {
  const response = await api.get(
    `/Customer/products/${productId}/reviews`,
  );
  return response.data;
};

// GET /api/Customer/products/{productId}/reviews/mine — caller-only,
// returns the review this customer already wrote on this product (or null).
export const getMyProductReview = async (productId) => {
  const response = await api.get(
    `/Customer/products/${productId}/reviews/mine`,
  );
  return response.data;
};

// PUT /api/Customer/reviews/{reviewId} — edit own review.
// Ownership check happens server-side; we just pass the id.
export const updateReview = async (reviewId, payload) => {
  const response = await api.put(
    `/Customer/reviews/${reviewId}`,
    payload,
  );
  return response.data;
};

// DELETE /api/Customer/reviews/{reviewId} — delete own review.
export const deleteReview = async (reviewId) => {
  const response = await api.delete(
    `/Customer/reviews/${reviewId}`,
  );
  return response.data;
};

// GET /api/Customer/products/{productId}/reviews/summary — public summary.
export const getProductRatingSummary = async (productId) => {
  const response = await api.get(
    `/Customer/products/${productId}/reviews/summary`,
  );
  return response.data;
};


// ============================================================
// Helpers — client-side rating maths (used when summary endpoint
// is not available / cached list)
// ============================================================

// Average rating rounded to 1 decimal place, defaults to 0.
export const averageRating = (reviews) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;

  const sum = reviews.reduce(
    (acc, r) => acc + Number(r.rating || 0),
    0,
  );

  return Math.round((sum / reviews.length) * 10) / 10;
};

// Bucket counts for a star distribution, e.g. {1: 2, 2: 0, 3: 1, ...}
export const ratingDistribution = (reviews) => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (!Array.isArray(reviews)) return dist;

  reviews.forEach((r) => {
    const bucket = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));

    dist[bucket] += 1;
  });

  return dist;
};
