/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  UserCheck,
  AlertCircle,
  Globe,
  TrendingUp,
  Package,
  Users,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/VendorAuthContext";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/vendor/dashboard";

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password, rememberMe);

      if (result.success) {
        toast.success("Welcome back!", {
          description: "Successfully logged in to your vendor dashboard",
          duration: 3000,
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        });

        // Small delay for toast to show before navigation
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setError(result.error);
        toast.error("Login failed", {
          description: result.error || "Invalid credentials",
        });
      }
    } catch (err) {
      setError("Failed to log in. Please try again.");
      toast.error("Login failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#F5F0E6] to-[#FAF7F2] dark:from-[#1A1A1A] dark:via-[#242424] dark:to-[#1A1A1A] p-4 md:p-6 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-[#D4A017]/5 to-[#B8860B]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-[#27AE60]/5 to-[#2ECC71]/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-[#9B59B6]/5 to-[#8E44AD]/5 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Vendor Benefits & Info */}
          <div className="hidden lg:flex flex-col justify-center p-8">
            <div className="max-w-md">
              <Link
                to="/"
                className="inline-flex items-center gap-3 mb-8 group"
              >
                <ArrowLeft className="w-5 h-5 text-[#8B4513] dark:text-[#D4A017] group-hover:translate-x-[-4px] transition-transform" />
                <span className="text-sm font-medium text-[#8B4513] dark:text-[#D4A017]">
                  Back to Home
                </span>
              </Link>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#D4A017] to-[#8B6914] flex items-center justify-center shadow-xl">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4A017] to-[#8B6914] bg-clip-text text-transparent">
                      Nile Flow
                    </h1>
                    <p className="text-sm font-medium text-[#8B4513] dark:text-[#D4A017] uppercase tracking-wider">
                      Vendor Portal
                    </p>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-[#2C1810] dark:text-[#F5E6D3] mb-4">
                  Grow Your Business
                  <br />
                  with Nile Flow
                </h2>
                <p className="text-lg text-[#8B4513]/70 dark:text-[#D4A017]/70">
                  Access your dashboard, manage orders, and track your business
                  performance.
                </p>
              </div>

              {/* Vendor Stats */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-1">
                      35% Average Growth
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      Our vendors experience significant monthly growth
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#3498DB] to-[#2980B9] flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-1">
                      24/7 Vendor Support
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      Dedicated support team for all vendor needs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-1">
                      Secure Transactions
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      Bank-level security for all your transactions
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="p-6 rounded-2xl border border-[#E8D6B5] dark:border-[#3A3A3A] bg-white/50 dark:bg-[#2A2A2A]/50 backdrop-blur-sm">
                <h4 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-3">
                  💡 Quick Tips
                </h4>
                <ul className="space-y-2 text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Check your daily performance metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    Update inventory regularly for best sales
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    Expand to new regions with our shipping network
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Mobile Header */}
              <div className="lg:hidden mb-8">
                <div className="flex items-center justify-between mb-6">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#8B4513] dark:text-[#D4A017]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#D4A017] to-[#8B6914] flex items-center justify-center">
                      <Store className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-[#2C1810] dark:text-[#F5E6D3]">
                      Nile Mart Vendor
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#2C1810] dark:text-[#F5E6D3] mb-2">
                  Welcome Back
                </h2>
                <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                  Sign in to manage your vendor account
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#E74C3C]/10 to-[#C0392B]/10 border border-[#E74C3C]/30 text-[#E74C3C] text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Container */}
                <div className="bg-gradient-to-br from-[#FAF7F2] to-white dark:from-[#1A1A1A] dark:to-[#2A2A2A] rounded-2xl border border-[#E8D6B5]/30 dark:border-[#3A3A3A] p-6 md:p-8 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#2C1810] dark:text-[#F5E6D3]">
                      Vendor Sign In
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70 mt-1">
                      Enter your credentials to access your dashboard
                    </p>
                  </div>

                  {/* Email */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFormErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          formErrors.email
                            ? "border-red-500"
                            : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                        } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                        placeholder="vendor@example.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setFormErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                          formErrors.password
                            ? "border-red-500"
                            : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                        } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#E8D6B5] text-[#D4A017] focus:ring-[#D4A017]"
                      />
                      <span className="text-sm text-[#2C1810] dark:text-[#F5E6D3]">
                        Remember me
                      </span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white font-semibold hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        Sign In to Dashboard
                      </>
                    )}
                  </button>
                </div>

                {/* Already have account */}
                <div className="text-center">
                  <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                    Don't have a vendor account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] underline transition-colors"
                    >
                      Create one now
                    </Link>
                  </p>
                </div>

                {/* Security Note */}
                <div className="p-4 rounded-xl border border-[#E8D6B5] dark:border-[#3A3A3A] bg-gradient-to-r from-[#E8D6B5]/10 to-[#D4A017]/5 dark:from-[#3A3A3A]/30 dark:to-[#2A2A2A]/50 text-center">
                  <p className="text-xs text-[#8B4513]/70 dark:text-[#D4A017]/70">
                    🔒 Your vendor account is protected with enterprise security
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
