/**
 * MediaPreview — Full-width media carousel with Instagram-style overlays.
 * Empty state: dark canvas with Gallery / Camera action circles.
 * With media: paginated carousel, dot indicators, add-more / remove overlays.
 */

import * as Haptics from "expo-haptics";
import { Camera, ImagePlus, Play, Plus, X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const PREVIEW_H = SCREEN_W; // Square aspect — Instagram standard

export default function MediaPreview({
  mediaItems,
  onPickGallery,
  onPickCamera,
  onRemove,
  maxCount,
}) {
  const [active, setActive] = useState(0);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems[0]) setActive(viewableItems[0].index);
  }).current;

  const viewCfg = useRef({ itemVisiblePercentThreshold: 50 }).current;

  /* ────────── Empty State ────────── */
  if (mediaItems.length === 0) {
    return (
      <View style={s.empty}>
        <View style={s.emptyInner}>
          <View style={s.iconRow}>
            <TouchableOpacity
              style={s.iconAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPickGallery();
              }}
              activeOpacity={0.7}
            >
              <View style={s.iconCircle}>
                <ImagePlus size={30} color="#fff" strokeWidth={1.5} />
              </View>
              <Text style={s.iconLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.iconAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPickCamera();
              }}
              activeOpacity={0.7}
            >
              <View style={s.iconCircle}>
                <Camera size={30} color="#fff" strokeWidth={1.5} />
              </View>
              <Text style={s.iconLabel}>Camera</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.emptyHint}>Tap to add photos or videos</Text>
        </View>
      </View>
    );
  }

  /* ────────── Carousel ────────── */
  return (
    <View style={s.carousel}>
      <FlatList
        data={mediaItems}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewCfg}
        getItemLayout={(_, i) => ({
          length: SCREEN_W,
          offset: SCREEN_W * i,
          index: i,
        })}
        renderItem={({ item, index }) => (
          <View style={s.slide}>
            <Image
              source={{ uri: item.uri }}
              style={s.image}
              resizeMode="cover"
            />
            {item.type === "video" && (
              <View style={s.playOverlay}>
                <Play size={40} color="#fff" fill="rgba(255,255,255,0.85)" />
              </View>
            )}
            <TouchableOpacity
              style={s.removeBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemove(index);
              }}
              hitSlop={8}
            >
              <X size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Dot indicators */}
      {mediaItems.length > 1 && (
        <View style={s.dots}>
          {mediaItems.map((_, i) => (
            <View key={i} style={[s.dot, i === active && s.dotActive]} />
          ))}
        </View>
      )}

      {/* Add-more overlay */}
      {mediaItems.length < maxCount && (
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPickGallery();
          }}
          hitSlop={8}
        >
          <Plus size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      )}

      {/* Counter badge (only with multiple) */}
      {mediaItems.length > 1 && (
        <View style={s.counter}>
          <Text style={s.counterText}>
            {active + 1}/{mediaItems.length}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ────────── Styles ────────── */
const s = StyleSheet.create({
  /* Empty */
  empty: {
    height: PREVIEW_H * 0.65,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyInner: { alignItems: "center", gap: 28 },
  iconRow: { flexDirection: "row", gap: 48 },
  iconAction: { alignItems: "center", gap: 10 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  emptyHint: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    letterSpacing: 0.1,
  },

  /* Carousel */
  carousel: {
    height: PREVIEW_H,
    backgroundColor: "#000",
  },
  slide: { width: SCREEN_W, height: PREVIEW_H },
  image: { width: "100%", height: "100%" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  /* Overlay controls */
  removeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  counter: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  /* Dots */
  dots: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
