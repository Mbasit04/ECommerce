import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSellerUnreadCount } from "../services/sellerService";

const SellerLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [unreadMessages, setUnreadMessages] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Poll the seller-side unread count so the sidebar badge stays in sync.
  useEffect(() => {
    let cancelled = false;
    let timer;

    const refresh = async () => {
      try {
        const token = localStorage.getItem("token");

        // Skip polling when no token is present — avoids the 401 redirect
        // cascade from api.js when the user hasn't logged in yet.
        if (!token) {
          return;
        }

        const data = await getSellerUnreadCount();
        if (!cancelled) {
          setUnreadMessages(Number(data?.unreadCount) || 0);
        }
      } catch (err) {
        // Unread count is non-critical; ignore failures silently.
      }
    };

    refresh();
    timer = setInterval(refresh, 30000);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="d-flex min-vh-100">
      <div className="bg-dark text-white p-3" style={{ width: "250px" }}>
        <h4 className="mb-4">Seller Panel</h4>

        <div className="d-flex flex-column gap-2">
          <Link
            to="/seller/dashboard"
            className="text-white text-decoration-none p-2 rounded"
          >
            Dashboard
          </Link>

          <Link
            to="/seller/profile"
            className="text-white text-decoration-none p-2 rounded"
          >
            My Profile
          </Link>

          <Link
            to="/seller/products"
            className="text-white text-decoration-none p-2 rounded"
          >
            My Products
          </Link>

          <Link
            to="/seller/products/add"
            className="text-white text-decoration-none p-2 rounded"
          >
            Add Product
          </Link>

          <Link
            to="/seller/stocks"
            className="text-white text-decoration-none p-2 rounded"
          >
            Stock Management
          </Link>

          <Link
            to="/seller/stocks/history"
            className="text-white text-decoration-none p-2 rounded"
          >
            Stock History
          </Link>

          <Link
            to="/seller/deals"
            className="text-white text-decoration-none p-2 rounded"
          >
            My Deals
          </Link>

          <Link
            to="/seller/deals/add"
            className="text-white text-decoration-none p-2 rounded"
          >
            Create Deal
          </Link>

          <Link
            to="/seller/orders"
            className="text-white text-decoration-none p-2 rounded"
          >
            Orders Received
          </Link>

          <Link
            to="/seller/reviews"
            className="text-white text-decoration-none p-2 rounded"
          >
            Customer Reviews
          </Link>

          <Link
            to="/seller/messages"
            className="text-white text-decoration-none p-2 rounded d-flex justify-content-between align-items-center"
          >
            <span>Messages</span>
            {unreadMessages > 0 && (
              <span
                className="badge bg-danger rounded-pill"
                title={`${unreadMessages} unread`}
              >
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </Link>

          <hr />

          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      <main className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
