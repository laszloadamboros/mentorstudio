import React, { useState, useEffect } from 'react';

const API_BASE = 'https://mentorstudio-backend.onrender.com/api';
const UPLOADS_BASE = 'https://mentorstudio-backend.onrender.com';

export default function Profile() {
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', avatar_url: '' });
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            avatar_url: data.avatar_url || ''
          });
        }
      });
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) setMessage('Adatok sikeresen frissítve!');
  };

  const handleAvatarUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const bodyData = new FormData();
    bodyData.append('avatar', selectedFile);

    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: bodyData
    });
    const data = await res.json();
    if (res.ok) {
      setFormData(prev => ({ ...prev, avatar_url: data.avatar_url }));
      setMessage('Profilkép sikeresen frissítve!');
    }
  };

  const avatarSrc = formData.avatar_url
    ? (formData.avatar_url.startsWith('http') ? formData.avatar_url : `${UPLOADS_BASE}${formData.avatar_url}`)
    : 'https://via.placeholder.com/120';

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', padding: '24px', background: 'rgba(18, 43, 29, 0.65)', backdropFilter: 'blur(16px)', color: '#fff', borderRadius: '18px', border: '1px solid rgba(52, 211, 153, 0.18)' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem', fontWeight: '700' }}>Profil Beállítások</h2>
      {message && <p style={{ color: '#34d399', marginBottom: '15px', fontWeight: '500' }}>{message}</p>}

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src={avatarSrc} 
          alt="Profilkép" 
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #34d399' }}
        />
        <br />
        <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ marginTop: '10px', color: '#a7f3d0' }} />
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.5px' }}>TELJES NÉV</label>
          <input 
            type="text" 
            value={formData.full_name} 
            onChange={e => setFormData({ ...formData, full_name: e.target.value })} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.25)', background: 'rgba(5, 18, 12, 0.7)', color: '#fff', marginTop: '5px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.5px' }}>E-MAIL CÍM</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.25)', background: 'rgba(5, 18, 12, 0.7)', color: '#fff', marginTop: '5px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.5px' }}>TELEFONSZÁM</label>
          <input 
            type="text" 
            value={formData.phone} 
            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.25)', background: 'rgba(5, 18, 12, 0.7)', color: '#fff', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Mentés
        </button>
      </form>
    </div>
  );
}