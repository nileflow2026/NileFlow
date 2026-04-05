// components/DeliveryTimeline.jsx
import { Check, Clock, Package, Truck } from "lucide-react";

export default function DeliveryTimeline() {
  const steps = [
    {
      status: "picked_up",
      title: "Picked Up",
      description: "Package collected from sender",
      time: "09:30 AM",
      completed: true,
      icon: <Package size={20} />,
    },
    {
      status: "on_the_way",
      title: "On The Way",
      description: "In transit to destination",
      time: "10:15 AM",
      completed: true,
      icon: <Truck size={20} />,
    },
    {
      status: "delivered",
      title: "Delivered",
      description: "Package delivered to recipient",
      time: "Expected 11:30 AM",
      completed: false,
      icon: <Check size={20} />,
    },
  ];

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-[#F2D5A0]">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Delivery Progress
      </h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.status} className="flex items-start space-x-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed
                    ? "bg-[#E25822] text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step.completed ? <Check size={20} /> : step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    step.completed ? "bg-[#E25822]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className={`font-semibold ${
                      step.completed ? "text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{step.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
