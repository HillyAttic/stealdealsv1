import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Read from Firebase RTDB (same source the working frontend uses) instead of Firestore.
import { getAllPlots } from '@/lib/firebase';
import { db } from '@/lib/firebase-server-admin';
import { revalidateTag } from 'next/cache';
import { sortByNewest } from '@/lib/sort';

// Get all plots from RTDB (same data the frontend displays)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');

    console.log('[Plots API] Fetching plots from RTDB...');

    const plots = await getAllPlots();

    console.log(`[Plots API] Fetched ${plots.length} plots from RTDB`);

    const sorted = sortByNewest(plots);
    const paginatedPlots = sorted.slice(0, limit);

    const response = NextResponse.json({
      plots: paginatedPlots || [],
      total: plots.length
    });

    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    response.headers.set('X-Data-Source', 'firebase-rtdb');

    return response;
  } catch (error) {
    console.error('[Plots API] Error fetching plots:', error);
    return NextResponse.json({
      plots: [],
      total: 0,
      error: 'Failed to fetch plots'
    }, { status: 200 });
  }
}

// Add a new plot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Plots API] Received plot data:', body);

    if (!body.project || !body.developerName || !body.location) {
      return NextResponse.json(
        { error: 'Project, developer name, and location are required' },
        { status: 400 }
      );
    }

    const newId = `PL-${Date.now()}`;
    const plotData = {
      id: newId,
      type: 'plot',
      developerName: body.developerName,
      project: body.project,
      description: body.description || '',
      status: body.status || '',
      plotSize: {
        min: body.plotSize?.min || 0,
        max: body.plotSize?.max || 0,
        unit: body.plotSize?.unit || 'sq.yds'
      },
      location: body.location,
      investmentStartsFrom: {
        amount: body.investmentStartsFrom?.amount || 0,
        unit: body.investmentStartsFrom?.unit || 'sq.yds'
      },
      investorDiscoveryKit: {
        title: body.investorDiscoveryKit?.title || 'Investor Discovery Kit',
        url: body.investorDiscoveryKit?.url || '',
        description: body.investorDiscoveryKit?.description || 'Contains brochure, payment plan, and promotional video'
      },
      images: body.images || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.collection('properties').doc(newId).set(plotData);

    console.log('[Plots API] Plot saved:', newId);

    revalidateTag('plots');

    return NextResponse.json({
      success: true,
      plot: plotData
    });
  } catch (error: any) {
    console.error('[Plots API] Error adding plot:', error);
    return NextResponse.json(
      { error: 'Failed to add plot: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
