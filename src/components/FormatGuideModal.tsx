'use client';

import React from 'react';

interface FormatGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormatGuideModal: React.FC<FormatGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const examples = [
    {
      title: 'จัดระยะห่างภาษาไทย-อังกฤษ',
      desc: 'เพิ่มเว้นวรรคให้ตามมาตรฐานการพิมพ์งานวิจัย',
      before: 'เทคโนโลยีAIและIoT',
      after: 'เทคโนโลยี AI และ IoT',
      icon: 'fa-language'
    },
    {
      title: 'ปรับสัญลักษณ์สากล',
      desc: 'เปลี่ยนตัว x เป็นเครื่องหมายคูณ และขีดช่วงตัวเลข',
      before: 'ขนาด 10 x 20 (ปี 2566-2567)',
      after: 'ขนาด 10 × 20 (ปี 2566–2567)',
      icon: 'fa-square-root-alt'
    },
    {
      title: 'จัดระเบียบเลขข้อและหัวข้อย่อย',
      desc: 'ปรับรูปแบบลำดับโครงสร้างให้อ่านง่าย',
      before: '1)ทดสอบ\n   (2)ผลลัพธ์',
      after: '1. ทดสอบ\n(2) ผลลัพธ์',
      icon: 'fa-list-ol'
    },
    {
      title: 'ทำความสะอาดเศษอักษร (OCR)',
      desc: 'ลบเลขหน้าหรือหัวกระดาษที่ติดมาจากการก๊อป PDF',
      before: 'เนื้อหาบรรทัดแรก\n12\nเนื้อหาบรรทัดต่อมา',
      after: 'เนื้อหาบรรทัดแรก\nเนื้อหาบรรทัดต่อมา',
      icon: 'fa-broom'
    },
    {
      title: 'เว้นวรรคหลังตัวเลขหัวข้ออัตโนมัติ',
      desc: 'แก้ไขตัวเลขข้อที่พิมพ์ติดกับเนื้อหาให้อ่านง่ายขึ้น',
      before: 'วัตถุประสงค์การวิจัย\n1.เพื่อออกแบบและสร้างรถตัดหญ้าควบคุมผ่านสมาร์ทโฟน\n2.เพื่อศึกษาประสิทธิภาพของรถตัดหญ้าควบคุมผ่านสมาร์ทโฟน\n3.เพื่อศึกษาความพึงพอใจของผู้ใช้รถตัดหญ้าควบคุมผ่านสมาร์ทโฟน',
      after: 'วัตถุประสงค์การวิจัย\n1. เพื่อออกแบบและสร้างรถตัดหญ้าควบคุมผ่านสมาร์ทโฟน\n2. เพื่อศึกษาประสิทธิภาพของรถตัดหญ้าควบคุมผ่านสมาร์ทโฟน\n3. เพื่อศึกษาความพึงพอใจของผู้ใช้รถตัดหญ้าควบคุมผ่านสมาร์ทโฟน',
      icon: 'fa-list-ul'
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 76, 129, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f4c81 0%, #071e3d 100%)',
          color: 'white'
        }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
              <i className="fas fa-magic" style={{ color: '#dfa91b', marginRight: 12 }}></i>
              คู่มือการใช้ปุ่มจัดระเบียบอัจฉริยะ
            </h3>
            <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
              ตัวอย่างการปรับปรุงรูปแบบเนื้อหาเพื่อให้งานวิจัยดูเป็นมืออาชีพมากขึ้น
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {examples.map((item, idx) => (
              <div key={idx} style={{ 
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: '#e0e7ff', 
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ต้นฉบับ</div>
                    <div style={{ 
                      padding: '12px', 
                      background: '#fee2e2', 
                      color: '#991b1b', 
                      borderRadius: '8px', 
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      minHeight: '44px'
                    }}>
                      {item.before}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>หลังจัดระเบียบ</div>
                    <div style={{ 
                      padding: '12px', 
                      background: '#d1fae5', 
                      color: '#065f46', 
                      borderRadius: '8px', 
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      minHeight: '44px'
                    }}>
                      {item.after}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '32px', 
            padding: '16px', 
            background: '#fffbeb', 
            borderRadius: '12px', 
            border: '1px solid #fde68a',
            display: 'flex',
            gap: '12px'
          }}>
            <i className="fas fa-info-circle" style={{ color: '#d97706', fontSize: '1.2rem', marginTop: '2px' }}></i>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', lineHeight: 1.6 }}>
              <strong>หมายเหตุ:</strong> ระบบจะเน้นการจัดระยะห่างและสัญลักษณ์ตามมาตรฐานวิชาการ 
              โดยจะ<strong>ไม่มีการเปลี่ยนแปลงเนื้อหาหรือสำนวน</strong>ของคุณ เพื่อรักษาความถูกต้องของข้อมูลต้นฉบับครับ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="button"
            onClick={onClose}
            className="btn btn-action"
            style={{ minWidth: '120px', padding: '12px 24px' }}
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FormatGuideModal;
