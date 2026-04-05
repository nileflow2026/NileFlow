// components/DeliveryCard.jsx
import StatusBadge from "./StatusBadge";

export default function DeliveryCard({ delivery, onAccept, onReject }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-[#F2D5A0]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#D9A566] to-[#F2D5A0] rounded-full flex items-center justify-center">
            <span className="text-[#8C4B2F] font-bold text-sm">
              {delivery.customerName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {delivery.customerName}
            </h3>
            <p className="text-sm text-gray-600">{delivery.address}</p>
          </div>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Distance:</span>
          <span className="font-medium ml-1">{delivery.distance}</span>
        </div>
        <div>
          <span className="text-gray-600">Earnings:</span>
          <span className="font-medium ml-1 text-[#E25822]">
            {delivery.earnings}
          </span>
        </div>
      </div>

      {delivery.status === "pending" && (
        <div className="flex space-x-2">
          <button
            onClick={() => onAccept(delivery.id)}
            className="flex-1 bg-[#E25822] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#BF6B4B] transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => onReject(delivery.id)}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
