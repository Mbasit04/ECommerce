import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getSellerProducts,
  deleteSellerProduct,
} from "../../services/sellerService";
import { Link } from "react-router-dom";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstImage = (imageUrl) => {
    try {
      const images = JSON.parse(imageUrl);
      return Array.isArray(images) ? images[0] : imageUrl;
    } catch {
      return imageUrl;
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getSellerProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load products.");
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
      const res = await deleteSellerProduct(id);

      toast.success(res?.message || "Product deleted successfully.");

      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to delete product.");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div>
        <h2>My Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Products</h2>
          <p className="text-muted">Manage your products.</p>
        </div>

        <Link to="/seller/products/add" className="btn btn-primary">
          Add Product
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>

                      <td>
                        {product.imageUrl ? (
                          <img
                            src={firstImage(product.imageUrl)}
                            alt={product.name}
                            className="rounded border"
                            style={{ width: "56px", height: "56px", objectFit: "cover" }}
                          />
                        ) : (
                          <span className="text-muted small">No image</span>
                        )}
                      </td>

                      <td>
                        <strong>{product.name}</strong>

                        {product.description && (
                          <div className="small text-muted">
                            {product.description.length > 60
                              ? product.description.substring(0, 60) + "..."
                              : product.description}
                          </div>
                        )}
                      </td>

                      <td>{product.categoryName || "N/A"}</td>

                      <td>Rs. {product.price}</td>

                      <td>
                        <span
                          className={
                            product.stock === 0
                              ? "badge bg-danger"
                              : product.stock <= 5
                                ? "badge bg-warning text-dark"
                                : "badge bg-success"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td>
                        {product.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-secondary">Inactive</span>
                        )}
                      </td>

                      <td>
                        <Link
                          to={`/seller/products/edit/${product.id}`}
                          className="btn btn-sm btn-primary me-2"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProducts;
