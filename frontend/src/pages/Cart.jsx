// Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiPlus, FiMinus, FiTruck } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store/index.js';
// import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, shipping, tax, total, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state">
        <FiShoppingBag />
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any gadgets yet</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>Shopping Cart — PrimeGadgets</title></Helmet>
      <div className="cart-page page">
        <div className="container">
          <div className="cart-header">
            <h1 className="heading">Shopping Cart</h1>
            <span className="cart-count-badge">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            <button className="clear-cart-link" onClick={clearCart}>Clear all</button>
          </div>
          <div className="cart-grid">
            <div className="cart-items">
              <AnimatePresence initial={false}>
                {items.map(item => {
                  const totalPrice = item.price * item.qty;
                  return (
                    <motion.div key={item.key} className="cart-item" layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}>
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <Link to={`/products/${item._id}`} className="cart-item-name">{item.name}</Link>
                        <p className="cart-item-brand">{item.brand} · {item.category}</p>
                        <p className="cart-item-unit-price">AED {item.price.toLocaleString()} each</p>
                      </div>
                      <div className="cart-item-right">
                        <div className="cart-qty-ctrl">
                          <button onClick={() => updateQty(item.key, item.qty-1)} disabled={item.qty<=1}><FiMinus size={13} /></button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.key, item.qty+1)} disabled={item.qty>=item.stock}><FiPlus size={13} /></button>
                        </div>
                        <span className="cart-item-total">AED {totalPrice.toLocaleString()}</span>
                        <button className="cart-remove" onClick={() => removeItem(item.key)}><FiTrash2 size={15} /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <div className="cart-summary-card">
              <h3>Order Summary</h3>
              <div className="cs-rows">
                <div className="cs-row"><span>Subtotal</span><span>AED {subtotal.toLocaleString()}</span></div>
                <div className="cs-row"><span>Shipping</span><span className={shipping === 0 ? 'free-green' : ''}>{shipping === 0 ? 'FREE' : `AED ${shipping}`}</span></div>
                {shipping > 0 && <p className="free-ship-hint"><FiTruck size={12} /> Add AED {(200 - subtotal).toFixed(0)} more for free shipping</p>}
                <div className="cs-row"><span>VAT (5%)</span><span>AED {tax.toFixed(2)}</span></div>
              </div>
              <div className="cs-total"><span>Total</span><strong>AED {total.toFixed(2)}</strong></div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => token ? navigate('/checkout') : navigate('/login?redirect=checkout')}>
                Checkout <FiArrowRight />
              </button>
              <Link to="/products" className="btn btn-secondary btn-full" style={{ marginTop: 8, justifyContent: 'center' }}>Continue Shopping</Link>
              <div className="cs-trust">🔒 Secure checkout · 30-day returns</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
