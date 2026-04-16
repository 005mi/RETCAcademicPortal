'use client';

import { useState } from 'react';

export default function PDFPreview({ paperId }: { paperId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Link to the download API which returns the PDF file
  const pdfUrl = `/api/papers/${paperId}/download?preview=true`;

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="btn"
        style={{ 
          minWidth: 160, 
          padding: '11px 20px', 
          border: '2px solid var(--navy-light)', 
          color: 'var(--navy-light)', 
          background: 'transparent' 
        }}
      >
        <i className="fas fa-eye"></i> ดูตัวอย่างไฟล์ (Preview)
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            color: 'white'
          }}>
            <h3 style={{ margin: 0 }}>ตัวอย่างงานวิจัย</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: 'var(--navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Preview"
            />
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              หากพบปัญหาในการแสดงผล กรุณาใช้ปุ่มดาวน์โหลดหลักแทน
            </p>
          </div>
        </div>
      )}
    </>
  );
}
