import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiHome, FiMenu, FiX, FiZap, FiBarChart2 } from 'react-icons/fi';
import { useAuthStore } from '../../store/index.js';

const NAV = [
  { path: '/admin', icon: FiBarChart2, label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: FiPackage, label: 'Products' },
  { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { path: '/admin/users', icon: FiUsers, label: 'Users' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 68 : 240, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200, transition: 'width .25s cubic-bezier(.25,.46,.45,.94)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', minHeight: 68 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiZap size={16} /></div>
              <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '.85rem', fontWeight: 700, lineHeight: 1.1 }}>Prime<span style={{ color: 'var(--blue)' }}>Gadgets</span></div><div style={{ fontSize: '.65rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Admin</div></div>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', padding: 6, borderRadius: 'var(--r-sm)', marginLeft: collapsed ? 'auto' : 0 }}>
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <Link key={item.path} to={item.path} title={collapsed ? item.label : undefined} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 'var(--r)', background: isActive(item) ? 'var(--blue)' : 'none', color: isActive(item) ? '#fff' : 'var(--text-2)', fontWeight: 600, fontSize: '.875rem', transition: 'all .15s', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <item.icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--r)', color: 'var(--text-3)', fontWeight: 500, fontSize: '.875rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <FiHome size={16} style={{ flexShrink: 0 }} />{!collapsed && 'Storefront'}
          </Link>
          {!collapsed && user && (
            <div style={{ marginTop: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700, flexShrink: 0 }}>{user.name?.[0]}</div>
              <div style={{ overflow: 'hidden' }}><div style={{ fontSize: '.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div><div style={{ fontSize: '.7rem', color: 'var(--blue)', fontWeight: 600 }}>Admin</div></div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: collapsed ? 68 : 240, padding: '32px 36px', minHeight: '100vh', transition: 'margin-left .25s cubic-bezier(.25,.46,.45,.94)' }}>
        {children}
      </main>
    </div>
  );
}
