// ── pages/Login.jsx ──────────────────────────────────────────
import './Auth.css';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : (searchParams.get('redirect') || '/'));
    } catch {}
  };

  return (
    <>
      <Helmet><title>Login — PrimeGadgets</title></Helmet>
      <div className="auth-page">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="auth-logo"><div className="logo-icon" style={{ width: 44, height: 44, fontSize: '1.3rem' }}><FiZap /></div><div><div className="logo-prime" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>PrimeGadgets</div><div className="logo-gadgets" style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)' }}>Dubai</div></div></div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-sub">Sign in to your PrimeGadgets account</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap"><FiMail className="input-icon-left" size={16} /><input className="input has-icon-left" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap"><FiLock className="input-icon-left" size={16} /><input className="input has-icon-left has-icon-right" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required /><button type="button" className="input-icon-right" onClick={() => setShowPwd(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button></div>
            </div>
            <div style={{ textAlign: 'right', marginTop: -8 }}><Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--blue)' }}>Forgot password?</Link></div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="auth-switch">Don't have an account? <Link to="/register">Create one →</Link></p>
          <div className="auth-demo"><p>Demo Admin: <code>admin@primegadgets.ae</code> / <code>admin@PG2024</code></p></div>
        </motion.div>
      </div>
    </>
  );
}

export default Login;
