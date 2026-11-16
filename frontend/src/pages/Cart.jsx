import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiShoppingBag, FiPlus, FiMinus, FiTrash2, FiLock, FiHeart, FiTruck, FiShield } from 'react-icons/fi';
import { useCartStore, useCartTotals, useWishlistStore, fmtAED } from '../store/index.js';
import { FreeShippingMeter } from '../components/cart/CartDrawer.jsx';
import { SafeImage } from '../components/product/ProductCard.jsx';
import ProductRail from '../components/product/ProductRail.jsx';
import api from '../utils/api.js';
import './Shop.css';

export default function Cart() {
  const { items, removeItem, updateQty } = useCartStore();
  const { count, subtotal, shipping, tax, total, toFreeShipping, freeShippingMin, vatRate } = useCartTotals();
  const toggleWish = useWishlistStore((s) => s.toggle);
  const navigate = useNavigate();
  const [suggest, setSuggest] = useState([]);

  useEffect(() => {
    const max = toFreeShipping > 0 ? Math.max(10, Math.ceil(toFreeShipping) + 10) : 60;
    api.get('/products', { params: { 'price[lte]': max, sort: '-isBestSeller,-createdAt', limit: 14 } })
      .then(({ data }) => setSuggest(data.products.filter((p) => !items.some((i) => i._id === p._id))))
      .catch(() => {});
  }, [items.length]);

  const saveForLater = (item) => {
    toggleWish({ _id: item._id, name: item.name, price: item.originalPrice || item.price, salePrice: item.price < item.originalPrice ? item.price : 0, stock: item.stock, images: [{ url: item.image }], category: item.category });
    removeItem(item.key);
  };

  return (
    <>
      <Helmet><title>Your cart — PrimeGadgets</title></Helmet>
      <div className="shop-page">
        <div className="container">
          <div className="shop-head">
            <div>
              <h1 className="shop-title">Your cart</h1>
              <p className="shop-sub">{count} {count === 1 ? 'item' : 'items'}</p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="shop-empty">
              <span className="shop-empty-icon"><FiShoppingBag /></span>
              <h2>Your cart is empty</h2>
              <p>Find something you love — delivery is free over AED 200.</p>
              <Link to="/products" className="btn btn-primary">Start shopping</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-list">
                <div className="cart-meter"><FreeShippingMeter subtotal={subtotal} toFreeShipping={toFreeShipping} freeShippingMin={freeShippingMin} /></div>
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div key={item.key} className="cart-row" layout exit={{ opacity: 0, x: -30, transition: { duration: 0.18 } }}>
                      <Link to={`/products/${item._id}`} className="cart-img"><SafeImage src={item.image} alt={item.name} className="cart-img-el" /></Link>
                      <div className="cart-info">
                        <Link to={`/products/${item._id}`} className="cart-name">{item.name}</Link>
                        <span className="cart-unit">AED {fmtAED(item.price)} each{item.stock <= 5 ? <em> · Only {item.stock} left</em> : null}</span>
                        <div className="cart-actions">
                          <div className="qty" role="group" aria-label={`Quantity for ${item.name}`}>
                            <button onClick={() => updateQty(item.key, item.qty - 1)} aria-label="Decrease quantity">{item.qty === 1 ? <FiTrash2 /> : <FiMinus />}</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item.key, item.qty + 1)} disabled={item.qty >= (item.stock || 99)} aria-label="Increase quantity"><FiPlus /></button>
                          </div>
                          <button className="cart-text-btn" onClick={() => saveForLater(item)}><FiHeart /> Save for later</button>
                          <button className="cart-text-btn danger" onClick={() => removeItem(item.key)}><FiTrash2 /> Remove</button>
                        </div>
                      </div>
                      <strong className="cart-line">AED {fmtAED(item.price * item.qty)}</strong>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <aside className="cart-side">
                <div className="cart-sum-card">
                  <h2>Order summary</h2>
                  <dl className="co-sum">
                    <div><dt>Subtotal</dt><dd>AED {fmtAED(subtotal)}</dd></div>
                    <div><dt>Delivery</dt><dd className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Free' : `AED ${fmtAED(shipping)}`}</dd></div>
                    <div><dt>VAT ({vatRate}%)</dt><dd>AED {fmtAED(tax)}</dd></div>
                    <div className="co-total"><dt>Total</dt><dd>AED {fmtAED(total)}</dd></div>
                  </dl>
                  <button className="btn btn-primary btn-full btn-lg cart-go" onClick={() => navigate('/checkout')}><FiLock /> Checkout securely</button>
                  <p className="cart-note">No account needed · Cash on delivery or card</p>
                  <ul className="co-trust">
                    <li><FiTruck /> Delivered from UAE stock</li>
                    <li><FiShield /> Card payments processed by Stripe</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}

          {suggest.length > 0 && (
            <section className="cart-suggest">
              <h2 className="shop-title small">{toFreeShipping > 0 && items.length ? `Add AED ${fmtAED(toFreeShipping)} for free delivery` : 'You may also like'}</h2>
              <ProductRail products={suggest} label="Suggested products" />
            </section>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="co-sticky cart-sticky">
          <div><small>Total</small><strong>AED {fmtAED(total)}</strong></div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/checkout')}><FiLock /> Checkout</button>
        </div>
      )}
    </>
  );
}
