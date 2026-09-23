import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/customer/ProductCard";
import { getCustomerProducts, getCustomerCategories } from "../../services/productService";

const ranges = [
  ["Under Rs. 5,000", "", "5000"], ["Rs. 5,000 – 20,000", "5000", "20000"],
  ["Rs. 20,000 – 50,000", "20000", "50000"], ["Rs. 50,000+", "50000", ""],
];
const LOW_STOCK_LIMIT = 5;
const value = (item, key, fallback = "") =>
  item[key] ?? item[key[0].toUpperCase() + key.slice(1)] ?? fallback;
const discountPercentage = (product) => Number(
  value(product, "discountPercentage", product.deal?.discountPercentage ?? product.Deal?.discountPercentage ?? product.activeDeal?.discountPercentage ?? product.ActiveDeal?.discountPercentage ?? 0),
);
const hasActiveDeal = (product) => Boolean(value(product, "hasActiveDeal", false)) || discountPercentage(product) > 0;
const effectivePrice = (product) => {
  const regularPrice = value(product, "price", 0);
  const suppliedFinalPrice = value(product, "finalPrice", null);
  if (hasActiveDeal(product) && suppliedFinalPrice != null) return Number(suppliedFinalPrice);
  return hasActiveDeal(product) ? Number(regularPrice) * (1 - discountPercentage(product) / 100) : Number(regularPrice);
};
const createdAt = (product) => value(product, "createdAt", null);
const sortLabels = {
  priceLow: "Price: Low to High", priceHigh: "Price: High to Low",
  nameAZ: "Name: A to Z", nameZA: "Name: Z to A", newest: "Newest",
  stockLow: "Stock: Low to High", stockHigh: "Stock: High to Low",
};

