import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { getAdminProducts, addAdminProduct } from "../../services/adminService";

import { getAdminDeals, addAdminDeal } from "../../services/adminService";

const AddDeal = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    productId: "",
    discountPercentage: "",
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getAdminProducts();

      setProducts(data);
    } catch (error) {
      console.error(error);

      toast.error("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productId) {
      toast.error("Please select a product.");
      return;
    }

    if (!form.discountPercentage) {
      toast.error("Discount percentage is required.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Start and end dates are required.");
      return;
    }

    const discount = Number(form.discountPercentage);

    if (discount <= 0 || discount > 100) {
      toast.error("Discount must be between 1 and 100.");
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    try {
      setSaving(true);

      await addAdminDeal({
        productId: Number(form.productId),

        discountPercentage: discount,

        startDate: form.startDate,

        endDate: form.endDate,
      });

      toast.success("Deal created successfully.");

      navigate("/admin/deals");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to create deal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading products...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Add Deal</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Product</label>

              <select
                name="productId"
                className="form-select"
                value={form.productId}
                onChange={handleChange}
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name ||
                      product.productName ||
                      `Product ${product.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Discount Percentage</label>

              <input
                type="number"
                name="discountPercentage"
                className="form-control"
                value={form.discountPercentage}
                onChange={handleChange}
                min="1"
                max="100"
                step="0.01"
                placeholder="Enter discount percentage"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Start Date</label>

              <input
                type="datetime-local"
                name="startDate"
                className="form-control"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">End Date</label>

              <input
                type="datetime-local"
                name="endDate"
                className="form-control"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Deal"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/deals")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDeal;
