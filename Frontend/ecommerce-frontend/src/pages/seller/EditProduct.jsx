import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getSellerProductById,
  getSellerCategories,
  updateSellerProduct,
} from "../../services/sellerService";

const getImages = (imageUrl) => {
  if (!imageUrl) return [];
  try {
    const images = JSON.parse(imageUrl);
    return Array.isArray(images) ? images : [imageUrl];
  } catch {
    return [imageUrl];
  }
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    stock: "",
    categoryId: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [product, categoryData] = await Promise.all([
        getSellerProductById(id),
        getSellerCategories(),
      ]);

      if (!product) {
        toast.error("Product not found.");
        navigate("/seller/products");
        return;
      }

      setForm({
        name: product.name || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        categoryId: product.categoryId ?? "",
        isActive: product.isActive ?? true,
      });
      setImagePreviews(getImages(product.imageUrl));

      setCategories(categoryData || []);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to load product.");

      navigate("/seller/products");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const newImages = Array.from(event.target.files || []);
    if (newImages.length === 0) return;

    if (imagePreviews.length + newImages.length > 5) {
      toast.error("A product can have up to 5 images.");
      event.target.value = "";
      return;
    }

    if (newImages.some((image) => !image.type.startsWith("image/") || image.size > 1024 * 1024)) {
      toast.error("Each product image must be an image file of 1 MB or smaller.");
      event.target.value = "";
      return;
    }

    Promise.all(newImages.map((image) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(image);
    }))).then((urls) => {
      const updatedImages = [...imagePreviews, ...urls];
      setImagePreviews(updatedImages);
      setForm((previous) => ({ ...previous, imageUrl: JSON.stringify(updatedImages) }));
    });
    event.target.value = "";
  };

  const removeImage = (index) => {
    const updatedImages = imagePreviews.filter((_, imageIndex) => imageIndex !== index);
    setImagePreviews(updatedImages);
    setForm((previous) => ({ ...previous, imageUrl: updatedImages.length ? JSON.stringify(updatedImages) : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();

    if (!name) {
      toast.error("Product name is required.");
      return;
    }

    if (name.length < 2 || name.length > 150) {
      toast.error("Product name must be between 2 and 150 characters.");
      return;
    }

    if (form.description.trim().length > 2000) {
      toast.error("Description cannot exceed 2000 characters.");
      return;
    }

    if (!form.categoryId) {
      toast.error("Please select a category.");
      return;
    }

    if (!form.imageUrl) {
      toast.error("A product image is required.");
      return;
    }

    if (form.price === "" || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      toast.error("Stock cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name,
        description: form.description.trim(),
        imageUrl: form.imageUrl,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        isActive: form.isActive,
      };

      await updateSellerProduct(id, productData);

      toast.success("Product updated successfully.");

      navigate("/seller/products");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="mt-2">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Edit Product</h2>

          <p className="text-muted mb-0">Update your product information.</p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/seller/products")}
        >
          Back to Products
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Product Name</label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={200}
                  disabled={saving}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>

                <select
                  name="categoryId"
                  className="form-select"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Description</label>

                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  disabled={saving}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label" htmlFor="productImage">
                  Product image <span className="text-danger">*</span>
                </label>

                {imagePreviews.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {imagePreviews.map((image, index) => <div className="position-relative" key={image}><img src={image} alt={`Product ${index + 1}`} className="img-thumbnail" style={{ width: "120px", height: "90px", objectFit: "cover" }} /><button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0" onClick={() => removeImage(index)} disabled={saving} aria-label={`Remove image ${index + 1}`}>×</button></div>)}
                  </div>
                )}

                <input
                  id="productImage"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={saving}
                />

                <div className="form-text">
                  Add up to 5 photos total. Use × to remove an existing photo; each image is limited to 1 MB.
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Price</label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  disabled={saving}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Stock</label>

                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  disabled={saving}
                />
              </div>

              <div className="col-12 mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    className="form-check-input"
                    checked={form.isActive}
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <label className="form-check-label" htmlFor="isActive">
                    Product is Active
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Product"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/seller/products")}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
