// Define property interface
export interface Property {
  id: number;
  title?: string;
  tenant?: string;
  category: string;
  price?: number;
  buildingName?: string;
  location: string;
  district?: string;
  subDistrict?: string;
  floor?: string;
  area?: number;
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
  channel?: string;
  propertyType?: string;
}

// Mock properties data (in a real app, this would be in a database)
export let properties: Property[] = [
  {
    id: 1,
    title: 'Commercial Space in East Delhi',
    category: 'Retail',
    price: 25000,
    location: 'East Delhi',
    area: 1200,
    description: 'Prime retail space in East Delhi market area with high foot traffic',
    featured: true
  },
  {
    id: 2,
    title: 'Banking Space in South Delhi',
    category: 'Banks',
    price: 35000,
    location: 'South Delhi',
    area: 2000,
    description: 'Ideal location for banking operations with ample parking space',
    featured: true
  },
  {
    id: 3,
    title: 'Residential Property in Noida',
    category: 'Residential',
    price: 18000,
    location: 'Noida',
    area: 1500,
    description: 'Beautiful 3BHK apartment in a gated community',
    featured: false
  },
  {
    id: 4,
    title: 'Restaurant Space in Connaught Place',
    category: 'Food & Beverages',
    price: 45000,
    location: 'Central Delhi',
    area: 2200,
    description: 'Premium restaurant space in the heart of Delhi',
    featured: true
  }
]; 