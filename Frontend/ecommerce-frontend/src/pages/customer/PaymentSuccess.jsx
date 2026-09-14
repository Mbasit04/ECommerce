import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmStripeCheckout } from "../../services/paymentService";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState("verifying");
    const [orderId, setOrderId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
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

                // Notify cart listeners so the badge updates.
                window.dispatchEvent(new Event("cartUpdated"));
                window.dispatchEvent(new Event("cart-updated"));

                setOrderId(order?.orderId || order?.id);
                setStatus("succeeded");
                toast.success("Payment successful! Your order has been placed.");
            } catch (err) {
                setStatus("failed");
                setErrorMessage(
                    err?.response?.data?.message ||
                        "We could not confirm your payment. Please contact support if you were charged."
                );
                toast.error(
                    err?.response?.data?.message ||
                        "Failed to confirm payment."
                );
            }
        };

        finalizeOrder();
    }, [searchParams]);

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
