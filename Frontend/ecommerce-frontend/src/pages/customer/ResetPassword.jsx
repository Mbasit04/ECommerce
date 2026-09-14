import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { resetPassword } from "../../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromQuery = useMemo(
    () => searchParams.get("email") || "",
    [searchParams],
  );
  const tokenFromQuery = useMemo(
    () => searchParams.get("token") || "",
    [searchParams],
  );

  const [form, setForm] = useState({
    email: emailFromQuery,
    token: tokenFromQuery,
    newPassword: "",
    confirmNewPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: emailFromQuery || prev.email,
      token: tokenFromQuery || prev.token,
    }));
  }, [emailFromQuery, tokenFromQuery]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.token.trim()) {
      toast.warning("Email and reset token are required.");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.warning("New password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await resetPassword({
        email: form.email.trim(),
        token: form.token.trim(),
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });

      setSuccess(true);
      toast.success("Password reset. You can now log in.");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to reset password. The token may be invalid or expired.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const noToken = !form.token.trim();

  return (
    <div className="row justify-content-center my-5">
      <div className="col-md-7 col-lg-5">
        <div
          className="rounded-4 p-4 p-md-5 mb-4 text-white shadow-sm"
          style={{
            background:
              "linear-gradient(120deg, #198754 0%, #20c997 60%, #0dcaf0 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <span
              className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 56, height: 56, fontSize: 26 }}
              aria-hidden="true"
            >
              🔐
            </span>
            <div>
              <h1 className="h4 mb-1">Set a new password</h1>
              <p className="mb-0 opacity-75">
                Almost done. Pick something strong and memorable.
              </p>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            {success ? (
              <div className="text-center">
                <div
                  className="bg-success-subtle text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64, fontSize: 28 }}
                  aria-hidden="true"
                >
                  ✓
                </div>
                <h2 className="h5 mb-2">Password updated</h2>
                <p className="text-muted">
                  Your new password is set. Redirecting you to the login
                  page...
                </p>
                <Link to="/login" className="btn btn-primary mt-2">
                  Go to login now
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {noToken && (
                  <div className="alert alert-warning small">
                    <strong>Missing reset token.</strong> Open the link
                    from your email, or request a new one from the{" "}
                    <Link to="/forgot-password">forgot password</Link>{" "}
                    page.
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={onChange("email")}
                    disabled={submitting}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Reset token
                  </label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={form.token}
                    onChange={onChange("token")}
                    disabled={submitting}
                    placeholder="Paste the token from your email"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    New password
                  </label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type={showNew ? "text" : "password"}
                      value={form.newPassword}
                      onChange={onChange("newPassword")}
                      disabled={submitting}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNew((v) => !v)}
                      disabled={submitting}
                    >
                      {showNew ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Confirm new password
                  </label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmNewPassword}
                      onChange={onChange("confirmNewPassword")}
                      disabled={submitting}
                      autoComplete="new-password"
                      placeholder="Repeat the new password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirm((v) => !v)}
                      disabled={submitting}
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Updating...
                    </>
                  ) : (
                    "Reset password"
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

export default ResetPassword;
