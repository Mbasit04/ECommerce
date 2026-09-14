import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.warning("Please enter your email address.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await forgotPassword(trimmed);

      setSubmitted(true);

      // In production, the server would email the user a link with
      // the reset token. In this demo build (no email server), the
      // server returns the token in the response so the user can
      // continue the flow end-to-end. Surface it via a clickable
      // shortcut when it's present.
      if (result?.devResetToken) {
        toast.info(
          ({ closeToast }) => (
            <div>
              <div className="fw-semibold mb-1">Dev reset token</div>
              <div className="small text-muted mb-2">
                In production this would be emailed. For this demo, copy
                the token or click below to continue.
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => {
                  closeToast();
                  navigate(
                    `/reset-password?email=${encodeURIComponent(
                      trimmed,
                    )}&token=${encodeURIComponent(result.devResetToken)}`,
                  );
                }}
              >
                Continue to reset →
              </button>
            </div>
          ),
          { autoClose: false },
        );
      } else {
        toast.success(
          "If an account with that email exists, a reset link has been sent.",
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to process your request right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center my-5">
      <div className="col-md-7 col-lg-5">
        <div
          className="rounded-4 p-4 p-md-5 mb-4 text-white shadow-sm"
          style={{
            background:
              "linear-gradient(120deg, #0d6efd 0%, #6610f2 60%, #d63384 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span
              className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 56, height: 56, fontSize: 26 }}
              aria-hidden="true"
            >
              🔑
            </span>
            <div>
              <h1 className="h4 mb-1">Forgot your password?</h1>
              <p className="mb-0 opacity-75">
                No worries — we'll help you set a new one.
              </p>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            {submitted ? (
              <div className="text-center">
                <div
                  className="bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64, fontSize: 28 }}
                  aria-hidden="true"
                >
                  ✉️
                </div>
                <h2 className="h5 mb-2">Check your email</h2>
                <p className="text-muted">
                  If an account exists for <strong>{email}</strong>, we've
                  sent password reset instructions. The link expires in 15
                  minutes.
                </p>

                <div className="d-flex justify-content-center gap-2 mt-4">
                  <Link to="/login" className="btn btn-outline-primary">
                    ← Back to login
                  </Link>
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                  >
                    Try a different email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="h5 mb-3">Reset your password</h2>
                <p className="text-muted small mb-4">
                  Enter the email address associated with your account and
                  we'll send you a link to reset your password.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={submitting}
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>

                <div className="text-center mt-3">
                  <Link to="/login" className="text-decoration-none">
                    ← Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
