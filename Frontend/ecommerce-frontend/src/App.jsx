import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import SellerRoute from "./routes/SellerRoute";
import CustomerRoute from "./routes/CustomerRoute";

import AdminLayout from "./layouts/AdminLayout";
import SellerLayout from "./layouts/SellerLayout";
import CustomerLayout from "./layouts/CustomerLayout";

import Login from "./pages/auth/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Sellers from "./pages/admin/Sellers";
import AddSeller from "./pages/admin/AddSeller";
import EditSeller from "./pages/admin/EditSeller";

import Customers from "./pages/admin/Customers";
import AddCustomer from "./pages/admin/AddCustomer";
import EditCustomer from "./pages/admin/EditCustomer";

import Categories from "./pages/admin/Categories";
import AddCategory from "./pages/admin/AddCategory";
import EditCategory from "./pages/admin/EditCategory";

import Products from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";

import Orders from "./pages/admin/Orders";
import OrderDetails from "./pages/admin/OrderDetails";

import Stocks from "./pages/admin/Stocks";
import StockHistory from "./pages/admin/StockHistory";

import Deals from "./pages/admin/Deals";
import AddDeal from "./pages/admin/AddDeal";
import EditDeal from "./pages/admin/EditDeal";

import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProfile from "./pages/seller/SellerProfile";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerAddProduct from "./pages/seller/AddProduct";
import SellerEditProduct from "./pages/seller/EditProduct";
import SellerStocks from "./pages/seller/SellerStocks";
import SellerStockHistory from "./pages/seller/SellerStockHistory";
import MyDeals from "./pages/seller/MyDeals";
import SellerAddDeal from "./pages/seller/AddDeal";
import SellerEditDeal from "./pages/seller/EditDeal";
import ShippingManagement from "./pages/seller/ShippingManagement";

import CustomerMessages from "./pages/customer/CustomerMessages";
import Conversation from "./pages/customer/Conversation";
import MyOrders from "./pages/customer/MyOrders";
import ProductDetails from "./pages/customer/ProductDetails";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerProducts from "./pages/customer/CustomerProducts";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import StripeCheckout from "./pages/customer/StripeCheckout";
import CustomerProfile from "./pages/customer/CustomerProfile";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";

const Unauthorized = () => <h1>Unauthorized</h1>;

const CustomerDashboard = () => <h1>Customer Dashboard</h1>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<CustomerHome />} />
            <Route path="/products" element={<CustomerProducts />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />

                <Route path="sellers" element={<Sellers />} />
                <Route path="sellers/add" element={<AddSeller />} />
                <Route path="sellers/edit/:id" element={<EditSeller />} />

                <Route path="customers" element={<Customers />} />
                <Route path="customers/add" element={<AddCustomer />} />
                <Route path="customers/edit/:id" element={<EditCustomer />} />

                <Route path="categories" element={<Categories />} />
                <Route path="categories/add" element={<AddCategory />} />
                <Route path="categories/edit/:id" element={<EditCategory />} />

                <Route path="products" element={<Products />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />

                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetails />} />

                <Route path="stocks" element={<Stocks />} />
                <Route
                  path="stocks/:productId/history"
                  element={<StockHistory />}
                />

                <Route path="deals" element={<Deals />} />
                <Route path="deals/add" element={<AddDeal />} />
                <Route path="deals/edit/:id" element={<EditDeal />} />
              </Route>
            </Route>

            <Route element={<SellerRoute />}>
              <Route path="/seller" element={<SellerLayout />}>
                <Route index element={<SellerDashboard />} />

                <Route path="dashboard" element={<SellerDashboard />} />

                <Route path="profile" element={<SellerProfile />} />

                <Route path="/seller/products" element={<SellerProducts />} />

                <Route
                  path="/seller/products/add"
                  element={<SellerAddProduct />}
                />

                <Route
                  path="/seller/products/edit/:id"
                  element={<SellerEditProduct />}
                />

                <Route path="/seller/stocks" element={<SellerStocks />} />

                <Route
                  path="/seller/stocks/history"
                  element={<SellerStockHistory />}
                />

                <Route
                  path="/seller/stocks/:productId/history"
                  element={<SellerStockHistory />}
                />

                <Route path="deals" element={<MyDeals />} />

                <Route
                  path="deals/edit/:id"
                  element={<SellerEditDeal />}
                />

                <Route path="deals/add" element={<SellerAddDeal />} />

                <Route path="orders" element={<ShippingManagement />} />
              </Route>
            </Route>

            <Route element={<CustomerRoute />}>
              <Route element={<CustomerLayout />}>
                <Route path="/customer" element={<CustomerHome />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/customer/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/customer/checkout" element={<Checkout />} />
                <Route path="/checkout/stripe" element={<StripeCheckout />} />
                <Route path="/customer/checkout/stripe" element={<StripeCheckout />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/orders/:id" element={<MyOrders />} />
                <Route path="/customer/orders" element={<MyOrders />} />
                <Route path="/customer/orders/:id" element={<MyOrders />} />
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/customer/products/:id" element={<ProductDetails />} />
                <Route path="/messages" element={<CustomerMessages />} />
                <Route path="/messages/:id" element={<Conversation  />} />
              </Route>
            </Route>
          </Route>
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
