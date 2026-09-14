import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import { getAdminStockHistory } from "../../services/adminService";

const StockHistory = () => {
  const { productId } = useParams();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [productId]);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const data = await getAdminStockHistory(productId);

      setHistory(data);
    } catch (error) {
      console.error("Stock history error:", error);

      toast.error(
        error.response?.data?.message || "Unable to load stock history.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading stock history...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Stock History</h2>

          <p className="text-muted">Product ID: {productId}</p>
        </div>

        <Link to="/admin/stocks" className="btn btn-secondary">
          Back to Stocks
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {history.length === 0 ? (
            <div className="alert alert-info">No stock history found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Change</th>
                    <th>Previous Stock</th>
                    <th>New Stock</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : item.date
                            ? new Date(item.date).toLocaleString()
                            : "-"}
                      </td>

                      <td>
                        {item.changeQuantity ??
                          item.quantityChange ??
                          item.change ??
                          "-"}
                      </td>

                      <td>{item.previousStock ?? item.oldStock ?? "-"}</td>

                      <td>{item.newStock ?? item.currentStock ?? "-"}</td>

                      <td>{item.reason || item.type || "-"}</td>
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

export default StockHistory;
