import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUpload, FiPlus, FiX, FiSave } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['Drones','Smart Watches','AirBuds & Headphones','VR & AR','AI Devices','Cameras','Smart Home','Gaming','Laptops','Accessories','Home & Kitchen','Beauty & Personal Care','Kids & Toys','Tools & Outdoor'];

const defaultForm = { name:'',shortDescription:'',description:'',price:'',salePrice:'',category:CATEGORIES[0],brand:'',sku:'',stock:'',warranty:'1 Year',isFeatured:false,isNew:false,isBestSeller:false,isDeal:false,features:[''],specifications:[{key:'',value:''}] };

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setForm({ name:p.name, shortDescription:p.shortDescription||'', description:p.description, price:p.price, salePrice:p.salePrice||'', category:p.category, brand:p.brand, sku:p.sku||'', stock:p.stock, warranty:p.warranty||'1 Year', isFeatured:p.isFeatured, isNew:p.isNew, isBestSeller:p.isBestSeller, isDeal:p.isDeal, features:p.features?.length ? p.features : [''], specifications:p.specifications?.length ? p.specifications : [{key:'',value:''}] });
      setExistingImages(p.images || []);
    }).finally(() => setFetching(false));
  }, [id, isEdit]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'features' || k === 'specifications') return;
        fd.append(k, v);
      });
      fd.append('features', JSON.stringify(form.features.filter(Boolean)));
      fd.append('specifications', JSON.stringify(form.specifications.filter(s => s.key)));
      newImages.forEach(img => fd.append('images', img));

      if (isEdit) {
        await api.put(`/products/${id}`, Object.fromEntries(fd)); // send as JSON for edit
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  if (fetching) return <AdminLayout><div className="loading-screen"><div className="spinner" /></div></AdminLayout>;

  const Field = ({ label, children }) => <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">{label}</label>{children}</div>;

  return (
    <AdminLayout>
      <Helmet><title>{isEdit ? 'Edit' : 'Add'} Product — Admin</title></Helmet>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Basic info */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
                <div style={{ display: 'grid', gap: 16 }}>
                  <Field label="Product Name *"><input className="input" value={form.name} onChange={set('name')} required /></Field>
                  <div className="grid-2">
                    <Field label="Brand *"><input className="input" value={form.brand} onChange={set('brand')} required /></Field>
                    <Field label="Category *">
                      <select className="input" value={form.category} onChange={set('category')}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Short Description"><input className="input" value={form.shortDescription} onChange={set('shortDescription')} /></Field>
                  <Field label="Full Description *"><textarea className="input" rows={4} value={form.description} onChange={set('description')} required style={{ resize: 'vertical' }} /></Field>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Pricing & Stock</h3>
                <div className="grid-2" style={{ gap: 16 }}>
                  <Field label="Price (AED) *"><input className="input" type="number" value={form.price} onChange={set('price')} required min="0" /></Field>
                  <Field label="Sale Price (AED)"><input className="input" type="number" value={form.salePrice} onChange={set('salePrice')} min="0" /></Field>
                  <Field label="Stock *"><input className="input" type="number" value={form.stock} onChange={set('stock')} required min="0" /></Field>
                  <Field label="SKU"><input className="input" value={form.sku} onChange={set('sku')} placeholder="PG-CAT-001" /></Field>
                  <Field label="Warranty"><input className="input" value={form.warranty} onChange={set('warranty')} /></Field>
                </div>
              </div>

              {/* Features */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Features & Specs</h3>
                <label className="form-label" style={{ marginBottom: 10 }}>Key Features</label>
                {form.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="input" value={f} onChange={e => { const a = [...form.features]; a[i] = e.target.value; setForm(p => ({...p, features: a})); }} placeholder={`Feature ${i+1}`} />
                    {form.features.length > 1 && <button type="button" className="btn btn-sm btn-ghost btn-icon-sm" onClick={() => setForm(p => ({...p, features: p.features.filter((_, fi) => fi !== i)}))}><FiX size={13} /></button>}
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({...p, features: [...p.features, '']}))}><FiPlus size={13} /> Add Feature</button>

                <div style={{ marginTop: 24 }}>
                  <label className="form-label" style={{ marginBottom: 10 }}>Specifications</label>
                  {form.specifications.map((spec, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                      <input className="input" value={spec.key} onChange={e => { const a = [...form.specifications]; a[i] = {...a[i], key: e.target.value}; setForm(p => ({...p, specifications: a})); }} placeholder="e.g. Weight" />
                      <input className="input" value={spec.value} onChange={e => { const a = [...form.specifications]; a[i] = {...a[i], value: e.target.value}; setForm(p => ({...p, specifications: a})); }} placeholder="e.g. 895g" />
                      {form.specifications.length > 1 && <button type="button" className="btn btn-sm btn-ghost btn-icon-sm" onClick={() => setForm(p => ({...p, specifications: p.specifications.filter((_, si) => si !== i)}))}><FiX size={13} /></button>}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setForm(p => ({...p, specifications: [...p.specifications, {key:'',value:''}]}))}><FiPlus size={13} /> Add Spec</button>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Images */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Images</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  {[...existingImages, ...previews.map(src => ({ url: src }))].map((img, i) => (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 'var(--r)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 16px', border: '2px dashed var(--border-strong)', borderRadius: 'var(--r-lg)', cursor: 'pointer', transition: 'all .15s', fontSize: '.82rem', color: 'var(--text-3)' }}>
                  <FiUpload size={20} />
                  <span>Upload images</span>
                  <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Flags */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Visibility</h3>
                {[['isFeatured','Featured'],['isNew','New Arrival'],['isBestSeller','Best Seller'],['isDeal','On Deal']].map(([k, label]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontSize: '.875rem', color: 'var(--text-2)' }}>
                    <input type="checkbox" checked={form[k]} onChange={set(k)} style={{ width: 16, height: 16, accentColor: 'var(--blue)' }} /> {label}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/products')} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? <><div className="spinner spinner-sm" /> Saving...</> : <><FiSave /> {isEdit ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <style>{`@media(max-width:900px){ form>div{grid-template-columns:1fr !important;} }`}</style>
    </AdminLayout>
  );
}
