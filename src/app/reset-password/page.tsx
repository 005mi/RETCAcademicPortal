'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [isStudent, setIsStudent] = useState(true);
  const [identifier1, setIdentifier1] = useState('');
  const [identifier2, setIdentifier2] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isStudent, identifier1, identifier2, newPassword })
    });
    if (res.ok) {
      setSuccess('รีเซ็ตรหัสผ่านสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      const data = await res.json();
      setError(data.error || 'ยืนยันตัวตนไม่สำเร็จ');
    }
  };

  return (
    <div className="form-card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: 8, fontSize: '1.8rem' }}>รีเซ็ตรหัสผ่าน</h1>
        <p style={{ color: 'var(--gray-500)' }}>กรุณายืนยันตัวตนเพื่อตั้งรหัสผ่านใหม่</p>
      </div>

      {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
      {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 4, background: 'var(--gray-100)', borderRadius: 12 }}>
          <button type="button" 
            style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: isStudent ? 'white' : 'transparent', color: isStudent ? 'var(--navy)' : 'var(--gray-600)', fontWeight: isStudent ? 700 : 500, boxShadow: isStudent ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            onClick={() => { setIsStudent(true); setIdentifier1(''); setIdentifier2(''); }}
          >
            <i className="fas fa-user-graduate" style={{ marginRight: 8 }}></i>นักศึกษา
          </button>
          <button type="button" 
            style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: !isStudent ? 'white' : 'transparent', color: !isStudent ? 'var(--navy)' : 'var(--gray-600)', fontWeight: !isStudent ? 700 : 500, boxShadow: !isStudent ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            onClick={() => { setIsStudent(false); setIdentifier1(''); setIdentifier2(''); }}
          >
            <i className="fas fa-user" style={{ marginRight: 8 }}></i>บุคคลภายนอก
          </button>
        </div>

        <div className="form-group">
          <label>{isStudent ? 'รหัสนักศึกษา (11 หลัก)' : 'ชื่อผู้ใช้งาน'}</label>
          <input className="form-control" type="text" value={identifier1} onChange={e => setIdentifier1(e.target.value)} placeholder={isStudent ? 'กรอกรหัสนักศึกษา' : 'กรอกชื่อผู้ใช้'} required />
        </div>

        <div className="form-group">
          <label>{isStudent ? 'เบอร์โทรศัพท์ (10 หลัก)' : 'อีเมล'}</label>
          <input className="form-control" type={isStudent ? 'tel' : 'email'} value={identifier2} onChange={e => setIdentifier2(e.target.value)} placeholder={isStudent ? '08xxxxxxxx' : 'example@email.com'} required />
        </div>

        <div className="form-group">
          <label>รหัสผ่านใหม่</label>
          <div style={{ position: 'relative' }}>
            <input className="form-control" type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="ตั้งรหัสผ่านใหม่" required style={{ paddingRight: 46 }} />
            <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--gray-400)' }}></i>
          </div>
        </div>

        <button type="submit" className="btn btn-action" style={{ width: '100%', padding: 14, fontSize: '1.05rem', marginTop: 12 }}>
          <i className="fas fa-key"></i> ยืนยันการเปลี่ยนรหัสผ่าน
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.95rem', color: 'var(--gray-600)' }}>
        จำรหัสผ่านได้แล้ว? <Link href="/login" style={{ color: 'var(--navy)', fontWeight: 700 }}>เข้าสู่ระบบที่นี่</Link>
      </div>
    </div>
  );
}
