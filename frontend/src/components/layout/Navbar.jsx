import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiHeart, FiUser, FiSun, FiMoon,
  FiMenu, FiX, FiChevronDown, FiPackage, FiLogOut,
  FiGrid, FiZap, FiMessageSquare
} from 'react-icons/fi';
import {
  FiCoffee, FiScissors, FiGift, FiTool, FiSmartphone, FiHome as FiHomeIcon, FiSend, FiWatch,
  FiHeadphones, FiEye, FiCamera, FiTarget, FiCpu, FiMonitor, FiTruck as FiTruckIcon,
} from 'react-icons/fi';
import { useAuthStore, useThemeStore } from '../../store/index.js';
import { useSearchModalStore } from '../ui/uiStore.js';
import './Navbar.css';

const CATEGORIES = [
  { name: 'Home & Kitchen', icon: <FiCoffee /> },
  { name: 'Beauty & Personal Care', icon: <FiScissors /> },
  { name: 'Kids & Toys', icon: <FiGift /> },
  { name: 'Tools & Outdoor', icon: <FiTool /> },
  { name: 'Accessories', icon: <FiSmartphone /> },
  { name: 'Smart Home', icon: <FiHomeIcon /> },
  { name: 'Drones', icon: <FiSend /> },
  { name: 'Smart Watches', icon: <FiWatch /> },
  { name: 'AirBuds & Headphones', icon: <FiHeadphones /> },
  { name: 'VR & AR', icon: <FiEye /> },
  { name: 'Cameras', icon: <FiCamera /> },
  { name: 'Gaming', icon: <FiTarget /> },
  { name: 'AI Devices', icon: <FiCpu /> },
  { name: 'Laptops', icon: <FiMonitor /> },
];

