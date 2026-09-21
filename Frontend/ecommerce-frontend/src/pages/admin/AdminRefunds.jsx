import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
  getAdminRefunds,
  approveRefund,
  rejectRefund,
} from "../../services/adminService";

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminRefunds();

      setRefunds(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load refund requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Approve this refund request? This will mark it as approved."
      )
    ) {
      return;
    }

    try {
      setBusyId(id);
      await approveRefund(id);
      toast.success("Refund approved successfully.");
      loadRefunds();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to approve refund."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    if (
      !window.confirm(
        "Reject this refund request? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setBusyId(id);
      await rejectRefund(id);
      toast.success("Refund rejected.");
      loadRefunds();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to reject refund."
      );
    } finally {
      setBusyId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();

    if (s === "requested" || s === "pending") {
      return <span className="badge bg-warning text-dark">Pending</span>;
    }

    if (s === "approved") {
      return <span className="badge bg-info">Approved</span>;
    }

    if (s === "rejected") {
      return <span className="badge bg-danger">Rejected</span>;
    }

    if (s === "processed") {
      return <span className="badge bg-success">Processed</span>;
    }

    return <span className="badge bg-secondary">{status}</span>;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Refund Management</h2>

          <p className="text-muted mb-0">
            Review and process customer refund requests.
          </p>
        </div>

        <button
          className="btn btn-outline-primary"
          onClick={loadRefunds}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-2">Loading refund requests...</p>
        </div>
      ) : refunds.length === 0 ? (
        <div className="alert alert-info">
          No refund requests found.
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Refund ID</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {refunds.map((refund) => {
                    const isPending =
                      (refund.status || "")
                        .toLowerCase()
                        .match(/^(requested|pending)$/);

                    return (
                      <tr key={refund.refundId}>
                        <td>
                          <strong>#{refund.refundId}</strong>
                        </td>

                        <td>#{refund.orderId}</td>

                        <td>
                          <div>
                            {refund.customerName ||
                              "Unknown"}
                          </div>

                          <small className="text-muted">
                            {refund.customerEmail}
                          </small>
                        </td>

                        <td>
                          Rs.{" "}
                          {Number(
                            refund.amount
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span className="badge bg-secondary">
                            {refund.paymentMethod || "-"}
                          </span>
                        </td>

                        <td
                          style={{
                            maxWidth: "260px",
                            whiteSpace: "normal",
                          }}
                        >
                          {refund.reason}
                        </td>

                        <td>
                          {getStatusBadge(refund.status)}
                        </td>

                        <td>
                          {refund.requestedAt
                            ? new Date(
                                refund.requestedAt
                              ).toLocaleString()
                            : "-"}
                        </td>

                        <td>
                          {isPending ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-1"
                                disabled={busyId === refund.refundId}
                                onClick={() =>
                                  handleApprove(
                                    refund.refundId
                                  )
                                }
                              >
                                {busyId === refund.refundId
                                  ? "Working..."
                                  : "Approve"}
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                disabled={busyId === refund.refundId}
                                onClick={() =>
                                  handleReject(
                                    refund.refundId
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-muted small">
                              No actions
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
