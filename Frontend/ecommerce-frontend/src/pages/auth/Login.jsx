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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      const token = data.token;

      if (!token) {
        toast.error("Token was not returned by server.");
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

      const message =
        error.response?.data?.message ||
        (error.request
          ? "Unable to reach the API. Confirm the backend is running."
          : "Unable to sign in. Please try again.");

      toast.error(message);
    } finally {
      setLoading(false);
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
              🔐
            </span>
            <div>
              <h1 className="h4 mb-1">Welcome back</h1>
              <p className="mb-0 opacity-75">
                Sign in to continue shopping.
              </p>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">Sign in to your account</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label fw-semibold mb-0">
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
                    type={showPwd ? "text" : "password"}
                    className="form-control form-control-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
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
                className="btn btn-primary btn-lg w-100"
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

              <div className="text-center mt-3">
                <span className="text-muted small">
                  New here?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-decoration-none fw-semibold"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
