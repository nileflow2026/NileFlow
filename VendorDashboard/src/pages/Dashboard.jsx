/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import vendorAxiosClient from "../../services/api/vendorAxiosClient";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: "KES 0",
    monthlyRevenue: "KES 0",
    pendingPayment: "KES 0",
    totalOrders: "0",
    totalProducts: "0",
    totalCustomers: "0",
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // African-inspired color palette
  const colors = {
    primary: {
      orange: "bg-orange-600",
      gold: "bg-yellow-600",
      clay: "bg-red-700",
      green: "bg-green-700",
      brown: "bg-amber-900",
      blue: "bg-blue-600",
    },
    gradient: {
      header: "bg-gradient-to-r from-amber-800 via-orange-600 to-amber-700",
      card: "bg-gradient-to-br from-amber-50 to-orange-50",
      accent: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency values from API response
  const formatStatsForKES = (stats) => {
    if (!stats)
      return {
        totalRevenue: "KES 0",
        monthlyRevenue: "KES 0",
        pendingPayment: "KES 0",
        totalOrders: "0",
        totalProducts: "0",
        totalCustomers: "0",
      };

    return {
      ...stats,
      totalRevenue:
        stats.totalRevenue?.toString().replace(/^\$/, "KES ") || "KES 0",
      monthlyRevenue:
        stats.monthlyRevenue?.toString().replace(/^\$/, "KES ") || "KES 0",
      pendingPayment:
        stats.pendingPayment?.toString().replace(/^\$/, "KES ") || "KES 0",
    };
  };

  // Format recent orders currency
  const formatOrdersForKES = (orders) => {
    if (!orders) return [];
    return orders.map((order) => ({
      ...order,
      amount: order.amount?.toString().replace(/^\$/, "KES ") || order.amount,
    }));
  };

  // Format top products currency
  const formatProductsForKES = (products) => {
    if (!products) return [];
    return products.map((product) => ({
      ...product,
      revenue:
        product.revenue?.toString().replace(/^\$/, "KES ") || product.revenue,
    }));
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, paymentsRes] = await Promise.all([
        vendorAxiosClient.get("/api/vendor/dashboard"),
        vendorAxiosClient.get("/api/vendor/payments"),
      ]);

      if (dashboardRes.data.success) {
        const formattedStats = formatStatsForKES(dashboardRes.data.data.stats);
        const formattedOrders = formatOrdersForKES(
          dashboardRes.data.data.recentOrders
        );
        const formattedProducts = formatProductsForKES(
          dashboardRes.data.data.topProducts
        );

        setStats(formattedStats);
        setRecentOrders(formattedOrders);
        setTopProducts(formattedProducts);
      }

      if (paymentsRes.data.success) {
        setPaymentHistory(paymentsRes.data.data.paymentHistory || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      color: "gold",
      shape: "rounded-lg",
    },
    {
      title: "Monthly Revenue",
      value: stats.monthlyRevenue,
      icon: TrendingUp,
      color: "green",
      shape: "rounded-lg",
    },
    {
      title: "Pending Payment",
      value: stats.pendingPayment,
      icon: CreditCard,
      color: "blue",
      shape: "rounded-lg",
      description: "End of month payout",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "clay",
      shape: "rounded-lg rotate-45",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "green",
      shape: "rounded-full",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "orange",
      shape: "rounded-lg",
    },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200";
      case "processing":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case "gold":
        return "text-yellow-600";
      case "clay":
        return "text-red-700";
      case "green":
        return "text-green-700";
      case "orange":
        return "text-orange-600";
      case "blue":
        return "text-blue-600";
      case "brown":
        return "text-amber-900";
      default:
        return "text-gray-600";
    }
  };

  const getIconBg = (color) => {
    switch (color) {
      case "gold":
        return "bg-yellow-100";
      case "clay":
        return "bg-red-100";
      case "green":
        return "bg-green-100";
      case "orange":
        return "bg-orange-100";
      case "blue":
        return "bg-blue-100";
      case "brown":
        return "bg-amber-100";
      default:
        return "bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-800">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* African Pattern Header Strip */}
      <div className="h-2 bg-gradient-to-r from-amber-800 via-orange-600 to-amber-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="flex h-full">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-8 border-r border-amber-900"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              Nile Flow Vendors Hub
            </h1>
            <div className="text-amber-700 font-medium">
              Real-time Dashboard • Payments processed at month end
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-lg hover:from-amber-700 hover:to-orange-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              V
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white"
                : "bg-white text-amber-700 hover:bg-amber-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "payments"
                ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white"
                : "bg-white text-amber-700 hover:bg-amber-50"
            }`}
          >
            Payment History
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {dashboardStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-100 to-transparent opacity-50 rounded-full -mr-6 -mt-6"></div>

                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-sm font-medium text-amber-700 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-amber-900 mb-1">
                          {stat.value}
                        </p>
                        {stat.description && (
                          <p className="text-xs text-amber-600">
                            {stat.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={`p-3 ${stat.shape} ${getIconBg(
                          stat.color
                        )} transform transition-transform hover:scale-110`}
                      >
                        <Icon
                          className={`w-6 h-6 ${getIconColor(stat.color)}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h3 className="text-lg font-bold text-amber-900">
                      Recent Orders
                    </h3>
                  </div>
                  <div className="overflow-hidden">
                    {recentOrders.length > 0 ? (
                      <div className="overflow-x-auto w-full">
                        <table className="min-w-full divide-y divide-amber-200">
                          <thead className="bg-amber-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                                Order ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                                Customer
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-amber-100">
                            {recentOrders.map((order, index) => (
                              <tr
                                key={index}
                                className={`hover:bg-amber-50 transition-colors ${
                                  index % 2 === 0 ? "bg-amber-25" : "bg-white"
                                }`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                                  {order.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                                  {order.customer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                                  {order.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                                  {order.amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <div className="text-center py-12">
                          <ShoppingCart className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                          <p className="text-amber-600">
                            No recent orders found
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div>
                <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h3 className="text-lg font-bold text-amber-900">
                      Top Products
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <div key={index} className="group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700 transition-colors truncate">
                              {product.name}
                            </span>
                            <span className="text-sm text-amber-600 font-medium">
                              {product.sales} sales
                            </span>
                          </div>
                          <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                index === 0
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                  : index === 1
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                  : index === 2
                                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                                  : "bg-gradient-to-r from-yellow-500 to-amber-600"
                              }`}
                              style={{
                                width: `${
                                  (product.sales /
                                    (topProducts[0]?.sales || 1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-amber-600 mt-1 font-medium">
                            {product.revenue} revenue
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                        <p className="text-amber-600">
                          No products data available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Payments Tab */
          <div className="overflow-x-auto w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <h3 className="text-lg font-bold text-amber-900">
                  Payment History
                </h3>
                <p className="text-sm text-amber-600 mt-1">
                  Payments are processed at the end of each month
                </p>
              </div>
              <div className="p-6">
                {paymentHistory.length > 0 ? (
                  <table className="min-w-full divide-y divide-amber-200">
                    <thead className="bg-amber-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                          Payment Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-amber-100">
                      {paymentHistory.map((payment, index) => (
                        <tr key={index} className="hover:bg-amber-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                            {payment.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                            {payment.orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                            {payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status === "paid" ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                            {payment.status === "paid"
                              ? `Paid on ${new Date().toLocaleDateString()}`
                              : "End of month"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-600">
                      No payment history available
                    </p>
                  </div>
                )}

                {/* Payment Info Box */}
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-bold text-amber-900 mb-3">
                    💰 Payment Information
                  </h4>
                  <ul className="space-y-2 text-sm text-amber-700">
                    <li className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-amber-600" />
                      <span>
                        Payments are processed on the{" "}
                        <strong>last day of each month</strong>
                      </span>
                    </li>
                    <li className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-amber-600" />
                      <span>
                        Minimum payout amount: <strong>KES 50</strong>
                      </span>
                    </li>
                    <li className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
                      <span>
                        Payments are sent via <strong>bank transfer</strong> or{" "}
                        <strong>mobile money</strong>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
/* import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react";

const Dashboard = () => {
  // African-inspired color palette
  const colors = {
    primary: {
      orange: "bg-orange-600",
      gold: "bg-yellow-600",
      clay: "bg-red-700",
      green: "bg-green-700",
      brown: "bg-amber-900",
    },
    gradient: {
      header: "bg-gradient-to-r from-amber-800 via-orange-600 to-amber-700",
      card: "bg-gradient-to-br from-amber-50 to-orange-50",
      accent: "bg-gradient-to-r from-amber-500 to-orange-500",
    },
  };

  const stats = [
    {
      title: "Total Revenue",
      value: "KES 12,458",
      change: "+12%",
      icon: DollarSign,
      color: "gold",
      shape: "rounded-lg",
    },
    {
      title: "Total Orders",
      value: "324",
      change: "+8%",
      icon: ShoppingCart,
      color: "clay",
      shape: "rounded-lg rotate-45",
    },
    {
      title: "Products",
      value: "156",
      change: "+5%",
      icon: Package,
      color: "green",
      shape: "rounded-full",
    },
    {
      title: "Customers",
      value: "2,847",
      change: "+15%",
      icon: Users,
      color: "orange",
      shape: "rounded-lg",
    },
  ];

  const recentOrders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      date: "2024-01-15",
      amount: "KES 245",
      status: "Completed",
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      date: "2024-01-15",
      amount: "KES 189",
      status: "Processing",
    },
    {
      id: "#ORD-003",
      customer: "Mike Johnson",
      date: "2024-01-14",
      amount: "KES 324",
      status: "Completed",
    },
    {
      id: "#ORD-004",
      customer: "Sarah Wilson",
      date: "2024-01-14",
      amount: "KES 98",
      status: "Pending",
    },
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 45, revenue: "KES 2,250" },
    { name: "Smart Watch", sales: 32, revenue: "KES 1,920" },
    { name: "Laptop Backpack", sales: 28, revenue: "KES 840" },
    { name: "Phone Case", sales: 51, revenue: "KES 765" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Processing":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Pending":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case "gold":
        return "text-yellow-600";
      case "clay":
        return "text-red-700";
      case "green":
        return "text-green-700";
      case "orange":
        return "text-orange-600";
      case "brown":
        return "text-amber-900";
      default:
        return "text-gray-600";
    }
  };

  const getIconBg = (color) => {
    switch (color) {
      case "gold":
        return "bg-yellow-100";
      case "clay":
        return "bg-red-100";
      case "green":
        return "bg-green-100";
      case "orange":
        return "bg-orange-100";
      case "brown":
        return "bg-amber-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">

      <div className="h-2 bg-gradient-to-r from-amber-800 via-orange-600 to-amber-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="flex h-full">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-8 border-r border-amber-900"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
 
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900 mb-2">
              Nile Flow Vendors Hub
            </h1>
            <div className="text-amber-700 font-medium">
              Welcome back, Vendor!
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            NF
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
  
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-100 to-transparent opacity-50 rounded-full -mr-6 -mt-6"></div>

                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-amber-900 mb-1">
                      {stat.value}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        stat.change.includes("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change} from last month
                    </p>
                  </div>
                  <div
                    className={`p-3 ${stat.shape} ${getIconBg(
                      stat.color
                    )} transform transition-transform hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${getIconColor(stat.color)}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <h3 className="text-lg font-bold text-amber-900">
                  Recent Orders
                </h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-amber-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-100">
                    {recentOrders.map((order, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-amber-50 transition-colors ${
                          index % 2 === 0 ? "bg-amber-25" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                          {order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

         
          <div>
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <h3 className="text-lg font-bold text-amber-900">
                  Top Products
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {topProducts.map((product, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </span>
                      <span className="text-sm text-amber-600 font-medium">
                        {product.sales} sales
                      </span>
                    </div>
                    <div className="w-full bg-amber-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          index === 0
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : index === 1
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : index === 2
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : "bg-gradient-to-r from-yellow-500 to-amber-600"
                        }`}
                        style={{ width: `${(product.sales / 51) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-amber-600 mt-1 font-medium">
                      {product.revenue} revenue
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
 */
