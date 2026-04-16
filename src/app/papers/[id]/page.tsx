import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import PaperInteractions from '@/components/PaperInteractions';
import ViewIncrementer from '@/components/ViewIncrementer';
import PDFPreview from '@/components/PDFPreview';
import Comments from '@/components/Comments';

const DEPT_NAMES: Record<string, string> = {
  'EE': 'สาขาเทคโนโลยีไฟฟ้า', 'ET': 'สาขาเทคโนโลยีอิเล็กทรอนิกส์', 'PT': 'สาขาเทคโนโลยีการผลิต', 'MT': 'สาขาเทคโนโลยีเครื่องกล', 'CT': 'สาขาเทคโนโลยีคอมพิวเตอร์'
};

const TYPE_NAMES: Record<string, string> = {
  'classroom': 'วิจัยในชั้นเรียน', 'r_d': 'วิจัยและพัฒนา (R&D)', 'innovation': 'นวัตกรรมและสิ่งประดิษฐ์', 'survey': 'วิจัยเชิงสำรวจ', 'other': 'อื่นๆ'
};

export default async function PaperDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();

  const paper = await prisma.paper.findUnique({
    where: { id: params.id },
    include: {
      ratings: true,
      favorites: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!paper) notFound();

  const avgRating = paper.ratings.length > 0
    ? (paper.ratings.reduce((a, b) => a + b.score, 0) / paper.ratings.length).toFixed(1)
    : 'ยังไม่มีคะแนน';

  const userHasFavorited = session ? paper.favorites.some(f => f.userId === session.id) : false;
  const userRating = session ? paper.ratings.find(r => r.userId === session.id)?.score : null;

  return (
    <>
      <ViewIncrementer paperId={paper.id} disabled={session?.role === 'ADMIN'} />
      
      <div className="main-paper-container">
        <div className="container" style={{
          maxWidth: '960px',
          margin: '0 auto',
          background: '#ffffff',
          padding: '40px 44px',
          borderRadius: '20px',
          boxShadow: '0 10px 36px rgba(0,0,0,0.07)'
        }}>

          {/* ── Header ── */}
          <div className="header" style={{
            borderBottom: '3px solid var(--navy-light)',
            marginBottom: '18px',
            paddingBottom: '20px',
            textAlign: 'center',
            position: 'relative'
          }}>
            {(session?.role === 'ADMIN' || session?.id === paper.uploaderId) && (
              <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <Link href={`/upload?edit=${paper.id}`} className="btn-edit-icon" style={{
                  width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', background: 'var(--gold)', borderRadius: '50%',
                  fontSize: '1.2rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
                }}>
                  <i className="fas fa-edit"></i>
                </Link>
              </div>
            )}

            <h1 style={{
              color: 'var(--navy-dark)',
              fontSize: '1.75rem',
              lineHeight: 1.4,
              fontWeight: 800,
              padding: '0 44px'
            }}>
              {paper.title_th}
            </h1>
            {paper.title_en && (
              <p style={{
                color: 'var(--gray-500)',
                fontStyle: 'italic',
                fontSize: '1.05rem',
                marginTop: 8
              }}>
                {paper.title_en}
              </p>
            )}
          </div>

          {/* ── Stats bar ── */}
          <div className="stats-bar" style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '18px',
            margin: '14px 0 24px',
            color: 'var(--gray-500)',
            fontSize: '0.92rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-eye" style={{ color: 'var(--navy-light)' }}></i> เข้าชม {paper.views} ครั้ง
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-download" style={{ color: 'var(--navy-light)' }}></i> ดาวน์โหลด {paper.downloads} ครั้ง
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="fas fa-star" style={{ color: 'var(--orange)' }}></i> คะแนนเฉลี่ย {avgRating}
            </span>
          </div>

          <div style={{ margin: '0 auto 28px', display: 'flex', justifyContent: 'center' }}>
            {session && (
              <PaperInteractions paperId={paper.id} userHasFavorited={userHasFavorited} userRating={userRating ?? 0} />
            )}
          </div>

          {/* ── Meta Info Table ── */}
          <div className="meta-info" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px 24px',
            marginBottom: '28px',
            background: 'var(--gray-50)',
            padding: '22px 24px',
            borderRadius: '14px',
            border: '1px solid var(--gray-200)'
          }}>
            {[
              { icon: 'fa-user-tie', label: 'ผู้วิจัยหลัก', val: paper.student_name },
              { icon: 'fa-graduation-cap', label: 'สาขาวิชา', val: DEPT_NAMES[paper.department] || paper.department },
              { icon: 'fa-users', label: 'ผู้วิจัยร่วม', val: `${paper.researcher_co1 || ''}${paper.researcher_co2 ? `, ${paper.researcher_co2}` : ''}` || '-' },
              { icon: 'fa-calendar-check', label: 'ปีการศึกษา', val: paper.academicYear },
              { icon: 'fa-vial', label: 'ประเภทงาน', val: TYPE_NAMES[paper.research_type] || paper.research_type },
              { icon: 'fa-building', label: 'หน่วยงาน', val: paper.organization || 'วิทยาลัยเทคนิคร้อยเอ็ด' },
              { icon: 'fa-hand-holding-usd', label: 'ผู้สนับสนุนทุนวิจัย', val: paper.funding_by || '-' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: '0.9rem' }}>
                <i className={`fas ${item.icon}`} style={{ color: 'var(--navy-light)', width: 18 }}></i>
                <span style={{ fontWeight: 700, color: '#555', minWidth: 100 }}>{item.label}</span>
                <span style={{ color: '#222', wordBreak: 'break-word' }}>{item.val}</span>
              </div>
            ))}
          </div>

          {/* ── Award Box ── */}
          {paper.awards && (
            <div className="award-box" style={{
              background: '#fffdf0',
              border: '2px solid var(--gold)',
              borderRadius: '14px',
              padding: '18px 22px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '18px'
            }}>
              <div style={{ fontSize: '2.2rem', color: 'var(--gold)' }}><i className="fas fa-trophy"></i></div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#a07a00', marginBottom: 4, fontWeight: 600 }}>เกียรติประวัติและรางวัล</div>
                <div style={{ color: '#856404', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{paper.awards}</div>
              </div>
            </div>
          )}

          {/* ── Content Sections ── */}
          <Section icon="fa-book" title="บทคัดย่อ">
            <AcademicContent text={paper.abstract} />
            {paper.keywords && (
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed #eee' }}>
                <span style={{ fontWeight: 700, color: '#555', marginRight: 10, fontSize: '0.9rem' }}>คำสำคัญ</span>
                {paper.keywords.split(',').map((kw, i) => (
                  <span key={i} style={{ 
                    display: 'inline-block', 
                    background: 'var(--navy-light)', 
                    color: 'white', 
                    padding: '2px 12px', 
                    borderRadius: 20, 
                    fontSize: '0.8rem', 
                    margin: '2px 4px 2px 0' 
                  }}>
                    {kw.trim()}
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section icon="fa-align-left" title="ความเป็นมาและวัตถุประสงค์">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#444', fontSize: '1rem' }}>ความเป็นมา / หลักการและเหตุผล</div>
              <AcademicContent text={paper.background} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#444', fontSize: '1rem' }}>วัตถุประสงค์การวิจัย</div>
              <AcademicContent text={paper.objectives} />
            </div>
            {paper.scope && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#444', fontSize: '1rem' }}>ขอบเขตการดำเนินงาน</div>
                <AcademicContent text={paper.scope} />
              </div>
            )}
          </Section>

          <Section icon="fa-book-open" title="ทฤษฎีที่เกี่ยวข้อง">
            <AcademicContent text={paper.theory} />
          </Section>

          <Section icon="fa-microscope" title="วิธีการดำเนินการวิจัย">
            <AcademicContent text={paper.methodology} />
          </Section>

          <Section icon="fa-poll" title="ผลการวิจัย">
            <AcademicContent text={paper.results} />
          </Section>

          <Section icon="fa-comment-dots" title="สรุป อภิปรายผล และข้อเสนอแนะ">
            {paper.discussion && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#444', fontSize: '1rem' }}>อภิปรายผล</div>
                <AcademicContent text={paper.discussion} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#444', fontSize: '1rem' }}>ประโยชน์ที่คาดว่าจะได้รับ</div>
              <AcademicContent text={paper.suggestions_use} />
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#444', fontSize: '1rem' }}>ข้อเสนอแนะในอนาคต</div>
              <AcademicContent text={paper.suggestions_next} />
            </div>
          </Section>


          {/* ── Action Buttons ── */}
          <div style={{
            marginTop: 36,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            borderTop: '1px solid var(--gray-200)',
            paddingTop: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <Link href="/" className="btn btn-primary" style={{ background: 'var(--gold)', color: 'white', minWidth: 160 }}>
                <i className="fas fa-arrow-left"></i> กลับหน้าหลัก
              </Link>
              <a href={`/api/papers/${paper.id}/download`} className="btn" style={{ background: '#d9534f', color: 'white', minWidth: 160 }}>
                <i className="fas fa-download"></i> ดาวน์โหลดไฟล์ PDF
              </a>
              <PDFPreview paperId={paper.id} />
            </div>
          </div>

          <Comments 
            paperId={paper.id} 
            initialComments={paper.comments as any} 
            currentUser={session ? { id: session.id, role: session.role } : null} 
          />
        </div>
      </div>
    </>
  );
}

function Section({ icon, title, children }: { icon: string, title: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{
        fontWeight: 700, color: 'var(--navy-dark)', margin: '32px 0 12px',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem',
        borderLeft: '6px solid var(--gold)', paddingLeft: 14
      }}>
        <i className={`fas ${icon}`} style={{ fontSize: '0.9em', color: 'var(--navy-light)' }}></i> {title}
      </div>
      <div style={{
        background: '#ffffff', padding: '24px 28px', borderRadius: '14px',
        border: '1px solid var(--gray-200)', fontSize: '1rem', lineHeight: 1.8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        {children}
      </div>
    </div>
  );
}

function AcademicContent({ text }: { text: string | null }) {
  if (!text) return <div style={{ color: '#888' }}>-</div>;

  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        // Regex to detect numbered list (1., 1.1, etc) or bullets (-, •, *)
        const listMatch = trimmed.match(/^(\d+(\.\d+)*\.|[-•*])\s+(.*)/);

        if (listMatch) {
          const marker = listMatch[1];
          const content = listMatch[3];
          return (
            <div key={i} style={{ 
              display: 'flex', 
              gap: '12px', 
              paddingLeft: '12px',
              textAlign: 'justify' 
            }}>
              <span style={{ fontWeight: 700, color: 'var(--navy-light)', minWidth: 'max-content' }}>{marker}</span>
              <span style={{ flex: 1 }}>{content}</span>
            </div>
          );
        }

        return (
          <p key={i} style={{ margin: 0, textAlign: 'justify' }}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
