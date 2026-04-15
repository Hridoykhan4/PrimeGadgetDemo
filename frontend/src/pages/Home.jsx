import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw,
  FiHeadphones, FiChevronLeft, FiChevronRight, FiZap,
  FiClock, FiAward, FiUsers, FiMessageCircle
} from 'react-icons/fi';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import './Home.css';

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'New Arrival 2024',
    title: 'DJI Mavic 3 Pro',
    subtitle: 'Tri-camera · Hasselblad · 43min flight',
    desc: 'Capture Every Perspective. Professional aerial imagery meets unmatched portability.',
    cta: 'Shop Drones',
    ctaLink: '/products?category=Drones',
    price: 'From AED 2,899',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=900&q=80',
    accent: '#0066FF',
    tag: '🏆 Editor\'s Choice'
  },
  {
    id: 2,
    eyebrow: 'Best Seller',
    title: 'Apple AirPods Pro',
    subtitle: 'H2 Chip · ANC · 30hr Battery',
    desc: 'Silence the world. Experience audio in its purest, most immersive form.',
    cta: 'Shop AirBuds',
    ctaLink: '/products?category=AirBuds+%26+Headphones',
    price: 'AED 849',
    image: 'https://images.unsplash.com/photo-1594074586687-2bb43be26a55?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fEFwcGxlJTIwQWlyUG9kcyUyMFByb3xlbnwwfHwwfHx8MA%3D%3D',
    accent: '#6E6E73',
    tag: '⚡ Flash Deal'
  },
  {
    id: 3,
    eyebrow: 'Just Launched',
    title: 'Meta Quest 3',
    subtitle: 'Mixed Reality · 4K+ · 120Hz',
    desc: 'Step into the future. Mixed reality has never felt this real.',
    cta: 'Shop VR & AR',
    ctaLink: '/products?category=VR+%26+AR',
    price: 'AED 1,799',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=900&q=80',
    accent: '#0099FF',
    tag: '🆕 New'
  },
];

