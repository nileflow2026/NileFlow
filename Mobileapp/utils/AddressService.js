import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api';



const AddressService = {


    getAddresses: async () => {
    try { 
        const token = await AsyncStorage.getItem('accessToken');
        const response = await axiosClient.get('/api/nilemart/addresses', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        return response.documents;
    } catch (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }
},

  // Add a new address
  addAddress: async (newAddressData) => {
    try {
      const response = await axiosClient.post('/api/nilemart/add/addresses', newAddressData);
      return response.data;
    } catch (error) {
      console.error("Error adding address:", error);
      return null;
    }
  },

  // Update an existing address
  updateAddress: async (addressId, updatedData) => {
    try {
      const response = await axiosClient.put(`api/nilemart/addresses/:addressId${addressId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      return null;
    }
  },

  // Delete an address
  deleteAddress: async (addressId) => {
    try {
      await axiosClient.delete(`api/nilemart/addresses/:addressId/${addressId}`);
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  },
};
export default AddressService;
