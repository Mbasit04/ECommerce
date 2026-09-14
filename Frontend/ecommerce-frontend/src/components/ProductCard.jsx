import React from "react";

import { Link } from "react-router-dom";

// Helpers ----------------------------------------------------------------

const firstImage = (imageUrl) => {
  try {
    const images = JSON.parse(imageUrl);
    return Array.isArray(images) ? images[0] : imageUrl;
  } catch {
    return imageUrl;
  }
};

const formatPrice = (value) =>
  `Rs. ${Number(value || 0).toLocaleString()}`;

const stockStatus = (stock) => {
  const s = Number(stock) || 0;

  if (s <= 0) {
    return { label: "Out of stock", className: "bg-danger" };
  }

  if (s <= 5) {
    return { label: `Low stock · ${s} left`, className: "bg-warning text-dark" };
  }

  return { label: "In stock", className: "bg-success" };
};

// Card -------------------------------------------------------------------

const ProductCard = ({
  product,
  variant = "default",
  detailsPath,
  buttonLabel = "View Details",
  className = "",
}) => {
  if (!product) {
    return null;
  }

  const viewPath = detailsPath || `/products/${product.id}`;

  const stock = stockStatus(product.stock);

  const hasDeal = Boolean(
    product.hasActiveDeal && product.finalPrice != null,
  );

  const priceToShow = hasDeal ? product.finalPrice : product.price;

  // ----- variant: compact (home page featured strip) -----
  if (variant === "compact") {
    return (
      <div
        className={`card h-100 shadow-sm border-0 ${className}`}
        style={{ overflow: "hidden" }}
      >
        {product.imageUrl ? (
          <div className="bg-light position-relative" style={{ height: "160px", overflow: "hidden" }}>
            <img
              src={firstImage(product.imageUrl)}
              alt={product.name}
              className="card-img-top w-100 h-100"
              style={{ objectFit: "contain" }}
              onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement.querySelector(".product-image-fallback").style.display = "flex"; }}
            />
            <div className="product-image-fallback text-muted align-items-center justify-content-center h-100 w-100" style={{ display: "none" }}>🖼️ No Image Available</div>
          </div>
        ) : (
          <div
            className="bg-light d-flex align-items-center justify-content-center text-muted"
            style={{ height: "160px" }}
          >
            No image
          </div>
        )}

        <div className="card-body d-flex flex-column">
          <span className="badge bg-secondary align-self-start mb-2">
            {product.categoryName || "Uncategorized"}
          </span>

          <h3 className="h6 mb-1 text-truncate" title={product.name}>
            {product.name}
          </h3>

          <small className="text-muted mb-2">
            by {product.sellerName || "Unknown seller"}
          </small>

          <div className="mt-auto">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                {hasDeal && (
                  <span className="text-decoration-line-through text-muted me-2 small">
                    {formatPrice(product.price)}
                  </span>
                )}
                <strong className="text-primary">
                  {formatPrice(priceToShow)}
                </strong>
              </div>

              {hasDeal && (
                <span className="badge bg-danger">
                  {Number(product.discountPercentage).toFixed(0)}% off
                </span>
              )}
            </div>

            <span className={`badge ${stock.className} mt-2`}>
              {stock.label}
            </span>

            <Link
              to={viewPath}
              className="btn btn-outline-primary btn-sm w-100 mt-3"
            >
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----- variant: default (product listing, etc.) -----
  return (
    <div
      className={`card h-100 shadow-sm border-0 ${className}`}
      style={{ overflow: "hidden" }}
    >
      {product.imageUrl ? (
        <div style={{ position: "relative" }}>
          <img
            src={firstImage(product.imageUrl)}
            alt={product.name}
            className="card-img-top"
            style={{ height: "220px", objectFit: "contain" }}
            onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement.querySelector(".product-image-fallback").style.display = "flex"; }}
          />

          {hasDeal && (
            <span
              className="badge bg-danger"
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                fontSize: "0.85rem",
              }}
            >
              {Number(product.discountPercentage).toFixed(0)}% OFF
            </span>
          )}
          <div className="product-image-fallback bg-light text-muted align-items-center justify-content-center" style={{ display: "none", height: "220px" }}>🖼️ No Image Available</div>
        </div>
      ) : (
        <div
          className="bg-light d-flex align-items-center justify-content-center text-muted"
          style={{ height: "210px" }}
        >
          No image
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-info text-dark">
            {product.categoryName || "Uncategorized"}
          </span>
          <span className={`badge ${stock.className}`}>
            {stock.label}
          </span>
        </div>

        <h3 className="h5 mb-1" title={product.name}>
          {product.name}
        </h3>

        <small className="text-muted mb-2">
          <span aria-hidden="true">🏪</span>{" "}
          {product.sellerName || "Unknown seller"}
        </small>

        {product.description && (
          <p
            className="small text-muted flex-grow-1"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        )}

        <div className="mt-2">
          {hasDeal ? (
            <div>
              <span className="text-decoration-line-through text-muted me-2">
                {formatPrice(product.price)}
              </span>
              <strong className="text-danger h5">
                {formatPrice(priceToShow)}
              </strong>
            </div>
          ) : (
            <strong className="text-primary h5">
              {formatPrice(priceToShow)}
            </strong>
          )}
        </div>

        <Link to={viewPath} className="btn btn-primary mt-3">
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
