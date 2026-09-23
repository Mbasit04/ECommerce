import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST: attach JWT to every outgoing call.
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE: route common error envelopes into predictable UX.
//   - 401 / 403  → clear session and bounce to /login
//   - 409        → "record changed, please refresh" toast
//   - 5xx / net  → generic "something went wrong" toast
//
// We deliberately do NOT show a toast for 4xx other than 401/403/409
// because the per-screen handlers (CheckoutPage, CartPage, etc.) already
// toast the precise backend message (out of stock, invalid qty, etc.).
// Showing a duplicate here would be noise.
// ============================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn("Unauthorized/Forbidden response. Clearing session token.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    if (status === 409) {
      const message =
        error.response?.data?.message ||
        "This record was updated by someone else. Please refresh and try again.";

      toast.warning(message);
      return Promise.reject(error);
    }

    if (status >= 500) {
      toast.error("Something went wrong. Please try again later.");
      return Promise.reject(error);
    }

    if (!error.response) {
      // Network error / backend down
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
