import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Read from Firebase RTDB (same source the working frontend uses) instead of Firestore.
// The Firestore Admin SDK path was returning 0/empty because:
//   1) No FIREBASE_SERVICE_ACCOUNT_KEY on Vercel → Admin SDK never initializes
//   2) Properties actually live in RTDB (migratedProperties/*), not Firestore
import { getAllFranchises } from '@/lib/firebase';
import { revalidateTag } from 'next/cache';
import { sortByNewest } from '@/lib/sort';
import { db } from '@/lib/firebase-server-admin';

interface Franchise {
  id: string;
  name: string;
  industry: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: string | number;
  maxInvestment?: string | number;
  royalty?: string;
  establishmentYear?: string;
  franchiseStartedYear?: string;
  numberOutlets?: string;
  minPaybackPeriod?: string;
  maxPaybackPeriod?: string;
  headquarter?: string;
  remarks?: string;
  brandDeck?: string;
  productList?: string;
  roiSheet?: string;
  investorDiscoveryKitUrl?: string;
  investment: number;
  location: string;
  status: string;
  roi: string;
  image?: string;
  images?: string[];
  description?: string;
  requirements?: string;
  createdAt?: number;
  updatedAt?: number;
  title?: string;
  franchiseDetails?: Record<string, any>;
  [key: string]: any;
}

// Get all franchises from RTDB (same data the frontend displays)
export async function GET() {
  try {
    console.log('[Franchises API] Fetching franchises from RTDB...');

    const franchises = await getAllFranchises();

    console.log(`[Franchises API] Found ${franchises.length} franchises from RTDB`);

    const sorted = sortByNewest(franchises);

    const response = NextResponse.json({
      franchises: sorted,
      total: sorted.length
    });

    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    response.headers.set('X-Data-Source', 'firebase-rtdb');

    return response;
  } catch (error: any) {
    console.error('[Franchises API] Error fetching franchises:', error);
    return NextResponse.json(
      { franchises: [], total: 0, error: error.message || 'Failed to fetch franchises' },
      { status: 200 }
    );
  }
}

// Add a new franchise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Franchises API] Received franchise data:', body);

    // Validate required fields
    const brand = body.brand || body.franchiseDetails?.brand;
    const industry = body.industry || body.franchiseDetails?.industry;

    if (!brand || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields: brand and industry are required' },
        { status: 400 }
      );
    }

    // Generate a simple unique ID
    const newId = `FR-${Date.now()}`;
    console.log(`[Franchises API] Creating new franchise with ID: ${newId}`);

    const newFranchise = {
      id: newId,
      type: 'franchise',
      title: brand || body.name || `Franchise ${newId}`,
      description: body.remarks || body.description || body.franchiseDetails?.remarks || '',
      location: body.headquarter || body.franchiseDetails?.headquarter || 'Multiple Locations',
      price: parseFloat(body.minInvestment || body.franchiseDetails?.minInvestment) || 0,
      images: body.image ? [body.image] : body.franchiseDetails?.image ? [body.franchiseDetails.image] : [],
      status: 'Active',
      createdAt: body.createdAt || Date.now(),
      updatedAt: Date.now(),

      // All franchise-specific data in franchiseDetails object
      franchiseDetails: {
        brand: brand,
        name: brand,
        industry: industry,
        segment: body.segment || body.franchiseDetails?.segment || '',
        product: brand || body.product || body.name || body.franchiseDetails?.product || '',
        model: body.model || body.franchiseDetails?.model || '',
        minArea: body.minArea || body.franchiseDetails?.minArea || '',
        maxArea: body.maxArea || body.franchiseDetails?.maxArea || '',
        minInvestment: body.minInvestment || body.franchiseDetails?.minInvestment || '0',
        maxInvestment: body.maxInvestment || body.franchiseDetails?.maxInvestment || '0',
        royalty: body.royalty || body.franchiseDetails?.royalty || 'Varies',
        establishmentYear: body.establishmentYear || body.franchiseDetails?.establishmentYear || '',
        franchiseStartedYear: body.franchiseStartedYear || body.franchiseDetails?.franchiseStartedYear || '',
        numberOfOutlets: body.numberOutlets || body.franchiseDetails?.numberOfOutlets || '',
        minPaybackPeriod: body.minPaybackPeriod || body.franchiseDetails?.minPaybackPeriod || '',
        maxPaybackPeriod: body.maxPaybackPeriod || body.franchiseDetails?.maxPaybackPeriod || '',
        headquarter: body.headquarter || body.franchiseDetails?.headquarter || 'Multiple Locations',
        remarks: body.remarks || body.franchiseDetails?.remarks || '',
        brandDeck: body.brandDeck || body.franchiseDetails?.brandDeck || '',
        productList: body.productList || body.franchiseDetails?.productList || '',
        roiSheet: body.roiSheet || body.franchiseDetails?.roiSheet || '',
        investorDiscoveryKitUrl: body.investorDiscoveryKitUrl || body.franchiseDetails?.investorDiscoveryKitUrl || ''
      }
    };

    // Save to Firestore using Admin SDK
    await db.collection('properties').doc(newId).set(newFranchise);

    console.log('[Franchises API] Franchise saved:', newId);

    revalidateTag('franchises');

    return NextResponse.json({
      success: true,
      franchise: newFranchise
    });
  } catch (error: any) {
    console.error('[Franchises API] Error adding franchise:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add franchise' },
      { status: 500 }
    );
  }
}
