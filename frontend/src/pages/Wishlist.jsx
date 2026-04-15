// Wishlist.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHeart } from 'react-icons/fi';
import { useAuthStore } from '../store/index.js';
import ProductCard from '../components/product/ProductCard.jsx';

export default function Wishlist() {
  const { user } = useAuthStore();
  const wishlist = user?.wishlist || [];
  return (
    <>
      <Helmet><title>Wishlist — PrimeGadgets</title></Helmet>
      <div className="page">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <h1 className="display-md">Wishlist</h1>
            <span style={{ background: 'var(--surface-2)', color: 'var(--text-3)', padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: '.875rem', fontWeight: 600 }}>{wishlist.length} items</span>
          </div>
          {wishlist.length === 0 ? (
            <div className="empty-state">
              <FiHeart />
              <h3>Your wishlist is empty</h3>
              <p>Save your favourite products here</p>
              <Link to="/products" className="btn btn-primary">Discover Products</Link>
            </div>
          ) : (
            <div className="grid-4">
              {wishlist.map(p => <ProductCard key={p._id || p} product={typeof p === 'object' ? p : { _id: p }} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
