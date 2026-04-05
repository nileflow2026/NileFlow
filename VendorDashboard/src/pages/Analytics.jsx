import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import vendorAxiosClient from "../../services/api/vendorAxiosClient";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("6m");
  const [activeMetric, setActiveMetric] = useState("revenue");
  const [analyticsData, setAnalyticsData] = useState({
    salesData: [],
    metrics: {
      revenue: { value: "KES 0", change: 0 },
      orders: { value: "0", change: 0 },
      customers: { value: "0", change: 0 },
      growth: { value: "0%", change: 0 },
    },
    performance: {
      conversionRate: 0,
      customerSatisfaction: 0,
      inventoryTurnover: 0,
      repeatCustomerRate: 0,
      avgOrderValue: 0,
    },
    topProducts: [],
    insights: {
      insights: "",
      recommendations: "",
    },
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vendorAxiosClient.get(
        `/api/vendor/analytics?period=${timeRange}`
      );
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      } else {
        setError("Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Unable to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await vendorAxiosClient.get(
        "/api/vendor/analytics/export",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `analytics-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const metrics = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: analyticsData.metrics.revenue.value,
      change: `${
        analyticsData.metrics.revenue.change > 0 ? "+" : ""
      }${Math.round(analyticsData.metrics.revenue.change)}%`,
      icon: DollarSign,
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "orders",
      label: "Total Orders",
      value: analyticsData.metrics.orders.value,
      change: `${
        analyticsData.metrics.orders.change > 0 ? "+" : ""
      }${Math.round(analyticsData.metrics.orders.change)}%`,
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "customers",
      label: "New Customers",
      value: analyticsData.metrics.customers.value,
      change: `${
        analyticsData.metrics.customers.change > 0 ? "+" : ""
      }${Math.round(analyticsData.metrics.customers.change)}%`,
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "growth",
      label: "Growth Rate",
      value: analyticsData.metrics.growth.value,
      change: `${
        analyticsData.metrics.growth.change > 0 ? "+" : ""
      }${Math.round(analyticsData.metrics.growth.change)}%`,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
    },
  ];

  const getMaxValue = () => {
    if (!analyticsData.salesData.length) return 1;
    return Math.max(...analyticsData.salesData.map((d) => d[activeMetric]));
  };

  const getMetricLabel = (metric) => {
    switch (metric) {
      case "revenue":
        return "Revenue";
      case "orders":
        return "Orders";
      case "customers":
        return "Customers";
      case "growth":
        return "Growth";
      default:
        return metric;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-800">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-amber-600 font-medium">
            Real-time business performance and growth tracking
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-amber-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white font-medium text-amber-900"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={handleExport}
            className="border border-amber-200 rounded-xl px-4 py-2 hover:bg-amber-50 transition-all duration-300 flex items-center space-x-2 text-amber-700 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={fetchAnalyticsData}
            className="border border-amber-200 rounded-xl px-4 py-2 hover:bg-amber-50 transition-all duration-300 flex items-center space-x-2 text-amber-700 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setActiveMetric(metric.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-amber-900 mb-1">
                    {metric.value}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      metric.change.includes("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metric.change} from last period
                  </p>
                </div>
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-amber-900">
                  Sales Overview
                </h3>
                <div className="flex space-x-2">
                  {["revenue", "orders", "customers"].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setActiveMetric(metric)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeMetric === metric
                          ? "bg-amber-500 text-white"
                          : "text-amber-600 hover:bg-amber-100"
                      }`}
                    >
                      {getMetricLabel(metric)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              {analyticsData.salesData.length > 0 ? (
                <div className="h-80 flex items-end justify-between space-x-3">
                  {analyticsData.salesData.map((data, index) => {
                    const value = data[activeMetric];
                    const height = (value / getMaxValue()) * 240;
                    const gradient =
                      activeMetric === "revenue"
                        ? "from-amber-400 to-orange-500"
                        : activeMetric === "orders"
                        ? "from-green-400 to-emerald-500"
                        : "from-blue-400 to-cyan-500";

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1 group"
                      >
                        <div className="relative w-full">
                          <div
                            className={`w-full bg-gradient-to-t ${gradient} rounded-t-xl transition-all duration-500 hover:opacity-90 group-hover:scale-105`}
                            style={{ height: `${height}px` }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-amber-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {activeMetric === "revenue" &&
                              formatCurrency(value)}
                            {activeMetric === "orders" && `${value} orders`}
                            {activeMetric === "customers" &&
                              `${value} customers`}
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <div className="text-sm font-medium text-amber-900">
                            {data.month}
                          </div>
                          {data.growth !== undefined && (
                            <div
                              className={`text-xs font-semibold ${
                                data.growth > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {data.growth > 0 ? "+" : ""}
                              {data.growth}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                    <p className="text-amber-600">
                      No sales data available for selected period
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <h3 className="text-lg font-bold text-amber-900">
                Performance Metrics
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                    Conversion Rate
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {analyticsData.performance.conversionRate}%
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 group-hover:scale-105"
                    style={{
                      width: `${analyticsData.performance.conversionRate}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-amber-600 mt-1 font-medium">
                  Industry average: 65%
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                    Customer Satisfaction
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {analyticsData.performance.customerSatisfaction}%
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full transition-all duration-1000 group-hover:scale-105"
                    style={{
                      width: `${analyticsData.performance.customerSatisfaction}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-amber-600 mt-1 font-medium">
                  Target: 90%+
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                    Inventory Turnover
                  </span>
                  <span className="text-sm font-bold text-amber-600">
                    {analyticsData.performance.inventoryTurnover}%
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-1000 group-hover:scale-105"
                    style={{
                      width: `${Math.min(
                        analyticsData.performance.inventoryTurnover,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-amber-600 mt-1 font-medium">
                  Ideal range: 70-100%
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                    Repeat Customer Rate
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    {analyticsData.performance.repeatCustomerRate}%
                  </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-1000 group-hover:scale-105"
                    style={{
                      width: `${analyticsData.performance.repeatCustomerRate}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-amber-600 mt-1 font-medium">
                  Goal: 50%+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Report */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-amber-900">
                  Detailed Sales Report
                </h3>
                <div className="flex items-center space-x-2 text-amber-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {timeRange === "1m"
                      ? "Last Month"
                      : timeRange === "3m"
                      ? "Last 3 Months"
                      : timeRange === "6m"
                      ? "Last 6 Months"
                      : "Last Year"}
                  </span>
                </div>
              </div>
            </div>
            <div className="overflow-hidden">
              {analyticsData.salesData.length > 0 ? (
                <table className="min-w-full divide-y divide-amber-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Customers
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Avg. Order Value
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-100">
                    {analyticsData.salesData.map((data, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-amber-50 transition-all duration-300 group ${
                          index % 2 === 0 ? "bg-amber-25" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                              <span className="text-white font-bold text-xs">
                                {data.month.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-amber-900">
                              {data.fullMonth}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                          {formatCurrency(data.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {data.orders}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-700">
                          {data.customers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                          {formatCurrency(
                            data.orders > 0 ? data.revenue / data.orders : 0
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              data.growth > 0
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {data.growth > 0 ? "+" : ""}
                            {data.growth}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                  <p className="text-amber-600">No sales data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Performance Insights</h3>
          <p className="text-amber-100 text-sm mb-4">
            {analyticsData.insights.insights || "Loading insights..."}
          </p>
          <button className="bg-white text-amber-700 px-4 py-2 rounded-xl font-semibold hover:bg-amber-50 transition-colors">
            View Detailed Insights
          </button>
        </div>

        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Recommendations</h3>
          <p className="text-amber-100 text-sm mb-4">
            {analyticsData.insights.recommendations ||
              "Loading recommendations..."}
          </p>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-400 transition-colors">
            Get Actionable Recommendations
          </button>
        </div>
      </div>

      {/* Top Products Panel */}
      {analyticsData.topProducts.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="text-lg font-bold text-amber-900">
              Top Performing Products
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analyticsData.topProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-amber-50 rounded-xl p-4 border border-amber-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-amber-900 truncate">
                      {product.name}
                    </span>
                    <span className="text-xs font-bold text-amber-700">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="text-sm text-amber-600 mb-1">
                    {product.sales} units sold
                  </div>
                  <div className="text-lg font-bold text-amber-900">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
