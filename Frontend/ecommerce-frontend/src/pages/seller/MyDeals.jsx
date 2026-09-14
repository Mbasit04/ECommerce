import React, { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import {
  getSellerDeals,
  deleteSellerDeal,
} from "../../services/sellerService";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "expired", label: "Expired" },
  { key: "deactivated", label: "Deactivated" },
];

const MyDeals = () => {
  const [deals, setDeals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);

      const data = await getSellerDeals();

      setDeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("MyDeals load error:", error);

      toast.error(
        error.response?.data?.message || "Unable to load your deals.",
      );
    } finally {
      setLoading(false);
    }
  };

  const computeStatus = (deal) => {
    if (!deal.isActive) {
      return "deactivated";
    }

    const now = new Date();

    const start = new Date(deal.startDate);

    const end = new Date(deal.endDate);

    if (now < start) {
      return "upcoming";
    }

    if (now > end) {
      return "expired";
    }

    return "active";
  };

  const statusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="badge bg-success">Active</span>;

      case "upcoming":
        return <span className="badge bg-secondary">Upcoming</span>;

      case "expired":
        return <span className="badge bg-danger">Expired</span>;

      case "deactivated":
        return <span className="badge bg-dark">Deactivated</span>;

      default:
        return <span className="badge bg-light text-dark">Unknown</span>;
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleString();
  };

  const handleDelete = async (deal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the deal for "${deal.productName}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(deal.id);

      const res = await deleteSellerDeal(deal.id);

      toast.success(res?.message || "Deal deleted successfully.");

      setDeals((prev) => prev.filter((d) => d.id !== deal.id));
    } catch (error) {
      console.error("Delete deal error:", error);

      toast.error(
        error.response?.data?.message || "Unable to delete deal.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const decoratedDeals = useMemo(
    () =>
      deals.map((d) => ({
        ...d,
        status: computeStatus(d),
      })),
    [deals],
  );

  const counts = useMemo(() => {
    const c = {
      all: decoratedDeals.length,
      active: 0,
      upcoming: 0,
      expired: 0,
      deactivated: 0,
    };

    decoratedDeals.forEach((d) => {
      c[d.status] = (c[d.status] || 0) + 1;
    });

    return c;
  }, [decoratedDeals]);

  const filteredDeals = useMemo(() => {
    const term = search.trim().toLowerCase();

    return decoratedDeals.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        (d.productName || "").toLowerCase().includes(term) ||
        String(d.id).includes(term)
      );
    });
  }, [decoratedDeals, statusFilter, search]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading your deals...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">My Deals</h2>

          <p className="text-muted mb-0">
            View, edit, and manage discounts on your products.
          </p>
        </div>

        <Link to="/seller/deals/add" className="btn btn-primary">
          + Create Deal
        </Link>
      </div>

      <div className="row g-2 mb-3">
        {STATUS_FILTERS.map((f) => (
          <div className="col-6 col-md-2" key={f.key}>
            <button
              type="button"
              className={
                "btn w-100 " +
                (statusFilter === f.key
                  ? "btn-primary"
                  : "btn-outline-primary")
              }
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
              <span className="badge bg-light text-dark ms-2">
                {counts[f.key] ?? 0}
              </span>
            </button>
          </div>
        ))}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by product or deal id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredDeals.length === 0 ? (
            <div className="alert alert-info mb-0">
              {deals.length === 0
                ? "You have not created any deals yet."
                : "No deals match the current filter."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th className="text-end">Original</th>
                    <th className="text-center">Discount</th>
                    <th className="text-end">Deal Price</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeals.map((deal, index) => (
                    <tr key={deal.id}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>{deal.productName || "-"}</strong>

                        <div className="text-muted small">
                          Product ID: {deal.productId}
                        </div>
                      </td>

                      <td className="text-end">
                        ${Number(deal.originalPrice ?? 0).toFixed(2)}
                      </td>

                      <td className="text-center">
                        <span className="badge bg-info text-dark">
                          {Number(deal.discountPercentage ?? 0).toFixed(2)}%
                        </span>
                      </td>

                      <td className="text-end fw-semibold text-success">
                        ${Number(deal.dealPrice ?? 0).toFixed(2)}
                      </td>

                      <td>{formatDate(deal.startDate)}</td>

                      <td>
                        {formatDate(deal.endDate)}

                        {deal.status === "active" && (
                          <div className="text-muted small">
                            ends {formatDateTime(deal.endDate)}
                          </div>
                        )}
                      </td>

                      <td>{statusBadge(deal.status)}</td>

                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Link
                            to={`/seller/deals/edit/${deal.id}`}
                            className="btn btn-sm btn-warning"
                            title="Edit deal (Part 10)"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(deal)}
                            disabled={deletingId === deal.id}
                          >
                            {deletingId === deal.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
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

export default MyDeals;
