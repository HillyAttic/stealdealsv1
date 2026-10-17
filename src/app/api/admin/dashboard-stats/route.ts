import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { db } from '@/lib/firebase-server-admin';

// Force this route to be dynamic so it always fetches fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/dashboard-stats — aggregated property counts and breakdowns
//
// Counts come from Firestore count aggregations and the breakdown from a
// field-masked franchise read. The previous version read every property document
// (347 docs / ~400KB) to tally six numbers; this reads ~13KB and never transfers
// the image and description fields the dashboard does not display.
export async function GET(request: Request) {
  return requireAdminAuth(request, async () => {
    try {
      const properties = db.collection('properties');
      const countOf = (type: string) => properties.where('type', '==', type).count().get();

      const [vacant, preleased, franchise, plots, franchiseDocs] = await Promise.all([
        countOf('vacant'),
        countOf('preleased'),
        countOf('franchise'),
        countOf('plot'),
        properties
          .where('type', '==', 'franchise')
          .select('franchiseDetails.segment', 'franchiseDetails.industry', 'segment')
          .get(),
      ]);

      const stats = {
        vacant: vacant.data().count,
        preleased: preleased.data().count,
        franchise: franchise.data().count,
        plots: plots.data().count,
      };

      // Segment breakdown for franchises
      const segmentCounts: Record<string, number> = {};

      // Industry breakdown for franchises
      const industryCounts: Record<string, number> = {
        'Education': 0,
        'F&B': 0,
        'Fashion': 0,
        'Pharmaceutical': 0,
        'Retail': 0,
        'Sports, Fitness & Entertainments': 0
      };

      franchiseDocs.forEach(doc => {
        const data = doc.data();
        const details = data.franchiseDetails || {};

        const segment = details.segment || data.segment || '';
        if (segment) {
          segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
        }

        const industry = details.industry || '';
        if (Object.prototype.hasOwnProperty.call(industryCounts, industry)) {
          industryCounts[industry]++;
        }
      });

      // Sort segments by count (descending)
      const sortedSegments = Object.entries(segmentCounts)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => {
          acc.labels.push(key);
          acc.data.push(value);
          return acc;
        }, { labels: [] as string[], data: [] as number[] });

      return NextResponse.json({
        stats: {
          ...stats,
          total: stats.vacant + stats.preleased + stats.franchise + stats.plots
        },
        segmentData: sortedSegments,
        franchiseData: {
          labels: Object.keys(industryCounts),
          data: Object.values(industryCounts)
        }
      });
    } catch (error: any) {
      console.error('[Dashboard API] Error fetching stats:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch dashboard stats',
          stats: { preleased: 0, vacant: 0, franchise: 0, plots: 0, total: 0 },
          segmentData: { labels: [], data: [] },
          franchiseData: { labels: [], data: [] }
        },
        { status: 200 }
      );
    }
  });
}
