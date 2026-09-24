import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getSellerCategoriesList,
  addSellerCategory,
} from "../../services/sellerService";

const SellerCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inline "add category" form state — collapsed by default so the
  // page focuses on the list. Sellers who only need to pick one
  // don't have to scroll past an always-visible form.
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getSellerCategoriesList();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();

    const name = newName.trim();

    if (!name) {
      toast.error("Category name is required.");
      return;
    }

    if (name.length < 2 || name.length > 100) {
      toast.error("Category name must be between 2 and 100 characters.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description: newDescription.trim() || null,
      };

      await addSellerCategory(payload);

      toast.success(`Category "${name}" added successfully.`);

      // Reset form and refresh the list so the new category appears
      // immediately. Keep the form open in case the seller wants to
      // add several categories in one go (e.g. "Toys", "Games",
      // "Puzzles").
      setNewName("");
      setNewDescription("");
      await loadCategories();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Unable to add category.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h2>Category Management</h2>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading categories...</span>
          </div>
          <p className="mt-2 text-muted">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Category Management</h2>
          <p className="text-muted mb-0">
            View existing categories or add a new one for your products.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddForm((value) => !value)}
        >
          {showAddForm ? "Close" : "+ Add Category"}
        </button>
      </div>

      {showAddForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="mb-3">Add a new category</h5>
            <form onSubmit={handleAdd}>
              <div className="row g-3">
                <div className="col-md-5">
                  <label className="form-label fw-semibold">
                    Category name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="e.g. Toys, Skincare, Stationery"
                    maxLength={100}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-semibold">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(event.target.value)
                    }
                    placeholder="Short description for this category"
                    maxLength={500}
                    disabled={submitting}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "Save"}
                  </button>
                </div>
              </div>
              <small className="text-muted d-block mt-2">
                New categories are added to the shared catalog and become
                available to all sellers immediately.
              </small>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">All Categories ({categories.length})</h5>

          {categories.length === 0 ? (
            <div className="alert alert-info mb-0">
              No categories yet. Click <strong>+ Add Category</strong> to
              create one for your products.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: "80px" }}>ID</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th style={{ width: "120px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td className="fw-semibold">
                        {category.name || category.categoryName || "-"}
                      </td>
                      <td className="text-muted">
                        {category.description || (
                          <span className="fst-italic">No description</span>
                        )}
                      </td>
                      <td>
                        {category.isActive === false ? (
                          <span className="badge bg-secondary">Inactive</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <Link to="/seller/products/add" className="btn btn-link p-0">
          ← Back to Add Product
        </Link>
      </div>
    </div>
  );
};

export default SellerCategories;
