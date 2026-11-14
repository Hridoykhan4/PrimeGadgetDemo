import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight, FiChevronLeft, FiChevronRight, FiTruck, FiShield, FiCreditCard,
  FiMessageCircle, FiShoppingCart, FiGrid, FiPause, FiPlay, FiTag, FiTrendingUp, FiDollarSign, FiZap,
} from 'react-icons/fi';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductRail from '../components/product/ProductRail.jsx';
import { useCartStore, fmtAED } from '../store/index.js';
import { recentlyViewed } from '../store/catalog.js';
import { CATEGORY_ICONS } from '../utils/categories.jsx';
import { useCartDrawerStore } from '../components/ui/uiStore.js';
import './Home.css';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '971581234567';


const PRICE_TABS = [
  { label: 'Under AED 20', max: 20 },
  { label: 'Under AED 35', max: 35 },
  { label: 'Under AED 60', max: 60 },
];

const shortName = (name = '') => name.split(/[,–-]/)[0].trim().slice(0, 60);
const priceOf = (p) => (p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price);
const img800 = (p) => p.images?.[0]?.url;

/* ── Hero: real best-selling products ─────────────────────────────────────── */
function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartDrawerStore((s) => s.open);
  const n = slides.length;

  const go = useCallback((d) => setI((c) => (c + d + n) % n), [n]);

  useEffect(() => {
    if (paused || reduce || n < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, reduce, n, go]);

  if (!n) return <div className="hero-skeleton skeleton" aria-hidden="true" />;
  const p = slides[i];

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  return (
    <section
      className="hero2"
      aria-roledescription="carousel"
      aria-label="Best sellers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKey}
    >
      <div className="hero2-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={p._id}
            className="hero2-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="hero2-copy">
              <div className="hero2-eyebrow">
                <span className="hero2-chip"><FiTrendingUp aria-hidden="true" /> Top pick</span>
                <span>{p.category}</span>
              </div>
              <h1 className="hero2-title">{shortName(p.name)}</h1>
              <p className="hero2-desc line-clamp-2">{p.name}</p>
              <div className="hero2-price">
                <span className="hero2-cur">AED</span>
                <span className="hero2-amt">{fmtAED(priceOf(p))}</span>
                <span className="hero2-vat">+ 5% VAT at checkout</span>
              </div>
              <div className="hero2-ctas">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => { addItem(p, 1); openCart(); }}
                >
                  <FiShoppingCart aria-hidden="true" /> Add to cart
                </button>
                <Link to={`/products/${p._id}`} className="btn btn-secondary btn-lg">
                  View details <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
              <p className="hero2-note"><FiTruck aria-hidden="true" /> In stock in the UAE · Cash on delivery available</p>
            </div>
            <Link to={`/products/${p._id}`} className="hero2-visual" tabIndex={-1} aria-hidden="true">
              <div className="hero2-blob" />
              <img src={img800(p)} alt="" className="hero2-img" fetchpriority="high" />
            </Link>
          </motion.div>
        </AnimatePresence>

        {n > 1 && (
          <div className="hero2-controls">
            <button type="button" className="hero2-btn" onClick={() => go(-1)} aria-label="Previous slide"><FiChevronLeft /></button>
            <div className="hero2-dots" role="tablist" aria-label="Choose slide">
              {slides.map((s, k) => (
                <button
                  key={s._id}
                  type="button"
                  role="tab"
                  aria-selected={k === i}
                  aria-label={`Slide ${k + 1}: ${shortName(s.name)}`}
                  className={`hero2-dot ${k === i ? 'active' : ''}`}
                  onClick={() => setI(k)}
                />
              ))}
            </div>
            <button type="button" className="hero2-btn" onClick={() => go(1)} aria-label="Next slide"><FiChevronRight /></button>
            {!reduce && (
              <button type="button" className="hero2-btn" onClick={() => setPaused((v) => !v)} aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}>
                {paused ? <FiPlay /> : <FiPause />}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="hero2-side">
        <Link to="/products?price[lte]=20&sort=price" className="promo-tile promo-tile-a">
          <span className="promo-kicker"><FiTag aria-hidden="true" /> Everyday low prices</span>
          <strong>Under AED 20</strong>
          <span className="promo-link">Shop now <FiArrowRight aria-hidden="true" /></span>
        </Link>
        <Link to="/products" className="promo-tile promo-tile-b">
          <span className="promo-kicker"><FiTruck aria-hidden="true" /> Free delivery</span>
          <strong>On orders over AED 200</strong>
          <span className="promo-link">Start shopping <FiArrowRight aria-hidden="true" /></span>
        </Link>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, to, icon: Icon }) {
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <div className="sec-eyebrow">{Icon && <Icon aria-hidden="true" />} {eyebrow}</div>}
        <h2 className="sec-title">{title}</h2>
      </div>
      {to && <Link to={to} className="sec-link">See all <FiArrowRight aria-hidden="true" /></Link>}
    </div>
  );
}

