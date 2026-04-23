/* eslint-disable no-unused-vars */

import { useState, useCallback } from "react";

import { useDropzone } from "react-dropzone";
import { Storage, ID } from "appwrite";
import axiosClient from "../../api";
import { client, Config } from "../../appwrite";
import { useEffect } from "react";

const storage = new Storage(client);

export default function ProductForm({ product, onProductAdded, onCancel }) {
  // detect editing mode
  const isEditing = Boolean(product && product.$id);
  const [form, setForm] = useState({
    productName: "",
    type: "",
    description: "",
    price: "",
    discountPrice: "", // sale price
    brand: "",
    details: "",
    currency: "KES",
    category: "",
    subcategoryId: "",
    image: "",
    images: [],
    specifications: [""],
    colors: [],
    sizes: [], // array of size options
    sku: "", // stock keeping unit
    weight: "", // weight in kg
    dimensions: { length: "", width: "", height: "" }, // L x W x H
    tags: [], // searchable tags
    metaDescription: "", // SEO meta
    warranty: "", // warranty period
    careInstructions: "", // usage/care
    stock: "",
    visibility: "visible", // visible/hidden/draft
  });
  const [categories, setCategories] = useState([]); // State to hold categories
  const [subcategories, setSubcategories] = useState([]); // 👈 New state for subcategories
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get(
          "/api/customerprofile/categories",
        ); // Replace with your categories endpoint
        const cats = response.data;
        setCategories(Array.isArray(cats) ? cats : []);
        console.log("Fetched categories:", cats);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);
  // populate form when editing
  useEffect(() => {
    if (isEditing) {
      // build normalized initial state from product object
      const normalizeCategory = () => {
        if (!product.category) return "";
        if (Array.isArray(product.category)) {
          const first = product.category[0];
          if (typeof first === "object" && first.$id) return first.$id;
          return first;
        }
        if (typeof product.category === "object" && product.category.$id) {
          return product.category.$id;
        }
        return product.category;
      };
      setForm({
        productName: product.productName || "",
        type: product.type || "",
        description: product.description || "",
        price: product.price || "",
        discountPrice: product.discountPrice || "",
        brand: product.brand || "",
        details: product.details || "",
        currency: product.currency || "KES",
        category: normalizeCategory(),
        subcategoryId: product.subcategoryId || "",
        image: product.image || "",
        images: product.images || [],
        specifications: product.specifications || [""],
        colors: (() => {
          const c = product.colors;
          if (!c) return [];
          if (Array.isArray(c)) return c;
          try {
            return JSON.parse(c);
          } catch {
            return [];
          }
        })(),
        sizes: (() => {
          const s = product.sizes;
          if (!s) return [];
          if (Array.isArray(s)) return s;
          try {
            return JSON.parse(s);
          } catch {
            return [];
          }
        })(),
        sku: product.sku || "",
        weight: product.weight || "",
        dimensions: Array.isArray(product.dimensions)
          ? {
              length: product.dimensions[0] ?? "",
              width: product.dimensions[1] ?? "",
              height: product.dimensions[2] ?? "",
            }
          : product.dimensions && typeof product.dimensions === "object"
            ? {
                length: product.dimensions.length ?? "",
                width: product.dimensions.width ?? "",
                height: product.dimensions.height ?? "",
              }
            : { length: "", width: "", height: "" },
        tags: product.tags || [],
        metaDescription: product.metaDescription || "",
        warranty: product.warranty || "",
        careInstructions: product.careInstructions || "",
        stock: product.stock || "",
        visibility: product.visibility || "visible",
      });
    }
  }, [product, isEditing]);
  useEffect(() => {
    if (form.category) {
      const fetchSubcategories = async () => {
        try {
          const response = await axiosClient.get(
            `/api/products/categories/${form.category}/subcategories`, // Use your correct endpoint
          );
          // Assuming your backend returns an object like { subcategories: [...] }
          const subs = response.data?.subcategories;
          setSubcategories(Array.isArray(subs) ? subs : []);
        } catch (error) {
          console.error("Failed to fetch subcategories:", error);
          setSubcategories([]); // Clear subcategories on error or if none exist
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]); // Clear subcategories if no category is selected
    }
  }, [form.category]); // 👈 This effect runs whenever the 'category' state changes

  const onDropPrimaryImage = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploading(true);
        const file = acceptedFiles[0];

        // Convert webp to png if needed
        let uploadFile = file;
        if (file.type === "image/webp") {
          try {
            uploadFile = await convertImageToJPGorPNG(file, "image/png");
          } catch (err) {
            console.error("Image conversion failed", err);
            alert("Failed to convert webp image.");
            setUploading(false);
            return;
          }
        }

        try {
          const uploadedFile = await storage.createFile(
            Config.StorageId,
            ID.unique(),
            uploadFile,
          );
          const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${Config.StorageId}/files/${uploadedFile.$id}/view?project=${Config.projectId}`; // Update with your actual endpoint and project ID
          setForm({ ...form, image: imageUrl });
        } catch (err) {
          alert("Failed to upload primary image.");
          console.error(err);
        } finally {
          setUploading(false);
        }
      }
    },
    [form],
  );

  const onDropAdditionalImages = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const uploadedUrls = [...form.images];

      for (const file of acceptedFiles) {
        let convertedFile = file;
        if (file.type === "image/webp") {
          try {
            convertedFile = await convertImageToJPGorPNG(file, "image/png");
          } catch (err) {
            console.error("Image conversion failed", err);
            alert(`Failed to convert file: ${file.name}`);
            continue; // skip this file
          }
        }
        try {
          const uploadedFile = await storage.createFile(
            Config.StorageId,
            ID.unique(),
            convertedFile,
          );
          const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${Config.StorageId}/files/${uploadedFile.$id}/view?project=${Config.projectId}`; // Update with your actual endpoint and project ID
          uploadedUrls.push(imageUrl);
        } catch (err) {
          alert(`Failed to upload file: ${file.name}`);
          console.error(err);
        }
      }

      setForm({ ...form, images: uploadedUrls });
      setUploading(false);
    },
    [form],
  );

  const {
    getRootProps: getPrimaryRootProps,
    getInputProps: getPrimaryInputProps,
  } = useDropzone({
    onDrop: onDropPrimaryImage,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
  });

  const {
    getRootProps: getAdditionalRootProps,
    getInputProps: getAdditionalInputProps,
  } = useDropzone({
    onDrop: onDropAdditionalImages,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    console.log(`Setting form.${name} to:`, value);
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...form[field]];
    newArray[index] = e.target.value;
    setForm({ ...form, [field]: newArray });
  };

  const handleDimensionChange = (e, dimension) => {
    const { value } = e.target;
    setForm({
      ...form,
      dimensions: {
        ...form.dimensions,
        [dimension]: value,
      },
    });
  };

  const addField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (uploading) {
        alert("Please wait for images to finish uploading.");
        return;
      }

      // ✅ Remove 'id' and '$id' from the form data before sending to the backend.
      const { id, $id, ...productData } = form;

      // ✅ Convert numeric fields to numbers, stringify arrays, and format dimensions for proper backend validation
      const cleanedData = {
        ...productData,
        price: productData.price ? parseFloat(productData.price) : 0,
        discountPrice: productData.discountPrice
          ? parseFloat(productData.discountPrice)
          : null,
        stock: productData.stock ? parseFloat(productData.stock) : 0,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        dimensions: productData.dimensions
          ? [
              String(productData.dimensions.length || ""),
              String(productData.dimensions.width || ""),
              String(productData.dimensions.height || ""),
            ]
          : ["", "", ""],
        colors: Array.isArray(productData.colors)
          ? JSON.stringify(productData.colors)
          : typeof productData.colors === "string"
            ? productData.colors
            : "[]",
        sizes: Array.isArray(productData.sizes)
          ? JSON.stringify(productData.sizes)
          : typeof productData.sizes === "string"
            ? productData.sizes
            : "[]",
        specifications: Array.isArray(productData.specifications)
          ? productData.specifications
          : typeof productData.specifications === "string"
            ? JSON.parse(productData.specifications)
            : [],
        tags: Array.isArray(productData.tags)
          ? productData.tags
          : typeof productData.tags === "string"
            ? JSON.parse(productData.tags)
            : [],
        images: Array.isArray(productData.images)
          ? productData.images
          : typeof productData.images === "string"
            ? JSON.parse(productData.images)
            : [],
      };

      if (isEditing) {
        // send PUT request with productId and updates
        await axiosClient.put("/api/admin/products/updateproducts", {
          productId: product.$id,
          ...cleanedData,
        });
        alert("Product updated!");
      } else {
        await axiosClient.post(
          "/api/admin/addproducts/addproducts",
          cleanedData,
        );
        alert("Product added!");
      }

      if (onProductAdded) {
        onProductAdded();
      }

      if (!isEditing) {
        setForm({
          productName: "",
          type: "",
          description: "",
          price: "",
          discountPrice: "",
          brand: "",
          details: "",
          currency: "KES",
          category: "",
          subcategoryId: "",
          image: "",
          images: [],
          specifications: [""],
          colors: [],
          sizes: [],
          sku: "",
          weight: "",
          dimensions: { length: "", width: "", height: "" },
          tags: [],
          metaDescription: "",
          warranty: "",
          careInstructions: "",
          stock: "",
          visibility: "visible",
        });
      }

      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const convertImageToJPGorPNG = (file, format = "image/png") => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Conversion failed"));
              // Create a new File object with the same name but new extension
              const newFile = new File(
                [blob],
                file.name.replace(
                  /\.\w+$/,
                  format === "image/png" ? ".png" : ".jpg",
                ),
                { type: format },
              );
              resolve(newFile);
            },
            format,
            0.9, // quality (0-1) for JPEG
          );
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-4"
    >
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="productName"
          value={form.productName}
          onChange={handleChange}
          placeholder="Product Name"
          className="input"
          required
        />
        <input
          type="text"
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Type"
          className="input"
          required
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="input"
          required
        />
        <input
          type="number"
          name="discountPrice"
          value={form.discountPrice}
          onChange={handleChange}
          placeholder="Sale Price (optional)"
          className="input"
        />
        <input
          type="text"
          name="currency"
          value={form.currency}
          onChange={handleChange}
          placeholder="Currency"
          className="input"
          required
        />
        {/*  <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="Category" className="input" required /> */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          {/* 👇 Add this new Subcategory Select field */}
          {subcategories.length > 0 && (
            <div>
              <label
                htmlFor="subcategoryId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Subcategory
              </label>
              <select
                id="subcategoryId"
                name="subcategoryId"
                value={form.subcategoryId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>
                  Select a subcategory
                </option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.$id} value={subcategory.$id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock Quantity"
          className="input"
        />
        <input
          type="text"
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="input"
        />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="input w-full"
      />
      <textarea
        name="details"
        value={form.details}
        onChange={handleChange}
        placeholder="Details"
        className="input w-full"
      />

      {/* Primary Image Dropzone */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Primary Product Image
        </label>
        <div {...getPrimaryRootProps()} className="dropzone-container">
          <input {...getPrimaryInputProps()} />
          <p className="text-gray-500">
            Drag 'n' drop a primary image here, or click to select one
          </p>
        </div>
        {uploading && (
          <p className="text-blue-500">Uploading primary image...</p>
        )}
        {form.image && (
          <div className="mt-2 relative">
            <p className="text-gray-500">Primary Image Preview:</p>
            <img
              src={form.image}
              alt="Primary"
              className="w-32 h-32 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, image: "" })}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              title="Remove image"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Additional Images Dropzone */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Additional Product Images
        </label>
        <div {...getAdditionalRootProps()} className="dropzone-container">
          <input {...getAdditionalInputProps()} />
          <p className="text-gray-500">
            Drag 'n' drop more images here, or click to select files
          </p>
        </div>
        {uploading && (
          <p className="text-blue-500">Uploading additional images...</p>
        )}
        {form.images.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {form.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Additional ${index}`}
                  className="w-24 h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = [...form.images];
                    newImages.splice(index, 1);
                    setForm({ ...form, images: newImages });
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Specifications
        </label>
        {form.specifications.map((spec, idx) => (
          <input
            key={idx}
            type="text"
            value={spec}
            onChange={(e) => handleArrayChange(e, idx, "specifications")}
            placeholder={`Specification ${idx + 1}`}
            className="input mb-2 w-full"
          />
        ))}
        <button
          type="button"
          onClick={() => addField("specifications")}
          className="btn-secondary"
        >
          + Add Specification
        </button>
      </div>

      {/* Colors Section */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Available Colors
        </label>
        {form.colors.map((color, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="text"
              value={color}
              onChange={(e) => handleArrayChange(e, idx, "colors")}
              placeholder={`Color ${idx + 1}`}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const newCols = [...form.colors];
                newCols.splice(idx, 1);
                setForm({ ...form, colors: newCols });
              }}
              className="ml-2 text-red-500 hover:text-red-700"
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField("colors")}
          className="btn-secondary"
        >
          + Add Color
        </button>
      </div>

      {/* Sizes Section */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Available Sizes
        </label>
        {form.sizes.map((size, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="text"
              value={size}
              onChange={(e) => handleArrayChange(e, idx, "sizes")}
              placeholder={`Size ${idx + 1} (e.g., S, M, L, XL or 32, 34, 36)`}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const newSizes = [...form.sizes];
                newSizes.splice(idx, 1);
                setForm({ ...form, sizes: newSizes });
              }}
              className="ml-2 text-red-500 hover:text-red-700"
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField("sizes")}
          className="btn-secondary"
        >
          + Add Size
        </button>
      </div>

      {/* Tags Section */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Search Tags (for SEO)
        </label>
        {form.tags.map((tag, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <input
              type="text"
              value={tag}
              onChange={(e) => handleArrayChange(e, idx, "tags")}
              placeholder={`Tag ${idx + 1}`}
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => {
                const newTags = [...form.tags];
                newTags.splice(idx, 1);
                setForm({ ...form, tags: newTags });
              }}
              className="ml-2 text-red-500 hover:text-red-700"
              title="Remove"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField("tags")}
          className="btn-secondary"
        >
          + Add Tag
        </button>
      </div>

      {/* Pricing and Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="SKU (Stock Keeping Unit)"
          className="input"
        />
        <input
          type="number"
          name="weight"
          value={form.weight}
          onChange={handleChange}
          placeholder="Weight (kg)"
          className="input"
        />
        <input
          type="text"
          name="warranty"
          value={form.warranty}
          onChange={handleChange}
          placeholder="Warranty (e.g., 1 Year)"
          className="input"
        />
      </div>

      {/* Dimensions */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Dimensions (cm)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Length"
            value={form.dimensions.length}
            onChange={(e) => handleDimensionChange(e, "length")}
            className="input"
          />
          <input
            type="number"
            placeholder="Width"
            value={form.dimensions.width}
            onChange={(e) => handleDimensionChange(e, "width")}
            className="input"
          />
          <input
            type="number"
            placeholder="Height"
            value={form.dimensions.height}
            onChange={(e) => handleDimensionChange(e, "height")}
            className="input"
          />
        </div>
      </div>

      {/* Care Instructions & SEO */}
      <textarea
        name="careInstructions"
        value={form.careInstructions}
        onChange={handleChange}
        placeholder="Care Instructions / Usage Notes"
        className="input w-full"
        rows="3"
      />

      <textarea
        name="metaDescription"
        value={form.metaDescription}
        onChange={handleChange}
        placeholder="Meta Description (for SEO - 160 chars)"
        className="input w-full"
        rows="2"
      />

      {/* Visibility */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
          Product Visibility
        </label>
        <select
          name="visibility"
          value={form.visibility}
          onChange={handleChange}
          className="w-full px-4 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
        >
          <option value="visible">Visible (Published)</option>
          <option value="hidden">Hidden (Draft)</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded shadow-md"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md"
        >
          {isEditing ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
