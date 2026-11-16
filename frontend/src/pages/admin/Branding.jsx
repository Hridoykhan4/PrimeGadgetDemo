import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSave, FiPlus, FiX, FiExternalLink } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import { ImageUpload, Field, Toggle, refreshStorefront } from './cmsKit.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import './cms.css';

export default function Branding() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { api.get('/cms/settings').then(({ data }) => setS(data.settings)).catch(() => toast.error('Could not load settings')); }, []);

  const set = (group, key) => (v) => {
    const val = v?.target ? (v.target.type === 'number' ? (v.target.value === '' ? '' : Number(v.target.value)) : v.target.value) : v;
    setS((p) => ({ ...p, [group]: { ...(p[group] || {}), [key]: val } }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/cms/settings', s);
      setS(data.settings); setDirty(false);
      toast.success('Saved — live on the store');
      refreshStorefront();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  if (!s) return <AdminLayout><div className="adm-empty"><span className="spinner" /></div></AdminLayout>;
  const promoItems = s.promo?.items || [];

  return (
    <AdminLayout>
      <Helmet><title>Branding & settings — Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Branding & settings</h1><p className="adm-sub">Logo, colours, contact details, delivery fees — changes go live instantly</p></div>
        <div className="adm-tools">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><FiExternalLink /> View store</a>
          <button className="btn btn-primary" onClick={save} disabled={saving || !dirty}><FiSave /> {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
        </div>
      </div>

      <div className="cms-grid">
        <section className="adm-card cms-card">
          <h3>Brand</h3>
          <div className="cms-2">
            <Field label="Store name"><input className="adm-input" value={s.brand.name || ''} onChange={set('brand', 'name')} /></Field>
            <Field label="Brand colour" hint="Buttons, links and highlights">
              <div className="cms-row">
                <input type="color" className="cms-color" value={s.brand.primaryColor || '#0066ff'} onChange={set('brand', 'primaryColor')} />
                <input className="adm-input" value={s.brand.primaryColor || ''} onChange={set('brand', 'primaryColor')} style={{ width: 120 }} />
              </div>
            </Field>
          </div>
          <Field label="Tagline"><input className="adm-input" value={s.brand.tagline || ''} onChange={set('brand', 'tagline')} /></Field>
          <div className="cms-3">
            <ImageUpload label="Logo" value={s.brand.logoUrl} onChange={set('brand', 'logoUrl')} hint="PNG/SVG-like PNG with transparent background, ~400×100" height={100} />
            <ImageUpload label="Logo for dark mode (optional)" value={s.brand.logoDarkUrl} onChange={set('brand', 'logoDarkUrl')} hint="Light-coloured version" height={100} />
            <ImageUpload label="Favicon (browser tab icon)" value={s.brand.faviconUrl} onChange={set('brand', 'faviconUrl')} hint="Square PNG, 64×64 or larger" height={100} />
          </div>
        </section>

        <section className="adm-card cms-card">
          <h3>Contact</h3>
          <div className="cms-2">
            <Field label="WhatsApp number" hint="With country code, e.g. 971501234567"><input className="adm-input" value={s.contact.whatsapp || ''} onChange={set('contact', 'whatsapp')} inputMode="tel" /></Field>
            <Field label="Phone (optional)"><input className="adm-input" value={s.contact.phone || ''} onChange={set('contact', 'phone')} inputMode="tel" /></Field>
            <Field label="Email"><input className="adm-input" value={s.contact.email || ''} onChange={set('contact', 'email')} type="email" /></Field>
            <Field label="Address / delivery area"><input className="adm-input" value={s.contact.address || ''} onChange={set('contact', 'address')} /></Field>
          </div>
          <h4 className="cms-sub">Social links</h4>
          <div className="cms-2">
            {['instagram', 'facebook', 'tiktok', 'youtube', 'x'].map((k) => (
              <Field key={k} label={k === 'x' ? 'X (Twitter)' : k[0].toUpperCase() + k.slice(1)}>
                <input className="adm-input" value={s.social?.[k] || ''} onChange={set('social', k)} placeholder="https://…" />
              </Field>
            ))}
          </div>
        </section>

        <section className="adm-card cms-card">
          <h3>Top announcement bar</h3>
          <Toggle checked={s.promo?.enabled !== false} onChange={set('promo', 'enabled')} label="Show the announcement bar" />
          {promoItems.map((t, i) => (
            <div className="cms-row" key={i}>
              <input className="adm-input" style={{ flex: 1 }} value={t} onChange={(e) => set('promo', 'items')(promoItems.map((x, k) => (k === i ? e.target.value : x)))} placeholder="e.g. Free delivery over AED 200" />
              <button type="button" className="adm-icon-btn danger" onClick={() => set('promo', 'items')(promoItems.filter((_, k) => k !== i))} aria-label="Remove message"><FiX /></button>
            </div>
          ))}
          <div className="cms-row">
            {promoItems.length < 4 && <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('promo', 'items')([...promoItems, ''])}><FiPlus /> Add message</button>}
            <Toggle checked={s.promo?.showTrackLink !== false} onChange={set('promo', 'showTrackLink')} label='Show "Track your order" link' />
          </div>
        </section>

        <section className="adm-card cms-card">
          <h3>Delivery, VAT & payments</h3>
          <div className="cms-3">
            <Field label="Delivery fee (AED)"><input className="adm-input" type="number" min="0" step="0.5" value={s.commerce.shippingFee ?? ''} onChange={set('commerce', 'shippingFee')} /></Field>
            <Field label="Free delivery from (AED)" hint="0 = always free"><input className="adm-input" type="number" min="0" step="1" value={s.commerce.freeShippingMin ?? ''} onChange={set('commerce', 'freeShippingMin')} /></Field>
            <Field label="VAT (%)"><input className="adm-input" type="number" min="0" max="100" step="0.5" value={s.commerce.vatRate ?? ''} onChange={set('commerce', 'vatRate')} /></Field>
          </div>
          <div className="cms-row">
            <Toggle checked={s.commerce.codEnabled !== false} onChange={set('commerce', 'codEnabled')} label="Cash on delivery" />
            <Toggle checked={s.commerce.cardEnabled !== false} onChange={set('commerce', 'cardEnabled')} label="Card / Apple Pay / Google Pay (Stripe)" />
          </div>
        </section>

        <section className="adm-card cms-card">
          <h3>Search engines & footer</h3>
          <Field label="Home page title (Google)"><input className="adm-input" value={s.seo?.title || ''} onChange={set('seo', 'title')} maxLength={70} /></Field>
          <Field label="Home page description (Google)"><textarea className="adm-input cms-textarea" rows={2} value={s.seo?.description || ''} onChange={set('seo', 'description')} maxLength={170} /></Field>
          <Field label="Footer text"><textarea className="adm-input cms-textarea" rows={2} value={s.footer?.about || ''} onChange={set('footer', 'about')} /></Field>
        </section>
      </div>

      {dirty && (
        <div className="cms-savebar">
          <span>You have unsaved changes</span>
          <button className="btn btn-primary" onClick={save} disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      )}
    </AdminLayout>
  );
}
