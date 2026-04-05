import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredMostBrowsedCategory = async (validCategories = []) => {
  try {
    const stored = await AsyncStorage.getItem('categoryCounts');
    if (!stored) return null;

    const counts = JSON.parse(stored);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const mostUsed = sorted[0]?.[0];

    // Validate category
    if (mostUsed && (validCategories.length === 0 || validCategories.includes(mostUsed))) {
      return mostUsed;
    }

    return null;
  } catch (error) {
    console.error('Error reading most browsed category:', error);
    return null;
  }
};
