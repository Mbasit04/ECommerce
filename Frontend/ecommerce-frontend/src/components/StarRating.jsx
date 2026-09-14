import React from "react";

// Reusable star rating display.
//
// Two display modes:
//  - <StarRating value={4.5} />           → renders 5 stars with partial fill
//  - <StarRating value={4.5} showValue /> → renders "4.5 ★★★★★"
//
// Two visual sizes:
//  - size="sm" (default 16px) | "md" (20px) | "lg" (28px)
//
// The component is read-only; it does not handle user clicks. If you ever
// need an interactive rating input, duplicate this and add `onChange`.

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
};

const StarRating = ({
  value = 0,
  size = "sm",
  showValue = false,
  reviewCount = null,
  className = "",
}) => {
  const px = sizeMap[size] || sizeMap.sm;

  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  // Build five "stars" where each is partially filled based on the
  // remaining rating budget after earlier stars have consumed it.
  const stars = [];
  let remaining = rating;

  for (let i = 0; i < 5; i += 1) {
    let fill = 0;

    if (remaining >= 1) {
      fill = 100;
    } else if (remaining > 0) {
      fill = Math.round(remaining * 100);
    }

    stars.push(fill);
    remaining = Math.max(0, remaining - 1);
  }

  return (
    <span
      className={`d-inline-flex align-items-center ${className}`}
      style={{ lineHeight: 1 }}
      aria-label={`Rated ${rating} out of 5`}
    >
      {showValue && (
        <strong className="me-2" style={{ fontSize: px }}>
          {rating.toFixed(1)}
        </strong>
      )}

      <span style={{ display: "inline-flex", gap: 2 }}>
        {stars.map((fill, idx) => (
          <span
            key={idx}
            style={{
              position: "relative",
              display: "inline-block",
              fontSize: px,
              lineHeight: 1,
              color: "#e4e5e9", // empty star color
            }}
          >
            {/* Empty star (background) */}
            <span aria-hidden="true">★</span>

            {/* Filled star (clipped by width) */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${fill}%`,
                overflow: "hidden",
                color: "#ffc107", // Bootstrap warning yellow
                whiteSpace: "nowrap",
              }}
            >
              ★
            </span>
          </span>
        ))}
      </span>

      {reviewCount != null && (
        <span
          className="ms-2 text-muted"
          style={{ fontSize: Math.max(12, px - 4) }}
        >
          ({Number(reviewCount)})
        </span>
      )}
    </span>
  );
};

export default StarRating;
