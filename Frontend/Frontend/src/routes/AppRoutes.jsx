import { BrowserRouter, Route, Routes } from "react-router-dom";

import StripeCheckout from "../pages/customer/StripeCheckout";
import MyOrders from "../pages/customer/MyOrders";
import OrderDetails from "../pages/customer/OrderDetails";

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/checkout/stripe" element={<StripeCheckout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
