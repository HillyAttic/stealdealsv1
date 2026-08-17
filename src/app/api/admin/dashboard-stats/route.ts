import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
// Read from Firestore (migration complete)
import { getAllProperties } from '@/lib/database/firestore-properties';

// Force this route to be dynamic so it always fetches fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/dashboard-stats — returns aggregated property counts and breakdowns
// Reads from Firestore (migration complete)
export async function GET(request: Request) {
  return requireAdminAuth(request, async () => {
    try {
      // Fetch all properties from Firestore (migration complete)
      const allProperties = await getAllProperties();

      // Count by type
      let preleasedCount = 0;
      let vacantCount = 0;
      let franchiseCount = 0;
      let plotsCount = 0;

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

      for (const property of allProperties) {
        const type = (property.propertyType || property.type || '').toLowerCase();
        // In Firestore, pre-leased properties use 'preleased' as type
        // (IDs start with PROP_PRLS_). Normalize all variants to 'preleased'.
        const isPreleased = type === 'preleased' || type === 'pre-leased' || type === 'lockable' || type === 'virtual';

        if (isPreleased) {
          preleasedCount++;
        } else if (type === 'vacant') {
          vacantCount++;
        } else if (type === 'franchise') {
          franchiseCount++;

          // Categorize franchise by segment
          const segment = property.franchiseDetails?.segment || property.segment || '';
          if (segment) {
            segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
          }

          // Categorize franchise by industry
          const industry = property.franchiseDetails?.industry || property.category || '';
          if (industryCounts.hasOwnProperty(industry)) {
            industryCounts[industry]++;
          }
        } else if (type === 'plot' || type === 'plots') {
          plotsCount++;
        }
      }

      const totalCount = preleasedCount + vacantCount + franchiseCount + plotsCount;

      console.log(`[Dashboard API] Firestore stats: vacant=${vacantCount}, preleased=${preleasedCount}, franchise=${franchiseCount}, plots=${plotsCount}, total=${totalCount}`);

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
          preleased: preleasedCount,
          vacant: vacantCount,
          franchise: franchiseCount,
          plots: plotsCount,
          total: totalCount
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
