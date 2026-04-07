/**
 * ProductTagSection — Expandable product-tagging card.
 * Header row: icon + title + subtitle + count badge + chevron.
 * Expands to reveal search input + results. Tagged products shown as chips.
 * Pure presentational — all logic lives in the hook.
 */

import * as Haptics from "expo-haptics";
import {
  ChevronRight,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../Context/ThemeProvider";

export default function ProductTagSection({
  taggedProducts,
  productQuery,
  onChangeQuery,
  productResults,
  searching,
  onTag,
  onRemove,
  maxProducts,
  onSearchFocus,
}) {
  const { themeStyles } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isDark = themeStyles.name === "dark";
  const atLimit = maxProducts && taggedProducts.length >= maxProducts;

  return (
    <View style={s.container}>
      {/* ── Header Row ── */}
      <TouchableOpacity
        style={s.header}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded((v) => !v);
        }}
        activeOpacity={0.6}
      >
        <ShoppingBag size={20} color={themeStyles.text} strokeWidth={1.5} />
        <View style={s.headerText}>
          <Text style={[s.title, { color: themeStyles.text }]}>
            Tag Products
          </Text>
          <Text style={s.subtitle}>Boost conversions by tagging items</Text>
        </View>
        {taggedProducts.length > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>
              {taggedProducts.length}
              {maxProducts ? `/${maxProducts}` : ""}
            </Text>
          </View>
        )}
        <ChevronRight
          size={20}
          color="#8E8E8E"
          style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
        />
      </TouchableOpacity>

      {/* ── Tagged Chips (always visible if any) ── */}
      {taggedProducts.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsScroll}
        >
          {taggedProducts.map((p) => (
            <View key={p.id} style={s.chip}>
              {p.image && <Image source={{ uri: p.image }} style={s.chipImg} />}
              <Text style={s.chipName} numberOfLines={1}>
                {p.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onRemove(p.id);
                }}
                hitSlop={6}
              >
                <X size={14} color="#8E8E8E" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Expanded Search ── */}
      {expanded && (
        <View style={s.searchSection}>
          {atLimit ? (
            <View style={s.limitRow}>
              <Text style={s.limitText}>
                Maximum {maxProducts} products tagged
              </Text>
            </View>
          ) : (
            <>
              {/* Search input */}
              <View
                style={[
                  s.searchRow,
                  {
                    borderColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  },
                ]}
              >
                <Search size={16} color="#8E8E8E" />
                <TextInput
                  style={[s.searchInput, { color: themeStyles.text }]}
                  placeholder="Search products…"
                  placeholderTextColor="#8E8E8E"
                  value={productQuery}
                  onChangeText={onChangeQuery}
                  autoFocus
                  onFocus={onSearchFocus}
                />
                {searching && (
                  <ActivityIndicator size="small" color="#8E8E8E" />
                )}
                {!searching && productQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => onChangeQuery("")}
                    hitSlop={8}
                  >
                    <X size={16} color="#8E8E8E" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Results */}
              {productResults.length > 0 && (
                <FlatList
                  data={productResults}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const alreadyTagged = taggedProducts.some(
                      (t) => t.id === item.id,
                    );
                    return (
                      <TouchableOpacity
                        style={[s.resultRow, alreadyTagged && s.resultTagged]}
                        onPress={() => {
                          if (alreadyTagged) return;
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          onTag(item);
                        }}
                        activeOpacity={alreadyTagged ? 1 : 0.6}
                      >
                        {item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            style={s.resultImg}
                          />
                        ) : (
                          <View style={[s.resultImg, s.resultPlaceholder]}>
                            <ShoppingBag size={16} color="#8E8E8E" />
                          </View>
                        )}
                        <View style={s.resultInfo}>
                          <Text
                            style={[s.resultName, { color: themeStyles.text }]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={s.resultPrice}>
                            ${item.price}
                            {item.discount ? ` · ${item.discount}% off` : ""}
                          </Text>
                        </View>
                        {alreadyTagged ? (
                          <Text style={s.taggedLabel}>Tagged</Text>
                        ) : (
                          <Plus size={18} color="#8E8E8E" />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              {/* Empty state — typed but no results */}
              {!searching &&
                productQuery.length >= 2 &&
                productResults.length === 0 && (
                  <View style={s.emptyState}>
                    <ShoppingBag size={28} color="#8E8E8E" strokeWidth={1.2} />
                    <Text style={s.emptyText}>
                      No products found for &quot;{productQuery}&quot;
                    </Text>
                  </View>
                )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingVertical: 4 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#8E8E8E", marginTop: 1 },
  badge: {
    backgroundColor: "#FF4458",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  /* Chips */
  chipsScroll: { paddingBottom: 12, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,68,88,0.08)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    gap: 8,
  },
  chipImg: { width: 24, height: 24, borderRadius: 12 },
  chipName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FF4458",
    maxWidth: 120,
  },

  /* Search */
  searchSection: { paddingBottom: 8 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  /* Results */
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  resultImg: { width: 40, height: 40, borderRadius: 8 },
  resultPlaceholder: {
    backgroundColor: "rgba(128,128,128,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: "500" },
  resultPrice: { fontSize: 13, color: "#8E8E8E", marginTop: 1 },
  resultTagged: { opacity: 0.5 },
  taggedLabel: { fontSize: 12, color: "#8E8E8E", fontWeight: "600" },

  /* Limit */
  limitRow: {
    paddingVertical: 16,
    alignItems: "center",
  },
  limitText: { fontSize: 13, color: "#8E8E8E" },

  /* Empty */
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: "#8E8E8E", textAlign: "center" },
});
