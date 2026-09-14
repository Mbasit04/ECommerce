import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import { getAdminDeals, deleteAdminDeal } from "../../services/adminService";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);

      const data = await getAdminDeals();

      setDeals(data);
    } catch (error) {
      console.error("Deals error:", error);

      toast.error(error.response?.data?.message || "Unable to load deals.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminDeal(id);

      toast.success("Deal deleted successfully.");

      loadDeals();
    } catch (error) {
      console.error("Delete deal error:", error);

      toast.error(error.response?.data?.message || "Unable to delete deal.");
    }
  };

  const getDealStatus = (startDate, endDate) => {
    const now = new Date();

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return <span className="badge bg-secondary">Upcoming</span>;
    }

    if (now > end) {
      return <span className="badge bg-danger">Expired</span>;
    }

    return <span className="badge bg-success">Active</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading deals...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Deal Management</h2>

          <p className="text-muted">Create and manage product discounts.</p>
        </div>

        <Link to="/admin/deals/add" className="btn btn-primary">
          + Add Deal
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {deals.length === 0 ? (
            <div className="alert alert-info">No deals found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Discount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id}>
                      <td>{deal.id}</td>

                      <td>
                        {deal.productName ||
                          deal.product?.name ||
                          deal.product?.productName ||
                          "-"}
                      </td>

                      <td>{deal.discountPercentage ?? deal.discount ?? 0}%</td>

                      <td>
                        {deal.startDate
                          ? new Date(deal.startDate).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {deal.endDate
                          ? new Date(deal.endDate).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>{getDealStatus(deal.startDate, deal.endDate)}</td>

                      <td>
                        <Link
                          to={`/admin/deals/edit/${deal.id}`}
                          className="btn btn-sm btn-warning me-2"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(deal.id)}
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

export default Deals;
