/* eslint-disable react/prop-types */
import React from 'react';
import MapView, { Marker } from 'react-native-maps';

const CustomMapView = ({ region, onPress, selectedCoordinate }) => {
  return (
    <MapView
      style={{ flex: 1 }}
      showsUserLocation={true}
      initialRegion={region}
      onPress={onPress}
    >
      {selectedCoordinate && (
        <Marker coordinate={selectedCoordinate} title="Selected Location" />
      )}
    </MapView>
  );
};

export default CustomMapView;
