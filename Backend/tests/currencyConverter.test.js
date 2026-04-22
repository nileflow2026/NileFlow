/**
 * Currency Converter Unit Tests — NileFlow CAL
 *
 * Tests the conversion engine without any external dependencies.
 * Run with: node Backend/tests/currencyConverter.test.js
 */

"use strict";

const {
  convertPrice,
  applyPsychologicalPricing,
  roundForCurrency,
  formatCurrency,
  enrichProductWithCurrency,
  enrichProductsWithCurrency,
  validateCurrencyCode,
  CURRENCY_META,
} = require("../utils/currencyConverter");

// ---------------------------------------------------------------------------
// Minimal test harness (no Jest required)
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

function assertEq(actual, expected, description) {
  const ok = actual === expected;
  if (ok) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`         Expected: ${JSON.stringify(expected)}`);
    console.error(`         Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function describe(suite, fn) {
  console.log(`\n📦 ${suite}`);
  fn();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("convertPrice()", () => {
  // KES → UGX (rate: 27.5)
  const ugxRate = 27.5;

  assertEq(
    convertPrice({ amount: 1000, from: "KES", to: "UGX", rate: ugxRate }),
    27500,
    "KES 1,000 → UGX 27,500"
  );

  assertEq(
    convertPrice({ amount: 1000, from: "KES", to: "KES", rate: 1 }),
    1000,
    "KES → KES returns same amount"
  );

  assertEq(
    convertPrice({ amount: 0, from: "KES", to: "UGX", rate: ugxRate }),
    0,
    "Zero amount returns 0"
  );

  assertEq(
    convertPrice({ amount: NaN, from: "KES", to: "UGX", rate: ugxRate }),
    0,
    "NaN amount returns 0"
  );

  // SSP (2 decimals)
  const sspRate = 15.9;
  const sspResult = convertPrice({ amount: 500, from: "KES", to: "SSP", rate: sspRate });
  assertEq(sspResult, 7950, "KES 500 → SSP 7,950");

  // Psychological pricing
  const psychResult = convertPrice({
    amount: 1000,
    from: "KES",
    to: "UGX",
    rate: ugxRate,
    psychological: true,
  });
  assert(
    [27499, 26999, 27999].includes(psychResult),
    `Psychological pricing applied to UGX 27,500 → ${psychResult}`
  );
});

describe("roundForCurrency()", () => {
  assertEq(roundForCurrency(27500.7, "UGX"), 27501, "UGX rounds to integer");
  assertEq(roundForCurrency(9998.23, "KES"), 9998, "KES rounds to integer");
  assertEq(roundForCurrency(7.956, "USD"), 7.96, "USD rounds to 2 decimals");
  assertEq(roundForCurrency(7.956, "EUR"), 7.96, "EUR rounds to 2 decimals");
});

describe("applyPsychologicalPricing()", () => {
  // Whole-number currencies (KES, UGX, etc.)
  assertEq(applyPsychologicalPricing(100, "KES"), 99, "100 → 99 (KES)");
  assertEq(applyPsychologicalPricing(1000, "KES"), 999, "1,000 → 999 (KES)");
  assertEq(applyPsychologicalPricing(5000, "KES"), 4999, "5,000 → 4,999 (KES)");
  assertEq(applyPsychologicalPricing(10000, "KES"), 9999, "10,000 → 9,999 (KES)");
  assertEq(applyPsychologicalPricing(50000, "KES"), 49999, "50,000 → 49,999 (KES)");

  // Decimal currencies should pass through unchanged
  const usdResult = applyPsychologicalPricing(7.99, "USD");
  assertEq(usdResult, 7.99, "USD decimal price passes through");
});

describe("formatCurrency()", () => {
  assert(
    formatCurrency(1000, "KES").includes("KSh"),
    "KES format includes KSh symbol"
  );
  assert(
    formatCurrency(27500, "UGX").includes("UGX"),
    "UGX format includes UGX symbol"
  );
  assert(
    formatCurrency(7.99, "USD").includes("$"),
    "USD format includes $ symbol"
  );
  assert(
    formatCurrency(5000, "NGN").includes("₦"),
    "NGN format includes ₦ symbol"
  );
});

describe("enrichProductWithCurrency()", () => {
  const product = { $id: "prod_1", productName: "Test Shoes", price: 2000, stock: 5 };
  const rate = 27.5; // KES → UGX

  const enriched = enrichProductWithCurrency(product, "UGX", rate);

  assert(
    typeof enriched.price === "object",
    "price field is now an object"
  );
  assertEq(enriched.price.basePrice, 2000, "basePrice is original KES value");
  assertEq(enriched.price.baseCurrency, "KES", "baseCurrency is KES");
  assertEq(enriched.price.currency, "UGX", "currency is UGX");
  assertEq(enriched.price.convertedPrice, 55000, "convertedPrice is 2000 × 27.5 = 55,000");
  assert(
    enriched.price.displayValue.includes("UGX"),
    "displayValue includes currency symbol"
  );
  assertEq(enriched.price.raw, 2000, "raw field preserves original for backward compat");

  // KES → KES (no conversion)
  const kesEnriched = enrichProductWithCurrency(product, "KES", 1);
  assertEq(kesEnriched.price.convertedPrice, 2000, "KES → KES no conversion");
});

describe("enrichProductsWithCurrency() batch", () => {
  const products = [
    { $id: "1", price: 500 },
    { $id: "2", price: 1000 },
    { $id: "3", price: 2500 },
  ];
  const enriched = enrichProductsWithCurrency(products, "UGX", 27.5);

  assertEq(enriched.length, 3, "All 3 products enriched");
  assertEq(enriched[0].price.convertedPrice, 13750, "Product 1: 500 × 27.5 = 13,750");
  assertEq(enriched[1].price.convertedPrice, 27500, "Product 2: 1000 × 27.5 = 27,500");
  assertEq(enriched[2].price.convertedPrice, 68750, "Product 3: 2500 × 27.5 = 68,750");
});

describe("validateCurrencyCode()", () => {
  assertEq(validateCurrencyCode("kes"), "KES", "lowercase kes → KES");
  assertEq(validateCurrencyCode("UGX"), "UGX", "UGX valid");
  assertEq(validateCurrencyCode("XYZ"), null, "XYZ invalid → null");
  assertEq(validateCurrencyCode(null), null, "null → null");
  assertEq(validateCurrencyCode(123), null, "number → null");
  assertEq(validateCurrencyCode("  ssp  "), "SSP", "padded ssp → SSP");
});

describe("Multi-country scenarios", () => {
  // Uganda user viewing a KES 1,000 product
  const ugandaResult = convertPrice({ amount: 1000, from: "KES", to: "UGX", rate: 27.5 });
  assert(ugandaResult >= 27000 && ugandaResult <= 28000, `Uganda: UGX ${ugandaResult} (expect ~27,500)`);

  // Kenya user (no conversion needed)
  const kenyaResult = convertPrice({ amount: 1000, from: "KES", to: "KES", rate: 1 });
  assertEq(kenyaResult, 1000, "Kenya: KES 1,000 unchanged");

  // South Sudan user
  const sspResult = convertPrice({ amount: 1000, from: "KES", to: "SSP", rate: 15.9 });
  assertEq(sspResult, 15900, "South Sudan: SSP 15,900");

  // Nigeria user
  const ngnResult = convertPrice({ amount: 1000, from: "KES", to: "NGN", rate: 10.2 });
  assertEq(ngnResult, 10200, "Nigeria: NGN 10,200");
});

describe("CURRENCY_META completeness", () => {
  const requiredCurrencies = ["KES", "UGX", "TZS", "ETB", "NGN", "GHS", "RWF", "SSP", "USD"];
  for (const code of requiredCurrencies) {
    assert(
      CURRENCY_META[code] !== undefined,
      `CURRENCY_META has entry for ${code}`
    );
    assert(
      typeof CURRENCY_META[code].symbol === "string",
      `${code} has symbol`
    );
    assert(
      typeof CURRENCY_META[code].decimals === "number",
      `${code} has decimals`
    );
  }
});

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${"─".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed!\n");
}
