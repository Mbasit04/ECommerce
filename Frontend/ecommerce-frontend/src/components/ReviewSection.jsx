import React, { useEffect, useMemo, useState } from "react";

import StarRating from "./StarRating";
import {
  averageRating,
  deleteReview,
  getMyProductReview,
  getProductRatingSummary,
  getProductReviews,
  ratingDistribution,
  updateReview,
} from "../services/feedbackService";

// Helpers ----------------------------------------------------------------

const formatDate = (value) => {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const initials = (name) => {
  if (!name) return "U";

  const parts = String(name).trim().split(/\s+/);

  return (parts[0]?.[0] || "U").toUpperCase();
};

const StarPicker = ({ value, onChange, disabled }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="d-flex align-items-center gap-1" aria-label="Pick a star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hover > 0 ? star <= hover : star <= value;

        return (
          <button
            key={star}
            type="button"
            className="btn btn-link p-0 m-0"
            style={{
              fontSize: "1.6rem",
              lineHeight: 1,
              color: active ? "#f5b301" : "#d6d6d6",
              textDecoration: "none",
              pointerEvents: disabled ? "none" : "auto",
            }}
            onMouseEnter={() => !disabled && setHover(star)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onChange(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            disabled={disabled}
          >
            ★
          </button>
        );
      })}

      <span className="ms-2 small text-muted">
        {value ? `${value}/5` : "Pick a rating"}
      </span>
    </div>
  );
};

// Component --------------------------------------------------------------

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  const loadAll = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError("");

      const [reviewsData, summaryData] = await Promise.all([
        getProductReviews(productId).catch(() => []),
        getProductRatingSummary(productId).catch(() => null),
      ]);

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setSummary(summaryData);

      // My-review lookup is authenticated — skip on 401.
      if (isLoggedIn) {
        try {
          const mine = await getMyProductReview(productId);
          setMyReview(mine && mine.id ? mine : null);
        } catch (innerErr) {
          setMyReview(null);
        }
      }
    } catch (err) {
      console.error("ReviewSection load error:", err);
      setError(err.response?.data?.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isLoggedIn]);

  // Use server-computed summary if available, fall back to client maths.
  const computedAvg = useMemo(
    () => averageRating(reviews),
    [reviews],
  );

  const computedDistribution = useMemo(
    () => ratingDistribution(reviews),
    [reviews],
  );

  const avg = summary && summary.reviewCount > 0
    ? Number(summary.averageRating)
    : computedAvg;

  const distribution = summary && summary.reviewCount > 0
    ? {
        5: summary.fiveStar || 0,
        4: summary.fourStar || 0,
        3: summary.threeStar || 0,
        2: summary.twoStar || 0,
        1: summary.oneStar || 0,
      }
    : computedDistribution;

  const total = summary?.reviewCount ?? reviews.length;

  const startEdit = () => {
    if (!myReview) return;

    setEditRating(myReview.rating || 5);
    setEditComment(myReview.comment || "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditRating(5);
    setEditComment("");
  };

  const submitEdit = async () => {
    if (!myReview) return;

    if (!editRating || editRating < 1 || editRating > 5) {
      window.alert("Please pick a rating between 1 and 5.");
      return;
    }

    if (!editComment.trim()) {
      window.alert("Review comment cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      await updateReview(myReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });
      setEditing(false);
      await loadAll();
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Unable to update review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;

    const ok = window.confirm(
      "Are you sure you want to delete your review?",
    );

    if (!ok) return;

    try {
      setSubmitting(true);
      await deleteReview(myReview.id);
      setMyReview(null);
      setEditing(false);
      await loadAll();
    } catch (err) {
      window.alert(
        err.response?.data?.message || "Unable to delete review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-5" id="customer-reviews">
      <h3 className="mb-4">Customer Reviews ⭐</h3>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading reviews...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-warning mb-0">{error}</div>
      ) : (
        <>
          {/* Summary */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4 text-center border-end">
                  <div
                    className="display-4 fw-bold mb-2"
                    aria-label={`Average rating ${avg} out of 5`}
                  >
                    {avg > 0 ? avg.toFixed(1) : "—"}
                  </div>

                  <StarRating value={avg} size="md" />

                  <div className="text-muted mt-2">
                    {total === 0
                      ? "No reviews yet"
                      : `${total} Review${total === 1 ? "" : "s"}`}
                  </div>
                </div>

                <div className="col-md-8">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const percent =
                      total === 0 ? 0 : Math.round((count / total) * 100);

                    return (
                      <div
                        className="row align-items-center mb-2 gx-2"
                        key={star}
                      >
                        <div
                          className="col-2 col-md-1 text-end small fw-semibold"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {star} ★
                        </div>

                        <div className="col">
                          <div
                            className="progress"
                            style={{ height: "10px" }}
                            role="progressbar"
                            aria-valuenow={percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="col-3 col-md-2 small text-muted">
                          {count} · {percent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Own review — edit / delete */}
          {isLoggedIn && myReview && !editing && (
            <div className="card border-primary mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-wrap align-items-center justify-content-between mb-2 gap-2">
                  <h6 className="mb-0">Your review</h6>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={startEdit}
                      disabled={submitting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleDelete}
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <StarRating value={myReview.rating} size="sm" />
                <p className="mb-0 mt-2">{myReview.comment}</p>
                <small className="text-muted">
                  Posted {formatDate(myReview.createdAt)}
                  {myReview.updatedAt && " · edited"}
                </small>
              </div>
            </div>
          )}

          {/* Edit form */}
          {isLoggedIn && myReview && editing && (
            <div className="card border-primary mb-4 shadow-sm">
              <div className="card-body">
                <h6 className="mb-3">Edit your review</h6>

                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <StarPicker
                    value={editRating}
                    onChange={setEditRating}
                    disabled={submitting}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    maxLength={1000}
                    value={editComment}
                    onChange={(event) => setEditComment(event.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submitEdit}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelEdit}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Other reviews */}
          {total === 0 ? (
            <div className="alert alert-info">
              This product doesn't have any reviews yet.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews
                .filter(
                  (review) => !myReview || review.id !== myReview.id,
                )
                .map((review) => (
                  <article
                    key={review.id}
                    className="card shadow-sm"
                  >
                    <div className="card-body">
                      <div className="d-flex flex-wrap align-items-center mb-2 gap-2">
                        <div
                          className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            fontWeight: 600,
                          }}
                          aria-hidden="true"
                        >
                          {initials(review.customerName)}
                        </div>

                        <div className="flex-grow-1">
                          <div className="fw-semibold">
                            {review.customerName || "Customer"}
                          </div>
                          <small className="text-muted">
                            {formatDate(review.createdAt)}
                          </small>
                        </div>

                        <StarRating value={review.rating} size="sm" />
                      </div>

                      {review.comment && (
                        <p className="mb-0 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ReviewSection;
