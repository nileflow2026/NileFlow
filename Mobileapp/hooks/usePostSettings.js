/**
 * usePostSettings — Manages location + audience state for post creation.
 * Clean separation: state + actions only, no UI.
 */

import { useCallback, useState } from "react";

/** @typedef {"public" | "followers" | "private"} Audience */

/** @typedef {{ name: string, lat?: number, lng?: number } | null} Location */

const AUDIENCE_OPTIONS = [
  { key: "public", label: "Public", description: "Anyone can see this post" },
  {
    key: "followers",
    label: "Followers",
    description: "Only your followers can see this",
  },
  {
    key: "private",
    label: "Private",
    description: "Only you can see this post",
  },
];

export { AUDIENCE_OPTIONS };

export default function usePostSettings() {
  /** @type {[Location, Function]} */
  const [location, setLocation] = useState(null);
  /** @type {[Audience, Function]} */
  const [audience, setAudience] = useState("public");

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [audienceModalVisible, setAudienceModalVisible] = useState(false);

  const selectLocation = useCallback((loc) => {
    setLocation(loc);
    setLocationModalVisible(false);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
  }, []);

  const selectAudience = useCallback((key) => {
    setAudience(key);
    setAudienceModalVisible(false);
  }, []);

  const openLocationPicker = useCallback(
    () => setLocationModalVisible(true),
    [],
  );
  const closeLocationPicker = useCallback(
    () => setLocationModalVisible(false),
    [],
  );
  const openAudiencePicker = useCallback(
    () => setAudienceModalVisible(true),
    [],
  );
  const closeAudiencePicker = useCallback(
    () => setAudienceModalVisible(false),
    [],
  );

  const reset = useCallback(() => {
    setLocation(null);
    setAudience("public");
  }, []);

  return {
    // Location
    location,
    selectLocation,
    clearLocation,
    locationModalVisible,
    openLocationPicker,
    closeLocationPicker,

    // Audience
    audience,
    selectAudience,
    audienceModalVisible,
    openAudiencePicker,
    closeAudiencePicker,

    // Meta
    audienceOptions: AUDIENCE_OPTIONS,
    reset,
  };
}
