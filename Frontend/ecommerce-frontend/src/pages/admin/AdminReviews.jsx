import React, { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import {
  deleteAdminReview,
  getAdminReviews,
} from "../../services/adminService";

// Helpers ----------------------------------------------------------------

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
};

const ratingStars = (value) => {
  const safe = Math.max(0, Math.min(5, Number(value) || 0));

  return "★★★★★".slice(0, safe) + "☆☆☆☆☆".slice(0, 5 - safe);
};

// Component --------------------------------------------------------------

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReviews();

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

  const handleDelete = async (reviewId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!ok) return;

    try {
      setBusyId(reviewId);
      const result = await deleteAdminReview(reviewId);

      toast.success(
        result?.message || "Review deleted successfully.",
      );

      setReviews((current) =>
        current.filter((review) => review.id !== reviewId),
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to delete review.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return reviews;

    return reviews.filter((review) =>
      [review.productName, review.customerName, review.comment]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [reviews, search]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading reviews...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-danger">{error}</div>;
    }

    if (filtered.length === 0) {
      return (
        <div className="alert alert-info">
          {reviews.length === 0
            ? "No reviews have been submitted yet."
            : "No reviews match your search."}
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Review ID</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Created</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((review) => (
              <tr key={review.id}>
                <td>#{review.id}</td>
                <td>{review.productName || `#${review.productId}`}</td>
                <td>{review.customerName || `#${review.customerId}`}</td>
                <td>
                  <span
                    aria-label={`${review.rating} of 5 stars`}
                    title={`${review.rating} out of 5`}
                  >
                    {ratingStars(review.rating)}
                  </span>
                  <span className="ms-2 small text-muted">
                    {review.rating}/5
                  </span>
                </td>
                <td style={{ maxWidth: 320 }}>
                  <span className="d-inline-block text-truncate" style={{ maxWidth: 300 }}>
                    {review.comment}
                  </span>
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(review.id)}
                    disabled={busyId === review.id}
                  >
                    {busyId === review.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="mb-1">Reviews</h2>
          <p className="text-muted mb-0">
            Monitor and moderate customer reviews across the platform.
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

      {renderContent()}
    </div>
  );
};

export default AdminReviews;
