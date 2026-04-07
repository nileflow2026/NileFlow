/**
 * LocationPickerModal — Full-screen modal for searching / entering a location.
 * Search input → suggestion list → custom entry fallback.
 */

import * as Haptics from "expo-haptics";
import { MapPin, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../Context/ThemeProvider";

const POPULAR_LOCATIONS = [
  { name: "New York, USA" },
  { name: "London, UK" },
  { name: "Lagos, Nigeria" },
  { name: "Dubai, UAE" },
  { name: "Accra, Ghana" },
  { name: "Nairobi, Kenya" },
  { name: "Paris, France" },
  { name: "Toronto, Canada" },
  { name: "Cairo, Egypt" },
  { name: "Johannesburg, South Africa" },
];

export default function LocationPickerModal({
  visible,
  onClose,
  onSelect,
  currentLocation,
}) {
  const { themeStyles } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(POPULAR_LOCATIONS);
  const inputRef = useRef(null);
  const isDark = themeStyles.name === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  useEffect(() => {
    if (visible) {
      setQuery("");
      setResults(POPULAR_LOCATIONS);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  const handleSearch = useCallback((text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults(POPULAR_LOCATIONS);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = POPULAR_LOCATIONS.filter((l) =>
      l.name.toLowerCase().includes(lower),
    );
    setResults(filtered);
  }, []);

  const handleSelect = useCallback(
    (loc) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect({ name: loc.name, lat: loc.lat, lng: loc.lng });
    },
    [onSelect],
  );

  const handleCustom = useCallback(() => {
    if (!query.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect({ name: query.trim() });
  }, [query, onSelect]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.safe, { backgroundColor: bg }]} edges={["top"]}>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <X size={24} color={themeStyles.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: themeStyles.text }]}>
            Add Location
          </Text>
          {currentLocation ? (
            <TouchableOpacity
              onPress={() => {
                onSelect(null);
              }}
            >
              <Text style={s.removeText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.headerSpacer} />
          )}
        </View>

        {/* Search */}
        <View style={[s.searchRow, { backgroundColor: cardBg }]}>
          <Search size={18} color="#8E8E8E" />
          <TextInput
            ref={inputRef}
            style={[s.searchInput, { color: themeStyles.text }]}
            placeholder="Search locations…"
            placeholderTextColor="#8E8E8E"
            value={query}
            onChangeText={handleSearch}
            returnKeyType="done"
            onSubmitEditing={handleCustom}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults(POPULAR_LOCATIONS);
              }}
              hitSlop={8}
            >
              <X size={16} color="#8E8E8E" />
            </TouchableOpacity>
          )}
        </View>

        {/* Custom entry hint */}
        {query.trim().length > 0 &&
          !results.some(
            (r) => r.name.toLowerCase() === query.toLowerCase(),
          ) && (
            <TouchableOpacity
              style={[s.customRow, { borderBottomColor: borderColor }]}
              onPress={handleCustom}
              activeOpacity={0.6}
            >
              <MapPin size={18} color="#FF4458" />
              <Text style={[s.customText, { color: themeStyles.text }]}>
                Use &quot;{query.trim()}&quot;
              </Text>
            </TouchableOpacity>
          )}

        {/* Results */}
        <FlatList
          data={results}
          keyExtractor={(item) => item.name}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.row, { borderBottomColor: borderColor }]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.6}
            >
              <MapPin size={18} color="#8E8E8E" />
              <Text style={[s.rowText, { color: themeStyles.text }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            !query.trim() ? <Text style={s.sectionLabel}>POPULAR</Text> : null
          }
          ListEmptyComponent={
            query.trim() ? (
              <Text style={s.emptyText}>
                No matches — tap above to use your custom location
              </Text>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSpacer: { width: 60 },
  removeText: { fontSize: 14, color: "#FF4458", fontWeight: "600" },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },

  /* Custom entry */
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  customText: { fontSize: 15, fontWeight: "500" },

  /* List */
  list: { paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E8E",
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontSize: 15 },
  emptyText: {
    fontSize: 14,
    color: "#8E8E8E",
    textAlign: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
});
