import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiMessageCircle, FiCheck, FiTrash2, FiStar } from 'react-icons/fi';
import AdminLayout, { useAdminBadges } from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function AdminMessages() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshBadges = useAdminBadges((s) => s.refresh);

  const load = () => {
    setLoading(true);
    api.get('/messages', { params: { unread: unreadOnly ? 1 : undefined } }).then(({ data }) => setMessages(data.messages)).catch(() => toast.error('Could not load messages')).finally(() => setLoading(false));
  };
  useEffect(load, [unreadOnly]);

  const markRead = async (m, isRead = true) => {
    try { await api.put(`/messages/${m._id}`, { isRead }); load(); refreshBadges(); } catch { toast.error('Update failed'); }
  };
  const remove = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    try { await api.delete(`/messages/${m._id}`); load(); refreshBadges(); } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout>
      <Helmet><title>Messages — PrimeGadgets Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Messages &amp; feedback</h1><p className="adm-sub">From the Contact page</p></div>
      </div>
      <div className="adm-tabs">
        <button className={`adm-tab ${!unreadOnly ? 'on' : ''}`} onClick={() => setUnreadOnly(false)}>All</button>
        <button className={`adm-tab ${unreadOnly ? 'on' : ''}`} onClick={() => setUnreadOnly(true)}>Unread</button>
      </div>
      <div className="adm-list">
        {messages.map((m) => (
          <div key={m._id} className={`adm-msg ${m.isRead ? '' : 'unread'}`}>
            <div className="adm-msg-h">
              <strong>{m.name}</strong>
              <span className={`pill ${m.type === 'feedback' ? 'shipped' : 'confirmed'}`}>{m.type}</span>
              {m.rating && <span className="pill muted"><FiStar /> {m.rating}</span>}
              {m.subject && <span className="muted">· {m.subject}</span>}
              <span className="muted" style={{ marginLeft: 'auto' }}>{new Date(m.createdAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <span className="muted">{[m.email, m.phone].filter(Boolean).join(' · ')}</span>
            <p>{m.message}</p>
            <div className="adm-msg-actions">
              {m.phone && <a className="btn btn-secondary btn-sm" href={`https://wa.me/${m.phone.replace(/\D/g, '').replace(/^0/, '971')}`} target="_blank" rel="noopener noreferrer"><FiMessageCircle /> WhatsApp</a>}
              {m.email && <a className="btn btn-secondary btn-sm" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message to PrimeGadgets'}`)}`}><FiMail /> Reply by email</a>}
              <button className="btn btn-secondary btn-sm" onClick={() => markRead(m, !m.isRead)}><FiCheck /> {m.isRead ? 'Mark unread' : 'Mark read'}</button>
              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--red)' }} onClick={() => remove(m)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        ))}
        {!loading && !messages.length && <div className="adm-card adm-empty">No messages {unreadOnly ? 'unread' : 'yet'}.</div>}
      </div>
    </AdminLayout>
  );
}
