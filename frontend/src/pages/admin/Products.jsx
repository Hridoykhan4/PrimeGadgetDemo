// admin/Products.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = () => api.get('/products?limit=100&isActive=true').then(({ data }) => setProducts(data.products)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/products/${id}`); toast.success('Product removed'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <Helmet><title>Products — Admin</title></Helmet>
      <div style={{ maxWidth: 1300 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 2 }}>Products</h1><p style={{ color: 'var(--text-3)', fontSize: '.875rem' }}>{filtered.length} products</p></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="input-wrap">
              <FiSearch className="input-icon-left" size={15} />
              <input className="input has-icon-left" style={{ width: 260 }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Link to="/admin/products/new" className="btn btn-primary"><FiPlus /> Add Product</Link>
          </div>
        </div>
        {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.images?.[0]?.url} alt={p.name} style={{ width: 44, height: 44, borderRadius: 'var(--r)', objectFit: 'cover', flexShrink: 0, background: 'var(--surface-2)' }} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: 2 }}>{p.name}</p>
                          <p style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{p.brand} · {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '.82rem', color: 'var(--text-2)' }}>{p.category}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: p.salePrice > 0 ? 'var(--blue)' : 'var(--text)', fontSize: '.9rem' }}>AED {(p.salePrice > 0 ? p.salePrice : p.price).toLocaleString()}</span>
                        {p.salePrice > 0 && <span style={{ fontSize: '.75rem', color: 'var(--text-3)', textDecoration: 'line-through', display: 'block' }}>AED {p.price.toLocaleString()}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--red)' : p.stock <= 5 ? 'var(--gold)' : 'var(--green)', fontSize: '.875rem' }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '.82rem', color: 'var(--text-2)' }}>⭐ {p.ratings} ({p.numReviews})</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/admin/products/${p._id}/edit`} className="btn btn-secondary btn-sm btn-icon-sm" style={{ width: 32, height: 32 }}><FiEdit2 size={13} /></Link>
                        <button className="btn btn-sm" style={{ width: 32, height: 32, padding: 0, background: 'rgba(255,59,59,.1)', color: 'var(--red)', borderRadius: 'var(--r-sm)' }} onClick={() => handleDelete(p._id, p.name)}><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-state" style={{ padding: '48px 24px' }}><FiPackage /><h3>No products found</h3></div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
