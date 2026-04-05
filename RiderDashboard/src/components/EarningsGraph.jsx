// components/EarningsGraph.jsx
import { useState } from "react";

export default function EarningsGraph() {
  const [timeframe, setTimeframe] = useState("weekly");

  // Mock data for the graph
  const data = {
    weekly: [120, 190, 300, 250, 180, 220, 280],
    monthly: [
      1200, 1800, 2200, 1900, 2400, 2800, 3200, 2900, 3500, 3800, 4200, 4500,
    ],
    daily: [45, 52, 38, 61, 55, 48],
  };

  const currentData = data[timeframe];
  const maxValue = Math.max(...currentData);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Earnings Overview</h2>
        <div className="flex space-x-2">
          {["daily", "weekly", "monthly"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? "bg-[#E25822] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between h-48 space-x-2">
        {currentData.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-[#E25822] to-[#D9A566] rounded-t-lg transition-all duration-300"
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-600 mt-2">
              {timeframe === "daily"
                ? `H${index + 1}`
                : timeframe === "weekly"
                ? ["M", "T", "W", "T", "F", "S", "S"][index]
                : `M${index + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
