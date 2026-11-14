import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiHeart, FiUser, FiSun, FiMoon, FiMenu, FiX, FiChevronDown, FiChevronRight,
  FiPackage, FiLogOut, FiGrid, FiZap, FiShoppingCart, FiHome, FiTruck, FiMapPin, FiMessageCircle,
} from 'react-icons/fi';
import { useAuthStore, useThemeStore, useCartStore, useWishlistStore, fmtAED } from '../../store/index.js';
import { useCatalogStore } from '../../store/catalog.js';
import { CategoryIcon, categoryHref } from '../../utils/categories.jsx';
import { useSearchModalStore, useCartDrawerStore } from '../ui/uiStore.js';
import api from '../../utils/api.js';
import './Navbar.css';

const previewCache = new Map();

function MegaMenu({ categories, onClose }) {
  const [active, setActive] = useState(categories[0]?.name);
  const [items, setItems] = useState(previewCache.get(categories[0]?.name) || []);

  useEffect(() => {
    if (!active) return;
    if (previewCache.has(active)) { setItems(previewCache.get(active)); return; }
    let alive = true;
    api.get('/products', { params: { category: active, limit: 4, sort: '-isBestSeller,-createdAt' } })
      .then(({ data }) => { previewCache.set(active, data.products); if (alive) setItems(data.products); })
      .catch(() => {});
    return () => { alive = false; };
  }, [active]);

  return (
    <motion.div
      className="mega"
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.16 }}
      onMouseLeave={onClose}
      role="menu"
    >
      <ul className="mega-cats">
        {categories.map((c) => (
          <li key={c.name}>
            <Link
              to={categoryHref(c.name)}
              className={`mega-cat ${active === c.name ? 'active' : ''}`}
              onMouseEnter={() => setActive(c.name)}
              onFocus={() => setActive(c.name)}
              onClick={onClose}
              role="menuitem"
            >
              <span className="mega-cat-icon"><CategoryIcon name={c.name} /></span>
              <span className="mega-cat-name">{c.name}</span>
              <span className="mega-cat-count">{c.count}</span>
              <FiChevronRight className="mega-cat-arrow" aria-hidden="true" />
            </Link>
          </li>
        ))}
        <li><Link to="/products" className="mega-all" onClick={onClose}>Shop all products <FiChevronRight aria-hidden="true" /></Link></li>
      </ul>
      <div className="mega-preview">
        <div className="mega-preview-head">
          <strong>{active}</strong>
          <Link to={categoryHref(active || '')} onClick={onClose}>See all <FiChevronRight aria-hidden="true" /></Link>
        </div>
        <div className="mega-preview-grid">
          {items.map((p) => (
            <Link key={p._id} to={`/products/${p._id}`} className="mega-prod" onClick={onClose}>
              <span className="mega-prod-img"><img src={p.images?.[0]?.url} alt="" loading="lazy" /></span>
              <span className="mega-prod-name">{p.name}</span>
              <span className="mega-prod-price">AED {fmtAED(p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price)}</span>
            </Link>
          ))}
          {!items.length && [0, 1, 2, 3].map((k) => <span key={k} className="mega-prod skeleton" style={{ height: 180 }} />)}
        </div>
      </div>
    </motion.div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { theme, toggleTheme } = useThemeStore();
  const openSearch = useSearchModalStore((s) => s.open);
  const openCart = useCartDrawerStore((s) => s.open);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const wishCount = useWishlistStore((s) => s.items.length);
  const { categories, load } = useCatalogStore();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [bump, setBump] = useState(false);
  const userRef = useRef(null);
  const megaTimer = useRef(null);
  const prevCount = useRef(cartCount);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenu(false); setMega(false); }, [location.pathname, location.search]);

  useEffect(() => {
    if (cartCount > prevCount.current) { setBump(true); const t = setTimeout(() => setBump(false), 450); prevCount.current = cartCount; return () => clearTimeout(t); }
    prevCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (location.pathname.startsWith('/admin')) return null;

  const isDark = theme === 'dark';
  const openMega = () => { clearTimeout(megaTimer.current); megaTimer.current = setTimeout(() => setMega(true), 120); };
  const closeMega = () => { clearTimeout(megaTimer.current); setMega(false); };

  return (
    <>
      <div className="promo-bar">
        <div className="container promo-inner">
          <span><FiTruck aria-hidden="true" /> <strong>Free delivery</strong>&nbsp;over AED 200</span>
          <span className="promo-sep" aria-hidden="true" />
          <span>Cash on delivery across the UAE</span>
          <span className="promo-sep promo-hide-sm" aria-hidden="true" />
          <Link to="/track" className="promo-hide-sm promo-link"><FiMapPin aria-hidden="true" /> Track your order</Link>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-row">
          <button className="hdr-icon only-mobile" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <FiMenu />
          </button>

          <Link to="/" className="brand" aria-label="PrimeGadgets home">
            <span className="brand-mark"><FiZap aria-hidden="true" /></span>
            <span className="brand-text"><strong>Prime</strong>Gadgets</span>
          </Link>

          <nav className="hdr-nav" aria-label="Main">
            <div className="shop-wrap" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                className={`hdr-link ${mega ? 'open' : ''}`}
                onClick={() => setMega((m) => !m)}
                aria-expanded={mega}
                aria-haspopup="menu"
              >
                <FiGrid aria-hidden="true" /> Categories <FiChevronDown className="chev" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {mega && categories.length > 0 && <MegaMenu categories={categories} onClose={closeMega} />}
              </AnimatePresence>
            </div>
          </nav>

          <button className="hdr-search" onClick={openSearch} aria-label="Search products">
            <FiSearch aria-hidden="true" />
            <span>Search for kitchen, beauty, toys…</span>
            <kbd>/</kbd>
          </button>

          <div className="hdr-actions">
            <button className="hdr-icon only-mobile" onClick={openSearch} aria-label="Search"><FiSearch /></button>

            <button className="hdr-icon hide-mobile" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <FiSun /> : <FiMoon />}
            </button>

            <Link to="/wishlist" className="hdr-icon hide-mobile" aria-label={`Wishlist, ${wishCount} items`}>
              <FiHeart />
              {wishCount > 0 && <span className="hdr-badge">{wishCount}</span>}
            </Link>

            {token ? (
              <div className="user-wrap hide-mobile" ref={userRef}>
                <button className="hdr-account" onClick={() => setUserMenu((v) => !v)} aria-expanded={userMenu}>
                  <span className="avatar">{user?.name?.[0]?.toUpperCase() || <FiUser />}</span>
                  <span className="hdr-account-text"><small>Hello,</small>{user?.name?.split(' ')[0] || 'Account'}</span>
                  <FiChevronDown className="chev" aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {userMenu && (
                    <motion.div className="user-menu" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}>
                      <div className="user-menu-head"><strong>{user?.name}</strong><span>{user?.email}</span></div>
                      <Link to="/orders" className="user-menu-item"><FiPackage /> My orders</Link>
                      <Link to="/wishlist" className="user-menu-item"><FiHeart /> Wishlist</Link>
                      <Link to="/profile" className="user-menu-item"><FiUser /> Profile</Link>
                      {isAdmin && <Link to="/admin" className="user-menu-item accent"><FiGrid /> Admin dashboard</Link>}
                      <button className="user-menu-item danger" onClick={logout}><FiLogOut /> Sign out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hdr-account hide-mobile">
                <span className="avatar ghost"><FiUser /></span>
                <span className="hdr-account-text"><small>Hello, sign in</small>Account</span>
              </Link>
            )}

            <button className={`hdr-cart ${bump ? 'bump' : ''}`} onClick={openCart} aria-label={`Cart, ${cartCount} items`}>
              <FiShoppingCart aria-hidden="true" />
              <span className="hdr-cart-text hide-mobile">Cart</span>
              {cartCount > 0 && <span className="hdr-badge cart">{cartCount > 99 ? '99+' : cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="m-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="m-drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              aria-label="Menu"
            >
              <div className="m-head">
                {token ? (
                  <div className="m-user"><span className="avatar">{user?.name?.[0]?.toUpperCase()}</span><div><strong>{user?.name}</strong><small>{user?.email}</small></div></div>
                ) : (
                  <Link to="/login" className="m-user"><span className="avatar ghost"><FiUser /></span><div><strong>Sign in</strong><small>Optional — you can check out as a guest</small></div></Link>
                )}
                <button className="hdr-icon" onClick={() => setMobileOpen(false)} aria-label="Close menu"><FiX /></button>
              </div>

              <div className="m-body">
                <p className="m-title">Shop by category</p>
                {categories.map((c) => (
                  <Link key={c.name} to={categoryHref(c.name)} className="m-cat">
                    <span className="m-cat-icon"><CategoryIcon name={c.name} /></span>
                    <span className="m-cat-name">{c.name}</span>
                    <span className="m-cat-count">{c.count}</span>
                  </Link>
                ))}
                <Link to="/products" className="m-cat strong"><span className="m-cat-icon"><FiGrid /></span><span className="m-cat-name">All products</span><FiChevronRight /></Link>

                <p className="m-title">Help & account</p>
                <Link to="/track" className="m-link"><FiMapPin /> Track an order</Link>
                {token && <Link to="/orders" className="m-link"><FiPackage /> My orders</Link>}
                <Link to="/wishlist" className="m-link"><FiHeart /> Wishlist {wishCount > 0 && <span className="m-pill">{wishCount}</span>}</Link>
                <Link to="/contact" className="m-link"><FiMessageCircle /> Contact us</Link>
                <Link to="/about" className="m-link"><FiZap /> About PrimeGadgets</Link>
                {isAdmin && <Link to="/admin" className="m-link accent"><FiGrid /> Admin dashboard</Link>}
                <button className="m-link" onClick={toggleTheme}>{isDark ? <FiSun /> : <FiMoon />} {isDark ? 'Light mode' : 'Dark mode'}</button>
                {token && <button className="m-link danger" onClick={() => { logout(); setMobileOpen(false); }}><FiLogOut /> Sign out</button>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar" aria-label="Quick navigation">
        <NavLink to="/" end className="tab"><FiHome /><span>Home</span></NavLink>
        <button className="tab" onClick={() => setMobileOpen(true)}><FiGrid /><span>Categories</span></button>
        <NavLink to="/wishlist" className="tab"><FiHeart /><span>Saved</span>{wishCount > 0 && <i className="tab-badge">{wishCount}</i>}</NavLink>
        <button className="tab" onClick={openCart}><FiShoppingCart /><span>Cart</span>{cartCount > 0 && <i className="tab-badge cart">{cartCount}</i>}</button>
        <NavLink to={token ? '/orders' : '/track'} className="tab"><FiPackage /><span>Orders</span></NavLink>
      </nav>
    </>
  );
}
