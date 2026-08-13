/**
 * Property types for the StealDeals application
 * Centralized type definitions used across the app.
 */

export interface Property {
  id: string;
  title?: string;
  tenant?: string;
  category: string;
  price?: number;
  buildingName?: string;
  location: string;
  state?: string;
  city?: string;
  district?: string;
  subDistrict?: string;
  floor?: string;
  area?: number;
  superArea?: string;
  carpetArea?: string;
  totalArea?: string;
  areaOnSale?: string;
  description?: string;
  featured?: boolean;
  propertyStatus?: string;
  leaseTerm?: string;
  remainingLease?: string;
  lockIn?: string;
  escalation?: string;
  rentalType?: string;
  rent?: number;
  askingPrice?: number;
  securityDeposit?: string;
  roi?: string;
  advance?: string;
  reference?: string;
  contactName?: string;
  contactNumber?: string;
  channel?: string;
  propertyType?: string;
  unitType?: string; // Unit type for vacant properties (Independent Unit, Standalone Building, etc.)
  image?: string; // Image URL for the property

  // Additional vacant property fields
  facing?: string;
  length?: string;
  width?: string;
  height?: string;

  // Ownership tracking fields
  createdBy?: string; // UID of the admin who created this property
  lastModifiedBy?: string; // UID of the admin who last modified this property

  // Additional timestamp fields
  createdAt?: number;
  updatedAt?: number;

  // Allow additional fields
  [key: string]: any;
}

/**
 * Franchise type for franchise properties
 */
export interface Franchise {
  id?: string | null;
  name: string;
  industry: string;
  segment?: string;
  product?: string;
  model?: string;
  minArea?: string;
  maxArea?: string;
  minInvestment?: number;
  maxInvestment?: number;
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
  investment: number; // Legacy field
  location: string; // Legacy field
  status: string;
  roi: string; // Legacy field
  description?: string; // Legacy field
  requirements?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Plot type for plot properties
 */
export interface Plot {
  id?: string | null;
  developerName: string;
  project: string;
  description: string;
  status: string; // "Ready to Move In" or "Future Delivery"
  plotSize: {
    min: number;
    max: number;
    unit: string; // "sq.yds", "sq.mt", "sq.ft"
  };
  location: string;
  investmentStartsFrom: {
    amount: number;
    unit: string; // "sq.yds", "sq.mt", "sq.ft"
  };
  investorDiscoveryKit: {
    title: string;
    url: string;
    description: string;
  };
  keySalientFeatures?: string[]; // Array of key salient features
  images: string[]; // Array of image URLs
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}