const CATEGORIES = [
  { name: 'Drones', emoji: '🚁', img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400', count: '24 products' },
  { name: 'Smart Watches', emoji: '⌚', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', count: '18 products' },
  { name: 'AirBuds & Headphones', emoji: '🎧', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', count: '31 products' },
  { name: 'VR & AR', emoji: '🥽', img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400', count: '12 products' },
  { name: 'Cameras', emoji: '📷', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400', count: '19 products' },
  { name: 'Gaming', emoji: '🎮', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FtaW5nfGVufDB8fDB8fHww', count: '27 products' },
  { name: 'AI Devices', emoji: '🤖', img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400', count: '8 products' },
  { name: 'Accessories', emoji: '🔌', img: 'https://images.unsplash.com/photo-1569388330292-79cc1ec67270?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D', count: '45+ products' },
];

const TRUST_BADGES = [
  { icon: <FiTruck />, title: 'Free Delivery', desc: 'On orders over AED 200 across UAE' },
  { icon: <FiShield />, title: '100% Genuine', desc: 'Authorized dealer, all products verified' },
  { icon: <FiRefreshCw />, title: '30-Day Returns', desc: 'Hassle-free return policy' },
  { icon: <FiHeadphones />, title: '24/7 Support', desc: 'WhatsApp & live chat support' },
];

const TESTIMONIALS = [
  { name: 'Ahmed Al Mansouri', city: 'Dubai', rating: 5, text: 'Ordered the DJI Mavic 3 Pro and it arrived the same day in perfect condition. PrimeGadgets is the most reliable tech store in the UAE.', verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80' },
  { name: 'Sara Johnson', city: 'Abu Dhabi', rating: 5, text: 'Got my AirPods Pro with genuine Apple warranty. The customer service team helped me choose the right model. Excellent experience!', verified: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80' },
  { name: 'Khalid Ibrahim', city: 'Sharjah', rating: 5, text: 'The Meta Quest 3 arrived sealed in original packaging. Setup was smooth and the team was super helpful. 100% recommend.', verified: true, avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80' },
];

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '971581234567';
const WHATSAPP_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi PrimeGadgets! I\'m interested in your premium gadgets.';

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(WHATSAPP_MESSAGE);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const slide = HERO_SLIDES[current];

  return (
    <section className="hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="hero-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={slide.image} alt={slide.title} className="hero-bg-img" />
          <div className="hero-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className="container hero-inner">
        <div className="hero-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + 'content'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="hero-eyebrow">
                <span className="hero-tag">{slide.tag}</span>
                <span>{slide.eyebrow}</span>
              </div>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <p className="hero-desc">{slide.desc}</p>
              <div className="hero-price-row">
                <span className="hero-price">{slide.price}</span>
                <span className="hero-vat">Incl. VAT</span>
              </div>
              <div className="hero-ctas">
                <Link to={slide.ctaLink} className="btn btn-primary btn-lg">
                  {slide.cta} <FiArrowRight />
                </Link>
                <button onClick={handleWhatsApp} className="btn btn-lg hero-whatsapp-btn">
                  <FiMessageCircle size={16} /> Buy on WhatsApp
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide counter + nav */}
        <div className="hero-controls">
          <button className="hero-nav-btn" onClick={() => setCurrent(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}>
            <FiChevronLeft />
          </button>
          <div className="hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
          <button className="hero-nav-btn" onClick={() => setCurrent(c => (c + 1) % HERO_SLIDES.length)}>
            <FiChevronRight />
          </button>
        </div>
      </div>

    </section>
  );
}

function CountdownTimer({ targetDate }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, targetDate - Date.now());
      setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="countdown">
      <div className="countdown-unit"><span>{pad(time.h)}</span><small>HRS</small></div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit"><span>{pad(time.m)}</span><small>MIN</small></div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit"><span>{pad(time.s)}</span><small>SEC</small></div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const navigate = useNavigate();
  const dealTarget = useRef(Date.now() + 2 * 3600000 + 23 * 60000 + 57000);

  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/products/deals'),
      api.get('/products/new-arrivals'),
    ]).then(([featRes, dealRes, newRes]) => {
      setFeatured(featRes.data.products);
      setDeals(dealRes.data.products);
      setNewArrivals(newRes.data.products);
    }).catch(console.error).finally(() => setLoadingFeatured(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>PrimeGadgets — Dubai's Premier Gadget Store | Drones, Smart Watches, VR</title>
      </Helmet>

      <div className="home-page">
        <HeroSlider />

        {/* Trust badges */}
        <section className="trust-section">
          <div className="container trust-grid">
            {TRUST_BADGES.map((b, i) => (
              <motion.div
                key={i} className="trust-item"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="trust-icon">{b.icon}</div>
                <div>
                  <h4>{b.title}</h4>
                  <p>{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-eyebrow"><FiStar size={12} /> Curated for You</div>
                <h2 className="section-title">Featured Products</h2>
                <p className="section-sub">Handpicked by our Dubai tech experts for quality, innovation, and value.</p>
              </div>
              <Link to="/products?sort=-ratings" className="view-all-link">View All <FiArrowRight /></Link>
            </div>
            {loadingFeatured ? (
              <div className="grid-4">
                {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 380 }} />)}
              </div>
            ) : (
              <div className="grid-4">
                {featured.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </section>

        {/* WhatsApp CTA Section */}
        <section className="whatsapp-cta-section">
          <div className="container">
            <motion.div
              className="whatsapp-cta-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="whatsapp-cta-content">
                <div className="whatsapp-cta-icon">
                  <FiMessageCircle size={32} />
                </div>
                <h3 className="whatsapp-cta-title">Can't find what you need?</h3>
                <p className="whatsapp-cta-desc">
                  Our Dubai tech specialists are ready to help you find the perfect gadget. Ask us on WhatsApp for personalized recommendations and exclusive offers.
                </p>
                <button
                  onClick={() => {
                    const message = encodeURIComponent('Hi PrimeGadgets! I need help finding the right gadget. Can you help?');
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
                  }}
                  className="whatsapp-cta-btn"
                >
                  <FiMessageCircle size={18} />
                  Chat with Our Team
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-eyebrow">Browse by Type</div>
                <h2 className="section-title">Shop by Category</h2>
              </div>
              <Link to="/products" className="view-all-link">View All <FiArrowRight /></Link>
            </div>
            <div className="categories-grid">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="category-card">
                    <div className="cat-img-wrap">
                      <img src={cat.img} alt={cat.name} loading="lazy" />
                      <div className="cat-overlay" />
                    </div>
                    <div className="cat-info">
                      <span className="cat-emoji">{cat.emoji}</span>
                      <div>
                        <h3 className="cat-name">{cat.name}</h3>
                        <p className="cat-count">{cat.count}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



        {/* Flash Sale Banner */}
        {deals.length > 0 && (
          <section className="deals-section">
            <div className="container">
              <div className="deals-banner">
                <div className="deals-banner-bg" />
                <div className="deals-left">
                  <div className="flash-badge"><FiZap /> FLASH SALE</div>
                  <h2 className="deals-title">Summer Tech Sale<br /><span>Up to 40% OFF</span></h2>
                  <p>On select gadgets. Free delivery on all orders above AED 200. Limited stock — act fast!</p>
                  <div className="deals-meta">
                    <div className="deal-timer-label"><FiClock /> Sale ends in:</div>
                    <CountdownTimer targetDate={dealTarget.current} />
                  </div>
                  <div className="deals-ctas">
                    <Link to="/products?isDeal=true" className="btn btn-gold btn-lg">Shop Now <FiArrowRight /></Link>
                    <Link to="/contact" className="btn btn-ghost btn-lg">Contact Us</Link>
                  </div>
                </div>
                <div className="deals-products-preview">
                  {deals.slice(0, 3).map((p, i) => (
                    <motion.div
                      key={p._id}
                      className="deal-preview-card"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <img src={p.images?.[0]?.url} alt={p.name} />
                      <div>
                        <p className="deal-preview-name line-clamp-1">{p.name}</p>
                        <div className="deal-preview-prices">
                          <span className="deal-sale-price">AED {p.salePrice.toLocaleString()}</span>
                          <span className="deal-orig-price">AED {p.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div>
                  <div className="section-eyebrow">Just Dropped</div>
                  <h2 className="section-title">New Arrivals</h2>
                </div>
                <Link to="/products?sort=-createdAt" className="view-all-link">View All <FiArrowRight /></Link>
              </div>
              <div className="grid-4">
                {newArrivals.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Us */}
        <section className="why-section section">
          <div className="container">
            <div className="why-inner">
              <div className="why-content">
                <div className="section-eyebrow">4.9 ★ from 12,000+ Reviews</div>
                <h2 className="section-title">Why 12,000+ UAE Customers Choose Us</h2>
                <p className="why-desc">We're not just gadget sellers. We're your trusted technology partners in the UAE, providing genuine products, expert advice, and unmatched after-sales support.</p>
                <ul className="why-list">
                  {[
                    ['🔒 100% Genuine, Authorized', 'Every product sourced directly from authorized distributors'],
                    ['🚚 30+ Min Same-Day Dubai', 'Order before 3 PM for guaranteed same-day delivery in Dubai'],
                    ['💬 24/7 WhatsApp Support', 'Real tech experts, not bots — available around the clock'],
                    ['↩ Flexible Payment Options', 'Tabby & Tamara buy now, pay later available'],
                    ['🌐 Shipping Across GCC', 'Delivering across UAE, Saudi Arabia, Kuwait & more'],
                  ].map(([title, desc]) => (
                    <li key={title} className="why-item">
                      <span className="why-check">✓</span>
                      <div><strong>{title}</strong><p>{desc}</p></div>
                    </li>
                  ))}
                </ul>
                <Link to="/about" className="btn btn-primary btn-lg" style={{ marginTop: 16, width: 'fit-content' }}>
                  Learn Our Story <FiArrowRight />
                </Link>
              </div>
              <div className="why-visual">
                <div className="why-img-grid">
                  <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" alt="AirPods" className="why-img why-img-1" />
                  <img src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=300" alt="Drone" className="why-img why-img-2" />
                  <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=300" alt="VR" className="why-img why-img-3" />
                </div>
                <div className="why-rating-badge">
                  <div className="stars">{[...Array(5)].map((_, i) => <FiStar key={i} className="star-filled" />)}</div>
                  <strong>4.9 / 5</strong>
                  <span>from 12,000+ reviews</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="section testimonials-section">
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Real Reviews</div>
              <h2 className="section-title">What UAE & GCC Customers Say</h2>
              <p className="text-muted body-sm" style={{ marginTop: 4 }}>
                Thousands of verified reviews across the region from real PrimeGadgets customers
              </p>
            </div>
            <div className="testimonials-grid">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i} className="testimonial-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="testimonial-stars">
                    {[...Array(t.rating)].map((_, s) => <FiStar key={s} className="star-filled" size={14} />)}
                  </div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.city}, UAE</span>
                    </div>
                    {t.verified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
