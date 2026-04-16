'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/papers')
      .then(res => {
        if (!res.ok) { router.push('/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.papers) setPapers(data.papers);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    await fetch(`/api/admin/papers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจว่าต้องการลบผลงานนี้?')) {
      await fetch(`/api/admin/papers/${id}`, { method: 'DELETE' });
      window.location.reload();
    }
  };

  const pending = papers.filter(p => p.status === 'PENDING');
  const published = papers.filter(p => p.status === 'PUBLISHED');

  const getDeptColorClass = (d: string) => {
    if (d === 'EE') return 'card-ไฟฟ้า';
    if (d === 'ET') return 'card-อิเล็กทรอนิกส์';
    if (d === 'PT') return 'card-การผลิต';
    if (d === 'MT') return 'card-เครื่องกล';
    if (d === 'CT') return 'card-คอมพิวเตอร์';
    return 'card-default';
  };

  const deptLabels: Record<string, string> = {
    'EE': 'สาขาเทคโนโลยีไฟฟ้า', 
    'ET': 'สาขาเทคโนโลยีอิเล็กทรอนิกส์', 
    'PT': 'สาขาเทคโนโลยีการผลิต', 
    'MT': 'สาขาเทคโนโลยีเครื่องกล', 
    'CT': 'สาขาเทคโนโลยีคอมพิวเตอร์'
  };

  if (loading) return <div className="empty-state" style={{ margin: 40 }}>กำลังโหลดข้อมูลการจัดการระบบ...</div>;

  return (
    <>
      <div className="page-header" style={{ paddingBottom: 60 }}>
        <h1><i className="fas fa-shield-alt"></i> จัดการผลงานวิชาการ</h1>
        <p>Admin Dashboard - ตรวจสอบและอนุมัติผลงาน</p>
      </div>

      <div className="main-container" style={{ marginTop: -10, position: 'relative', zIndex: 10 }}>
        
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-gold-light" style={{ flexShrink: 0 }}><i className="fas fa-clock"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>รอการตรวจสอบ</h3>
              <p style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{pending.length}</p>
            </div>
          </div>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-green-light" style={{ flexShrink: 0 }}><i className="fas fa-check-circle"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>อนุมัติแล้ว</h3>
              <p style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{published.length}</p>
            </div>
          </div>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-blue-light" style={{ flexShrink: 0 }}><i className="fas fa-database"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>ผลงานทั้งหมด</h3>
              <p style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{papers.length}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 className="section-title" style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: 12, borderBottom: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#ffe4e6', color: '#e11d48', fontSize: '0.9rem' }}>
              <i className="fas fa-exclamation"></i>
            </span>
            ผลงานรออนุมัติ ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px', background: 'var(--surface)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)' }}>
              ไม่มีผลงานค้างตรวจสอบในขณะนี้
            </div>
          ) : (
            <div className="projects-grid">
              {pending.map(p => (
                <div key={p.id} className={`project-card ${getDeptColorClass(p.department)}`} style={{ background: '#fff' }}>
                  <div className="project-card-header">
                    <span className="dept-tag">{deptLabels[p.department] || p.department}</span>
                    <span className="year-tag">{p.academicYear}</span>
                  </div>
                  <div className="project-card-body">
                    <Link href={`/papers/${p.id}`}>
                      <h3 className="project-title">{p.title_th}</h3>
                    </Link>
                    <div className="project-author">
                      <i className="fas fa-user-circle" style={{ color: 'var(--gray-400)' }}></i> {p.student_name}
                    </div>
                  </div>
                  <div className="project-card-footer" style={{ gap: 8, display: 'flex' }}>
                    <Link href={`/papers/${p.id}`} className="btn btn-action" style={{ padding: '7px 14px', fontSize: '0.85rem', flex: 1 }}>
                      <i className="fas fa-eye"></i> ตรวจสอบ
                    </Link>
                    <button onClick={() => handleUpdate(p.id, 'PUBLISHED')} className="btn" style={{ padding: '7px 14px', fontSize: '0.85rem', background: 'var(--green)', color: 'white', flex: 1 }}>
                      <i className="fas fa-check"></i> อนุมัติ
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="btn" style={{ padding: '7px 14px', fontSize: '0.85rem', background: '#fee2e2', color: '#ef4444' }} title="ลบผลงาน">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="section-title" style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: 12, borderBottom: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#d1fae5', color: '#059669', fontSize: '0.9rem' }}>
              <i className="fas fa-check"></i>
            </span>
            ผลงานที่อนุมัติแล้ว ({published.length})
          </h2>
          {published.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px', background: 'var(--surface)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)' }}>
              ยังไม่มีผลงานที่ถูกอนุมัติเผยแพร่
            </div>
          ) : (
            <div className="projects-grid">
              {published.map(p => (
                <div key={p.id} className={`project-card ${getDeptColorClass(p.department)}`}>
                  <div className="project-card-header">
                    <span className="dept-tag">{deptLabels[p.department] || p.department}</span>
                    <span className="year-tag">{p.academicYear}</span>
                  </div>
                  <div className="project-card-body">
                    <Link href={`/papers/${p.id}`}><h3 className="project-title">{p.title_th}</h3></Link>
                    <div className="project-author">
                      <i className="fas fa-user-circle" style={{ color: 'var(--gray-400)' }}></i> {p.student_name}
                    </div>
                  </div>
                  <div className="project-card-footer" style={{ display: 'flex' }}>
                    <div className="project-stats" style={{ flexGrow: 1 }}>
                      <span><i className="fas fa-eye"></i> {p.views}</span>
                      <span><i className="fas fa-download"></i> {p.downloads}</span>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="btn" style={{ padding: '5px 12px', fontSize: '0.8rem', background: '#f1f5f9', color: '#ef4444', fontWeight: 600 }}>
                      <i className="fas fa-trash-alt"></i> ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
