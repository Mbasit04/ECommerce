import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmStripeCheckout } from "../../services/paymentService";
import { useCart } from "../../context/CartContext";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refresh: refreshCart } = useCart();

    const [status, setStatus] = useState("verifying");
    const [orderId, setOrderId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [cardLast4, setCardLast4] = useState(null);
    const confirmRef = useRef(false);

    useEffect(() => {
        if (confirmRef.current) return;
        confirmRef.current = true;

        const finalizeOrder = async () => {
            const paymentIntentId =
                searchParams.get("payment_intent");

            // Stripe uses redirect_status= succeeded | failed |
            // requires_payment_method. If the redirect_status is missing
            // it usually means the user closed the modal — still treat as
            // failure for safety.
            const redirectStatus =
                searchParams.get("redirect_status") || "succeeded";

            const shippingAddress =
                sessionStorage.getItem("shippingAddress");
            const contactNumber =
                sessionStorage.getItem("contactNumber");

            // Surface a friendly "card ending in 1234" confirmation —
            // we stored only the last 4 in Checkout, never the PAN.
            const last4 = sessionStorage.getItem("cardLast4");
            if (last4) {
                setCardLast4(last4);
            }

            if (redirectStatus !== "succeeded" || !paymentIntentId) {
                setStatus("failed");
                setErrorMessage(
                    "Payment was not completed. No amount has been charged."
                );
                return;
            }

            if (!shippingAddress || !contactNumber) {
                setStatus("failed");
                setErrorMessage(
                    "Shipping details were lost. Please contact support."
                );
                return;
            }

            try {
                const order = await confirmStripeCheckout({
                    paymentIntentId,
                    shippingAddress,
                    contactNumber,
                });

                // Clean up session storage so a refresh doesn't
                // accidentally re-finalize.
                sessionStorage.removeItem("shippingAddress");
                sessionStorage.removeItem("contactNumber");
                sessionStorage.removeItem("cardLast4");

                // Notify any other cart listeners (legacy code paths).
                window.dispatchEvent(new Event("cartUpdated"));
                window.dispatchEvent(new Event("cart-updated"));

                // Direct refresh — don't rely on the event being heard
                // before this component unmounts.
                try {
                    await refreshCart();
                } catch (refreshErr) {
                    console.warn("Cart refresh after payment failed:", refreshErr);
                }

                setOrderId(order?.orderId || order?.id);
                setStatus("succeeded");
                toast.success("Payment successful! Your order has been placed.");
            } catch (err) {
                console.error("Payment finalize error:", err);

                // Pull the most useful message out of the response. The
                // backend uses { message } on throws and { message, errors }
                // on ModelState validation failures.
                const data = err?.response?.data || {};
                const fieldErrors = data.errors;
                let message = data.message || data.title;

                if (!message && fieldErrors && typeof fieldErrors === "object") {
                    const firstField = Object.keys(fieldErrors)[0];
                    if (firstField) {
                        const firstMsgs = fieldErrors[firstField];
                        if (Array.isArray(firstMsgs) && firstMsgs.length > 0) {
                            message = `${firstField}: ${firstMsgs[0]}`;
                        }
                    }
                }

                if (!message) {
                    message =
                        "We could not confirm your payment. Please contact support if you were charged.";
                }

                setStatus("failed");
                setErrorMessage(message);
                toast.error(message);

                // Even on failure, try to refresh the cart in case the
                // backend partial-completed (order saved but cart not
                // cleared) — better to show truth than a stale badge.
                try {
                    await refreshCart();
                } catch (_) {
                    /* swallow — refresh is best-effort */
                }
            }
        };

        finalizeOrder();
    }, [searchParams, refreshCart]);

    if (status === "verifying") {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="fw-bold mt-3">
                    Confirming your payment...
                </h3>
                <p className="text-muted">
                    Please don't refresh or close this tab.
                </p>
            </div>
        );
    }

    if (status === "succeeded") {
        return (
            <div className="container py-5">
                <div className="text-center mb-4">
                    <div
                        className="d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle"
                        style={{ width: "90px", height: "90px" }}
                    >
                        <span className="display-4">✓</span>
                    </div>
                    <h2 className="fw-bold mt-3">
                        Payment Successful!
                    </h2>
                    <p className="text-muted">
                        Thank you for your order. We've emailed the details and
                        will ship your items soon.
                    </p>
                    {cardLast4 && (
                        <p className="text-muted small">
                            Card ending in <strong>•••• {cardLast4}</strong>{" "}
                            was charged successfully.
                        </p>
                    )}
                </div>

                <div className="d-flex justify-content-center gap-2">
                    {orderId && (
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() =>
                                navigate(`/customer/orders/${orderId}`)
                            }
                        >
                            View Order
                        </button>
                    )}
                    <button
                        className="btn btn-outline-secondary btn-lg"
                        onClick={() => navigate("/customer/orders")}
                    >
                        My Orders
                    </button>
                    <button
                        className="btn btn-outline-primary btn-lg"
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="text-center mb-4">
                <div
                    className="d-inline-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle"
                    style={{ width: "90px", height: "90px" }}
                >
                    <span className="display-4">✕</span>
                </div>
                <h2 className="fw-bold mt-3">Payment Failed</h2>
                <p className="text-muted">
                    {errorMessage ||
                        "Your payment could not be completed. No amount has been charged."}
                </p>
            </div>

            <div className="d-flex justify-content-center gap-2">
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate("/customer/checkout")}
                >
                    Try Again
                </button>
                <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate("/customer/cart")}
                >
                    Back to Cart
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
