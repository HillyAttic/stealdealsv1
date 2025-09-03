// Shared franchise types to ensure consistency across all components

export interface FranchiseDetails {
  brand?: string;
  name?: string;
  industry?: string;
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

export interface Franchise {
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
  
  // Legacy fields for backward compatibility - all optional to handle variations
  name?: string;
  industry?: string;
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
  investment?: string | number;
  roi?: string;
  requirements?: string;
}