import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalCount = await prisma.paper.count({ where: { status: 'PUBLISHED' } });

    const allPapers = await prisma.paper.findMany({
      where: { status: 'PUBLISHED' },
      include: { ratings: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalViews = allPapers.reduce((sum, p) => sum + p.views, 0);
    const totalDownloads = allPapers.reduce((sum, p) => sum + p.downloads, 0);

    // Default to mapping the standard codes to readable text for output
    const DEPARTMENTS: Record<string, string> = {
      'EE': 'สาขาเทคโนโลยีไฟฟ้า',
      'ET': 'สาขาเทคโนโลยีอิเล็กทรอนิกส์',
      'PT': 'สาขาเทคโนโลยีการผลิต',
      'MT': 'สาขาเทคโนโลยีเครื่องกล',
      'CT': 'สาขาเทคโนโลยีคอมพิวเตอร์'
    };

    const majorCounts: Record<string, number> = {};
    allPapers.forEach(p => {
      majorCounts[p.department] = (majorCounts[p.department] || 0) + 1;
    });
    
    // Top department name
    const topDeptCode = Object.entries(majorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    const topMajor = DEPARTMENTS[topDeptCode] || topDeptCode;

    // Latest papers (top rated format for homepage)
    const papersWithAvg = allPapers.map(p => ({
      ...p,
      avgRating: p.ratings.length > 0
        ? p.ratings.reduce((sum, r) => sum + r.score, 0) / p.ratings.length
        : 0
    }));

    // For homepage Top Rated (show only those with ratings)
    const topRated = papersWithAvg
      .filter(p => p.avgRating > 0)
      .sort((a, b) => b.avgRating - a.avgRating || b.views - a.views) // Sort by rating then views
      .slice(0, 3)
      .map(p => ({
         id: p.id,
         title: p.title_th,
         department: DEPARTMENTS[p.department] || p.department,
         year: p.academicYear,
         author: p.student_name,
         views: p.views,
         downloads: p.downloads,
         rating: p.avgRating.toFixed(1),
         abstractSnippet: p.abstract.length > 80 ? p.abstract.substring(0, 80) + '...' : p.abstract
      }));

    // Specific lists for Stats Page mapping 1-5
    const topViewedList = [...allPapers].sort((a, b) => b.views - a.views).slice(0, 5).map(p => ({ id: p.id, title: p.title_th, value: p.views }));
    const topDownloadedList = [...allPapers].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map(p => ({ id: p.id, title: p.title_th, value: p.downloads }));
    const topRatedList = papersWithAvg.filter(p => p.avgRating > 0).sort((a, b) => b.avgRating - a.avgRating).slice(0, 5).map(p => ({ id: p.id, title: p.title_th, value: p.avgRating.toFixed(1) }));

    // Latest papers (top 6)
    const latestPapers = [...papersWithAvg]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map(p => ({
         id: p.id,
         title: p.title_th,
         department: DEPARTMENTS[p.department] || p.department,
         year: p.academicYear,
         author: p.student_name,
         views: p.views,
         downloads: p.downloads,
         rating: p.avgRating.toFixed(1),
         abstractSnippet: p.abstract.length > 80 ? p.abstract.substring(0, 80) + '...' : p.abstract
      }));

    // Calculate average rating per department
    const deptStats: Record<string, { sum: number, count: number }> = {};
    papersWithAvg.forEach(p => {
      if (!deptStats[p.department]) deptStats[p.department] = { sum: 0, count: 0 };
      p.ratings.forEach(r => {
        deptStats[p.department].sum += r.score;
        deptStats[p.department].count += 1;
      });
    });

    let topRatedDeptCode = '-';
    let maxAvg = 0;
    Object.entries(deptStats).forEach(([dept, data]) => {
      const avg = data.count > 0 ? data.sum / data.count : 0;
      if (avg > maxAvg) {
        maxAvg = avg;
        topRatedDeptCode = dept;
      }
    });

    const DEPT_SHORT: Record<string, string> = {
      'EE': 'ไฟฟ้า', 'ET': 'อิเล็กทรอนิกส์', 'PT': 'การผลิต', 'MT': 'เครื่องกล', 'CT': 'คอมพิวเตอร์'
    };
    const topRatedMajor = topRatedDeptCode !== '-' 
      ? `${DEPT_SHORT[topRatedDeptCode] || topRatedDeptCode} (${maxAvg.toFixed(1)})`
      : 'ยังไม่มีคะแนน';

    return NextResponse.json({
      totalCount,
      totalViews,
      totalDownloads,
      topMajor,
      topRatedMajor,
      majorCounts, // for charting
      topRated, // for homepage
      latestPapers, // for homepage
      topViewedList,
      topDownloadedList,
      topRatedList
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
