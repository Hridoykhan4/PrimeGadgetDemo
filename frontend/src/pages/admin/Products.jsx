import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { FiPlus, FiEdit2, FiSearch, FiExternalLink, FiCheck } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const TABS = [['', 'All'], ['active', 'Live'], ['hidden', 'Hidden'], ['low', 'Low stock']];

function Row({ p, onSaved }) {
  const [price, setPrice] = useState(p.price);
  const [sale, setSale] = useState(p.salePrice || 0);
  const [stock, setStock] = useState(p.stock);
  const [busy, setBusy] = useState(false);
  const dirty = Number(price) !== p.price || Number(sale) !== (p.salePrice || 0) || Number(stock) !== p.stock;

  const save = async (extra = {}) => {
    const body = { price: Number(price), salePrice: Number(sale) || 0, stock: Math.max(0, parseInt(stock, 10) || 0), ...extra };
    if (body.salePrice && body.salePrice >= body.price) { toast.error('Sale price must be lower than the price'); return; }
    setBusy(true);
    try {
      const { data } = await api.put(`/products/${p._id}`, body);
      onSaved(data.product);
      toast.success(extra.isActive !== undefined ? (extra.isActive ? 'Product is live' : 'Product hidden') : 'Saved');
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 260 }}>
          <img src={p.images?.[0]?.url} alt="" className="adm-thumb" />
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: '.84rem', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</strong>
            <span className="muted">{p.category} · {p.sku || '—'}</span>
          </div>
        </div>
      </td>
      <td><input className={`adm-num ${Number(price) !== p.price ? 'dirty' : ''}`} type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" /></td>
      <td><input className={`adm-num ${Number(sale) !== (p.salePrice || 0) ? 'dirty' : ''}`} type="number" min="0" step="0.01" value={sale} onChange={(e) => setSale(e.target.value)} aria-label="Sale price" /></td>
      <td><input className={`adm-num ${Number(stock) !== p.stock ? 'dirty' : ''}`} type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} aria-label="Stock" style={{ width: 74, color: p.stock === 0 ? 'var(--red)' : p.stock <= 5 ? 'var(--orange)' : undefined }} /></td>
      <td>
        <button className={`adm-switch ${p.isActive ? 'on' : ''}`} onClick={() => save({ isActive: !p.isActive })} disabled={busy} aria-label={p.isActive ? 'Hide product' : 'Show product'} aria-pressed={p.isActive} />
      </td>
      <td className="muted">{p.numReviews ? `${p.ratings} ★ (${p.numReviews})` : '—'}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          {dirty && <button className="btn btn-primary btn-sm" onClick={() => save()} disabled={busy}><FiCheck /> Save</button>}
          <Link to={`/admin/products/${p._id}/edit`} className="adm-icon-btn" aria-label="Edit product"><FiEdit2 /></Link>
          <a href={`/products/${p._id}`} target="_blank" rel="noopener noreferrer" className="adm-icon-btn" aria-label="View in store"><FiExternalLink /></a>
        </div>
      </td>
    </tr>
  );
}

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [q, setQ] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useRef();

  const load = useCallback(() => {
    setLoading(true);
    api.get('/products/admin/all', { params: { status, q: q.trim() || undefined } })
      .then(({ data }) => setProducts(data.products)).catch(() => toast.error('Could not load products')).finally(() => setLoading(false));
  }, [status, q]);
  useEffect(() => { clearTimeout(t.current); t.current = setTimeout(load, q ? 300 : 0); }, [load]);

  const onSaved = (np) => setProducts((list) => list.map((x) => (x._id === np._id ? { ...x, ...np } : x)));

  return (
    <AdminLayout>
      <Helmet><title>Products — PrimeGadgets Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Products</h1><p className="adm-sub">{products.length} products · edit price and stock right in the table</p></div>
        <div className="adm-tools">
          <div className="adm-search"><FiSearch /><input className="adm-input" placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <Link to="/admin/products/new" className="btn btn-primary"><FiPlus /> Add product</Link>
        </div>
      </div>
      <div className="adm-tabs">
        {TABS.map(([k, l]) => (
          <button key={k || 'all'} className={`adm-tab ${status === k ? 'on' : ''}`} onClick={() => { const n = new URLSearchParams(params); k ? n.set('status', k) : n.delete('status'); setParams(n); }}>{l}</button>
        ))}
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Product</th><th>Price (AED)</th><th>Sale price</th><th>Stock</th><th>Live</th><th>Rating</th><th /></tr></thead>
          <tbody>{products.map((p) => <Row key={`${p._id}-${p.updatedAt || ''}-${p.price}-${p.stock}-${p.salePrice}`} p={p} onSaved={onSaved} />)}</tbody>
        </table>
        {!loading && !products.length && <div className="adm-empty">No products found</div>}
        {loading && !products.length && <div className="adm-empty"><span className="spinner spinner-sm" /></div>}
      </div>
      <p className="muted" style={{ marginTop: 10 }}>Prices are shown to customers before 5% VAT. Set a sale price to show a discount badge. Hidden products are not visible in the store.</p>
    </AdminLayout>
  );
}
