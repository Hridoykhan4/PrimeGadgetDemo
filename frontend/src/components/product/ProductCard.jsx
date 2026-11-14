import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTruck, FiStar, FiImage, FiCheck } from 'react-icons/fi';
import { useAuthStore, useCartStore } from '../../store/index.js';
import { useCartDrawerStore } from '../ui/uiStore.js';
import toast from 'react-hot-toast';
import './ProductCard.css';

const fmtAED = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtSold = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+` : `${n}`);

function SafeImage({ src, alt, className }) {
  const [failed, setFailed] = useState(!src || !/^https?:/.test(src));
  if (failed) {
    return (
      <div className={`${className} pc-image-fallback`} role="img" aria-label={alt}>
        <FiImage aria-hidden="true" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

export default function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, isWishlisted } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartDrawerStore((s) => s.open);
  const [added, setAdded] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const onSale = product.salePrice > 0 && product.salePrice < product.price;
  const price = onSale ? product.salePrice : product.price;
  const discount = onSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const outOfStock = product.stock <= 0;
  const sold = product.totalSold || 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    toast.success('Added to cart');
    setTimeout(() => setAdded(false), 1400);
    openCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="pc-motion"
    >
      <Link to={`/products/${product._id}`} className="product-card" aria-label={product.name}>
        <div className="pc-media">
          <SafeImage src={product.images?.[0]?.url} alt={product.name} className="pc-image" />

          <div className="pc-badges">
            {discount > 0 && <span className="pc-badge pc-badge-sale">-{discount}%</span>}
            {product.isBestSeller && <span className="pc-badge pc-badge-hot">Best seller</span>}
            {!product.isBestSeller && product.isNew && <span className="pc-badge pc-badge-new">New</span>}
          </div>

          <button
            type="button"
            className={`pc-wish ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
          >
            <FiHeart aria-hidden="true" />
          </button>

          {outOfStock && <div className="pc-soldout">Sold out</div>}
        </div>

        <div className="pc-body">
          <h3 className="pc-name">{product.name}</h3>

          <div className="pc-price-row">
            <div className="pc-price">
              <span className="pc-currency">AED</span>
              <span className="pc-amount">{fmtAED(price)}</span>
              {onSale && <span className="pc-was">AED {fmtAED(product.price)}</span>}
            </div>
            <button
              type="button"
              className={`pc-add ${added ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={outOfStock}
              aria-label={outOfStock ? 'Sold out' : `Add ${product.name} to cart`}
            >
              {added ? <FiCheck aria-hidden="true" /> : <FiShoppingCart aria-hidden="true" />}
            </button>
          </div>

          <div className="pc-meta">
            {product.numReviews > 0 && (
              <span className="pc-rating">
                <FiStar aria-hidden="true" className="pc-star" /> {product.ratings?.toFixed(1)}
                <span className="pc-muted">({product.numReviews})</span>
              </span>
            )}
            {sold > 0 && <span className="pc-sold">{fmtSold(sold)} sold</span>}
          </div>

          <div className="pc-delivery">
            <span className="pc-local">Local</span>
            <FiTruck aria-hidden="true" /> 1-day delivery
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
