'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaperInteractions({ paperId, userHasFavorited, userRating }: {
  paperId: string;
  userHasFavorited: boolean;
  userRating: number;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(userHasFavorited);
  const [rating, setRating] = useState(userRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleFavorite = async () => {
    const res = await fetch(`/api/papers/${paperId}/favorite`, { method: 'POST' });
    if (res.ok) setFavorited(!favorited);
  };

  const submitRating = async (score: number) => {
    if (isRating) return;
    setIsRating(true);
    try {
      const res = await fetch(`/api/papers/${paperId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
      });
      if (res.ok) {
        setRating(score);
        router.refresh(); 
      }
    } catch (error) {
      console.error('Submit rating error:', error);
    } finally {
      setIsRating(false);
    }
  };

  const clearRating = async () => {
    setIsRating(true);
    try {
      const res = await fetch(`/api/papers/${paperId}/rate`, { 
        method: 'DELETE',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const data = await res.json();
      if (res.ok) {
        setRating(0);
        setShowConfirmClear(false);
        router.refresh();
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
    } finally {
      setIsRating(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', padding: '20px', background: '#f8faff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          type="button"
          onClick={toggleFavorite} 
          className="btn-favorite" 
          style={{ 
            background: favorited ? '#fecdd3' : 'white', 
            border: '1px solid #fda4af', 
            padding: '10px 18px', 
            borderRadius: 10, 
            cursor: 'pointer', 
            fontFamily: 'Sarabun', 
            fontWeight: 700, 
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          {favorited ? '❤️ อยู่ในรายการโปรด' : '🤍 เพิ่มในรายการโปรด'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '6px 16px', borderRadius: 10, border: '1px solid #edf2f7' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4a5568' }}>ให้คะแนน</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="rating-stars" style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  type="button"
                  key={score}
                  onClick={() => submitRating(score)}
                  onMouseEnter={() => setHoverRating(score)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', transition: 'transform 0.1s', padding: 2, opacity: score <= (hoverRating || rating) ? 1 : 0.2 }}
                >
                  ⭐
                </button>
              ))}
            </div>
            {rating > 0 && <span style={{ fontSize: '0.85rem', color: '#718096', marginLeft: 6, fontWeight: 600 }}>({rating}/5)</span>}
          </div>
        </div>
      </div>

      {rating > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
          {!showConfirmClear ? (
            <button 
              type="button"
              onClick={() => setShowConfirmClear(true)}
              style={{ 
                background: '#fff5f5', 
                border: '1px solid #feb2b2', 
                color: '#c53030', 
                fontSize: '0.85rem', 
                fontWeight: 700,
                cursor: 'pointer', 
                padding: '6px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              title="ยกเลิกการให้คะแนน"
            >
              <i className="fas fa-times-circle"></i> ยกเลิกคะแนนที่คุณให้
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#c53030', fontWeight: 700 }}>ยืนยันลบคะแนน?</span>
              <button 
                type="button"
                onClick={clearRating}
                disabled={isRating}
                style={{ 
                  background: '#c53030', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  cursor: isRating ? 'wait' : 'pointer'
                }}
              >
                {isRating ? 'กำลังลบ...' : 'ใช่, ลบเลย'}
              </button>
              <button 
                type="button"
                onClick={() => setShowConfirmClear(false)}
                disabled={isRating}
                style={{ 
                  background: '#edf2f7', 
                  color: '#4a5568', 
                  border: '1px solid #cbd5e0', 
                  padding: '5px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ไม่ลบแล้ว
              </button>
            </div>
          )}
          {!showConfirmClear && <span style={{ fontSize: '0.75rem', color: '#a0aec0', marginLeft: '12px' }}>* กดเพื่อยกเลิกหากคุณให้คะแนนผิด</span>}
        </div>
      )}
    </div>
  );
}
