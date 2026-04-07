/**
 * ProductTagger - Search and tag products on a creator post.
 * Shows tagged products as removable chips, with a live search dropdown.
 */

import { Search, ShoppingBag, X } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../Context/ThemeProvider";

export default function ProductTagger({
  taggedProducts,
  productQuery,
  onChangeQuery,
  productResults,
  searching,
  onTag,
  onRemove,
}) {
  const { themeStyles } = useTheme();

  return (
    <View>
      {/* Tagged products */}
      {taggedProducts.length > 0 && (
        <View style={styles.taggedList}>
          {taggedProducts.map((product) => (
            <View key={product.id} style={styles.taggedChip}>
              {product.image && (
                <Image
                  source={{ uri: product.image }}
                  style={styles.chipImage}
                />
              )}
              <View style={styles.chipInfo}>
                <Text style={styles.chipName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.chipPrice}>
                  ${product.price}
                  {product.discount ? ` · ${product.discount}% off` : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemove(product.id)}
                style={styles.chipRemove}
              >
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Search input */}
      <View
        style={[
          styles.searchRow,
          { borderColor: themeStyles.border || "#333" },
        ]}
      >
        <Search size={18} color="#8E8E8E" />
        <TextInput
          style={[styles.searchInput, { color: themeStyles.text }]}
          placeholder="Search products to tag..."
          placeholderTextColor="#8E8E8E"
          value={productQuery}
          onChangeText={onChangeQuery}
        />
        {searching && <ActivityIndicator size="small" color="#8E8E8E" />}
      </View>

      {/* Results dropdown */}
      {productResults.length > 0 && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: themeStyles.cardBackground || "#1C1C1E" },
          ]}
        >
          <FlatList
            data={productResults}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => onTag(item)}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.resultImage}
                  />
                ) : (
                  <View style={[styles.resultImage, styles.resultPlaceholder]}>
                    <ShoppingBag size={16} color="#8E8E8E" />
                  </View>
                )}
                <View style={styles.resultInfo}>
                  <Text
                    style={[styles.resultName, { color: themeStyles.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.resultPrice}>
                    ${item.price}
                    {item.discount ? ` · ${item.discount}% off` : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  taggedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  taggedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76,175,80,0.15)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    gap: 8,
  },
  chipImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  chipInfo: {
    maxWidth: 130,
  },
  chipName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  chipPrice: {
    fontSize: 11,
    color: "#66BB6A",
  },
  chipRemove: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  dropdown: {
    borderRadius: 10,
    marginTop: 6,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  resultPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultPrice: {
    fontSize: 13,
    color: "#4CAF50",
    marginTop: 2,
  },
});
