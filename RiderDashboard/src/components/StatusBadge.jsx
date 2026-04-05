// components/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
    accepted: { color: "bg-blue-100 text-blue-800", text: "Accepted" },
    picked_up: { color: "bg-[#F2D5A0] text-[#8C4B2F]", text: "Picked Up" },
    on_the_way: { color: "bg-[#D9A566] text-[#593527]", text: "On The Way" },
    delivered: { color: "bg-green-100 text-green-800", text: "Delivered" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  );
}
