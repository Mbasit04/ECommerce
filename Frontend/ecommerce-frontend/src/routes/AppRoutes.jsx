import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import SellerLayout from '../layouts/SellerLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import SellerDashboard from '../pages/seller/SellerDashboard';
import MyDeals from '../pages/seller/MyDeals';
import AddDeal from '../pages/seller/AddDeal';
import EditDeal from '../pages/seller/EditDeal';
import ProductDetails from '../pages/customer/ProductDetails';
import CustomerProducts from '../pages/customer/CustomerProducts';
import CustomerHome from '../pages/customer/CustomerHome';
import CustomerMessages from '../pages/customer/CustomerMessages';
import Conversation from '../pages/customer/Conversation';
import MyOrders from '../pages/customer/MyOrders';
import OrderDetails from '../pages/customer/OrderDetails';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import StripeCheckout from '../pages/customer/StripeCheckout';
import PaymentSuccess from '../pages/customer/PaymentSuccess';

import ShippingManagement from '../pages/seller/ShippingManagement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<CustomerHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<CustomerProducts />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/customer/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/customer/orders" element={<MyOrders />} />
          <Route path="/customer/orders/:id" element={<OrderDetails />} />
          <Route path="/messages" element={<CustomerMessages />} />
          <Route path="/messages/:id" element={<Conversation />} />
          <Route path="/checkout/stripe" element={<StripeCheckout />} />
          <Route path="/customer/checkout/stripe" element={<StripeCheckout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Seller Routes */}
      <Route element={<SellerRoute />}>
        <Route element={<SellerLayout />}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/deals" element={<MyDeals />} />
          <Route path="/seller/deals/add" element={<AddDeal />} />
          <Route path="/seller/deals/edit/:id" element={<EditDeal />} />
          <Route path="/seller/orders" element={<ShippingManagement />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
