import { Navigate, Route, Routes } from "react-router-dom";
import ShopLayout from "./components/ShopLayout.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import AdminLive from "./pages/AdminLive.jsx";
import AdminModel from "./pages/AdminModel.jsx";
import AdminOverview from "./pages/AdminOverview.jsx";
import AdminSessions from "./pages/AdminSessions.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Demo from "./pages/Demo.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Products from "./pages/Products.jsx";
import Signup from "./pages/Signup.jsx";
import Success from "./pages/Success.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/demo" element={<Demo />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="live" element={<AdminLive />} />
        <Route path="sessions" element={<AdminSessions />} />
        <Route path="model" element={<AdminModel />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
