'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';

// Department colors matched to each department
const DEPT_COLORS: Record<string, string> = {
  'EE': '#d97706',  // ไฟฟ้า = ส้ม
  'ET': '#2563eb',  // อิเล็กทรอนิกส์ = ฟ้า
  'PT': '#6b7280',  // การผลิต = เทา
  'MT': '#dc2626',  // เครื่องกล = แดง
  'CT': '#db2777',  // คอมพิวเตอร์ = ชมพู
};
const DEPT_NAMES: Record<string, string> = {
  'EE': 'สาขาเทคโนโลยีไฟฟ้า', 'ET': 'สาขาเทคโนโลยีอิเล็กทรอนิกส์', 'PT': 'สาขาเทคโนโลยีการผลิต', 'MT': 'สาขาเทคโนโลยีเครื่องกล', 'CT': 'สาขาเทคโนโลยีคอมพิวเตอร์'
};
const DEPT_SHORT: Record<string, string> = {
  'EE': 'ไฟฟ้า', 'ET': 'อิเล็กทรอนิกส์', 'PT': 'การผลิต', 'MT': 'เครื่องกล', 'CT': 'คอมพิวเตอร์'
};

export default function StatsPage() {
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

  if (loading) {
    return <div className="empty-state" style={{ margin: 40 }}>กำลังโหลดข้อมูลสถิติ...</div>;
  }

  // Prepare chart data — color matched per department code
  const chartData = Object.keys(stats?.majorCounts || {}).map((key) => ({
    name: DEPT_SHORT[key] || key,
    fullName: DEPT_NAMES[key] || key,
    value: stats.majorCounts[key],
    color: DEPT_COLORS[key] || '#94a3b8'
  }));

  return (
    <>
      <div className="page-header" style={{ paddingBottom: 60 }}>
        <h1><i className="fas fa-chart-bar"></i> สถิติภาพรวม</h1>
        <p>ข้อมูลสรุปผลงานวิจัยในระบบ</p>
      </div>

      <div className="main-container" style={{ paddingTop: 0, marginTop: -10, position: 'relative', zIndex: 10 }}>
        {/* Top Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-blue-light" style={{ flexShrink: 0 }}><i className="fas fa-book-open"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>ผลงานทั้งหมด</h3>
              <p style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats.totalCount}</p>
            </div>
          </div>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-green-light" style={{ flexShrink: 0 }}><i className="fas fa-eye"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>ยอดเข้าชมรวม</h3>
              <p style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats.totalViews}</p>
            </div>
          </div>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-purple-light" style={{ flexShrink: 0 }}><i className="fas fa-download"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>ยอดดาวน์โหลดรวม</h3>
              <p style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats.totalDownloads}</p>
            </div>
          </div>
          <div className="summary-card" style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', gap: 20 }}>
            <div className="summary-icon bg-gold-light" style={{ flexShrink: 0 }}><i className="fas fa-star"></i></div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>สาขาคะแนนสูงสุด</h3>
              <p style={{ fontSize: (stats.topRatedMajor?.length || 0) > 12 ? '1.4rem' : '1.8rem', color: '#0f172a', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats.topRatedMajor}</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="stats-grid">
          <div className="chart-card">
            <h3 style={{ color: 'var(--navy)', marginBottom: 24, fontSize: '1.1rem' }}>จำนวนผลงานตามสาขาวิชา</h3>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11 }} 
                    angle={-20} 
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [value, 'จำนวนผลงาน']}
                    labelFormatter={(label: any) => {
                      const found = chartData.find(d => d.name === label);
                      return found ? found.fullName : label;
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3 style={{ color: 'var(--navy)', marginBottom: 24, fontSize: '1.1rem' }}>สัดส่วนสาขาวิชา</h3>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} cx="50%" cy="42%" 
                    innerRadius={55} outerRadius={95} 
                    paddingAngle={3} dataKey="value" 
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} 
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [value, 'ผลงาน']}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    formatter={(value: any) => {
                      const found = chartData.find(d => d.name === value);
                      return found ? found.fullName : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Rankings */}
        <div className="ranking-grid">
          <div className="ranking-card">
            <h3><i className="fas fa-eye" style={{ color: 'var(--navy-light)' }}></i> ยอดเข้าชมสูงสุด</h3>
            <ul className="ranking-list">
              {(stats.topViewedList || []).map((p: any, i: number) => (
                <li key={p.id} className="ranking-item">
                  <div className={`rank-place ${i < 3 ? `rank-${i+1}` : ''}`}>{i + 1}</div>
                  <Link href={`/papers/${p.id}`} className="rank-title" title={p.title}>{p.title}</Link>
                  <span className="rank-val" style={{ color: 'var(--navy-light)' }}>{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ranking-card">
            <h3><i className="fas fa-download" style={{ color: 'var(--navy-light)' }}></i> ยอดดาวน์โหลดสูงสุด</h3>
            <ul className="ranking-list">
              {(stats.topDownloadedList || []).map((p: any, i: number) => (
                <li key={p.id} className="ranking-item">
                  <div className={`rank-place ${i < 3 ? `rank-${i+1}` : ''}`}>{i + 1}</div>
                  <Link href={`/papers/${p.id}`} className="rank-title" title={p.title}>{p.title}</Link>
                  <span className="rank-val" style={{ color: 'var(--navy-light)' }}>{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ranking-card">
            <h3><i className="fas fa-star" style={{ color: 'var(--navy-light)' }}></i> คะแนนสูงสุด</h3>
            <ul className="ranking-list">
              {(stats.topRatedList || []).map((p: any, i: number) => (
                <li key={p.id} className="ranking-item">
                  <div className={`rank-place ${i < 3 ? `rank-${i+1}` : ''}`}>{i + 1}</div>
                  <Link href={`/papers/${p.id}`} className="rank-title" title={p.title}>{p.title}</Link>
                  <span className="rank-val" style={{ color: 'var(--navy-light)' }}>{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
