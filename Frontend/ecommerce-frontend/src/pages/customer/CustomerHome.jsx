import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCustomerProducts,
  getCustomerCategories,
} from "../../services/productService";
import ProductCard from "../../components/ProductCard";
import useFadeInScroll from "../../hooks/useFadeInScroll";

// Curated fallback category list. We merge this with the dynamic API
// response so the page always has something to render even before the
// network call resolves.
const HERO_CATEGORIES = [
  { slug: "electronics", name: "Electronics", emoji: "💻", accent: "#38bdf8" },
  { slug: "fashion", name: "Fashion", emoji: "👗", accent: "#f472b6" },
  { slug: "home", name: "Home & Living", emoji: "🏠", accent: "#fbbf24" },
  { slug: "beauty", name: "Beauty", emoji: "💄", accent: "#c084fc" },
  { slug: "sports", name: "Sports", emoji: "⚽", accent: "#34d399" },
  { slug: "books", name: "Books", emoji: "📚", accent: "#fb7185" },
  { slug: "toys", name: "Toys", emoji: "🧸", accent: "#fb923c" },
  { slug: "grocery", name: "Grocery", emoji: "🛒", accent: "#2dd4bf" },
];

const PROMO_BADGES = [
  { icon: "🚚", label: "Free Shipping", sub: "On orders over Rs. 2,000" },
  { icon: "🔒", label: "Secure Payment", sub: "100% protected checkout" },
  { icon: "↩️", label: "Easy Returns", sub: "7-day return policy" },
  { icon: "💬", label: "24/7 Support", sub: "Real humans, real help" },
];

// Skeleton row used while the API call is in flight. Renders 4 placeholder
// cards so the layout doesn't shift when the real data arrives.
const ProductSkeletonRow = ({ count = 4 }) => (
  <div className="row g-4">
    {Array.from({ length: count }).map((_, idx) => (
      <div className="col-sm-6 col-lg-3" key={idx}>
        <div className="skeleton-card">
          <div className="skeleton skeleton-image" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        </div>
      </div>
    ))}
  </div>
);

// Category-tile skeleton — 8 placeholder tiles in the same grid shape.
const CategorySkeletonRow = ({ count = 8 }) => (
  <div className="row g-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div className="col-6 col-md-4 col-lg-3" key={idx}>
        <div
          className="skeleton"
          style={{ height: 72, borderRadius: "var(--radius-md)" }}
        />
      </div>
    ))}
  </div>
);

const CustomerHome = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState("");
  const [theme, setTheme] = useState(() => {
    // Persisted theme preference (defaults to light).
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("home-theme") || "light";
  });
  const navigate = useNavigate();

  // Wire the IntersectionObserver that powers the .fade-in animation.
  useFadeInScroll();

  // Apply theme to <html data-theme="..."> so the CSS variables resolve.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("home-theme", theme);
  }, [theme]);

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
    [products],
  );

  // Try to match the static tile to a real API category by name (the slug
  // and the API id may differ, but names line up). When matched, we use
  // the API's numeric id in the link so /products?category=... actually
  // filters. Falls back to the static tile's id (slug) if no match.
  const categoryTiles = useMemo(() => {
    if (!categories.length) return HERO_CATEGORIES;

    const byName = new Map(
      categories.map((c) => [
        String(c.name ?? c.Name ?? "").trim().toLowerCase(),
        c,
      ]),
    );

    return HERO_CATEGORIES.map((tile) => {
      const apiCategory =
        byName.get(tile.name.trim().toLowerCase()) ||
        byName.get(tile.slug);

      if (apiCategory) {
        return {
          ...tile,
          id: apiCategory.id ?? apiCategory.Id,
          name: apiCategory.name ?? apiCategory.Name ?? tile.name,
        };
      }

      return { ...tile, id: tile.slug };
    });
  }, [categories]);

  const submitHeroSearch = (event) => {
    event.preventDefault();
    const term = heroSearch.trim();
    navigate(`/products${term ? `?search=${encodeURIComponent(term)}` : ""}`);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div className="home-page">
      {/* ============== HERO ============== */}
      <section className="hero-section fade-in">
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

              <button
                type="button"
                className="btn btn-outline-light btn-sm mt-3"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
              </button>
            </div>

            <div className="col-lg-5 d-none d-lg-block">
              <div className="hero-card-stack">
                <div className="hero-float-card hero-float-card-1">
                  <div className="float-icon" style={{ background: "rgba(56, 189, 248, 0.2)" }}>🛍️</div>
                  <div>
                    <div className="float-title">Verified sellers</div>
                    <div className="float-sub">Every shop, vetted.</div>
                  </div>
                </div>
                <div className="hero-float-card hero-float-card-2">
                  <div className="float-icon" style={{ background: "rgba(124, 58, 237, 0.25)" }}>🏷️</div>
                  <div>
                    <div className="float-title">Hot deals</div>
                    <div className="float-sub">Up to 60% off daily.</div>
                  </div>
                </div>
                <div className="hero-float-card hero-float-card-3">
                  <div className="float-icon" style={{ background: "rgba(99, 102, 241, 0.25)" }}>🚚</div>
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
      <section className="container promo-strip fade-in">
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
      <section className="container category-section fade-in">
        <div className="section-head">
          <div>
            <h2 className="section-title">Shop by category</h2>
            <p className="section-subtitle">
              Pick what you love — we'll handle the rest.
            </p>
          </div>
          <Link to="/products" className="section-link">
            View all →
          </Link>
        </div>

        {loading ? (
          <CategorySkeletonRow count={HERO_CATEGORIES.length} />
        ) : (
          <div className="row g-3">
            {categoryTiles.map((cat) => (
              <div className="col-6 col-md-4 col-lg-3" key={cat.id ?? cat.slug}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="category-tile"
                  style={{
                    "--tile-accent": cat.accent,
                  }}
                >
                  <span className="category-emoji">{cat.emoji}</span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============== FEATURED PRODUCTS ============== */}
      <section className="container featured-section fade-in">
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
          <ProductSkeletonRow count={8} />
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
      {!loading && dealProducts.length > 0 && (
        <section className="container deals-section fade-in">
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
      <section className="container cta-section fade-in">
        <div className="cta-card">
          <div>
            <h3 className="cta-title">Ready to start shopping?</h3>
            <p className="cta-subtitle mb-0">
              Join thousands of happy customers who trust ShopSpot for their
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
