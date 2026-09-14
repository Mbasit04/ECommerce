import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { addCategory } from "../../services/adminService";

const AddCategory = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");

      return;
    }

    try {
      setLoading(true);

      await addCategory({
        name: name.trim(),
      });

      toast.success("Category added successfully.");

      navigate("/admin/categories");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to add category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Add Category</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Category Name</label>

              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Category"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/categories")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;
