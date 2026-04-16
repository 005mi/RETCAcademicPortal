'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const getDeptColorClass = (dept: string) => {
    if (dept.includes('ไฟฟ้า')) return 'card-ไฟฟ้า';
    if (dept.includes('อิเล็กทรอนิกส์')) return 'card-อิเล็กทรอนิกส์';
    if (dept.includes('ผลิต')) return 'card-การผลิต';
    if (dept.includes('เครื่องกล')) return 'card-เครื่องกล';
    if (dept.includes('คอมพิวเตอร์')) return 'card-คอมพิวเตอร์';
    return 'card-default';
  };

  const getDeptTagClass = (dept: string) => {
    if (dept.includes('ไฟฟ้า')) return 'dept-ไฟฟ้า';
    if (dept.includes('อิเล็กทรอนิกส์')) return 'dept-อิเล็กทรอนิกส์';
    if (dept.includes('ผลิต')) return 'dept-การผลิต';
    if (dept.includes('เครื่องกล')) return 'dept-เครื่องกล';
    if (dept.includes('คอมพิวเตอร์')) return 'dept-คอมพิวเตอร์';
    return 'dept-default';
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-badge">
          <i className="fas fa-graduation-cap"></i> วิทยาลัยเทคนิคร้อยเอ็ด
        </div>
        <h1 className="hero-title">RETC Academic Portal<br/>ผลงานวิชาการเทคโนโลยีบัณฑิต</h1>
        <p className="hero-sub">
          แหล่งรวมงานวิจัยและผลงานวิชาการ วิทยาลัยเทคนิคร้อยเอ็ด
        </p>
        <div className="hero-actions">
          <Link href="/search" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: 24, fontWeight: 700 }}>
            <i className="fas fa-search"></i> ค้นหาผลงาน
          </Link>
          <Link href="/stats" className="btn btn-outline" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: 24, fontWeight: 700 }}>
            <i className="fas fa-chart-line"></i> ดูสถิติ
          </Link>
        </div>
      </section>

      <div className="summary-container">
        <div className="summary-card">
          <div className="summary-icon bg-blue-light"><i className="fas fa-book-open"></i></div>
          <div>
            <h3>ผลงานทั้งหมด</h3>
            <p>{stats ? stats.totalCount : '-'}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon bg-green-light"><i className="fas fa-eye"></i></div>
          <div>
            <h3>ยอดเข้าชมรวม</h3>
            <p>{stats ? stats.totalViews : '-'}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon bg-purple-light"><i className="fas fa-download"></i></div>
          <div>
            <h3>ยอดดาวน์โหลดรวม</h3>
            <p>{stats ? stats.totalDownloads : '-'}</p>
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* Top Rated Section */}
        {!loading && stats?.topRated?.length > 0 && (
          <>
            <div className="section-title">
              <h2 style={{ color: 'var(--navy-dark)' }}>ผลงานยอดนิยม (Top Rated)</h2>
            </div>
            <div className="projects-grid">
              {stats?.topRated?.map((paper: any) => (
                <div key={paper.id} className={`project-card ${getDeptColorClass(paper.department)}`}>
                  <div className="project-card-header">
                    <span className={`dept-tag ${getDeptTagClass(paper.department)}`}>{paper.department}</span>
                    <span className="year-tag">{paper.year}</span>
                  </div>
                  <div className="project-card-body">
                    <Link href={`/papers/${paper.id}`}>
                      <h3 className="project-title">{paper.title}</h3>
                    </Link>
                    <div className="project-author">
                      <i className="fas fa-user-circle" style={{ color: 'var(--gray-400)' }}></i> {paper.author}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                      {paper.abstractSnippet}
                    </p>
                  </div>
                  <div className="project-card-footer">
                    <div className="project-stats">
                      <span title="เข้าชม"><i className="fas fa-eye"></i> {paper.views}</span>
                      <span title="ดาวน์โหลด"><i className="fas fa-download"></i> {paper.downloads}</span>
                    </div>
                    {Number(paper.rating) > 0 ? (
                      <span className="project-rating">
                        <i className="fas fa-star" style={{ color: 'var(--orange)' }}></i> 
                        {paper.rating} {paper.ratingCount > 0 ? `(${paper.ratingCount})` : ''}
                      </span>
                    ) : (
                      <span className="project-rating" style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>
                        ยังไม่มีคะแนน
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Latest Papers Section */}
        <div className="section-title" style={{ marginTop: 60 }}>
          <h2 style={{ color: 'var(--navy-dark)' }}>ผลงานล่าสุด</h2>
          <Link href="/search" style={{ fontWeight: 500, color: 'var(--blue)', fontSize: '0.9rem' }}>ดูทั้งหมด &rarr;</Link>
        </div>

        {loading ? (
          <div className="empty-state">กำลังโหลดผลงานล่าสุด...</div>
        ) : stats?.latestPapers?.length === 0 ? (
           <div className="empty-state">ยังไม่มีผลงานในระบบ</div>
        ) : (
          <div className="projects-grid">
            {stats?.latestPapers?.map((paper: any) => (
              <div key={`latest-${paper.id}`} className={`project-card ${getDeptColorClass(paper.department)}`}>
                <div className="project-card-header">
                  <span className={`dept-tag ${getDeptTagClass(paper.department)}`}>{paper.department}</span>
                  <span className="year-tag">{paper.year}</span>
                </div>
                <div className="project-card-body">
                  <Link href={`/papers/${paper.id}`}>
                    <h3 className="project-title">{paper.title}</h3>
                  </Link>
                  <div className="project-author">
                    <i className="fas fa-user-circle" style={{ color: 'var(--gray-400)' }}></i> {paper.author}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                    {paper.abstractSnippet}
                  </p>
                </div>
                <div className="project-card-footer">
                  <div className="project-stats">
                    <span title="เข้าชม"><i className="fas fa-eye"></i> {paper.views}</span>
                    <span title="ดาวน์โหลด"><i className="fas fa-download"></i> {paper.downloads}</span>
                  </div>
                  {Number(paper.rating) > 0 ? (
                    <span className="project-rating">
                      <i className="fas fa-star" style={{ color: 'var(--orange)' }}></i> 
                      {paper.rating}
                    </span>
                  ) : (
                    <span className="project-rating" style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>
                      ยังไม่มีคะแนน
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
