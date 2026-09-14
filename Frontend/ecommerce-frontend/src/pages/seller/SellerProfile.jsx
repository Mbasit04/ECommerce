import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  changeSellerPassword,
  getSellerProfile,
  updateSellerProfile,
} from "../../services/sellerService";

const PROFILE_FIELDS = [
  { key: "name", label: "Full name", icon: "👤", col: "col-md-6" },
  { key: "email", label: "Email", type: "email", icon: "✉️", col: "col-md-6" },
];

const BADGE_BASE = {
  width: 40,
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  fontSize: 20,
};

const SellerProfile = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getSellerProfile();
      setForm({
        name: data?.name || data?.fullName || "",
        email: data?.email || "",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onProfileChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onPwdChange = (key) => (e) =>
    setPwdForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.warning("Name and email are required.");
      return;
    }

    try {
      setSaving(true);
      const data = await updateSellerProfile({
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setForm({
        name: data?.name || data?.fullName || "",
        email: data?.email || "",
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
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
      setChangingPassword(true);

      await changeSellerPassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      setPwdForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      toast.success(
        "Password changed. Please log in again with your new password.",
      );

      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (form.name || "?").trim().slice(0, 1).toUpperCase();

  return (
    <div>
      {/* Header banner */}
      <div
        className="rounded-4 p-4 p-md-5 mb-4 text-white shadow-sm"
        style={{
          background:
            "linear-gradient(120deg, #198754 0%, #20c997 60%, #0dcaf0 100%)",
        }}
      >
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div
            className="bg-white text-success rounded-circle d-flex align-items-center justify-content-center fw-bold"
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
            <h1 className="h3 mb-1">{form.name || "Seller Account"}</h1>
            <p className="mb-0 opacity-75">
              {form.email || "Manage your seller profile and security."}
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
          </div>

          <div className="card mt-3 shadow-sm">
            <div className="card-body small text-muted">
              <strong className="text-dark d-block mb-1">Seller tip</strong>
              Keep your contact details up to date so customers can reach
              you with order questions.
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-lg-9">
          {activeTab === "profile" ? (
            <ProfileSection
              form={form}
              loading={loading}
              saving={saving}
              onChange={onProfileChange}
              onSubmit={handleProfileSubmit}
            />
          ) : (
            <PasswordSection
              form={pwdForm}
              saving={changingPassword}
              showCurrent={showCurrent}
              showNew={showNew}
              showConfirm={showConfirm}
              setShowCurrent={setShowCurrent}
              setShowNew={setShowNew}
              setShowConfirm={setShowConfirm}
              onChange={onPwdChange}
              onSubmit={handleChangePassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-sections -------------------------------------------------------

const ProfileSection = ({ form, loading, saving, onChange, onSubmit }) => (
  <div className="card shadow-sm border-0">
    <div className="card-body p-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <span
          className="bg-success-subtle text-success"
          style={BADGE_BASE}
          aria-hidden="true"
        >
          👤
        </span>
        <div>
          <h2 className="h5 mb-0">Profile information</h2>
          <small className="text-muted">
            Update your name and contact email.
          </small>
        </div>
      </div>

      {loading ? (
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
                  value={form[key] || ""}
                  onChange={onChange(key)}
                  disabled={saving}
                  maxLength={key === "email" ? 150 : 100}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-success px-4"
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
      </form>
    </div>
  </div>
);

export default SellerProfile;
