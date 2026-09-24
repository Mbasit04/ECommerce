import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!email || !password) {
      const msg = "Email and password are required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      const token = data.token;

      if (!token) {
        const msg = "Token was not returned by server.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const user = {
        id: data.userId,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      login(token, user);

      toast.success("Login successful!");

      const role = user.role;

      if (role === "Admin") {
        navigate("/admin");
      } else if (role === "Seller") {
        navigate("/seller");
      } else if (role === "Customer") {
        navigate("/customer");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      const data = error.response?.data || {};
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
        message = error.request
          ? "Unable to reach the API. Confirm the backend is running."
          : "Unable to sign in. Please try again.";
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7 col-xl-5">
            <div
              className="auth-hero d-flex align-items-center gap-3"
              role="region"
              aria-label="Sign in to your account"
            >
              <span className="auth-hero-badge" aria-hidden="true">
                🔐
              </span>
              <div>
                <h1>Welcome back</h1>
                <p>Sign in to continue shopping.</p>
              </div>
            </div>

            <div className="auth-card">
              <h2>Sign in to your account</h2>

              {error && (
                <div
                  className="auth-error-banner"
                  role="alert"
                  aria-live="assertive"
                >
                  <span className="auth-error-icon" aria-hidden="true">
                    !
                  </span>
                  <span className="auth-error-text">{error}</span>
                  <button
                    type="button"
                    className="auth-error-dismiss"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="login-email" className="form-label">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className={
                      "form-control form-control-lg" +
                      (touched && !email ? " is-invalid-themed" : "")
                    }
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                    aria-invalid={touched && !email}
                    required
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="login-password" className="form-label mb-0">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="small text-decoration-none"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="input-group mt-1">
                    <input
                      id="login-password"
                      type={showPwd ? "text" : "password"}
                      className={
                        "form-control form-control-lg" +
                        (touched && !password ? " is-invalid-themed" : "")
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter your password"
                      disabled={loading}
                      autoComplete="current-password"
                      aria-invalid={touched && !password}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPwd((v) => !v)}
                      disabled={loading}
                      aria-label={
                        showPwd ? "Hide password" : "Show password"
                      }
                    >
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <p className="auth-meta mb-0">
                  New here? <Link to="/register">Create an account</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;