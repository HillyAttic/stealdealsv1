import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
// Read from Firebase RTDB (same source the working frontend uses) instead of Firestore.
// The Admin SDK / Firestore path was returning 0 because:
//   1) No FIREBASE_SERVICE_ACCOUNT_KEY on Vercel → Admin SDK never initializes
//   2) Properties actually live in RTDB (migratedProperties/*), not Firestore
import { getAllProperties } from '@/lib/firebase';

// Force this route to be dynamic so it always fetches fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/dashboard-stats — returns aggregated property counts and breakdowns
// Reads from Firebase RTDB via the same firebase.ts module used by the public frontend
export async function GET(request: Request) {
  return requireAdminAuth(request, async () => {
    try {
      // Fetch all properties from RTDB (same data the frontend displays)
      const allProperties = await getAllProperties();

      // Count by type
      let preleasedCount = 0;
      let vacantCount = 0;
      let franchiseCount = 0;
      let plotsCount = 0;

      // Category breakdown for vacant properties
      const categoryCounts: Record<string, number> = {
        'Industrial': 0,
        'High-Street': 0,
        'Mall': 0,
        'Corporate': 0,
        'Other': 0
      };

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

        if (type === 'preleased' || type === 'pre-leased') {
          preleasedCount++;
        } else if (type === 'vacant') {
          vacantCount++;

          // Categorize vacant property
          const category = (property.vacantDetails?.category || property.category || '').toLowerCase();
          if (category.includes('industrial')) {
            categoryCounts['Industrial']++;
          } else if (category.includes('high-street') || category.includes('high street') || category.includes('street')) {
            categoryCounts['High-Street']++;
          } else if (category.includes('mall') || category.includes('shopping')) {
            categoryCounts['Mall']++;
          } else if (category.includes('corporate') || category.includes('office') || category.includes('business')) {
            categoryCounts['Corporate']++;
          } else {
            categoryCounts['Other']++;
          }
        } else if (type === 'franchise') {
          franchiseCount++;

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

      console.log(`[Dashboard API] RTDB stats: vacant=${vacantCount}, preleased=${preleasedCount}, franchise=${franchiseCount}, plots=${plotsCount}, total=${totalCount}`);

      return NextResponse.json({
        stats: {
          preleased: preleasedCount,
          vacant: vacantCount,
          franchise: franchiseCount,
          plots: plotsCount,
          total: totalCount
        },
        categoryData: {
          labels: Object.keys(categoryCounts),
          data: Object.values(categoryCounts)
        },
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
          categoryData: { labels: [], data: [] },
          franchiseData: { labels: [], data: [] }
        },
        { status: 200 }
      );
    }
  });
}
