/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  Filter,
  Package,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
} from "lucide-react";
import vendorAxiosClient from "../../services/api/vendorAxiosClient";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    shipped: 0,
  });

  // Fetch orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await vendorAxiosClient.get("/api/vendor/orders");
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
        calculateStats(response.data.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersList) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter((o) => o.status?.toLowerCase() === "pending")
        .length,
      processing: ordersList.filter(
        (o) => o.status?.toLowerCase() === "processing"
      ).length,
      completed: ordersList.filter(
        (o) => o.status?.toLowerCase() === "completed"
      ).length,
      shipped: ordersList.filter((o) => o.status?.toLowerCase() === "shipped")
        .length,
    };
    setStats(stats);
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === "all" ||
        order.status?.toLowerCase() === statusFilter.toLowerCase()) &&
      (order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.username?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800 border border-green-200";
      case "processing":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "processing":
        return <Package className="w-3 h-3 mr-1" />;
      case "shipped":
        return <Truck className="w-3 h-3 mr-1" />;
      case "pending":
        return <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />;
      case "cancelled":
        return <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full mr-1" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!amount) return "KES 0.00";
    const numAmount = parseFloat(amount);
    return `KES ${numAmount.toFixed(2)}`;
  };

  // Get items count from order
  const getItemsCount = (order) => {
    try {
      if (order.items) {
        const items =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;
        return Array.isArray(items) ? items.length : 0;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  };

  // Handle order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await vendorAxiosClient.put(
        `/api/vendor/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );

        // Recalculate stats
        fetchOrders();

        alert(`Order ${orderId} status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  // Export orders to CSV
  const exportToCSV = () => {
    const csvContent = [
      [
        "Order ID",
        "Customer",
        "Date",
        "Items",
        "Amount",
        "Status",
        "Payment Method",
      ],
      ...filteredOrders.map((order) => [
        order.orderId || "N/A",
        order.username || order.customerEmail || "Unknown",
        formatDate(order.createdAt),
        getItemsCount(order),
        formatAmount(order.amount),
        order.status || "Unknown",
        order.paymentMethod || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-800">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Orders</h1>
          <p className="text-amber-600 font-medium">
            Manage and track customer orders • {stats.total} total orders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-xl hover:bg-amber-50 transition-all duration-300 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Total Orders</p>
              <p className="text-2xl font-bold text-amber-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Pending</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.pending}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Processing</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.processing}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Shipped</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.shipped}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Completed</p>
              <p className="text-2xl font-bold text-amber-900">
                {stats.completed}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium text-amber-900 min-w-40"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order.orderId || index}
                    className={`hover:bg-amber-50 transition-all duration-300 group ${
                      index % 2 === 0 ? "bg-amber-25" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-sm">
                            #
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-900 group-hover:text-amber-700">
                            {order.orderId || `ORD-${index}`}
                          </div>
                          <div className="text-xs text-amber-500">
                            {order.paymentMethod || "COD"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-amber-900">
                          {order.username || "Customer"}
                        </div>
                        <div className="text-xs text-amber-600 truncate max-w-[150px]">
                          {order.customerEmail || "No email"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-amber-700 font-bold text-sm">
                            {getItemsCount(order)}
                          </span>
                        </div>
                        <span className="text-sm text-amber-600">
                          item{getItemsCount(order) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-sm font-bold text-amber-900">
                          {formatAmount(order.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.paymentStatus === "succeeded"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            alert(`View details for ${order.orderId}`)
                          }
                          className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-300 group/action"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                        </button>
                        {order.status === "processing" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.orderId, "shipped")
                            }
                            className="p-2 text-amber-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 group/action"
                            title="Mark as Shipped"
                          >
                            <Truck className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.orderId, "completed")
                            }
                            className="p-2 text-amber-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 group/action"
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-16 h-16 text-amber-300 mb-4" />
                      <p className="text-amber-600 font-medium">
                        No orders found
                      </p>
                      <p className="text-amber-500 text-sm mt-1">
                        {searchTerm
                          ? "Try a different search term"
                          : "No orders have been placed yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-amber-200 bg-amber-50/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-amber-600 font-medium">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            {filteredOrders.length > 0 && (
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors font-medium">
                  Previous
                </button>
                <button className="px-4 py-2 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors font-medium">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Order Analytics</h3>
          <p className="text-amber-100 text-sm mb-4">
            View detailed analytics and reports for your orders
          </p>
          <button className="bg-white text-amber-700 px-4 py-2 rounded-xl font-semibold hover:bg-amber-50 transition-colors">
            View Analytics
          </button>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Bulk Actions</h3>
          <p className="text-amber-100 text-sm mb-4">
            Update multiple orders at once with bulk actions
          </p>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-400 transition-colors">
            Bulk Update
          </button>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Need Support?</h3>
          <p className="text-orange-100 text-sm mb-4">
            Get help with order management and shipping issues
          </p>
          <button className="bg-white text-orange-700 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders;

/* import React, { useState } from "react";
import { Search, Eye, Truck, CheckCircle, Filter, Package } from "lucide-react";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "#ORD-001",
      customer: "John Doe",
      date: "2024-01-15",
      amount: "KES 245",
      status: "Completed",
      items: 2,
    },
    {
      id: "#ORD-002",
      customer: "Jane Smith",
      date: "2024-01-15",
      amount: "KES 189",
      status: "Processing",
      items: 1,
    },
    {
      id: "#ORD-003",
      customer: "Mike Johnson",
      date: "2024-01-14",
      amount: "KES 324",
      status: "Shipped",
      items: 3,
    },
    {
      id: "#ORD-004",
      customer: "Sarah Wilson",
      date: "2024-01-14",
      amount: "KES 98",
      status: "Pending",
      items: 1,
    },
  ];

  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === "all" || order.status === statusFilter) &&
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Processing":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Pending":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "Processing":
        return <Package className="w-3 h-3 mr-1" />;
      case "Shipped":
        return <Truck className="w-3 h-3 mr-1" />;
      case "Pending":
        return <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />;
      default:
        return <div className="w-2 h-2 bg-amber-500 rounded-full mr-1" />;
    }
  };

  return (
    <div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Orders</h1>
          <p className="text-amber-600 font-medium">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold">
            {orders.length} Orders
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Total Orders</p>
              <p className="text-2xl font-bold text-amber-900">
                {orders.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Pending</p>
              <p className="text-2xl font-bold text-amber-900">
                {orders.filter((o) => o.status === "Pending").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Processing</p>
              <p className="text-2xl font-bold text-amber-900">
                {orders.filter((o) => o.status === "Processing").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Completed</p>
              <p className="text-2xl font-bold text-amber-900">
                {orders.filter((o) => o.status === "Completed").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">

        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium text-amber-900 min-w-40"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-50 transition-all duration-300 flex items-center space-x-2 text-amber-700 font-medium">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </button>
            </div>
          </div>
        </div>


        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100">
              {filteredOrders.map((order, index) => (
                <tr
                  key={index}
                  className={`hover:bg-amber-50 transition-all duration-300 group ${
                    index % 2 === 0 ? "bg-amber-25" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-sm">#</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-amber-900 group-hover:text-amber-700">
                          {order.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-amber-900">
                      {order.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700 font-medium">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-amber-700 font-bold text-sm">
                          {order.items}
                        </span>
                      </div>
                      <span className="text-sm text-amber-600">
                        item{order.items !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-300 group/action">
                        <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                      </button>
                      {order.status === "Processing" && (
                        <button className="p-2 text-amber-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 group/action">
                          <Truck className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                        </button>
                      )}
                      {order.status === "Shipped" && (
                        <button className="p-2 text-amber-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 group/action">
                          <CheckCircle className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        <div className="px-6 py-4 border-t border-amber-200 bg-amber-50/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-amber-600 font-medium">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors font-medium">
                Previous
              </button>
              <button className="px-4 py-2 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors font-medium">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Need Help?</h3>
          <p className="text-amber-100 text-sm mb-4">
            Get support with order management and shipping
          </p>
          <button className="bg-white text-amber-700 px-4 py-2 rounded-xl font-semibold hover:bg-amber-50 transition-colors">
            Contact Support
          </button>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Shipping Guide</h3>
          <p className="text-amber-100 text-sm mb-4">
            Learn about our shipping process and timelines
          </p>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-400 transition-colors">
            View Guide
          </button>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Urgent Orders</h3>
          <p className="text-orange-100 text-sm mb-4">
            Priority processing for time-sensitive orders
          </p>
          <button className="bg-white text-orange-700 px-4 py-2 rounded-xl font-semibold hover:bg-orange-50 transition-colors">
            Priority Processing
          </button>
        </div>
      </div>
    </div>
  );
};

export default Orders; */
