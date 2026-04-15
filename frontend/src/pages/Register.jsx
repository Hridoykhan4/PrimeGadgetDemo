import React, { useState } from 'react';
import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try { await register(form.name, form.email, form.password); navigate('/'); } catch {}
  };

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));

  return (
    <>
      <Helmet><title>Create Account — PrimeGadgets</title></Helmet>
      <div className="auth-page">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="auth-logo">
            <div className="logo-icon" style={{ width: 44, height: 44, fontSize: '1.3rem', background: 'var(--blue)', color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-blue)' }}><FiZap /></div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>PrimeGadgets</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)' }}>Dubai</div>
            </div>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Join 12,000+ UAE gadget enthusiasts</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap"><FiUser className="input-icon-left" size={16} /><input className="input has-icon-left" type="text" placeholder="Ahmed Al Mansouri" value={form.name} onChange={set('name')} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap"><FiMail className="input-icon-left" size={16} /><input className="input has-icon-left" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap"><FiLock className="input-icon-left" size={16} /><input className="input has-icon-left has-icon-right" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} required /><button type="button" className="input-icon-right" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }} onClick={() => setShowPwd(s => !s)}>{showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button></div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrap"><FiLock className="input-icon-left" size={16} /><input className="input has-icon-left" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in →</Link></p>
        </motion.div>
      </div>
    </>
  );
}
