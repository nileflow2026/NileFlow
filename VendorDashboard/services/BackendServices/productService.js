import vendorAxiosClient from "../api/vendorAxiosClient";

export const productService = {
  createProduct: async (productData) => {
    try {
      const response = await vendorAxiosClient.post(
        "/api/vendor/products/addproduct",
        productData
        // No need for headers - vendorAxiosClient already has withCredentials: true
      );

      return response.data;
    } catch (error) {
      console.error("Create product service error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to create product"
      );
    }
  },

  getProducts: async () => {
    try {
      const response = await vendorAxiosClient.get(
        "/api/vendor/products/vendorproducts"
        // No need for headers - vendorAxiosClient already has withCredentials: true
      );

      return response.data;
    } catch (error) {
      console.error("Get products service error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch products"
      );
    }
  },

  // productService.js - Direct Appwrite upload
  uploadProductImages: async (productId, images) => {
    try {
      console.log("Uploading", images.length, "images...");

      // Upload each image
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("productId", productId);

        const response = await vendorAxiosClient.post(
          "/api/vendor/products/product/upload-direct",
          formData
          // No need for headers - vendorAxiosClient handles FormData automatically
        );
        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Upload images service error:", error);
      throw new Error(error.response?.data?.error || "Failed to upload images");
    }
  },

  uploadDirect: async ({ base64, fileName }) => {
    try {
      const res = await vendorAxiosClient.post(
        "/api/vendor/products/upload-image",
        { base64, fileName }
        // No need for headers - vendorAxiosClient already has Content-Type: application/json
      );

      return {
        success: true,
        fileId: res.data.fileId,
        imageUrl: res.data.imageUrl,
      };
    } catch (error) {
      console.error(
        "UploadDirect Error:",
        error.response?.data || error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to upload image directly",
      };
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await vendorAxiosClient.patch(
        `/api/vendor/products/product/${productId}`,
        productData
      );

      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update product"
      );
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await vendorAxiosClient.delete(
        `/api/vendor/products/product/${productId}`
      );

      return response.data;
    } catch (error) {
      console.error("Delete product error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to delete product"
      );
    }
  },

  // Add these new methods
  getCategories: async () => {
    try {
      const response = await vendorAxiosClient.get(
        "/api/customerprofile/categories"
      );
      console.log("Categories fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Get categories error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch categories",
      };
    }
  },

  getSubcategories: async (categoryId) => {
    try {
      const response = await vendorAxiosClient.get(
        `/api/products/categories/${categoryId}/subcategories`
      );
      console.log("Subcategories fetched:", response.data);

      // Extract just the subcategories array from the response
      const subcategoriesArray = response.data.subcategories || [];

      return {
        success: true,
        data: subcategoriesArray,
      };
    } catch (error) {
      console.error("Get subcategories error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch subcategories",
        data: [], // Return empty array on error
      };
    }
  },
};

/* export const productService = {
  createProduct: async (productData) => {
    try {
      const token = localStorage.getItem("vendor_token");

      const response = await axios.post(
        `${API_BASE_URL}/api/vendor/products/addproduct`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Create product service error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to create product"
      );
    }
  },

  getProducts: async () => {
    try {
      const token = localStorage.getItem("vendor_token");

      const response = await axios.get(
        `${API_BASE_URL}/api/vendor/products/vendorproducts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get products service error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to fetch products"
      );
    }
  },

  // productService.js - Direct Appwrite upload
  uploadProductImages: async (productId, images) => {
    try {
      const token = localStorage.getItem("vendor_token");

      console.log("Uploading", images.length, "images directly to Appwrite...");

      // Upload each image directly
      const uploadPromises = images.map(async (image) => {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("productId", productId);

        const response = await axios.post(
          `${API_BASE_URL}/api/vendor/products/product/upload-direct'`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Upload images service error:", error);
      throw new Error(error.response?.data?.error || "Failed to upload images");
    }
  },

  uploadDirect: async ({ base64, fileName }) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/vendor/products/upload-image`,
        { base64, fileName },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        fileId: res.data.fileId,
        imageUrl: res.data.imageUrl,
      };
    } catch (error) {
      console.error(
        "UploadDirect Error:",
        error.response?.data || error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to upload image directly",
      };
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendor/products/product/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(productData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      return data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },

  // Delete product - MAKE SURE THIS IS INCLUDED
  deleteProduct: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vendor/products/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product");
      }
      return data;
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },
}; */
