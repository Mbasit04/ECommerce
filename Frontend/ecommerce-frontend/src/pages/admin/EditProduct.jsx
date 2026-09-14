import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import {
  getAdminProductById,
  updateAdminProduct,
  getSellers,
  getCategories,
} from "../../services/adminService";

const EditProduct = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    sellerId: "",
    categoryId: "",
    isActive: true,
  });

  const [sellers, setSellers] = useState([]);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [product, sellersData, categoriesData] = await Promise.all([
        getAdminProductById(id),

        getSellers(),

        getCategories(),
      ]);

      setForm({
        name: product.name || product.productName || "",

        description: product.description || "",

        price: product.price ?? "",

        stock: product.stock ?? product.stockQuantity ?? "",

        sellerId: product.sellerId ?? "",

        categoryId: product.categoryId ?? "",

        isActive: product.isActive !== false,
      });

      setSellers(sellersData);

      setCategories(categoriesData);
    } catch (error) {
      console.error(error);

      toast.error("Unable to load product.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,

      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateAdminProduct(id, {
        name: form.name,

        description: form.description,

        price: Number(form.price),

        stock: Number(form.stock),

        sellerId: Number(form.sellerId),

        categoryId: Number(form.categoryId),

        isActive: form.isActive,
      });

      toast.success("Product updated successfully.");

      navigate("/admin/products");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Edit Product</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product Name</label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>

              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Price</label>

                <input
                  type="number"
                  name="price"
                  className="form-control"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Stock</label>

                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Seller</label>

                <select
                  name="sellerId"
                  className="form-select"
                  value={form.sellerId}
                  onChange={handleChange}
                >
                  <option value="">Select Seller</option>

                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name || seller.fullName || seller.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>

                <select
                  name="categoryId"
                  className="form-select"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name || category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-check mb-4">
              <input
                type="checkbox"
                name="isActive"
                className="form-check-input"
                checked={form.isActive}
                onChange={handleChange}
                id="editIsActive"
              />

              <label className="form-check-label" htmlFor="editIsActive">
                Product is active
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-success me-2"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
