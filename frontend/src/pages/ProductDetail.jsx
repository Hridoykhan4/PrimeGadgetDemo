import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiHeart, FiStar, FiShield, FiTruck,
  FiRefreshCw, FiShare2, FiChevronRight, FiMinus, FiPlus,
  FiCheck, FiZap, FiMessageSquare, FiMessageCircle, FiShoppingCart, FiCreditCard
} from 'react-icons/fi';
import api from '../utils/api.js';
import { useCartStore, useWishlistStore, fmtAED } from '../store/index.js';
import { recentlyViewed } from '../store/catalog.js';
import { useWhatsApp } from '../store/site.js';
import ProductReviews from '../components/product/ProductReviews.jsx';
import ProductRail from '../components/product/ProductRail.jsx';
import { useCartDrawerStore } from '../components/ui/uiStore.js';
import ProductCard from '../components/product/ProductCard.jsx';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const WHATSAPP_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi PrimeGadgets! I\'m interested in this product.';

export default function ProductDetail() {
  const { id } = useParams();
  const WHATSAPP_NUMBER = useWhatsApp();
  const navigate = useNavigate();
  const toggleWish = useWishlistStore((st) => st.toggle);
  const wishlistedIds = useWishlistStore((st) => st.items);
  const addItem = useCartStore((st) => st.addItem);
  const openCart = useCartDrawerStore((st) => st.open);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    Promise.all([api.get(`/products/${id}`), api.get(`/products/${id}/related`)])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data.product);
        recentlyViewed.push(pRes.data.product);
        setRelated(rRes.data.products);
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const refreshProduct = () => api.get(`/products/${id}`).then(({ data }) => setProduct(data.product)).catch(() => {});

  const handleWhatsAppBuy = () => {
    const message = `${WHATSAPP_MESSAGE} Product: ${product.name} (AED ${product.salePrice > 0 ? product.salePrice : product.price})`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`, '_blank');
  };

  const handleSendInquiry = () => {
    navigate(`/contact?product=${encodeURIComponent(product.name)}&id=${product._id}`);
  };

  if (loading) return <div className="loading-screen" style={{ paddingTop: 100 }}><div className="spinner" /></div>;
  if (!product) return null;

  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const wishlisted = wishlistedIds.some((w) => w._id === product._id);
  const saved = product.salePrice > 0 ? product.price - product.salePrice : 0;
  const discount = product.discountPercent || 0;

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || `${product.name} — PrimeGadgets Dubai`}</title>
        <meta name="description" content={product.metaDescription || product.shortDescription} />
      </Helmet>
      <div className="pd-page page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="pd-breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight size={12} />
            <Link to="/products">Shop</Link>
            <FiChevronRight size={12} />
            <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <FiChevronRight size={12} />
            <span>{product.name}</span>
          </nav>

          {/* Main Grid */}
          <div className="pd-grid">
            {/* Images */}
            <div className="pd-images">
              <div className="pd-main-img-wrap">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={product.images[activeImg]?.url}
                    alt={product.name}
                    className="pd-main-img"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

                {/* Wishlist Button - Image Overlay */}
                <motion.button
                  className={`pd-wishlist-btn ${wishlisted ? 'active' : ''}`}
                  onClick={() => toggleWish(product)}
                  whileTap={{ scale: 0.85 }}
                  title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <FiHeart />
                </motion.button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="pd-thumbs">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={img.url} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              {/* Badges Row */}
              <div className="pd-badges-row">
                {product.isBestSeller && <span className="pd-badge-hot">Top pick</span>}
                {discount > 0 && <span className="pd-badge-sale">SAVE {discount}%</span>}
                <span className={`pd-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  <span className="pd-stock-dot" />
                  {product.stock > 0
                    ? product.stock <= 5
                      ? `Only ${product.stock} left`
                      : 'In stock in the UAE'
                    : 'Out of Stock'}
                </span>
              </div>

              {/* Title */}
              <h1 className="pd-title">{product.name}</h1>

              {/* Rating */}
              <div className="pd-rating-row">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={s <= Math.round(product.ratings) ? '#f5a623' : 'none'}
                      stroke={s <= Math.round(product.ratings) ? '#f5a623' : '#e0e0e0'}
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="pd-rating-value">{product.numReviews ? product.ratings?.toFixed(1) : ''}</span>
                <button className="pd-reviews-link" onClick={() => { setTab('reviews'); document.querySelector('.pd-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  {product.numReviews ? `(${product.numReviews} ${product.numReviews === 1 ? 'review' : 'reviews'})` : 'Be the first to review'}
                </button>
              </div>

              {/* Price Block */}
              <div className="pd-price-card">
                <div className="pd-price-label">Price</div>
                <div className="pd-price-main-row">
                  <span className="pd-price">AED {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {product.salePrice > 0 && (
                    <span className="pd-price-original">
                      AED {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  {saved > 0 && (
                    <span className="pd-savings-inline">Save AED {saved.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {product.shortDescription && <p className="pd-short-desc">{product.shortDescription}</p>}

              {/* Key Features */}
              {product.features?.length > 0 && (
                <div className="pd-features-section">
                  <h3 className="pd-features-title">Key Features</h3>
                  <ul className="pd-features">
                    {product.features.slice(0, 6).map((f, i) => (
                      <li key={i}>
                        <FiCheck size={16} className="feature-check" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="pd-qty-row">
                  <span className="pd-qty-label">Quantity</span>
                  <div className="pd-qty-ctrl">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
                      <FiMinus size={14} />
                    </button>
                    <span>{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Primary purchase CTAs */}
              <div className="pd-buy-group">
                <button
                  type="button"
                  className="btn btn-primary btn-lg pd-buy-btn"
                  disabled={product.stock === 0}
                  onClick={() => { addItem(product, qty); openCart(); }}
                >
                  <FiShoppingCart aria-hidden="true" /> Add to cart
                </button>
                <button
                  type="button"
                  className="btn btn-lg pd-buynow-btn"
                  disabled={product.stock === 0}
                  onClick={() => { addItem(product, qty, null, { silent: true }); navigate('/checkout'); }}
                >
                  <FiCreditCard aria-hidden="true" /> Buy now
                </button>
              </div>
              <p className="pd-pay-note">No account needed · Cash on delivery or card / Apple Pay · Free delivery over AED 200</p>

              {/* CTA Buttons */}
              <div className="pd-cta-group">
                <motion.button
                  className="pd-cta-whatsapp"
                  onClick={handleWhatsAppBuy}
                  whileTap={{ scale: 0.97 }}
                  disabled={product.stock === 0}
                >
                  <FiMessageCircle size={20} />
                  <span>Buy via WhatsApp</span>
                </motion.button>

                <motion.button
                  className="pd-cta-inquiry"
                  onClick={handleSendInquiry}
                  whileTap={{ scale: 0.97 }}
                  disabled={product.stock === 0}
                >
                  <FiMessageSquare size={18} />
                  <span>Send Inquiry</span>
                </motion.button>
              </div>

              {/* WhatsApp Response Time */}
              <div className="pd-whatsapp-note">
                <FiMessageCircle size={14} />
                <span>
                  Questions about this item? Message us on WhatsApp — Arabic &amp; English.
                </span>
              </div>

              {/* Guarantees */}
              <div className="pd-guarantees">
                <div className="guarantee-item">
                  <FiTruck />
                  <span>{product.deliveryInfo || 'Free delivery on orders over AED 200'}</span>
                </div>
                <div className="guarantee-item">
                  <FiShield />
                  <span>Secure checkout · Cash on delivery available</span>
                </div>
                {product.warranty && product.warranty !== '1 Year' && (
                  <div className="guarantee-item"><FiShield /><span>{product.warranty} warranty</span></div>
                )}
                {product.returnPolicy && product.returnPolicy !== '30-day returns' && (
                  <div className="guarantee-item"><FiRefreshCw /><span>{product.returnPolicy}</span></div>
                )}
              </div>

              {/* SKU & Share */}
              <div className="pd-meta-row">
                {product.sku && !/^TEMU/i.test(product.sku) && <span className="pd-sku">SKU: {product.sku}</span>}
                <button
                  className="pd-share-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                >
                  <FiShare2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="pd-tabs">
            <div className="pd-tab-nav">
              {['description', 'specifications', 'reviews'].map((t) => (
                <button key={t} className={`pd-tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'reviews' && product.numReviews > 0 && ` (${product.numReviews})`}
                </button>
              ))}
            </div>
            <div className="pd-tab-content">
              {tab === 'description' && (
                <div className="pd-description">
                  {product.description && <p>{product.description}</p>}
                  {product.features?.length > 0 && (
                    <>
                      <h3>Key Features</h3>
                      <ul>
                        {product.features.map((f, i) => (
                          <li key={i}>
                            <FiCheck className="feature-check" /> {f}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {product.inBox?.length > 0 && (
                    <>
                      <h3>In the Box</h3>
                      <ul>
                        {product.inBox.map((item, i) => (
                          <li key={i}>
                            <FiCheck className="feature-check" /> {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              {tab === 'specifications' && (
                <div className="pd-specs">
                  <table>
                    <tbody>
                      {product.specifications?.map((spec, i) => (
                        <tr key={i}>
                          <td className="spec-key">{spec.key}</td>
                          <td className="spec-val">{spec.value}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="spec-key">Brand</td>
                        <td className="spec-val">{product.brand}</td>
                      </tr>
                      <tr>
                        <td className="spec-key">Warranty</td>
                        <td className="spec-val">{product.warranty}</td>
                      </tr>
                      {product.sku && (
                        <tr>
                          <td className="spec-key">SKU</td>
                          <td className="spec-val">{product.sku}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {tab === 'reviews' && (
                <ProductReviews productId={product._id} onChange={refreshProduct} />
              )}
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="section-header">
                <div>
                  <div className="section-eyebrow">You May Also Like</div>
                  <h2 className="section-title">Related Products</h2>
                </div>
              </div>
              <ProductRail products={related} label="Related products" />
            </div>
          )}
        </div>
      </div>

      {product.stock > 0 && (
        <div className="pd-sticky">
          <div><small>{product.name.slice(0, 40)}</small><strong>AED {fmtAED(price)}</strong></div>
          <button className="btn btn-secondary" onClick={() => { addItem(product, qty); openCart(); }} aria-label="Add to cart"><FiShoppingCart /></button>
          <button className="btn btn-primary" onClick={() => { addItem(product, qty, null, { silent: true }); navigate('/checkout'); }}>Buy now</button>
        </div>
      )}
    </>
  );
}
