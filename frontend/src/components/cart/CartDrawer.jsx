import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiShoppingBag, FiArrowRight, FiPlus, FiMinus, FiTruck, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useCartStore, useCartTotals, fmtAED, FREE_SHIPPING_MIN } from '../../store/index.js';
import { useCartDrawerStore } from '../ui/uiStore.js';
import { SafeImage } from '../product/ProductCard.jsx';
import './CartDrawer.css';

export function FreeShippingMeter({ subtotal, toFreeShipping }) {
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);
  return (
    <div className="ship-meter">
      <p>
        {toFreeShipping > 0
          ? <><FiTruck aria-hidden="true" /> Add <strong>AED {fmtAED(toFreeShipping)}</strong> more for <strong>free delivery</strong></>
          : <><FiCheckCircle aria-hidden="true" /> You've unlocked <strong>free delivery</strong></>}
      </p>
      <div className="ship-meter-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress to free delivery">
        <span style={{ width: `${pct}%` }} className={toFreeShipping === 0 ? 'done' : ''} />
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { isOpen, close } = useCartDrawerStore();
  const { items, removeItem, updateQty } = useCartStore();
  const { count, subtotal, shipping, tax, total, toFreeShipping } = useCartTotals();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, close]);

  const go = (path) => { close(); navigate(path); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            className="cart-drawer"
            role="dialog" aria-modal="true" aria-label="Shopping cart"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 320 }}
          >
            <header className="cd-head">
              <div>
                <h2 className="cd-title">Your cart</h2>
                <p className="cd-sub">{count} {count === 1 ? 'item' : 'items'}</p>
              </div>
              <button className="cd-close" onClick={close} aria-label="Close cart"><FiX /></button>
            </header>

            {items.length === 0 ? (
              <div className="cd-empty">
                <span className="cd-empty-icon"><FiShoppingBag aria-hidden="true" /></span>
                <h3>Your cart is empty</h3>
                <p>Browse our top picks and add something you love.</p>
                <button className="btn btn-primary" onClick={() => go('/products')}>Start shopping <FiArrowRight /></button>
              </div>
            ) : (
              <>
                <div className="cd-meter"><FreeShippingMeter subtotal={subtotal} toFreeShipping={toFreeShipping} /></div>
                <ul className="cd-items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key} className="cd-item" layout
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                      >
                        <Link to={`/products/${item._id}`} className="cd-img" onClick={close}>
                          <SafeImage src={item.image} alt={item.name} className="cd-img-el" />
                        </Link>
                        <div className="cd-info">
                          <Link to={`/products/${item._id}`} className="cd-name" onClick={close}>{item.name}</Link>
                          <div className="cd-unit">AED {fmtAED(item.price)} each</div>
                          <div className="cd-row">
                            <div className="qty" role="group" aria-label={`Quantity for ${item.name}`}>
                              <button onClick={() => updateQty(item.key, item.qty - 1)} aria-label="Decrease quantity">
                                {item.qty === 1 ? <FiTrash2 /> : <FiMinus />}
                              </button>
                              <span aria-live="polite">{item.qty}</span>
                              <button onClick={() => updateQty(item.key, item.qty + 1)} disabled={item.qty >= (item.stock || 99)} aria-label="Increase quantity"><FiPlus /></button>
                            </div>
                            <strong className="cd-line">AED {fmtAED(item.price * item.qty)}</strong>
                          </div>
                        </div>
                        <button className="cd-remove" onClick={() => removeItem(item.key)} aria-label={`Remove ${item.name}`}><FiX /></button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="cd-foot">
                  <dl className="cd-sum">
                    <div><dt>Subtotal</dt><dd>AED {fmtAED(subtotal)}</dd></div>
                    <div><dt>Delivery</dt><dd className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Free' : `AED ${fmtAED(shipping)}`}</dd></div>
                    <div><dt>VAT (5%)</dt><dd>AED {fmtAED(tax)}</dd></div>
                    <div className="cd-total"><dt>Total</dt><dd>AED {fmtAED(total)}</dd></div>
                  </dl>
                  <button className="btn btn-primary btn-full btn-lg cd-checkout" onClick={() => go('/checkout')}>
                    <FiLock aria-hidden="true" /> Checkout · AED {fmtAED(total)}
                  </button>
                  <p className="cd-note">No account needed · Cash on delivery or card</p>
                  <button className="cd-continue" onClick={close}>Continue shopping</button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
