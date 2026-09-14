import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import { getAdminStocks } from "../../services/adminService";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadStocks = async () => {
    try {
      setLoading(true);

      const data = await getAdminStocks();

      setStocks(data);
    } catch (error) {
      console.error("Stock error:", error);

      toast.error(error.response?.data?.message || "Unable to load stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const getStockValue = (stock) => {
    return Number(stock.stock ?? stock.stockQuantity ?? stock.quantity ?? 0);
  };

  const getStockStatus = (stock) => {
    const quantity = getStockValue(stock);

    if (quantity === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    }

    if (quantity <= 5) {
      return <span className="badge bg-warning text-dark">Low Stock</span>;
    }

    return <span className="badge bg-success">In Stock</span>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />

        <p className="mt-2">Loading stock...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Stock Management</h2>

          <p className="text-muted">
            Monitor product inventory and stock levels.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Total Products</h6>

              <h2>{stocks.length}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Low Stock</h6>

              <h2>
                {
                  stocks.filter((stock) => {
                    const quantity = getStockValue(stock);

                    return quantity > 0 && quantity <= 5;
                  }).length
                }
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Out of Stock</h6>

              <h2>
                {stocks.filter((stock) => getStockValue(stock) === 0).length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {stocks.length === 0 ? (
            <div className="alert alert-info">No stock records found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {stocks.map((stock) => {
                    const productId = stock.productId || stock.id;

                    const quantity = getStockValue(stock);

                    return (
                      <tr key={productId}>
                        <td>{productId}</td>

                        <td>
                          {stock.productName ||
                            stock.product?.name ||
                            stock.product?.productName ||
                            "-"}
                        </td>

                        <td>
                          {stock.sellerName ||
                            stock.seller?.name ||
                            stock.seller?.fullName ||
                            "-"}
                        </td>

                        <td>
                          PKR{" "}
                          {Number(
                            stock.price || stock.product?.price || 0,
                          ).toLocaleString()}
                        </td>

                        <td>
                          <strong>{quantity}</strong>
                        </td>

                        <td>{getStockStatus(stock)}</td>

                        <td>
                          <Link
                            to={`/admin/stocks/${productId}/history`}
                            className="btn btn-sm btn-primary"
                          >
                            History
                          </Link>
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
    </div>
  );
};

export default Stocks;
