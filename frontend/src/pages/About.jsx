import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiZap, FiShield, FiTruck, FiHeadphones, FiAward, FiUsers, FiGlobe, FiStar } from 'react-icons/fi';

const STATS = [
  { value: '50K+', label: 'Happy Customers', icon: FiUsers },
  { value: '1,200+', label: 'Products', icon: FiZap },
  { value: '4.9★', label: 'Average Rating', icon: FiStar },
  { value: '7 UAE', label: 'Emirates Covered', icon: FiGlobe },
];

const VALUES = [
  { icon: FiShield, title: '100% Authentic', desc: 'Every product is sourced directly from authorised distributors and brand partners. No grey market, no fakes.' },
  { icon: FiTruck, title: 'Fast UAE Delivery', desc: 'Same-day delivery in Dubai for orders before 2 PM. Next-day delivery across all 7 Emirates.' },
  { icon: FiHeadphones, title: '24/7 Expert Support', desc: 'Our tech specialists are available around the clock via WhatsApp, call or live chat.' },
  { icon: FiAward, title: 'Official Warranty', desc: 'All products carry full manufacturer warranty. We handle warranty claims on your behalf.' },
];

const TEAM = [
  { name: 'Omar Al Rashid', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', bio: 'Serial tech entrepreneur with 15 years in Dubai\'s retail market.' },
  { name: 'Sarah Mitchell', role: 'Head of Products', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', bio: 'Ex-Apple and DJI retail specialist. Curates our exclusive product lineup.' },
  { name: 'Khalid Bin Zayed', role: 'Operations Director', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200', bio: 'Logistics expert ensuring blazing-fast delivery across the UAE.' },
];

export default function About() {
  return (
    <>
      <Helmet><title>About Us — PrimeGadgets Dubai</title></Helmet>
      <div style={{ paddingTop: 'var(--nav-h)' }}>
        {/* Hero */}
        <section style={{ padding: '80px 0 60px', background: 'linear-gradient(135deg, var(--bg) 0%, var(--surface-2) 100%)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(0,102,255,.1)', color: 'var(--blue)', borderRadius: 'var(--r-full)', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 20 }}>
                <FiZap /> Our Story
              </span>
              <h1 className="display-lg" style={{ marginBottom: 20 }}>Dubai's Most Trusted <span className="gradient-text">Gadget Store</span></h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-2)', lineHeight: 1.8 }}>
                Founded in 2019, PrimeGadgets was born from a simple belief: Dubai's tech-savvy residents deserve a premium shopping experience that matches their lifestyle. We bring you the world's most cutting-edge gadgets — curated, authentic, and delivered fast.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="section-sm">
          <div className="container">
            <div className="grid-4">
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '28px 24px', textAlign: 'center' }}>
                  <s.icon size={24} style={{ color: 'var(--blue)', margin: '0 auto 12px' }} />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontSize: '.875rem', color: 'var(--text-3)' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section" style={{ background: 'var(--surface-2)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="display-md">Why Choose <span className="gradient-text">PrimeGadgets</span>?</h2>
            </div>
            <div className="grid-4">
              {VALUES.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 28 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'rgba(0,102,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--blue)' }}><v.icon size={22} /></div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                  <p style={{ fontSize: '.875rem', color: 'var(--text-2)', lineHeight: 1.7 }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="display-md">Meet the Team</h2>
            </div>
            <div className="grid-3" style={{ maxWidth: 800, margin: '0 auto' }}>
              {TEAM.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
                  <img src={m.img} alt={m.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', border: '3px solid var(--border)' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>{m.name}</h3>
                  <p style={{ color: 'var(--blue)', fontSize: '.82rem', fontWeight: 600, marginBottom: 10 }}>{m.role}</p>
                  <p style={{ fontSize: '.82rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{m.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 0', background: 'var(--blue)', textAlign: 'center', color: '#fff' }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 16 }}>Ready to Upgrade?</h2>
            <p style={{ opacity: .85, marginBottom: 28, fontSize: '1.05rem' }}>Explore 1,200+ premium gadgets, all with official warranty and fast UAE delivery.</p>
            <Link to="/products" className="btn btn-lg" style={{ background: '#fff', color: 'var(--blue)', fontWeight: 700 }}>Shop Now →</Link>
          </div>
        </section>
      </div>
    </>
  );
}
