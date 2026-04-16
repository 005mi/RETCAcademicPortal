'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const roleLabel = user?.role === 'ADMIN' ? 'เจ้าหน้าที่' : user?.role === 'STUDENT' ? 'นักศึกษา' : 'บุคคลภายนอก';

  return (
    <>
      <div className="top-bar">
        <div>วิทยาลัยเทคนิคร้อยเอ็ด | Roi Et Technical College</div>
        <div>RETC Academic Portal</div>
      </div>
      
      <nav className="navbar">
        <Link href="/" className="nav-brand">
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.png" alt="RETC Logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-name">RETC Academic Portal</span>
            <span className="nav-brand-sub">ผลงานวิชาการเทคโนโลยีบัณฑิต</span>
          </div>
        </Link>
        
        {/* Hamburger Toggle (Mobile Only) */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}><i className="fas fa-home"></i> หน้าแรก</Link>
          <Link href="/search" className={`nav-link ${pathname === '/search' ? 'active' : ''}`}><i className="fas fa-search"></i> ค้นหาผลงาน</Link>
          <Link href="/stats" className={`nav-link ${pathname === '/stats' ? 'active' : ''}`}><i className="fas fa-chart-bar"></i> สถิติ</Link>
          
          {(user?.role === 'STUDENT' || user?.role === 'ADMIN') && (
            <>
              <Link href="/upload" className={`nav-link ${pathname === '/upload' ? 'active' : ''}`}><i className="fas fa-cloud-upload-alt"></i> อัปโหลดผลงาน</Link>
              <Link href="/my-papers" className={`nav-link ${pathname === '/my-papers' ? 'active' : ''}`}><i className="fas fa-file-alt"></i> ผลงานของฉัน</Link>
            </>
          )}

          {user && (
            <Link href="/favorites" className={`nav-link ${pathname === '/favorites' ? 'active' : ''}`}><i className="fas fa-heart"></i> รายการโปรด</Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}><i className="fas fa-shield-alt"></i> Admin</Link>
          )}

          {/* User Section (Inside links on Mobile) */}
          {isMobileMenuOpen && (
             <div className="nav-user-section" style={{ display: 'flex', gap: 16 }}>
              {user ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'white' }}>
                    <i className="fas fa-user-circle" style={{ fontSize: '1.2rem', color: '#a8b8d8' }}></i>
                    <span>{user.username} <span className="role-badge">{roleLabel}</span></span>
                  </div>
                  <button onClick={handleLogout} className="btn-logout" title="ออกจากระบบ">
                    <i className="fas fa-sign-out-alt"></i> ออกจากระบบ
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-gold" style={{ width: '100%' }}>
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          )}
        </div>

        {/* User Section (Standard Desktop) */}
        {!isMobileMenuOpen && (
          <div className="nav-user-section desktop-only-user">
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
                  <i className="fas fa-user-circle" style={{ fontSize: '1.2rem', color: '#a8b8d8' }}></i>
                  <span>{user.username} <span className="role-badge">{roleLabel}</span></span>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="ออกจากระบบ">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-gold" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        )}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only-user { display: none !important; }
        }
      `}</style>
    </>
  );
}
