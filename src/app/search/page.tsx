'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

const DEPARTMENTS = [
  { key: '', label: 'ทุกสาขาวิชา' },
  { key: 'EE', label: 'สาขาเทคโนโลยีไฟฟ้า' },
  { key: 'ET', label: 'สาขาเทคโนโลยีอิเล็กทรอนิกส์' },
  { key: 'PT', label: 'สาขาเทคโนโลยีการผลิต' },
  { key: 'MT', label: 'สาขาเทคโนโลยีเครื่องกล' },
  { key: 'CT', label: 'สาขาเทคโนโลยีคอมพิวเตอร์' },
];

// Static departments, but we'll fetch years dynamically

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialSearch = searchParams.get('q') || '';
  const initialDept = searchParams.get('dept') || '';
  const initialYear = searchParams.get('year') || '';

  const [search, setSearch] = useState(initialSearch);
  const [dept, setDept] = useState(initialDept);
  const [year, setYear] = useState(initialYear);
  
  const [papers, setPapers] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchPapers = async (targetPage = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (dept) params.set('department', dept);
    if (year) params.set('year', year);
    params.set('page', targetPage.toString());
    params.set('limit', '18');
    
    const res = await fetch(`/api/papers?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setPapers(data.papers || []);
      setPagination(data.pagination);
      if (data.academicYears) {
        setAvailableYears(data.academicYears.map((y: any) => y.toString()));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    fetchPapers(1);
  }, [search, dept, year]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPapers(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (dept) params.set('dept', dept);
    if (year) params.set('year', year);
    router.push(`/search?${params.toString()}`);
    fetchPapers();
  };

  const getDeptColorClass = (d: string) => {
    if (d === 'EE') return 'card-ไฟฟ้า';
    if (d === 'ET') return 'card-อิเล็กทรอนิกส์';
    if (d === 'PT') return 'card-การผลิต';
    if (d === 'MT') return 'card-เครื่องกล';
    if (d === 'CT') return 'card-คอมพิวเตอร์';
    return 'card-default';
  };

  const getDeptTagClass = (d: string) => {
    if (d === 'EE') return 'dept-ไฟฟ้า';
    if (d === 'ET') return 'dept-อิเล็กทรอนิกส์';
    if (d === 'PT') return 'dept-การผลิต';
    if (d === 'MT') return 'dept-เครื่องกล';
    if (d === 'CT') return 'dept-คอมพิวเตอร์';
    return 'dept-default';
  };

  const deptLabels: Record<string, string> = {
    'EE': 'สาขาเทคโนโลยีไฟฟ้า', 
    'ET': 'สาขาเทคโนโลยีอิเล็กทรอนิกส์', 
    'PT': 'สาขาเทคโนโลยีการผลิต', 
    'MT': 'สาขาเทคโนโลยีเครื่องกล', 
    'CT': 'สาขาเทคโนโลยีคอมพิวเตอร์'
  };

  return (
    <>
      <div className="page-header" style={{ paddingBottom: 60 }}>
        <h1><i className="fas fa-search"></i> ค้นหาผลงานวิจัย</h1>
        <p>ค้นหาและกรองผลงานตามเงื่อนไขที่ต้องการ</p>
      </div>

      <div className="search-container" style={{ position: 'relative', zIndex: 11 }}>
        <form className="search-box responsive-search" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <i className="fas fa-search" style={{ color: 'var(--gray-400)' }}></i>
            <input 
              type="text" 
              placeholder="ค้นหาชื่อเรื่องหรือชื่อผู้วิจัย..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="search-filters-wrap">
            <select className="search-filter" value={dept} onChange={e => setDept(e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
            <select className="search-filter" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">ทุกปีการศึกษา</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </form>
      </div>

      <style jsx>{`
        .responsive-search {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-filters-wrap {
          display: flex;
          gap: 10px;
        }
        @media (max-width: 768px) {
          .responsive-search {
            flex-direction: column;
            padding: 16px;
          }
          .search-input-wrap {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border);
            padding-bottom: 8px;
          }
          .search-filters-wrap {
            width: 100%;
            flex-direction: column;
          }
          .search-filter {
            width: 100%;
            border-right: none !important;
          }
        }
      `}</style>


      <div className="main-container" style={{ paddingTop: 0, position: 'relative', zIndex: 10 }}>
        <p style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 20 }}>
          พบ <span style={{ color: 'var(--navy)' }}>{pagination?.totalCount || papers.length}</span> ผลงาน
          {pagination?.totalPages > 1 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 400, marginLeft: 10 }}>
              (หน้า {page} จาก {pagination.totalPages})
            </span>
          )}
        </p>

        {loading ? (
          <div className="empty-state">กำลังค้นหาข้อมูล...</div>
        ) : papers.length === 0 ? (
          <div className="empty-state">ไม่พบผลงานวิจัยที่ตรงกับเงื่อนไขการค้นหา</div>
        ) : (
          <>
            <div className="projects-grid">
            {papers.map((paper: any) => {
              const avgRating = paper.ratings.length > 0
                ? (paper.ratings.reduce((a: any, b: any) => a + b.score, 0) / paper.ratings.length).toFixed(1)
                : null;

              return (
                <div key={paper.id} className={`project-card ${getDeptColorClass(paper.department)}`}>
                  <div className="project-card-header">
                    <span className={`dept-tag ${getDeptTagClass(paper.department)}`}>{deptLabels[paper.department] || paper.department}</span>
                    <span className="year-tag">{paper.academicYear}</span>
                  </div>
                  <div className="project-card-body" style={{ minHeight: 180 }}>
                    <Link href={`/papers/${paper.id}`}>
                      <h3 className="project-title">{paper.title_th}</h3>
                    </Link>
                    <div className="project-author">
                      <i className="fas fa-user-circle" style={{ color: 'var(--gray-400)' }}></i> {paper.student_name}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                      {paper.abstract?.substring(0, 90) + '...'}
                    </p>
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

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination-wrapper" style={{ 
                marginTop: 40, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 24 
              }}>
                {page > 1 ? (
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    className="btn"
                    style={{ 
                      minWidth: 140, 
                      background: 'var(--navy-light)', 
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(44, 117, 168, 0.2)'
                    }}
                  >
                    <i className="fas fa-chevron-left"></i> หน้าก่อนหน้า
                  </button>
                ) : (
                  <div style={{ minWidth: 140 }}></div> /* Spacer */
                )}
                
                <span style={{ fontWeight: 700, color: 'var(--navy-dark)', fontSize: '1.05rem' }}>หน้า {page} / {pagination.totalPages}</span>
                
                {page < pagination.totalPages ? (
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    className="btn"
                    style={{ 
                      minWidth: 140, 
                      background: 'var(--navy-light)', 
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(44, 117, 168, 0.2)'
                    }}
                  >
                    ดูหน้าถัดไป <i className="fas fa-chevron-right"></i>
                  </button>
                ) : (
                  <div style={{ minWidth: 140 }}></div> /* Spacer */
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
