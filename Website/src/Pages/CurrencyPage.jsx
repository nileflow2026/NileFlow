import React from "react";
import Header from "../../components/Header";
import {
  Currency,
  Globe,
  Shield,
  CheckCircle,
  Sparkles,
  MapPin,
} from "lucide-react";
import Footer from "../../components/Footer";
import { useCurrency, CURRENCY_META } from "../../Context/CurrencyProvider";

const CURRENCY_NAMES = {
  KES: "Kenyan Shilling", UGX: "Ugandan Shilling", TZS: "Tanzanian Shilling",
  ETB: "Ethiopian Birr", NGN: "Nigerian Naira", GHS: "Ghanaian Cedi",
  RWF: "Rwandan Franc", SSP: "South Sudanese Pound", ZMW: "Zambian Kwacha",
  MZN: "Mozambican Metical", BWP: "Botswana Pula", ZAR: "South African Rand",
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound",
};

const CURRENCY_FLAGS = {
  KES: "🇰🇪", UGX: "🇺🇬", TZS: "🇹🇿", ETB: "🇪🇹", NGN: "🇳🇬",
  GHS: "🇬🇭", RWF: "🇷🇼", SSP: "🇸🇸", ZMW: "🇿🇲", MZN: "🇲🇿",
  BWP: "🇧🇼", ZAR: "🇿🇦", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧",
};

const CurrencyPage = () => {
  const { currency, currencyMeta, loading } = useCurrency();
  const currencyName = CURRENCY_NAMES[currency] ?? currency;
  const flag = CURRENCY_FLAGS[currency] ?? "🌍";

  return (
    <div className="min-h-screen bg-[var(--nf-bg-primary)] text-[color:var(--nf-text-primary)]">
      <Header />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 backdrop-blur-sm border border-[var(--nf-border-subtle)] rounded-2xl px-6 py-3 mb-6">
              <Currency className="w-6 h-6 text-amber-400" />
              <span className="text-[color:var(--nf-text-secondary)] font-medium">
                Currency Information
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 mb-4">
              Your Local Currency
            </h1>
            <p className="text-xl text-[color:var(--nf-text-secondary)] max-w-2xl mx-auto">
              Prices are automatically displayed in your local currency based on
              your location — no setup needed.
            </p>
          </div>

          {/* Current Currency Display */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-[var(--nf-border-subtle)] rounded-3xl p-8 mb-8">
            <div className="text-center">
              {loading ? (
                <div className="text-4xl animate-pulse mb-4">🌍</div>
              ) : (
                <div className="text-6xl mb-4">{flag}</div>
              )}
              <h2 className="text-3xl font-bold text-[color:var(--nf-accent)] mb-2">
                {loading ? "Detecting your location…" : currencyName}
              </h2>
              {!loading && (
                <>
                  <p className="text-xl text-[color:var(--nf-text-secondary)] mb-2">
                    Code:{" "}
                    <span className="text-amber-400 font-bold">{currency}</span>
                    {"  "}·{"  "}Symbol:{" "}
                    <span className="text-amber-400 font-bold">
                      {currencyMeta?.symbol}
                    </span>
                  </p>
                  <p className="text-[color:var(--nf-text-muted)]">
                    Detected automatically from your location
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Auto Detection Card */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-emerald-300">
                  Auto-Detection
                </h3>
              </div>
              <ul className="space-y-2 text-[color:var(--nf-text-secondary)]">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Detects your country via IP geolocation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Falls back to your browser language</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Live exchange rates updated every 4 hours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Supports 15+ African and global currencies</span>
                </li>
              </ul>
            </div>

            {/* Payment Methods Card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-sm border border-blue-700/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-blue-300">
                  Supported Payments
                </h3>
              </div>
              <ul className="space-y-2 text-[color:var(--nf-text-secondary)]">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>M-Pesa (KES)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Bank transfers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Visa/Mastercard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Cash on Delivery</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-gradient-to-br from-amber-900/10 to-yellow-900/10 backdrop-blur-sm border border-amber-700/20 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-semibold text-[color:var(--nf-accent)]">
                How It Works
              </h4>
            </div>
            <p className="text-[color:var(--nf-text-secondary)]">
              All prices are stored in Kenyan Shillings (KES) and converted to
              your local currency in real time using live exchange rates. The
              price you see already reflects your currency — no hidden conversion
              charges.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CurrencyPage;
