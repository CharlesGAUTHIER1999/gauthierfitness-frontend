import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ProductCustomizePage from "./pages/ProductCustomizePage";
import Dashboard from "./pages/Dashboard";
import CartPage from "./pages/CartPage.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentCancel from "./pages/PaymentCancel.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import {AuthProvider, useAuth} from "./store/auth";
import ProtectedRoute from "./routes/ProtectedRoutes.jsx";
import AdminRoute from "./routes/AdminRoutes.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import OrderDetailsPage from "./pages/OrderDetailsPage.jsx";

// Pages de contenu statiques
import Help from "./pages/static/Help.jsx";
import Contact from "./pages/static/Contact.jsx";
import Cgv from "./pages/static/Cgv.jsx";
import Privacy from "./pages/static/Privacy.jsx";
import LegalMentions from "./pages/static/LegalMentions.jsx";
import ReturnsPortal from "./pages/static/ReturnsPortal.jsx";
import Shipping from "./pages/static/Shipping.jsx";
import Refunds from "./pages/static/Refunds.jsx";

import "./admin.css";
import "./staticpages.css";

// Admin pages
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailsPage.jsx";
import AdminStockListPage from "./pages/admin/AdminStockListPage.jsx";
import AdminStockPage from "./pages/admin/AdminStockPage.jsx";
import About from "./pages/static/About.jsx";

function GuestOnly({children}) {
    const {token, loading} = useAuth();
    if (loading) return null;
    if (token) return <Navigate to="/account" replace/>;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Admin */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>
                        <Route index element={<AdminDashboard/>}/>
                        <Route path="products" element={<AdminProductsPage/>}/>
                        <Route path="products/new" element={<AdminProductFormPage/>}/>
                        <Route path="products/:id/edit" element={<AdminProductFormPage/>}/>
                        <Route path="orders" element={<AdminOrdersPage/>}/>
                        <Route path="orders/:id" element={<AdminOrderDetailPage/>}/>
                        <Route path="stock" element={<AdminStockListPage/>}/>
                        <Route path="products/:id/stock" element={<AdminStockPage/>}/>
                    </Route>

                    {/* Public */}
                    <Route
                        path="/*"
                        element={
                            <>
                                <AppLayout>
                                    <Routes>
                                        <Route path="/" element={<Home/>}/>
                                        <Route path="/products" element={<Products/>}/>
                                        <Route path="/products/:slug" element={<ProductDetail/>}/>
                                        <Route path="/products/:slug/customize"
                                               element={<ProtectedRoute><ProductCustomizePage/></ProtectedRoute>}/>
                                        <Route path="/about" element={<About/>}/>
                                        <Route path="/help" element={<Help/>}/>
                                        <Route path="/returns" element={<ReturnsPortal/>}/>
                                        <Route path="/contact" element={<Contact/>}/>
                                        <Route path="/cgv" element={<Cgv/>}/>
                                        <Route path="/privacy" element={<Privacy/>}/>
                                        <Route path="/legal" element={<LegalMentions/>}/>
                                        <Route path="/shipping" element={<Shipping/>}/>
                                        <Route path="/refunds" element={<Refunds/>}/>
                                        <Route path="/login" element={<GuestOnly><Login/></GuestOnly>}/>
                                        <Route path="/register" element={<GuestOnly><Register/></GuestOnly>}/>
                                        <Route path="/account"
                                               element={<ProtectedRoute><AccountPage/></ProtectedRoute>}/>
                                        <Route path="/account/orders"
                                               element={<ProtectedRoute><OrdersPage/></ProtectedRoute>}/>
                                        <Route path="/account/orders/:id"
                                               element={<ProtectedRoute><OrderDetailsPage/></ProtectedRoute>}/>
                                        <Route path="/account/addresses"
                                               element={<ProtectedRoute><AddressesPage/></ProtectedRoute>}/>
                                        <Route path="/cart" element={<CartPage/>}/>
                                        <Route path="/checkout"
                                               element={<ProtectedRoute><CheckoutPage/></ProtectedRoute>}/>
                                        <Route path="/checkout/success" element={<PaymentSuccess/>}/>
                                        <Route path="/checkout/cancel" element={<PaymentCancel/>}/>
                                        <Route path="/dashboard"
                                               element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                                    </Routes>
                                </AppLayout>
                                <CartDrawer/>
                            </>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
