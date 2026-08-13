import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { db } from '@/lib/firebase-server-admin';

// GET /api/admin/dashboard-stats — returns aggregated property counts and breakdowns
// Uses Firebase Admin SDK (bypasses security rules) so it works regardless of deployed rules
export async function GET(request: Request) {
  return requireAdminAuth(request, async () => {
    try {
      const propertiesCol = db.collection('properties');

      // Fetch all property type counts in parallel
      const [preleasedSnapshot, vacantSnapshot, franchiseSnapshot, plotsSnapshot] = await Promise.all([
        propertiesCol.where('type', '==', 'preleased').get(),
        propertiesCol.where('type', '==', 'vacant').get(),
        propertiesCol.where('type', '==', 'franchise').get(),
        propertiesCol.where('type', '==', 'plot').get()
      ]);

      const preleasedCount = preleasedSnapshot.size;
      const vacantCount = vacantSnapshot.size;
      const franchiseCount = franchiseSnapshot.size;
      const plotsCount = plotsSnapshot.size;
      const totalCount = preleasedCount + vacantCount + franchiseCount + plotsCount;

      // Build category breakdown from vacant properties — flexible matching to handle data variations
      const categoryCounts: Record<string, number> = {
        'Industrial': 0,
        'High-Street': 0,
        'Mall': 0,
        'Corporate': 0,
        'Other': 0
      };

      if (!vacantSnapshot.empty) {
        vacantSnapshot.forEach((doc: any) => {
          const data = doc.data();
          const category = data.vacantDetails?.category || data.category || 'Other';
          const lowerCategory = category.toLowerCase();

          if (lowerCategory.includes('industrial')) {
            categoryCounts['Industrial']++;
          } else if (lowerCategory.includes('high-street') || lowerCategory.includes('high street') || lowerCategory.includes('street')) {
            categoryCounts['High-Street']++;
          } else if (lowerCategory.includes('mall') || lowerCategory.includes('shopping')) {
            categoryCounts['Mall']++;
          } else if (lowerCategory.includes('corporate') || lowerCategory.includes('office') || lowerCategory.includes('business')) {
            categoryCounts['Corporate']++;
          } else {
            categoryCounts['Other']++;
          }
        });
      }

      // Build franchise industry breakdown — categories must match the dashboard UI's color mapping
      const industryCounts: Record<string, number> = {
        'Education': 0,
        'F&B': 0,
        'Fashion': 0,
        'Pharmaceutical': 0,
        'Retail': 0,
        'Sports, Fitness & Entertainments': 0
      };

      if (!franchiseSnapshot.empty) {
        franchiseSnapshot.forEach((doc: any) => {
          const data = doc.data();
          const industry = data.franchiseDetails?.industry || data.industry || '';

          if (industryCounts.hasOwnProperty(industry)) {
            industryCounts[industry]++;
          }
          // Unmatched industries are simply not counted (same behavior as old dashboard code)
        });
      }

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
