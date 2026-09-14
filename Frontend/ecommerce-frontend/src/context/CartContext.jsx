import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  addToCart as apiAddToCart,
  clearCart as apiClearCart,
  getCart as apiGetCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItem as apiUpdateCartItem,
} from "../services/cartService";

// One single source of truth for the customer's cart.
//
// Why a context?
//  - Every cart action (Add / Update / Remove / Clear) used to live in
//    a different page component, each one independently firing the
//    "cart-updated" event and refetching the cart. Easy to forget.
//  - With a context, the navbar count, the cart page, and the product
//    page all read from the SAME state. Any action updates that state
//    in one place, then dispatches "cart-updated" for any legacy code
//    that still listens for the event.
//
// Backwards compat:
//  - We still dispatch window event "cart-updated" after every mutation
//    so any existing listener (e.g. older third-party widgets) keeps
//    working.
//  - We also listen for the same event so the context re-syncs if some
//    other code mutates the cart without going through the context.

const CART_UPDATED_EVENT = "cart-updated";

const CartContext = createContext(null);

const sumQuantity = (items) =>
  (items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0);

const emptyCart = () => ({
  cartId: null,
  items: [],
  subTotal: 0,
  totalItems: 0,
});

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  const isCustomer =
    isAuthenticated && (user?.role || "").toLowerCase() === "customer";

  const [cart, setCart] = useState(emptyCart());
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // ---------- core fetch ----------

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setCart(emptyCart());
      setError("");
      return null;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiGetCart();

      const next = {
        cartId: data?.cartId ?? null,
        items: Array.isArray(data?.items) ? data.items : [],
        subTotal: Number(data?.subTotal ?? 0),
        totalItems: Number(data?.totalItems ?? 0),
      };

      setCart(next);

      return next;
    } catch (err) {
      console.error("Cart refresh error:", err);

      // 401/403 is handled by the api.js interceptor (redirects to login).
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setError(
          err.response?.data?.message || "Unable to load your cart.",
        );
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  // ---------- initial load + auth changes ----------

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---------- listen for external "cart-updated" events ----------
  // (e.g. legacy code paths that mutate the cart outside the context).

  useEffect(() => {
    const handler = () => {
      refresh();
    };

    window.addEventListener(CART_UPDATED_EVENT, handler);

    return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
  }, [refresh]);

  // ---------- emit helper ----------

  const emitUpdated = useCallback(() => {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }, []);

  // ---------- mutations ----------

  const addItem = useCallback(
    async (productId, quantity) => {
      try {
        setBusy(true);
        setError("");

        const updated = await apiAddToCart(productId, quantity);

        setCart({
          cartId: updated?.cartId ?? cart.cartId,
          items: Array.isArray(updated?.items) ? updated.items : [],
          subTotal: Number(updated?.subTotal ?? 0),
          totalItems: Number(updated?.totalItems ?? 0),
        });

        emitUpdated();

        return updated;
      } catch (err) {
        console.error("Cart addItem error:", err);
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [cart.cartId, emitUpdated],
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      try {
        setBusy(true);
        setError("");

        const updated = await apiUpdateCartItem(itemId, quantity);

        setCart({
          cartId: updated?.cartId ?? cart.cartId,
          items: Array.isArray(updated?.items) ? updated.items : [],
          subTotal: Number(updated?.subTotal ?? 0),
          totalItems: Number(updated?.totalItems ?? 0),
        });

        emitUpdated();

        return updated;
      } catch (err) {
        console.error("Cart updateItem error:", err);
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [cart.cartId, emitUpdated],
  );

  const removeItem = useCallback(
    async (itemId) => {
      try {
        setBusy(true);
        setError("");

        await apiRemoveCartItem(itemId);

        emitUpdated();

        await refresh();
      } catch (err) {
        console.error("Cart removeItem error:", err);
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [emitUpdated, refresh],
  );

  const clearItems = useCallback(async () => {
    try {
      setBusy(true);
      setError("");

      await apiClearCart();

      emitUpdated();

      await refresh();
    } catch (err) {
      console.error("Cart clearItems error:", err);
      throw err;
    } finally {
      setBusy(false);
    }
  }, [emitUpdated, refresh]);

  // ---------- derived ----------

  const cartCount = useMemo(() => sumQuantity(cart.items), [cart.items]);

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      loading,
      busy,
      error,
      isCustomer,
      addItem,
      updateItem,
      removeItem,
      clearItems,
      refresh,
    }),
    [
      cart,
      cartCount,
      loading,
      busy,
      error,
      isCustomer,
      addItem,
      updateItem,
      removeItem,
      clearItems,
      refresh,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);

  if (ctx == null) {
    throw new Error("useCart must be used within a <CartProvider>.");
  }

  return ctx;
};
