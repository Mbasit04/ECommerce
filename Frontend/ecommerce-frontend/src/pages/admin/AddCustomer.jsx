import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { addCustomer } from "../../services/adminService";

const AddCustomer = () => {
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

      await addCustomer({
        ...form,
        fullName: form.name,
      });

      toast.success("Customer added successfully.");

      navigate("/admin/customers");
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to add customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Add Customer</h2>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Customer Name</label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
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
                placeholder="Enter customer email"
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
              {loading ? "Adding..." : "Add Customer"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/admin/customers")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
