import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import { getSellerById, updateSeller } from "../../services/adminService";

const EditSeller = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSeller();
  }, [id]);

  const loadSeller = async () => {
    try {
      const data = await getSellerById(id);

      setForm({
        name: data.name || data.fullName || "",
        email: data.email || "",
      });
    } catch (error) {
      console.error(error);

      toast.error("Unable to load seller.");
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

    try {
      setSaving(true);

      await updateSeller(id, form);

      toast.success("Seller updated successfully.");

      navigate("/admin/sellers");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Unable to update seller.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading seller...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Edit Seller</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Seller Name</label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>

              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
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
              onClick={() => navigate("/admin/sellers")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSeller;
