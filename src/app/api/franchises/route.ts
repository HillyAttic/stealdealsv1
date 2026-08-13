import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-server-admin';
import { revalidateTag } from 'next/cache';

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

// Get all franchises using Firebase Admin SDK (bypasses security rules)
export async function GET() {
  try {
    console.log('[Franchises API] Fetching franchises from Firestore via Admin SDK...');

    const propertiesCol = db.collection('properties');
    const snapshot = await propertiesCol.where('type', '==', 'franchise').get();

    console.log(`[Franchises API] Found ${snapshot.size} franchise documents`);

    const franchises: Franchise[] = [];
    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      const fd = data.franchiseDetails || {};

      franchises.push({
        ...data,
        id: docSnap.id,
        name: data.title || data.name || fd.name || 'Franchise Name',
        industry: fd.industry || data.industry || 'Not specified',
        segment: fd.segment || data.segment || '',
        product: fd.product || data.product || '',
        model: fd.model || data.model || '',
        minArea: fd.minArea || data.minArea || '',
        maxArea: fd.maxArea || data.maxArea || '',
        minInvestment: fd.minInvestment || data.minInvestment || '',
        maxInvestment: fd.maxInvestment || data.maxInvestment || '',
        royalty: fd.royalty || data.royalty || 'Varies',
        establishmentYear: fd.establishmentYear || data.establishmentYear || '',
        franchiseStartedYear: fd.franchiseStartedYear || data.franchiseStartedYear || '',
        numberOutlets: fd.numberOfOutlets || fd.numberOutlets || data.numberOutlets || '',
        minPaybackPeriod: fd.minPaybackPeriod || data.minPaybackPeriod || '',
        maxPaybackPeriod: fd.maxPaybackPeriod || data.maxPaybackPeriod || '',
        headquarter: fd.headquarter || data.headquarter || data.location || 'Not specified',
        remarks: fd.remarks || data.remarks || '',
        brandDeck: fd.brandDeck || data.brandDeck || '',
        productList: fd.productList || data.productList || '',
        roiSheet: fd.roiSheet || data.roiSheet || '',
        investorDiscoveryKitUrl: fd.investorDiscoveryKitUrl || data.investorDiscoveryKitUrl || '',
        investment: data.price || parseFloat(fd.minInvestment) || 0,
        location: data.location || fd.headquarter || 'Not specified',
        status: data.status || 'Active',
        roi: fd.royalty || data.roi || 'Varies',
        image: data.images?.[0] || data.image || '',
        images: data.images || [],
        description: data.description || fd.remarks || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    const response = NextResponse.json({
      franchises,
      total: franchises.length
    });

    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    response.headers.set('X-Data-Source', 'firebase-admin-sdk');

    return response;
  } catch (error: any) {
    console.error('[Franchises API] Error fetching franchises:', error);
    const errorResponse = NextResponse.json(
      { franchises: [], total: 0, error: error.message || 'Failed to fetch franchises' },
      { status: 200 }
    );
    errorResponse.headers.set('X-API-Cache', 'MISS');
    errorResponse.headers.set('X-Error', 'true');
    return errorResponse;
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
