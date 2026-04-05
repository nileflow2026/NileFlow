// src/pages/Customers.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Phone,
  Eye,
  Crown,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import vendorAxiosClient from "../../services/api/vendorAxiosClient";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [insights, setInsights] = useState({
    repeatCustomerRate: "0%",
    averageOrderValue: "KES 0",
    averagePurchaseCycle: "0 days",
    satisfactionScore: "0/5",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const fetchCustomersData = async () => {
    setLoading(true);
    try {
      const [customersRes, insightsRes] = await Promise.all([
        vendorAxiosClient.get("/api/admin/customers"),
        vendorAxiosClient.get("/api/admin/customers/insights"),
      ]);

      if (customersRes.data.success) {
        setCustomers(customersRes.data.customers || []);
        setStats(
          customersRes.data.stats || {
            totalCustomers: 0,
            activeCustomers: 0,
            vipCustomers: 0,
            totalOrders: 0,
            totalRevenue: 0,
          }
        );
      }

      if (insightsRes.data.success) {
        setInsights(
          insightsRes.data.insights || {
            repeatCustomerRate: "0%",
            averageOrderValue: "KES 0",
            averagePurchaseCycle: "0 days",
            satisfactionScore: "0/5",
          }
        );
      }
    } catch (error) {
      console.error("Error fetching customers data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || customer.status === statusFilter)
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

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
      };
    if (points >= 400)
      return {
        level: "Silver",
        color: "from-gray-400 to-gray-600",
        icon: Star,
      };
    return {
      level: "Bronze",
      color: "from-amber-700 to-orange-800",
      icon: TrendingUp,
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-800">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Customers</h1>
          <p className="text-amber-600 font-medium">
            Manage and analyze your customer relationships
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCustomersData}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold">
            {stats.totalCustomers} Customers
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {stats.totalCustomers}
          </div>
          <div className="text-amber-600 font-medium">Total Customers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {stats.activeCustomers}
          </div>
          <div className="text-amber-600 font-medium">Active Customers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {stats.vipCustomers}
          </div>
          <div className="text-amber-600 font-medium">VIP Customers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {stats.totalOrders}
          </div>
          <div className="text-amber-600 font-medium">Total Orders</div>
        </div>
      </div>

      {/* Customer Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white lg:col-span-2">
          <h3 className="font-bold text-lg mb-3">Customer Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold mb-1">
                {insights.repeatCustomerRate}
              </div>
              <div className="text-amber-100 text-sm">Repeat Customer Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {insights.averageOrderValue}
              </div>
              <div className="text-amber-100 text-sm">Average Order Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {insights.averagePurchaseCycle}
              </div>
              <div className="text-amber-100 text-sm">Avg. Purchase Cycle</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">
                {insights.satisfactionScore}
              </div>
              <div className="text-amber-100 text-sm">Satisfaction Score</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-3">Revenue Overview</h3>
          <p className="text-amber-100 text-sm mb-4">
            Total revenue from all customers
          </p>
          <div className="text-3xl font-bold mb-2">
            KES {stats.totalRevenue?.toFixed(2) || "0.00"}
          </div>
          <button
            onClick={fetchCustomersData}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-400 transition-colors w-full"
          >
            Update Stats
          </button>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
        {/* Search and Filter Header */}
        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-amber-700">
                <Filter className="w-4 h-4 mr-2" />
                <span className="font-medium">Filter:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium text-amber-900 min-w-32"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden">
          {currentCustomers.length > 0 ? (
            <table className="min-w-full divide-y divide-amber-200">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Loyalty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Total Spent
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
                {currentCustomers.map((customer, index) => {
                  const loyalty = getLoyaltyLevel(customer.loyaltyPoints);
                  const LoyaltyIcon = loyalty.icon;

                  return (
                    <tr
                      key={customer.id}
                      className={`hover:bg-amber-50 transition-all duration-300 group ${
                        index % 2 === 0 ? "bg-amber-25" : "bg-white"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-bold text-sm">
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-amber-900 group-hover:text-amber-700">
                              {customer.name}
                            </div>
                            <div className="text-xs text-amber-600">
                              Joined {formatDate(customer.joinDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-amber-400" />
                            <span className="text-amber-700 font-medium truncate max-w-xs">
                              {customer.email || "No email"}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-amber-400" />
                            <span className="text-amber-600">
                              {customer.phone || "No phone"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${loyalty.color} rounded-lg flex items-center justify-center mr-3`}
                          >
                            <LoyaltyIcon className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-amber-900">
                              {loyalty.level}
                            </div>
                            <div className="text-xs text-amber-600">
                              {customer.loyaltyPoints} pts
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-amber-700 font-bold text-sm">
                              {customer.orders}
                            </span>
                          </div>
                          <span className="text-sm text-amber-600 font-medium">
                            orders
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                        {customer.totalSpent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                            customer.status
                          )}`}
                        >
                          {customer.status === "VIP" && (
                            <Crown className="w-3 h-3 mr-1" />
                          )}
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/customers/${customer.id}`)
                            }
                            className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-300 group/action"
                          >
                            <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                          </button>
                          {customer.email && (
                            <a
                              href={`mailto:${customer.email}`}
                              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                            >
                              Email
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-600 text-lg mb-2">No customers found</p>
              <p className="text-amber-500 text-sm">
                {searchTerm
                  ? "Try a different search term"
                  : "Start by processing some orders"}
              </p>
            </div>
          )}
        </div>

        {/* Table Footer with Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="px-6 py-4 border-t border-amber-200 bg-amber-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-amber-600 font-medium">
                Showing {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredCustomers.length)} of{" "}
                {filteredCustomers.length} customers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                            : "text-amber-700 hover:bg-amber-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Engagement Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Email Campaign</h3>
              <p className="text-green-100 text-sm mb-4">
                Send personalized offers to your top customers
              </p>
              <button className="bg-white text-green-700 px-4 py-2 rounded-xl font-semibold hover:bg-green-50 transition-colors">
                Create Campaign
              </button>
            </div>
            <Mail className="w-12 h-12 text-green-300 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">Customer Feedback</h3>
              <p className="text-blue-100 text-sm mb-4">
                Collect reviews and improve customer experience
              </p>
              <button className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                Request Feedback
              </button>
            </div>
            <Calendar className="w-12 h-12 text-blue-300 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
/* import {
  Search,
  Mail,
  Phone,
  Eye,
  Crown,
  Star,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
} from "lucide-react";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const customers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1-234-567-890",
      orders: 12,
      totalSpent: "KES 1,245",
      status: "Active",
      joinDate: "2023-05-15",
      loyaltyPoints: 450,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1-234-567-891",
      orders: 8,
      totalSpent: "KES 876",
      status: "Active",
      joinDate: "2023-08-22",
      loyaltyPoints: 280,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1-234-567-892",
      orders: 15,
      totalSpent: "KES 2,134",
      status: "VIP",
      joinDate: "2023-02-10",
      loyaltyPoints: 890,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      phone: "+1-234-567-893",
      orders: 3,
      totalSpent: "KES 298",
      status: "Active",
      joinDate: "2024-01-05",
      loyaltyPoints: 120,
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || customer.status === statusFilter)
  );

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
      };
    if (points >= 400)
      return {
        level: "Silver",
        color: "from-gray-400 to-gray-600",
        icon: Star,
      };
    return {
      level: "Bronze",
      color: "from-amber-700 to-orange-800",
      icon: TrendingUp,
    };
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Customers</h1>
          <p className="text-amber-600 font-medium">
            Manage and analyze your customer relationships
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold">
            {customers.length} Customers
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {customers.length}
          </div>
          <div className="text-amber-600 font-medium">Total Customers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {customers.filter((c) => c.status === "Active").length}
          </div>
          <div className="text-amber-600 font-medium">Active Customers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {customers.filter((c) => c.status === "VIP").length}
          </div>
          <div className="text-amber-600 font-medium">VIP Customers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 text-center hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-amber-900 mb-1">
            {customers.reduce((sum, c) => sum + c.orders, 0)}
          </div>
          <div className="text-amber-600 font-medium">Total Orders</div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white lg:col-span-2">
          <h3 className="font-bold text-lg mb-3">Customer Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold mb-1">42%</div>
              <div className="text-amber-100 text-sm">Repeat Customer Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">KES 156</div>
              <div className="text-amber-100 text-sm">Average Order Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">28 days</div>
              <div className="text-amber-100 text-sm">Avg. Purchase Cycle</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">4.8/5</div>
              <div className="text-amber-100 text-sm">Satisfaction Score</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-3">Loyalty Program</h3>
          <p className="text-amber-100 text-sm mb-4">
            {customers.filter((c) => c.loyaltyPoints >= 400).length} customers
            have reached Silver status or higher
          </p>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-400 transition-colors w-full">
            Manage Program
          </button>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
        
        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium text-amber-900 min-w-32"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-amber-200">
            <thead className="bg-amber-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Loyalty
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Total Spent
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
              {filteredCustomers.map((customer, index) => {
                const loyalty = getLoyaltyLevel(customer.loyaltyPoints);
                const LoyaltyIcon = loyalty.icon;

                return (
                  <tr
                    key={customer.id}
                    className={`hover:bg-amber-50 transition-all duration-300 group ${
                      index % 2 === 0 ? "bg-amber-25" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-bold text-sm">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-900 group-hover:text-amber-700">
                            {customer.name}
                          </div>
                          <div className="text-xs text-amber-600">
                            Joined {customer.joinDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-amber-400" />
                          <span className="text-amber-700 font-medium">
                            {customer.email}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-amber-400" />
                          <span className="text-amber-600">
                            {customer.phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${loyalty.color} rounded-lg flex items-center justify-center mr-3`}
                        >
                          <LoyaltyIcon className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-900">
                            {loyalty.level}
                          </div>
                          <div className="text-xs text-amber-600">
                            {customer.loyaltyPoints} pts
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                          <span className="text-amber-700 font-bold text-sm">
                            {customer.orders}
                          </span>
                        </div>
                        <span className="text-sm text-amber-600 font-medium">
                          orders
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                      {customer.totalSpent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                          customer.status
                        )}`}
                      >
                        {customer.status === "VIP" && (
                          <Crown className="w-3 h-3 mr-1" />
                        )}
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-300 group/action">
                          <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                        </button>
                        <button className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300">
                          Message
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-amber-200 bg-amber-50/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-amber-600 font-medium">
              Showing {filteredCustomers.length} of {customers.length} customers
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

      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Email Campaign</h3>
          <p className="text-green-100 text-sm mb-4">
            Send personalized offers to your top customers
          </p>
          <button className="bg-white text-green-700 px-4 py-2 rounded-xl font-semibold hover:bg-green-50 transition-colors">
            Create Campaign
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Customer Feedback</h3>
          <p className="text-blue-100 text-sm mb-4">
            Collect reviews and improve customer experience
          </p>
          <button className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            Request Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;
 */
