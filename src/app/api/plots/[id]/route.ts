import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPlotById, updatePlot, deletePlot, Plot } from '../../../../lib/firebase';
import { revalidateTag } from 'next/cache';

// Get a specific plot by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Plot ID is required' },
        { status: 400 }
      );
    }

    const plot = await getPlotById(id);
    
    if (!plot) {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plot });
  } catch (error: any) {
    console.error('Error fetching plot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plot: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Update a specific plot by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Plot ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.project || !body.developerName || !body.location) {
      return NextResponse.json(
        { error: 'Project, developer name, and location are required' },
        { status: 400 }
      );
    }

    // Prepare plot data
    const plotData: Plot = {
      id: id,
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
      images: body.images || []
    };

    const updatedPlot = await updatePlot(id, plotData);
    
    // Invalidate the cache to ensure fresh data on next request
    revalidateTag('plots');

    return NextResponse.json({
      success: true,
      plot: updatedPlot
    });
  } catch (error: any) {
    console.error('Error updating plot:', error);
    return NextResponse.json(
      { error: 'Failed to update plot: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// Delete a specific plot by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Plot ID is required' },
        { status: 400 }
      );
    }

    const success = await deletePlot(id);
    
    if (success) {
      // Invalidate the cache to ensure fresh data on next request
      revalidateTag('plots');
      
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Failed to delete plot');
    }
  } catch (error: any) {
    console.error('Error deleting plot:', error);
    return NextResponse.json(
      { error: 'Failed to delete plot: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}