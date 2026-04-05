// utils/geocoding.js

const GOOGLE_MAPS_API_KEY = 'AIzaSyC4RLT1efIxqTaPbe9faQApzoBN9nmmNgA'; // Replace with your actual API key

 export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
      console.log("Geocoding API Response:", data);
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}; 