// Helper functions for admin panel franchise data access
// Prioritizes franchiseDetails as primary source with fallbacks to legacy fields

export interface FranchiseDetails {
  brand?: string;
  name?: string;
  industry?: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: string;
  maxInvestment?: string;
  royalty?: string;
  establishmentYear?: string;
  franchiseStartedYear?: string;
  numberOfOutlets?: string;
  numberOutlets?: string; // Legacy naming
  minPaybackPeriod?: string;
  maxPaybackPeriod?: string;
  headquarter?: string;
  remarks?: string;
  brandDeck?: string;
  productList?: string;
  roiSheet?: string;
  investorDiscoveryKitUrl?: string;
}

export interface AdminFranchise {
  id?: string | null;
  type?: string;
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  images?: string[];
  image?: string;
  createdAt?: number;
  updatedAt?: number;
  status?: string;
  
  // franchiseDetails is the primary source of franchise-specific data
  franchiseDetails?: FranchiseDetails;
  
  // Legacy fields for backward compatibility (may be redundant after cleanup)
  name?: string;
  industry?: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: number | string;
  maxInvestment?: number | string;
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
  investment?: number | string;
  roi?: string;
  requirements?: string;
}

/**
 * Get a field from franchise data, prioritizing franchiseDetails
 */
export const getFieldFromFranchise = (franchise: AdminFranchise, field: keyof FranchiseDetails): string => {
  if (!franchise) return '';
  
  const details = franchise.franchiseDetails;
  
  switch (field) {
    case 'name':
      return details?.name || details?.brand || franchise.name || franchise.title || '';
    case 'brand':
      return details?.brand || details?.name || franchise.name || franchise.title || '';
    case 'industry':
      return details?.industry || franchise.industry || '';
    case 'segment':
      return details?.segment || franchise.segment || '';
    case 'product':
      return details?.product || details?.name || details?.brand || franchise.product || franchise.name || '';
    case 'model':
      return details?.model || franchise.model || '';
    case 'minArea':
      return details?.minArea || franchise.minArea || '';
    case 'maxArea':
      return details?.maxArea || franchise.maxArea || '';
    case 'royalty':
      return details?.royalty || franchise.royalty || franchise.roi || '';
    case 'headquarter':
      return details?.headquarter || franchise.headquarter || franchise.location || '';
    case 'remarks':
      return details?.remarks || franchise.remarks || franchise.description || '';
    case 'establishmentYear':
      return details?.establishmentYear || franchise.establishmentYear || '';
    case 'franchiseStartedYear':
      return details?.franchiseStartedYear || franchise.franchiseStartedYear || '';
    case 'minPaybackPeriod':
      return details?.minPaybackPeriod || franchise.minPaybackPeriod || '';
    case 'maxPaybackPeriod':
      return details?.maxPaybackPeriod || franchise.maxPaybackPeriod || '';
    case 'brandDeck':
      return details?.brandDeck || franchise.brandDeck || '';
    case 'productList':
      return details?.productList || franchise.productList || '';
    case 'roiSheet':
      return details?.roiSheet || franchise.roiSheet || '';
    case 'investorDiscoveryKitUrl':
      return details?.investorDiscoveryKitUrl || franchise.investorDiscoveryKitUrl || '';
    default:
      return details?.[field] || franchise[field as keyof AdminFranchise] || '';
  }
};

/**
 * Get investment amount (min or max) from franchise data
 */
export const getInvestmentFromFranchise = (franchise: AdminFranchise, type: 'min' | 'max'): string => {
  if (!franchise) return '';
  
  const details = franchise.franchiseDetails;
  
  if (type === 'min') {
    return details?.minInvestment || 
           franchise.minInvestment?.toString() || 
           franchise.investment?.toString() || 
           franchise.price?.toString() || 
           '0';
  } else {
    return details?.maxInvestment || 
           franchise.maxInvestment?.toString() || 
           '';
  }
};

/**
 * Get number of outlets from franchise data (handles naming inconsistency)
 */
export const getOutletsFromFranchise = (franchise: AdminFranchise): string => {
  if (!franchise) return '';
  
  const details = franchise.franchiseDetails;
  return details?.numberOfOutlets || 
         details?.numberOutlets || 
         franchise.numberOutlets || 
         '';
};

/**
 * Create a franchise object in the new franchiseDetails structure
 */
