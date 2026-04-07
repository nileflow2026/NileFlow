/**
 * AudiencePickerModal — Bottom-sheet-style modal for selecting post audience.
 * Radio-style selection with descriptions.
 */

import * as Haptics from "expo-haptics";
import { Check, X } from "lucide-react-native";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../Context/ThemeProvider";

const ACCENT = "#FF4458";

export default function AudiencePickerModal({
  visible,
  onClose,
  options,
  selected,
  onSelect,
}) {
  const { themeStyles } = useTheme();
  const isDark = themeStyles.name === "dark";
  const bg = isDark ? "#1e293b" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.sheet, { backgroundColor: bg }]}>
          {/* Handle */}
          <View style={s.handleWrap}>
            <View
              style={[
                s.handle,
                { backgroundColor: isDark ? "#475569" : "#D1D5DB" },
              ]}
            />
          </View>

          {/* Header */}
          <View style={[s.header, { borderBottomColor: borderColor }]}>
            <Text style={[s.title, { color: themeStyles.text }]}>
              Who can see this?
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={22} color="#8E8E8E" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          {options.map((opt) => {
            const active = opt.key === selected;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[s.option, { borderBottomColor: borderColor }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(opt.key);
                }}
                activeOpacity={0.6}
              >
                <View style={s.optionText}>
                  <Text
                    style={[
                      s.optionLabel,
                      { color: themeStyles.text },
                      active && { color: ACCENT, fontWeight: "700" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={s.optionDesc}>{opt.description}</Text>
                </View>
                {active && <Check size={20} color={ACCENT} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}

          {/* Bottom safe area spacer */}
          <View style={s.spacer} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  handleWrap: { alignItems: "center", paddingTop: 10 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontWeight: "700" },

  /* Options */
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: "500" },
  optionDesc: { fontSize: 13, color: "#8E8E8E", marginTop: 2 },

  spacer: { height: 34 },
});
