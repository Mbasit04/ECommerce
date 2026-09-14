import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { getCustomers, deleteCustomer } from "../../services/adminService";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data);
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCustomer(id);

      toast.success("Customer deleted successfully.");

      loadCustomers();
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to delete customer.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-2">Loading customers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Customer Management</h2>

          <p className="text-muted">Manage customers in your marketplace.</p>
        </div>

        <Link to="/admin/customers/add" className="btn btn-primary">
          + Add Customer
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {customers.length === 0 ? (
            <div className="alert alert-info">No customers found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>

                      <td>{customer.name || customer.fullName || "-"}</td>

                      <td>{customer.email}</td>

                      <td>
                        <span className={`badge ${customer.isActive !== false ? "bg-success" : "bg-secondary"}`}>
                          {customer.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/admin/customers/edit/${customer.id}`}
                          className="btn btn-sm btn-warning me-2"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(customer.id)}
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

export default Customers;
