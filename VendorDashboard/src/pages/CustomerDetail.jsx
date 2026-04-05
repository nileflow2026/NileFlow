/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  Star,
  Crown,
  TrendingUp,
  Package,
  CreditCard,
  MapPin,
  Clock,
  User,
  Award,
  RefreshCw,
  ExternalLink,
  BarChart3,
  TrendingDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import vendorAxiosClient from "../../services/api/vendorAxiosClient";

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await vendorAxiosClient.get(
        `/api/admin/customers/${customerId}`
      );
      if (response.data.success) {
        setCustomer(response.data.customer);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "VIP":
        return "bg-gradient-to-r from-amber-400 to-orange-400 text-white border border-amber-300";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };

  const getLoyaltyLevel = (points) => {
    if (points >= 800)
      return {
        level: "Gold",
        color: "from-amber-400 to-yellow-500",
        icon: Crown,
        bgColor: "bg-gradient-to-r from-amber-400 to-yellow-500",
        textColor: "text-amber-700",
      };
    if (points >= 400)
      return {
        level: "Silver",
        color: "from-gray-400 to-gray-600",
        icon: Star,
        bgColor: "bg-gradient-to-r from-gray-400 to-gray-600",
        textColor: "text-gray-700",
      };
    return {
      level: "Bronze",
      color: "from-amber-700 to-orange-800",
      icon: TrendingUp,
      bgColor: "bg-gradient-to-r from-amber-700 to-orange-800",
      textColor: "text-amber-900",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount === "string" && amount.includes("KES")) {
      return amount;
    }
    return `KES ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const calculateDaysSinceLastOrder = () => {
    if (!customer?.lastOrderDate) return "N/A";
    const lastOrder = new Date(customer.lastOrderDate);
    const now = new Date();
    const diffTime = Math.abs(now - lastOrder);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-800">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            Customer Not Found
          </h2>
          <p className="text-amber-600 mb-6">
            The customer you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/admin/customers")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const loyalty = getLoyaltyLevel(customer.loyaltyPoints);
  const LoyaltyIcon = loyalty.icon;
  const daysSinceLastOrder = calculateDaysSinceLastOrder();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/customers"
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Customer Details</h1>
                <p className="text-amber-100">
                  View and manage customer information
                </p>
              </div>
            </div>
            <button
              onClick={fetchCustomerDetails}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Customer Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-amber-900">
                      {customer.name}
                    </h2>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        customer.status
                      )}`}
                    >
                      {customer.status === "VIP" && (
                        <Crown className="w-3 h-3 mr-1" />
                      )}
                      {customer.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-amber-600">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{customer.email || "No email"}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                className={`px-6 py-3 ${loyalty.bgColor} text-white rounded-xl`}
              >
                <div className="flex items-center space-x-2">
                  <LoyaltyIcon className="w-5 h-5" />
                  <span className="font-bold">{loyalty.level} Member</span>
                </div>
                <div className="text-center mt-1 text-sm opacity-90">
                  {customer.loyaltyPoints} Loyalty Points
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-amber-200">
            <div className="flex space-x-1 px-6">
              {["overview", "orders", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-all relative ${
                    activeTab === tab
                      ? "text-amber-900 font-bold"
                      : "text-amber-600 hover:text-amber-800"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-900">
                        {customer.orders}
                      </div>
                      <div className="text-amber-600 font-medium">
                        Total Orders
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-900">
                        {customer.totalSpent}
                      </div>
                      <div className="text-amber-600 font-medium">
                        Total Spent
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-900">
                        {customer.averageOrderValue}
                      </div>
                      <div className="text-amber-600 font-medium">
                        Avg. Order Value
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <h3 className="text-lg font-bold text-amber-900">
                    Recent Orders
                  </h3>
                </div>
                <div className="divide-y divide-amber-100">
                  {customer.orderHistory?.slice(0, 5).map((order, index) => (
                    <div
                      key={index}
                      className="px-6 py-4 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-amber-900">
                            {order.orderId}
                          </div>
                          <div className="text-sm text-amber-600">
                            {formatDate(order.date)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-amber-900">
                              {order.amount}
                            </div>
                            <div className="text-sm text-amber-600">
                              {order.items} items
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              order.status === "completed" ||
                              order.status === "paid"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {order.status === "completed" ||
                            order.status === "paid" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!customer.orderHistory ||
                    customer.orderHistory.length === 0) && (
                    <div className="px-6 py-8 text-center">
                      <ShoppingBag className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                      <p className="text-amber-600">
                        No order history available
                      </p>
                    </div>
                  )}
                </div>
                {customer.orderHistory?.length > 5 && (
                  <div className="px-6 py-4 border-t border-amber-200 bg-amber-50">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-amber-600 hover:text-amber-800 font-medium flex items-center space-x-1"
                    >
                      <span>
                        View all {customer.orderHistory.length} orders
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Favorite Products */}
              {customer.favoriteProducts?.length > 0 && (
                <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h3 className="text-lg font-bold text-amber-900">
                      Favorite Products
                    </h3>
                  </div>
                  <div className="divide-y divide-amber-100">
                    {customer.favoriteProducts.map((product, index) => (
                      <div
                        key={index}
                        className="px-6 py-4 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-amber-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-amber-600">
                                Product ID: {product.productId}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-900">
                              {product.quantity} purchases
                            </div>
                            <div className="text-sm text-amber-600">
                              KES {product.totalSpent.toFixed(2)} spent
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Customer Information */}
            <div className="space-y-6">
              {/* Customer Information Card */}
              <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <h3 className="text-lg font-bold text-amber-900">
                    Customer Information
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-sm text-amber-600 font-medium mb-1">
                      Customer ID
                    </div>
                    <div className="font-mono text-amber-900 bg-amber-50 px-3 py-2 rounded-lg">
                      {customer.id}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-amber-600 font-medium mb-1">
                      Join Date
                    </div>
                    <div className="flex items-center text-amber-900">
                      <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                      {formatDate(customer.joinDate)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-amber-600 font-medium mb-1">
                      Last Order
                    </div>
                    <div className="flex items-center text-amber-900">
                      <Clock className="w-4 h-4 mr-2 text-amber-500" />
                      {customer.lastOrderDate
                        ? formatDate(customer.lastOrderDate)
                        : "No orders yet"}
                    </div>
                    {customer.lastOrderDate && (
                      <div className="text-xs text-amber-500 mt-1">
                        {daysSinceLastOrder === "N/A"
                          ? "N/A"
                          : `${daysSinceLastOrder} days ago`}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-amber-600 font-medium mb-1">
                      Loyalty Status
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${loyalty.color} rounded-lg flex items-center justify-center mr-3`}
                        >
                          <LoyaltyIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-amber-900">
                            {loyalty.level}
                          </div>
                          <div className="text-xs text-amber-600">
                            {customer.loyaltyPoints} points
                          </div>
                        </div>
                      </div>
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Status */}
              <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                  <h3 className="text-lg font-bold text-amber-900">
                    Activity Status
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            customer.status === "Active"
                              ? "bg-green-500"
                              : customer.status === "VIP"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <span className="text-amber-900 font-medium">
                          Customer Status
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          customer.status === "VIP"
                            ? "text-amber-600"
                            : "text-amber-900"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-amber-900 font-medium">
                        Purchase Frequency
                      </span>
                      <span className="text-amber-600 font-medium">
                        {customer.orders > 10
                          ? "Frequent"
                          : customer.orders > 3
                          ? "Regular"
                          : "Occasional"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-amber-900 font-medium">
                        Average Order Value
                      </span>
                      <span className="text-amber-600 font-bold">
                        {customer.averageOrderValue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-amber-900 font-medium">
                        Customer Lifetime Value
                      </span>
                      <span className="text-amber-600 font-bold">
                        {customer.totalSpent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-white text-amber-700 px-4 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                  <button className="w-full bg-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Create Discount</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="w-full bg-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "orders" ? (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-900">
                  Order History
                </h3>
                <div className="text-amber-600 font-medium">
                  {customer.orderHistory?.length || 0} total orders
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {customer.orderHistory?.map((order, index) => (
                    <tr
                      key={index}
                      className="hover:bg-amber-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-amber-900">
                          {order.orderId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-amber-700">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-amber-400 mr-2" />
                          <span className="text-amber-900">
                            {order.items} items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-900">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === "completed" ||
                            order.status === "paid"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : order.status === "pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {order.status === "completed" ||
                          order.status === "paid" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : order.status === "pending" ? (
                            <Clock className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-amber-600 hover:text-amber-800 font-medium flex items-center space-x-1">
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!customer.orderHistory ||
                    customer.orderHistory.length === 0) && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <ShoppingBag className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                        <p className="text-amber-600 text-lg mb-2">
                          No orders found
                        </p>
                        <p className="text-amber-500">
                          This customer hasn't placed any orders yet.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-lg font-bold text-amber-900">
                Customer Analytics
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
                  <div className="text-3xl font-bold mb-2">
                    {customer.orders}
                  </div>
                  <div className="text-blue-100">Total Orders</div>
                  <BarChart3 className="w-8 h-8 mt-4 opacity-50" />
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                  <div className="text-3xl font-bold mb-2">
                    {customer.totalSpent}
                  </div>
                  <div className="text-green-100">Lifetime Value</div>
                  <TrendingUp className="w-8 h-8 mt-4 opacity-50" />
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
                  <div className="text-3xl font-bold mb-2">
                    {customer.averageOrderValue}
                  </div>
                  <div className="text-purple-100">Avg. Order Value</div>
                  <DollarSign className="w-8 h-8 mt-4 opacity-50" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h4 className="font-bold text-amber-900 mb-4">
                  Customer Insights
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-700 font-medium">
                        Order Frequency
                      </span>
                      <span className="text-amber-900 font-bold">
                        {customer.orders > 10
                          ? "High"
                          : customer.orders > 3
                          ? "Medium"
                          : "Low"}
                      </span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (customer.orders / 20) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-700 font-medium">
                        Loyalty Level
                      </span>
                      <span className="text-amber-900 font-bold">
                        {loyalty.level}
                      </span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${loyalty.bgColor}`}
                        style={{
                          width: `${Math.min(
                            (customer.loyaltyPoints / 1000) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-700 font-medium">
                        Customer Status
                      </span>
                      <span className="text-amber-900 font-bold">
                        {customer.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {["Inactive", "Active", "VIP"].map((status) => (
                        <div
                          key={status}
                          className={`flex-1 h-2 rounded-full ${
                            customer.status === status
                              ? status === "VIP"
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : status === "Active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                              : "bg-amber-200"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
