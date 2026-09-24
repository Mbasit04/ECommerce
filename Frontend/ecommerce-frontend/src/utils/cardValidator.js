// ============================================================
// Card validator — runs BEFORE handing off to Stripe.
//
// Stripe Elements will still re-validate the card on submission,
// but the user requirement is to fail fast and visibly when the
// card itself is invalid. We validate four things:
//
//   1. Cardholder name    — 2 to 100 visible chars
//   2. Card number        — 13-19 digits, Luhn check passes
//   3. Expiry (MM/YY)     — valid month, not in the past
//   4. CVV                — 3 digits (4 for Amex)
//
// None of this touches the network — Stripe never sees the
// number until the user actually submits on the Stripe form.
// ============================================================

const NAME_MIN = 2;
const NAME_MAX = 100;

// Strip everything except digits so the Luhn algorithm works on
// whatever the user typed — spaces, dashes, even partial entry.
const digitsOnly = (value) => (value || "").replace(/\D/g, "");

// Luhn (mod-10) check — the same algorithm issuers use to detect
// typos in card numbers. Returns true when the number passes.
const passesLuhn = (value) => {
  const digits = digitsOnly(value);

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let alt = false;

  // Walk right-to-left; every second digit is doubled, and if the
  // doubled value is >9 we subtract 9 (equivalent to summing the
  // digits of the doubled number).
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits.charAt(i), 10);

    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
    alt = !alt;
  }

  return sum % 10 === 0;
};

// Detect card brand by leading digits so the CVV hint can switch
// from "3 digits" to "4 digits" for American Express. Returns one
// of: "visa", "mastercard", "amex", "discover", "unknown".
export const detectCardBrand = (value) => {
  const digits = digitsOnly(value);

  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";

  return "unknown";
};

// Amex cards have 4-digit CVVs; everything else has 3.
const expectedCvvLength = (brand) => (brand === "amex" ? 4 : 3);

// Format MM/YY on the fly for the input field. Always returns a
// string ≤ 5 chars so the input mask stays predictable.
export const formatExpiry = (raw) => {
  const digits = digitsOnly(raw).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

// Parse the user-entered MM/YY into a year + month. Returns null
// when the input is malformed so callers can branch on it.
const parseExpiry = (raw) => {
  const cleaned = (raw || "").replace(/\s/g, "");
  const match = cleaned.match(/^(\d{2})\/(\d{2})$/);

  if (!match) return null;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  if (month < 1 || month > 12) return null;

  return { month, year };
};

// Validate the entered expiry against the current month. We treat
// the expiry as "end of that month", so a card expiring 09/26 is
// still valid through 30 Sep 2026.
export const isExpiryValid = (raw, now = new Date()) => {
  const parsed = parseExpiry(raw);

  if (!parsed) return false;

  const fullYear = 2000 + parsed.year;
  const expiryEnd = new Date(fullYear, parsed.month, 0, 23, 59, 59);

  return expiryEnd >= now;
};

// Master validator. Accepts an object shaped like the form state
// and returns `{ isValid, errors }` so each input can highlight
// its own mistake.
export const validateCard = (card) => {
  const errors = {};

  // Cardholder name
  const name = (card?.cardholderName || "").trim();
  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    errors.cardholderName =
      "Cardholder name must be between 2 and 100 characters.";
  }

  // Card number
  const cardNumber = (card?.cardNumber || "").trim();
  if (!cardNumber) {
    errors.cardNumber = "Card number is required.";
  } else if (!passesLuhn(cardNumber)) {
    errors.cardNumber = "Please enter a valid card number.";
  }

  // Expiry
  const expiry = (card?.expiry || "").trim();
  if (!expiry) {
    errors.expiry = "Expiry is required.";
  } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.expiry = "Expiry must be in MM/YY format.";
  } else if (!isExpiryValid(expiry)) {
    errors.expiry = "Card has expired or invalid expiry date.";
  }

  // CVV
  const cvv = (card?.cvv || "").trim();
  const brand = detectCardBrand(cardNumber);
  const requiredCvv = expectedCvvLength(brand);

  if (!cvv) {
    errors.cvv = "CVV is required.";
  } else if (!new RegExp(`^\\d{${requiredCvv}}$`).test(cvv)) {
    errors.cvv = `CVV must be ${requiredCvv} digits for ${
      brand === "unknown" ? "this card" : brand
    }.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    brand,
  };
};
