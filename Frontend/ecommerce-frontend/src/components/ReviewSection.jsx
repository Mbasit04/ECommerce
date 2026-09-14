import React, { useEffect, useMemo, useState } from "react";

import StarRating from "./StarRating";
import {
  averageRating,
  getProductFeedback,
  ratingDistribution,
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

// Component --------------------------------------------------------------

const ReviewSection = ({ productId, reviews: reviewsProp }) => {
  // Two display modes:
  //   1) Pass `reviews` (and optionally `loading` / `error`) — typically from
  //      the parent ProductDetails page so it can show the average rating
  //      near the price and reuse the same fetch.
  //   2) Pass only `productId` — ReviewSection fetches on its own. Useful
  //      when you want a drop-in "reviews block" without managing state.
  const [reviews, setReviews] = useState(reviewsProp || []);
  const [loading, setLoading] = useState(reviewsProp == null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Parent provided the data — nothing to fetch.
    if (reviewsProp != null) {
      setReviews(reviewsProp);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError("");

        const data = await getProductFeedback(productId);

        if (!cancelled) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("ReviewSection load error:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message || "Unable to load reviews.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [productId, reviewsProp]);

  const avg = useMemo(() => averageRating(reviews), [reviews]);
  const distribution = useMemo(
    () => ratingDistribution(reviews),
    [reviews],
  );
  const total = reviews.length;

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

          {/* List */}
          {total === 0 ? (
            <div className="alert alert-info">
              This product doesn't have any reviews yet.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((review) => (
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
                        C
                      </div>

                      <div className="flex-grow-1">
                        <div className="fw-semibold">Customer</div>
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
