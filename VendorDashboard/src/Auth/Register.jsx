/* eslint-disable no-unused-vars */
import { use, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Store,
  Briefcase,
  MapPin,
  Award,
  Shield,
  CheckCircle,
  ArrowLeft,
  Users,
  TrendingUp,
  Package,
  Globe,
  Star,
  FileText,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/VendorAuthContext";
const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    storeName: "",
    storeDescription: "",
    category: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    strength: "weak",
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
  });

  const navigate = useNavigate();

  // Categories for vendor stores
  const categories = [
    "Fashion & Clothing",
    "Electronics & Gadgets",
    "Home & Living",
    "Beauty & Cosmetics",
    "Food & Groceries",
    "Arts & Crafts",
    "Health & Wellness",
    "Sports & Outdoors",
    "Books & Education",
    "Automotive",
    "Games & Toys",
    "Others",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Update password strength if password field changes
    if (name === "password") {
      updatePasswordStrength(value);
    }
  };

  // Password strength checker
  const updatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const metCount = Object.values(requirements).filter(Boolean).length;
    const strength =
      metCount >= 4 ? "strong" : metCount >= 2 ? "medium" : "weak";

    setPasswordStrength({
      score: metCount,
      strength,
      requirements,
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.storeName.trim()) {
      errors.storeName = "Store name is required";
    }

    if (!formData.storeDescription.trim()) {
      errors.storeDescription = "Store description is required";
    } else if (formData.storeDescription.length < 20) {
      errors.storeDescription = "Description must be at least 20 characters";
    }

    if (!formData.category) {
      errors.category = "Please select a category";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (formData.phone && !/^[+]?[\d\s-]+$/.test(formData.phone)) {
      errors.phone = "Enter a valid phone number";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (passwordStrength.score < 3) {
      errors.password = "Password is too weak";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!termsAccepted) {
      errors.terms = "You must accept the terms and conditions";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // In Register.jsx - Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Pass all form data including category, storeDescription, and location
      const result = await register(
        formData.name,
        formData.storeName,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.category,
        formData.storeDescription,
        formData.location,
      );

      if (result.success) {
        toast.success("Vendor account created successfully!", {
          description: "Welcome to Nile Mart Vendor Platform",
          duration: 5000,
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        });

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(result.error);
        toast.error("Registration failed", {
          description: result.error || "Please try again",
        });
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
      toast.error("Registration failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        toast.success("Vendor account created successfully!", {
          description: "Welcome to Nile Mart Vendor Platform",
          duration: 5000,
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        });

        // Navigate to login after successful registration
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } else {
        setError(result.error);
        toast.error("Registration failed", {
          description: result.error || "Please try again",
        });
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
      toast.error("Registration failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };
 */
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
          {/* Left Column - Branding & Vendor Benefits */}
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
                      Vendor Platform
                    </p>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-[#2C1810] dark:text-[#F5E6D3] mb-4">
                  Sell Your Products to
                  <br />
                  Millions of Customers
                </h2>
                <p className="text-lg text-[#8B4513]/70 dark:text-[#D4A017]/70">
                  Join Africa's fastest growing marketplace and reach customers
                  across the continent.
                </p>
              </div>

              {/* Vendor Benefits */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-1">
                      5M+ Active Buyers
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      Access to millions of verified customers across Africa
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#3498DB] to-[#2980B9] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-1">
                      Grow Your Business
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      Advanced analytics and marketing tools to boost sales
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#9B59B6] to-[#8E44AD] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3] mb-1">
                      Secure Payments
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      Guaranteed payments with fraud protection
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Story */}
              <div className="p-6 rounded-2xl border border-[#E8D6B5] dark:border-[#3A3A3A] bg-white/50 dark:bg-[#2A2A2A]/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D4A017] to-[#B8860B] flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C1810] dark:text-[#F5E6D3]">
                      Top Vendor Story
                    </p>
                    <p className="text-xs text-[#8B4513]/70 dark:text-[#D4A017]/70">
                      500% growth in 6 months
                    </p>
                  </div>
                </div>
                <p className="text-sm italic text-[#2C1810] dark:text-[#F5E6D3]">
                  "Nile Mart helped us expand from a small shop in Accra to
                  serving customers across West Africa."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-2xl">
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
                  Start Selling Today
                </h2>
                <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                  Create your vendor account and join Africa's premier
                  marketplace
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#E74C3C]/10 to-[#C0392B]/10 border border-[#E74C3C]/30 text-[#E74C3C] text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Container */}
                <div className="bg-gradient-to-br from-[#FAF7F2] to-white dark:from-[#1A1A1A] dark:to-[#2A2A2A] rounded-2xl border border-[#E8D6B5]/30 dark:border-[#3A3A3A] p-6 md:p-8 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#2C1810] dark:text-[#F5E6D3]">
                      Vendor Registration
                    </h3>
                    <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70 mt-1">
                      Fill in your business details to get started
                    </p>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            formErrors.name
                              ? "border-red-500"
                              : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                          } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                          placeholder="Your full name"
                        />
                      </div>
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            formErrors.phone
                              ? "border-red-500"
                              : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                          } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                          placeholder="+234 800 000 0000"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Store Information */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-[#D4A017]" />
                      <h4 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3]">
                        Store Information
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                          Store Name *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                            <Store className="w-4 h-4" />
                          </div>
                          <input
                            id="storeName"
                            name="storeName"
                            type="text"
                            required
                            value={formData.storeName}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                              formErrors.storeName
                                ? "border-red-500"
                                : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                            } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                            placeholder="Your store name"
                          />
                        </div>
                        {formErrors.storeName && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors.storeName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                          Store Description *
                        </label>
                        <textarea
                          id="storeDescription"
                          name="storeDescription"
                          required
                          value={formData.storeDescription}
                          onChange={handleChange}
                          rows="3"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            formErrors.storeDescription
                              ? "border-red-500"
                              : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                          } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                          placeholder="Describe your store and products..."
                        />
                        {formErrors.storeDescription && (
                          <p className="mt-1 text-xs text-red-500">
                            {formErrors.storeDescription}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-[#8B4513]/70 dark:text-[#D4A017]/70">
                          Minimum 20 characters. Tell customers what makes your
                          store special.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                            Business Category *
                          </label>
                          <select
                            id="category"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${
                              formErrors.category
                                ? "border-red-500"
                                : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                            } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                          >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {formErrors.category && (
                            <p className="mt-1 text-xs text-red-500">
                              {formErrors.category}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                            Business Location
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <input
                              id="location"
                              name="location"
                              type="text"
                              value={formData.location}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8D6B5] dark:border-[#3A3A3A] bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent"
                              placeholder="City, Country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-[#D4A017]" />
                      <h4 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3]">
                        Contact Information
                      </h4>
                    </div>

                    <div>
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
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                            formErrors.email
                              ? "border-red-500"
                              : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                          } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                          placeholder="business@example.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="w-5 h-5 text-[#D4A017]" />
                      <h4 className="font-semibold text-[#2C1810] dark:text-[#F5E6D3]">
                        Account Security
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
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
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                              formErrors.password
                                ? "border-red-500"
                                : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                            } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                            placeholder="Create a strong password"
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#8B4513] dark:text-[#D4A017] mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017]">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                              formErrors.confirmPassword
                                ? "border-red-500"
                                : "border-[#E8D6B5] dark:border-[#3A3A3A]"
                            } bg-white dark:bg-[#2A2A2A] text-[#2C1810] dark:text-[#F5E6D3] placeholder-[#8B4513]/50 dark:placeholder-[#D4A017]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-transparent`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] dark:text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-4 p-4 rounded-xl border border-[#E8D6B5] dark:border-[#3A3A3A] bg-white/50 dark:bg-[#2A2A2A]/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#2C1810] dark:text-[#F5E6D3]">
                            Password Strength:
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              passwordStrength.strength === "strong"
                                ? "text-[#27AE60]"
                                : passwordStrength.strength === "medium"
                                  ? "text-[#F39C12]"
                                  : "text-[#E74C3C]"
                            }`}
                          >
                            {passwordStrength.strength.toUpperCase()}
                          </span>
                        </div>
                        <div className="h-2 bg-[#E8D6B5]/20 dark:bg-[#3A3A3A] rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.strength === "strong"
                                ? "w-full bg-[#27AE60]"
                                : passwordStrength.strength === "medium"
                                  ? "w-2/3 bg-[#F39C12]"
                                  : "w-1/3 bg-[#E74C3C]"
                            }`}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {Object.entries(passwordStrength.requirements).map(
                            ([key, met]) => (
                              <div
                                key={key}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    met ? "bg-[#27AE60]" : "bg-gray-300"
                                  }`}
                                ></div>
                                <span
                                  className={`text-xs ${
                                    met
                                      ? "text-[#27AE60] font-medium"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {formErrors.password && (
                      <p className="mt-2 text-xs text-red-500">
                        {formErrors.password}
                      </p>
                    )}
                    {formErrors.confirmPassword && (
                      <p className="mt-2 text-xs text-red-500">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          setFormErrors((prev) => ({ ...prev, terms: "" }));
                        }}
                        className="mt-1 rounded border-[#E8D6B5] text-[#D4A017] focus:ring-[#D4A017]"
                      />
                      <span className="text-sm text-[#2C1810] dark:text-[#F5E6D3]">
                        I agree to the{" "}
                        <Link
                          to="/vendor-terms"
                          className="text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] underline"
                        >
                          Vendor Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] underline"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {formErrors.terms && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.terms}
                      </p>
                    )}
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
                        Creating Vendor Account...
                      </>
                    ) : (
                      <>
                        <Store className="w-5 h-5" />
                        Create Vendor Account
                      </>
                    )}
                  </button>
                </div>

                {/* Already have account */}
                <div className="text-center">
                  <p className="text-sm text-[#8B4513]/70 dark:text-[#D4A017]/70">
                    Already have a vendor account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[#D4A017] hover:text-[#B8860B] dark:hover:text-[#FFD700] underline transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Vendor Support Note */}
                <div className="p-4 rounded-xl border border-[#E8D6B5] dark:border-[#3A3A3A] bg-gradient-to-r from-[#E8D6B5]/10 to-[#D4A017]/5 dark:from-[#3A3A3A]/30 dark:to-[#2A2A2A]/50 text-center">
                  <p className="text-xs text-[#8B4513]/70 dark:text-[#D4A017]/70">
                    🛡️ Vendor support available 24/7. Need help? Contact our
                    vendor success team.
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

export default Register;
