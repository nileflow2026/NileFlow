/**
 * MediaPicker - Instagram-style media selection grid.
 * Shows selected media with remove/reorder, plus add buttons.
 */

import { Camera, Images, X } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../Context/ThemeProvider";

export default function MediaPicker({ mediaItems, maxMedia, onPickLibrary, onPickCamera, onRemove }) {
  const { themeStyles } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {mediaItems.map((item, index) => (
          <View key={`${item.uri}-${index}`} style={styles.mediaThumb}>
            <Image source={{ uri: item.uri }} style={styles.thumbImage} />
            {item.type === "video" && (
              <View style={styles.videoBadge}>
                <Text style={styles.videoBadgeText}>
                  {item.duration ? `${Math.round(item.duration)}s` : "Video"}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
              <X size={14} color="#fff" />
            </TouchableOpacity>
            {index === 0 && mediaItems.length > 1 && (
              <View style={styles.coverBadge}>
                <Text style={styles.coverText}>Cover</Text>
              </View>
            )}
          </View>
        ))}

        {mediaItems.length < maxMedia && (
          <View style={styles.addButtons}>
            <TouchableOpacity
              style={[styles.addBtn, { borderColor: themeStyles.border || "#333" }]}
              onPress={() => onPickLibrary("library")}
            >
              <Images size={22} color={themeStyles.text} />
              <Text style={[styles.addText, { color: themeStyles.text }]}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { borderColor: themeStyles.border || "#333" }]}
              onPress={() => onPickCamera("camera")}
            >
              <Camera size={22} color={themeStyles.text} />
              <Text style={[styles.addText, { color: themeStyles.text }]}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {mediaItems.length > 0 && (
        <Text style={styles.countText}>
          {mediaItems.length}/{maxMedia} selected
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scroll: {
    paddingVertical: 8,
    gap: 10,
  },
  mediaThumb: {
    width: 110,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  videoBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  coverBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  coverText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
  },
  addButtons: {
    flexDirection: "row",
    gap: 10,
  },
  addBtn: {
    width: 100,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addText: {
    fontSize: 13,
    fontWeight: "500",
  },
  countText: {
    fontSize: 12,
    color: "#8E8E8E",
    textAlign: "right",
    marginTop: 4,
  },
});
