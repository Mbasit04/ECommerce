import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { registerUser } from "../../services/authService";

// ---------------------------------------------------------------------------
// Password rules — surfaced both as a strength meter and as a checklist so
// users see *why* their password is weak before they hit submit.
// ---------------------------------------------------------------------------

const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  { id: "digit", label: "One number", test: (p) => /\d/.test(p) },
  {
    id: "symbol",
    label: "One symbol (!@#$…)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const scorePassword = (password) => {
  if (!password) return 0;
  return PASSWORD_RULES.reduce(
    (acc, rule) => acc + (rule.test(password) ? 1 : 0),
    0,
  );
};

const strengthLabel = (score) => {
  switch (score) {
    case 0:
      return "Enter a password";
    case 1:
      return "Very weak";
    case 2:
      return "Weak";
    case 3:
      return "Decent";
    case 4:
      return "Strong";
    default:
      return "Excellent";
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Roles that can be picked at self-registration. Admin must be promoted
// out-of-band by an existing Admin — never via the public signup form.
const SELF_REGISTER_ROLES = [
  {
    value: "Customer",
    label: "Customer",
    icon: "🛍️",
    description: "Browse products, place orders, leave reviews.",
  },
  {
    value: "Seller",
    label: "Seller",
    icon: "🏪",
    description: "List products, manage stock, fulfill orders.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

  const passwordScore = useMemo(
    () => scorePassword(formData.password),
    [formData.password],
  );

  // Per-field validation flags — only mark a field "errored" once the user
  // has touched it so we don't shout at them on the first keystroke.
  const fieldErrors = useMemo(() => {
    const errs = {};
    if (formData.name.trim().length < 2) {
      errs.name = "Please enter your full name.";
    }
    if (!EMAIL_REGEX.test(formData.email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (formData.password && passwordScore < 3) {
      errs.password = "Pick a stronger password (see checklist below).";
    }
    if (
      formData.confirmPassword &&
      formData.confirmPassword !== formData.password
    ) {
      errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  }, [formData, passwordScore]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const showErrorFor = (field) => Boolean(touched[field] && fieldErrors[field]);

  const validateAll = () => {
    const errs = {
      name: formData.name.trim().length < 2
        ? "Please enter your full name."
        : null,
      email: !EMAIL_REGEX.test(formData.email.trim())
        ? "Enter a valid email address."
        : null,
      password:
        passwordScore < 3
          ? "Password is too weak. Follow the checklist below."
          : null,
      confirmPassword:
        formData.confirmPassword !== formData.password
          ? "Passwords do not match."
          : null,
    };
    setTouched({ name: true, email: true, password: true, confirmPassword: true, role: true });
    const firstError = Object.values(errs).find(Boolean);
    return firstError || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateAll();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      toast.success("Account created! Please sign in to continue.");
      navigate("/login");
    } catch (err) {
      // Prefer the most specific message the backend gives us. Validation
      // failures come back as `{ message, errors: { field: [msgs] } }`
      // from the customised ModelState handler in Program.cs.
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
        message = err?.request
          ? "Unable to reach the API. Confirm the backend is running."
          : "Registration failed. Please try again.";
      }

      // Also surface server-side field errors as inline messages so the
      // user sees *which* field is wrong, not just the top banner.
      if (fieldErrors && typeof fieldErrors === "object") {
        const fieldNameMap = {
          fullName: "name",
          FullName: "name",
          Email: "email",
          email: "email",
          Password: "password",
          password: "password",
          Role: "role",
          role: "role",
        };
        const newTouched = { ...touched };
        for (const [serverField, msgs] of Object.entries(fieldErrors)) {
          const localField = fieldNameMap[serverField] || serverField;
          if (Array.isArray(msgs) && msgs.length > 0) {
            newTouched[localField] = true;
          }
        }
        setTouched(newTouched);
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordValue = formData.password;

  return (
    <div className="auth-page register-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-7 col-xl-6">
            <div
              className="auth-hero d-flex align-items-center gap-3"
              role="region"
              aria-label="Create your account"
            >
              <span className="auth-hero-badge" aria-hidden="true">
                ✨
              </span>
              <div>
                <h1>Create your account</h1>
                <p>
                  Join ShopSpot in a few seconds.
                  <small>
                    Already a member?{" "}
                    <Link to="/login" className="text-white text-decoration-underline">
                      Sign in instead
                    </Link>
                    .
                  </small>
                </p>
              </div>
            </div>

            <div className="auth-card">
              <h2>Sign up</h2>

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
                  <label htmlFor="register-name" className="form-label">
                    Full name
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    className={
                      "form-control form-control-lg" +
                      (showErrorFor("name") ? " is-invalid-themed" : "")
                    }
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Ammar Aziz"
                    autoComplete="name"
                    disabled={loading}
                    aria-invalid={showErrorFor("name")}
                    aria-describedby={
                      showErrorFor("name") ? "register-name-error" : undefined
                    }
                    required
                  />
                  {showErrorFor("name") && (
                    <div
                      id="register-name-error"
                      className="field-error"
                      role="alert"
                    >
                      {fieldErrors.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Account type</label>
                  <div
                    className="register-role-pills"
                    role="radiogroup"
                    aria-label="Account type"
                  >
                    {SELF_REGISTER_ROLES.map((option) => {
                      const isActive = formData.role === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          className={
                            "register-role-pill" +
                            (isActive ? " is-active" : "")
                          }
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              role: option.value,
                            }));
                            if (error) setError("");
                          }}
                          disabled={loading}
                        >
                          <span aria-hidden="true" className="me-2">
                            {option.icon}
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <small className="form-text mt-2 d-block">
                    {
                      SELF_REGISTER_ROLES.find(
                        (r) => r.value === formData.role,
                      )?.description
                    }
                  </small>
                  {showErrorFor("role") && (
                    <div className="field-error" role="alert">
                      {fieldErrors.role}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="register-email" className="form-label">
                    Email address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className={
                      "form-control form-control-lg" +
                      (showErrorFor("email") ? " is-invalid-themed" : "")
                    }
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    aria-invalid={showErrorFor("email")}
                    aria-describedby={
                      showErrorFor("email")
                        ? "register-email-error"
                        : undefined
                    }
                    required
                  />
                  {showErrorFor("email") && (
                    <div
                      id="register-email-error"
                      className="field-error"
                      role="alert"
                    >
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="register-password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      id="register-password"
                      type={showPwd ? "text" : "password"}
                      name="password"
                      className={
                        "form-control form-control-lg" +
                        (showErrorFor("password") ? " is-invalid-themed" : "")
                      }
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur("password")}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={showErrorFor("password")}
                      aria-describedby="register-password-rules"
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

                  <div
                    id="register-password-rules"
                    className="password-strength"
                    data-score={passwordScore}
                    aria-hidden="true"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={
                          "password-strength-segment" +
                          (i < passwordScore ? " is-on" : "")
                        }
                      />
                    ))}
                  </div>
                  <div className="password-strength-label">
                    {strengthLabel(passwordScore)}
                  </div>

                  <ul
                    className="register-requirements"
                    aria-label="Password requirements"
                  >
                    {PASSWORD_RULES.map((rule) => {
                      const met = rule.test(passwordValue);
                      return (
                        <li
                          key={rule.id}
                          className={
                            "register-requirement" + (met ? " is-met" : "")
                          }
                        >
                          <span className="req-icon" aria-hidden="true">
                            {met ? "✓" : ""}
                          </span>
                          <span>{rule.label}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {showErrorFor("password") && (
                    <div className="field-error" role="alert">
                      {fieldErrors.password}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="register-confirm-password"
                    className="form-label"
                  >
                    Confirm password
                  </label>
                  <div className="input-group">
                    <input
                      id="register-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      className={
                        "form-control form-control-lg" +
                        (showErrorFor("confirmPassword")
                          ? " is-invalid-themed"
                          : "")
                      }
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur("confirmPassword")}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={showErrorFor("confirmPassword")}
                      aria-describedby={
                        showErrorFor("confirmPassword")
                          ? "register-confirm-error"
                          : undefined
                      }
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirm((v) => !v)}
                      disabled={loading}
                      aria-label={
                        showConfirm
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {showErrorFor("confirmPassword") && (
                    <div
                      id="register-confirm-error"
                      className="field-error"
                      role="alert"
                    >
                      {fieldErrors.confirmPassword}
                    </div>
                  )}
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
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>

                <p className="auth-meta mb-0">
                  Already have an account?{" "}
                  <Link to="/login">Sign in</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;