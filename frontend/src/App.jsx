import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useThemeStore } from './store/index.js';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import SearchModal from './components/ui/SearchModal.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import FloatingWhatsApp from './components/ui/FloatingWhatsApp.jsx';
import { useSearchModalStore } from './components/ui/uiStore.js';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const OrderDetail = lazy(() => import('./pages/OrderDetail.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const TrackOrder = lazy(() => import('./pages/TrackOrder.jsx'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/Products.jsx'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/Orders.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/Users.jsx'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews.jsx'));
const AdminMessages = lazy(() => import('./pages/admin/Messages.jsx'));

const PageLoader = () => (
  <div className="loading-screen">
    <div className="spinner" />
  </div>
);

const PrivateRoute = ({ children }) => {
  const { token, initialLoading } = useAuthStore();
  if (initialLoading) return <PageLoader />;
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, token, initialLoading } = useAuthStore();
  if (initialLoading) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? <Navigate to="/" replace /> : children;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { fetchMe, initialLoading } = useAuthStore();
  const { initTheme } = useThemeStore();
  const openSearch = useSearchModalStore((s) => s.open);
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    initTheme();
    fetchMe();
  }, []);

  // Press "/" anywhere to search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const t = e.target;
      if (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      e.preventDefault();
      openSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <SearchModal />
      <CartDrawer />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Protected */}
          {/* Guest-friendly shopping */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/success/:id" element={<OrderSuccess />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Account */}
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
          <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {!isAdmin && <Footer />}
      {!isAdmin && !['/checkout', '/cart'].includes(pathname) && <FloatingWhatsApp />}
    </>
  );
}
