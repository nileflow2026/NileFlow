/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShoppingBag,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  DollarSign,
  BarChart2,
  Settings,
  Trash2,
  Eye,
  Plus,
  X,
  Edit,
  Save,
  Layers,
} from "lucide-react";
import axiosClient from "../../axiosClient";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── helpers ────────────────────────────────────────────────────────────────

const statusColor = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  active: "bg-green-100 text-green-800 border border-green-200",
  completed: "bg-blue-100 text-blue-800 border border-blue-200",
  expired: "bg-gray-100 text-gray-600 border border-gray-200",
};

const statusIcon = {
  pending: <Clock className="w-3 h-3" />,
  active: <CheckCircle className="w-3 h-3" />,
  completed: <CheckCircle className="w-3 h-3" />,
  expired: <XCircle className="w-3 h-3" />,
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[status] || statusColor.pending}`}
    >
      {statusIcon[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProgressBar({ value, max, colorClass = "bg-green-500" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Tier Editor Modal ────────────────────────────────────────────────────────

function TierEditorModal({ productId, tiers: initialTiers, onClose, onSave }) {
  const [tiers, setTiers] = useState(
    initialTiers && initialTiers.length > 0
      ? initialTiers
      : [{ minParticipants: 2, price: "" }]
  );
  const [saving, setSaving] = useState(false);

  const addTier = () =>
    setTiers((t) => [...t, { minParticipants: "", price: "" }]);
  const removeTier = (i) => setTiers((t) => t.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    setTiers((t) =>
      t.map((tier, idx) => (idx === i ? { ...tier, [field]: val } : tier))
    );

  const handleSave = async () => {
    const parsed = tiers.map((t) => ({
      minParticipants: parseInt(t.minParticipants, 10),
      price: parseFloat(t.price),
    }));
    if (parsed.some((t) => isNaN(t.minParticipants) || isNaN(t.price))) {
      toast.error("All tier fields must be valid numbers.");
      return;
    }
    setSaving(true);
    try {
      await axiosClient.put(`/api/group-orders/settings/${productId}/tiers`, {
        tiers: parsed,
      });
      toast.success("Pricing tiers saved.");
      onSave(parsed);
      onClose();
    } catch {
      toast.error("Failed to save tiers.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">
            Edit Pricing Tiers
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Set price per number of participants. Sorted by{" "}
          <strong>minParticipants</strong> ascending.
        </p>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {tiers.map((tier, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="number"
                min="1"
                placeholder="Min participants"
                value={tier.minParticipants}
                onChange={(e) => update(i, "minParticipants", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price (EGP)"
                value={tier.price}
                onChange={(e) => update(i, "price", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={() => removeTier(i)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addTier}
          className="mt-3 flex items-center gap-1 text-indigo-600 text-sm font-medium hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Tier
        </button>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Tiers
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Group Detail Row ─────────────────────────────────────────────────────────

function GroupRow({ group, onForceExpire, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const savingsPct =
    group.basePrice > 0 && group.currentPrice > 0
      ? (((group.basePrice - group.currentPrice) / group.basePrice) * 100).toFixed(
          1
        )
      : null;

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="px-4 py-3">
          <button className="text-gray-400 hover:text-gray-600">
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs font-mono text-gray-500">
            {group.$id?.slice(-8)}
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
            {group.productName || group.productId}
          </p>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={group.status} />
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {group.participantsCount ?? 0}
            </span>
            <span className="text-gray-400">/</span>
            <span>{group.maxParticipants ?? "∞"}</span>
          </div>
          <ProgressBar
            value={group.participantsCount ?? 0}
            max={group.maxParticipants ?? 10}
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="font-semibold text-gray-800">
            {group.currentPrice != null
              ? `EGP ${parseFloat(group.currentPrice).toFixed(2)}`
              : "-"}
          </span>
          {savingsPct && (
            <span className="ml-1 text-emerald-600 text-xs">
              -{savingsPct}%
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {group.expiresAt
            ? new Date(group.expiresAt).toLocaleString()
            : "-"}
        </td>
        <td
          className="px-4 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            {group.status === "pending" && (
              <button
                title="Force Expire"
                onClick={() => onForceExpire(group.$id)}
                className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            )}
            <button
              title="Delete"
              onClick={() => onDelete(group.$id)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50 border-t border-gray-100">
          <td colSpan={8} className="px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 font-medium">Creator</p>
                <p className="text-gray-700 font-semibold break-all">
                  {group.creatorId || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Strategy</p>
                <p className="text-gray-700 font-semibold capitalize">
                  {group.pricingStrategy || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Base Price</p>
                <p className="text-gray-700 font-semibold">
                  {group.basePrice != null
                    ? `EGP ${parseFloat(group.basePrice).toFixed(2)}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Created</p>
                <p className="text-gray-700 font-semibold">
                  {group.$createdAt
                    ? new Date(group.$createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
              {group.participants?.length > 0 && (
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-xs text-gray-400 font-medium mb-1">
                    Participants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.participants.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-mono"
                      >
                        {p.slice(-8)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GroupBuyManagement() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // analytics
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);

  // tier editor
  const [tierModal, setTierModal] = useState(null); // { productId, tiers }

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.productId = search;
      params.limit = 200; // fetch enough to calculate analytics clientside
      const { data } = await axiosClient.get("/api/group-orders", { params });
      const list = data.groupOrders || data.groups || data || [];
      setGroups(list);
      buildAnalytics(list);
    } catch {
      toast.error("Failed to load group orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ── analytics ──────────────────────────────────────────────────────────────

  function buildAnalytics(list) {
    const total = list.length;
    const pending = list.filter((g) => g.status === "pending").length;
    const completed = list.filter((g) => g.status === "completed").length;
    const expired = list.filter((g) => g.status === "expired").length;
    const conversionRate =
      total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    const totalParticipants = list.reduce(
      (acc, g) => acc + (g.participantsCount ?? 0),
      0
    );
    const avgGroupSize =
      total > 0 ? (totalParticipants / total).toFixed(1) : 0;

    const savings = list
      .filter((g) => g.basePrice && g.currentPrice)
      .reduce((acc, g) => {
        const saved = (g.basePrice - g.currentPrice) * (g.participantsCount ?? 1);
        return acc + (saved > 0 ? saved : 0);
      }, 0);

    setAnalytics({
      total,
      pending,
      completed,
      expired,
      conversionRate,
      avgGroupSize,
      totalSavingsGenerated: savings.toFixed(2),
    });

    // chart: group count by creation date (last 14 days bucket)
    const buckets = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      buckets[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = {
        date: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        created: 0,
        completed: 0,
      };
    }
    list.forEach((g) => {
      const createdAt = g.$createdAt ? new Date(g.$createdAt) : null;
      if (!createdAt) return;
      const key = createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (buckets[key]) {
        buckets[key].created += 1;
        if (g.status === "completed") buckets[key].completed += 1;
      }
    });
    setChartData(Object.values(buckets));
  }

  // ── actions ────────────────────────────────────────────────────────────────

  const forceExpire = async (groupId) => {
    if (!window.confirm("Force expire this group?")) return;
    try {
      await axiosClient.post("/api/group-orders/expire-check", {
        forceIds: [groupId],
      });
      toast.success("Group expired.");
      fetchGroups();
    } catch {
      toast.error("Failed to expire group.");
    }
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group order permanently?")) return;
    try {
      await axiosClient.delete(`/api/group-orders/${groupId}`);
      toast.success("Deleted.");
      setGroups((g) => g.filter((x) => x.$id !== groupId));
    } catch {
      toast.error("Failed to delete.");
    }
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const filtered = groups.filter((g) => {
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (
      search &&
      !(g.productId || "").toLowerCase().includes(search.toLowerCase()) &&
      !(g.productName || "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Group Buy Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Monitor, configure, and manage all group buying campaigns
            </p>
          </div>
          <button
            onClick={fetchGroups}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={ShoppingBag}
              label="Total Groups"
              value={analytics.total}
              sub={`${analytics.pending} pending`}
              color="bg-indigo-500"
            />
            <StatCard
              icon={CheckCircle}
              label="Conversion Rate"
              value={`${analytics.conversionRate}%`}
              sub={`${analytics.completed} completed`}
              color="bg-emerald-500"
            />
            <StatCard
              icon={Users}
              label="Avg Group Size"
              value={analytics.avgGroupSize}
              sub="participants per group"
              color="bg-blue-500"
            />
            <StatCard
              icon={DollarSign}
              label="Savings Generated"
              value={`EGP ${parseFloat(analytics.totalSavingsGenerated).toLocaleString()}`}
              sub="across all groups"
              color="bg-amber-500"
            />
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Group Activity — Last 14 Days
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="chartGradCreated"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="chartGradCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="created"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#chartGradCreated)"
                  name="Groups Created"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#chartGradCompleted)"
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product ID or name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "active", "completed", "expired"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    statusFilter === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expires At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400"
                    >
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading group orders…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400"
                    >
                      No group orders found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((g) => (
                    <GroupRow
                      key={g.$id}
                      group={g}
                      onForceExpire={forceExpire}
                      onDelete={deleteGroup}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {filtered.length} results · Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tier Editor quick-launch section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            Configure Pricing Tiers for a Product
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Enter a product ID to view and edit its group buy pricing tiers.
          </p>
          <TierQuickEditor onOpenModal={(productId) =>
            setTierModal({ productId, tiers: [] })
          } />
        </div>
      </div>

      {/* Tier Editor Modal */}
      {tierModal && (
        <TierEditorModal
          productId={tierModal.productId}
          tiers={tierModal.tiers}
          onClose={() => setTierModal(null)}
          onSave={() => {}}
        />
      )}
    </div>
  );
}

// ─── Tier Quick Editor ─────────────────────────────────────────────────────────

function TierQuickEditor({ onOpenModal }) {
  const [productId, setProductId] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        disabled={!productId.trim()}
        onClick={() => onOpenModal(productId.trim())}
        className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        <Edit className="w-4 h-4" />
        Edit Tiers
      </button>
    </div>
  );
}
