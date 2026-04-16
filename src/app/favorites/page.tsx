import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const DEPT_NAMES: Record<string, string> = {
  'EE': 'สาขาเทคโนโลยีไฟฟ้า', 'ET': 'สาขาเทคโนโลยีอิเล็กทรอนิกส์', 'PT': 'สาขาเทคโนโลยีการผลิต', 'MT': 'สาขาเทคโนโลยีเครื่องกล', 'CT': 'สาขาเทคโนโลยีคอมพิวเตอร์'
};

const getDeptColorClass = (d: string) => {
  if (d === 'EE') return 'dept-ไฟฟ้า';
  if (d === 'ET') return 'dept-อิเล็กทรอนิกส์';
  if (d === 'PT') return 'dept-การผลิต';
  if (d === 'MT') return 'dept-เครื่องกล';
  if (d === 'CT') return 'dept-คอมพิวเตอร์';
  return 'dept-default';
};

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.id },
    include: {
      paper: {
        include: { ratings: true }
      }
    }
  });

  return (
    <>
      <div className="page-header" style={{ paddingBottom: 60 }}>
        <h1><i className="fas fa-heart"></i> รายการโปรด</h1>
        <p>ผลงานวิชาการที่คุณบันทึกไว้</p>
      </div>

      <div className="main-container" style={{ marginTop: -10, position: 'relative', zIndex: 10 }}>
        {favorites.length === 0 ? (
          <div className="empty-state" style={{ padding: '80px 40px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <i className="fas fa-plus" style={{ fontSize: '1.8rem', color: '#94a3b8' }}></i>
            </div>
            <p style={{ marginBottom: 20, fontSize: '1.1rem', color: 'var(--gray-500)' }}>ยังไม่มีรายการโปรดที่คุณบันทึกไว้</p>
            <Link href="/search" className="btn btn-action" style={{ padding: '12px 28px' }}>
              <i className="fas fa-search"></i> ค้นหาผลงานวิจัยเพิ่ม
            </Link>
          </div>
        ) : (
          <div className="projects-grid">
            {favorites.map(fav => {
              const paper = fav.paper;
              const avgRating = paper.ratings.length > 0
                ? (paper.ratings.reduce((a, b: any) => a + b.score, 0) / paper.ratings.length).toFixed(1)
                : null;

              return (
                <div key={paper.id} className={`project-card ${getDeptColorClass(paper.department).replace('dept-', 'card-')}`}>
                  <div className="project-card-header">
                    <span className="dept-tag">{DEPT_NAMES[paper.department] || paper.department}</span>
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
        )}
      </div>
    </>
  );
}
