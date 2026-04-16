'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [userType, setUserType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notify, setNotify] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const role = userType === 'student' ? 'STUDENT' : 'OUTSIDER';
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        password, 
        role, 
        email: userType === 'guest' ? email : undefined, 
        student_id: userType === 'student' ? username : undefined, 
        phone,
        notify_new_project: notify
      })
    });
    if (res.ok) {
      setSuccess('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ กำลังไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      const data = await res.json();
      setError(data.error || 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
  };

  return (
    <div className="form-card wide">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ color: 'var(--navy)', marginBottom: 8, fontSize: '1.8rem' }}>ลงทะเบียนผู้ใช้งานใหม่</h1>
        <p style={{ color: 'var(--gray-500)' }}>RETC Academic Repository คลังงานวิจัยวิทยาลัยเทคนิคร้อยเอ็ด</p>
      </div>

      {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
      {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 4, background: 'var(--gray-100)', borderRadius: 12 }}>
          <button type="button" 
            style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: userType === 'student' ? 'white' : 'transparent', color: userType === 'student' ? 'var(--navy)' : 'var(--gray-600)', fontWeight: userType === 'student' ? 700 : 500, boxShadow: userType === 'student' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            onClick={() => setUserType('student')}
          >
            <i className="fas fa-user-graduate" style={{ marginRight: 8 }}></i>นักศึกษา
          </button>
          <button type="button" 
            style={{ flex: 1, padding: 12, border: 'none', borderRadius: 8, background: userType === 'guest' ? 'white' : 'transparent', color: userType === 'guest' ? 'var(--navy)' : 'var(--gray-600)', fontWeight: userType === 'guest' ? 700 : 500, boxShadow: userType === 'guest' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            onClick={() => setUserType('guest')}
          >
            <i className="fas fa-user" style={{ marginRight: 8 }}></i>บุคคลภายนอก
          </button>
        </div>

        <div className="form-group">
          <label>{userType === 'student' ? 'รหัสนักศึกษา (11 หลัก)' : 'ชื่อผู้ใช้งาน'}</label>
          <input className="form-control" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={userType === 'student' ? 'กรอกรหัสนักศึกษา 11 หลัก' : 'กรอกชื่อผู้ใช้'} required />
        </div>

        {userType === 'guest' && (
          <div className="form-group">
            <label>อีเมล <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" required />
          </div>
        )}

        <div className="form-group">
          <label>เบอร์โทรศัพท์ (10 หลัก)</label>
          <input className="form-control" type="tel" value={phone} onChange={handlePhoneInput} placeholder="08xxxxxxxx" inputMode="numeric" />
        </div>

        <div className="form-group">
          <label>รหัสผ่าน</label>
          <div style={{ position: 'relative' }}>
            <input className="form-control" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="ความยาวอย่างน้อย 6 ตัวอักษร" required style={{ paddingRight: 46 }} />
            <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--gray-400)' }}></i>
          </div>
        </div>

        {userType === 'guest' && (
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="notify" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--navy)' }} />
            <label htmlFor="notify" style={{ margin: 0, fontWeight: 500, cursor: 'pointer' }}>ต้องการรับการแจ้งเตือนเมื่อมีผลงานวิจัยใหม่ทางอีเมล</label>
          </div>
        )}

        <button type="submit" className="btn btn-action" style={{ width: '100%', padding: 14, fontSize: '1.05rem', marginTop: 12 }}>
          <i className="fas fa-user-plus"></i> ยืนยันการสมัครสมาชิก
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.95rem', color: 'var(--gray-600)' }}>
        มีบัญชีอยู่แล้ว? <Link href="/login" style={{ color: 'var(--navy)', fontWeight: 700 }}>เข้าสู่ระบบที่นี่</Link>
      </div>
    </div>
  );
}
