// Profile.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiPackage, FiHeart, FiSave } from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchMe } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put('/auth/updateprofile', profileForm);
      await fetchMe();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePwdSave = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/auth/updatepassword', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password updated!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile', icon: FiUser, label: 'Profile' },
    { id: 'password', icon: FiLock, label: 'Password' },
  ];

  return (
    <>
      <Helmet><title>Profile — PrimeGadgets</title></Helmet>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '.875rem' }}>{user?.email}</p>
              {user?.role === 'admin' && <span style={{ marginTop: 6, display: 'inline-block', padding: '2px 10px', background: 'rgba(0,102,255,.1)', color: 'var(--blue)', borderRadius: 'var(--r-full)', fontSize: '.72rem', fontWeight: 700 }}>ADMIN</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
            {/* Sidebar nav */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 12 }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', borderRadius: 'var(--r)', background: tab === t.id ? 'var(--blue)' : 'none', color: tab === t.id ? '#fff' : 'var(--text-2)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', marginBottom: 4, transition: 'all .15s' }}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 32 }}>
              {tab === 'profile' && (
                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4 }}>Edit Profile</h3>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="input" value={profileForm.name} onChange={e => setProfileForm(p => ({...p, name: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (cannot change)</label>
                    <input className="input" value={user?.email} disabled style={{ opacity: .5 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="input" value={profileForm.phone} onChange={e => setProfileForm(p => ({...p, phone: e.target.value}))} placeholder="+971 5X XXX XXXX" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}
              {tab === 'password' && (
                <form onSubmit={handlePwdSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4 }}>Change Password</h3>
                  {['currentPassword', 'newPassword', 'confirmPassword'].map(f => (
                    <div key={f} className="form-group">
                      <label className="form-label">{f === 'currentPassword' ? 'Current Password' : f === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
                      <input className="input" type="password" value={pwdForm[f]} onChange={e => setPwdForm(p => ({...p, [f]: e.target.value}))} required />
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                    <FiLock /> {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:640px){ .page .container > div:last-child{grid-template-columns:1fr !important;} }`}</style>
    </>
  );
}
