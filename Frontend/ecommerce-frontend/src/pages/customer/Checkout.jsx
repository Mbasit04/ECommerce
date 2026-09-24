import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getCart } from "../../services/cartService";
import { checkout } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import CardDetailsForm from "../../components/customer/CardDetailsForm";
import { validateCard } from "../../utils/cardValidator";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cart, setCart] = useState({
    cartId: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    isValid: true,
    validationMessages: [],
  });

  const [shippingAddress, setShippingAddress] = useState("");
  const [contactNumber, setContactNumber] = useState(
    user?.phone || user?.Phone || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Card details — only used when paymentMethod === "STRIPE". The
  // card is validated client-side before the user is sent to the
  // Stripe-hosted payment page, so a bad number, expired card or
  // missing CVV never reaches Stripe in the first place.
  const [card, setCard] = useState({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    loadCheckoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCheckoutData = async () => {
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
      console.error("Failed to load checkout data:", error);
      toast.error("Failed to load your cart.");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
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

  const validateCart = () => {
    if (!cart?.items?.length) {
      toast.error("Your cart is empty.");
      return false;
    }

    if (cart.isValid === false) {
      if (cart.validationMessages?.length > 0) {
        cart.validationMessages.forEach((message) => {
          toast.error(message);
        });
      } else {
        toast.error("Please fix the cart issues before checkout.");
      }
      return false;
    }

    const invalidItems = cart.items.filter(
      (item) => item?.isStockValid === false
    );

    if (invalidItems.length > 0) {
      toast.error("Some products in your cart have stock issues.");
      return false;
    }

    return true;
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    const address = shippingAddress.trim();
    const contact = contactNumber.trim();
    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

    if (!address) {
      toast.error("Please enter your shipping address.");
      return;
    }

    if (address.length < 10) {
      toast.error("Shipping address must be at least 10 characters.");
      return;
    }

    if (address.length > 500) {
      toast.error("Shipping address cannot exceed 500 characters.");
      return;
    }

    if (!contact) {
      toast.error("Please enter your contact number.");
      return;
    }

    if (!phoneRegex.test(contact)) {
      toast.error(
        "Contact number must be 7-20 digits and may include +, -, spaces, or parentheses."
      );
      return;
    }

    if (!validateCart()) {
      return;
    }

    try {
      setProcessing(true);

      if (paymentMethod === "STRIPE") {
        // Validate the card details before handing off to Stripe.
        // If anything is wrong, ask the customer to fix it instead
        // of sending them into the Stripe form with a card that
        // would just be rejected there.
        const cardValidation = validateCard(card);
        if (!cardValidation.isValid) {
          setCardErrors(cardValidation.errors);

          // Pick the first error to surface as the headline toast —
          // the per-field error helpers below already show the rest
          // in the form.
          const firstError =
            cardValidation.errors.cardNumber ||
            cardValidation.errors.cardholderName ||
            cardValidation.errors.expiry ||
            cardValidation.errors.cvv ||
            "Please add a valid card to continue.";

          toast.error(firstError);
          toast.warning(
            "Please enter a valid card to place your order.",
          );
          setProcessing(false);
          return;
        }

        // Card passed validation — clear any old errors and stash
        // a mask-only summary in sessionStorage so Stripe's success
        // page can show the user which card was charged without
        // ever storing the full PAN.
        setCardErrors({});
        sessionStorage.setItem("shippingAddress", address);
        sessionStorage.setItem("contactNumber", contact);
        sessionStorage.setItem(
          "cardLast4",
          (card.cardNumber || "").replace(/\D/g, "").slice(-4),
        );
        navigate("/customer/checkout/stripe");
        return;
      }

      const response = await checkout({
        shippingAddress: address,
        contactNumber: contact,
        paymentMethod,
      });

      toast.success("Order placed successfully!");

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("cart-updated"));

      const createdId = response?.orderId || response?.id;
      if (createdId) {
        navigate(`/customer/orders/${createdId}`);
      } else {
        navigate("/customer/orders");
      }
    } catch (error) {
      console.error("Checkout failed:", error);

      toast.error(
        error?.response?.data?.message || "Checkout failed. Please try again."
      );

      await loadCheckoutData();
    } finally {
      setProcessing(false);
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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading checkout...</p>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="container py-5 text-center">
        <div className="display-1 mb-3" role="img" aria-label="shopping cart">
          🛒
        </div>
        <h3 className="fw-bold">Your Cart is Empty</h3>
        <p className="text-muted mb-4">Add some products before checkout.</p>
        <button
          className="btn btn-primary px-4"
          onClick={() => navigate("/products")}
        >
          🛍️ Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Checkout</h2>

      <form onSubmit={handleCheckout}>
        <div className="row g-4">
          {/* LEFT SIDE */}
          <div className="col-lg-7">
            {/* Customer Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">👤 Customer Information</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Name</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={
                        user?.name ||
                        user?.fullName ||
                        user?.Name ||
                        user?.FullName ||
                        "Customer"
                      }
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || user?.Email || ""}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    Your customer information comes from your authenticated account.
                  </small>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">📍 Shipping Details</h5>

                <div className="mb-3">
                  <label
                    htmlFor="contactNumber"
                    className="form-label fw-semibold"
                  >
                    Contact Number <span className="text-danger">*</span>
                  </label>

                  <input
                    id="contactNumber"
                    type="tel"
                    className="form-control"
                    placeholder="e.g. +92 300 1234567"
                    value={contactNumber}
                    onChange={(event) =>
                      setContactNumber(event.target.value)
                    }
                    maxLength={20}
                    disabled={processing}
                    required
                  />

                  <div className="form-text">
                    Required for both Cash on Delivery and Card payments. The courier may call this number for delivery updates.
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="shippingAddress"
                    className="form-label fw-semibold"
                  >
                    Complete Delivery Address <span className="text-danger">*</span>
                  </label>

                  <textarea
                    id="shippingAddress"
                    className="form-control"
                    rows="4"
                    placeholder="Enter your complete delivery address (e.g. House #123, Street #5, Rawalpindi)"
                    value={shippingAddress}
                    onChange={(event) =>
                      setShippingAddress(event.target.value)
                    }
                    maxLength={500}
                    disabled={processing}
                    required
                  />

                  <div className="form-text">
                    Please enter your complete address including house/street number, area, city, etc.
                  </div>

                  <div className="text-end small text-muted mt-1">
                    {shippingAddress.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">💳 Payment Method</h5>

                <div className="form-check mb-3 p-3 border rounded">
                  <input
                    className="form-check-input mt-1"
                    type="radio"
                    name="paymentMethod"
                    id="paymentCOD"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    disabled={processing}
                  />
                  <label className="form-check-label ms-2 cursor-pointer" htmlFor="paymentCOD">
                    <strong className="d-block">💵 Cash on Delivery (COD)</strong>
                    <small className="text-muted">
                      Pay with cash when your package is delivered to your doorstep.
                    </small>
                  </label>
                </div>

                <div className="form-check p-3 border rounded">
                  <input
                    className="form-check-input mt-1"
                    type="radio"
                    name="paymentMethod"
                    id="paymentSTRIPE"
                    value="STRIPE"
                    checked={paymentMethod === "STRIPE"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    disabled={processing}
                  />
                  <label className="form-check-label ms-2 cursor-pointer" htmlFor="paymentSTRIPE">
                    <strong className="d-block">💳 Credit / Debit Card (Stripe)</strong>
                    <small className="text-muted">
                      Pay securely using your credit or debit card via Stripe.
                    </small>
                  </label>
                </div>

                {paymentMethod === "COD" && (
                  <div className="alert alert-info mt-3 mb-0">
                    <small>
                      <strong>Cash on Delivery:</strong> You will pay the total amount when your order is delivered.
                    </small>
                  </div>
                )}

                {paymentMethod === "STRIPE" && (
                  <div className="alert alert-primary mt-3 mb-0">
                    <small>
                      <strong>Credit / Debit Card:</strong> Pay securely online using Stripe card checkout.
                    </small>
                  </div>
                )}

                {/* Card details — only rendered for STRIPE. The form
                    runs local validation (Luhn + expiry + CVV length)
                    before letting the order continue. */}
                {paymentMethod === "STRIPE" && (
                  <CardDetailsForm
                    value={card}
                    onChange={setCard}
                    disabled={processing}
                    errors={cardErrors}
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 py-3 fw-bold"
              disabled={
                processing ||
                cart.items.length === 0 ||
                cart.isValid === false
              }
            >
              {processing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Processing Order...
                </>
              ) : (
                "Continue Checkout"
              )}
            </button>
          </div>

          {/* RIGHT SIDE — Order Summary */}
          <div className="col-lg-5">
            <div
              className="card border-0 shadow-sm sticky-top"
              style={{ top: "90px" }}
            >
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">🧾 Order Summary</h5>

                {cart.isValid === false && (
                  <div className="alert alert-danger mb-4">
                    <strong className="d-block mb-1">⚠️ Cart Issues</strong>
                    <ul className="mb-0 ps-3 small">
                      {cart.validationMessages?.map((message, index) => (
                        <li key={index}>{message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div
                  className="pe-1 mb-3"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  {cart.items.map((item) => {
                    const originalPrice = Number(item?.originalPrice || 0);
                    const unitPrice = Number(item?.unitPrice || 0);
                    const quantity = Number(item?.quantity || 0);
                    const discount = Number(item?.discountPercentage || 0);
                    const itemTotal = Number(item?.totalPrice || 0);

                    return (
                      <div
                        key={item.id}
                        className="border-bottom pb-3 mb-3"
                      >
                        <div className="row align-items-center g-2">
                          {/* Product Image */}
                          <div className="col-3">
                            <div
                              className="bg-light rounded overflow-hidden position-relative d-flex align-items-center justify-content-center"
                              style={{ height: "70px" }}
                            >
                              {getImageUrl(item) ? (
                                <>
                                  <img
                                    src={getImageUrl(item)}
                                    alt={item.productName}
                                    className="w-100 h-100"
                                    style={{ objectFit: "contain" }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      if (e.currentTarget.nextElementSibling) {
                                        e.currentTarget.nextElementSibling.style.display = "flex";
                                      }
                                    }}
                                  />
                                  <div
                                    className="h-100 w-100 align-items-center justify-content-center bg-light text-muted"
                                    style={{ display: "none" }}
                                  >
                                    🛍️
                                  </div>
                                </>
                              ) : (
                                <span className="fs-4">🛍️</span>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="col-9">
                            <h6 className="fw-bold mb-1 text-truncate" title={item.productName}>
                              {item.productName}
                            </h6>

                            <div className="text-muted small mb-1">
                              Quantity: {quantity}
                            </div>

                            {discount > 0 ? (
                              <div className="small">
                                <span className="text-muted text-decoration-line-through me-2">
                                  Rs. {formatPrice(originalPrice)}
                                </span>
                                <span className="badge bg-danger">
                                  {discount}% OFF
                                </span>
                              </div>
                            ) : null}

                            <div className="d-flex justify-content-between align-items-center mt-1">
                              <span className="fw-bold text-success small">
                                Rs. {formatPrice(unitPrice)}
                              </span>
                              <span className="fw-bold">
                                Rs. {formatPrice(itemTotal)}
                              </span>
                            </div>

                            {item?.isStockValid === false && (
                              <div className="alert alert-danger py-2 mt-2 mb-0">
                                <small>
                                  <strong>Stock Issue:</strong>{" "}
                                  {item?.stockMessage ||
                                    "This product is not currently available."}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Items */}
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Items</span>
                  <strong>{cart.totalItems}</strong>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Shipping</span>
                  <span className="text-success fw-semibold">Standard Delivery</span>
                </div>

                <hr />

                {/* Grand Total */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fs-5 fw-bold">Grand Total</span>
                  <span className="fs-4 fw-bold text-primary">
                    Rs. {formatPrice(cart.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
