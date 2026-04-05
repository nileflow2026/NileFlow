/* eslint-disable react/prop-types */
/* eslint-disable no-irregular-whitespace */
// components/AddAddressMapModal.js

import React, { useState, useEffect } from 'react';

import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert,  } from 'react-native';



import * as Location from 'expo-location';




const AddAddressMapModal = ({ isVisible, onClose, onLocationSelect }) => {

 const [mapRegion, setMapRegion] = useState(null);

 const [selectedCoordinate, setSelectedCoordinate] = useState(null);

 const [loadingLocation, setLoadingLocation] = useState(true);



 useEffect(() => {

  (async () => {

   let { status } = await Location.requestForegroundPermissionsAsync();

   if (status !== 'granted') {

    console.error('Permission to access location was denied');

    setMapRegion({

     latitude: -1.2921,

     longitude: 36.8219,

     latitudeDelta: 0.0922,

     longitudeDelta: 0.0421,

    });

    setLoadingLocation(false);

    return;

   }



   let location = await Location.getCurrentPositionAsync({});

   setMapRegion({

    latitude: location.coords.latitude,

    longitude: location.coords.longitude,

    latitudeDelta: 0.02,

    longitudeDelta: 0.01,

   });

   setLoadingLocation(false);

  })();

 }, []);



 const handleMapPress = (event) => {

  setSelectedCoordinate(event.nativeEvent.coordinate);

 };



 const handleSaveLocation = () => {

  if (selectedCoordinate) {

   onLocationSelect(selectedCoordinate);

   onClose();

  } else {

   Alert.alert('Select Location', 'Please tap on the map to select an address.');

  }

 };



 if (loadingLocation) {

  return (

   <Modal visible={isVisible} onRequestClose={onClose} animationType="slide" transparent>

    <View style={styles.modalContainer}>

     <View style={styles.modalContent}>

      <ActivityIndicator size="large" color="#2f9e44" />

      <Text style={styles.loadingText}>Fetching your location...</Text>

     </View>

    </View>

   </Modal>

  );

 }



 return (

  <Modal visible={isVisible} onRequestClose={onClose} animationType="slide" transparent>

   <View style={styles.modalContainer}>

    <View style={styles.modalContent}>
  
{/* <CustomMapView

      style={styles.map} // Apply the style to make it visible
      showsUserLocation={true}
      initialRegion={mapRegion}
      onPress={handleMapPress}
      selectedCoordinate={selectedCoordinate}

     >

      
     </CustomMapView> */}

   

     

     <View style={styles.buttonContainer}>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveLocation}>

       <Text style={styles.buttonText}>Save Location</Text>

      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>

       <Text style={styles.buttonText}>Cancel</Text>

      </TouchableOpacity>

     </View>

    </View>

   </View>

  </Modal>

 );

};



const styles = StyleSheet.create({

 modalContainer: {

  flex: 1,

  justifyContent: 'center',

  alignItems: 'center',

  backgroundColor: 'rgba(0, 0, 0, 0.7)',

 },

 modalContent: {

  backgroundColor: 'white',

  borderRadius: 10,

  width: '90%',

  height: '80%',

  padding: 10,

 },

 map: {

  flex: 1, // Make the map take up the available space in the modal content

 },

 buttonContainer: {

  flexDirection: 'row',

  justifyContent: 'space-around',

  paddingVertical: 15,

 },

 saveButton: {

  backgroundColor: '#2f9e44',

  padding: 15,

  borderRadius: 8,

  flex: 1,

  marginHorizontal: 5,

  alignItems: 'center',

 },

 cancelButton: {

  backgroundColor: 'red',

  padding: 15,

  borderRadius: 8,

  flex: 1,

  marginHorizontal: 5,

  alignItems: 'center',

 },

 buttonText: {

  color: 'white',

  fontWeight: 'bold',

  fontSize: 16,

 },

 loadingText: {

  marginTop: 10,

  fontSize: 16,

  color: 'gray',

 },

});



export default AddAddressMapModal;