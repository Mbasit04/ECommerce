import React, { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { getSellerReviews } from "../../services/sellerService";
import StarRating from "../../components/StarRating";

// Helpers ----------------------------------------------------------------

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
};

// Component --------------------------------------------------------------

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerReviews();

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load reviews.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Roll-up per product so the UI can show "Laptop · 4.6 · 25 reviews".
  const perProductStats = useMemo(() => {
    const map = new Map();

    reviews.forEach((review) => {
      const key = review.productId ?? `name:${review.productName}`;

      if (!map.has(key)) {
        map.set(key, {
          productId: review.productId,
          productName: review.productName || "Unknown product",
          count: 0,
          sum: 0,
        });
      }

      const entry = map.get(key);
      entry.count += 1;
      entry.sum += Number(review.rating) || 0;
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      average: entry.count > 0
        ? Math.round((entry.sum / entry.count) * 10) / 10
        : 0,
    }));
  }, [reviews]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return reviews;

    return reviews.filter((review) =>
      [review.productName, review.customerName, review.comment]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [reviews, search]);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Customer Reviews</h2>
          <p className="text-muted mb-0">
            See what customers are saying about your products.
          </p>
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="search"
            className="form-control"
            placeholder="Search by product, customer, or text..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {/* Per-product summary */}
      {!loading && perProductStats.length > 0 && (
        <div className="row g-3 mb-4">
          {perProductStats.map((stat) => (
            <div
              key={`${stat.productId ?? stat.productName}`}
              className="col-12 col-md-6 col-lg-4"
            >
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title mb-2">{stat.productName}</h6>
                  <StarRating value={stat.average} size="sm" />
                  <div className="small text-muted mt-2">
                    {stat.average.toFixed(1)} · {stat.count} review
                    {stat.count === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading reviews...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="alert alert-info">
          {reviews.length === 0
            ? "No reviews for your products yet."
            : "No reviews match your search."}
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review) => (
                  <tr key={review.id}>
                    <td>{review.productName || `#${review.productId}`}</td>
                    <td>
                      {review.customerName || `#${review.customerId}`}
                    </td>
                    <td>
                      <StarRating value={review.rating} size="sm" />
                      <span className="ms-2 small text-muted">
                        {review.rating}/5
                      </span>
                    </td>
                    <td style={{ maxWidth: 360 }}>
                      <span
                        className="d-inline-block text-truncate"
                        style={{ maxWidth: 340 }}
                      >
                        {review.comment}
                      </span>
                    </td>
                    <td>{formatDate(review.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
