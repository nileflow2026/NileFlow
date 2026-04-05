/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";

import {
  Save,
  User,
  Mail,
  Building,
  MapPin,
  Phone,
  Camera,
  X,
  Upload,
} from "lucide-react";
import { useAuth } from "../../contexts/VendorAuthContext";
import { useRef } from "react";

const AccountSettings = () => {
  const { user, updateProfile, updateProfilePicture, removeProfilePicture } =
    useAuth(); // You'll need to add updateProfile to your AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    storeName: user?.storeName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        storeName: user?.storeName || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        country: user?.country || "",
      });
    }
  }, [user]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Profile updated successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({
          type: "error",
          text: "Please select an image file",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size should be less than 5MB",
        });
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setIsUploadModalOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateProfilePicture(selectedImage);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Profile picture updated successfully!",
        });
        setIsUploadModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile picture",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await removeProfilePicture();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Profile picture removed successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to remove profile picture",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Account Settings</h1>
        <p className="text-amber-600 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-bold text-amber-900">
                Profile Information
              </h2>
              <p className="text-amber-600 text-sm">
                Update your account details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              {/* Store Information */}
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Store Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}

          {/* Profile Picture */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-amber-200 p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              Profile Picture
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <button
                  onClick={handleCameraClick}
                  disabled={isLoading}
                  className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-amber-600 text-center">
                {isLoading
                  ? "Uploading..."
                  : "Click the camera icon to update your profile picture"}
              </p>
              {user?.avatar && (
                <button
                  onClick={handleRemovePicture}
                  disabled={isLoading}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  Remove picture
                </button>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-amber-200 p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-amber-700">Verification Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-700">Store Status</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-700">Member Since</span>
                <span className="text-amber-900 font-medium">
                  {user?.joinDate || "Jan 2024"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-amber-200 p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-300 border border-transparent hover:border-amber-200">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-300 border border-transparent hover:border-amber-200">
                Notification Preferences
              </button>
              <button className="w-full text-left px-4 py-3 text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-300 border border-transparent hover:border-amber-200">
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-amber-200">
              <h3 className="text-xl font-bold text-amber-900">
                Update Profile Picture
              </h3>
              <button
                onClick={closeModal}
                className="text-amber-500 hover:text-amber-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {imagePreview && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  />
                </div>
              )}

              <p className="text-amber-600 text-center mb-6">
                This will replace your current profile picture
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-all duration-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isLoading || !selectedImage}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
