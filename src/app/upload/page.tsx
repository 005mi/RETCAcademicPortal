'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FormatGuideModal from '@/components/FormatGuideModal';

const DEPARTMENTS = [
  { key: 'EE', label: 'สาขาเทคโนโลยีไฟฟ้า' },
  { key: 'ET', label: 'สาขาเทคโนโลยีอิเล็กทรอนิกส์' },
  { key: 'PT', label: 'สาขาเทคโนโลยีการผลิต' },
  { key: 'MT', label: 'สาขาเทคโนโลยีเครื่องกล' },
  { key: 'CT', label: 'สาขาเทคโนโลยีคอมพิวเตอร์' }
];

const RESEARCH_TYPES = [
  { key: 'classroom', label: 'วิจัยในชั้นเรียน' },
  { key: 'r_d', label: 'วิจัยและพัฒนา (R&D)' },
  { key: 'innovation', label: 'นวัตกรรมและสิ่งประดิษฐ์' },
  { key: 'survey', label: 'วิจัยเชิงสำรวจ' },
  { key: 'other', label: 'อื่นๆ' }
];

// Utility: Format Academic Text
function formatAcademicText(text: string) {
  if (!text) return '';

  let processed = text;

  // 1. Initial cleanup of hidden characters (Soft-hyphens, Zero-width spaces)
  processed = processed.replace(/[\u00AD\u200B\u200C\u200D]/g, '');

  let lines = processed.split('\n');

  // 2. OCR & PDF Cleanup Pass
  lines = lines.filter(line => {
    const trimmed = line.trim();
    // Remove isolated page numbers (lines consisting of only numeric digits)
    if (/^\d+$/.test(trimmed)) return false;
    // Remove isolated branding headers often found in PDFs
    if (trimmed === 'วิทยาลัยเทคนิคร้อยเอ็ด' || trimmed === 'Roi Et Technical College') return false;
    return true;
  });

  // 3. Line-by-line Processing
  lines = lines.map(line => {
    let l = line.trim();
    if (!l) return '';

    // 3.1 Thai-English Spacing (Add space between Thai and English/Numbers)
    l = l.replace(/([ก-๙])([a-zA-Z0-9])/g, '$1 $2');
    l = l.replace(/([a-zA-Z0-9])([ก-๙])/g, '$1 $2');

    // 3.2 Symbol Normalization
    l = l.replace(/(\d)\s*[xX]\s*(\d)/g, '$1 × $2'); // Multiplication x -> ×
    l = l.replace(/(\d)-(\d)/g, '$1–$2');           // Range - -> – (En-dash)
    l = l.replace(/\.\.\./g, '…');                  // Ellipsis ... -> …

    // 3.3 Smart Bullet Normalization
    // Normalizes: 1), (1), 1., -, •, * to have a clean space after
    l = l.replace(/^(\(?\d+[\.\)]|\d+\.\d+|\d+\.\d+\.\d+|[-•*])\s*/, '$1 ');

    return l;
  });

  // 4. Final filter for redundant empty lines and join
  return lines
    .filter((line, i, arr) => {
      // Remove more than one consecutive empty line
      if (line === '' && i > 0 && arr[i - 1] === '') return false;
      return true;
    })
    .join('\n')
    .trim();
}

function SmartTextarea({ name, label, value, onChange, required = false, rows = 3, placeholder = "", onOpenGuide }: { name: string, label: string, value: string, onChange: (v: string) => void, required?: boolean, rows?: number, placeholder?: string, onOpenGuide?: () => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [value]);

  const handleFormat = () => {
    const formatted = formatAcademicText(value);
    onChange(formatted);
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ margin: 0 }}>{label} {required && <span style={{ color: 'var(--red)' }}>*</span>}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            type="button" 
            onClick={onOpenGuide}
            style={{ fontSize: '0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: '2px 4px' }}
            title="ดูตัวอย่างการจัดระเบียบ"
          >
            <i className="fas fa-question-circle"></i>
          </button>
          <button 
            type="button" 
            onClick={handleFormat}
            style={{ fontSize: '0.75rem', background: 'var(--gray-100)', border: '1px solid var(--gray-300)', padding: '2px 8px', borderRadius: 4, cursor: 'pointer', color: 'var(--navy)' }}
            title="จัดเรียงข้อความให้อัตโนมัติ"
          >
            <i className="fas fa-magic"></i> จัดระเบียบ
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        className="form-control"
        required={required}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onBlur={autoResize}
        style={{ overflow: 'hidden', resize: 'none', lineHeight: '1.6', transition: 'height 0.1s ease' }}
      />
    </div>
  );
}

function UploadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Form States
  const [titleTh, setTitleTh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [department, setDepartment] = useState('EE');
  const [researchType, setResearchType] = useState('classroom');
  const [academicYear, setAcademicYear] = useState('2568');
  const [organization, setOrganization] = useState('วิทยาลัยเทคนิคร้อยเอ็ด');
  
  const [studentName, setStudentName] = useState('');
  const [researcherCo1, setResearcherCo1] = useState('');
  const [researcherCo2, setResearcherCo2] = useState('');
  const [fundingBy, setFundingBy] = useState('');
  const [awards, setAwards] = useState('');
  
  const [abstract, setAbstract] = useState('');
  const [background, setBackground] = useState('');
  const [objectives, setObjectives] = useState('');
  const [scope, setScope] = useState('');
  const [theory, setTheory] = useState('');
  const [methodology, setMethodology] = useState('');
  const [results, setResults] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [suggestionsUse, setSuggestionsUse] = useState('');
  const [suggestionsNext, setSuggestionsNext] = useState('');
  const [keywords, setKeywords] = useState('');
  const [otherInfo, setOtherInfo] = useState('');

  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Draft Persistence: Load
  useEffect(() => {
    if (!editId) {
      const saved = localStorage.getItem('upload_draft');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.titleTh) setTitleTh(draft.titleTh);
          if (draft.titleEn) setTitleEn(draft.titleEn);
          if (draft.department) setDepartment(draft.department);
          if (draft.researchType) setResearchType(draft.researchType);
          if (draft.academicYear) setAcademicYear(draft.academicYear);
          if (draft.organization) setOrganization(draft.organization);
          if (draft.studentName) setStudentName(draft.studentName);
          if (draft.researcherCo1) setResearcherCo1(draft.researcherCo1);
          if (draft.researcherCo2) setResearcherCo2(draft.researcherCo2);
          if (draft.fundingBy) setFundingBy(draft.fundingBy);
          if (draft.awards) setAwards(draft.awards);
          if (draft.abstract) setAbstract(draft.abstract);
          if (draft.background) setBackground(draft.background);
          if (draft.objectives) setObjectives(draft.objectives);
          if (draft.scope) setScope(draft.scope);
          if (draft.theory) setTheory(draft.theory);
          if (draft.methodology) setMethodology(draft.methodology);
          if (draft.results) setResults(draft.results);
          if (draft.discussion) setDiscussion(draft.discussion);
          if (draft.suggestionsUse) setSuggestionsUse(draft.suggestionsUse);
          if (draft.suggestionsNext) setSuggestionsNext(draft.suggestionsNext);
          if (draft.keywords) setKeywords(draft.keywords);
          if (draft.otherInfo) setOtherInfo(draft.other_info || '');
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [editId]);

  // Draft Persistence: Save
  useEffect(() => {
    if (!editId && !loading) {
      const draft = {
        titleTh, titleEn, department, researchType, academicYear, organization,
        studentName, researcherCo1, researcherCo2, fundingBy, awards,
        abstract, background, objectives, scope, theory, methodology, results, discussion,
        suggestionsUse, suggestionsNext, keywords, otherInfo
      };
      localStorage.setItem('upload_draft', JSON.stringify(draft));
    }
  }, [
    editId, loading, titleTh, titleEn, department, researchType, academicYear, organization,
    studentName, researcherCo1, researcherCo2, fundingBy, awards,
    abstract, background, objectives, scope, theory, methodology, results, discussion,
    suggestionsUse, suggestionsNext, keywords, otherInfo
  ]);

  // Fetch User Role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const { user } = await res.json();
          setUserRole(user?.role || null);
        }
      } catch (err) {
        console.error('Failed to fetch user session');
      }
    };
    fetchUser();
  }, []);

  // Load Existing Data for Editing
  useEffect(() => {
    if (editId) {
      const fetchPaper = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/papers/${editId}`);
          if (res.ok) {
            const { paper } = await res.json();
            setTitleTh(paper.title_th || '');
            setTitleEn(paper.title_en || '');
            setDepartment(paper.department || 'EE');
            setResearchType(paper.research_type || 'classroom');
            setAcademicYear(paper.academicYear?.toString() || '2568');
            setOrganization(paper.organization || 'วิทยาลัยเทคนิคร้อยเอ็ด');
            setStudentName(paper.student_name || '');
            setResearcherCo1(paper.researcher_co1 || '');
            setResearcherCo2(paper.researcher_co2 || '');
            setFundingBy(paper.funding_by || '');
            setAwards(paper.awards || '');
            setAbstract(paper.abstract || '');
            setBackground(paper.background || '');
            setObjectives(paper.objectives || '');
            setScope(paper.scope || '');
            setTheory(paper.theory || '');
            setMethodology(paper.methodology || '');
            setResults(paper.results || '');
            setDiscussion(paper.discussion || '');
            setSuggestionsUse(paper.suggestions_use || '');
            setSuggestionsNext(paper.suggestions_next || '');
            setKeywords(paper.keywords || '');
            setOtherInfo(paper.other_info || '');
          } else {
            setError('ไม่สามารถโหลดข้อมูลเดิมได้');
          }
        } catch (err) {
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
          setLoading(false);
        }
      };
      fetchPaper();
    }
  }, [editId]);

  const handleAIAnalyze = async () => {
    if (!pdfFile) {
      setError('กรุณาเลือกไฟล์ PDF ก่อนใช้ระบบ AI วิเคราะห์');
      return;
    }

    setAnalyzing(true); setError(''); setSuccess('');
    
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const res = await fetch('/api/papers/analyze', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { result } = await res.json();
        
        if (result.title_th) setTitleTh(result.title_th);
        if (result.title_en) setTitleEn(result.title_en);
        if (result.abstract) setAbstract(result.abstract);
        if (result.background) setBackground(result.background);
        if (result.objectives) setObjectives(result.objectives);
        if (result.scope) setScope(result.scope);
        if (result.keywords) setKeywords(result.keywords);
        if (result.theory) setTheory(result.theory);
        if (result.methodology) setMethodology(result.methodology);
        if (result.results) setResults(result.results);
        if (result.discussion) setDiscussion(result.discussion);
        if (result.suggestions_use) setSuggestionsUse(result.suggestions_use);
        if (result.suggestions_next) setSuggestionsNext(result.suggestions_next);

        setSuccess('AI ได้วิเคราะห์และเติมข้อมูลครบทุกหัวข้อวิจัยแล้ว กรุณาตรวจสอบความถูกต้องอีกครั้ง');
      } else {
        const data = await res.json();
        setError(data.error || 'AI ไม่สามารถวิเคราะห์ไฟล์ได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('pdf_file') as File;
    
    if (file && file.size > 10 * 1024 * 1024) {
      setError('ไฟล์ PDF ต้องมีขนาดไม่เกิน 10MB');
      setLoading(false);
      return;
    }
    
    try {
      const endpoint = editId ? `/api/papers/${editId}` : '/api/papers';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, { method, body: formData });
      if (res.ok) {
        setSuccess(editId ? 'ปรับปรุงข้อมูลสำเร็จแล้ว' : 'ส่งผลงานสำเร็จแล้ว กรุณารอแอดมินตรวจสอบและอนุมัติ');
        if (!editId) localStorage.removeItem('upload_draft');
        setTimeout(() => router.push(editId ? `/papers/${editId}` : '/my-papers'), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'บันทึกไม่สำเร็จ');
      }
    } catch {
      setError('เกิดข้อผิดพลาดระหว่างบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon, title }: { icon: string, title: string }) => (
    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', borderBottom: '2px solid var(--gray-200)', paddingBottom: 8, marginBottom: 20, marginTop: 32 }}>
      <i className={`fas ${icon}`} style={{ marginRight: 8, color: 'var(--gray-500)' }}></i> {title}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh', paddingBottom: 60 }}>
      {loading && editId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--navy)' }}></i>
          <p>กำลังโหลดข้อมูลเดิม...</p>
        </div>
      )}

      <div className="page-header" style={{ paddingBottom: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem' }}>
            <i className={editId ? "fas fa-edit" : "fas fa-cloud-upload-alt"}></i> 
            {editId ? ' แก้ไขผลงานวิชาการ' : ' เพิ่มผลงานวิชาการ'}
          </h1>
          <p>{editId ? 'ตรวจสอบและปรับปรุงข้อมูลงานวิจัยของคุณ' : 'กรอกข้อมูลผลงานวิจัยของคุณเพื่อเผยแพร่ในระบบ'}</p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: 900, marginTop: -10, padding: '40px 5%', position: 'relative', zIndex: 10 }}>
        {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        {success && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {success}</div>}

        {userRole === 'ADMIN' && !editId && (
          <div style={{ background: 'var(--navy-light)', color: 'white', padding: 20, borderRadius: 12, marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fas fa-magic"></i> ระบบช่วยเติมข้อมูลอัตโนมัติ (AI Auto-fill)
              </h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                แนบไฟล์ PDF แล้วกดวิเคราะห์เพื่อให้ AI ช่วยดึงข้อมูลสำคัญมากรอกให้คุณทันที
              </p>
            </div>
            <button 
              type="button" 
              onClick={handleAIAnalyze} 
              disabled={analyzing || !pdfFile}
              className="btn btn-gold"
              style={{ minWidth: 160, padding: '12px 20px', fontSize: '1rem', border: 'none', color: 'var(--navy-dark)' }}
            >
              {analyzing ? <><i className="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์...</> : <><i className="fas fa-robot"></i> วิเคราะห์ด้วย AI</>}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <SectionTitle icon="fa-info-circle" title="1. ข้อมูลพื้นฐาน" />
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>ชื่อผลงานวิจัย (ไทย) <span style={{ color: 'var(--red)' }}>*</span></label>
              <input name="title_th" className="form-control" value={titleTh} onChange={e => setTitleTh(e.target.value)} required placeholder="กรอกชื่อภาษาไทย" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>ชื่อผลงานวิจัย (อังกฤษ)</label>
              <input name="title_en" className="form-control" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="English Title" />
            </div>
            <div className="form-group">
              <label>สาขาวิชา/หน่วยงาน <span style={{ color: 'var(--red)' }}>*</span></label>
              <select name="department" className="form-control" value={department} onChange={e => setDepartment(e.target.value)} required>
                {DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>ประเภทงานวิจัย <span style={{ color: 'var(--red)' }}>*</span></label>
              <select name="research_type" className="form-control" value={researchType} onChange={e => setResearchType(e.target.value)} required>
                {RESEARCH_TYPES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>ปีการศึกษา (พ.ศ.) <span style={{ color: 'var(--red)' }}>*</span></label>
              <input name="academicYear" type="number" className="form-control" value={academicYear} onChange={e => setAcademicYear(e.target.value)} min="2540" max="2600" required placeholder="เช่น 2568" />
            </div>
            <div className="form-group">
              <label>หน่วยงาน/วิทยาลัย <span style={{ color: 'var(--red)' }}>*</span></label>
              <input name="organization" className="form-control" value={organization} onChange={e => setOrganization(e.target.value)} required />
            </div>
          </div>

          <SectionTitle icon="fa-users" title="2. ทีมผู้วิจัยและผู้สนับสนุน" />
          <div className="form-grid">
            <div className="form-group">
              <label>ชื่อนักวิจัยหลัก <span style={{ color: 'var(--red)' }}>*</span></label>
              <input name="student_name" className="form-control" value={studentName} onChange={e => setStudentName(e.target.value)} required placeholder="ชื่อ-นามสกุล" />
            </div>
            <div className="form-group">
              <label>นักวิจัยร่วมคนที่ 1</label>
              <input name="researcher_co1" className="form-control" value={researcherCo1} onChange={e => setResearcherCo1(e.target.value)} placeholder="ชื่อ-นามสกุล (ถ้ามี)" />
            </div>
            <div className="form-group">
              <label>นักวิจัยร่วมคนที่ 2</label>
              <input name="researcher_co2" className="form-control" value={researcherCo2} onChange={e => setResearcherCo2(e.target.value)} placeholder="ชื่อ-นามสกุล (ถ้ามี)" />
            </div>
            <div className="form-group">
              <label>ผู้สนับสนุนทุนวิจัย</label>
              <input name="funding_by" className="form-control" value={fundingBy} onChange={e => setFundingBy(e.target.value)} placeholder="ระบุผู้สนับสนุน (ถ้ามี)" />
            </div>
          </div>
          
          <SmartTextarea name="awards" label="รางวัลที่เคยได้รับ/เกียรติประวัติ" value={awards} onChange={setAwards} rows={2} placeholder="ระบุรางวัลหรือเกียรติประวัติที่ได้รับ" onOpenGuide={() => setShowGuide(true)} />

          <SectionTitle icon="fa-align-left" title="3. เนื้อหาทางวิชาการ" />
          <SmartTextarea name="abstract" label="บทคัดย่อ (Abstract)" value={abstract} onChange={setAbstract} required rows={6} onOpenGuide={() => setShowGuide(true)} />
          <div className="form-group">
            <label>คำสำคัญ (Keywords)</label>
            <input name="keywords" className="form-control" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="เช่น AI, IoT, ร้อยเอ็ด" />
          </div>
          <SmartTextarea name="background" label="ความเป็นมา/หลักการและเหตุผล" value={background} onChange={setBackground} rows={4} onOpenGuide={() => setShowGuide(true)} />
          <SmartTextarea name="objectives" label="วัตถุประสงค์การวิจัย" value={objectives} onChange={setObjectives} rows={4} onOpenGuide={() => setShowGuide(true)} />
          <SmartTextarea name="scope" label="ขอบเขตการวิจัย" value={scope} onChange={setScope} rows={3} onOpenGuide={() => setShowGuide(true)} />
          <SmartTextarea name="suggestions_use" label="ประโยชน์ที่คาดว่าจะได้รับ" value={suggestionsUse} onChange={setSuggestionsUse} rows={3} onOpenGuide={() => setShowGuide(true)} />
          
          <SmartTextarea name="theory" label="ทฤษฎีที่เกี่ยวข้อง" value={theory} onChange={setTheory} rows={4} onOpenGuide={() => setShowGuide(true)} />
          <SmartTextarea name="methodology" label="วิธีการดำเนินการวิจัย" value={methodology} onChange={setMethodology} rows={5} onOpenGuide={() => setShowGuide(true)} />
          <SmartTextarea name="results" label="ผลการวิจัย" value={results} onChange={setResults} rows={5} onOpenGuide={() => setShowGuide(true)} />
          <SmartTextarea name="discussion" label="อภิปรายผล" value={discussion} onChange={setDiscussion} rows={4} onOpenGuide={() => setShowGuide(true)} />
          
          <SmartTextarea name="suggestions_next" label="ข้อเสนอแนะในการวิจัยครั้งต่อไป" value={suggestionsNext} onChange={setSuggestionsNext} rows={3} onOpenGuide={() => setShowGuide(true)} />
          

          <SectionTitle icon="fa-file-pdf" title="4. ไฟล์แนบ" />
          <div className="form-group" style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 8, border: '1px dashed var(--gray-300)' }}>
            <label>ไฟล์เอกสาร PDF ฉบับเต็ม {editId ? '(หากต้องการเปลี่ยนไฟล์)' : <span style={{ color: 'var(--red)' }}>*</span>}</label>
            <input 
              name="pdf_file" 
              type="file" 
              accept=".pdf" 
              className="form-control" 
              required={!editId} 
              style={{ background: 'white' }} 
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setPdfFile(file);
              }}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 8 }}>
              อัปโหลดเฉพาะไฟล์นามสกุล .pdf เท่านั้น (จำกัดไม่เกิน 10MB)
            </p>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
            <button type="submit" disabled={loading || analyzing} className="btn btn-action" style={{ flex: 1, padding: 14, fontSize: '1.05rem' }}>
              <i className={loading ? "fas fa-spinner fa-spin" : (editId ? "fas fa-save" : "fas fa-paper-plane")}></i> 
              {loading ? 'กำลังบันทึก...' : (editId ? ' บันทึกการแก้ไข' : ' บันทึกข้อมูลและส่งตรวจสอบ')}
            </button>
            <Link href="/" className="btn btn-outline" style={{ color: 'var(--gray-600)', borderColor: 'var(--gray-300)' }}>
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
      
      <FormatGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div>กำลังโหลด...</div>}>
      <UploadForm />
    </Suspense>
  );
}
