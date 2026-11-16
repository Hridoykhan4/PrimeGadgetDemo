import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiCalendar } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import { useCms, Modal, Field, Toggle, ImageUpload, ProductPicker, ThemePicker, MoveButtons } from './cmsKit.jsx';
import './cms.css';

const toLocal = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');
const blank = (placement) => ({ placement, kind: placement === 'hero' ? 'product' : 'custom', theme: placement === 'hero' ? 'light' : 'blue', isActive: true, kicker: '', title: '', subtitle: '', ctaLabel: '', ctaLink: '', image: '' });

function BannerEditor({ initial, onClose, onSave }) {
  const [b, setB] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setB((p) => ({ ...p, [k]: v?.target ? v.target.value : v }));
  const submit = async () => {
    if (b.kind === 'product' && !b.product) return alertMsg('Choose a product for this banner');
    if (b.kind === 'custom' && !b.title) return alertMsg('Add a title for this banner');
    setBusy(true);
    const ok = await onSave({ ...b, product: b.kind === 'product' ? (b.product?._id || b.product) : null, startsAt: b.startsAt || null, endsAt: b.endsAt || null });
    setBusy(false);
    if (ok) onClose();
  };
  const alertMsg = (m) => { import('react-hot-toast').then(({ default: t }) => t.error(m)); };

  return (
    <Modal title={b._id ? 'Edit banner' : 'New banner'} onClose={onClose} wide footer={
      <><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Save banner'}</button></>
    }>
      <div className="cms-seg" role="radiogroup" aria-label="Where to show">
        {[['hero', 'Big slider'], ['side', 'Side tile']].map(([k, l]) => (
          <button type="button" key={k} className={b.placement === k ? 'on' : ''} onClick={() => set('placement')(k)}>{l}</button>
        ))}
      </div>
      <div className="cms-seg" role="radiogroup" aria-label="Banner type">
        {[['product', 'Show a product'], ['custom', 'Custom image & text']].map(([k, l]) => (
          <button type="button" key={k} className={b.kind === k ? 'on' : ''} onClick={() => set('kind')(k)}>{l}</button>
        ))}
      </div>

      {b.kind === 'product' && (
        <ProductPicker value={b.product} onChange={set('product')} label="Product" />
      )}

      <div className="cms-2">
        <Field label="Small label" hint='e.g. "Top pick", "New", "Ramadan deal"'><input className="adm-input" value={b.kicker || ''} onChange={set('kicker')} maxLength={60} /></Field>
        <Field label={b.kind === 'product' ? 'Title (optional — uses product name)' : 'Title'}><input className="adm-input" value={b.title || ''} onChange={set('title')} maxLength={120} /></Field>
      </div>
      <Field label="Subtitle (optional)"><textarea className="adm-input cms-textarea" rows={2} value={b.subtitle || ''} onChange={set('subtitle')} maxLength={240} /></Field>
      <ImageUpload label={b.kind === 'product' ? 'Image (optional — uses product photo)' : (b.placement === 'side' ? 'Background image (optional)' : 'Banner image')} value={b.image} onChange={set('image')} contain={b.placement === 'hero'} hint={b.placement === 'hero' ? 'Square or 4:3 works best' : 'Landscape, text is shown on top'} />
      <div className="cms-2">
        <Field label="Button text"><input className="adm-input" value={b.ctaLabel || ''} onChange={set('ctaLabel')} placeholder={b.kind === 'product' ? 'View details' : 'Shop now'} maxLength={40} /></Field>
        <Field label="Button link" hint="e.g. /products?category=Kids%20%26%20Toys or a full URL"><input className="adm-input" value={b.ctaLink || ''} onChange={set('ctaLink')} placeholder={b.kind === 'product' ? 'Product page' : '/products'} /></Field>
      </div>
      <ThemePicker value={b.theme} onChange={set('theme')} />
      <div className="cms-2">
        <Field label="Show from (optional)"><input className="adm-input" type="datetime-local" value={toLocal(b.startsAt)} onChange={(e) => set('startsAt')(e.target.value ? new Date(e.target.value).toISOString() : '')} /></Field>
        <Field label="Show until (optional)"><input className="adm-input" type="datetime-local" value={toLocal(b.endsAt)} onChange={(e) => set('endsAt')(e.target.value ? new Date(e.target.value).toISOString() : '')} /></Field>
      </div>
      <Toggle checked={b.isActive} onChange={set('isActive')} label="Visible on the store" />
    </Modal>
  );
}

function BannerList({ title, hint, list, cms, onEdit, onAdd }) {
  return (
    <section className="adm-card cms-card">
      <div className="adm-card-h">
        <div><h3>{title}</h3><span className="muted">{hint}</span></div>
        <button className="btn btn-primary btn-sm" onClick={onAdd}><FiPlus /> Add</button>
      </div>
      <div className="cms-list">
        {list.map((b, i) => {
          const img = b.image || b.product?.images?.[0]?.url;
          const scheduled = b.startsAt || b.endsAt;
          return (
            <div key={b._id} className={`cms-item ${b.isActive ? '' : 'off'}`}>
              <span className="cms-pos">{i + 1}</span>
              <span className={`cms-thumb theme-${b.theme}`}>{img ? <img src={img} alt="" /> : null}</span>
              <div className="cms-item-main">
                <strong>{b.title || b.product?.name || 'Untitled'}</strong>
                <span>{b.kind === 'product' ? 'Product' : 'Custom'}{b.kicker ? ` · ${b.kicker}` : ''}{scheduled ? ' · ' : ''}{scheduled && <><FiCalendar /> scheduled</>}</span>
              </div>
              <button className={`adm-switch ${b.isActive ? 'on' : ''}`} onClick={() => cms.quick(b, { isActive: !b.isActive })} aria-label={b.isActive ? 'Hide banner' : 'Show banner'} />
              <MoveButtons index={i} total={list.length} onMove={(idx, d) => cms.move(list, idx, d)} />
              <button className="adm-icon-btn" onClick={() => onEdit(b)} aria-label="Edit banner"><FiEdit2 /></button>
              <button className="adm-icon-btn danger" onClick={() => window.confirm('Delete this banner?') && cms.remove(b)} aria-label="Delete banner"><FiTrash2 /></button>
            </div>
          );
        })}
        {!list.length && <div className="adm-empty">No banners yet</div>}
      </div>
    </section>
  );
}

export default function Banners() {
  const cms = useCms('banners');
  const [editing, setEditing] = useState(null);
  const hero = cms.items.filter((b) => b.placement === 'hero');
  const side = cms.items.filter((b) => b.placement === 'side');

  return (
    <AdminLayout>
      <Helmet><title>Banners — Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Banners</h1><p className="adm-sub">Home page slider and side tiles. Use the arrows to change the order.</p></div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><FiExternalLink /> View store</a>
      </div>
      <div className="cms-grid">
        <BannerList title="Big slider" hint="Slides rotate every 6 seconds" list={hero} cms={cms} onEdit={setEditing} onAdd={() => setEditing(blank('hero'))} />
        <BannerList title="Side tiles" hint="Shown next to the slider (2 recommended)" list={side} cms={cms} onEdit={setEditing} onAdd={() => setEditing(blank('side'))} />
      </div>
      {editing && <BannerEditor initial={editing} onClose={() => setEditing(null)} onSave={cms.save} />}
    </AdminLayout>
  );
}
