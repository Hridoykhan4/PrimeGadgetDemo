import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiShoppingBag, FiArrowRight, FiPlus, FiMinus } from 'react-icons/fi';
import { useCartStore } from '../../store/index.js';
import { useCartDrawerStore } from '../ui/uiStore.js';
import './CartDrawer.css';

export default function CartDrawer() {
  const { isOpen, close } = useCartDrawerStore();
  const { items, removeItem, updateQty, subtotal, shipping, tax, total } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => { close(); navigate('/checkout'); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
          >
            {/* Header */}
            <div className="drawer-header">
              <div>
                <h3 className="drawer-title">Shopping Cart</h3>
                <p className="drawer-count">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
              </div>
              <button className="drawer-close" onClick={close}><FiX /></button>
            </div>

            {/* Items */}
            <div className="drawer-body">
              {items.length === 0 ? (
                <div className="drawer-empty">
                  <FiShoppingBag className="empty-bag-icon" />
                  <h4>Your cart is empty</h4>
                  <p>Add some amazing gadgets</p>
                  <button className="btn btn-primary btn-sm" onClick={() => { close(); navigate('/products'); }}>
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="drawer-items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.key}
                        className="drawer-item"
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div className="drawer-item-img">
                          <img src={item.image} alt={item.name} loading="lazy" />
                        </div>
                        <div className="drawer-item-info">
                          <h5 className="drawer-item-name line-clamp-2">{item.name}</h5>
                          {item.variant && <p className="drawer-item-variant">{item.variant.name}: {item.variant.label}</p>}
                          <div className="drawer-item-bottom">
                            <div className="drawer-qty-ctrl">
                              <button onClick={() => updateQty(item.key, item.qty - 1)} disabled={item.qty <= 1}><FiMinus size={12} /></button>
                              <span>{item.qty}</span>
                              <button onClick={() => updateQty(item.key, item.qty + 1)} disabled={item.qty >= item.stock}><FiPlus size={12} /></button>
                            </div>
                            <span className="drawer-item-price">AED {(item.price * item.qty).toLocaleString()}</span>
                          </div>
                        </div>
                        <button className="drawer-remove" onClick={() => removeItem(item.key)}><FiTrash2 size={15} /></button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="drawer-footer">
                <div className="drawer-summary">
                  <div className="summary-row"><span>Subtotal</span><span>AED {subtotal.toLocaleString()}</span></div>
                  <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free-tag' : ''}>{shipping === 0 ? 'FREE' : `AED ${shipping}`}</span></div>
                  <div className="summary-row"><span>VAT (5%)</span><span>AED {tax.toFixed(2)}</span></div>
                </div>
                <div className="drawer-total">
                  <span>Total</span>
                  <strong>AED {total.toFixed(2)}</strong>
                </div>
                {shipping > 0 && (
                  <p className="free-ship-note">
                    Add AED {(200 - subtotal).toFixed(0)} more for free shipping
                  </p>
                )}
                <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout}>
                  Checkout <FiArrowRight />
                </button>
                <Link to="/cart" className="btn btn-secondary btn-full" onClick={close} style={{ marginTop: 8, justifyContent: 'center' }}>
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