const GridSkeleton = ({ count = 5 }) => (
  <div className="home-grid" aria-hidden="true">
    {[...Array(count)].map((_, k) => <div key={k} className="skeleton card-skeleton" />)}
  </div>
);

export default function Home() {
  const [best, setBest] = useState([]);
  const [newest, setNewest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shelves, setShelves] = useState({});
  const [priceTab, setPriceTab] = useState(0);
  const [priceItems, setPriceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recent] = useState(() => recentlyViewed.get());

  useEffect(() => {
    Promise.all([
      api.get('/products', { params: { sort: '-isBestSeller,-isFeatured,-createdAt', limit: 10 } }),
      api.get('/products/new-arrivals'),
      api.get('/products/categories'),
    ])
      .then(async ([b, nw, cats]) => {
        setBest(b.data.products);
        setNewest(nw.data.products);
        const sorted = cats.data.categories.filter((c) => c.count > 0).sort((a, z) => z.count - a.count);
        setCategories(sorted);
        const shelfCats = sorted.filter((c) => c.count >= 3).slice(0, 4).map((c) => c.name);
        const res = await Promise.all(shelfCats.map((c) => api.get('/products', { params: { category: c, sort: '-isBestSeller,-createdAt', limit: 14 } })));
        setShelves(Object.fromEntries(shelfCats.map((c, k) => [c, res[k].data.products])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get('/products', { params: { 'price[lte]': PRICE_TABS[priceTab].max, sort: '-isBestSeller,price', limit: 14 } })
      .then(({ data }) => setPriceItems(data.products))
      .catch(() => setPriceItems([]));
  }, [priceTab]);

  const heroSlides = useMemo(() => best.slice(0, 5), [best]);

  return (
    <>
      <Helmet>
        <title>PrimeGadgets — Everyday essentials at low prices, delivered fast in the UAE</title>
        <meta name="description" content="Shop kitchen appliances, beauty tools, kids' art sets and more at low prices. Local UAE stock, delivery in 1 business day, cash on delivery or secure card payment." />
      </Helmet>

      <div className="home2">
        <div className="container">
          <HeroSlider slides={heroSlides} />
        </div>

        {/* Trust strip */}
        <section className="trust2" aria-label="Why shop with PrimeGadgets">
          <div className="container trust2-grid">
            {[
              [FiTruck, 'Fast UAE delivery', 'Shipped from local stock'],
              [FiDollarSign, 'Cash on delivery', 'Pay when it arrives'],
              [FiCreditCard, 'Secure card payment', 'Visa, Mastercard, Apple Pay via Stripe'],
              [FiMessageCircle, 'WhatsApp support', 'Real people, quick replies'],
            ].map(([Icon, t, d]) => (
              <div className="trust2-item" key={t}>
                <span className="trust2-icon"><Icon aria-hidden="true" /></span>
                <div><strong>{t}</strong><span>{d}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="container home-sec" aria-labelledby="cat-title">
            <div className="sec-head"><h2 id="cat-title" className="sec-title">Shop by category</h2></div>
            <div className="cat-rail">
              {categories.map((c) => {
                const Icon = CATEGORY_ICONS[c.name] || FiGrid;
                return (
                  <Link key={c.name} to={`/products?category=${encodeURIComponent(c.name)}`} className="cat-chip">
                    <span className="cat-chip-icon"><Icon aria-hidden="true" /></span>
                    <span className="cat-chip-name">{c.name}</span>
                    <span className="cat-chip-count">{c.count} items</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Best sellers */}
        <section className="container home-sec">
          <SectionHead eyebrow="Customer favourites" icon={FiTrendingUp} title="Top picks for you" to="/products" />
          {loading ? <GridSkeleton /> : (
            <div className="home-grid">
              {best.map((p, k) => <ProductCard key={p._id} product={p} index={k} />)}
            </div>
          )}
        </section>

        {/* Price-point shelf */}
        <section className="price-band">
          <div className="container home-sec">
            <SectionHead eyebrow="Low prices, every day" icon={FiZap} title="Great finds for less" />
            <div className="price-tabs" role="tablist" aria-label="Price range">
              {PRICE_TABS.map((t, k) => (
                <button
                  key={t.label}
                  type="button"
                  role="tab"
                  aria-selected={k === priceTab}
                  className={`price-tab ${k === priceTab ? 'active' : ''}`}
                  onClick={() => setPriceTab(k)}
                >
                  {t.label}
                </button>
              ))}
              <Link to={`/products?price[lte]=${PRICE_TABS[priceTab].max}&sort=price`} className="sec-link price-all">
                See all <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
            {priceItems.length ? <ProductRail products={priceItems} label={PRICE_TABS[priceTab].label} /> : <GridSkeleton />}
          </div>
        </section>

        {/* Category shelves */}
        {Object.keys(shelves).map((c) =>
          shelves[c]?.length ? (
            <section key={c} className="container home-sec">
              <SectionHead title={c} icon={CATEGORY_ICONS[c]} eyebrow="Popular picks" to={`/products?category=${encodeURIComponent(c)}`} />
              <ProductRail products={shelves[c]} label={c} />
            </section>
          ) : null
        )}

        {/* New arrivals */}
        {newest.length > 0 && (
          <section className="container home-sec">
            <SectionHead eyebrow="Just added" title="New arrivals" to="/products?sort=-createdAt" />
            <div className="home-grid">
              {newest.slice(0, 5).map((p, k) => <ProductCard key={p._id} product={p} index={k} />)}
            </div>
          </section>
        )}

        {recent.length > 2 && (
          <section className="container home-sec">
            <SectionHead eyebrow="Pick up where you left off" title="Recently viewed" />
            <ProductRail products={recent} label="Recently viewed" />
          </section>
        )}

        {/* Promise + WhatsApp */}
        <section className="container home-sec">
          <div className="promise">
            <div className="promise-copy">
              <h2 className="sec-title">Shopping made simple</h2>
              <ul className="promise-list">
                <li><FiShield aria-hidden="true" /><div><strong>See the price you pay</strong><span>VAT and delivery are shown before you place your order.</span></div></li>
                <li><FiTruck aria-hidden="true" /><div><strong>Shipped from inside the UAE</strong><span>No international waiting. Free delivery over AED 200.</span></div></li>
                <li><FiZap aria-hidden="true" /><div><strong>No account needed</strong><span>Check out as a guest in under a minute and track your order with your mobile number.</span></div></li>
                <li><FiCreditCard aria-hidden="true" /><div><strong>Pay your way</strong><span>Cash on delivery, or card / Apple Pay / Google Pay through Stripe.</span></div></li>
              </ul>
            </div>
            <div className="promise-cta">
              <FiMessageCircle className="promise-cta-icon" aria-hidden="true" />
              <h3>Questions before you buy?</h3>
              <p>Message our team on WhatsApp for product details, bulk orders or delivery questions.</p>
              <a
                className="btn btn-lg promise-wa"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi PrimeGadgets! I have a question about a product.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiMessageCircle aria-hidden="true" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
