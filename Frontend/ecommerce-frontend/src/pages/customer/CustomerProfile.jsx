import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  changeCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
} from "../../services/customerService";

// Field config for the profile form. The backend DTO uses `Name`
// (mapped to `fullName` in local state) and exposes `phone`, `address`
// and `city` as separate fields, so the local form state matches what
// the API actually expects on PUT /Customer/profile.
const PROFILE_FIELDS = [
  { key: "fullName", label: "Full name", icon: "👤", col: "col-md-6" },
  { key: "email", label: "Email", type: "email", icon: "✉️", col: "col-md-6" },
  { key: "phone", label: "Phone number", icon: "📞", col: "col-md-6" },
  { key: "city", label: "City", icon: "🏙️", col: "col-md-6" },
  { key: "address", label: "Shipping address", icon: "📍", col: "col-12" },
];

// Reusable Bootstrap icon class for the section badges
const BADGE_BASE = {
  width: 40,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  fontSize: 20,
};

const CustomerProfile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCustomerProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile({
          fullName: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
          city: data?.city || "",
          address: data?.address || "",
        });
      })
      .catch((err) =>
        toast.error(
          err.response?.data?.message || "Unable to load profile.",
        ),
      )
      .finally(() => !cancelled && setProfileLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const onProfileChange = (key) => (e) =>
    setProfile((prev) => ({ ...prev, [key]: e.target.value }));

  const onPwdChange = (key) => (e) =>
    setPwdForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profile.fullName.trim() || !profile.email.trim()) {
      toast.warning("Full name and email are required.");
      return;
    }

    try {
      setProfileSaving(true);

      const payload = {
        name: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone?.trim() || null,
        address: profile.address?.trim() || null,
        city: profile.city?.trim() || null,
      };

      const updated = await updateCustomerProfile(payload);

      // Re-sync local state with what the server stored.
      setProfile({
        fullName: updated?.name || "",
        email: updated?.email || "",
        phone: updated?.phone || "",
        city: updated?.city || "",
        address: updated?.address || "",
      });

      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !pwdForm.currentPassword ||
      !pwdForm.newPassword ||
      !pwdForm.confirmNewPassword
    ) {
      toast.warning("Please fill in every password field.");
      return;
    }

    if (pwdForm.newPassword.length < 6) {
      toast.warning("New password must be at least 6 characters.");
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (pwdForm.newPassword === pwdForm.currentPassword) {
      toast.warning(
        "New password must be different from your current password.",
      );
      return;
    }

    try {
      setPwdSaving(true);

      await changeCustomerPassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
        confirmNewPassword: pwdForm.confirmNewPassword,
      });

      toast.success("Password changed. Please log in again.");

      setPwdForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      // Best practice: invalidate the session so the JWT doesn't
      // outlive the credential change.
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to change password.",
      );
    } finally {
      setPwdSaving(false);
    }
  };

  // ---------- header / chrome ----------

  const initials = (profile?.fullName || "?").trim().slice(0, 1).toUpperCase();

  return (
    <div>
      {/* Header banner */}
      <div
        className="rounded-4 p-4 p-md-5 mb-4 text-white shadow-sm"
        style={{
          background:
            "linear-gradient(120deg, #0d6efd 0%, #6610f2 60%, #d63384 100%)",
        }}
      >
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div
            className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: 72,
              height: 72,
              fontSize: 28,
              boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="flex-grow-1">
            <h1 className="h3 mb-1">
              {profile?.fullName || "My Account"}
            </h1>
            <p className="mb-0 opacity-75">
              {profile?.email || "Manage your profile and security."}
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sidebar nav */}
        <div className="col-lg-3">
          <div className="list-group shadow-sm">
            <button
              type="button"
              className={
                "list-group-item list-group-item-action d-flex align-items-center gap-2 " +
                (activeTab === "profile" ? "active" : "")
              }
              onClick={() => setActiveTab("profile")}
            >
              <span>👤</span>
              <span>Profile information</span>
            </button>

            <button
              type="button"
              className={
                "list-group-item list-group-item-action d-flex align-items-center gap-2 " +
                (activeTab === "password" ? "active" : "")
              }
              onClick={() => setActiveTab("password")}
            >
              <span>🔒</span>
              <span>Change password</span>
            </button>

            <Link
              to="/forgot-password"
              className="list-group-item list-group-item-action d-flex align-items-center gap-2 text-decoration-none"
            >
              <span>🔑</span>
              <span>Forgot password?</span>
            </Link>
          </div>

          <div className="card mt-3 shadow-sm">
            <div className="card-body small text-muted">
              <strong className="text-dark d-block mb-1">
                Security tip
              </strong>
              Never share your password with anyone. We will never ask for
              it by email or phone.
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-lg-9">
          {activeTab === "profile" ? (
            <ProfileSection
              profile={profile}
              loading={profileLoading}
              saving={profileSaving}
              onChange={onProfileChange}
              onSubmit={handleProfileSubmit}
            />
          ) : (
            <PasswordSection
              form={pwdForm}
              saving={pwdSaving}
              showCurrent={showCurrent}
              showNew={showNew}
              showConfirm={showConfirm}
              setShowCurrent={setShowCurrent}
              setShowNew={setShowNew}
              setShowConfirm={setShowConfirm}
              onChange={onPwdChange}
              onSubmit={handlePasswordSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-sections -------------------------------------------------------

const ProfileSection = ({
  profile,
  loading,
  saving,
  onChange,
  onSubmit,
}) => (
  <div className="card shadow-sm border-0">
    <div className="card-body p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <span
          className="bg-primary-subtle text-primary"
          style={BADGE_BASE}
          aria-hidden="true"
        >
          👤
        </span>
        <div>
          <h2 className="h5 mb-0">Profile information</h2>
          <small className="text-muted">
            Update your personal details and shipping address.
          </small>
        </div>
      </div>

      {loading || !profile ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading profile...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            {PROFILE_FIELDS.map(({ key, label, type = "text", icon, col }) => (
              <div className={col} key={key}>
                <label className="form-label fw-semibold">
                  <span aria-hidden="true" className="me-1">
                    {icon}
                  </span>
                  {label}
                </label>
                <input
                  className="form-control"
                  type={type}
                  value={profile[key] || ""}
                  onChange={onChange(key)}
                  disabled={saving}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Saving...
                </>
              ) : (
                <>💾 Save profile</>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => window.location.reload()}
              disabled={saving}
            >
              Discard changes
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
);

const PasswordField = ({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  disabled,
  autoComplete,
  placeholder,
}) => (
  <div className="mb-3">
    <label className="form-label fw-semibold">{label}</label>
    <div className="input-group">
      <input
        className="form-control"
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onToggleVisible}
        disabled={disabled}
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  </div>
);

const PasswordSection = ({
  form,
  saving,
  showCurrent,
  showNew,
  showConfirm,
  setShowCurrent,
  setShowNew,
  setShowConfirm,
  onChange,
  onSubmit,
}) => (
  <div className="card shadow-sm border-0">
    <div className="card-body p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <span
          className="bg-warning-subtle text-warning"
          style={BADGE_BASE}
          aria-hidden="true"
        >
          🔒
        </span>
        <div>
          <h2 className="h5 mb-0">Change password</h2>
          <small className="text-muted">
            Choose a strong password you don't use anywhere else.
          </small>
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
        <PasswordField
          label="Current password"
          value={form.currentPassword}
          onChange={onChange("currentPassword")}
          visible={showCurrent}
          onToggleVisible={() => setShowCurrent((v) => !v)}
          disabled={saving}
          autoComplete="current-password"
          placeholder="Enter your current password"
        />

        <PasswordField
          label="New password"
          value={form.newPassword}
          onChange={onChange("newPassword")}
          visible={showNew}
          onToggleVisible={() => setShowNew((v) => !v)}
          disabled={saving}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />

        <PasswordField
          label="Confirm new password"
          value={form.confirmNewPassword}
          onChange={onChange("confirmNewPassword")}
          visible={showConfirm}
          onToggleVisible={() => setShowConfirm((v) => !v)}
          disabled={saving}
          autoComplete="new-password"
          placeholder="Repeat the new password"
        />

        <div className="d-flex flex-wrap gap-2 mt-2">
          <button
            type="submit"
            className="btn btn-warning px-4"
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Updating...
              </>
            ) : (
              <>🔐 Update password</>
            )}
          </button>

          <Link to="/forgot-password" className="btn btn-link">
            Forgot your current password?
          </Link>
        </div>
      </form>
    </div>
  </div>
);

export default CustomerProfile;
