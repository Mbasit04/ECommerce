import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCustomerProducts,
  getCustomerCategories,
} from "../../services/productService";
import ProductCard from "../../components/ProductCard";

const HERO_CATEGORIES = [
  { id: "electronics", name: "Electronics", emoji: "💻", color: "#e0f2fe" },
  { id: "fashion", name: "Fashion", emoji: "👗", color: "#fce7f3" },
  { id: "home", name: "Home & Living", emoji: "🏠", color: "#fef3c7" },
  { id: "beauty", name: "Beauty", emoji: "💄", color: "#fae8ff" },
  { id: "sports", name: "Sports", emoji: "⚽", color: "#dcfce7" },
  { id: "books", name: "Books", emoji: "📚", color: "#fee2e2" },
  { id: "toys", name: "Toys", emoji: "🧸", color: "#fed7aa" },
  { id: "grocery", name: "Grocery", emoji: "🛒", color: "#ccfbf1" },
];

const PROMO_BADGES = [
  { icon: "🚚", label: "Free Shipping", sub: "On orders over Rs. 2,000" },
  { icon: "🔒", label: "Secure Payment", sub: "100% protected checkout" },
  { icon: "↩️", label: "Easy Returns", sub: "7-day return policy" },
  { icon: "💬", label: "24/7 Support", sub: "Real humans, real help" },
];

const CustomerHome = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [productList, categoryList] = await Promise.all([
          getCustomerProducts(),
          getCustomerCategories().catch(() => []),
        ]);

        if (cancelled) return;

        const prods = Array.isArray(productList)
          ? productList
          : productList?.products || productList?.items || [];

        setProducts(prods);

        if (Array.isArray(categoryList) && categoryList.length) {
          setCategories(categoryList);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load home data:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => products.slice(0, 8), [products]);
  const dealProducts = useMemo(
    () =>
      products
        .filter((p) => p.hasActiveDeal || p.discountPercentage > 0)
        .slice(0, 4),
    [products]
  );

  // Merge dynamic categories from API with the static curated list so we
  // always have a reasonable tile set, even before the API returns.
  const categoryTiles = useMemo(() => {
    if (!categories.length) return HERO_CATEGORIES;
    return HERO_CATEGORIES.map((tile) => {
      const match = categories.find(
        (c) =>
          String(c.id ?? c.Id).toLowerCase() ===
          String(tile.id).toLowerCase()
      );
      return match ? { ...tile, id: match.id, name: match.name } : tile;
    });
  }, [categories]);

  const submitHeroSearch = (event) => {
    event.preventDefault();
    const term = heroSearch.trim();
    navigate(`/products${term ? `?search=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <div className="home-page">
      {/* ============== HERO ============== */}
      <section className="hero-section">
        <div className="hero-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
        </div>
        <div className="container hero-inner">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="hero-eyebrow">✨ New season, new finds</span>
              <h1 className="hero-title">
                Shop smarter.<br />
                <span className="hero-title-accent">Live better.</span>
              </h1>
              <p className="hero-subtitle">
                Discover handpicked products from trusted sellers — all in one
                place. Great deals, fast delivery, and a checkout that just works.
              </p>

              <form className="hero-search" onSubmit={submitHeroSearch}>
                <span className="hero-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  className="form-control"
                  value={heroSearch}
                  onChange={(event) => setHeroSearch(event.target.value)}
                  placeholder="What are you looking for today?"
                  aria-label="Search products"
                />
                <button className="btn btn-primary" type="submit">
                  Search
                </button>
              </form>

              <div className="hero-trust">
                <div className="trust-avatars">
                  <span className="trust-avatar" style={{ background: "#fde68a" }}>A</span>
                  <span className="trust-avatar" style={{ background: "#bbf7d0" }}>M</span>
                  <span className="trust-avatar" style={{ background: "#bfdbfe" }}>S</span>
                  <span className="trust-avatar" style={{ background: "#fbcfe8" }}>K</span>
                </div>
                <span>
                  <strong>4.8★</strong> from 2,000+ happy shoppers
                </span>
              </div>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-card-stack">
                <div className="hero-float-card hero-float-card-1">
                  <div className="float-icon" style={{ background: "#dcfce7" }}>🛍️</div>
                  <div>
                    <div className="float-title">Verified sellers</div>
                    <div className="float-sub">Every shop, vetted.</div>
                  </div>
                </div>
                <div className="hero-float-card hero-float-card-2">
                  <div className="float-icon" style={{ background: "#fef3c7" }}>🏷️</div>
                  <div>
                    <div className="float-title">Hot deals</div>
                    <div className="float-sub">Up to 60% off daily.</div>
                  </div>
                </div>
                <div className="hero-float-card hero-float-card-3">
                  <div className="float-icon" style={{ background: "#dbeafe" }}>🚚</div>
                  <div>
                    <div className="float-title">Free shipping</div>
                    <div className="float-sub">On orders over Rs. 2,000.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PROMO BADGES ============== */}
      <section className="container promo-strip">
        <div className="row g-3">
          {PROMO_BADGES.map((badge) => (
            <div className="col-6 col-md-3" key={badge.label}>
              <div className="promo-badge">
                <span className="promo-icon">{badge.icon}</span>
                <div>
                  <div className="promo-label">{badge.label}</div>
                  <div className="promo-sub">{badge.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== CATEGORIES ============== */}
      <section className="container category-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Shop by category</h2>
            <p className="section-subtitle">Pick what you love — we'll handle the rest.</p>
          </div>
          <Link to="/products" className="section-link">
            View all →
          </Link>
        </div>

        <div className="row g-3">
          {categoryTiles.map((cat) => (
            <div className="col-6 col-md-4 col-lg-3" key={cat.id}>
              <Link
                to={`/products?category=${cat.id}`}
                className="category-tile"
                style={{ background: cat.color }}
              >
                <span className="category-emoji">{cat.emoji}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============== FEATURED PRODUCTS ============== */}
      <section className="container featured-section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Featured products</h2>
            <p className="section-subtitle">
              Handpicked favourites from our sellers this week.
            </p>
          </div>
          <Link to="/products" className="section-link">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading products…</span>
            </div>
          </div>
        ) : featured.length === 0 ? (
          <div className="empty-card">
            <div className="display-4 mb-2">🛍️</div>
            <h5>No products available yet</h5>
            <p className="text-muted mb-0">
              Check back soon — our sellers are adding new items every day.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {featured.map((product) => (
              <div className="col-sm-6 col-lg-3" key={product.id ?? product.Id}>
                <ProductCard product={product} variant="compact" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============== DEALS BANNER ============== */}
      {dealProducts.length > 0 && (
        <section className="container deals-section">
          <div className="deals-card">
            <div className="row align-items-center g-4">
              <div className="col-md-5">
                <span className="deals-eyebrow">🔥 Limited time</span>
                <h2 className="deals-title">Hot deals happening now</h2>
                <p className="deals-subtitle">
                  Real discounts from real sellers. Stock is moving fast — grab
                  yours before it's gone.
                </p>
                <Link to="/products" className="btn btn-light btn-lg">
                  Shop all deals
                </Link>
              </div>
              <div className="col-md-7">
                <div className="row g-3">
                  {dealProducts.map((product) => (
                    <div className="col-6" key={product.id ?? product.Id}>
                      <ProductCard product={product} variant="compact" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============== CTA ============== */}
      <section className="container cta-section">
        <div className="cta-card">
          <div>
            <h3 className="cta-title">Ready to start shopping?</h3>
            <p className="cta-subtitle mb-0">
              Join thousands of happy customers who trust ShopSphere for their
              everyday essentials.
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse products
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHome;
