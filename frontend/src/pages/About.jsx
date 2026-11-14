import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiZap, FiShield, FiTruck, FiMessageCircle, FiDollarSign, FiTag, FiArrowRight, FiUserCheck } from 'react-icons/fi';
import './Shop.css';

const VALUES = [
  { icon: FiTag, title: 'Low prices, every day', desc: 'We keep our range focused on useful everyday products and price them fairly for UAE shoppers.' },
  { icon: FiTruck, title: 'Shipped inside the UAE', desc: 'Orders ship from local stock, so there is no long international wait. Free delivery over AED 200.' },
  { icon: FiDollarSign, title: 'Pay the way you like', desc: 'Cash on delivery across the UAE, or pay instantly by card, Apple Pay or Google Pay through Stripe.' },
  { icon: FiUserCheck, title: 'No account needed', desc: 'Check out as a guest in under a minute and track your order with your order number and mobile.' },
  { icon: FiShield, title: 'Secure by design', desc: 'Card details are entered on Stripe\'s secure page — we never see or store card numbers.' },
  { icon: FiMessageCircle, title: 'Real support', desc: 'Questions before or after you buy? Message our UAE team on WhatsApp in Arabic or English.' },
];

export default function About() {
  return (
    <>
      <Helmet><title>About us — PrimeGadgets</title></Helmet>
      <div className="shop-page">
        <div className="container" style={{ maxWidth: 1040 }}>
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="about-hero">
            <span className="about-kicker"><FiZap /> About PrimeGadgets</span>
            <h1 className="shop-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Smart everyday shopping for the UAE</h1>
            <p>
              PrimeGadgets is an online store for practical products — kitchen and home gear, beauty and personal care,
              toys, tools and accessories — at prices that make sense. Everything ships from stock inside the UAE, and you can
              pay by card or in cash when it arrives.
            </p>
            <div className="about-ctas">
              <Link to="/products" className="btn btn-primary btn-lg">Start shopping <FiArrowRight /></Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">Contact us</Link>
            </div>
          </motion.section>

          <div className="about-grid">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} className="about-card" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <span className="about-icon"><v.icon /></span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .about-hero { text-align: center; max-width: 720px; margin: 0 auto 40px; }
        .about-kicker { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; background: rgba(61,139,255,.12); color: var(--blue); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 16px; }
        .about-hero p { font-size: 1.05rem; color: var(--text-2); line-height: 1.8; margin-top: 14px; }
        .about-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
        .about-ctas .btn { gap: 8px; }
        .about-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .about-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 24px; }
        .about-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(61,139,255,.12); color: var(--blue); font-size: 1.25rem; margin-bottom: 14px; }
        .about-card h3 { font-family: var(--font-display); font-size: 1.02rem; margin-bottom: 6px; }
        .about-card p { font-size: .9rem; color: var(--text-2); line-height: 1.65; }
        @media (max-width: 860px) { .about-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .about-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
