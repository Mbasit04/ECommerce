import React, { useEffect, useState } from "react";

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

    const stripe =
        useStripe();

    const elements =
        useElements();

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            if (!stripe || !elements) {
                return;
            }

            setLoading(true);

            setMessage("");

            const result =
                await stripe.confirmPayment({
                    elements,

                    confirmParams: {
                        return_url:
                            `${window.location.origin}/payment-success`
                    }
                });

            if (result.error) {
                setMessage(
                    result.error.message
                );

                setLoading(false);
            }
        };

    return (
        <form
            onSubmit={handleSubmit}
        >
            <PaymentElement />

            <button
                type="submit"
                disabled={
                    !stripe ||
                    !elements ||
                    loading
                }
            >
                {loading
                    ? "Processing..."
                    : "Pay Now"}
            </button>

            {message && (
                <p>
                    {message}
                </p>
            )}
        </form>
    );
};

const StripeCheckout = () => {

    const [clientSecret, setClientSecret] =
        useState(null);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadPaymentIntent =
            async () => {

                try {

                    const data =
                        await createPaymentIntent();

                    setClientSecret(
                        data.clientSecret
                    );

                }
                catch (err) {

                    setError(
                        err.response?.data?.message ||
                        "Unable to initialize payment."
                    );
                }
            };

        loadPaymentIntent();

    }, []);

    if (error) {
        return (
            <div>
                {error}
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div>
                Loading payment...
            </div>
        );
    }

    const options = {
        clientSecret
    };

    return (
        <Elements
            stripe={stripePromise}
            options={options}
        >
            <CheckoutForm />
        </Elements>
    );
};

export default StripeCheckout;