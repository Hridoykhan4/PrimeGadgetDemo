import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiX } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import { useCms, Modal, Field, Toggle, IconPicker, MultiProductPicker, MoveButtons } from './cmsKit.jsx';
import { Icon } from '../../utils/categories.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import './cms.css';

const TYPES = {
  products: { label: 'Product row', desc: 'A row or grid of products (top picks, a category, sale items, hand-picked…)' },
  categories: { label: 'Category tiles', desc: 'All visible categories with item counts' },
  priceTabs: { label: 'Shop by price', desc: 'Tabs like "Under AED 20 / 35 / 60"' },
  trust: { label: 'Trust strip', desc: 'Small icons: delivery, COD, secure payment…' },
  recent: { label: 'Recently viewed', desc: "Shows each shopper's recently viewed products" },
  promise: { label: 'Why shop with us + WhatsApp', desc: 'Promise list with a WhatsApp button' },
};
const SOURCES = [
  ['flag', 'Products with a badge'], ['category', 'From a category'], ['manual', 'Hand-picked products'],
  ['newest', 'Newest products'], ['price', 'Under a price'], ['sale', 'On sale'],
];
const FLAGS = [['isBestSeller', 'Top pick'], ['isFeatured', 'Featured on home'], ['isNew', 'New arrival'], ['isDeal', 'On deal']];

const describe = (s) => {
  if (s.type !== 'products') return TYPES[s.type]?.label;
  const src = s.source || {};
  const m = { flag: `Badge: ${FLAGS.find((f) => f[0] === src.flag)?.[1] || 'Top pick'}`, category: `Category: ${src.category || '—'}`, manual: `${src.productIds?.length || 0} hand-picked`, newest: 'Newest', price: `Under AED ${src.maxPrice || 50}`, sale: 'On sale' };
  return `${s.layout === 'grid' ? 'Grid' : 'Scrolling row'} · ${m[src.mode] || ''} · up to ${s.limit}`;
};