const WHATSAPP_URL = 'https://wa.me/971500000000?text=Hello%20PrimeGadgets%2C%20I%20want%20to%20inquire%20about%20your%20products.';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { open: openSearch } = useSearchModalStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const userRef = useRef(null);
  const catRef = useRef(null);

  // Get active category from URL params
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserDropdown(false); setCatDropdown(false); }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdown(false);
      if (catRef.current && !catRef.current.contains(e.target)) setCatDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDark = theme === 'dark';

  return (
    <>
      {/* Promo Banner */}
      <motion.div
        className="navbar-promo"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FiTruckIcon aria-hidden="true" style={{ verticalAlign: '-2px' }} /> <strong>Free delivery</strong>&nbsp;on orders over AED 200 · Cash on delivery · Local UAE stock
      </motion.div>

      <motion.header
        className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="navbar-inner container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon"><FiZap /></div>
            <div className="logo-text">
              <span className="logo-prime">Prime</span>
              <span className="logo-gadgets">Gadgets</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>

            <div className="nav-dropdown-wrap" ref={catRef}>
              <button
                className={`nav-link nav-link-btn ${location.pathname === '/products' ? 'active' : ''}`}
                onMouseEnter={() => setCatDropdown(true)}
                onClick={() => navigate('/products')}
              >
                Shop <FiChevronDown className={`dropdown-arrow ${catDropdown ? 'rotated' : ''}`} />
              </button>

              <AnimatePresence>
                {catDropdown && (
                  <motion.div
                    className="mega-dropdown"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setCatDropdown(false)}
                  >
                    <div className="mega-dropdown-grid">
                      {CATEGORIES.map(cat => (
                        <Link
                          key={cat.name}
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="mega-cat-item"
                        >
                          <span className="mega-cat-icon">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mega-dropdown-footer">
                      <Link to="/products" className="btn btn-primary btn-sm">
                        View All Products →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <button className="nav-action-btn" onClick={openSearch} aria-label="Search">
              <FiSearch />
            </button>

            {/* Theme */}
            <button className="nav-action-btn theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait">
                <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {isDark ? <FiSun /> : <FiMoon />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* WhatsApp CTA */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm navbar-whatsapp-btn"
              aria-label="Contact via WhatsApp"
            >
              <FiMessageSquare size={16} />
              <span className="whatsapp-text">WhatsApp</span>
            </a>

            {/* Wishlist - Only on tablet+ */}
            {token && (
              <Link to="/wishlist" className="nav-action-btn wishlist-btn" aria-label="Wishlist">
                <FiHeart />
              </Link>
            )}

            {/* User */}
            {token ? (
              <div className="user-dropdown-wrap" ref={userRef}>
                <button className="user-btn" onClick={() => setUserDropdown(d => !d)}>
                  <div className="user-avatar">
                    {user?.avatar?.url ? <img src={user.avatar.url} alt={user.name} /> : user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown className={`dropdown-arrow ${userDropdown ? 'rotated' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="dropdown-header">
                        <strong>{user?.name}</strong>
                        <span>{user?.email}</span>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item"><FiUser size={15} />Profile</Link>
                      <Link to="/orders" className="dropdown-item"><FiPackage size={15} />My Orders</Link>
                      <Link to="/wishlist" className="dropdown-item"><FiHeart size={15} />Wishlist</Link>
                      {isAdmin && (
                        <>
                          <div className="dropdown-divider" />
                          <Link to="/admin" className="dropdown-item admin-item"><FiGrid size={15} />Admin Panel</Link>
                        </>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item logout-item" onClick={logout}><FiLogOut size={15} />Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            <button className="hamburger" onClick={() => setMobileOpen(m => !m)}>
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="mobile-menu-header">
                <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
                  <div className="logo-icon"><FiZap /></div>
                  <div className="logo-text">
                    <span className="logo-prime">Prime</span>
                    <span className="logo-gadgets">Gadgets</span>
                  </div>
                </Link>
                <div className="mobile-quick-actions">
                  <button className="mobile-quick-btn" onClick={() => { openSearch(); setMobileOpen(false); }} title="Search">
                    <FiSearch size={18} />
                  </button>
                  <button className="mobile-quick-btn" onClick={toggleTheme} title="Toggle theme">
                    {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                  </button>
                  <button className="mobile-quick-btn close-btn" onClick={() => setMobileOpen(false)} title="Close">
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* User Section */}
              {token && (
                <motion.div
                  className="mobile-user-section"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="mobile-user-card">
                    <div className="mobile-user-avatar">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="mobile-user-info">
                      <div className="mobile-user-name">{user?.name}</div>
                      <div className="mobile-user-role">{isAdmin ? 'Admin' : 'Premium Member'}</div>
                    </div>
                  </div>
                  <div className="mobile-user-quick-links">
                    <Link to="/profile" className="mobile-user-quicklink" onClick={() => setMobileOpen(false)}>
                      <FiUser size={16} /> Profile
                    </Link>
                    <Link to="/orders" className="mobile-user-quicklink" onClick={() => setMobileOpen(false)}>
                      <FiPackage size={16} /> Orders
                    </Link>
                    <Link to="/wishlist" className="mobile-user-quicklink" onClick={() => setMobileOpen(false)}>
                      <FiHeart size={16} /> Wishlist
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Body */}
              <div className="mobile-menu-body">
                {/* Main Navigation */}
                <div className="mobile-nav-section">
                  <Link to="/" className={`mobile-nav-link primary-link ${location.pathname === '/' && !activeCategory ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    <span className="nav-icon">🏠</span> Home
                  </Link>
                  <Link to="/products" className={`mobile-nav-link primary-link ${location.pathname === '/products' && !activeCategory ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    <span className="nav-icon">🛍️</span> Shop All
                  </Link>
                </div>

                {/* Categories Section */}
                <div className="mobile-nav-section">
                  <div className="mobile-section-title">Categories</div>
                  <div className="mobile-cat-grid">
                    {CATEGORIES.map((cat, idx) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + idx * 0.03 }}
                      >
                        <Link
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className={`mobile-cat-card ${activeCategory === cat.name ? 'active' : ''}`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <div className="mobile-cat-icon">{cat.icon}</div>
                          <div className="mobile-cat-label">{cat.name}</div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Info Section */}
                <div className="mobile-nav-section">
                  <Link to="/about" className={`mobile-nav-link secondary-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    About Us
                  </Link>
                  <Link to="/contact" className={`mobile-nav-link secondary-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="mobile-menu-footer">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-full mobile-whatsapp"
                >
                  <FiMessageSquare size={18} />
                  <span>Chat on WhatsApp</span>
                </a>
                {token && (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="btn btn-secondary btn-full" onClick={() => setMobileOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <button className="btn btn-danger btn-full" onClick={() => { logout(); setMobileOpen(false); }}>
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
