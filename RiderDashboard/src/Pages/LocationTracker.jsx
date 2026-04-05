/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
// src/rider/components/LocationTracker.jsx
import { useEffect, useState } from "react";
import { useRiderAuth } from "../contexts/RiderAuthContext";
import riderAxiosClient from "../api/riderAxiosClient";

export const LocationTracker = () => {
  const { rider } = useRiderAuth();
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (rider?.status === "online" || rider?.status === "busy") {
      startTracking();
    } else {
      stopTracking();
    }
  }, [rider?.status]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    setTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await riderAxiosClient.post("/api/rider/location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        } catch (error) {
          console.error("Failed to update location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  };

  const stopTracking = () => {
    setTracking(false);
  };

  return null; // This is a background component
};
