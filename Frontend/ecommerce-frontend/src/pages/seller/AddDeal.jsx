import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  createSellerDeal,
  getSellerProducts,
} from "../../services/sellerService";

// How far in the past we're willing to accept as a "start now" pick.
// Covers the small gap between the seller's browser clock and the
// API server's clock so "Start at this moment" still works even if
// the two clocks disagree by a few seconds.
const CLOCK_SKEW_TOLERANCE_MS = 5 * 60_000;

const toDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// Default a new deal to start right now — not 5 minutes from now.
// The customer-facing product query filters by "now >= start", so
// any future start time hides the deal from buyers until then,
// producing exactly the bug where the deal was visible to the
// seller/admin but invisible to customers for 5 minutes after
// creation. Letting the seller choose "now" makes the deal
// immediately visible on the storefront.
const getDefaultStartDate = () =>
  toDateTimeLocal(new Date());

// Allow the input's `min` to be a few minutes in the past so the
// seller can pick "start right now" without their clock beating the
// server by a second. The pickier `startDate < new Date()` rule in
// handleSubmit uses the same tolerance.
const getMinimumStartDate = () =>
  toDateTimeLocal(new Date(Date.now() - CLOCK_SKEW_TOLERANCE_MS));

const AddDeal = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    discountPercentage: "",
    startDate: getDefaultStartDate(),
    endDate: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getSellerProducts();
        setProducts(Array.isArray(data) ? data.filter((product) => product.isActive !== false) : []);
      } catch (error) {
        console.error("Create deal products error:", error);
        toast.error(error.response?.data?.message || "Unable to load your products.");
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const discount = Number(form.discountPercentage);
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (!form.productId) {
      toast.error("Please select one of your products.");
      return;
    }

    if (!Number.isFinite(discount) || discount <= 0 || discount >= 100) {
      toast.error("Discount must be greater than 0% and less than 100%.");
      return;
    }

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast.error("Please provide valid start and end date/times.");
      return;
    }

    if (startDate < new Date(Date.now() - CLOCK_SKEW_TOLERANCE_MS)) {
      toast.error(
        "The deal start date/time is too far in the past.",
      );
      return;
    }

    if (endDate <= startDate) {
      toast.error("The end date/time must be after the start date/time.");
      return;
    }

    try {
      setSaving(true);
      await createSellerDeal({
        productId: Number(form.productId),
        discountPercentage: discount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      toast.success("Deal created successfully.");
      navigate("/seller/deals");
    } catch (error) {
      console.error("Create deal error:", error);
      toast.error(error.response?.data?.message || "Unable to create the deal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Create Deal</h2>
          <p className="text-muted mb-0">Set a time-limited discount for one of your products.</p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={() => navigate("/seller/deals")}>
          Back to My Deals
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="productId">Your product</label>
                <select id="productId" name="productId" className="form-select" value={form.productId} onChange={handleChange} disabled={saving || productsLoading} required>
                  <option value="">{productsLoading ? "Loading products..." : "Select product"}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name || product.productName || `Product ${product.id}`} — ${Number(product.price ?? 0).toFixed(2)}
                    </option>
                  ))}
                </select>
                {!productsLoading && products.length === 0 && <div className="form-text text-danger">You do not have an active product available for a deal.</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="discountPercentage">Discount percentage</label>
                <input id="discountPercentage" name="discountPercentage" type="number" className="form-control" value={form.discountPercentage} onChange={handleChange} min="0.01" max="99.99" step="0.01" placeholder="e.g. 15" disabled={saving} required />
                <div className="form-text">Enter a value from 0.01% to 99.99%.</div>
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="startDate">Start date and time</label>
                <input id="startDate" name="startDate" type="datetime-local" className="form-control" value={form.startDate} onChange={handleChange} min={getMinimumStartDate()} disabled={saving} required />
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="endDate">End date and time</label>
                <input id="endDate" name="endDate" type="datetime-local" className="form-control" value={form.endDate} onChange={handleChange} min={form.startDate || getMinimumStartDate()} disabled={saving} required />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={saving || productsLoading || products.length === 0}>
                {saving ? "Creating..." : "Create Deal"}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/seller/deals")} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDeal;
