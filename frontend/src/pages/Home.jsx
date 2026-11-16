// Home page — fully driven by Admin → Storefront (banners, sections, categories, settings). No hard-coded content.
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiShoppingCart, FiPause, FiPlay, FiMessageCircle } from 'react-icons/fi';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductRail from '../components/product/ProductRail.jsx';
import { useCartStore, fmtAED } from '../store/index.js';
import { useSiteStore, useWhatsApp } from '../store/site.js';
import { recentlyViewed } from '../store/catalog.js';
import { Icon, CategoryIcon, categoryHref } from '../utils/categories.jsx';
import { useCartDrawerStore } from '../components/ui/uiStore.js';
import './Home.css';

const shortName = (name = '') => name.split(/[,–-]/)[0].trim().slice(0, 60);
const priceOf = (p) => (p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price);
const isExternal = (href = '') => /^https?:\/\//.test(href);

function SmartLink({ to, className, children, ...rest }) {
  if (!to) return <div className={className} {...rest}>{children}</div>;
  return isExternal(to)
    ? <a href={to} className={className} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
    : <Link to={to} className={className} {...rest}>{children}</Link>;
}

/* ── Hero slider: product slides or custom banners from the dashboard ── */
function HeroSlider({ slides, side }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartDrawerStore((s) => s.open);
  const n = slides.length;
  const go = useCallback((d) => setI((c) => (c + d + n) % n), [n]);

  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    if (paused || reduce || n < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, reduce, n, go]);

  if (!n && !side.length) return null;
  const b = slides[Math.min(i, n - 1)];
  const p = b?.kind === 'product' ? b.product : null;
  const title = b?.title || (p ? shortName(p.name) : '');
  const subtitle = b?.subtitle || (p ? p.name : '');
  const image = b?.image || p?.images?.[0]?.url;
  const href = b?.ctaLink || (p ? `/products/${p._id}` : null);

  return (
    <section className={`hero2 ${side.length ? '' : 'no-side'}`} aria-roledescription="carousel" aria-label="Featured"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}>
      {n > 0 && (
        <div className={`hero2-main theme-${b.theme || 'light'}`}>
          <AnimatePresence mode="wait">
            <motion.div key={b._id} className="hero2-slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}
              initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <div className="hero2-copy">
                <div className="hero2-eyebrow">
                  {b.kicker && <span className="hero2-chip"><Icon name="trending" /> {b.kicker}</span>}
                  {p && <span>{p.category}</span>}
                </div>
                <h1 className="hero2-title">{title}</h1>
                {subtitle && <p className="hero2-desc line-clamp-2">{subtitle}</p>}
                {p && (
                  <div className="hero2-price">
                    <span className="hero2-cur">AED</span>
                    <span className="hero2-amt">{fmtAED(priceOf(p))}</span>
                    {p.salePrice > 0 && p.salePrice < p.price && <span className="hero2-was">AED {fmtAED(p.price)}</span>}
                  </div>
                )}
                <div className="hero2-ctas">
                  {p && p.stock > 0 && (
                    <button type="button" className="btn btn-primary btn-lg" onClick={() => { addItem(p, 1); openCart(); }}>
                      <FiShoppingCart aria-hidden="true" /> Add to cart
                    </button>
                  )}
                  {href && (
                    <SmartLink to={href} className={`btn ${p ? 'btn-secondary' : 'btn-primary'} btn-lg`}>
                      {b.ctaLabel || (p ? 'View details' : 'Shop now')} <FiArrowRight aria-hidden="true" />
                    </SmartLink>
                  )}
                </div>
              </div>
              {image && (
                <SmartLink to={href} className={`hero2-visual ${b.kind === 'custom' ? 'custom' : ''}`} tabIndex={-1} aria-hidden="true">
                  <div className="hero2-blob" />
                  <img src={image} alt="" className="hero2-img" fetchpriority="high" />
                </SmartLink>
              )}
            </motion.div>
          </AnimatePresence>

          {n > 1 && (
            <div className="hero2-controls">
              <button type="button" className="hero2-btn" onClick={() => go(-1)} aria-label="Previous slide"><FiChevronLeft /></button>
              <div className="hero2-dots" role="tablist" aria-label="Choose slide">
                {slides.map((s, k) => (
                  <button key={s._id} type="button" role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}`} className={`hero2-dot ${k === i ? 'active' : ''}`} onClick={() => setI(k)} />
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
      )}

      {side.length > 0 && (
        <div className="hero2-side">
          {side.map((t) => (
            <SmartLink key={t._id} to={t.ctaLink || (t.product ? `/products/${t.product._id}` : '/products')} className={`promo-tile theme-${t.theme || 'blue'}`}
              style={t.image ? { backgroundImage: `linear-gradient(140deg, rgba(0,0,0,.55), rgba(0,0,0,.15)), url(${t.image})` } : undefined}>
              {t.kicker && <span className="promo-kicker"><Icon name="tag" /> {t.kicker}</span>}
              <strong>{t.title || t.product?.name}</strong>
              {t.subtitle && <span className="promo-sub">{t.subtitle}</span>}
              <span className="promo-link">{t.ctaLabel || 'Shop now'} <FiArrowRight aria-hidden="true" /></span>
            </SmartLink>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHead({ eyebrow, title, to, icon }) {
  if (!title && !eyebrow) return null;
  return (
    <div className="sec-head">
      <div>
        {eyebrow && <div className="sec-eyebrow">{icon && <Icon name={icon} />} {eyebrow}</div>}
        {title && <h2 className="sec-title">{title}</h2>}
      </div>
      {to && <SmartLink to={to} className="sec-link">See all <FiArrowRight aria-hidden="true" /></SmartLink>}
    </div>
  );
}

const GridSkeleton = ({ count = 5 }) => (
  <div className="home-grid" aria-hidden="true">{[...Array(count)].map((_, k) => <div key={k} className="skeleton card-skeleton" />)}</div>
);

function PriceTabs({ section }) {
  const tabs = (section.priceTabs?.length ? section.priceTabs : [20, 35, 60]);
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState(null);
  useEffect(() => {
    setItems(null);
    api.get(`/storefront/section/${section._id}/products`, { params: { maxPrice: tabs[tab] } })
      .then(({ data }) => setItems(data.products)).catch(() => setItems([]));
  }, [tab, section._id]);
  return (
    <section className="price-band">
      <div className="container home-sec">
        <SectionHead eyebrow={section.eyebrow} icon={section.icon} title={section.title} />
        <div className="price-tabs" role="tablist" aria-label="Price range">
          {tabs.map((max, k) => (
            <button key={max} type="button" role="tab" aria-selected={k === tab} className={`price-tab ${k === tab ? 'active' : ''}`} onClick={() => setTab(k)}>Under AED {max}</button>
          ))}
          <Link to={`/products?price[lte]=${tabs[tab]}&sort=price`} className="sec-link price-all">See all <FiArrowRight aria-hidden="true" /></Link>
        </div>
        {items === null ? <GridSkeleton /> : items.length ? <ProductRail products={items} label={`Under AED ${tabs[tab]}`} /> : <p className="muted">No products in this price range yet.</p>}
      </div>
    </section>
  );
}

function Section({ s, categories, whatsapp, brandName }) {
  switch (s.type) {
    case 'trust':
      return (
        <section className="trust2" aria-label="Why shop with us">
          <div className="container trust2-grid">
            {(s.items || []).map((it, k) => (
              <div className="trust2-item" key={k}>
                <span className="trust2-icon"><Icon name={it.icon} /></span>
                <div><strong>{it.title}</strong><span>{it.text}</span></div>
              </div>
            ))}
          </div>
        </section>
      );
    case 'categories':
      if (!categories.length) return null;
      return (
        <section className="container home-sec">
          <SectionHead eyebrow={s.eyebrow} icon={s.icon} title={s.title || 'Shop by category'} />
          <div className="cat-rail">
            {categories.map((c) => (
              <Link key={c.name} to={categoryHref(c.name)} className={`cat-chip ${c.image ? 'has-img' : ''}`}>
                {c.image
                  ? <span className="cat-chip-img"><img src={c.image} alt="" loading="lazy" /></span>
                  : <span className="cat-chip-icon"><CategoryIcon name={c.name} icon={c.icon} /></span>}
                <span className="cat-chip-name">{c.name}</span>
                <span className="cat-chip-count">{c.count} items</span>
              </Link>
            ))}
          </div>
        </section>
      );
    case 'products':
      if (!s.products?.length) return null;
      return (
        <section className="container home-sec">
          <SectionHead eyebrow={s.eyebrow} icon={s.icon} title={s.title} to={s.link} />
          {s.layout === 'grid'
            ? <div className="home-grid">{s.products.map((p, k) => <ProductCard key={p._id} product={p} index={k} />)}</div>
            : <ProductRail products={s.products} label={s.title || 'Products'} />}
        </section>
      );
    case 'priceTabs':
      return <PriceTabs section={s} />;
    case 'recent': {
      const recent = recentlyViewed.get();
      if (recent.length < 3) return null;
      return (
        <section className="container home-sec">
          <SectionHead eyebrow={s.eyebrow} icon={s.icon} title={s.title || 'Recently viewed'} />
          <ProductRail products={recent} label="Recently viewed" />
        </section>
      );
    }
    case 'promise':
      return (
        <section className="container home-sec">
          <div className="promise">
            <div className="promise-copy">
              {s.title && <h2 className="sec-title">{s.title}</h2>}
              <ul className="promise-list">
                {(s.items || []).map((it, k) => (
                  <li key={k}><Icon name={it.icon} /><div><strong>{it.title}</strong><span>{it.text}</span></div></li>
                ))}
              </ul>
            </div>
            {whatsapp && (
              <div className="promise-cta">
                <FiMessageCircle className="promise-cta-icon" aria-hidden="true" />
                <h3>Questions before you buy?</h3>
                <p>Message our team on WhatsApp for product details, bulk orders or delivery questions.</p>
                <a className="btn btn-lg promise-wa" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi ${brandName}! I have a question about a product.`)}`} target="_blank" rel="noopener noreferrer">
                  <FiMessageCircle aria-hidden="true" /> Chat on WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>
      );
    default:
      return null;
  }
}

export default function Home() {
  const { settings, banners, sections, categories, loaded, load } = useSiteStore();
  const whatsapp = useWhatsApp();

  // Always refresh on visit so dashboard changes appear immediately
  useEffect(() => { load(true); }, [load]);

  const hero = banners?.hero || [];
  const side = banners?.side || [];

  return (
    <>
      <Helmet>
        <title>{settings.seo?.title || settings.brand.name}</title>
        {settings.seo?.description && <meta name="description" content={settings.seo.description} />}
      </Helmet>

      <div className="home2">
        <div className="container">
          {!loaded && !hero.length ? <div className="hero-skeleton skeleton" aria-hidden="true" /> : <HeroSlider slides={hero} side={side} />}
        </div>

        {!loaded && !sections.length && <div className="container home-sec"><GridSkeleton /></div>}

        {sections.map((s, k) => (
          <React.Fragment key={s._id || k}>
            <Section s={s} categories={categories} whatsapp={whatsapp} brandName={settings.brand.name} />
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
