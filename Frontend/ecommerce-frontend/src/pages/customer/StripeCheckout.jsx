import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe
} from "@stripe/react-stripe-js";
import stripePromise from "../../services/stripe";
import {
    createPaymentIntent
} from "../../services/paymentService";

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setMessage("");

        // Stripe automatically appends payment_intent and
        // payment_intent_client_secret to the return URL on success.
        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment-success`
            }
        });

        if (result.error) {
            setMessage(result.error.message);
            toast.error(result.error.message || "Payment failed.");
            setLoading(false);
        }
        // If there's no error, Stripe is redirecting the
        // browser to return_url — no further action here.
    };

    const handleCancel = () => {
        navigate("/customer/checkout");
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />

            <div className="d-flex gap-2 mt-3">
                <button
                    type="submit"
                    className="btn btn-primary btn-lg flex-grow-1"
                    disabled={!stripe || !elements || loading}
                >
                    {loading ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                            Processing...
                        </>
                    ) : (
                        "Pay Now"
                    )}
                </button>

                <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>

            {message && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                    {message}
                </div>
            )}
        </form>
    );
};

const StripeCheckout = () => {
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [error, setError] = useState("");
    const [shippingAddress, setShippingAddress] = useState(null);
    const [contactNumber, setContactNumber] = useState(null);

    useEffect(() => {
        const address = sessionStorage.getItem("shippingAddress");
        const contact = sessionStorage.getItem("contactNumber");

        if (!address || !contact) {
            toast.error(
                "Shipping details are missing. Please return to checkout."
            );
            navigate("/customer/checkout");
            return;
        }

        setShippingAddress(address);
        setContactNumber(contact);

        const loadPaymentIntent = async () => {
            try {
                const data = await createPaymentIntent();
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.paymentIntentId);
            } catch (err) {
                const msg =
                    err.response?.data?.message ||
                    "Unable to initialize payment.";
                setError(msg);
                toast.error(msg);
            }
        };

        loadPaymentIntent();
    }, [navigate]);

    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/customer/checkout")}
                >
                    Back to checkout
                </button>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading payment...</p>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="fw-bold mb-4">💳 Secure Card Payment</h2>

            <div className="row">
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-4">
                            <Elements
                                stripe={stripePromise}
                                options={{ clientSecret }}
                            >
                                <CheckoutForm />
                            </Elements>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div
                        className="card border-0 shadow-sm sticky-top"
                        style={{ top: "90px" }}
                    >
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">
                                📦 Delivery Details
                            </h5>

                            <div className="mb-3">
                                <small className="text-muted d-block">
                                    Shipping address
                                </small>
                                <span>{shippingAddress}</span>
                            </div>

                            <div className="mb-3">
                                <small className="text-muted d-block">
                                    Contact number
                                </small>
                                <span>{contactNumber}</span>
                            </div>

                            <hr />

                            <small className="text-muted">
                                Your card is processed securely by Stripe. We
                                never store your card details.
                            </small>

                            {paymentIntentId && (
                                <div className="mt-3 small text-muted">
                                    Reference: {paymentIntentId}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripeCheckout;
