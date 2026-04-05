// src/rider/pages/RiderRegister.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRiderAuth } from "../Context/RiderAuthContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Truck,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const RiderRegister = () => {
  const { register, loading } = useRiderAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Multi-step form

  const vehicleTypes = [
    { value: "motorcycle", label: "Motorcycle" },
    { value: "bicycle", label: "Bicycle" },
    { value: "car", label: "Car" },
    { value: "van", label: "Van" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.vehicleType) {
      newErrors.vehicleType = "Please select a vehicle type";
    }

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      navigate("/rider/dashboard");
    } else {
      setErrors({ submit: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-blue-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Join as a Rider
            </h2>
            <p className="text-gray-400">Start earning by delivering orders</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step > 1 ? <CheckCircle className="w-6 h-6" /> : "1"}
                  </div>
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > 1 ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Personal Info</p>
              </div>
              <div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  2
                </div>
                <p className="text-xs text-gray-400 mt-2">Vehicle Info</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200 text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.name ? "border-red-500" : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-red-400 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.email ? "border-red-500" : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="rider@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.phone ? "border-red-500" : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-red-400 text-sm">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.password ? "border-red-500" : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Information */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Vehicle Type *
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.vehicleType
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
                    >
                      <option value="">Select vehicle type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.vehicleType && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.vehicleType}
                    </p>
                  )}
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Vehicle Registration Number *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.vehicleNumber
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors uppercase`}
                      placeholder="KXX 123A"
                    />
                  </div>
                  {errors.vehicleNumber && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.vehicleNumber}
                    </p>
                  )}
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Driving License Number *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 border ${
                        errors.licenseNumber
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors uppercase`}
                      placeholder="DL12345678"
                    />
                  </div>
                  {errors.licenseNumber && (
                    <p className="mt-1 text-red-400 text-sm">
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">
                    By registering, you agree to our Terms of Service and
                    Privacy Policy. Your vehicle and license will be verified
                    before activation.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Registering..."
                  : step === 1
                  ? "Next"
                  : "Complete Registration"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/rider/login"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderRegister;
