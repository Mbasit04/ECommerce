import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getSellerDealById,
  getSellerProducts,
  updateSellerDeal,
} from "../../services/sellerService";

const toDateTimeLocal = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const EditDeal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [deal, sellerProducts] = await Promise.all([
          getSellerDealById(id),
          getSellerProducts(),
        ]);

        setProducts(Array.isArray(sellerProducts) ? sellerProducts : []);
        setForm({
          productId: String(deal.productId),
          discountPercentage: String(deal.discountPercentage ?? ""),
          startDate: toDateTimeLocal(deal.startDate),
          endDate: toDateTimeLocal(deal.endDate),
          isActive: deal.isActive !== false,
        });
      } catch (error) {
        console.error("Edit deal load error:", error);
        toast.error(error.response?.data?.message || "Unable to load this deal.");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const discount = Number(form.discountPercentage);
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (!form.productId) return toast.error("Please select one of your products.");
    if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
      return toast.error("Discount must be greater than 0% and less than 100%.");
    }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return toast.error("Please provide valid start and end date/times.");
    }
    if (endDate <= startDate) {
      return toast.error("The end date/time must be after the start date/time.");
    }

    try {
      setSaving(true);
      await updateSellerDeal(id, {
        productId: Number(form.productId),
        discountPercentage: discount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isActive: form.isActive,
      });
      toast.success("Deal updated successfully.");
      navigate("/seller/deals");
    } catch (error) {
      console.error("Update deal error:", error);
      toast.error(error.response?.data?.message || "Unable to update the deal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading deal...</p></div>;
  }

  if (!form) {
    return <div><h2>Edit Deal</h2><div className="alert alert-warning">Deal not found or you do not own it.</div><button className="btn btn-secondary" onClick={() => navigate("/seller/deals")}>Back to My Deals</button></div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2>Edit Deal</h2><p className="text-muted mb-0">Update a discount on one of your products.</p></div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/seller/deals")}>Back to My Deals</button>
      </div>
      <div className="card shadow-sm"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" htmlFor="productId">Your product</label>
              <select id="productId" name="productId" className="form-select" value={form.productId} onChange={handleChange} disabled={saving} required>
                <option value="">Select product</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name || product.productName || `Product ${product.id}`} — ${Number(product.price ?? 0).toFixed(2)}</option>)}
              </select>
              <div className="form-text">Only products belonging to your seller account are shown.</div>
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="discountPercentage">Discount percentage</label>
              <input id="discountPercentage" name="discountPercentage" type="number" className="form-control" value={form.discountPercentage} onChange={handleChange} min="0.01" max="99.99" step="0.01" disabled={saving} required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="startDate">Start date and time</label>
              <input id="startDate" name="startDate" type="datetime-local" className="form-control" value={form.startDate} onChange={handleChange} disabled={saving} required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="endDate">End date and time</label>
              <input id="endDate" name="endDate" type="datetime-local" className="form-control" value={form.endDate} onChange={handleChange} min={form.startDate} disabled={saving} required />
            </div>
            <div className="col-12"><div className="form-check">
              <input id="isActive" name="isActive" type="checkbox" className="form-check-input" checked={form.isActive} onChange={handleChange} disabled={saving} />
              <label className="form-check-label" htmlFor="isActive">Deal is active</label>
            </div></div>
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Updating..." : "Update Deal"}</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/seller/deals")} disabled={saving}>Cancel</button>
          </div>
        </form>
      </div></div>
    </div>
  );
};

export default EditDeal;
