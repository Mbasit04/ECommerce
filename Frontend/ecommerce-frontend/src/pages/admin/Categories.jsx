import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import { getCategories, deleteCategory } from "../../services/adminService";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategory(id);

      toast.success("Category deleted successfully.");

      loadCategories();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Unable to delete category.",
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-2">Loading categories...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Category Management</h2>

          <p className="text-muted">Manage product categories.</p>
        </div>

        <Link to="/admin/categories/add" className="btn btn-primary">
          + Add Category
        </Link>
      </div>

      {/* Table */}

      <div className="card shadow-sm">
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="alert alert-info">No categories found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>

                    <th>Category Name</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>

                      <td>{category.name || category.categoryName || "-"}</td>

                      <td>
                        <Link
                          to={`/admin/categories/edit/${category.id}`}
                          className="btn btn-sm btn-warning me-2"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(category.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
