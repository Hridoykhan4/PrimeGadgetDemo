import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiMessageCircle,
  FiHeadphones, FiShield, FiTruck, FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api.js';
import './Contact.css';

import { useSiteStore } from '../store/site.js';

const contactInfo = (WA_DISPLAY, SUPPORT_EMAIL, ADDRESS) => [
  {
    icon: FiMessageCircle,
    label: 'WhatsApp',
    value: WA_DISPLAY,
    sub: 'Fastest way to reach us · Arabic & English',
    color: '#25d366',
    bg: 'rgba(37, 211, 102, 0.08)',
  },
  {
    icon: FiMail,
    label: 'Email',
    value: SUPPORT_EMAIL,
    sub: 'For orders, returns and business enquiries',
    color: '#ff6b00',
    bg: 'rgba(255, 107, 0, 0.08)',
  },
  {
    icon: FiMapPin,
    label: 'Delivery area',
    value: ADDRESS || 'All 7 emirates',
    sub: 'Shipped from our UAE stock',
    color: '#0066ff',
    bg: 'rgba(0, 102, 255, 0.08)',
  },
];

const WHY_CONTACT = [
  {
    icon: FiHeadphones,
    title: 'Real people',
    desc: 'Our UAE team answers every message personally',
    color: '#0066ff',
  },
  {
    icon: FiShield,
    title: 'Secure & private',
    desc: 'Your details are only used to handle your request',
    color: '#00c853',
  },
  {
    icon: FiTruck,
    title: 'Order help',
    desc: 'Track, change or cancel an order with your order number',
    color: '#ff6b00',
  },
];

export default function Contact() {
  const contact = useSiteStore((st) => st.settings.contact);
  const WA_NUMBER = String(contact.whatsapp || '').replace(/\D/g, '');
  const WA_DISPLAY = WA_NUMBER ? `+${WA_NUMBER.slice(0, 3)} ${WA_NUMBER.slice(3, 5)} ${WA_NUMBER.slice(5, 8)} ${WA_NUMBER.slice(8)}` : '';
  const CONTACT_INFO = contactInfo(WA_DISPLAY, contact.email, contact.address);
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const productName = searchParams.get('product');
    const productId = searchParams.get('id');
    if (productName) {
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: `Product Enquiry: ${productName}`,
        message: productId
          ? `Hi, I'm interested in this product: ${productName} (ID: ${productId}).\n\nPlease share more details and pricing.`
          : `Hi, I'm interested in: ${productName}.\n\nPlease share more details and pricing.`,
      });
    }
  }, [searchParams]);

  const s = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/messages', { ...form, type: form.subject === 'Feedback' ? 'feedback' : 'contact' });
      toast.success('Message sent! Our team will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send your message. Please try WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Helmet><title>Contact Us — PrimeGadgets Dubai</title></Helmet>
      <div className="contact-page">
        {/* ── HERO SECTION ───────────────────────────── */}
        <section className="contact-hero">
          <div className="contact-hero-bg" />
          <div className="container">
            <motion.div
              className="contact-hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="contact-eyebrow">
                <FiMessageCircle /> We're Here For You
              </span>
              <h1 className="contact-hero-title">
                Get in Touch with<br />
                <span className="gradient-text">PrimeGadgets</span>
              </h1>
              <p className="contact-hero-desc">
                Questions about a product or an order? Our UAE team is ready to help
                on WhatsApp or by message.
              </p>

              {/* Quick Actions */}
              <div className="contact-quick-actions">
                <motion.a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-quick-btn whatsapp"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMessageCircle size={18} />
                  <span>WhatsApp Now</span>
                  <FiArrowRight size={14} />
                </motion.a>
                <motion.a
                  href={`tel:+${WA_NUMBER}`}
                  className="contact-quick-btn call"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPhone size={18} />
                  <span>Call Us</span>
                  <FiArrowRight size={14} />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CONTACT CARDS ──────────────────────────── */}
        <section className="contact-cards-section">
          <div className="container">
            <div className="contact-cards-grid">
              {CONTACT_INFO.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="contact-info-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="contact-card-icon" style={{ background: item.bg, color: item.color }}>
                    <item.icon size={22} />
                  </div>
                  <h3 className="contact-card-label">{item.label}</h3>
                  <p className="contact-card-value">{item.value}</p>
                  <p className="contact-card-sub">{item.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT ───────────────────────────── */}
        <section className="contact-main">
          <div className="container">
            <div className="contact-main-grid">
              {/* Left: Form */}
              <motion.div
                className="contact-form-wrap"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Product Enquiry Banner */}
                {searchParams.get('product') && (
                  <motion.div
                    className="contact-product-banner"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FiMessageCircle size={20} />
                    <div>
                      <strong>Product Enquiry</strong>
                      <span>{searchParams.get('product')}</span>
                    </div>
                  </motion.div>
                )}

                <div className="contact-form-header">
                  <h2>Send Us a Message</h2>
                  <p>Fill out the form below and we'll respond promptly</p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <FiMail size={14} /> Full Name *
                      </label>
                      <input
                        className="contact-input"
                        value={form.name}
                        onChange={s('name')}
                        placeholder="Ahmed Al Mansouri"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <FiMail size={14} /> Email
                      </label>
                      <input
                        className="contact-input"
                        type="email"
                        value={form.email}
                        onChange={s('email')}
                        placeholder="ahmed@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label"><FiPhone size={14} /> Mobile (optional)</label>
                    <input className="contact-input" type="tel" inputMode="tel" value={form.phone} onChange={s('phone')} placeholder="05X XXX XXXX" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="contact-input" value={form.subject} onChange={s('subject')}>
                      <option value="">Select a topic</option>
                      <option>Product Enquiry</option>
                      <option>Order Support</option>
                      <option>Returns & Refunds</option>
                      <option>Technical Support</option>
                      <option>Wholesale / B2B</option>
                      <option>Feedback</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      className="contact-input contact-textarea"
                      rows={5}
                      value={form.message}
                      onChange={s('message')}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={sending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {sending ? (
                      <>
                        <div className="spinner spinner-sm" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend size={18} />
                        Send Message
                      </>
                    )}
                  </motion.button>

                  <p className="contact-form-note">
                    Prefer a faster answer? Message us on WhatsApp.
                  </p>
                </form>
              </motion.div>

              {/* Right: Map + Why Contact */}
              <motion.div
                className="contact-sidebar"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Why Contact Us */}
                <div className="contact-why-card">
                  <h3>Why Choose Us?</h3>
                  <div className="contact-why-list">
                    {WHY_CONTACT.map((item, i) => (
                      <motion.div
                        key={item.title}
                        className="contact-why-item"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <div className="contact-why-icon" style={{ color: item.color }}>
                          <item.icon size={20} />
                        </div>
                        <div className="contact-why-content">
                          <strong>{item.title}</strong>
                          <span>{item.desc}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp CTA Card */}
                <motion.a
                  href={`https://wa.me/${WA_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-whatsapp-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="contact-whatsapp-icon">
                    <FiMessageCircle size={28} />
                  </div>
                  <div className="contact-whatsapp-content">
                    <strong>Prefer WhatsApp?</strong>
                    <span>Chat with us directly for instant support</span>
                  </div>
                  <FiArrowRight size={20} />
                </motion.a>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
