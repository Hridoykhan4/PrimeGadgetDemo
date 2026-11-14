import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlistStore, useCartStore, useAuthStore } from '../store/index.js';
import { useCartDrawerStore } from '../components/ui/uiStore.js';
import ProductCard from '../components/product/ProductCard.jsx';
import './Shop.css';

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartDrawerStore((s) => s.open);
  const { token } = useAuthStore();

  const addAll = () => {
    const available = items.filter((p) => p.stock > 0);
    available.forEach((p) => addItem(p, 1, null, { silent: true }));
    if (available.length) openCart();
  };

  return (
    <>
      <Helmet><title>Wishlist — PrimeGadgets</title></Helmet>
      <div className="shop-page">
        <div className="container">
          <div className="shop-head">
            <div>
              <h1 className="shop-title">Wishlist</h1>
              <p className="shop-sub">{items.length} saved {items.length === 1 ? 'item' : 'items'}{!token && items.length > 0 ? ' · saved on this device' : ''}</p>
            </div>
            {items.length > 0 && (
              <div className="shop-head-actions">
                <button className="btn btn-primary" onClick={addAll}><FiShoppingCart /> Add all to cart</button>
                {!token && <Link to="/login?redirect=/wishlist" className="btn btn-secondary">Sign in to sync</Link>}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="shop-empty">
              <span className="shop-empty-icon"><FiHeart /></span>
              <h2>Nothing saved yet</h2>
              <p>Tap the heart on any product to save it here for later.</p>
              <Link to="/products" className="btn btn-primary">Discover products</Link>
            </div>
          ) : (
            <div className="shop-grid">
              {items.map((p, i) => (
                <div key={p._id} className="wish-cell">
                  <ProductCard product={p} index={i} />
                  <button className="wish-remove" onClick={() => remove(p._id)}><FiTrash2 /> Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
