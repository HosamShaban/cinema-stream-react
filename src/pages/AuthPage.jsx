// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../store/slices/authSlice';

export default function AuthPage() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({
    email: '', password: '', confirm_pw: '',
    first_name: '', last_name: '', date_of_birth: '',
  });

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 'login') {
      dispatch(login({ email: form.email, password: form.password }));
    } else {
      if (form.password !== form.confirm_pw) {
        alert("Passwords don't match"); return;
      }
      dispatch(register({
        email:         form.email,
        password:      form.password,
        first_name:    form.first_name,
        last_name:     form.last_name,
        date_of_birth: form.date_of_birth,
      }));
    }
  };

  return (
    <div style={{
      background: '#0a0a0a', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(220,53,69,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#dc3545', letterSpacing: 2 }}>CINEMA</span>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 2 }}> STREAM</span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 16,
          padding: 32, border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'rgba(0,0,0,0.4)',
            borderRadius: 8, padding: 4, marginBottom: 28,
          }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: 9, border: 'none', borderRadius: 6,
                background: tab === t ? '#dc3545' : 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: 14,
                fontWeight: 600, transition: 'background 0.2s',
              }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {tab === 'register' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Input label="First Name" value={form.first_name} onChange={set('first_name')} placeholder="John" />
                <Input label="Last Name"  value={form.last_name}  onChange={set('last_name')}  placeholder="Doe" />
              </div>
            )}

            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />

            {tab === 'register' && (
              <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            )}

            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />

            {tab === 'register' && (
              <Input label="Confirm Password" type="password" value={form.confirm_pw} onChange={set('confirm_pw')} placeholder="••••••••" />
            )}

            {error && (
              <div style={{
                background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)',
                borderRadius: 8, padding: '10px 14px', color: '#ff6b6b', fontSize: 13,
              }}>
                {typeof error === 'object'
                  ? Object.values(error).flat().join(' ')
                  : String(error)}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: '#dc3545', color: '#fff', border: 'none',
              borderRadius: 8, padding: 13, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}>
              {loading ? 'Loading…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', marginTop: 20, marginBottom: 0 }}>
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{
              background: 'none', border: 'none', color: '#fff',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline',
            }}>
              {tab === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required
        style={{
          width: '100%', background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          padding: '11px 14px', color: '#fff', fontSize: 14,
          outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(220,53,69,0.6)'}
        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
    </div>
  );
}
