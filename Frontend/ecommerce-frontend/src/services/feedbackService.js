import api from "./api";

// GET /api/Customer/products/{productId}/feedback — public endpoint
// Returns the list of reviews for a product.
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

// Helpers -----------------------------------------------------------

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
