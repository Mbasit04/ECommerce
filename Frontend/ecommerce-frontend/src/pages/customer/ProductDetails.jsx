import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

import { startConversation } from "../../services/messageService";
import { getCustomerProductById } from "../../services/customerService";
import {
  averageRating as computeAverageRating,
  getProductFeedback,
} from "../../services/feedbackService";
import { useCart } from "../../context/CartContext";
import ReviewSection from "../../components/ReviewSection";
import StarRating from "../../components/StarRating";
import ProductCard from "../../components/customer/ProductCard";
import { getCustomerProducts } from "../../services/productService";

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
    return { label: "Out of stock", className: "badge bg-danger" };
  }

  if (s <= 5) {
    return {
      label: `Low stock · only ${s} left`,
      className: "badge bg-warning text-dark",
    };
  }

  return { label: "In stock", className: "badge bg-success" };
};

// Page -------------------------------------------------------------------

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addItem: addToCart, busy: cartBusy } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [sellerMessage, setSellerMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Reviews — fetched once and shared with <ReviewSection /> below.
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const loadRelatedProducts = async (currentProduct) => {
    try {
      const data = await getCustomerProducts();
      const allProducts = Array.isArray(data) ? data : data?.products || data?.items || [];
      const currentId = Number(currentProduct?.id ?? currentProduct?.Id ?? 0);
      const currentCategory = Number(currentProduct?.categoryId ?? currentProduct?.CategoryId ?? 0);
      setRelatedProducts(allProducts.filter((item) =>
        Number(item?.id ?? item?.Id ?? 0) !== currentId &&
        Number(item?.categoryId ?? item?.CategoryId ?? 0) === currentCategory,
      ).slice(0, 4));
    } catch (err) {
      console.error("Related products error:", err);
      setRelatedProducts([]);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomerProductById(id);

        setProduct(data);
        loadRelatedProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const data = await getProductFeedback(id);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        // Reviews are non-critical — log but don't block the page.
        console.error("ProductDetails reviews error:", err);
        setReviews([]);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const avgRating = useMemo(
    () => computeAverageRating(reviews),
    [reviews],
  );

  const reviewCount = reviews.length;

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.info("Please login as customer to add items to your cart.");
        navigate("/login");
        return;
      }

      await addToCart(product.id, quantity);

      // Custom toast with a "View Cart" action button.
      toast.success(
        ({ closeToast }) => (
          <div className="d-flex flex-column">
            <strong>Added to your cart</strong>
            <span className="small text-muted">
              {quantity} × {product.name}
            </span>
            <div className="mt-2 d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  closeToast();
                  navigate("/cart");
                }}
              >
                View Cart
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={closeToast}
              >
                Keep shopping
              </button>
            </div>
          </div>
        ),
        { autoClose: 4500 },
      );
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Unable to add to cart.",
      );
    }
  };

  const changeQuantity = (amount) => {
    setQuantity((current) => Math.min(Math.max(current + amount, 1), stockCount));
  };

  const toggleWishlist = () => {
    setWishlisted((current) => !current);
    toast.info(wishlisted ? "Removed from wishlist." : "Added to wishlist.");
  };

  const handleContactSeller = async () => {
    if (!product) return;

    if (!sellerMessage.trim()) {
      toast.warning("Please enter a message for the seller.");
      return;
    }

    if (!product.sellerId) {
      toast.error("Seller information is not available.");
      return;
    }

    try {
      setSendingMessage(true);

      const conversation = await startConversation(
        product.sellerId,
        product.id,
        sellerMessage.trim(),
      );

      setSellerMessage("");

      navigate(`/messages/${conversation.conversationId}`);
    } catch (err) {
      console.error("Contact Seller Error:", err);
      toast.error(err.message || "Unable to start conversation.");
    } finally {
      setSendingMessage(false);
    }
  };

  // ----- render states -----

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
        <p className="mt-2 text-muted">Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">Product not found.</div>
        <Link to="/products" className="btn btn-secondary">
          Back to products
        </Link>
      </div>
    );
  }

  // ----- derived data -----

  const stock = stockStatus(product.stock);

  const stockCount = Number(product.stock ?? product.availableStock ?? 0);

  const isOutOfStock = stockCount <= 0;

  const hasDeal = Boolean(
    product.hasActiveDeal &&
      product.finalPrice != null &&
      Number(product.finalPrice) < Number(product.price),
  );

  const displayPrice = hasDeal ? product.finalPrice : product.price;

  const savings = hasDeal
    ? Number(product.price) - Number(product.finalPrice)
    : 0;

  return (
    <div className="container my-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">Products</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Product Image */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ minHeight: "450px", overflow: "hidden" }}>
              {product.imageUrl && <img
                src={firstImage(product.imageUrl)}
                alt={product.name}
                className="img-fluid"
                style={{ maxHeight: "450px", width: "100%", objectFit: "contain" }}
                onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling.style.display = "flex"; }}
              />}
              <div className="text-center text-muted align-items-center justify-content-center" style={{ display: product.imageUrl ? "none" : "flex", height: "450px", width: "100%" }}>
                <div><div className="display-1">🖼️</div><h5>No Image Available</h5></div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-6">
          <span className="badge bg-info text-dark mb-2">
            {product.categoryName || "Uncategorized"}
          </span>

          <h1 className="h2 mb-2">{product.name}</h1>

          <p className="text-muted mb-3">
            <span aria-hidden="true">🏪</span> Sold by{" "}
            <strong>{product.sellerName || "Unknown seller"}</strong>
          </p>

          <div className="mb-3">
            <span className={stock.className}>{stock.label}</span>
            {!isOutOfStock && (
              <span className="text-muted ms-2 small">
                ({stockCount} available)
              </span>
            )}
          </div>

          {reviewCount > 0 && (
            <div className="mb-3">
              <Link
                to="#customer-reviews"
                className="text-decoration-none"
                title="Jump to customer reviews"
              >
                <StarRating
                  value={avgRating}
                  size="md"
                  reviewCount={reviewCount}
                />
              </Link>
            </div>
          )}

          {/* Price */}
          <div className="mb-4 p-3 rounded bg-light">
            {hasDeal ? (
              <>
                <div>
                  <span className="text-decoration-line-through text-muted h5 me-2">
                    {formatPrice(product.price)}
                  </span>
                  <span className="h3 text-danger fw-bold">
                    {formatPrice(displayPrice)}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="badge bg-danger me-2">
                    {Number(product.discountPercentage).toFixed(0)}% OFF
                  </span>
                  <span className="text-success fw-semibold">
                    You save {formatPrice(savings)}
                  </span>
                </div>
              </>
            ) : (
              <span className="h3 text-primary fw-bold">
                {formatPrice(displayPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h5>Description</h5>
            <p className="mb-0">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mb-4">
            <div className="row g-2 align-items-end">
              <div className="col-auto">
                <label htmlFor="qty" className="form-label mb-0">Quantity</label>
                <div className="input-group" style={{ width: "150px" }}>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => changeQuantity(-1)} disabled={isOutOfStock || cartBusy || quantity <= 1} aria-label="Decrease quantity">−</button>
                  <input id="qty" type="number" className="form-control text-center" min="1" max={Math.max(stockCount, 1)} value={quantity} onChange={(e) => { const value = Number(e.target.value); if (!Number.isNaN(value)) setQuantity(Math.min(Math.max(value, 1), Math.max(stockCount, 1))); }} disabled={isOutOfStock} />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => changeQuantity(1)} disabled={isOutOfStock || cartBusy || quantity >= stockCount} aria-label="Increase quantity">+</button>
                </div>
              </div>

              <div className="col-auto">
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleAddToCart}
                  disabled={cartBusy || isOutOfStock}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : cartBusy
                      ? "Adding..."
                      : "🛒 Add to Cart"}
                </button>
              </div>
              <div className="col-auto">
                <button type="button" className={`btn btn-lg ${wishlisted ? "btn-danger" : "btn-outline-danger"}`} onClick={toggleWishlist} aria-pressed={wishlisted}>
                  {wishlisted ? "♥ Saved" : "♡ Wishlist"}
                </button>
              </div>
            </div>
          </div>

          <Link to="/products" className="btn btn-link ps-0">
            ← Back to all products
          </Link>
        </div>
      </div>

      {/* Contact Seller */}
      <div className="card mt-5 mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="card-title">Contact Seller</h4>
          <p className="text-muted">
            Have a question about this product? Send a message to{" "}
            <strong>{product.sellerName || "the seller"}</strong>.
          </p>

          <textarea
            className="form-control"
            rows="4"
            placeholder="Ask seller about this product..."
            value={sellerMessage}
            onChange={(e) => setSellerMessage(e.target.value)}
            disabled={sendingMessage}
          />

          <button
            className="btn btn-primary mt-3"
            onClick={handleContactSeller}
            disabled={sendingMessage}
          >
            {sendingMessage ? "Starting Conversation..." : "Contact Seller"}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection productId={product.id} reviews={reviews} />

      {relatedProducts.length > 0 && (
        <section className="mt-5 pt-4 border-top" aria-label="Related products">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div><h2 className="h3 fw-bold mb-1">Related Products</h2><p className="text-muted mb-0">You may also like these products</p></div>
            <Link className="btn btn-outline-primary" to={`/products?category=${product.categoryId}`}>View More</Link>
          </div>
          <div className="row g-4">
            {relatedProducts.map((relatedProduct) => <div className="col-12 col-sm-6 col-lg-3" key={relatedProduct.id ?? relatedProduct.Id}><ProductCard product={relatedProduct} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductDetails;
