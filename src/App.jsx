import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./store/auth";
import CartPage from "./pages/CartPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";
import {CartProvider} from "./context/CartContext.jsx";
import CartDrawer from "./components/CartDrawer.jsx";

export default function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <AuthProvider>
                    <AppLayout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/:slug" element={<ProductDetail />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/payment-success" element={<PaymentSuccess />} />
                            <Route path="/payment-cancel" element={<PaymentCancel />} />
                        </Routes>
                    </AppLayout>
                </AuthProvider>
            </BrowserRouter>
            <CartDrawer />
        </CartProvider>
    );
}