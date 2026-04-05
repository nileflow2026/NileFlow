import React from "react";
import { AlertTriangle, Clock, Settings, Wrench } from "lucide-react";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Animated Icons */}
          <div className="relative mb-8">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="animate-spin-slow">
                <Settings className="w-8 h-8 text-blue-400" />
              </div>
              <div className="animate-bounce">
                <Wrench className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="animate-pulse">
                <Settings className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
          </div>

          {/* Main Content */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Under Maintenance
          </h1>

          <p className="text-gray-300 mb-6 leading-relaxed">
            We're currently performing scheduled maintenance to improve your
            experience. The site is temporarily unavailable during this
            inspection period.
          </p>

          {/* Status Info */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Status: Site Under Inspection</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-gray-400">
            <p>If you need immediate assistance, please contact support.</p>
            <p className="mt-2 font-mono text-xs opacity-75">
              Error Code: MAINTENANCE_MODE_ACTIVE
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-xs text-gray-500">
          We apologize for any inconvenience. Normal service will resume
          shortly.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
