import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiTrash2, FiShield } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/index.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: me } = useAuthStore();

  const fetch = () => api.get('/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (id === me._id) { toast.error("Can't delete yourself"); return; }
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try { await api.delete(`/users/${id}`); toast.success('User deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleRoleChange = async (id, role) => {
    try { await api.put(`/users/${id}`, { role }); toast.success('Role updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id, isActive) => {
    try { await api.put(`/users/${id}`, { isActive }); toast.success('Status updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Helmet><title>Users — Admin</title></Helmet>
      <div style={{ maxWidth: 1100 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, marginBottom:2 }}>Users</h1>
            <p style={{ color:'var(--text-3)', fontSize:'.875rem' }}>{filtered.length} users</p>
          </div>
          <div className="input-wrap">
            <FiSearch className="input-icon-left" size={15} />
            <input className="input has-icon-left" style={{ width:260 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--surface-2)' }}>
                  {['User','Email','Role','Status','Joined','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text-3)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user._id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background: user.role === 'admin' ? 'var(--blue)' : 'var(--surface-2)', color: user.role === 'admin' ? '#fff' : 'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.875rem', flexShrink:0 }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight:600, fontSize:'.875rem' }}>{user.name}</p>
                          {user._id === me?._id && <span style={{ fontSize:'.7rem', color:'var(--blue)', fontWeight:700 }}>You</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:'.82rem', color:'var(--text-2)' }}>{user.email}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user._id, e.target.value)}
                        disabled={user._id === me?._id}
                        style={{ padding:'5px 10px', background:'var(--surface-2)', border:'1px solid var(--border-strong)', borderRadius:'var(--r-sm)', color: user.role === 'admin' ? 'var(--blue)' : 'var(--text-2)', fontWeight:600, fontSize:'.78rem', cursor:'pointer' }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span
                        onClick={() => user._id !== me?._id && handleStatusChange(user._id, !user.isActive)}
                        style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:'var(--r-full)', background: user.isActive ? 'rgba(0,200,83,.1)' : 'rgba(255,59,59,.1)', color: user.isActive ? 'var(--green)' : 'var(--red)', fontWeight:700, fontSize:'.75rem', cursor: user._id === me?._id ? 'default' : 'pointer', userSelect:'none' }}
                      >
                        {user.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px', fontSize:'.82rem', color:'var(--text-3)' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-AE', { day:'numeric', month:'short', year:'2-digit' })}
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <button
                        disabled={user._id === me?._id}
                        onClick={() => handleDelete(user._id, user.name)}
                        style={{ width:32, height:32, borderRadius:'var(--r-sm)', background:'rgba(255,59,59,.1)', color:'var(--red)', border:'none', cursor: user._id === me?._id ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: user._id === me?._id ? 0.4 : 1 }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)' }}>No users found</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
