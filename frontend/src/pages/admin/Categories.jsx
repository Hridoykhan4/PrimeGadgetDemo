import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import { useCms, Modal, Field, Toggle, IconPicker, ImageUpload, MoveButtons } from './cmsKit.jsx';
import { CategoryIcon } from '../../utils/categories.jsx';
import { useCatalogStore } from '../../store/catalog.js';
import './cms.css';

function CategoryEditor({ initial, onClose, onSave }) {
  const [c, setC] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setC((p) => ({ ...p, [k]: v?.target ? v.target.value : v }));
  const submit = async () => {
    if (!c.name?.trim()) return;
    setBusy(true);
    const ok = await onSave({ ...c, name: c.name.trim() });
    setBusy(false);
    if (ok) { useCatalogStore.setState({ loaded: false }); useCatalogStore.getState().load(); onClose(); }
  };
  return (
    <Modal title={c._id ? 'Edit category' : 'New category'} onClose={onClose} footer={
      <><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={busy || !c.name?.trim()}>{busy ? 'Saving…' : 'Save'}</button></>
    }>
      <Field label="Name" hint={c._id && initial.name !== c.name ? `All ${initial.count || 0} products in "${initial.name}" will move to the new name` : undefined}>
        <input className="adm-input" value={c.name || ''} onChange={set('name')} maxLength={60} />
      </Field>
      <IconPicker value={c.icon} onChange={set('icon')} />
      <ImageUpload label="Image (optional — replaces the icon on the home page)" value={c.image} onChange={set('image')} contain={false} height={120} />
      <Toggle checked={c.isVisible !== false} onChange={set('isVisible')} label="Show in menus and on the home page" />
    </Modal>
  );
}

export default function Categories() {
  const cms = useCms('categories');
  const [editing, setEditing] = useState(null);

  return (
    <AdminLayout>
      <Helmet><title>Categories — Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Categories</h1><p className="adm-sub">Order, icons and visibility for menus, search and the home page. Empty categories are hidden from shoppers automatically.</p></div>
        <div className="adm-tools">
          <a href="/products" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm"><FiExternalLink /> View store</a>
          <button className="btn btn-primary" onClick={() => setEditing({ name: '', icon: 'grid', isVisible: true })}><FiPlus /> Add category</button>
        </div>
      </div>
      <section className="adm-card cms-card">
        <div className="cms-list">
          {cms.items.map((c, i) => (
            <div key={c._id} className={`cms-item ${c.isVisible ? '' : 'off'}`}>
              <span className="cms-pos">{i + 1}</span>
              <span className="cms-type">{c.image ? <img src={c.image} alt="" /> : <CategoryIcon name={c.name} icon={c.icon} />}</span>
              <div className="cms-item-main">
                <strong>{c.name}</strong>
                <span>{c.count} products{c.count === 0 ? ' · hidden from shoppers until it has products' : ''}</span>
              </div>
              <button className={`adm-switch ${c.isVisible ? 'on' : ''}`} onClick={() => cms.quick(c, { isVisible: !c.isVisible })} aria-label={c.isVisible ? 'Hide category' : 'Show category'} />
              <MoveButtons index={i} total={cms.items.length} onMove={(idx, d) => cms.move(cms.items, idx, d)} />
              <button className="adm-icon-btn" onClick={() => setEditing(c)} aria-label="Edit category"><FiEdit2 /></button>
              <button className="adm-icon-btn danger" disabled={c.count > 0} title={c.count > 0 ? 'Move or delete its products first' : 'Delete'} onClick={() => window.confirm(`Delete "${c.name}"?`) && cms.remove(c)} aria-label="Delete category"><FiTrash2 /></button>
            </div>
          ))}
        </div>
      </section>
      {editing && <CategoryEditor initial={editing} onClose={() => setEditing(null)} onSave={cms.save} />}
    </AdminLayout>
  );
}
