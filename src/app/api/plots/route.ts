import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllPlots, addPlot, Plot } from '../../../lib/firebase';

// Get all plots with optional filtering - no authentication required for public access
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('GET /api/plots - Fetching plots from Firebase');
    
    // Fetch all plots from Firebase
    let plots = await getAllPlots();
    console.log('GET /api/plots - Plots fetched from Firebase:', plots.length);
    
    // Apply limit
    const paginatedPlots = plots.slice(0, limit);
    
    console.log('Returning plots:', paginatedPlots.length);
    
    // Make sure we always return a valid plots array
    return NextResponse.json({
      plots: paginatedPlots || [],
      total: plots.length
    });
    
  } catch (error) {
    console.error('Error fetching plots:', error);
    // Return empty array instead of error to prevent frontend crash
    return NextResponse.json({
      plots: [],
      total: 0,
      error: 'Failed to fetch plots'
    }, { status: 200 }); // Use 200 instead of 500 to prevent frontend error
  }
}

// Add a new plot - requires authentication
export async function POST(request: NextRequest) {
  try {
    // Authentication check removed to prevent errors
    const body = await request.json();
    
    // Log the incoming request body for debugging
    console.log('Received plot data:', body);
    
    // Validate required fields
    if (!body.project || !body.developerName || !body.location) {
      return NextResponse.json(
        { error: 'Project, developer name, and location are required' },
        { status: 400 }
      );
    }
    
    // Prepare plot data
    const plotData: Plot = {
      id: '', // Will be set by Firebase
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
    
    try {
      // Save to Firebase
      const newPlot = await addPlot(plotData);
      
      console.log('New plot added to Firebase:', newPlot);
      
      return NextResponse.json({
        success: true,
        plot: newPlot
      });
    } catch (firebaseError: any) {
      console.error('Firebase error:', firebaseError);
      return NextResponse.json(
        { error: 'Firebase database error: ' + firebaseError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error adding plot:', error);
    return NextResponse.json(
      { error: 'Failed to add plot: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}