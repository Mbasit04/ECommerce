import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import { getCategoryById, updateCategory } from "../../services/adminService";

const EditCategory = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      const data = await getCategoryById(id);

      setName(data.name || data.categoryName || "");
    } catch (error) {
      console.error(error);

      toast.error("Unable to load category.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");

      return;
    }

    try {
      setSaving(true);

      await updateCategory(id, {
        name: name.trim(),
      });

      toast.success("Category updated successfully.");

      navigate("/admin/categories");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Unable to update category.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading category...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Edit Category</h2>

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

export default EditCategory;
