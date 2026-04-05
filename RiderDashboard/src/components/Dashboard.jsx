// components/Dashboard.jsx
import { useState } from "react";
import {
  Truck,
  Package,
  DollarSign,
  MapPin,
  Star,
  Camera,
  Upload,
  AlertTriangle,
} from "lucide-react";
import StatCard from "./StatCard";
import DeliveryCard from "./DeliveryCard";
import EarningsGraph from "./EarningsGraph";
import DeliveryTimeline from "./DeliveryTimeline";

export default function Dashboard() {
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      customerName: "Sarah Johnson",
      address: "123 Main St, 2km",
      distance: "2.3km",
      earnings: "$8.50",
      status: "pending",
    },
    {
      id: 2,
      customerName: "Mike Chen",
      address: "456 Oak Ave, 1.5km",
      distance: "1.5km",
      earnings: "$6.75",
      status: "accepted",
    },
    {
      id: 3,
      customerName: "Emily Davis",
      address: "789 Pine Rd, 3.2km",
      distance: "3.2km",
      earnings: "$12.25",
      status: "picked_up",
    },
  ]);

  const [proofImage, setProofImage] = useState(null);
  const [issueReport, setIssueReport] = useState("");

  const handleAcceptDelivery = (id) => {
    setDeliveries(
      deliveries.map((delivery) =>
        delivery.id === id ? { ...delivery, status: "accepted" } : delivery
      )
    );
  };

  const handleRejectDelivery = (id) => {
    setDeliveries(deliveries.filter((delivery) => delivery.id !== id));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProofImage(URL.createObjectURL(file));
    }
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    // Handle issue submission
    console.log("Issue reported:", issueReport);
    setIssueReport("");
    alert("Issue reported successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2D5A0] to-[#D9A566]">
      {/* Header with African pattern */}
      <header className="bg-tribal-pattern bg-cover">
        <div className="bg-gradient-to-r from-[#8C4B2F] to-[#E25822] bg-opacity-90">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Jengo Courier</h1>
                <p className="text-[#F2D5A0]">Delivery Agent Dashboard</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#F2D5A0] rounded-full flex items-center justify-center">
                  <span className="text-[#8C4B2F] font-bold">AK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Today's Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Today's Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Deliveries"
              value="12"
              trend="+2 today"
              icon={<Truck size={24} />}
              color="sunset"
            />
            <StatCard
              title="Completed"
              value="8"
              trend="+3 from yesterday"
              icon={<Package size={24} />}
              color="savanna"
            />
            <StatCard
              title="Earnings Today"
              value="$156.80"
              trend="+$24.50"
              icon={<DollarSign size={24} />}
              color="clay"
            />
            <StatCard
              title="Distance Covered"
              value="42.3km"
              trend="+8.2km"
              icon={<MapPin size={24} />}
              color="earth"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Queue */}
            <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Delivery Queue
              </h2>
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onAccept={handleAcceptDelivery}
                    onReject={handleRejectDelivery}
                  />
                ))}
              </div>
            </section>

            {/* Map View */}
            <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Route Map
              </h2>
              <div className="bg-gradient-to-br from-[#F2D5A0] to-[#D9A566] h-64 rounded-lg flex items-center justify-center">
                <div className="text-center text-[#8C4B2F]">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p className="font-semibold">Live Route Tracking</p>
                  <p className="text-sm">Map integration placeholder</p>
                </div>
              </div>
            </section>

            {/* Delivery Timeline */}
            <DeliveryTimeline />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Proof of Delivery */}
            <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Proof of Delivery
              </h2>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Delivery Photo
                </label>
                <div className="border-2 border-dashed border-[#D9A566] rounded-lg p-4 text-center">
                  {proofImage ? (
                    <div className="space-y-2">
                      <img
                        src={proofImage}
                        alt="Proof"
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        onClick={() => setProofImage(null)}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera
                        className="mx-auto text-gray-400 mb-2"
                        size={32}
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </div>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Signature
                </label>
                <div className="border-2 border-[#F2D5A0] rounded-lg h-20 bg-[#FDF6E8] flex items-center justify-center">
                  <span className="text-gray-500">
                    Signature input placeholder
                  </span>
                </div>
              </div>
            </section>

            {/* Earnings Breakdown */}
            <EarningsGraph />

            {/* Rating & Performance */}
            <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Performance
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-gradient-to-br from-[#E25822] to-[#D9A566] p-3 rounded-xl">
                  <Star className="text-white" size={24} fill="white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.8/5.0</p>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>On-time Delivery</span>
                  <span className="font-semibold">96%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#E25822] h-2 rounded-full"
                    style={{ width: "96%" }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm mt-3">
                  <span>Order Accuracy</span>
                  <span className="font-semibold">99%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#D9A566] h-2 rounded-full"
                    style={{ width: "99%" }}
                  ></div>
                </div>
              </div>
            </section>

            {/* Issue Reporting */}
            <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle size={20} className="text-[#E25822] mr-2" />
                Report Issue
              </h2>
              <form onSubmit={handleIssueSubmit}>
                <textarea
                  value={issueReport}
                  onChange={(e) => setIssueReport(e.target.value)}
                  placeholder="Describe the issue you're facing..."
                  className="w-full h-32 p-3 border border-[#F2D5A0] rounded-lg focus:ring-2 focus:ring-[#E25822] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="w-full mt-3 bg-gradient-to-r from-[#E25822] to-[#BF6B4B] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Submit Report
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
