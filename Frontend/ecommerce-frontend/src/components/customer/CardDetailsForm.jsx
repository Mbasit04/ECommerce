import React, { useMemo, useState } from "react";

import {
  detectCardBrand,
  formatExpiry,
  validateCard,
} from "../../utils/cardValidator";

// Small uppercase labels for each brand badge.
const BRAND_LABELS = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  unknown: "",
};

// ============================================================
// CardDetailsForm
// ------------------------------------------------------------
// Controlled input group used inside Checkout.jsx when the
// customer selects "Credit / Debit Card". Pure presentational —
// the parent owns the values and decides what to do when the
// card passes validation.
//
// `value`        — { cardholderName, cardNumber, expiry, cvv }
// `onChange`     — called with the full updated object
// `disabled`     — disables every input
// `errors`       — optional external error map (e.g. a server
//                  rejection). When supplied, those messages
//                  override the auto-detected ones.
// ============================================================

const CardDetailsForm = ({ value, onChange, disabled, errors }) => {
  const [touched, setTouched] = useState({});

  // Run validation whenever the value changes so the brand badge
  // and per-field error hints can update live.
  const validation = useMemo(() => validateCard(value), [value]);
  const brand = validation.brand;

  const update = (key, next) => {
    onChange({ ...value, [key]: next });
  };

  const showError = (key) => {
    if (errors && errors[key]) return errors[key];
    if (touched[key]) return validation.errors[key];
    return null;
  };

  const handleCardNumberChange = (event) => {
    // Strip non-digits, then re-group into the canonical 4-4-4-4
    // (or 4-6-5 for Amex) layout so the field is easy to read.
    const raw = event.target.value.replace(/\D/g, "").slice(0, 19);
    const detected = detectCardBrand(raw);

    let formatted = raw;
    if (detected === "amex") {
      formatted = raw.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" "),
      );
    } else {
      formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    }

    update("cardNumber", formatted);
  };

  const handleExpiryChange = (event) => {
    update("expiry", formatExpiry(event.target.value));
  };

  const handleCvvChange = (event) => {
    // Limit CVV to 3 or 4 digits depending on the brand we've
    // already detected. Cap is the wider of the two so the user
    // never gets stuck mid-typing if they haven't finished the
    // card number yet.
    const maxLen = brand === "amex" ? 4 : 4;
    update("cvv", event.target.value.replace(/\D/g, "").slice(0, maxLen));
  };

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold mb-0">💳 Card Details</h6>
          {BRAND_LABELS[brand] && (
            <span className="badge bg-primary">{BRAND_LABELS[brand]}</span>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Cardholder Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${
              showError("cardholderName") ? "is-invalid" : ""
            }`}
            placeholder="Name on the card"
            value={value.cardholderName || ""}
            onChange={(event) =>
              update("cardholderName", event.target.value)
            }
            onBlur={() => setTouched((t) => ({ ...t, cardholderName: true }))}
            maxLength={100}
            autoComplete="cc-name"
            disabled={disabled}
          />
          {showError("cardholderName") && (
            <div className="invalid-feedback">
              {showError("cardholderName")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Card Number <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            className={`form-control ${
              showError("cardNumber") ? "is-invalid" : ""
            }`}
            placeholder="1234 5678 9012 3456"
            value={value.cardNumber || ""}
            onChange={handleCardNumberChange}
            onBlur={() => setTouched((t) => ({ ...t, cardNumber: true }))}
            maxLength={brand === "amex" ? 17 : 19}
            autoComplete="cc-number"
            disabled={disabled}
          />
          {showError("cardNumber") && (
            <div className="invalid-feedback">{showError("cardNumber")}</div>
          )}
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Expiry (MM/YY) <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              className={`form-control ${
                showError("expiry") ? "is-invalid" : ""
              }`}
              placeholder="MM/YY"
              value={value.expiry || ""}
              onChange={handleExpiryChange}
              onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
              maxLength={5}
              autoComplete="cc-exp"
              disabled={disabled}
            />
            {showError("expiry") && (
              <div className="invalid-feedback">{showError("expiry")}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">
              CVV <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              className={`form-control ${
                showError("cvv") ? "is-invalid" : ""
              }`}
              placeholder={brand === "amex" ? "4 digits" : "3 digits"}
              value={value.cvv || ""}
              onChange={handleCvvChange}
              onBlur={() => setTouched((t) => ({ ...t, cvv: true }))}
              maxLength={4}
              autoComplete="cc-csc"
              disabled={disabled}
            />
            {showError("cvv") && (
              <div className="invalid-feedback">{showError("cvv")}</div>
            )}
          </div>
        </div>

        <small className="text-muted d-block mt-3">
          Your card is validated before payment. We never store your card
          details — they are sent directly to Stripe for processing.
        </small>
      </div>
    </div>
  );
};

export default CardDetailsForm;
