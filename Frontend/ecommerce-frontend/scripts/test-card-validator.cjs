// Standalone test runner for cardValidator.js — exercises the
// validator against real and fake card numbers and a few expiry
// edge cases. Runs under plain Node, no test framework required.

const path = require("path");
const validator = require(path.resolve(
  __dirname,
  "../src/utils/cardValidator.js",
));

let passed = 0;
let failed = 0;

const check = (name, condition) => {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
};

console.log("Card validator smoke tests");

// Real test PANs (Stripe publishes these as "always succeeds").
const visa = "4242 4242 4242 4242";
const mc = "5555 5555 5555 4444";
const amex = "3782 822463 10005";
const discover = "6011 1111 1111 1117";

const future = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
})();

console.log("\nLuhn + brand detection");
// For these tests we want to assert "Luhn accepts this PAN",
// independent of the other fields. The validator still requires
// cardholder name/expiry/cvv, so we fill those in with valid
// stubs and only assert on the cardNumber error.

const passesOnlyNumber = (pan) =>
  validator.validateCard({
    cardNumber: pan,
    cardholderName: "Test User",
    expiry: future,
    cvv: "123",
  }).errors.cardNumber === undefined;

check("Visa 4242 passes Luhn", passesOnlyNumber(visa));
check("Mastercard 5555 passes Luhn", passesOnlyNumber(mc));
check("Amex 3782 passes Luhn", passesOnlyNumber(amex));
check("Discover 6011 passes Luhn", passesOnlyNumber(discover));

check(
  "Visa brand detected",
  validator.detectCardBrand(visa) === "visa",
);
check(
  "Amex brand detected",
  validator.detectCardBrand(amex) === "amex",
);

console.log("\nInvalid card numbers");
check(
  "1234 5678 9012 3456 fails",
  !validator.validateCard({ cardNumber: "1234 5678 9012 3456" }).isValid,
);
check(
  "Too-short number fails",
  !validator.validateCard({ cardNumber: "4242 4242" }).isValid,
);
check(
  "Empty number fails",
  !validator.validateCard({ cardNumber: "" }).isValid,
);

console.log("\nExpiry handling");
check(`Future expiry ${future} is valid`, validator.isExpiryValid(future));
check("01/00 is malformed", !validator.isExpiryValid("01/00"));
check("13/30 is invalid month", !validator.isExpiryValid("13/30"));
check("00/30 is invalid month", !validator.isExpiryValid("00/30"));
check("Past 01/20 is expired", !validator.isExpiryValid("01/20"));

console.log("\nFormat helpers");
check(
  "formatExpiry pads slashes",
  validator.formatExpiry("1226") === "12/26",
);
check(
  "formatExpiry strips non-digits",
  validator.formatExpiry("12a/26") === "12/26",
);

console.log("\nFull card validation");
const ok = validator.validateCard({
  cardholderName: "Jane Doe",
  cardNumber: visa,
  expiry: future,
  cvv: "123",
});
check("Full valid card passes", ok.isValid);
check("Valid card has no errors", Object.keys(ok.errors).length === 0);

const bad = validator.validateCard({
  cardholderName: "",
  cardNumber: "1234",
  expiry: "13/30",
  cvv: "1",
});
check("Full invalid card fails", !bad.isValid);
check("Invalid card reports name error", !!bad.errors.cardholderName);
check("Invalid card reports number error", !!bad.errors.cardNumber);
check("Invalid card reports expiry error", !!bad.errors.expiry);
check("Invalid card reports cvv error", !!bad.errors.cvv);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
