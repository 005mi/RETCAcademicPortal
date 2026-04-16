'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  user: {
    username: string;
  };
}

interface CommentsProps {
  paperId: string;
  initialComments: Comment[];
  currentUser: {
    id: string;
    role: string;
  } | null;
}

export default function Comments({ paperId, initialComments, currentUser }: CommentsProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        alert('เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('เกิดข้อผิดพลาดในการลบควมคิดเห็น');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comments-section" style={{ marginTop: 38, borderTop: '2px solid #e2e8f0', paddingTop: '28px' }}>
      <h3 style={{ color: 'var(--navy-dark)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="fas fa-comments"></i> ความคิดเห็น ({initialComments.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {initialComments.map((c) => {
          const isAuthor = currentUser?.id === c.userId;
          const isAdmin = currentUser?.role === 'ADMIN';

          return (
            <div key={c.id} style={{ background: '#fafafa', borderLeft: '4px solid var(--navy-light)', padding: '14px 18px', borderRadius: 8, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: 'var(--navy-light)', fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-user-circle"></i> {c.user.username}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <small style={{ color: '#999', fontSize: '0.8rem' }}>
                      {new Date(c.createdAt).toLocaleDateString('th-TH')}
                    </small>
                    {c.isEdited && (
                      <small style={{ color: 'var(--blue)', fontSize: '0.7rem', fontStyle: 'italic' }}>
                        (แก้ไขแล้ว)
                      </small>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isAuthor && editingId !== c.id && (
                      <button 
                        onClick={() => startEditing(c)}
                        style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '0.85rem' }}
                        title="แก้ไข"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}
                    {(isAuthor || isAdmin) && (
                      <button 
                        onClick={() => handleDelete(c.id)}
                        style={{ border: 'none', background: 'none', color: '#d9534f', cursor: 'pointer', fontSize: '0.85rem' }}
                        title="ลบ"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {editingId === c.id ? (
                <div style={{ marginTop: 10 }}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #ddd', fontSize: '0.92rem' }}
                    rows={3}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button 
                      onClick={() => handleUpdate(c.id)}
                      disabled={loading}
                      style={{ background: 'var(--navy-light)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 6, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                      บันทึก
                    </button>
                    <button 
                      onClick={cancelEditing}
                      style={{ background: '#eee', color: '#666', border: 'none', padding: '6px 16px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap' }}>{c.content}</p>
              )}
            </div>
          );
        })}
      </div>

      {currentUser ? (
        <form action={`/api/papers/${paperId}/comment`} method="POST" style={{ marginTop: 20, background: 'rgba(44, 117, 168, 0.05)', padding: '20px 22px', borderRadius: '14px', border: '1px solid rgba(44, 117, 168, 0.1)' }}>
          <label style={{ fontWeight: 700, color: '#555', display: 'block', marginBottom: 10, fontSize: '0.92rem' }}>
            <i className="fas fa-pen"></i> แสดงความคิดเห็น
          </label>
          <textarea name="content" required rows={3} style={{
            width: '100%', padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: '0.95rem', background: 'white', resize: 'vertical'
          }} placeholder="เขียนความคิดเห็นของคุณที่นี่..."></textarea>
          <button type="submit" style={{
            marginTop: 10, padding: '10px 24px', background: 'var(--navy-light)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer'
          }}>
            <i className="fas fa-paper-plane"></i> ส่งความคิดเห็น
          </button>
        </form>
      ) : (
        <p style={{ textAlign: 'center', color: '#888', marginTop: 20, background: '#f5f5f5', padding: 14, borderRadius: 8, fontSize: '0.9rem' }}>
          <a href="/login" style={{ color: 'var(--navy-light)', fontWeight: 700 }}>เข้าสู่ระบบ</a> เพื่อแสดงความคิดเห็น
        </p>
      )}
    </div>
  );
}