const CustomerProducts = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const stock = params.get("stock") || "all";
  const seller = params.get("seller") || "all";
  const sortBy = params.get("sort") || "default";
  const deal = params.get("deal") || "all";
  const [priceDraft, setPriceDraft] = useState({ min: minPrice, max: maxPrice });
  const [priceError, setPriceError] = useState("");

  useEffect(() => setPriceDraft({ min: minPrice, max: maxPrice }), [minPrice, maxPrice]);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCustomerProducts();
        setProducts(Array.isArray(data) ? data : data?.products || data?.items || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally { setLoading(false); }
    };
    const loadCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await getCustomerCategories();
        setCategories(Array.isArray(data) ? data : data?.categories || data?.items || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      } finally { setCategoryLoading(false); }
    };
    load(); loadCategories();
  }, []);

  const sellers = useMemo(() => {
    const unique = new Map();
    products.forEach((product) => {
      const id = String(value(product, "sellerId"));
      if (id) unique.set(id, value(product, "sellerName", "Unknown seller"));
    });
    return [...unique.entries()];
  }, [products]);
  const stockSummary = useMemo(() => products.reduce((summary, product) => {
    const quantity = Number(value(product, "stock", 0));
    if (quantity <= 0) summary.outOfStock += 1;
    else if (quantity <= LOW_STOCK_LIMIT) summary.lowStock += 1;
    else summary.inStock += 1;
    return summary;
  }, { inStock: 0, lowStock: 0, outOfStock: 0 }), [products]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, item]) => {
      if (item === "" || item === "all" || item == null) next.delete(key);
      else next.set(key, String(item));
    });
    setParams(next);
  };
  const clearAll = () => { setPriceDraft({ min: "", max: "" }); setPriceError(""); setParams(new URLSearchParams()); };
  const applyPrice = (event) => {
    event.preventDefault();
    const min = priceDraft.min.trim(), max = priceDraft.max.trim();
    const minValue = min === "" ? null : Number(min), maxValue = max === "" ? null : Number(max);
    if ((min !== "" && (!Number.isFinite(minValue) || minValue < 0)) || (max !== "" && (!Number.isFinite(maxValue) || maxValue < 0))) {
      setPriceError("Prices must be valid amounts of zero or more."); return;
    }
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      setPriceError("Minimum price cannot be greater than maximum price."); return;
    }
    setPriceError(""); update({ minPrice: min, maxPrice: max });
  };
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim(), min = minPrice === "" ? null : Number(minPrice), max = maxPrice === "" ? null : Number(maxPrice);

    // Look up the category name so we can fall back to a name-based
    // comparison — the home-page category tile may link to /products
    // with a slug ("fashion") instead of a numeric id when the API
    // hasn't returned yet, and we still want the filter to work.
    const activeCategory = category
      ? categories.find(
          (item) =>
            String(value(item, "id")) === String(category) ||
            String(value(item, "name", ""))
              .trim()
              .toLowerCase() ===
              String(category).trim().toLowerCase(),
        )
      : null;
    const activeCategoryName = activeCategory
      ? String(value(activeCategory, "name", "")).trim().toLowerCase()
      : null;

    const sorted = [...products.filter((product) => {
      const productStock = Number(value(product, "stock", 0));
      const matchesSearch = !term || [value(product, "name"), value(product, "description")].join(" ").toLowerCase().includes(term);
      const productCategoryId = Number(value(product, "categoryId", 0));
      const productCategoryName = String(
        value(product, "categoryName") ?? "",
      )
        .trim()
        .toLowerCase();
      const matchesCategory =
        !category ||
        productCategoryId === Number(category) ||
        (activeCategoryName &&
          productCategoryName === activeCategoryName);
      return matchesCategory && matchesSearch &&
        (min === null || effectivePrice(product) >= min) && (max === null || effectivePrice(product) <= max) &&
        (stock === "all" || (stock === "in" ? productStock > LOW_STOCK_LIMIT : stock === "low" ? productStock > 0 && productStock <= LOW_STOCK_LIMIT : productStock <= 0)) &&
        (seller === "all" || String(value(product, "sellerId")) === seller) &&
        (deal === "all" || (deal === "on" ? hasActiveDeal(product) : !hasActiveDeal(product)));
    })];
    const compareName = (a, b) => String(value(a, "name")).localeCompare(String(value(b, "name")));
    if (sortBy === "priceLow") sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    else if (sortBy === "priceHigh") sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    else if (sortBy === "nameAZ") sorted.sort(compareName);
    else if (sortBy === "nameZA") sorted.sort((a, b) => compareName(b, a));
    else if (sortBy === "newest") sorted.sort((a, b) => new Date(createdAt(b) || 0) - new Date(createdAt(a) || 0));
    else if (sortBy === "stockLow") sorted.sort((a, b) => Number(value(a, "stock", 0)) - Number(value(b, "stock", 0)));
    else if (sortBy === "stockHigh") sorted.sort((a, b) => Number(value(b, "stock", 0)) - Number(value(a, "stock", 0)));
    return sorted;
  }, [products, search, category, minPrice, maxPrice, stock, seller, deal, sortBy, categories]);
  const dealCount = useMemo(() => products.filter(hasActiveDeal).length, [products]);
  const hasFilters = Boolean(search || category || minPrice || maxPrice || stock !== "all" || seller !== "all" || deal !== "all" || sortBy !== "default");

  return <div className="container py-4">
    <div className="mb-4"><h2 className="fw-bold">All Products</h2>{search && <p className="text-muted mb-0">Search results for: <strong>{search}</strong></p>}</div>
    <section className="card border-0 shadow-sm mb-4" aria-label="Product filters"><div className="card-body">
      <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0">Filter products</h5>{hasFilters && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearAll}>🔄 Clear Filters</button>}</div>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label" htmlFor="product-search">🔎 Search</label>
          <div className="input-group">
            <input id="product-search" className="form-control" type="search" value={search} onChange={(event) => update({ search: event.target.value })} placeholder="Search products by name or description..." />
            {search && <button type="button" className="btn btn-outline-secondary" onClick={() => update({ search: "" })}>Clear</button>}
          </div>
        </div>
        <div className="col-md-3"><label className="form-label" htmlFor="category-filter">📂 Category</label><select id="category-filter" className="form-select" value={category || "all"} disabled={categoryLoading} onChange={(event) => update({ category: event.target.value === "all" ? "" : event.target.value })}><option value="all">All categories</option>{categories.map((item) => <option key={value(item, "id")} value={value(item, "id")}>{value(item, "name", "Category")}</option>)}</select></div>
        <div className="col-md-3"><label className="form-label" htmlFor="stock-filter">📦 Stock Availability</label><select id="stock-filter" className="form-select" value={stock} onChange={(event) => update({ stock: event.target.value })}><option value="all">All products</option><option value="in">In stock (6+)</option><option value="low">Low stock (1–5)</option><option value="out">Out of stock</option></select></div>
        <div className="col-md-3"><label className="form-label" htmlFor="seller-filter">👤 Seller</label><select id="seller-filter" className="form-select" value={seller} onChange={(event) => update({ seller: event.target.value })}><option value="all">All sellers</option>{sellers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div>
        <div className="col-md-3"><label className="form-label" htmlFor="deal-filter">🔥 Deals</label><select id="deal-filter" className="form-select" value={deal} onChange={(event) => update({ deal: event.target.value })}><option value="all">All products</option><option value="on">On deal</option><option value="regular">Regular price</option></select></div>
        <div className="col-md-3"><label className="form-label" htmlFor="sort-products">↕️ Sort Products</label><select id="sort-products" className="form-select" value={sortBy} onChange={(event) => update({ sort: event.target.value })}><option value="default">Default</option><option value="priceLow">Price: Low to High</option><option value="priceHigh">Price: High to Low</option><option value="nameAZ">Name: A to Z</option><option value="nameZA">Name: Z to A</option><option value="newest">Newest</option><option value="stockLow">Stock: Low to High</option><option value="stockHigh">Stock: High to Low</option></select></div>
      </div>
      <form className="mt-4" onSubmit={applyPrice} noValidate><label className="form-label fw-semibold">💰 Price Range</label><div className="row g-3 align-items-start">
        <div className="col-md-4"><input className={`form-control ${priceError ? "is-invalid" : ""}`} type="number" min="0" step="any" inputMode="decimal" placeholder="Minimum price" value={priceDraft.min} onChange={(event) => { setPriceDraft((current) => ({ ...current, min: event.target.value })); setPriceError(""); }} aria-label="Minimum price" /></div>
        <div className="col-md-4"><input className={`form-control ${priceError ? "is-invalid" : ""}`} type="number" min="0" step="any" inputMode="decimal" placeholder="Maximum price" value={priceDraft.max} onChange={(event) => { setPriceDraft((current) => ({ ...current, max: event.target.value })); setPriceError(""); }} aria-label="Maximum price" /></div>
        <div className="col-md-4 d-flex gap-2"><button className="btn btn-primary flex-grow-1" type="submit">Apply Price</button><button className="btn btn-outline-secondary" type="button" onClick={() => { setPriceDraft({ min: "", max: "" }); setPriceError(""); update({ minPrice: "", maxPrice: "" }); }}>Clear price</button></div>
      </div>{priceError && <div className="invalid-feedback d-block" role="alert">{priceError}</div>}<div className="d-flex gap-2 flex-wrap mt-3">{ranges.map(([label, min, max]) => <button key={label} type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setPriceDraft({ min, max }); setPriceError(""); update({ minPrice: min, maxPrice: max }); }}>{label}</button>)}</div></form>
    </div></section>
    {dealCount > 0 && <div className="alert alert-danger mb-4">🔥 <strong>{dealCount}</strong> product{dealCount !== 1 ? "s" : ""} currently {dealCount !== 1 ? "have" : "has"} active deals.</div>}
    <section className="row g-2 mb-4" aria-label="Stock summary">
      <div className="col-md-4"><div className="card border-success h-100"><div className="card-body text-center"><h6 className="text-success">In Stock</h6><h3>{stockSummary.inStock}</h3><small className="text-muted">More than {LOW_STOCK_LIMIT} items</small></div></div></div>
      <div className="col-md-4"><div className="card border-warning h-100"><div className="card-body text-center"><h6 className="text-warning">Low Stock</h6><h3>{stockSummary.lowStock}</h3><small className="text-muted">1–{LOW_STOCK_LIMIT} items remaining</small></div></div></div>
      <div className="col-md-4"><div className="card border-danger h-100"><div className="card-body text-center"><h6 className="text-danger">Out of Stock</h6><h3>{stockSummary.outOfStock}</h3><small className="text-muted">No items available</small></div></div></div>
    </section>
    {!categoryLoading && <section className="mb-4" aria-label="Category shortcuts">
      <h5 className="fw-bold mb-3">Categories</h5>
      <div className="d-flex gap-2 flex-wrap">
        <button type="button" className={!category ? "btn btn-primary" : "btn btn-outline-primary"} onClick={() => update({ category: "" })}>All Categories</button>
        {categories.map((item) => {
          const id = String(value(item, "id"));
          return <button key={id} type="button" className={category === id ? "btn btn-primary" : "btn btn-outline-primary"} onClick={() => update({ category: id })}>{value(item, "name", "Category")}</button>;
        })}
      </div>
    </section>}
    {hasFilters && <div className="d-flex gap-2 flex-wrap mb-3" aria-label="Active filters">
      {search && <span className="badge bg-secondary">Search: {search}</span>}
      {category && <span className="badge bg-primary">Category: {categories.find((item) => String(value(item, "id")) === category)?.name || "Selected"}</span>}
      {(minPrice || maxPrice) && <span className="badge bg-success">Price: {minPrice ? `Rs. ${Number(minPrice).toLocaleString()}` : "Rs. 0"} – {maxPrice ? `Rs. ${Number(maxPrice).toLocaleString()}` : "No limit"}</span>}
      {stock !== "all" && <span className="badge bg-info text-dark">Stock: {stock === "in" ? "In stock" : stock === "low" ? "Low stock" : "Out of stock"}</span>}
      {seller !== "all" && <span className="badge bg-dark">Seller: {sellers.find(([id]) => id === seller)?.[1] || "Selected"}</span>}
      {deal !== "all" && <span className="badge bg-danger">Deal: {deal === "on" ? "On deal" : "Regular price"}</span>}
      {sortBy !== "default" && <span className="badge bg-primary">Sort: {sortLabels[sortBy]}</span>}
    </div>}
    <div className="d-flex justify-content-between mb-3"><span className="text-muted">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</span></div>
    {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-3 text-muted">Loading products...</p></div>
      : filtered.length ? <div className="row g-4">{filtered.map((product) => <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={value(product, "id")}><ProductCard product={product} /></div>)}</div>
      : <div className="text-center py-5"><div className="display-4 mb-3">🛍️</div><h4>No Products Found</h4><p className="text-muted">Try changing or clearing one of your filters.</p>{hasFilters && <button type="button" className="btn btn-primary" onClick={clearAll}>Clear Filters</button>}</div>}
  </div>;
};

export default CustomerProducts;
