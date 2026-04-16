'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyPapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/papers/me')
      .then(r => {
        if (!r.ok) { window.location.href = '/login'; return null; }
        return r.json();
      })
      .then(data => {
        if (data?.papers) setPapers(data.papers);
        setLoading(false);
      });
  }, []);

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

  if (loading) return <div className="empty-state" style={{ margin: 40 }}>กำลังโหลดข้อมูลผลงานของคุณ...</div>;

  const renderPaperCards = (list: any[]) => {
    if (list.length === 0) {
      return <div className="empty-state" style={{ padding: '30px', background: 'transparent', borderStyle: 'dashed' }}>ไม่มีรายการ</div>;
    }
    return (
      <div className="projects-grid">
        {list.map(paper => {
          const avgRating = paper.ratings?.length > 0
            ? (paper.ratings.reduce((a: any, b: any) => a + b.score, 0) / paper.ratings.length).toFixed(1)
            : null;
            
          return (
            <div key={paper.id} className={`project-card ${getDeptColorClass(paper.department)}`}>
              <div className="project-card-header">
                <span className={`dept-tag`}>{deptLabels[paper.department] || paper.department}</span>
                <span className="year-tag">{paper.academicYear}</span>
              </div>
              <div className="project-card-body">
                <Link href={`/papers/${paper.id}`}>
                  <h3 className="project-title">{paper.title_th}</h3>
                </Link>
                <div className="project-author">
                  <i className="fas fa-user-circle" style={{ color: 'var(--gray-400)' }}></i> {paper.student_name}
                </div>
              </div>
              <div className="project-card-footer">
                <div className="project-stats">
                  <span title="เข้าชม"><i className="fas fa-eye"></i> {paper.views}</span>
                  <span title="ดาวน์โหลด"><i className="fas fa-download"></i> {paper.downloads}</span>
                </div>
                {avgRating ? (
                  <span className="project-rating">
                    <i className="fas fa-star" style={{ color: 'var(--orange)' }}></i> 
                    {avgRating} {(paper.ratings?.length ? `(${paper.ratings.length})` : '')}
                  </span>
                ) : (
                  <span className="project-rating" style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>
                    ยังไม่มีคะแนน
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="page-header" style={{ paddingBottom: 60 }}>
        <h1><i className="fas fa-file-alt"></i> ผลงานของฉัน</h1>
        <p>จัดการผลงานวิจัยที่คุณอัปโหลด ({papers.length} รายการ)</p>
      </div>

      <div className="main-container" style={{ paddingTop: 0, marginTop: 20, position: 'relative', zIndex: 10 }}>
        
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.2rem', color: '#b45309', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: '#ffe4e6', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800 }}>รออนุมัติ</span> ({pending.length})
          </h2>
          {renderPaperCards(pending)}
        </div>

        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#047857', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: '#d1fae5', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800 }}>เผยแพร่แล้ว</span> ({published.length})
          </h2>
          {renderPaperCards(published)}
        </div>

      </div>
    </>
  );
}
