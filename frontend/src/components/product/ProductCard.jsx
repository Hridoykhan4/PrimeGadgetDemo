import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTruck, FiStar, FiImage, FiCheck } from 'react-icons/fi';
import { useCartStore, useWishlistStore, fmtAED } from '../../store/index.js';
import { useCartDrawerStore } from '../ui/uiStore.js';
import './ProductCard.css';

export function SafeImage({ src, alt, className, eager = false }) {
  const [failed, setFailed] = useState(!src || !/^https?:/.test(src));
  if (failed) {
    return (
      <div className={`${className} pc-image-fallback`} role="img" aria-label={alt}>
        <FiImage aria-hidden="true" />
      </div>
    );
  }
  return (
    <img
      src={src} alt={alt} className={className}
      loading={eager ? 'eager' : 'lazy'} decoding="async" draggable="false"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductCard({ product, index = 0 }) {
  const addItem = useCartStore((s) => s.addItem);
  const inCartQty = useCartStore((s) => s.items.find((i) => i._id === product._id)?.qty || 0);
  const openCart = useCartDrawerStore((s) => s.open);
  const wishlisted = useWishlistStore((s) => s.items.some((i) => i._id === product._id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const [added, setAdded] = useState(false);

  const onSale = product.salePrice > 0 && product.salePrice < product.price;
  const price = onSale ? product.salePrice : product.price;
  const discount = onSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(product);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    openCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.32, delay: Math.min(index, 6) * 0.035, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="pc-motion"
    >
      <Link to={`/products/${product._id}`} className="product-card" draggable="false">
        <div className="pc-media">
          <SafeImage src={product.images?.[0]?.url} alt={product.name} className="pc-image" />

          <div className="pc-badges">
            {discount > 0 && <span className="pc-badge pc-badge-sale">-{discount}%</span>}
            {product.isBestSeller && <span className="pc-badge pc-badge-hot">Top pick</span>}
            {!product.isBestSeller && product.isNew && <span className="pc-badge pc-badge-new">New</span>}
          </div>

          <button
            type="button"
            className={`pc-wish ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={wishlisted}
          >
            <FiHeart aria-hidden="true" />
          </button>

          {outOfStock && <div className="pc-soldout">Sold out</div>}
          {inCartQty > 0 && !outOfStock && <div className="pc-incart"><FiCheck aria-hidden="true" /> {inCartQty} in cart</div>}
        </div>

        <div className="pc-body">
          <h3 className="pc-name">{product.name}</h3>

          {product.numReviews > 0 ? (
            <div className="pc-meta">
              <span className="pc-stars" aria-label={`Rated ${product.ratings} out of 5`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} aria-hidden="true" className={s <= Math.round(product.ratings) ? 'on' : ''} />
                ))}
              </span>
              <span className="pc-muted">({product.numReviews})</span>
            </div>
          ) : lowStock ? (
            <div className="pc-meta pc-low">Only {product.stock} left</div>
          ) : null}

          <div className="pc-price-row">
            <div className="pc-price">
              <span className="pc-currency">AED</span>
              <span className="pc-amount">{fmtAED(price)}</span>
              {onSale && <span className="pc-was">{fmtAED(product.price)}</span>}
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

          <div className="pc-delivery">
            <FiTruck aria-hidden="true" /> Fast UAE delivery
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
