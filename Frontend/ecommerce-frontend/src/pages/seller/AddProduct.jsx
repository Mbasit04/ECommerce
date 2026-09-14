import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  addSellerProduct,
  getSellerCategories,
} from "../../services/sellerService";

const AddProduct = () => {
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

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const data = await getSellerCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setCategoriesLoading(false);
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
    const images = Array.from(event.target.files || []);

    if (images.length === 0) {
      setForm((previous) => ({ ...previous, imageUrl: "" }));
      setImagePreviews([]);
      return;
    }

    if (images.length > 5) {
      toast.error("You can add up to 5 product images.");
      event.target.value = "";
      return;
    }

    if (images.some((image) => !image.type.startsWith("image/") || image.size > 1024 * 1024)) {
      toast.error("Each product image must be an image file of 1 MB or smaller.");
      event.target.value = "";
      return;
    }

    Promise.all(images.map((image) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(image);
    }))).then((imageUrls) => {
      setForm((previous) => ({ ...previous, imageUrl: JSON.stringify(imageUrls) }));
      setImagePreviews(imageUrls);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      toast.error("Product name is required.");
      return;
    }

    if (name.length < 2 || name.length > 150) {
      toast.error("Product name must be between 2 and 150 characters.");
      return;
    }

    if (description.length > 2000) {
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
      setLoading(true);

      const productData = {
        name,
        description,
        imageUrl: form.imageUrl,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: Number(form.categoryId),
        isActive: form.isActive,
      };

      await addSellerProduct(productData);

      toast.success("Product added successfully.");

      navigate("/seller/products");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Add Product</h2>

          <p className="text-muted mb-0">Add a new product to your store.</p>
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
                  placeholder="Enter product name"
                  maxLength={200}
                  disabled={loading}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>

                <select
                  name="categoryId"
                  className="form-select"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={loading || categoriesLoading}
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
                  placeholder="Enter product description"
                  maxLength={1000}
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label" htmlFor="productImage">
                  Product image <span className="text-danger">*</span>
                </label>

                <input
                  id="productImage"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={loading}
                  required
                />

                <div className="form-text">Choose 1 to 5 photos of this product (maximum 1 MB each).</div>

                {imagePreviews.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {imagePreviews.map((image, index) => <img key={image} src={image} alt={`Selected product ${index + 1}`} className="img-thumbnail" style={{ width: "120px", height: "90px", objectFit: "cover" }} />)}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Price</label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0.01"
                  step="0.01"
                  disabled={loading}
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
                  placeholder="Enter stock quantity"
                  min="0"
                  step="1"
                  disabled={loading}
                />
              </div>

              <div className="col-12 mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="isActive"
                    className="form-check-input"
                    id="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    disabled={loading}
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
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Product"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/seller/products")}
                disabled={loading}
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

export default AddProduct;
