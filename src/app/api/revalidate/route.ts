import { NextRequest, NextResponse } from 'next/server';
import { revalidateCachedData } from '@/lib/cache/server-cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, secret } = body;

    // Verify secret token for security
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    console.log(`[API] Cache revalidation requested for type: ${type}`);

    switch (type) {
      case 'franchises':
        await revalidateCachedData.franchises();
        break;
      case 'vacant-properties':
        await revalidateCachedData.vacantProperties();
        break;
      case 'plots':
        await revalidateCachedData.plots();
        break;
      case 'all':
        await revalidateCachedData.all();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid revalidation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      revalidated: true,
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Cache revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cache revalidation endpoint. Use POST with type and secret.',
    availableTypes: ['franchises', 'vacant-properties', 'plots', 'all']
  });
}