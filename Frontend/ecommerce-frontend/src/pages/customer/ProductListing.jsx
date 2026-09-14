import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCustomerProducts } from "../../services/customerService";
import ProductCard from "../../components/ProductCard";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    getCustomerProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const categories = useMemo(
    () =>
      [
        ...new Map(
          products.map((item) => [item.categoryId, item.categoryName]),
        ).entries(),
      ],
    [products],
  );

  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchCategory =
          category === "all" || String(product.categoryId) === category;

        const term = search.toLowerCase();

        const matchSearch =
          !term ||
          `${product.name} ${product.description || ""}`
            .toLowerCase()
            .includes(term);

        return matchCategory && matchSearch;
      }),
    [products, category, search],
  );

  return (
    <div>
      <div className="mb-4">
        <h1>Products</h1>
        <p className="text-muted">
          Browse available products and current seller deals.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <input
            className="form-control"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading products...</span>
          </div>
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="alert alert-info">No products match your search.</div>
      ) : (
        <div className="row g-4">
          {visibleProducts.map((product) => (
            <div className="col-sm-6 col-lg-4" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
