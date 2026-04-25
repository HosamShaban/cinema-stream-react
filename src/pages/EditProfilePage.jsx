// src/pages/EditProfilePage.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useDispatch } from 'react-redux';
import { loadProfile } from '../store/slices/authSlice';
import api from '../services/api';

export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
  });
  const [avatar,   setAvatar]   = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const fileRef = useRef();
  const dispatch = useDispatch();

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name',  form.last_name);
      fd.append('email',      form.email);
      if (avatar) fd.append('avatar', avatar);

      const { data } = await api.post('/auth/edit-profile/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
  await dispatch(loadProfile());  
  navigate('/profile');
      } else {
        setError(data.error || 'Failed to save changes.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error.');
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 20px', color: '#fff' }}>
      <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Edit Profile</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
            background: '#2a2a2a', border: '2px solid #444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>
            {preview ? (
  <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
) : user?.avatar ? (
  <img
    src={`http://127.0.0.1:8000${user.avatar}`}
    alt="avatar"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
) : (
  (user?.first_name?.[0] || '?').toUpperCase()
)}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current.click()} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontSize: 14,
            }}>Change Avatar</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            {avatar && <p style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>{avatar.name}</p>}
          </div>
        </div>

        <Field label="First Name" value={form.first_name} onChange={set('first_name')} required />
        <Field label="Last Name"  value={form.last_name}  onChange={set('last_name')}  required />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} required />

        {error && (
          <div style={{
            background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)',
            borderRadius: 8, padding: '10px 14px', color: '#ff6b6b', fontSize: 13,
          }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} style={{
            background: 'linear-gradient(45deg,#0d6efd,#0a58ca)',
            color: '#fff', border: 'none', padding: '12px 28px',
            borderRadius: 6, fontSize: 15, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/profile')} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '12px 24px', borderRadius: 6,
            fontSize: 15, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <div>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} required={required}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          padding: '11px 14px', color: '#fff', fontSize: 14,
          outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(13,110,253,0.6)'}
        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
    </div>
  );
}
