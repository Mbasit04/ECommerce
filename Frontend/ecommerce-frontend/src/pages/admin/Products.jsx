import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getAdminProducts,
  deleteAdminProduct,
} from "../../services/adminService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getAdminProducts();

      setProducts(data || []);
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminProduct(id);

      toast.success("Product deleted successfully.");

      loadProducts();
    } catch (error) {
      console.error(error);

      let errorMsg = error.response?.data?.message;
      if (!errorMsg && error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).flat().join(" ");
      }

      toast.error(errorMsg || "Unable to delete product.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status" />
        <p className="mt-2">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Product Management</h2>

          <p className="text-muted">
            Manage products, sellers, prices and stock.
          </p>
        </div>

        <Link to="/admin/products/add" className="btn btn-primary">
          + Add Product
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {products.length === 0 ? (
            <div className="alert alert-info">No products found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      <td>{product.name || product.productName || "-"}</td>

                      <td>
                        {product.categoryName || product.category?.name || "-"}
                      </td>

                      <td>
                        {product.sellerName ||
                          product.seller?.name ||
                          product.seller?.fullName ||
                          "-"}
                      </td>

                      <td>PKR {Number(product.price || 0).toLocaleString()}</td>

                      <td>{product.stock ?? product.stockQuantity ?? 0}</td>

                      <td>
                        {product.isActive === false ? (
                          <span className="badge bg-danger">Inactive</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>

                      <td>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="btn btn-sm btn-warning me-2"
                        >
                          Edit
                        </Link>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(product.id)}
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

export default Products;
