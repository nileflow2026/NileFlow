/**
 * useCurrency — NileFlow Website
 *
 * Re-exports the hook from CurrencyProvider so components can import from
 * a consistent hooks path without knowing the provider location.
 *
 * Currency is automatically detected from the user's location (IP geo-detection
 * via backend, then browser locale, then default KES).
 *
 * Usage:
 *   import { useCurrency } from "@/hooks/useCurrency";
 *   const { displayPrice, currency } = useCurrency();
 */
export { useCurrency } from "../../Context/CurrencyProvider";
