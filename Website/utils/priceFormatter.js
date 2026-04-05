/**
 * Formats a numeric price value into a human-readable currency string.
 * Defaults to Kenyan Shillings (KSh).
 *
 * @param {number|string} amount - The price amount to format.
 * @param {string} [currencyCode="KES"] - ISO 4217 currency code.
 * @returns {string}
 */
export function formatPrice(amount, currencyCode = "KES") {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "—";

  const symbols = {
    KES: "KSh",
    USD: "$",
  };

  const symbol = symbols[currencyCode] ?? currencyCode;
  const formatted = num.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${formatted}`;
}
