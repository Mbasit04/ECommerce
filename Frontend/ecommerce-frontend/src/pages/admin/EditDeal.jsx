import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import {
  getAdminProducts,
  getAdminDealById,
  updateAdminDeal,
} from "../../services/adminService";

const EditDeal = () => {
  const { id } = useParams();

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
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [deal, productsData] = await Promise.all([
        getAdminDealById(id),
        getAdminProducts(),
      ]);

      setProducts(productsData);

      setForm({
        productId: deal.productId || "",

        discountPercentage: deal.discountPercentage ?? deal.discount ?? "",

        startDate: deal.startDate ? formatDateTime(deal.startDate) : "",

        endDate: deal.endDate ? formatDateTime(deal.endDate) : "",
      });
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to load deal.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    const value = new Date(date);

    const year = value.getFullYear();

    const month = String(value.getMonth() + 1).padStart(2, "0");

    const day = String(value.getDate()).padStart(2, "0");

    const hours = String(value.getHours()).padStart(2, "0");

    const minutes = String(value.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const discount = Number(form.discountPercentage);

    if (!form.productId) {
      toast.error("Please select a product.");
      return;
    }

    if (discount <= 0 || discount > 100) {
      toast.error("Discount must be between 1 and 100.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Start and end dates are required.");
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    try {
      setSaving(true);

      await updateAdminDeal(id, {
        productId: Number(form.productId),

        discountPercentage: discount,

        startDate: form.startDate,

        endDate: form.endDate,
      });

      toast.success("Deal updated successfully.");

      navigate("/admin/deals");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to update deal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading deal...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Edit Deal</h2>

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
              className="btn btn-success me-2"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
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

export default EditDeal;
