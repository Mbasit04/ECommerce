import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../services/cartService";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    cartId: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    isValid: true,
    validationMessages: [],
  });

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [editingQuantities, setEditingQuantities] = useState({});
  const [clearing, setClearing] = useState(false);

  const loadCart = async () => {
    try {
      setLoading(true);

      const data = await getCart();

      setCart({
        cartId: data?.cartId || null,
        items: Array.isArray(data?.items) ? data.items : [],
        totalItems: Number(data?.totalItems || 0),
        totalAmount: Number(data?.totalAmount || 0),
        isValid: data?.isValid !== false,
        validationMessages: Array.isArray(data?.validationMessages)
          ? data.validationMessages
          : [],
      });
    } catch (error) {
      console.error("Failed to load cart:", error);

      toast.error(
        error?.response?.data?.message || "Failed to load cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const isCartValid = cart?.isValid !== false;

  const getProductName = (item) => {
    return item?.productName || "Product";
  };

  const getImageUrl = (item) => {
    const url = item?.imageUrl || item?.productImageUrl || "";
    if (!url) return "";
    try {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return typeof parsed === "string" ? parsed : url;
    } catch {
      return url;
    }
  };

  const getUnitPrice = (item) => {
    return Number(item?.unitPrice || 0);
  };

  const getOriginalPrice = (item) => {
    return Number(
      item?.originalPrice || item?.unitPrice || 0
    );
  };

  const getDiscount = (item) => {
    return Number(item?.discountPercentage || 0);
  };

  const getQuantity = (item) => {
    return Number(item?.quantity || 0);
  };

  const getStock = (item) => {
    return Number(item?.stock || 0);
  };

  const getItemTotal = (item) => {
    return Number(item?.totalPrice || getUnitPrice(item) * getQuantity(item));
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    const itemId = item?.id;

    if (!itemId) {
      toast.error("Invalid cart item.");
      return;
    }

    const stock = getStock(item);
    const currentQuantity = getQuantity(item);

    // Minimum quantity
    if (newQuantity < 1) {
      return;
    }

    // No unnecessary API request
    if (newQuantity === currentQuantity) {
      setEditingQuantities((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return;
    }

    // Product out of stock
    if (stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    // Quantity cannot exceed stock
    if (newQuantity > stock) {
      toast.warning(`Only ${stock} item(s) are available.`);
      return;
    }

    try {
      setProcessingId(itemId);

      const updatedCart = await updateCartItem(itemId, newQuantity);

      setCart({
        cartId: updatedCart?.cartId || cart.cartId,
        items: Array.isArray(updatedCart?.items) ? updatedCart.items : [],
        totalItems: Number(updatedCart?.totalItems || 0),
        totalAmount: Number(updatedCart?.totalAmount || 0),
        isValid: updatedCart?.isValid !== false,
        validationMessages: Array.isArray(updatedCart?.validationMessages)
          ? updatedCart.validationMessages
          : [],
      });

      setEditingQuantities((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Failed to update quantity:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update quantity."
      );

      // Reload cart in case stock changed
      await loadCart();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (item) => {
    const itemId = item?.id;

    if (!itemId) {
      toast.error("Invalid cart item.");
      return;
    }

    const productName = item?.productName || "this product";

    const confirmed = window.confirm(
      `Remove "${productName}" from your cart?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(itemId);

      const updatedCart = await removeFromCart(itemId);

      setCart({
        cartId: updatedCart?.cartId || cart.cartId,
        items: Array.isArray(updatedCart?.items) ? updatedCart.items : [],
        totalItems: Number(updatedCart?.totalItems || 0),
        totalAmount: Number(updatedCart?.totalAmount || 0),
        isValid: updatedCart?.isValid !== false,
        validationMessages: Array.isArray(updatedCart?.validationMessages)
          ? updatedCart.validationMessages
          : [],
      });

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("cart-updated"));

      toast.success(`${productName} removed from cart.`);
    } catch (error) {
      console.error("Failed to remove cart item:", error);

      toast.error(
        error?.response?.data?.message || "Failed to remove item."
      );

      await loadCart();
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!cart?.items?.length) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);

      const updatedCart = await clearCart();

      setCart({
        cartId: updatedCart?.cartId || cart.cartId,
        items: Array.isArray(updatedCart?.items) ? updatedCart.items : [],
        totalItems: Number(updatedCart?.totalItems || 0),
        totalAmount: Number(updatedCart?.totalAmount || 0),
        isValid: updatedCart?.isValid !== false,
        validationMessages: Array.isArray(updatedCart?.validationMessages)
          ? updatedCart.validationMessages
          : [],
      });

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("cart-updated"));

      toast.success("All items removed from cart.");
    } catch (error) {
      console.error("Failed to clear cart:", error);

      toast.error(
        error?.response?.data?.message || "Failed to clear cart."
      );

      await loadCart();
    } finally {
      setClearing(false);
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div className="display-1 mb-3" role="img" aria-label="shopping cart">
            🛒
          </div>
          <h3 className="fw-bold">Your Cart is Empty</h3>
          <p className="text-muted mb-4">
            You haven't added any products to your cart yet.
          </p>
          <button
            className="btn btn-primary px-4"
            onClick={() => navigate("/products")}
          >
            🛍️ Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Shopping Cart</h1>
          <p className="text-muted mb-0">
            {cart.totalItems} item{cart.totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>

        <button
          className="btn btn-outline-danger"
          onClick={handleClearCart}
          disabled={cart.items.length === 0 || clearing || loading}
        >
          {clearing ? "Clearing..." : "🗑️ Clear Cart"}
        </button>
      </div>

      {/* Validation issues banner */}
      {cart?.validationMessages?.length > 0 && (
        <div className="alert alert-danger mb-4">
          <h6 className="fw-bold">Cart Issues</h6>
          <ul className="mb-0">
            {cart.validationMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row g-4">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {cart.items.map((item) => {
                const itemId = item?.id;
                const quantity = getQuantity(item);
                const stock = getStock(item);
                const discount = getDiscount(item);
                const originalPrice = getOriginalPrice(item);
                const unitPrice = getUnitPrice(item);
                const itemTotal = getItemTotal(item);
                const isStockValid = item?.isStockValid !== false;

                return (
                  <div key={itemId} className="p-4 border-bottom">
                    <div className="row align-items-center g-3">
                      {/* Image */}
                      <div className="col-4 col-md-2">
                        <div
                          className="bg-light rounded overflow-hidden position-relative"
                          style={{ height: "110px" }}
                        >
                          {getImageUrl(item) ? (
                            <>
                              <img
                                src={getImageUrl(item)}
                                alt={getProductName(item)}
                                className="w-100 h-100"
                                style={{ objectFit: "contain" }}
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                  if (event.currentTarget.nextElementSibling) {
                                    event.currentTarget.nextElementSibling.style.display = "flex";
                                  }
                                }}
                              />
                              <div
                                className="h-100 w-100 align-items-center justify-content-center bg-light text-muted"
                                style={{ display: "none" }}
                              >
                                <span className="fs-1">📦</span>
                              </div>
                            </>
                          ) : (
                            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                              <span className="fs-1">📦</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="col-8 col-md-4">
                        <h5 className="fw-bold mb-2">
                          {getProductName(item)}
                        </h5>

                        {discount > 0 ? (
                          <div>
                            <span className="text-decoration-line-through text-muted me-2">
                              Rs. {formatPrice(originalPrice)}
                            </span>

                            <span className="fw-bold text-success">
                              Rs. {formatPrice(unitPrice)}
                            </span>

                            <div>
                              <span className="badge bg-success mt-1">
                                {discount}% OFF
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="fw-bold">
                            Rs. {formatPrice(unitPrice)}
                          </span>
                        )}

                        <div className="mt-2">
                          {stock === 0 ? (
                            <span className="badge bg-danger">
                              Out of Stock
                            </span>
                          ) : stock <= 5 ? (
                            <span className="badge bg-warning text-dark">
                              Only {stock} left
                            </span>
                          ) : (
                            <span className="badge bg-success">In Stock</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-7 col-md-3">
                        <label className="small text-muted d-block mb-1">
                          Quantity
                        </label>

                        <div className="btn-group align-items-center" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              handleUpdateQuantity(item, quantity - 1)
                            }
                            disabled={
                              quantity <= 1 || processingId === itemId
                            }
                          >
                            −
                          </button>

                          <input
                            type="number"
                            className="form-control text-center"
                            min="1"
                            max={stock}
                            value={
                              editingQuantities[itemId] ?? quantity
                            }
                            disabled={processingId === itemId}
                            onChange={(e) => {
                              setEditingQuantities({
                                ...editingQuantities,
                                [itemId]: e.target.value,
                              });
                            }}
                            onBlur={() => {
                              const value = Number(
                                editingQuantities[itemId]
                              );

                              if (!value || Number.isNaN(value)) {
                                setEditingQuantities((prev) => {
                                  const next = { ...prev };
                                  delete next[itemId];
                                  return next;
                                });
                                return;
                              }

                              handleUpdateQuantity(item, value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.target.blur();
                              }
                            }}
                            style={{ width: "70px" }}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                              handleUpdateQuantity(item, quantity + 1)
                            }
                            disabled={
                              stock <= 0 ||
                              quantity >= stock ||
                              processingId === itemId
                            }
                          >
                            +
                          </button>
                        </div>

                        <div className="small text-muted mt-2">
                          Available: {stock}
                        </div>
                      </div>

                      {/* Total + Remove */}
                      <div className="col-5 col-md-3 text-md-end">
                        <div className="fw-bold fs-5 mb-2">
                          Rs. {formatPrice(itemTotal)}
                        </div>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveItem(item)}
                          disabled={processingId === itemId}
                        >
                          {processingId === itemId ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                            />
                          ) : (
                            "🗑️ Remove"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Per-item stock validation error */}
                    {!isStockValid && (
                      <div className="alert alert-danger mt-3 mb-0">
                        <strong>Stock issue:</strong>{" "}
                        {item?.stockMessage ||
                          "This product is not currently available."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/products")}
            >
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm sticky-top"
            style={{ top: "90px" }}
          >
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4">Order Summary</h4>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Items</span>
                <span>{cart.totalItems}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span>Rs. {formatPrice(cart.totalAmount)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="text-success">Calculated at checkout</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-4 text-primary">
                  Rs. {formatPrice(cart.totalAmount)}
                </span>
              </div>

              {!isCartValid && (
                <div className="alert alert-warning mb-3">
                  <strong>Checkout unavailable</strong>
                  <div className="mt-2">
                    Please update or remove unavailable products before continuing.
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg w-100"
                onClick={() => {
                  if (!isCartValid) {
                    toast.error(
                      "Please fix the stock issues before checkout."
                    );
                    return;
                  }
                  navigate("/customer/checkout");
                }}
                disabled={!isCartValid || cart.items.length === 0}
              >
                Proceed to Checkout
              </button>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  Secure checkout • COD & Stripe available
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
