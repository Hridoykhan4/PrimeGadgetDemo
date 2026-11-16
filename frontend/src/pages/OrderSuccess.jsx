import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiPackage, FiHome, FiCreditCard, FiClock, FiMessageCircle, FiCopy } from 'react-icons/fi';
import api from '../utils/api.js';
import { fmtAED } from '../store/index.js';
import { useOrderKey, StatusTracker } from './OrderDetail.jsx';
import { useWhatsApp } from '../store/site.js';
import toast from 'react-hot-toast';
import './OrderPages.css';

export default function OrderSuccess() {
  const { id } = useParams();
  const WHATSAPP_NUMBER = useWhatsApp();
  const key = useOrderKey(id);
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [paid, setPaid] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let tries = 0;
    const load = () => {
      const req = sessionId
        ? api.get(`/payments/verify/${id}`, { params: { session_id: sessionId, key } }).then(({ data }) => { setOrder(data.order); setPaid(data.paid); return data.paid; })
        : api.get(`/orders/${id}`, { params: { key } }).then(({ data }) => { setOrder(data.order); setPaid(data.order.isPaid); return true; });
      req.then((ok) => { if (!ok && sessionId && ++tries < 4) setTimeout(load, 2000); }).catch(() => setPaid(false));
    };
    load();
  }, [id, sessionId, key]);

  const orderLink = `/order/${id}${key ? `?key=${key}` : ''}`;
  const isCard = order?.paymentMethod === 'card';
  const title = isCard ? (paid ? 'Payment successful' : paid === false ? 'Order saved' : 'Confirming payment…') : 'Order placed';
  const waText = order ? encodeURIComponent(`Hi PrimeGadgets, I just placed order ${order.orderNumber} (AED ${fmtAED(order.total)}). Please confirm delivery time.`) : '';

  const copy = () => { navigator.clipboard?.writeText(order.orderNumber).then(() => toast.success('Order number copied')); };

  return (
    <>
      <Helmet><title>Thank you — PrimeGadgets</title></Helmet>
      <div className="op-page">
        <div className="container op-narrow">
          <motion.div className="op-card op-thanks" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <motion.span className={`op-check ${isCard && !paid ? 'wait' : ''}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 380, damping: 18 }}>
              {isCard && !paid ? <FiClock /> : <FiCheck />}
            </motion.span>
            <h1>{title}</h1>
            <p className="op-lead">
              {!order ? 'Loading your order…'
                : isCard && paid ? `Thank you, ${order.shippingAddress?.fullName?.split(' ')[0] || ''}! Your payment was received and your order is confirmed.`
                : isCard ? 'Your order is saved but the card payment is not confirmed yet. You can pay from the order page.'
                : `Thank you, ${order.shippingAddress?.fullName?.split(' ')[0] || ''}! We'll call ${order.shippingAddress?.phone} to confirm delivery. Pay in cash when it arrives.`}
            </p>

            {order && (
              <>
                <button className="op-number" onClick={copy} aria-label="Copy order number">
                  <span>Order number</span><strong>{order.orderNumber}</strong><FiCopy aria-hidden="true" />
                </button>
                <div className="op-mini">
                  <div><span>Total</span><strong>AED {fmtAED(order.total)}</strong></div>
                  <div><span>Payment</span><strong>{isCard ? (paid ? 'Card · Paid' : 'Card · Pending') : 'Cash on delivery'}</strong></div>
                  <div><span>Deliver to</span><strong>{order.shippingAddress?.emirate}</strong></div>
                </div>
                <StatusTracker status={order.status} />
                <p className="op-save-note">Save your order number. You can track this order anytime with it and your mobile number — no account needed.</p>
              </>
            )}

            <div className="op-actions">
              {isCard && paid === false
                ? <Link to={orderLink} className="btn btn-primary btn-lg"><FiCreditCard /> Complete payment</Link>
                : <Link to={orderLink} className="btn btn-primary btn-lg"><FiPackage /> View order</Link>}
              {order && <a className="btn btn-secondary btn-lg" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer"><FiMessageCircle /> WhatsApp us</a>}
              <Link to="/" className="op-link"><FiHome /> Continue shopping</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
