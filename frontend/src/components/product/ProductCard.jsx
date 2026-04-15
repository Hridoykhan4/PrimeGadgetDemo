import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiEye, FiZap, FiMessageCircle } from 'react-icons/fi';
import { useAuthStore } from '../../store/index.js';
import './ProductCard.css';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '971581234567';
const WHATSAPP_MESSAGE = import.meta.env.VITE_WHATSAPP_MESSAGE || 'Hi PrimeGadgets! I\'m interested in your products.';

export default function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, isWishlisted } = useAuthStore();
  const wishlisted = isWishlisted(product._id);
  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const discount = product.discountPercent || 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const message = `${WHATSAPP_MESSAGE} Product: ${product.name}`;
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={`/products/${product._id}`} className="product-card">
        {/* ── IMAGE SECTION ── */}
        <div className="pc-image-wrap">
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="pc-image"
            loading="lazy"
          />
          {product.images?.[1] && (
            <img
              src={product.images[1].url}
              alt={product.name}
              className="pc-image pc-image-hover"
              loading="lazy"
            />
          )}

          {/* Gradient Overlay */}
          <div className="pc-overlay" />

          {/* Top Badges - Left */}
          <div className="pc-badges">
            {product.isBestSeller && <span className="pc-badge-hot">HOT</span>}
            {discount > 0 && <span className="pc-badge-sale">-{discount}%</span>}
            {product.isNew && <span className="pc-badge-new">NEW</span>}
          </div>

          {/* Wishlist Button - Top Right */}
          <motion.button
            className={`pc-wishlist-btn ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            whileTap={{ scale: 0.85 }}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart />
          </motion.button>

          {/* Low Stock Warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="pc-stock-warn">
              <FiZap size={11} />
              <span>Only {product.stock} left</span>
            </div>
          )}

          {/* Bottom Actions - Over Image */}
          <div className="pc-image-actions">
            <motion.a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE + ' Product: ' + product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pc-whatsapp-cta"
              onClick={(e) => e.stopPropagation()}
              whileTap={{ scale: 0.97 }}
            >
              <FiMessageCircle size={16} />
              <span>Buy on WhatsApp</span>
            </motion.a>
            <Link
              to={`/products/${product._id}`}
              className="pc-quick-view"
              title="Quick view"
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye size={18} />
            </Link>
          </div>
        </div>

        {/* ── CONTENT SECTION ── */}
        <div className="pc-body">
          {/* Brand */}
          <div className="pc-brand">{product.brand}</div>

          {/* Product Name */}
          <h3 className="pc-name">{product.name}</h3>

          {/* Rating */}
          <div className="pc-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={s <= Math.round(product.ratings) ? '#f5a623' : 'none'}
                  stroke={s <= Math.round(product.ratings) ? '#f5a623' : '#e0e0e0'}
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="pc-rating-value">{product.ratings?.toFixed(1) || '0.0'}</span>
            <span className="pc-reviews">({product.numReviews})</span>
          </div>

          {/* Price */}
          <div className="pc-pricing">
            <span className="pc-current-price">
              AED {price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            {product.salePrice > 0 && (
              <span className="pc-was-price">
                AED {product.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            )}
          </div>

          {/* View Details Button */}
          <div className="pc-cta-wrap">
            <span className="pc-view-details">View Details</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
