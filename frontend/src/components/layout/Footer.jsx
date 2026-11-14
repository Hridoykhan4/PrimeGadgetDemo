import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiMail, FiMessageCircle, FiTruck, FiLock, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { useCatalogStore } from '../../store/catalog.js';
import { categoryHref } from '../../utils/categories.jsx';
import './Footer.css';

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '971581234567';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@primegadgets.ae';

export default function Footer() {
  const { categories, load } = useCatalogStore();
  useEffect(() => { load(); }, [load]);

  return (
    <footer className="footer">
      <div className="footer-perks">
        <div className="container footer-perks-grid">
          <div><FiTruck /><span><strong>Free delivery</strong> over AED 200</span></div>
          <div><FiDollarSign /><span><strong>Cash on delivery</strong> across the UAE</span></div>
          <div><FiLock /><span><strong>Secure card payment</strong> by Stripe</span></div>
          <div><FiMessageCircle /><span><strong>WhatsApp support</strong> in Arabic & English</span></div>
        </div>
      </div>
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-icon"><FiZap /></div>
                <div><span className="logo-prime">Prime</span><span className="logo-gadgets">Gadgets</span></div>
              </Link>
              <p className="footer-desc">Everyday essentials, home and kitchen gear, beauty tools and toys at low prices — shipped from UAE stock to all 7 emirates.</p>
            </div>

            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                {categories.slice(0, 6).map((c) => (
                  <li key={c.name}><Link to={categoryHref(c.name)}>{c.name}</Link></li>
                ))}
                <li><Link to="/products">All products</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Help</h4>
              <ul>
                <li><Link to="/track">Track your order</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
                <li><Link to="/contact">Contact us</Link></li>
                <li><Link to="/about">About us</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="contact-list">
                <li><FiMessageCircle /> <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a></li>
                <li><FiMail /> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
                <li><FiMapPin /> Delivering across the UAE</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} PrimeGadgets. All rights reserved.</p>
          <div className="footer-payment">
            {['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Cash on delivery'].map((p) => (
              <span key={p} className="payment-chip">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
