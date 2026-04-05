// components/StatCard.jsx
export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "sunset",
}) {
  const colorClasses = {
    sunset: "bg-gradient-to-br from-[#E25822] to-[#BF6B4B]",
    savanna: "bg-gradient-to-br from-[#D9A566] to-[#F2D5A0]",
    earth: "bg-gradient-to-br from-[#8C4B2F] to-[#593527]",
    clay: "bg-gradient-to-br from-[#BF6B4B] to-[#D9A566]",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-1 ${
                trend.startsWith("+") ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
