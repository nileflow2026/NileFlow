/* eslint-disable no-unused-vars */

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getRecentSearches } from "../../Appwrite";
import { useTheme } from "../../Context/ThemeProvider";

const RecentSearches = ({ userId, onSearchSelect, onClearRecentSearches }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const { themeStyles } = useTheme();

  useEffect(() => {
    const fetchSearches = async () => {
      const searches = await getRecentSearches(userId);
      setRecentSearches(searches);
    };

    fetchSearches();
  }, [userId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onSearchSelect(item.query)}
      style={styles.item}
    >
      <Text style={styles.text}>{item.query}</Text>
    </TouchableOpacity>
  );

  if (!recentSearches.length) return null;

  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text style={styles.heading}>Recent Searches</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity
            onPress={onClearRecentSearches}
            style={styles.clearButton}
          >
            <Ionicons name="trash-outline" size={20} color="gray" />
            {/* You can add text next to the icon if you prefer */}
            {/* <Text style={styles.clearButtonText}>Clear</Text> */}
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={recentSearches}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
      />
      {recentSearches.length === 0 && (
        <Text style={styles.emptyText}>No recent searches.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  heading: { color: "#000", fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  item: {
    paddingVertical: 10,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  text: { color: "#000" },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButtonText: {
    marginLeft: 5,
    color: "gray",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});

export default RecentSearches;