function SectionEditor({ initial, categories, onClose, onSave }) {
  const [s, setS] = useState({ ...initial, source: { mode: 'flag', flag: 'isBestSeller', ...(initial.source || {}) } });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setS((p) => ({ ...p, [k]: v?.target ? (v.target.type === 'number' ? Number(v.target.value) : v.target.value) : v }));
  const setSrc = (k) => (v) => setS((p) => ({ ...p, source: { ...p.source, [k]: v?.target ? (v.target.type === 'number' ? Number(v.target.value) : v.target.value) : v } }));
  const items = s.items || [];
  const setItem = (i, k, v) => set('items')(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const submit = async () => {
    if (s.type === 'products' && s.source.mode === 'category' && !s.source.category) { toast.error('Choose a category'); return; }
    if (s.type === 'products' && s.source.mode === 'manual' && !s.source.productIds?.length) { toast.error('Add at least one product'); return; }
    setBusy(true);
    const body = { ...s, source: { ...s.source, productIds: (s.source.productIds || []).map((p) => p._id || p) } };
    const ok = await onSave(body);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Modal title={`${s._id ? 'Edit' : 'New'} section · ${TYPES[s.type]?.label}`} onClose={onClose} wide footer={
      <><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save section'}</button></>
    }>
      {s.type !== 'trust' && (
        <div className="cms-2">
          <Field label="Title"><input className="adm-input" value={s.title || ''} onChange={set('title')} maxLength={120} /></Field>
          <Field label="Small label above the title (optional)"><input className="adm-input" value={s.eyebrow || ''} onChange={set('eyebrow')} maxLength={60} /></Field>
        </div>
      )}
      {['products', 'priceTabs', 'categories'].includes(s.type) && <IconPicker value={s.icon} onChange={set('icon')} />}

      {s.type === 'products' && (
        <>
          <Field label="Which products?">
            <select className="adm-select" value={s.source.mode} onChange={setSrc('mode')}>{SOURCES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </Field>
          {s.source.mode === 'flag' && (
            <Field label="Badge" hint="Set badges on each product in Admin → Products → Edit">
              <select className="adm-select" value={s.source.flag} onChange={setSrc('flag')}>{FLAGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </Field>
          )}
          {s.source.mode === 'category' && (
            <Field label="Category">
              <select className="adm-select" value={s.source.category || ''} onChange={setSrc('category')}>
                <option value="">Choose…</option>
                {categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
              </select>
            </Field>
          )}
          {s.source.mode === 'price' && <Field label="Maximum price (AED)"><input className="adm-input" type="number" min="1" value={s.source.maxPrice || 50} onChange={setSrc('maxPrice')} /></Field>}
          {s.source.mode === 'manual' && <MultiProductPicker value={s.source.productIds || []} onChange={setSrc('productIds')} />}
          <div className="cms-3">
            <Field label="Layout">
              <select className="adm-select" value={s.layout} onChange={set('layout')}><option value="rail">Scrolling row</option><option value="grid">Grid</option></select>
            </Field>
            <Field label="How many products"><input className="adm-input" type="number" min="1" max="40" value={s.limit || 12} onChange={set('limit')} /></Field>
            <Field label='"See all" link (optional)'><input className="adm-input" value={s.link || ''} onChange={set('link')} placeholder="/products?category=…" /></Field>
          </div>
        </>
      )}

      {s.type === 'priceTabs' && (
        <Field label="Price tabs (AED)" hint="Comma separated, e.g. 20, 35, 60">
          <input className="adm-input" defaultValue={(s.priceTabs || [20, 35, 60]).join(', ')} onChange={(e) => set('priceTabs')(e.target.value.split(',').map((x) => Number(x.trim())).filter((n) => n > 0))} />
        </Field>
      )}

      {['trust', 'promise'].includes(s.type) && (
        <div className="cms-field">
          <span className="cms-label">Items</span>
          {items.map((it, i) => (
            <div key={i} className="cms-item-edit">
              <IconPicker value={it.icon} onChange={(v) => setItem(i, 'icon', v)} />
              <input className="adm-input" placeholder="Title" value={it.title || ''} onChange={(e) => setItem(i, 'title', e.target.value)} />
              <input className="adm-input" placeholder="Short text" value={it.text || ''} onChange={(e) => setItem(i, 'text', e.target.value)} />
              <button type="button" className="adm-icon-btn danger" onClick={() => set('items')(items.filter((_, j) => j !== i))} aria-label="Remove item"><FiX /></button>
            </div>
          ))}
          {items.length < 6 && <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('items')([...items, { icon: 'star', title: '', text: '' }])}><FiPlus /> Add item</button>}
        </div>
      )}

      <Toggle checked={s.isActive !== false} onChange={set('isActive')} label="Visible on the home page" />
    </Modal>
  );
}

export default function HomeSections() {
  const cms = useCms('sections');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => { api.get('/cms/categories').then(({ data }) => setCategories(data.items)).catch(() => {}); }, []);

  const start = (type) => {
    setAdding(false);
    const base = { type, isActive: true, layout: 'rail', limit: 12 };
    if (type === 'products') base.source = { mode: 'flag', flag: 'isBestSeller' };
    if (type === 'priceTabs') base.priceTabs = [20, 35, 60];
    if (type === 'trust' || type === 'promise') base.items = [{ icon: 'truck', title: '', text: '' }];
    setEditing(base);
  };

  return (
    <AdminLayout>
      <Helmet><title>Home page — Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Home page</h1><p className="adm-sub">Sections appear on the home page in this order. Banners are managed in Banners.</p></div>
        <div className="adm-tools">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><FiExternalLink /> View store</a>
          <button className="btn btn-primary" onClick={() => setAdding(true)}><FiPlus /> Add section</button>
        </div>
      </div>

      <section className="adm-card cms-card">
        <div className="cms-list">
          <div className="cms-item fixed"><span className="cms-pos">★</span><div className="cms-item-main"><strong>Banner slider & side tiles</strong><span>Always at the top · edit in Banners</span></div></div>
          {cms.items.map((s, i) => (
            <div key={s._id} className={`cms-item ${s.isActive ? '' : 'off'}`}>
              <span className="cms-pos">{i + 1}</span>
              <span className="cms-type"><Icon name={s.icon || { categories: 'grid', trust: 'shield', priceTabs: 'tag', recent: 'clock', promise: 'message' }[s.type] || 'star'} /></span>
              <div className="cms-item-main">
                <strong>{s.title || TYPES[s.type]?.label}</strong>
                <span>{describe(s)}</span>
              </div>
              <button className={`adm-switch ${s.isActive ? 'on' : ''}`} onClick={() => cms.quick(s, { isActive: !s.isActive })} aria-label={s.isActive ? 'Hide section' : 'Show section'} />
              <MoveButtons index={i} total={cms.items.length} onMove={(idx, d) => cms.move(cms.items, idx, d)} />
              <button className="adm-icon-btn" onClick={() => setEditing(s)} aria-label="Edit section"><FiEdit2 /></button>
              <button className="adm-icon-btn danger" onClick={() => window.confirm('Delete this section?') && cms.remove(s)} aria-label="Delete section"><FiTrash2 /></button>
            </div>
          ))}
          {!cms.loading && !cms.items.length && <div className="adm-empty">No sections yet — add one.</div>}
        </div>
      </section>

      {adding && (
        <Modal title="Add a section" onClose={() => setAdding(false)}>
          <div className="cms-types">
            {Object.entries(TYPES).map(([k, t]) => (
              <button key={k} type="button" onClick={() => start(k)}><strong>{t.label}</strong><span>{t.desc}</span></button>
            ))}
          </div>
        </Modal>
      )}
      {editing && <SectionEditor initial={editing} categories={categories} onClose={() => setEditing(null)} onSave={cms.save} />}
    </AdminLayout>
  );
}
