import axiosClient from "../axiosClient";

const AddressService = {
  /**
   * Fetch all saved addresses for a user.
   * @param {string} _userId - Not used server-side (token identifies user).
   * @returns {Promise<Array>}
   */
  async getAddresses() {
    try {
      const { data } = await axiosClient.get("/api/addresses");
      return Array.isArray(data) ? data : (data?.addresses ?? []);
    } catch {
      return [];
    }
  },

  /**
   * Add a new address for the authenticated user.
   * @param {string} _userId - Not used server-side.
   * @param {object} addressData
   */
  async addAddress(addressData) {
    const { data } = await axiosClient.post("/api/add/address", addressData);
    return data;
  },

  /**
   * Update an existing address.
   * @param {string} addressId
   * @param {object} addressData
   */
  async updateAddress(addressId, addressData) {
    const { data } = await axiosClient.put(
      `/api/addresses/${addressId}`,
      addressData,
    );
    return data;
  },

  /**
   * Delete an address by ID.
   * @param {string} addressId
   * @returns {Promise<boolean>}
   */
  async deleteAddress(addressId) {
    try {
      await axiosClient.delete(`/api/addresses/${addressId}`);
      return true;
    } catch {
      return false;
    }
  },
};

export default AddressService;
