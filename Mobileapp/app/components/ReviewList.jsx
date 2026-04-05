/* eslint-disable no-unused-vars */
// components/ReviewList.js
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../Context/ThemeProvider';

const { width } = Dimensions.get('window');


const ReviewList = ({
  reviews = [],
  initialReviewCount = 2,
  showAllReviews = false,
  setShowAllReviews,
  reviewFontSize = width < 350 ? 14 : 16,
  marginVertical = width < 350 ? 8 : 12,
}) => {
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, initialReviewCount);
  const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const themedText = isDarkMode ? 'text-white' : 'text-black';
   const themedBackground = isDarkMode ? 'bg-black' : 'bg-white';
  const renderReview = ({ item }) => (
    <View style={{ marginVertical }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>

        <Image
          source={
            item.avatarUrl && item.avatarUrl.trim() !== ''
              ? { uri: item.avatarUrl }
              : require('../../assets/themes/default-bg.png')
          }
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          resizeMode="cover"
        />


        <Text className={`${themedText} `} style={[ { fontSize: reviewFontSize }]}>{item.userName}</Text>
      </View>

      {item.rating > 0 && (
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {Array.from({ length: item.rating }).map((_, index) => (
            <Text
              key={`star-${item.id}-${index}`}
              style={{ color: 'gold', marginRight: 2, fontSize: 20 }}
            >
              ★
            </Text>
          ))}
        </View>
      )}

      {item.text && (
        <Text className={`${themedText} `}  style={[{ fontSize: reviewFontSize }]}>{item.text}</Text>
      )}

      <Text className={`${themedText} `} style={[styles.date, { fontSize: reviewFontSize }]}>
        Posted on: {item.date}
      </Text>
    </View>
  );

  return (
    <View>
      <FlatList
        data={displayedReviews}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
      />
      {reviews.length > initialReviewCount && (
        <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
          <Text style={[styles.toggleText, { fontSize: reviewFontSize }]}>
            {showAllReviews ? 'Show Less' : 'See All'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReviewList;

const styles = StyleSheet.create({
  userName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewText: {
    color: '#ccc',
    paddingVertical: 6,
  },
  date: {

    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 6,
  },
  toggleText: {
    color: '#40a9ff',
    textAlign: 'center',
    marginTop: 8,
  },
});
