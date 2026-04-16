'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isStudent = role === 'student';
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, isStudent })
    });
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const labels: Record<string, { label: string; placeholder: string }> = {
    student: { label: 'รหัสนักศึกษา (11 หลัก)', placeholder: 'ตัวอย่าง 68401280555' },
    guest: { label: 'ชื่อผู้ใช้งาน', placeholder: 'กรอกชื่อผู้ใช้' },
    admin: { label: 'ชื่อผู้ใช้งาน', placeholder: 'กรอกชื่อผู้ใช้' },
  };

  return (
    <div className="form-card">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: 8, fontSize: '1.8rem' }}>เข้าสู่ระบบ</h1>
        <p style={{ color: 'var(--gray-500)' }}>RETC Academic Repository</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, padding: 4, background: 'var(--gray-100)', borderRadius: 12 }}>
          <button type="button" 
            style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, background: role === 'student' ? 'white' : 'transparent', color: role === 'student' ? 'var(--navy)' : 'var(--gray-600)', fontWeight: role === 'student' ? 700 : 500, boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => setRole('student')}
          >
            <i className="fas fa-user-graduate" style={{ marginRight: 6 }}></i>นักศึกษา
          </button>
          <button type="button" 
            style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, background: role === 'guest' ? 'white' : 'transparent', color: role === 'guest' ? 'var(--navy)' : 'var(--gray-600)', fontWeight: role === 'guest' ? 700 : 500, boxShadow: role === 'guest' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => setRole('guest')}
          >
            <i className="fas fa-user" style={{ marginRight: 6 }}></i>บุคคลภายนอก
          </button>
          <button type="button" 
            style={{ flex: 1, padding: 10, border: 'none', borderRadius: 8, background: role === 'admin' ? 'white' : 'transparent', color: role === 'admin' ? 'var(--navy)' : 'var(--gray-600)', fontWeight: role === 'admin' ? 700 : 500, boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => setRole('admin')}
          >
            <i className="fas fa-shield-alt" style={{ marginRight: 6 }}></i>เจ้าหน้าที่
          </button>
        </div>

        <div className="form-group">
          <label>{labels[role].label}</label>
          <input className="form-control" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder={labels[role].placeholder} required />
        </div>

        <div className="form-group">
          <label>รหัสผ่าน</label>
          <div style={{ position: 'relative' }}>
            <input className="form-control" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="กรอกรหัสผ่าน" required style={{ paddingRight: 46 }} />
            <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--gray-400)' }}></i>
          </div>
        </div>

        <button type="submit" className="btn btn-action" style={{ width: '100%', padding: 14, fontSize: '1.05rem', marginTop: 12 }}>
          <i className="fas fa-sign-in-alt"></i> ลงชื่อเข้าใช้งาน
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.95rem', color: 'var(--gray-600)' }}>
        ยังไม่มีบัญชี? <Link href="/register" style={{ color: 'var(--navy)', fontWeight: 700 }}>ลงทะเบียนใหม่</Link>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <Link href="/reset-password" style={{ color: 'var(--gray-500)', textDecoration: 'underline' }}>ลืมรหัสผ่าน</Link>
      </div>
    </div>
  );
}