export const createFranchiseWithDetails = (formData: any): AdminFranchise => {
  return {
    // Essential root-level fields only
    type: 'franchise',
    title: formData.brand || formData.name || 'Franchise Property',
    description: formData.remarks || formData.description || '',
    location: formData.headquarter || 'Multiple Locations',
    price: parseFloat(formData.minInvestment) || 0,
    images: formData.image ? [formData.image] : [],
    status: 'Active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    
    // All franchise-specific data in franchiseDetails object
    franchiseDetails: {
      brand: formData.brand || formData.name || '',
      name: formData.brand || formData.name || '',
      industry: formData.industry || '',
      segment: formData.segment || '',
      product: formData.brand || formData.product || formData.name || '',
      model: formData.model || '',
      minArea: formData.minArea || '',
      maxArea: formData.maxArea || '',
      minInvestment: formData.minInvestment || '0',
      maxInvestment: formData.maxInvestment || '0',
      royalty: formData.royalty || '',
      establishmentYear: formData.establishmentYear || '',
      franchiseStartedYear: formData.franchiseStartedYear || '',
      numberOfOutlets: formData.numberOutlets || '', // Standardized naming
      minPaybackPeriod: formData.minPaybackPeriod || '',
      maxPaybackPeriod: formData.maxPaybackPeriod || '',
      headquarter: formData.headquarter || '',
      remarks: formData.remarks || '',
      brandDeck: formData.brandDeck || '',
      productList: formData.productList || '',
      roiSheet: formData.roiSheet || '',
      investorDiscoveryKitUrl: formData.investorDiscoveryKitUrl || ''
    }
  };
};

/**
 * Convert franchise data from franchiseDetails structure to legacy flat structure for forms
 */
export const convertToLegacyFormData = (franchise: AdminFranchise): any => {
  return {
    id: franchise.id,
    brand: getFieldFromFranchise(franchise, 'brand'),
    industry: getFieldFromFranchise(franchise, 'industry'),
    segment: getFieldFromFranchise(franchise, 'segment'),
    model: getFieldFromFranchise(franchise, 'model'),
    minArea: getFieldFromFranchise(franchise, 'minArea'),
    maxArea: getFieldFromFranchise(franchise, 'maxArea'),
    minInvestment: getInvestmentFromFranchise(franchise, 'min'),
    maxInvestment: getInvestmentFromFranchise(franchise, 'max'),
    royalty: getFieldFromFranchise(franchise, 'royalty'),
    establishmentYear: getFieldFromFranchise(franchise, 'establishmentYear'),
    franchiseStartedYear: getFieldFromFranchise(franchise, 'franchiseStartedYear'),
    numberOutlets: getOutletsFromFranchise(franchise),
    minPaybackPeriod: getFieldFromFranchise(franchise, 'minPaybackPeriod'),
    maxPaybackPeriod: getFieldFromFranchise(franchise, 'maxPaybackPeriod'),
    headquarter: getFieldFromFranchise(franchise, 'headquarter'),
    remarks: getFieldFromFranchise(franchise, 'remarks'),
    brandDeck: getFieldFromFranchise(franchise, 'brandDeck'),
    productList: getFieldFromFranchise(franchise, 'productList'),
    roiSheet: getFieldFromFranchise(franchise, 'roiSheet'),
    investorDiscoveryKitUrl: getFieldFromFranchise(franchise, 'investorDiscoveryKitUrl'),
    image: franchise.images?.[0] || franchise.image || ''
  };
};

/**
 * Get display name for franchise (for listings, titles, etc.)
 */
export const getFranchiseDisplayName = (franchise: AdminFranchise): string => {
  return getFieldFromFranchise(franchise, 'brand') || 
         getFieldFromFranchise(franchise, 'name') || 
         franchise.title || 
         'Unnamed Franchise';
};

/**
 * Check if franchise data should be shown in search results
 */
export const matchesFranchiseSearch = (franchise: AdminFranchise, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  
  const term = searchTerm.toLowerCase();
  
  return getFranchiseDisplayName(franchise).toLowerCase().includes(term) ||
         getFieldFromFranchise(franchise, 'industry').toLowerCase().includes(term) ||
         getFieldFromFranchise(franchise, 'headquarter').toLowerCase().includes(term) ||
         getFieldFromFranchise(franchise, 'product').toLowerCase().includes(term) ||
         getFieldFromFranchise(franchise, 'segment').toLowerCase().includes(term);
};