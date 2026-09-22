import React, { useEffect, useRef, useState } from "react";
import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getCustomerUnreadCount } from "../services/messageService";

const CustomerLayout = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Keep the navbar search box in sync with the URL so it shows
  // whatever query is currently active in /products?search=...
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const isCustomer = isAuthenticated && user?.role === "Customer";

  // Customer-side unread message badge — polled every 30s. Customer
  // can also re-trigger by hitting the messages page.
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isCustomer) {
      setUnreadMessages(0);
      return undefined;
    }

    let cancelled = false;

    const refreshUnread = async () => {
      try {
        const data = await getCustomerUnreadCount();
        if (!cancelled) {
          setUnreadMessages(Number(data?.unreadCount) || 0);
        }
      } catch (err) {
        // Unread count is non-critical; ignore failures silently.
      }
    };

    refreshUnread();
    const timer = setInterval(refreshUnread, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isCustomer, location.pathname]);

  // Pulse the cart badge when the count changes (e.g. add / remove).
  const prevCountRef = useRef(cartCount);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prevCountRef.current !== cartCount) {
      prevCountRef.current = cartCount;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [cartCount]);

  // When the URL changes (e.g. user clicked a category button on the
  // /products page), reflect the new search term in the navbar input.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    navigate(`/products${term ? `?search=${encodeURIComponent(term)}` : ""}`);
  };

  const clearSearch = () => {
    setSearch("");
    const params = new URLSearchParams(location.search);
    params.delete("search");
    const qs = params.toString();
    navigate(`/products${qs ? `?${qs}` : ""}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      {/* Top promotional strip — adds color and a "real shop" feel */}
      <div className="top-strip d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <span>🚚 Free shipping on orders over Rs. 2,000</span>
          <span>📞 Support: support@ecommerce.local</span>
        </div>
      </div>

      <nav className="customer-navbar sticky-top">
        <div className="container">
          <div className="navbar-row">
            {/* Brand */}
            <Link className="navbar-brand-custom" to="/">
              <span className="brand-icon">🛒</span>
              <span className="brand-text">
                Shop<span className="brand-accent">Sphere</span>
              </span>
            </Link>

            {/* Center search — visible on lg+ */}
            <form
              className="navbar-search d-none d-lg-flex"
              onSubmit={submitSearch}
              role="search"
            >
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                className="form-control search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for products, brands and more…"
                aria-label="Product search"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
              <button className="btn search-btn" type="submit">
                Search
              </button>
            </form>

            {/* Right side actions */}
            <div className="navbar-actions">
              <NavLink to="/products" className="action-link d-none d-md-inline-flex">
                <span className="action-icon">🛍️</span>
                <span className="action-label">Products</span>
              </NavLink>

              {isCustomer && (
                <NavLink to="/cart" className="action-link cart-link">
                  <span className="action-icon">
                    🛒
                    {cartCount > 0 && (
                      <span
                        className={
                          "cart-pill" + (pulse ? " cart-badge-pulse" : "")
                        }
                        key={cartCount}
                      >
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="action-label d-none d-md-inline">Cart</span>
                </NavLink>
              )}

              {isCustomer && (
                <NavLink to="/orders" className="action-link d-none d-md-inline-flex">
                  <span className="action-icon">📦</span>
                  <span className="action-label">Orders</span>
                </NavLink>
              )}

              {isCustomer && (
                <NavLink
                  to="/messages"
                  className="action-link d-none d-md-inline-flex"
                >
                  <span
                    className="action-icon position-relative"
                    aria-label={
                      unreadMessages > 0
                        ? `${unreadMessages} unread messages`
                        : "Messages"
                    }
                  >
                    💬
                    {unreadMessages > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                        <span className="visually-hidden">unread</span>
                      </span>
                    )}
                  </span>
                  <span className="action-label">Messages</span>
                </NavLink>
              )}

              {isAuthenticated ? (
                <div className="user-chip">
                  <span className="user-avatar">
                    {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <button
                    className="btn btn-link logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary login-btn">
                  Login
                </Link>
              )}

              {/* Mobile toggler — opens a panel that contains the search */}
              <button
                className="navbar-toggler-btn d-lg-none"
                type="button"
                onClick={() => {
                  const panel = document.getElementById("mobilePanel");
                  if (panel) panel.classList.toggle("open");
                }}
                aria-label="Toggle menu"
              >
                <span className="toggler-bar" />
                <span className="toggler-bar" />
                <span className="toggler-bar" />
              </button>
            </div>
          </div>

          {/* Mobile panel: search + nav links */}
          <div id="mobilePanel" className="mobile-panel d-lg-none">
            <form
              className="navbar-search mobile-search"
              onSubmit={submitSearch}
              role="search"
            >
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                className="form-control search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products…"
                aria-label="Product search"
              />
              <button className="btn search-btn" type="submit">
                Go
              </button>
            </form>

            <div className="mobile-nav">
              <NavLink to="/" end onClick={() => document.getElementById("mobilePanel")?.classList.remove("open")}>
                🏠 Home
              </NavLink>
              <NavLink to="/products" onClick={() => document.getElementById("mobilePanel")?.classList.remove("open")}>
                🛍️ Products
              </NavLink>
              {isCustomer && (
                <>
                  <NavLink to="/cart" onClick={() => document.getElementById("mobilePanel")?.classList.remove("open")}>
                    🛒 Cart
                  </NavLink>
                  <NavLink to="/orders" onClick={() => document.getElementById("mobilePanel")?.classList.remove("open")}>
                    📦 My Orders
                  </NavLink>
                  <NavLink to="/messages" onClick={() => document.getElementById("mobilePanel")?.classList.remove("open")}>
                    💬 Messages
                  </NavLink>
                  <NavLink to="/profile" onClick={() => document.getElementById("mobilePanel")?.classList.remove("open")}>
                    👤 Profile
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="footer-title">
                <span className="brand-icon">🛒</span> ShopSphere
              </h5>
              <p className="text-muted small mb-0">
                Your trusted online marketplace. Discover great products from
                verified sellers, with secure payments and fast delivery.
              </p>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="footer-title">Shop</h6>
              <ul className="footer-list">
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products">Categories</Link></li>
                <li><Link to="/products">Deals</Link></li>
              </ul>
            </div>
            <div className="col-6 col-md-2">
              <h6 className="footer-title">Account</h6>
              <ul className="footer-list">
                <li><Link to="/login">Sign in</Link></li>
                <li><Link to="/register">Sign up</Link></li>
                <li><Link to="/orders">My orders</Link></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h6 className="footer-title">Stay in the loop</h6>
              <p className="text-muted small">
                Subscribe to our newsletter for the latest deals.
              </p>
              <form
                className="d-flex gap-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                />
                <button className="btn btn-primary" type="submit">
                  Join
                </button>
              </form>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="d-flex justify-content-between flex-wrap small text-muted">
            <span>© {new Date().getFullYear()} ShopSphere. All rights reserved.</span>
            <span>Built with ❤ for online shoppers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
