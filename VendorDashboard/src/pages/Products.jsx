/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Products.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { productService } from "../../services/BackendServices/productService";
import { useDropzone } from "react-dropzone";
import { Config, ID, storage } from "../../services/appwrite";
import SEOPanel from "../components/SEOPanel";
import { generateSlug, generateAltText, generateImageFilename } from "../utils/seoService";
import { optimizeProductImage, getImageAltText, needsCompression } from "../utils/imageOptimizer";

const Products = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]); // Add this state
  const [subcategories, setSubcategories] = useState([]); // Add for subcategories
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    shortDescription: "",
    description: "",
    brand: "",
    sku: "",
    barcode: "",
    type: "physical",
    condition: "new",
    // Organization
    categoryId: "",
    subcategoryId: "",
    tags: "",
    // Pricing
    price: "",
    compareAtPrice: "",
    costPerItem: "",
    currency: "KES",
    taxable: true,
    // Inventory
    inventory: "",
    lowStockThreshold: "5",
    trackInventory: true,
    allowBackorders: false,
    // Shipping
    weight: "",
    weightUnit: "kg",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    freeShipping: false,
    shippingClass: "standard",
    deliveryEstimate: "",
    // Variants / Attributes
    color: "",
    size: "",
    material: "",
    customAttribute1Key: "",
    customAttribute1Value: "",
    customAttribute2Key: "",
    customAttribute2Value: "",
    // SEO
    seoTitle: "",
    seoDescription: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    // Images
    image: "",
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  // Add these states to your component
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    categoryId: "", // Change from 'category' to 'categoryId'
    subcategoryId: "", // Add this for subcategory
    price: 0,
    category: "",
    inventory: 0,
    tags: [],
    image: "",
    images: [],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add these states to your component
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Add these states to your component
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // You can make this configurable

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Fetch categories when modal opens
  useEffect(() => {
    if (showAddModal) {
      fetchCategories();
    }
  }, [showAddModal]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
      console.log("Categories fetched:", response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setMessage({
        type: "error",
        text: "Failed to load categories. Please refresh.",
      });
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const response = await productService.getSubcategories(categoryId);
      if (response.success) {
        setSubcategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
    }
  };

  // Generate page numbers for pagination (optional - for advanced pagination)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxPagesToShow / 2),
      );
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Add this function to handle edit button click
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      category: product.category || "",
      inventory: product.inventory || 0,
      tags: product.tags || [],
      image: product.image || "",
      images: product.images || [],
    });
    setShowEditModal(true);
  };

  // Add the update product function
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (uploading) {
        setMessage({
          type: "error",
          text: "Please wait for images to finish uploading.",
        });
        setIsLoading(false);
        return;
      }

      const productData = {
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        price: parseFloat(editFormData.price) || 0,
        category: editFormData.category,
        inventory: parseInt(editFormData.inventory) || 0,
        tags: Array.isArray(editFormData.tags)
          ? editFormData.tags
          : editFormData.tags.split(",").map((tag) => tag.trim()),
        image: editFormData.image,
        images: editFormData.images,
      };

      // Validation
      if (!productData.name || !productData.price || !productData.category) {
        setMessage({
          type: "error",
          text: "Name, price, and category are required",
        });
        setIsLoading(false);
        return;
      }

      console.log("Updating product with data:", productData);

      const response = await productService.updateProduct(
        editingProduct.$id,
        productData,
      );

      if (response.success) {
        setMessage({ type: "success", text: "Product updated successfully!" });
        setShowEditModal(false);
        setEditingProduct(null);
        loadProducts(); // Refresh the products list
      }
    } catch (error) {
      console.error("Update product error:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Add handleEditInputChange function
  const handleEditInputChange = (e) => {
    const { name, value, type } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  };

  // Add this function to handle delete button click
  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  // Add the delete product function
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    setDeleteLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await productService.deleteProduct(deletingProduct.$id);

      if (response.success) {
        setMessage({ type: "success", text: "Product deleted successfully!" });
        setShowDeleteModal(false);
        setDeletingProduct(null);
        loadProducts(); // Refresh the products list
      }
    } catch (error) {
      console.error("Delete product error:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add cancel delete function
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  // Add edit image handlers (similar to the add modal)
  const onDropEditPrimaryImage = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploading(true);
      const file = acceptedFiles[0];

      let uploadFile = file;
      if (file.type === "image/webp") {
        try {
          uploadFile = await convertImageToJPGorPNG(file, "image/png");
        } catch (err) {
          console.error("Image conversion failed", err);
          setMessage({ type: "error", text: "Failed to convert webp image." });
          setUploading(false);
          return;
        }
      }

      try {
        const uploadedFile = await storage.createFile(
          Config.bucketId, // Your bucket ID
          ID.unique(),
          uploadFile,
        );
        const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${Config.bucketId}/files/${uploadedFile.$id}/view?project=679073fc0012a72c14ab`;
        setEditFormData((prev) => ({ ...prev, image: imageUrl }));
        setMessage({
          type: "success",
          text: "Primary image uploaded successfully!",
        });
      } catch (err) {
        setMessage({ type: "error", text: "Failed to upload primary image." });
        console.error(err);
      } finally {
        setUploading(false);
      }
    }
  }, []);

  const onDropEditAdditionalImages = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const currentImages = [...editFormData.images];

      for (const file of acceptedFiles) {
        let convertedFile = file;
        if (file.type === "image/webp") {
          try {
            convertedFile = await convertImageToJPGorPNG(file, "image/png");
          } catch (err) {
            console.error("Image conversion failed", err);
            setMessage({
              type: "error",
              text: `Failed to convert file: ${file.name}`,
            });
            continue;
          }
        }

        try {
          const uploadedFile = await storage.createFile(
            Config.bucketId, // Your bucket ID
            ID.unique(),
            convertedFile,
          );
          const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${Config.bucketId}/files/${uploadedFile.$id}/view?project=679073fc0012a72c14ab`;
          currentImages.push(imageUrl);
        } catch (err) {
          setMessage({
            type: "error",
            text: `Failed to upload file: ${file.name}`,
          });
          console.error(err);
        }
      }

      setEditFormData((prev) => ({ ...prev, images: currentImages }));
      setUploading(false);
    },
    [editFormData.images],
  );

  // Edit dropzone configurations
  const {
    getRootProps: getEditPrimaryRootProps,
    getInputProps: getEditPrimaryInputProps,
    isDragActive: isEditPrimaryDragActive,
  } = useDropzone({
    onDrop: onDropEditPrimaryImage,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
  });

  const {
    getRootProps: getEditAdditionalRootProps,
    getInputProps: getEditAdditionalInputProps,
    isDragActive: isEditAdditionalDragActive,
  } = useDropzone({
    onDrop: onDropEditAdditionalImages,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
  });

  // Edit image removal functions
  const removeEditPrimaryImage = () => {
    setEditFormData((prev) => ({ ...prev, image: "" }));
  };

  const removeEditAdditionalImage = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Image conversion function (add this inside your component)
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
            0.9,
          );
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Primary image dropzone
  const onDropPrimaryImage = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploading(true);
      const file = acceptedFiles[0];

      try {
        // Compress + rename with SEO-optimised filename (handles WebP conversion too)
        const uploadFile = await optimizeProductImage(file, formData.name || "product", 0);

        const uploadedFile = await storage.createFile(
          Config.bucketId,
          ID.unique(),
          uploadFile,
        );
        const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${Config.bucketId}/files/${uploadedFile.$id}/view?project=${Config.projectId}`;
        const altText = getImageAltText(formData.name, formData.brand);
        setFormData((prev) => ({ ...prev, image: imageUrl, imageAlt: altText }));
        setMessage({
          type: "success",
          text: `Primary image uploaded${needsCompression(file) ? " (compressed)" : ""}!`,
        });
      } catch (err) {
        setMessage({ type: "error", text: "Failed to upload primary image." });
        console.error(err);
      } finally {
        setUploading(false);
      }
    }
  }, []);

  // Additional images dropzone
  const onDropAdditionalImages = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const currentImages = [...formData.images];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const imageIndex = currentImages.length + 1; // 1-based additional index
        try {
          const convertedFile = await optimizeProductImage(
            file,
            formData.name || "product",
            imageIndex,
          );
          const uploadedFile = await storage.createFile(
            Config.bucketId,
            ID.unique(),
            convertedFile,
          );
          const imageUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${Config.bucketId}/files/${uploadedFile.$id}/view?project=${Config.projectId}`;
          currentImages.push(imageUrl);
        } catch (err) {
          setMessage({
            type: "error",
            text: `Failed to upload file: ${file.name}`,
          });
          console.error(err);
        }
      }

      setFormData((prev) => ({ ...prev, images: currentImages }));
      setUploading(false);
    },
    [formData.images],
  );

  // Dropzone configurations
  const {
    getRootProps: getPrimaryRootProps,
    getInputProps: getPrimaryInputProps,
    isDragActive: isPrimaryDragActive,
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
    isDragActive: isAdditionalDragActive,
  } = useDropzone({
    onDrop: onDropAdditionalImages,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
  });

  // Remove image functions
  const removePrimaryImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const removeAdditionalImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProducts();
      if (response.success) {
        setProducts(response.data.products || []);

        // If products have category IDs, fetch category names
        const uniqueCategoryIds = [
          ...new Set(
            response.data.products
              .map((p) => p.category)
              .filter((id) => id && id !== ""),
          ),
        ];

        // If we have categories in state, no need to fetch
        if (uniqueCategoryIds.length > 0 && categories.length === 0) {
          await fetchCategories();
        }
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If category changes, fetch subcategories
    if (name === "categoryId") {
      fetchSubcategories(value);
      setFormData((prev) => ({ ...prev, subcategoryId: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : parseFloat(value)
            : value,
    }));
  };

  /**
   * Fuzzy-match helper: returns true if every word in the query appears
   * somewhere in the haystack (substring match, case-insensitive).
   * Falls back to a simple single-token contains check for short queries.
   */
  const fuzzyMatch = useCallback((haystack = "", query = "") => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const h = haystack.toLowerCase();
    // Multi-word: all tokens must be present
    const tokens = q.split(/\s+/);
    return tokens.every((token) => h.includes(token));
  }, []);

  // Replace your current filteredProducts with this comprehensive filtering
  const filteredProducts = useMemo(() => products.filter((product) => {
    // Enhanced fuzzy search — checks name, SKU, brand, tags, description
    const searchable = [
      product.name || "",
      product.sku || "",
      product.brand || "",
      Array.isArray(product.tags) ? product.tags.join(" ") : product.tags || "",
      product.shortDescription || "",
      product.description || "",
    ].join(" ");

    const matchesSearch = !searchTerm || fuzzyMatch(searchable, searchTerm);

    // Category filter - now comparing IDs
    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory; // This now compares IDs

    // Stock filter
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && product.inventory > 0) ||
      (stockFilter === "out-of-stock" && product.inventory === 0) ||
      (stockFilter === "low-stock" &&
        product.inventory > 0 &&
        product.inventory <= 20);

    // Price filter
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "under-25" && product.price < 25) ||
      (priceFilter === "25-50" && product.price >= 25 && product.price <= 50) ||
      (priceFilter === "50-100" &&
        product.price > 50 &&
        product.price <= 100) ||
      (priceFilter === "over-100" && product.price > 100);

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  }), [products, searchTerm, selectedCategory, stockFilter, priceFilter, fuzzyMatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Out of Stock":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };

  const formatPrice = (price) => {
    return `KES ${parseFloat(price).toFixed(2)}`;
  };

  const getStockStatus = (inventory) => {
    if (inventory > 20) return "Active";
    if (inventory > 0) return "Low Stock";
    return "Out of Stock";
  };

  // Add this function inside your component
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";

    const category = categories.find(
      (cat) => cat.$id === categoryId || cat.id === categoryId,
    );
    return category ? category.name : categoryId; // Fallback to ID if name not found
  };

  /** Apply auto-generated SEO values from SEOPanel into the form */
  const handleApplyAutoFill = ({ seoTitle, seoDescription, slug, keywords }) => {
    setFormData((prev) => ({
      ...prev,
      seoTitle: seoTitle || prev.seoTitle,
      seoDescription: seoDescription || prev.seoDescription,
      slug: slug || prev.slug,
      metaTitle: seoTitle || prev.metaTitle,
      metaDescription: seoDescription || prev.metaDescription,
      keywords:
        Array.isArray(keywords) && keywords.length > 0
          ? keywords.join(", ")
          : prev.keywords,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (uploading) {
        setMessage({
          type: "error",
          text: "Please wait for images to finish uploading.",
        });
        setIsLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.price || !formData.categoryId) {
        setMessage({
          type: "error",
          text: "Name, price, and category are required",
        });
        setIsLoading(false);
        return;
      }

      const productData = {
        // Basic Info
        name: formData.name.trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim(),
        type: formData.type,
        condition: formData.condition,
        // Organization
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || "",
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        // Pricing
        price: parseFloat(formData.price) || 0,
        compareAtPrice: parseFloat(formData.compareAtPrice) || 0,
        costPerItem: parseFloat(formData.costPerItem) || 0,
        currency: formData.currency,
        taxable: formData.taxable,
        // Inventory
        inventory: parseInt(formData.inventory) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        trackInventory: formData.trackInventory,
        allowBackorders: formData.allowBackorders,
        // Shipping
        weight: parseFloat(formData.weight) || 0,
        weightUnit: formData.weightUnit,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        dimensionUnit: formData.dimensionUnit,
        freeShipping: formData.freeShipping,
        shippingClass: formData.shippingClass,
        deliveryEstimate: formData.deliveryEstimate.trim(),
        // Attributes / Variants
        attributes: {
          ...(formData.color && { color: formData.color }),
          ...(formData.size && { size: formData.size }),
          ...(formData.material && { material: formData.material }),
          ...(formData.customAttribute1Key &&
            formData.customAttribute1Value && {
              [formData.customAttribute1Key]: formData.customAttribute1Value,
            }),
          ...(formData.customAttribute2Key &&
            formData.customAttribute2Value && {
              [formData.customAttribute2Key]: formData.customAttribute2Value,
            }),
        },
        specifications: {},
        // SEO — enriched fields for public storefront use
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        metaTitle: formData.metaTitle.trim() || formData.seoTitle.trim() || formData.name.trim(),
        metaDescription: formData.metaDescription.trim() || formData.seoDescription.trim(),
        keywords: formData.keywords
          ? formData.keywords.split(",").map((k) => k.trim()).filter(Boolean)
          : [],
        // Images
        image: formData.image,
        imageAlt: formData.imageAlt || generateAltText({ name: formData.name, brand: formData.brand }),
        images: formData.images,
      };

      console.log("Creating product with data:", productData);

      // Create product
      const response = await productService.createProduct(productData);

      if (response.success) {
        setMessage({
          type: "success",
          text: response.data.addedToMainStore
            ? "Product created and added to store!"
            : "Product created (but not added to main store - check logs)",
        });

        // Reset form
        setFormData({
          name: "",
          shortDescription: "",
          description: "",
          brand: "",
          sku: "",
          barcode: "",
          type: "physical",
          condition: "new",
          categoryId: "",
          subcategoryId: "",
          tags: "",
          price: "",
          compareAtPrice: "",
          costPerItem: "",
          currency: "KES",
          taxable: true,
          inventory: "",
          lowStockThreshold: "5",
          trackInventory: true,
          allowBackorders: false,
          weight: "",
          weightUnit: "kg",
          length: "",
          width: "",
          height: "",
          dimensionUnit: "cm",
          freeShipping: false,
          shippingClass: "standard",
          deliveryEstimate: "",
          color: "",
          size: "",
          material: "",
          customAttribute1Key: "",
          customAttribute1Value: "",
          customAttribute2Key: "",
          customAttribute2Value: "",
          seoTitle: "",
          seoDescription: "",
          slug: "",
          metaTitle: "",
          metaDescription: "",
          keywords: "",
          image: "",
          images: [],
        });
        setSubcategories([]);
        setShowAddModal(false);
        loadProducts();
      }
    } catch (error) {
      console.error("Create product error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to create product. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  // Get current products for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Products</h1>
          <p className="text-amber-600 font-medium">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add Product</span>
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search and Filter Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-200 mb-8 overflow-hidden">
        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>
            <div className="flex space-x-3">
              {/* <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium text-amber-900"
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Fashion</option>
                <option>Home & Living</option>
              </select> */}

              {/* With this dynamic version: */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm transition-all duration-300 font-medium text-amber-900"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={category.$id || category.id}
                    value={category.$id || category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-50 transition-all duration-300 flex items-center space-x-2 text-amber-700 font-medium"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
          {/* Advanced Filters Dropdown */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white border border-amber-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Stock Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Stock Status
                  </label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="all">All Stock</option>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-25">Under KES 25</option>
                    <option value="25-50">KES 25 - KES 50</option>
                    <option value="50-100">KES 50 - KES 100</option>
                    <option value="over-100">Over KES 100</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStockFilter("all");
                      setPriceFilter("all");
                      setShowFilters(false);
                    }}
                    className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Products Table */}
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-amber-200">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-100">
                  {currentProducts.map((product, index) => (
                    <tr
                      key={product.$id || product.id}
                      className={`hover:bg-amber-50 transition-all duration-300 group ${
                        index % 2 === 0 ? "bg-amber-25" : "bg-white"
                      }`}
                    >
                      {/* Replace the entire image container in your table row with: */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Updated Image Container */}
                          <div
                            className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-4 relative bg-gradient-to-r from-amber-400 to-orange-400 group-hover:scale-110 transition-transform duration-300"
                            style={{ minWidth: "3rem", minHeight: "3rem" }}
                          >
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover absolute inset-0"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                onError={(e) => {
                                  console.error(
                                    `Image failed to load: ${product.name}`,
                                    product.image,
                                  );
                                  e.target.style.display = "none";
                                  // Show fallback
                                  const container = e.target.parentElement;
                                  container.innerHTML = `
              <div class="w-full h-full flex items-center justify-center">
                <span class="text-white font-bold text-lg">
                  ${product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {product.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-bold text-amber-900 group-hover:text-amber-700">
                              {product.name}
                            </div>
                            <div className="text-xs text-amber-500">
                              {product.sku || "No SKU"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          {getCategoryName(product.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-amber-200 rounded-full h-2 mr-3">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                product.inventory > 20
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                  : product.inventory > 0
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                    : "bg-gradient-to-r from-red-500 to-pink-600"
                              }`}
                              style={{
                                width: `${Math.min(
                                  (product.inventory / 50) * 100,
                                  100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              product.inventory > 20
                                ? "text-green-700"
                                : product.inventory > 0
                                  ? "text-amber-700"
                                  : "text-red-700"
                            }`}
                          >
                            {product.inventory}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                            getStockStatus(product.inventory),
                          )}`}
                        >
                          {getStockStatus(product.inventory)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-300 group/action">
                            <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-2 text-amber-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 group/action"
                          >
                            <Edit className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 text-amber-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 group/action"
                          >
                            <Trash2 className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-amber-200 bg-amber-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-amber-600 font-medium">
              Showing {Math.min(filteredProducts.length, indexOfFirstItem + 1)}-
              {Math.min(filteredProducts.length, indexOfLastItem)} of{" "}
              {filteredProducts.length} products
              {filteredProducts.length !== products.length && (
                <span className="text-amber-500">
                  {" "}
                  (filtered from {products.length} total)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-amber-600">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  className="border border-amber-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex space-x-1">
                  {getPageNumbers().map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNumber
                          ? "bg-amber-500 text-white border border-amber-500"
                          : "border border-amber-200 text-amber-700 hover:bg-amber-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-amber-400">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm font-medium"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={
                    currentPage === totalPages || filteredProducts.length === 0
                  }
                  className="px-3 py-1 border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Simple pagination info for mobile */}
          <div className="sm:hidden text-center mt-2">
            <span className="text-sm text-amber-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-amber-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 transition-all duration-300">
          <div className="relative top-8 mx-auto p-6 w-full max-w-5xl pb-16">
            <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900">
                      Add New Product
                    </h3>
                    <p className="text-amber-600 text-sm mt-1">
                      Fill in the details to add a new product to your inventory
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    <span className="text-2xl leading-none">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-8">
                  {/* ── Section 1: Basic Information ── */}
                  <div>
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        1
                      </span>
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. Handwoven Kikoy Beach Wrap"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. AfriCraft"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Condition
                        </label>
                        <select
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          disabled={isLoading}
                        >
                          <option value="new">New</option>
                          <option value="used">Used</option>
                          <option value="refurbished">Refurbished</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          SKU (Stock Keeping Unit)
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. KKW-BLU-001"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Barcode (UPC / EAN / ISBN)
                        </label>
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. 123456789012"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Product Type
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          disabled={isLoading}
                        >
                          <option value="physical">Physical Product</option>
                          <option value="digital">Digital Product</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Tags
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="handmade, african, premium (comma-separated)"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Short Description
                        </label>
                        <input
                          type="text"
                          name="shortDescription"
                          value={formData.shortDescription}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="One-line summary shown on product listings"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Full Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="Detailed product description, features, and benefits..."
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: Organization ── */}
                  <div className="border-t border-amber-100 pt-6">
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        2
                      </span>
                      Organization
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Category *
                        </label>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          disabled={isLoading || categories.length === 0}
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option
                              key={cat.$id || cat.id}
                              value={cat.$id || cat.id}
                            >
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        {categories.length === 0 && !isLoading && (
                          <p className="text-red-500 text-xs mt-1">
                            No categories available. Please contact support.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Subcategory
                        </label>
                        <select
                          name="subcategoryId"
                          value={formData.subcategoryId}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          disabled={
                            isLoading ||
                            !formData.categoryId ||
                            subcategories.length === 0
                          }
                        >
                          <option value="">
                            Select subcategory (optional)
                          </option>
                          {subcategories.map((sub) => (
                            <option
                              key={sub.$id || sub.id}
                              value={sub.$id || sub.id}
                            >
                              {sub.name}
                            </option>
                          ))}
                        </select>
                        {formData.categoryId && subcategories.length === 0 && (
                          <p className="text-amber-500 text-xs mt-1">
                            No subcategories for this category.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Section 3: Pricing ── */}
                  <div className="border-t border-amber-100 pt-6">
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        3
                      </span>
                      Pricing
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Selling Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-semibold text-sm">
                            KES
                          </span>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            step="0.01"
                            min="0"
                            className="w-full border border-amber-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="0.00"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Compare-At Price
                          <span className="ml-1 text-amber-400 font-normal text-xs">
                            (original/crossed-out)
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-semibold text-sm">
                            KES
                          </span>
                          <input
                            type="number"
                            name="compareAtPrice"
                            value={formData.compareAtPrice}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="w-full border border-amber-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="0.00"
                            disabled={isLoading}
                          />
                        </div>
                        {formData.compareAtPrice &&
                          formData.price &&
                          parseFloat(formData.compareAtPrice) >
                            parseFloat(formData.price) && (
                            <p className="text-green-600 text-xs mt-1 font-medium">
                              {Math.round(
                                ((formData.compareAtPrice - formData.price) /
                                  formData.compareAtPrice) *
                                  100,
                              )}
                              % discount
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Cost Per Item
                          <span className="ml-1 text-amber-400 font-normal text-xs">
                            (for profit tracking)
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-semibold text-sm">
                            KES
                          </span>
                          <input
                            type="number"
                            name="costPerItem"
                            value={formData.costPerItem}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="w-full border border-amber-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="0.00"
                            disabled={isLoading}
                          />
                        </div>
                        {formData.costPerItem && formData.price && (
                          <p className="text-blue-600 text-xs mt-1 font-medium">
                            Margin: KES{" "}
                            {(
                              parseFloat(formData.price || 0) -
                              parseFloat(formData.costPerItem || 0)
                            ).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Currency
                        </label>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          disabled={isLoading}
                        >
                          <option value="KES">KES – Kenyan Shilling</option>
                          <option value="USD">USD – US Dollar</option>
                          <option value="NGN">NGN – Nigerian Naira</option>
                          <option value="GHS">GHS – Ghanaian Cedi</option>
                          <option value="ZAR">ZAR – South African Rand</option>
                          <option value="UGX">UGX – Ugandan Shilling</option>
                          <option value="TZS">TZS – Tanzanian Shilling</option>
                          <option value="ETB">ETB – Ethiopian Birr</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="taxable"
                        name="taxable"
                        checked={formData.taxable}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-amber-500"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="taxable"
                        className="text-sm text-amber-800 font-medium cursor-pointer"
                      >
                        Charge tax on this product
                      </label>
                    </div>
                  </div>

                  {/* ── Section 4: Inventory ── */}
                  <div className="border-t border-amber-100 pt-6">
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        4
                      </span>
                      Inventory
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          name="inventory"
                          value={formData.inventory}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="0"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Low Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          name="lowStockThreshold"
                          value={formData.lowStockThreshold}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="5"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="trackInventory"
                          name="trackInventory"
                          checked={formData.trackInventory}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-amber-500"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="trackInventory"
                          className="text-sm text-amber-800 font-medium cursor-pointer"
                        >
                          Track inventory for this product
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="allowBackorders"
                          name="allowBackorders"
                          checked={formData.allowBackorders}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-amber-500"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="allowBackorders"
                          className="text-sm text-amber-800 font-medium cursor-pointer"
                        >
                          Allow backorders (sell when out of stock)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 5: Shipping ── */}
                  {formData.type === "physical" && (
                    <div className="border-t border-amber-100 pt-6">
                      <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                          5
                        </span>
                        Shipping
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-bold text-amber-900 mb-1">
                            Weight
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                              className="flex-1 border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                              placeholder="0.00"
                              disabled={isLoading}
                            />
                            <select
                              name="weightUnit"
                              value={formData.weightUnit}
                              onChange={handleInputChange}
                              className="w-20 border border-amber-200 rounded-xl px-2 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80 text-sm"
                              disabled={isLoading}
                            >
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="lb">lb</option>
                              <option value="oz">oz</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-amber-900 mb-1">
                            Dimensions (L × W × H)
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              name="length"
                              value={formData.length}
                              onChange={handleInputChange}
                              min="0"
                              step="0.1"
                              className="flex-1 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                              placeholder="L"
                              disabled={isLoading}
                            />
                            <span className="text-amber-400">×</span>
                            <input
                              type="number"
                              name="width"
                              value={formData.width}
                              onChange={handleInputChange}
                              min="0"
                              step="0.1"
                              className="flex-1 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                              placeholder="W"
                              disabled={isLoading}
                            />
                            <span className="text-amber-400">×</span>
                            <input
                              type="number"
                              name="height"
                              value={formData.height}
                              onChange={handleInputChange}
                              min="0"
                              step="0.1"
                              className="flex-1 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                              placeholder="H"
                              disabled={isLoading}
                            />
                            <select
                              name="dimensionUnit"
                              value={formData.dimensionUnit}
                              onChange={handleInputChange}
                              className="w-16 border border-amber-200 rounded-xl px-1 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80 text-sm"
                              disabled={isLoading}
                            >
                              <option value="cm">cm</option>
                              <option value="in">in</option>
                              <option value="m">m</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-amber-900 mb-1">
                            Shipping Class
                          </label>
                          <select
                            name="shippingClass"
                            value={formData.shippingClass}
                            onChange={handleInputChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            disabled={isLoading}
                          >
                            <option value="standard">Standard Shipping</option>
                            <option value="express">Express Shipping</option>
                            <option value="overnight">
                              Overnight Shipping
                            </option>
                            <option value="fragile">
                              Fragile / Special Handling
                            </option>
                            <option value="bulky">Bulky / Oversize</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-amber-900 mb-1">
                            Estimated Delivery Time
                          </label>
                          <input
                            type="text"
                            name="deliveryEstimate"
                            value={formData.deliveryEstimate}
                            onChange={handleInputChange}
                            className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="e.g. 3-5 business days"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="freeShipping"
                          name="freeShipping"
                          checked={formData.freeShipping}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-amber-500"
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="freeShipping"
                          className="text-sm text-amber-800 font-medium cursor-pointer"
                        >
                          Offer free shipping on this product
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ── Section 6: Variants & Attributes ── */}
                  <div className="border-t border-amber-100 pt-6">
                    <h4 className="text-base font-bold text-amber-900 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        6
                      </span>
                      Variants &amp; Attributes
                    </h4>
                    <p className="text-amber-500 text-xs mb-4">
                      Describe product options like colour, size, material, etc.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Color(s)
                        </label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. Red, Blue, Green"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Size(s)
                        </label>
                        <input
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. S, M, L, XL or 38, 40, 42"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Material
                        </label>
                        <input
                          type="text"
                          name="material"
                          value={formData.material}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="e.g. 100% Cotton, Leather"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Custom Attribute 1
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="customAttribute1Key"
                            value={formData.customAttribute1Key}
                            onChange={handleInputChange}
                            className="w-2/5 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="Name"
                            disabled={isLoading}
                          />
                          <input
                            type="text"
                            name="customAttribute1Value"
                            value={formData.customAttribute1Value}
                            onChange={handleInputChange}
                            className="flex-1 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="Value"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Custom Attribute 2
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="customAttribute2Key"
                            value={formData.customAttribute2Key}
                            onChange={handleInputChange}
                            className="w-2/5 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="Name"
                            disabled={isLoading}
                          />
                          <input
                            type="text"
                            name="customAttribute2Value"
                            value={formData.customAttribute2Value}
                            onChange={handleInputChange}
                            className="flex-1 border border-amber-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                            placeholder="Value"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 7: SEO ── */}
                  <div className="border-t border-amber-100 pt-6">
                    <h4 className="text-base font-bold text-amber-900 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        7
                      </span>
                      SEO — Search Engine Optimization
                    </h4>
                    <p className="text-amber-500 text-xs mb-4">
                      Help customers discover your product through search
                      engines.
                    </p>

                    {/* SEO Intelligence Panel */}
                    <div className="mb-5">
                      <SEOPanel
                        formData={formData}
                        onApplyAutoFill={handleApplyAutoFill}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          SEO Title
                          <span className="ml-2 text-amber-400 font-normal text-xs">
                            ({formData.seoTitle.length}/70 characters)
                          </span>
                          {formData.seoTitle.length > 0 && formData.seoTitle.length <= 70 && (
                            <span className="ml-2 text-green-600 text-xs">✓ Good length</span>
                          )}
                          {formData.seoTitle.length > 70 && (
                            <span className="ml-2 text-red-500 text-xs">⚠ Too long</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="seoTitle"
                          value={formData.seoTitle}
                          onChange={handleInputChange}
                          maxLength={70}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="Leave blank to use product name"
                          disabled={isLoading}
                        />
                        {/* Character progress bar */}
                        <div className="mt-1 h-1 w-full bg-amber-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (formData.seoTitle.length / 70) * 100)}%`,
                              backgroundColor:
                                formData.seoTitle.length === 0
                                  ? "#fde68a"
                                  : formData.seoTitle.length <= 70
                                    ? "#22c55e"
                                    : "#ef4444",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Meta Description
                          <span className="ml-2 text-amber-400 font-normal text-xs">
                            ({formData.seoDescription.length}/160 characters)
                          </span>
                          {formData.seoDescription.length >= 80 && formData.seoDescription.length <= 160 && (
                            <span className="ml-2 text-green-600 text-xs">✓ Good length</span>
                          )}
                          {formData.seoDescription.length > 0 && formData.seoDescription.length < 80 && (
                            <span className="ml-2 text-amber-500 text-xs">↑ Too short (aim 80+)</span>
                          )}
                          {formData.seoDescription.length > 160 && (
                            <span className="ml-2 text-red-500 text-xs">⚠ Too long</span>
                          )}
                        </label>
                        <textarea
                          name="seoDescription"
                          value={formData.seoDescription}
                          onChange={handleInputChange}
                          rows={2}
                          maxLength={160}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="Brief description for search results (80–160 chars)"
                          disabled={isLoading}
                        />
                        <div className="mt-1 h-1 w-full bg-amber-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (formData.seoDescription.length / 160) * 100)}%`,
                              backgroundColor:
                                formData.seoDescription.length === 0
                                  ? "#fde68a"
                                  : formData.seoDescription.length >= 80 && formData.seoDescription.length <= 160
                                    ? "#22c55e"
                                    : formData.seoDescription.length < 80
                                      ? "#f59e0b"
                                      : "#ef4444",
                            }}
                          />
                        </div>
                      </div>

                      {/* URL Slug */}
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          URL Slug
                          <span className="ml-2 text-amber-400 font-normal text-xs">
                            (auto-generated from name if empty)
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm font-mono shrink-0">/products/</span>
                          <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="flex-1 border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80 font-mono text-sm"
                            placeholder={generateSlug(formData.name) || "your-product-slug"}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block text-sm font-bold text-amber-900 mb-1">
                          Keywords
                          <span className="ml-2 text-amber-400 font-normal text-xs">
                            (comma-separated, e.g. leather wallet, minimalist, slim)
                          </span>
                        </label>
                        <input
                          type="text"
                          name="keywords"
                          value={formData.keywords}
                          onChange={handleInputChange}
                          className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white/80"
                          placeholder="keyword1, keyword2, keyword3"
                          disabled={isLoading}
                        />
                        {formData.keywords && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {formData.keywords.split(",").filter((k) => k.trim()).map((kw, i) => (
                              <span
                                key={i}
                                className="text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2 py-0.5"
                              >
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Section 8: Product Images ── */}
                  <div className="border-t border-amber-100 pt-6">
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                        8
                      </span>
                      Product Images
                    </h4>

                    {/* Primary Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Primary Product Image *
                      </label>
                      <div
                        {...getPrimaryRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                          isPrimaryDragActive
                            ? "border-amber-500 bg-amber-50"
                            : "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                        }`}
                      >
                        <input {...getPrimaryInputProps()} />
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                            <svg
                              className="w-6 h-6 text-amber-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-amber-700 font-medium">
                            {isPrimaryDragActive
                              ? "Drop the primary image here"
                              : "Drag & drop primary image, or click to select"}
                          </p>
                          <p className="text-amber-500 text-sm mt-1">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                      </div>

                      {uploading && (
                        <p className="text-amber-600 text-sm mt-2">
                          Uploading primary image...
                        </p>
                      )}

                      {formData.image && (
                        <div className="mt-4">
                          <p className="text-amber-700 text-sm font-medium mb-2">
                            Primary Image Preview:
                          </p>
                          <div className="relative inline-block">
                            <img
                              src={formData.image}
                              alt="Primary preview"
                              className="w-32 h-32 object-cover rounded-lg border border-amber-200"
                            />
                            <button
                              type="button"
                              onClick={removePrimaryImage}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Images Upload */}
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Additional Product Images
                      </label>
                      <div
                        {...getAdditionalRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                          isAdditionalDragActive
                            ? "border-amber-500 bg-amber-50"
                            : "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                        }`}
                      >
                        <input {...getAdditionalInputProps()} />
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                            <svg
                              className="w-6 h-6 text-amber-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                          <p className="text-amber-700 font-medium">
                            {isAdditionalDragActive
                              ? "Drop additional images here"
                              : "Drag & drop additional images, or click to select"}
                          </p>
                          <p className="text-amber-500 text-sm mt-1">
                            Multiple files allowed, PNG, JPG, JPEG up to 5MB
                            each
                          </p>
                        </div>
                      </div>

                      {uploading && formData.images.length > 0 && (
                        <p className="text-amber-600 text-sm mt-2">
                          Uploading additional images...
                        </p>
                      )}

                      {formData.images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-amber-700 text-sm font-medium mb-2">
                            Additional Images ({formData.images.length})
                          </p>
                          <div className="grid grid-cols-4 gap-4">
                            {formData.images.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt={`Additional ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-amber-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalImage(index)}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* closes images section div */}

                  {/* ── Form Action Buttons ── */}
                  <div className="border-t border-amber-200 pt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-3 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-all duration-300 font-semibold"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? "Adding..." : "Add Product"}
                    </button>
                  </div>
                </div>
                {/* closes p-6 space-y-8 div */}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-amber-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 transition-all duration-300">
          <div className="relative top-8 mx-auto p-6 w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900">
                      Edit Product
                    </h3>
                    <p className="text-amber-600 text-sm mt-1">
                      Update the product details
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-xl transition-all duration-300"
                    disabled={isLoading}
                  >
                    <span className="text-2xl leading-none">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleUpdateProduct}>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        required
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/80"
                        placeholder="Enter product name"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={editFormData.category}
                        onChange={handleEditInputChange}
                        required
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/80"
                        disabled={isLoading}
                      >
                        <option value="">Select category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home & Living">Home & Living</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditInputChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/80"
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        name="inventory"
                        value={editFormData.inventory}
                        onChange={handleEditInputChange}
                        min="0"
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/80"
                        placeholder="0"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={
                          Array.isArray(editFormData.tags)
                            ? editFormData.tags.join(", ")
                            : editFormData.tags
                        }
                        onChange={handleEditInputChange}
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/80"
                        placeholder="tag1, tag2, tag3"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-amber-900 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditInputChange}
                        rows={4}
                        className="w-full border border-amber-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 bg-white/80"
                        placeholder="Enter product description..."
                        disabled={isLoading}
                      ></textarea>
                    </div>
                  </div>

                  {/* Image Upload Section for Edit */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-amber-900 mb-4">
                      Product Images
                    </label>

                    {/* Primary Image Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Primary Product Image
                      </label>
                      <div
                        {...getEditPrimaryRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                          isEditPrimaryDragActive
                            ? "border-amber-500 bg-amber-50"
                            : "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                        }`}
                      >
                        <input {...getEditPrimaryInputProps()} />
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                            <svg
                              className="w-6 h-6 text-amber-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-amber-700 font-medium">
                            {isEditPrimaryDragActive
                              ? "Drop the primary image here"
                              : "Drag & drop primary image, or click to select"}
                          </p>
                          <p className="text-amber-500 text-sm mt-1">
                            PNG, JPG, JPEG up to 5MB
                          </p>
                        </div>
                      </div>

                      {uploading && (
                        <p className="text-amber-600 text-sm mt-2">
                          Uploading primary image...
                        </p>
                      )}

                      {editFormData.image && (
                        <div className="mt-4">
                          <p className="text-amber-700 text-sm font-medium mb-2">
                            Primary Image:
                          </p>
                          <div className="relative inline-block">
                            <img
                              src={editFormData.image}
                              alt="Primary preview"
                              className="w-32 h-32 object-cover rounded-lg border border-amber-200"
                            />
                            <button
                              type="button"
                              onClick={removeEditPrimaryImage}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Images Upload */}
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Additional Product Images
                      </label>
                      <div
                        {...getEditAdditionalRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                          isEditAdditionalDragActive
                            ? "border-amber-500 bg-amber-50"
                            : "border-amber-300 bg-amber-50/50 hover:border-amber-400"
                        }`}
                      >
                        <input {...getEditAdditionalInputProps()} />
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                            <svg
                              className="w-6 h-6 text-amber-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                          <p className="text-amber-700 font-medium">
                            {isEditAdditionalDragActive
                              ? "Drop additional images here"
                              : "Drag & drop additional images, or click to select"}
                          </p>
                          <p className="text-amber-500 text-sm mt-1">
                            Multiple files allowed, PNG, JPG, JPEG up to 5MB
                            each
                          </p>
                        </div>
                      </div>

                      {uploading && editFormData.images.length > 0 && (
                        <p className="text-amber-600 text-sm mt-2">
                          Uploading additional images...
                        </p>
                      )}

                      {editFormData.images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-amber-700 text-sm font-medium mb-2">
                            Additional Images ({editFormData.images.length})
                          </p>
                          <div className="grid grid-cols-4 gap-4">
                            {editFormData.images.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt={`Additional ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-amber-200"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeEditAdditionalImage(index)
                                  }
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-3 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-all duration-300 font-semibold"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? "Updating..." : "Update Product"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-amber-900/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 transition-all duration-300">
          <div className="relative top-8 mx-auto p-6 w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-amber-200 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-900">
                        Delete Product
                      </h3>
                      <p className="text-red-600 text-sm mt-1">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelDelete}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300"
                    disabled={deleteLoading}
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-amber-800 font-medium mb-4">
                    Are you sure you want to delete this product? This will
                    permanently remove the product and all associated data.
                  </p>

                  {deletingProduct && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg flex items-center justify-center overflow-hidden">
                          {deletingProduct.images &&
                          deletingProduct.images.length > 0 ? (
                            <img
                              src={deletingProduct.images[0]}
                              alt={deletingProduct.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {deletingProduct.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-amber-900">
                            {deletingProduct.name}
                          </div>
                          <div className="text-xs text-amber-500">
                            {deletingProduct.sku || "No SKU"} •{" "}
                            {deletingProduct.category}
                          </div>
                          <div className="text-sm font-semibold text-amber-700">
                            KES {parseFloat(deletingProduct.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="px-6 py-3 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 transition-all duration-300 font-semibold"
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
