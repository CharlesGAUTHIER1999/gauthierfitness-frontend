import {lazy, Suspense} from "react";
import {BrowserRouter, Navigate, Route, Routes, useLocation} from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import CartDrawer from "./components/cart/CartDrawer.jsx";
import {AuthProvider, useAuth} from "./store/auth";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";

// Lazy-loaded: kept out of the initial bundle so the Home page doesn't pay
// for the 3D/2D customizer (Three.js, Konva) or the admin back-office.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProductCustomizePage = lazy(() => import("./pages/ProductCustomizePage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.jsx"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel.jsx"));
const AccountPage = lazy(() => import("./pages/AccountPage.jsx"));
const AddressesPage = lazy(() => import("./pages/AddressesPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const OrdersPage = lazy(() => import("./pages/OrdersPage.jsx"));
const OrderDetailsPage = lazy(() => import("./pages/OrderDetailsPage.jsx"));

// Static content pages
const Help = lazy(() => import("./pages/static/Help.jsx"));
const Contact = lazy(() => import("./pages/static/Contact.jsx"));
const Cgv = lazy(() => import("./pages/static/Cgv.jsx"));
const Privacy = lazy(() => import("./pages/static/Privacy.jsx"));
const LegalMentions = lazy(() => import("./pages/static/LegalMentions.jsx"));
const ReturnsPortal = lazy(() => import("./pages/static/ReturnsPortal.jsx"));
const Shipping = lazy(() => import("./pages/static/Shipping.jsx"));
const Refunds = lazy(() => import("./pages/static/Refunds.jsx"));
const About = lazy(() => import("./pages/static/About.jsx"));

import "./admin.css";
import "./staticpages.css";

// Admin pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage.jsx"));
const AdminProductFormPage = lazy(() => import("./pages/admin/AdminProductFormPage.jsx"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage.jsx"));
const AdminOrderDetailPage = lazy(() => import("./pages/admin/AdminOrderDetailsPage.jsx"));
const AdminStockListPage = lazy(() => import("./pages/admin/AdminStockListPage.jsx"));
const AdminStockPage = lazy(() => import("./pages/admin/AdminStockPage.jsx"));

// Only renders children for unauthenticated visitors; redirects logged-in users away.
// Mirrors ProtectedRoute/Login's own `from` redirect-back so the two don't race each
// other: without this, logging in from a `from`-tagged redirect to /login (e.g. the
// checkout flow bouncing a guest here) could land the user on /account instead of
// back where they were headed, because this guard and Login's own effect both react
// to the same `token` becoming truthy and can resolve to different destinations.
function GuestOnly({children}) {
    const {token, user, loading} = useAuth();
    const location = useLocation();
    if (loading) return null;
    if (token) {
        const from = location.state?.from;
        const destination = from
            ? `${from.pathname}${from.search || ""}`
            : (user?.is_admin ? "/admin" : "/");
        return <Navigate to={destination} replace/>;
    }
    return children;
}

// Root app component: sets up routing for admin and public sections.
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Suspense fallback={null}>
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
                                               element={<ProductCustomizePage/>}/>
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
                                        <Route path="/forgot-password"
                                               element={<GuestOnly><ForgotPassword/></GuestOnly>}/>
                                        <Route path="/reset-password"
                                               element={<GuestOnly><ResetPassword/></GuestOnly>}/>
                                        <Route path="/account"
                                               element={<ProtectedRoute><AccountPage/></ProtectedRoute>}/>
                                        <Route path="/account/orders"
                                               element={<ProtectedRoute><OrdersPage/></ProtectedRoute>}/>
                                        <Route path="/account/orders/:id"
                                               element={<ProtectedRoute><OrderDetailsPage/></ProtectedRoute>}/>
                                        <Route path="/account/addresses"
                                               element={<ProtectedRoute><AddressesPage/></ProtectedRoute>}/>
                                        <Route path="/cart" element={<CartPage/>}/>
                                        {/* Guest checkout is allowed — CheckoutPage itself offers an
                                            optional login link for customers who want their account. */}
                                        <Route path="/checkout" element={<CheckoutPage/>}/>
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
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}
