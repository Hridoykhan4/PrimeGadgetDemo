import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiMail, FiMessageCircle, FiTruck, FiLock, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { useCatalogStore } from '../../store/catalog.js';
import { useSiteStore } from '../../store/site.js';
import Brand from './Brand.jsx';
import { categoryHref } from '../../utils/categories.jsx';
import './Footer.css';


export default function Footer() {
  const { categories, load } = useCatalogStore();
  const settings = useSiteStore((s) => s.settings);
  const WA_NUMBER = String(settings.contact.whatsapp || '').replace(/\D/g, '');
  const SUPPORT_EMAIL = settings.contact.email;
  const c = settings.commerce;
  const social = Object.entries(settings.social || {}).filter(([, v]) => v);
  useEffect(() => { load(); }, [load]);

  return (
    <footer className="footer">
      <div className="footer-perks">
        <div className="container footer-perks-grid">
          {c.freeShippingMin > 0 && <div><FiTruck /><span><strong>Free delivery</strong> over {c.currency || 'AED'} {c.freeShippingMin}</span></div>}
          {c.codEnabled !== false && <div><FiDollarSign /><span><strong>Cash on delivery</strong> across the UAE</span></div>}
          <div><FiLock /><span><strong>Secure card payment</strong> by Stripe</span></div>
          <div><FiMessageCircle /><span><strong>WhatsApp support</strong> in Arabic & English</span></div>
        </div>
      </div>
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo"><Brand size={34} /></Link>
              <p className="footer-desc">{settings.footer?.about || settings.brand.tagline}</p>
              {social.length > 0 && (
                <div className="footer-socials">
                  {social.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="social-chip">{k === 'x' ? 'X' : k[0].toUpperCase() + k.slice(1)}</a>)}
                </div>
              )}
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
                {SUPPORT_EMAIL && <li><FiMail /> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>}
                {settings.contact.phone && <li><FiMessageCircle /> <a href={`tel:${settings.contact.phone}`}>{settings.contact.phone}</a></li>}
                <li><FiMapPin /> {settings.contact.address || 'Delivering across the UAE'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} {settings.brand.name}. All rights reserved.</p>
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
