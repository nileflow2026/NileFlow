/* eslint-disable no-unused-vars */
/**
 * AccountDeletion.jsx — Web Page
 * ==============================
 * Dedicated /account-deletion route.
 * Meets Google Play Data Safety & GDPR requirements.
 *
 * Flow:
 *  1. User enters email (pre-filled if authenticated)
 *  2. Clicks "Request Deletion" → POST /api/account/deletion/send-otp
 *  3. OTP modal appears → user enters 6-digit code
 *  4. On verify → POST /api/account/deletion/request
 *  5. Status screen shows scheduled deletion date
 *  6. User can check status or cancel within grace period
 */

import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Shield,
  Trash2,
  Mail,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  FileText,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCustomerAuth } from "../../Context/CustomerAuthContext";
import axiosClient from "../../api";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DATA_CATEGORIES = [
  "Account profile & personal information",
  "Order history & cart data",
  "Saved addresses & payment methods",
  "Product reviews & ratings",
  "Notification preferences",
  "Social activity (posts, likes, follows)",
  "Loyalty points (Nile Miles)",
  "Media uploads & profile photos",
  "Device & session logs",
  "Recommendation & browsing data",
];

const RETAINED_ITEMS = [
  "Financial transaction records (required by law for up to 7 years)",
  "Anonymised order references (for accounting purposes only)",
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      label: "Pending Deletion",
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      border: "border-amber-500/30",
      icon: <Clock className="w-4 h-4" />,
    },
    processing: {
      label: "Processing",
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-slate-500/20",
      text: "text-slate-400",
      border: "border-slate-500/30",
      icon: <XCircle className="w-4 h-4" />,
    },
    otp_pending: {
      label: "Awaiting Verification",
      bg: "bg-purple-500/20",
      text: "text-purple-400",
      border: "border-purple-500/30",
      icon: <Lock className="w-4 h-4" />,
    },
    none: {
      label: "No Active Request",
      bg: "bg-slate-500/10",
      text: "text-slate-500",
      border: "border-slate-700",
      icon: <Info className="w-4 h-4" />,
    },
  };

  const c = config[status] || config.none;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const AccountDeletionPage = () => {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("form"); // form | otp | status | cancelled
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Status data
  const [statusData, setStatusData] = useState(null);
  const [canCancel, setCanCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Countdown for OTP resend
  const [resendCooldown, setResendCooldown] = useState(0);

  // Pre-fill email if authenticated
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Fetch status if user is logged in
  const fetchStatus = useCallback(async () => {
    if (!user?.id && !user?.$id) return;
    const userId = user.id || user.$id;

    setStatusLoading(true);
    try {
      const res = await axiosClient.get(
        `/api/account/deletion/status/${userId}`,
      );
      const data = res.data;
      setStatusData(data);

      if (data.status === "pending" || data.status === "otp_pending") {
        // Allow cancellation during grace period
        const scheduledDate = new Date(data.scheduledDeletionDate);
        setCanCancel(scheduledDate > new Date());

        if (data.status === "pending") {
          setStep("status");
        }
      } else if (data.status === "completed") {
        setStep("status");
      }
    } catch {
      // No active request — stay on form
    } finally {
      setStatusLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/api/account/deletion/send-otp", { email });
      setStep("otp");
      setSuccessMsg("A 6-digit verification code has been sent to your email.");
      setResendCooldown(120); // 2 minute cooldown
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Failed to send verification code. Please try again.";
      const code = err.response?.data?.code;

      if (code === "OTP_RATE_LIMITED") {
        const mins = err.response?.data?.retryAfterMinutes || 60;
        setError(
          `Too many requests. Please wait ${mins} minute(s) before trying again.`,
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const otpString = otp.join("");

    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post("/api/account/deletion/request", {
        email,
        otp: otpString,
      });

      setStatusData(res.data);
      setStep("status");
      setSuccessMsg(res.data.message || "Account deletion scheduled.");
    } catch (err) {
      const data = err.response?.data || {};
      const code = data.code;

      if (code === "OTP_INVALID") {
        const rem = data.remainingAttempts;
        setError(
          `Invalid code. ${rem > 0 ? `${rem} attempt(s) remaining.` : "No attempts remaining — request a new code."}`,
        );
      } else if (code === "OTP_EXPIRED") {
        setError("Your code has expired. Please request a new one.");
        setStep("form");
      } else if (code === "OTP_LOCKED") {
        setError(
          "Too many failed attempts. Please request a new verification code.",
        );
        setStep("form");
      } else if (code === "ACTIVE_ORDERS_BLOCKING") {
        setError(
          "You have active orders in progress. Please wait for them to complete before deleting your account.",
        );
        setStep("form");
      } else {
        setError(data.error || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    try {
      await axiosClient.post("/api/account/deletion/send-otp", { email });
      setSuccessMsg("A new code has been sent to your email.");
      setResendCooldown(120);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel deletion ───────────────────────────────────────────────
  const handleCancelDeletion = async () => {
    setCancelLoading(true);
    setError("");
    try {
      await axiosClient.post("/api/account/deletion/cancel", {
        reason: cancelReason,
      });
      setStep("cancelled");
      setStatusData(null);
      setShowCancelConfirm(false);
      setSuccessMsg(
        "Account deletion cancelled successfully. Your account has been restored.",
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to cancel deletion. Please contact support.",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (paste) {
      const newOtp = paste.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtp(newOtp);
      document.getElementById(`otp-${Math.min(paste.length, 5)}`)?.focus();
    }
  };

  // ─────────────────────────────────────────────
  // Render — Form Step
  // ─────────────────────────────────────────────
  const renderForm = () => (
    <div className="max-w-2xl mx-auto">
      {/* Warning Banner */}
      <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-900/50 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-red-300 font-semibold text-lg mb-2">
              This action is permanent and irreversible
            </h2>
            <p className="text-red-400/80 text-sm leading-relaxed">
              Deleting your account will permanently remove all your data from
              Nile Flow Africa after a {7}-day grace period. This cannot be
              undone.
            </p>
          </div>
        </div>
      </div>

      {/* What will be deleted */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
        <h3 className="text-slate-200 font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Data that will be permanently deleted
        </h3>
        <ul className="space-y-2">
          {DATA_CATEGORIES.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-slate-400 text-sm"
            >
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* What will be retained */}
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-6 mb-8">
        <h3 className="text-amber-300 font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Data retained for legal compliance
        </h3>
        <ul className="space-y-2">
          {RETAINED_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-amber-400/70 text-sm"
            >
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-amber-500/60 text-xs mt-3">
          Financial records are anonymised — your personal identity is removed
          from all retained data.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSendOtp} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-slate-300 text-sm font-medium mb-2"
          >
            Confirm your email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              required
              className="w-full bg-slate-800/60 border border-slate-600/50 text-slate-200 placeholder-slate-500 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/40 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending verification code…
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Request Account Deletion
            </>
          )}
        </button>

        <p className="text-slate-500 text-xs text-center">
          A 6-digit verification code will be sent to your email to confirm this
          action.
        </p>
      </form>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render — OTP Step
  // ─────────────────────────────────────────────
  const renderOtp = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-red-900/30 rounded-2xl mb-4">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-slate-100 text-2xl font-bold mb-2">
          Verify your identity
        </h2>
        <p className="text-slate-400 text-sm">
          Enter the 6-digit code sent to{" "}
          <span className="text-slate-200 font-medium">{email}</span>
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-emerald-400 text-sm">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="space-y-6">
        {/* OTP Inputs */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={index === 0 ? handleOtpPaste : undefined}
              className="w-12 h-14 text-center text-2xl font-bold bg-slate-800/70 border-2 border-slate-600/50 text-slate-100 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-800/40 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.join("").length !== 6}
          className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <Trash2 className="w-5 h-5" />
              Confirm Deletion Request
            </>
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading || resendCooldown > 0}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
          </button>
        </div>

        {/* Back */}
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setError("");
            setSuccessMsg("");
            setOtp(["", "", "", "", "", ""]);
          }}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </form>
    </div>
  );

  // ─────────────────────────────────────────────
  // Render — Status Step
  // ─────────────────────────────────────────────
  const renderStatus = () => {
    if (!statusData) return null;

    const scheduledDate = statusData.scheduledDeletionDate
      ? new Date(statusData.scheduledDeletionDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const completedDate = statusData.completedAt
      ? new Date(statusData.completedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const requestedDate = statusData.requestedAt
      ? new Date(statusData.requestedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    return (
      <div className="max-w-xl mx-auto space-y-6">
        {/* Status Card */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-slate-200 font-semibold text-lg">
              Deletion Request
            </h2>
            <StatusBadge status={statusData.status} />
          </div>

          <div className="space-y-4">
            {requestedDate && (
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Requested on</span>
                <span className="text-slate-300 text-sm font-medium">
                  {requestedDate}
                </span>
              </div>
            )}

            {scheduledDate && statusData.status === "pending" && (
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">
                  Scheduled deletion
                </span>
                <span className="text-red-400 text-sm font-semibold">
                  {scheduledDate}
                </span>
              </div>
            )}

            {completedDate && (
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-500 text-sm">Completed on</span>
                <span className="text-emerald-400 text-sm font-medium">
                  {completedDate}
                </span>
              </div>
            )}

            {statusData.retentionNote && (
              <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4">
                <p className="text-amber-400/80 text-xs">
                  <Shield className="w-4 h-4 inline mr-1.5 text-amber-500" />
                  {statusData.retentionNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Active message for pending */}
        {statusData.status === "pending" && (
          <div className="bg-red-950/30 border border-red-800/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium mb-1">
                  Grace period active
                </p>
                <p className="text-red-400/70 text-sm leading-relaxed">
                  Your account has been locked and is scheduled for permanent
                  deletion on{" "}
                  <strong className="text-red-300">{scheduledDate}</strong>. You
                  can cancel this request before that date.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed message */}
        {statusData.status === "completed" && (
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 font-medium mb-1">
                  Account successfully deleted
                </p>
                <p className="text-emerald-400/70 text-sm">
                  All personal data has been permanently removed. Financial
                  records have been anonymised per legal requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {canCancel && statusData.status === "pending" && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-medium py-3 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Cancel Deletion Request
          </button>
        )}

        {/* Cancel confirm modal */}
        {showCancelConfirm && (
          <div className="bg-slate-900/80 border border-slate-600 rounded-2xl p-6 space-y-4">
            <h3 className="text-slate-200 font-semibold">
              Cancel your deletion request?
            </h3>
            <p className="text-slate-400 text-sm">
              Your account will be restored and you can continue using Nile Flow
              Africa normally.
            </p>
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                Reason (optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Why are you cancelling this request?"
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-slate-400 text-sm"
                maxLength={300}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleCancelDeletion}
                disabled={cancelLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {cancelLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Yes, keep my account
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setError("");
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-all"
              >
                No, proceed with deletion
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Render — Cancelled Step
  // ─────────────────────────────────────────────
  const renderCancelled = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="inline-flex p-5 bg-emerald-900/30 rounded-2xl mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-400" />
      </div>
      <h2 className="text-slate-100 text-2xl font-bold mb-3">
        Deletion Cancelled
      </h2>
      <p className="text-slate-400 mb-8">
        Your account has been restored. You can continue using Nile Flow Africa
        as normal.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-xl transition-all"
      >
        Return to Homepage
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );

  // ─────────────────────────────────────────────
  // Page Layout
  // ─────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--nf-bg-primary, #0f172a)",
        color: "var(--nf-text-primary, #e2e8f0)",
      }}
    >
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="mb-10">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-900/30 rounded-xl">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
                Delete Account & Data
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Permanently remove your Nile Flow Africa account and all
                associated personal data. Required under GDPR and Google Play
                Data Safety policy.
              </p>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {statusLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
          </div>
        ) : (
          <>
            {step === "form" && renderForm()}
            {step === "otp" && renderOtp()}
            {step === "status" && renderStatus()}
            {step === "cancelled" && renderCancelled()}
          </>
        )}

        {/* Persistent success message */}
        {successMsg && step === "cancelled" && (
          <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-emerald-800 border border-emerald-600 text-emerald-100 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {successMsg}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AccountDeletionPage;
