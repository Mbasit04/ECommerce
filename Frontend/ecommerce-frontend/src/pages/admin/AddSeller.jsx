import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addSeller } from "../../services/adminService";

const AddSeller = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      await addSeller({
        ...form,
        fullName: form.name,
      });

      toast.success("Seller added successfully.");

      navigate("/admin/sellers");
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to add seller.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Add Seller</h2>

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
                placeholder="Enter seller name"
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
                placeholder="Enter seller email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>

              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter temporary password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Seller"}
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

export default AddSeller;
