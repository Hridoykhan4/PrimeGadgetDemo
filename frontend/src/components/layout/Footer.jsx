import React from 'react';
import { Link } from 'react-router-dom';
import { FiZap, FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-icon"><FiZap /></div>
                <div><span className="logo-prime">Prime</span><span className="logo-gadgets">Gadgets</span></div>
              </Link>
              <p className="footer-desc">Dubai's premier destination for premium gadgets, drones, smart devices, and next-gen electronics. Trusted by 12,000+ UAE customers.</p>
              <div className="footer-socials">
                <a href="#!" className="social-link"><FiFacebook /></a>
                <a href="#!" className="social-link"><FiTwitter /></a>
                <a href="#!" className="social-link"><FiInstagram /></a>
                <a href="#!" className="social-link"><FiYoutube /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Shop</h4>
              <ul>
                {['Drones','Smart Watches','AirBuds & Headphones','VR & AR','Cameras','Gaming'].map(c => (
                  <li key={c}><Link to={`/products?category=${encodeURIComponent(c)}`}>{c}</Link></li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><Link to="/wishlist">Wishlist</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/register">Create Account</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="contact-list">
                <li><FiMapPin /> Shop 12, Dubai Mall, Financial Centre Rd, Downtown Dubai</li>
                <li><FiPhone /> +971 4 000 0000</li>
                <li><FiMail /> hello@primegadgets.ae</li>
              </ul>
              <div className="footer-trust">
                <span>🔒 SSL Secured</span>
                <span>⚡ Same-day Dubai</span>
                <span>↩ 30-day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} PrimeGadgets Dubai. All rights reserved.</p>
          <div className="footer-payment">
            {['Visa','Mastercard','Apple Pay','Google Pay','COD'].map(p => (
              <span key={p} className="payment-chip">{p}</span>
            ))}
          </div>
          <div className="footer-legal">
            <a href="#!">Privacy</a>
            <a href="#!">Terms</a>
            <a href="#!">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
