import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiPackage, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api.js';
import { useGuestOrdersStore, fmtAED } from '../store/index.js';
import './OrderPages.css';

export default function TrackOrder() {
  const navigate = useNavigate();
  const saved = useGuestOrdersStore((s) => s.orders);
  const add = useGuestOrdersStore((s) => s.add);
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!orderNumber.trim() || !phone.trim()) { setError('Enter your order number and mobile number'); return; }
    setBusy(true);
    try {
      const { data } = await api.post('/orders/track', { orderNumber: orderNumber.trim(), phone });
      add({ id: data.orderId, key: data.accessKey, orderNumber: orderNumber.trim().toUpperCase() });
      navigate(`/order/${data.orderId}?key=${data.accessKey}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find that order');
    } finally { setBusy(false); }
  };

  return (
    <>
      <Helmet><title>Track your order — PrimeGadgets</title></Helmet>
      <div className="op-page">
        <div className="container op-narrow">
          <div className="op-card">
            <span className="op-icon"><FiPackage /></span>
            <h1 className="op-title" style={{ marginTop: 12 }}>Track your order</h1>
            <p className="op-lead" style={{ textAlign: 'left' }}>Enter the order number from your confirmation and the mobile number you used at checkout.</p>
            <form onSubmit={submit} className="op-form" noValidate>
              <label>Order number
                <input className="co-input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. PG-MWG6OZFARI6" autoCapitalize="characters" />
              </label>
              <label>Mobile number
                <input className="co-input" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="05X XXX XXXX" autoComplete="tel" />
              </label>
              {error && <p className="co-err" role="alert">{error}</p>}
              <button className="btn btn-primary btn-lg btn-full" disabled={busy}><FiSearch /> {busy ? 'Searching…' : 'Find my order'}</button>
            </form>
          </div>

          {saved.length > 0 && (
            <div className="op-card" style={{ marginTop: 16 }}>
              <h2 className="op-h">Orders on this device</h2>
              <ul className="op-saved">
                {saved.map((o) => (
                  <li key={o.id}>
                    <Link to={`/order/${o.id}?key=${o.key}`}>
                      <FiPackage />
                      <span><strong>{o.orderNumber}</strong>{o.createdAt && <small>{new Date(o.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}{o.total ? ` · AED ${fmtAED(o.total)}` : ''}</small>}</span>
                      <FiChevronRight />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
