import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSellerStockHistory,
  getAllSellerStockHistory,
  getSellerProducts,
} from "../../services/sellerService";

const SellerStockHistory = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(productId || "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadHistory(selectedProduct);
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      const data = await getSellerProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const loadHistory = async (prodId) => {
    try {
      setLoading(true);
      setError("");

      let data;
      if (prodId && prodId !== "all") {
        data = await getSellerStockHistory(prodId);
      } else {
        data = await getAllSellerStockHistory();
      }

      setHistory(data || []);
    } catch (err) {
      console.error("Stock history error:", err);
      const errMsg = err.response?.data?.message || "Unable to load stock history.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    if (val === "all") {
      navigate("/seller/stocks/history");
    } else {
      navigate(`/seller/stocks/${val}/history`);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Stock History</h2>
          <p className="text-muted mb-0">View all stock movement history for your products.</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/seller/stocks" className="btn btn-outline-secondary">
            Back to Stock Management
          </Link>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <label className="form-label fw-bold">Filter by Product:</label>
              <select
                className="form-select"
                value={selectedProduct}
                onChange={handleProductChange}
              >
                <option value="all">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading stock history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clock-history display-4 text-muted mb-3 d-block"></i>
              <h5>No stock history found.</h5>
              <p className="text-muted">
                {selectedProduct !== "all"
                  ? "No stock movements have been recorded for this product yet."
                  : "No stock movements have been recorded yet."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date & Time</th>
                    <th>Product Name</th>
                    <th>Quantity Change</th>
                    <th>Previous Stock</th>
                    <th>New Stock</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => {
                    const isPositive = item.quantityChanged > 0;
                    return (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <strong>{item.productName || "Product #" + item.productId}</strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isPositive ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {isPositive ? `+${item.quantityChanged}` : item.quantityChanged}
                          </span>
                        </td>
                        <td>{item.previousQuantity ?? "-"}</td>
                        <td>
                          <strong>{item.newQuantity ?? "-"}</strong>
                        </td>
                        <td>{item.reason || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerStockHistory;
