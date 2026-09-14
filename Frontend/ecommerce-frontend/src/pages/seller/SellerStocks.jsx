import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getSellerProducts,
  increaseSellerStock,
  decreaseSellerStock,
} from "../../services/sellerService";

const SellerStocks = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState(null);

  const [modal, setModal] = useState({
    show: false,
    product: null,
    action: "",
  });

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getSellerProducts();

      setProducts(data || []);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product, action) => {
    setModal({
      show: true,
      product,
      action,
    });

    setQuantity("");
    setReason("");
  };

  const closeModal = () => {
    if (processingId !== null) {
      return;
    }

    setModal({
      show: false,
      product: null,
      action: "",
    });

    setQuantity("");
    setReason("");
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (!modal.product) {
      return;
    }

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid quantity.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    if (modal.action === "decrease" && amount > Number(modal.product.stock)) {
      toast.error("Stock cannot become negative.");
      return;
    }

    try {
      setProcessingId(modal.product.id);

      const stockData = {
        quantity: amount,
        reason: reason.trim(),
      };

      if (modal.action === "increase") {
        await increaseSellerStock(modal.product.id, stockData);
      } else {
        await decreaseSellerStock(modal.product.id, stockData);
      }

      toast.success(`Stock ${modal.action}d successfully.`);

      closeModal();

      await loadProducts();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to update stock.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="mt-2">Loading stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Stock Management</h2>
          <p className="text-muted mb-0">Manage stock for your products.</p>
        </div>

        <Link to="/seller/stocks/history" className="btn btn-primary">
          Stock History
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {products.length === 0 ? (
            <div className="text-center py-5">
              <h5>No products found.</h5>

              <p className="text-muted">Add a product first.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product, index) => {
                    const stock = Number(product.stock) || 0;

                    return (
                      <tr key={product.id}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>{product.name}</strong>
                        </td>

                        <td>{product.categoryName}</td>

                        <td>
                          <strong>{stock}</strong>
                        </td>

                        <td>
                          {stock === 0 ? (
                            <span className="badge bg-danger">
                              Out of Stock
                            </span>
                          ) : stock <= 5 ? (
                            <span className="badge bg-warning text-dark">
                              Low Stock
                            </span>
                          ) : (
                            <span className="badge bg-success">In Stock</span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => openModal(product, "increase")}
                            >
                              + Add
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => openModal(product, "decrease")}
                              disabled={stock === 0}
                            >
                              − Remove
                            </button>

                            <Link
                              to={`/seller/stocks/${product.id}/history`}
                              className="btn btn-sm btn-outline-info"
                            >
                              History
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal.show && modal.product && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modal.action === "increase"
                    ? "Increase Stock"
                    : "Sold Out / Decrease Stock"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={processingId !== null}
                />
              </div>

              <form onSubmit={handleStockUpdate}>
                <div className="modal-body">
                  <p>
                    <strong>Product:</strong> {modal.product.name}
                  </p>

                  <p>
                    <strong>Current Stock:</strong> {modal.product.stock}
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Quantity</label>

                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={processingId !== null}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Reason</label>

                    <textarea
                      className="form-control"
                      rows="3"
                      maxLength="500"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={modal.action === "increase" ? "e.g. New inventory received" : "e.g. Sold out"}
                      disabled={processingId !== null}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={processingId !== null}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={
                      modal.action === "increase"
                        ? "btn btn-success"
                        : "btn btn-danger"
                    }
                    disabled={processingId !== null}
                  >
                    {processingId !== null
                      ? "Updating..."
                      : modal.action === "increase"
                        ? "Increase Stock"
                        : "Mark Sold Out"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerStocks;
