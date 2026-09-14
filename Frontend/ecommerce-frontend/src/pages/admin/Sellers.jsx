import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { getSellers, deleteSeller } from "../../services/adminService";

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);

      const data = await getSellers();

      setSellers(data);
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to load sellers.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this seller?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSeller(id);

      toast.success("Seller deleted successfully.");

      loadSellers();
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to delete seller.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />
        <p className="mt-2">Loading sellers...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Seller Management</h2>

          <p className="text-muted">Manage sellers in your marketplace.</p>
        </div>

        <Link to="/admin/sellers/add" className="btn btn-primary">
          + Add Seller
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {sellers.length === 0 ? (
            <div className="alert alert-info">No sellers found.</div>
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
                  {sellers.map((seller) => (
                    <tr key={seller.id}>
                      <td>{seller.id}</td>

                      <td>{seller.name || seller.fullName || "-"}</td>

                      <td>{seller.email}</td>

                      <td>
                        <span className={`badge ${seller.isActive !== false ? "bg-success" : "bg-secondary"}`}>
                          {seller.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/admin/sellers/edit/${seller.id}`}
                          className="btn btn-sm btn-warning me-2"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(seller.id)}
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

export default Sellers;
