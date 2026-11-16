import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  FiBarChart2, FiPackage, FiShoppingBag, FiUsers, FiHome, FiMenu, FiStar, FiMail, FiSun, FiMoon, FiPlus, FiLogOut,
  FiImage, FiLayout, FiGrid, FiSliders,
} from 'react-icons/fi';
import { useAuthStore, useThemeStore } from '../../store/index.js';
import { create } from 'zustand';
import api from '../../utils/api.js';
import Brand from '../../components/layout/Brand.jsx';
import './admin.css';

// Badge counts shared across admin pages (refreshed every minute)
export const useAdminBadges = create((set) => ({
  pending: 0, messages: 0,
  refresh: async () => {
    try {
      const [o, m] = await Promise.all([
        api.get('/orders', { params: { status: 'pending', limit: 1 } }),
        api.get('/messages', { params: { unread: 1 } }),
      ]);
      set({ pending: o.data.total || 0, messages: m.data.messages?.length || 0 });
    } catch {}
  },
}));

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { pending, messages, refresh } = useAdminBadges();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { refresh(); const t = setInterval(refresh, 60000); return () => clearInterval(t); }, [refresh]);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const NAV = [
    { to: '/admin', icon: FiBarChart2, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders', count: pending },
    { to: '/admin/products', icon: FiPackage, label: 'Products' },
    { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { to: '/admin/messages', icon: FiMail, label: 'Messages', count: messages },
    { to: '/admin/users', icon: FiUsers, label: 'Customers' },
  ];
  const STORE = [
    { to: '/admin/home', icon: FiLayout, label: 'Home page' },
    { to: '/admin/banners', icon: FiImage, label: 'Banners' },
    { to: '/admin/categories', icon: FiGrid, label: 'Categories' },
    { to: '/admin/branding', icon: FiSliders, label: 'Branding & settings' },
  ];

  return (
    <div className="adm">
      <div className={`adm-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`adm-side ${open ? 'open' : ''}`} aria-label="Admin navigation">
        <Link to="/admin" className="adm-brand">
          <Brand size={32} />
          <small className="adm-brand-tag">Admin</small>
        </Link>
        <nav className="adm-nav">
          <span className="adm-nav-label">Store</span>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `adm-link ${isActive ? 'active' : ''}`}>
              <n.icon aria-hidden="true" /> {n.label}
              {n.count > 0 && <span className="adm-count">{n.count}</span>}
            </NavLink>
          ))}
          <span className="adm-nav-label">Storefront</span>
          {STORE.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `adm-link ${isActive ? 'active' : ''}`}>
              <n.icon aria-hidden="true" /> {n.label}
            </NavLink>
          ))}
          <span className="adm-nav-label">Quick actions</span>
          <Link to="/admin/products/new" className="adm-link"><FiPlus /> Add product</Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-link"><FiHome /> View store</a>
        </nav>
        <div className="adm-foot">
          <button className="adm-link" onClick={toggleTheme} style={{ background: 'none', width: '100%' }}>
            {theme === 'dark' ? <FiSun /> : <FiMoon />} {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button className="adm-link" onClick={logout} style={{ background: 'none', width: '100%' }}><FiLogOut /> Sign out</button>
          {user && (
            <div className="adm-user">
              <span className="av">{user.name?.[0]?.toUpperCase()}</span>
              <div><strong>{user.name}</strong><small>{user.email}</small></div>
            </div>
          )}
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-topbar">
          <button className="adm-icon-btn" onClick={() => setOpen(true)} aria-label="Open admin menu"><FiMenu /></button>
          <strong>PrimeGadgets Admin</strong>
        </div>
        {children}
      </main>
    </div>
  );
}
