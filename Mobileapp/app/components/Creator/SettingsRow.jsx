/**
 * SettingsRow — Pure presentational row: icon + label + value + chevron.
 * No business logic. Supports optional loading state.
 */

import { ChevronRight } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../Context/ThemeProvider";

export default function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  loading,
}) {
  const { themeStyles } = useTheme();

  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={0.6}
      disabled={!onPress || loading}
    >
      {Icon && <Icon size={20} color={themeStyles.text} strokeWidth={1.5} />}
      <Text style={[s.label, { color: themeStyles.text }]}>{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#8E8E8E" />
      ) : (
        value != null && value !== "" && <Text style={s.value}>{value}</Text>
      )}
      <ChevronRight size={18} color="#8E8E8E" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
    minHeight: 48,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
  },
  value: {
    fontSize: 14,
    color: "#8E8E8E",
  },
});
