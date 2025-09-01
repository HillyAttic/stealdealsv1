// Firebase configuration for StealDeals app
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, get, push, child, update, remove, DataSnapshot } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Validate that we have the required Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
  console.error('Firebase configuration is missing. Make sure your environment variables are set properly.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);
const auth = getAuth(app);

// Properties collection references - migrated to type-organized structure
const propertiesRef = ref(database, 'properties'); // Legacy reference for backward compatibility
const vacantPropertiesRef = ref(database, 'vacantProperties'); // Legacy
const preleasedPropertiesRef = ref(database, 'preleasedProperties'); // Legacy
const franchisePropertiesRef = ref(database, 'franchiseProperties'); // Legacy
const plotsRef = ref(database, 'plots'); // Legacy

// New type-organized structure from migration
const migratedVacantRef = ref(database, 'migratedProperties/vacant');
const migratedPreleasedRef = ref(database, 'migratedProperties/preleased');
const migratedFranchiseRef = ref(database, 'migratedProperties/franchise');
const migratedPlotsRef = ref(database, 'migratedProperties/plots');

// Export references
export { 
  app,
  database, 
  auth,
  propertiesRef, 
  vacantPropertiesRef, 
  preleasedPropertiesRef,
  franchisePropertiesRef,
  plotsRef,
  migratedVacantRef,
  migratedPreleasedRef,
  migratedFranchiseRef,
  migratedPlotsRef
};

// Property interface matching our application's property structure
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
  
  // Additional timestamp fields
  createdAt?: number;
  updatedAt?: number;
}

// Franchise interface
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
  investment: number;  // Legacy field
  location: string;    // Legacy field
  status: string;
  roi: string;         // Legacy field
  description?: string; // Legacy field
  requirements?: string;
  image?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Plot interface for plots collection
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
}

// Function to get the appropriate reference based on property type (uses migrated structure)
export function getPropertyRefByType(propertyType: string) {
  console.log(`Getting reference for property type: "${propertyType}"`);
  
  if (propertyType === 'Vacant' || propertyType === 'vacant') {
    console.log('Using migratedVacantRef');
    return migratedVacantRef;
  } else if (propertyType === 'Pre-Leased' || propertyType === 'preleased') {
    console.log('Using migratedPreleasedRef');
    return migratedPreleasedRef;
  } else if (propertyType === 'Franchise' || propertyType === 'franchise') {
    console.log('Using migratedFranchiseRef');
    return migratedFranchiseRef;
  } else if (propertyType === 'Plot' || propertyType === 'plot') {
    console.log('Using migratedPlotsRef');
    return migratedPlotsRef;
  }
  
  console.log('Using default propertiesRef (legacy)');
  return propertiesRef; // Fallback to legacy reference
}

// Function to get all properties (combines all property collections from migrated structure)
export async function getAllProperties(): Promise<Property[]> {
  try {
    const properties: Property[] = [];
    
    // Get migrated vacant properties
    const migratedVacantSnapshot = await get(migratedVacantRef);
    if (migratedVacantSnapshot.exists()) {
      migratedVacantSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const data = childSnapshot.val();
        const vacantDetails = data.vacantDetails || {};
        
        // Flatten the nested structure for vacant properties
        properties.push({
          id: childSnapshot.key,
          title: data.title || data.location || 'Vacant Property',
          // Extract from vacantDetails
          category: vacantDetails.category || data.category || 'Vacant',
          location: data.location || vacantDetails.location || 'Location not specified',
          city: vacantDetails.city || data.city || '',
          state: vacantDetails.state || data.state || '',
          district: vacantDetails.district || data.district || '',
          floor: vacantDetails.floor || data.floor || '',
          facing: vacantDetails.facing || data.facing || '',
          carpetArea: vacantDetails.carpetArea || data.carpetArea || '',
          superArea: vacantDetails.superArea || data.superArea || '',
          rent: vacantDetails.rent || data.rent || data.price || 0,
          price: data.price || vacantDetails.rent || 0,
          contactName: vacantDetails.contactName || data.contactName || '',
          contactNumber: vacantDetails.contactNumber || data.contactNumber || '',
          reference: vacantDetails.reference || data.reference || '',
          propertyType: vacantDetails.propertyType || 'Vacant',
          type: 'vacant',
          // Include all original data
          ...data
        });
      });
    }
    
    // Get migrated preleased properties
    const migratedPreleasedSnapshot = await get(migratedPreleasedRef);
    if (migratedPreleasedSnapshot.exists()) {
      migratedPreleasedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const data = childSnapshot.val();
        const preleasedDetails = data.preleasedDetails || {};
        
        // Flatten the nested structure for preleased properties
        properties.push({
          id: childSnapshot.key,
          title: data.title || preleasedDetails.tenant || 'Preleased Property',
          // Extract from preleasedDetails
          tenant: preleasedDetails.tenant || data.tenant || '',
          category: preleasedDetails.category || data.category || 'Preleased',
          buildingName: preleasedDetails.buildingName || data.buildingName || '',
          location: data.location || preleasedDetails.location || 'Location not specified',
          floor: preleasedDetails.floor || data.floor || '',
          totalArea: preleasedDetails.totalArea || data.totalArea || '',
          areaOnSale: preleasedDetails.areaOnSale || data.areaOnSale || '',
          rent: parseFloat(typeof preleasedDetails.rent === 'string' ? preleasedDetails.rent.replace(/[^0-9.]/g, '') : preleasedDetails.rent || '0') || data.rent || 0,
          price: data.price || parseFloat(typeof preleasedDetails.rent === 'string' ? preleasedDetails.rent.replace(/[^0-9.]/g, '') : preleasedDetails.rent || '0') || 0,
          leaseTerm: preleasedDetails.leaseTerm || data.leaseTerm || '',
          remainingLease: preleasedDetails.remainingLease || data.remainingLease || '',
          lockIn: preleasedDetails.lockIn || data.lockIn || '',
          escalation: preleasedDetails.escalation || data.escalation || '',
          securityDeposit: preleasedDetails.securityDeposit || data.securityDeposit || '',
          roi: preleasedDetails.roi || data.roi || '',
          propertyStatus: preleasedDetails.propertyStatus || data.propertyStatus || '',
          reference: preleasedDetails.reference || data.reference || '',
          channel: preleasedDetails.channel || data.channel || '',
          propertyType: preleasedDetails.propertyType || 'Preleased',
          type: 'preleased',
          // Include all original data
          ...data
        });
      });
    }
    
    // Get migrated franchise properties
    const migratedFranchiseSnapshot = await get(migratedFranchiseRef);
    if (migratedFranchiseSnapshot.exists()) {
      migratedFranchiseSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const data = childSnapshot.val();
        const franchiseDetails = data.franchiseDetails || {};
        
        // Flatten the nested structure for franchise properties
        properties.push({
          id: childSnapshot.key,
          title: data.title || data.name || franchiseDetails.name || franchiseDetails.brand || 'Franchise',
          name: data.title || data.name || franchiseDetails.name || franchiseDetails.brand || 'Franchise',
          category: 'Franchise',
          location: data.location || franchiseDetails.headquarter || 'Location not specified',
          price: parseFloat(typeof data.price === 'string' ? data.price.replace(/[^0-9.]/g, '') : data.price || '0') || parseFloat(typeof franchiseDetails.minInvestment === 'string' ? franchiseDetails.minInvestment.replace(/[^0-9.]/g, '') : franchiseDetails.minInvestment || '0') || 0,
          investment: parseFloat(typeof data.price === 'string' ? data.price.replace(/[^0-9.]/g, '') : data.price || '0') || parseFloat(typeof franchiseDetails.minInvestment === 'string' ? franchiseDetails.minInvestment.replace(/[^0-9.]/g, '') : franchiseDetails.minInvestment || '0') || 0,
          // Extract from franchiseDetails
          industry: franchiseDetails.industry || data.industry || 'Not specified',
          segment: franchiseDetails.segment || data.segment || '',
          model: franchiseDetails.model || data.model || '',
          minInvestment: parseFloat(typeof franchiseDetails.minInvestment === 'string' ? franchiseDetails.minInvestment.replace(/[^0-9.]/g, '') : franchiseDetails.minInvestment || '0') || 0,
          maxInvestment: parseFloat(typeof franchiseDetails.maxInvestment === 'string' ? franchiseDetails.maxInvestment.replace(/[^0-9.]/g, '') : franchiseDetails.maxInvestment || '0') || 0,
          royalty: franchiseDetails.royalty || data.royalty || 'Not specified',
          headquarter: franchiseDetails.headquarter || data.headquarter || data.location || '',
          description: data.description || '',
          image: data.images?.[0] || data.image || '',
          propertyType: 'Franchise',
          type: 'franchise',
          // Include all original data
          ...data
        });
      });
    }
    
    // Get migrated plots
    const migratedPlotsSnapshot = await get(migratedPlotsRef);
    if (migratedPlotsSnapshot.exists()) {
      migratedPlotsSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const data = childSnapshot.val();
        const plotDetails = data.plotDetails || {};
        
        // Flatten the nested structure for plot properties
        properties.push({
          id: childSnapshot.key,
          title: data.title || plotDetails.project || data.project || 'Plot',
          project: plotDetails.project || data.project || data.title || 'Plot Project',
          developerName: plotDetails.developerName || data.developerName || 'Developer not specified',
          category: 'Plot',
          location: data.location || 'Location not specified',
          price: data.price || plotDetails.investmentStartsFrom?.amount || 0,
          investmentStartsFrom: plotDetails.investmentStartsFrom || data.investmentStartsFrom || { amount: 0, unit: 'sq.yds' },
          plotSize: plotDetails.plotSize || data.plotSize || { min: 0, max: 0, unit: 'sq.yds' },
          status: plotDetails.status || data.status || 'Available',
          description: data.description || '',
          images: data.images || [],
          image: data.images?.[0] || '',
          propertyType: 'Plot',
          type: 'plot',
          // Include all original data
          ...data
        });
      });
    }
    
    // Fallback: Get legacy properties (for backward compatibility)
    const vacantSnapshot = await get(vacantPropertiesRef);
    if (vacantSnapshot.exists()) {
      vacantSnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    const preleasedSnapshot = await get(preleasedPropertiesRef);
    if (preleasedSnapshot.exists()) {
      preleasedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    const franchiseSnapshot = await get(franchisePropertiesRef);
    if (franchiseSnapshot.exists()) {
      franchiseSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const franchiseData = childSnapshot.val();
        properties.push({
          id: childSnapshot.key,
          title: franchiseData.name || franchiseData.title,
          category: 'Franchise',
          location: franchiseData.location || franchiseData.headquarter,
          price: franchiseData.investment || franchiseData.minInvestment,
          description: franchiseData.description,
          image: franchiseData.image,
          propertyType: 'Franchise',
          ...franchiseData
        });
      });
    }
    
    const plotsSnapshot = await get(plotsRef);
    if (plotsSnapshot.exists()) {
      plotsSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const plotData = childSnapshot.val();
        properties.push({
          id: childSnapshot.key,
          title: plotData.project || plotData.title,
          category: 'Plot',
          location: plotData.location,
          price: plotData.investmentStartsFrom?.amount,
          description: plotData.description,
          image: plotData.images?.[0],
          propertyType: 'Plot',
          ...plotData
        });
      });
    }
    
    const legacySnapshot = await get(propertiesRef);
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties from Firebase:', error);
    throw error;
  }
}

// Function to get all vacant properties (uses migrated structure first)
export async function getVacantProperties(): Promise<Property[]> {
  try {
    const properties: Property[] = [];
    
    // Get from migrated structure first
    const migratedSnapshot = await get(migratedVacantRef);
    if (migratedSnapshot.exists()) {
      migratedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Fallback to legacy collections
    const legacySnapshot = await get(vacantPropertiesRef);
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Also check legacy properties for backward compatibility
    const propertiesSnapshot = await get(propertiesRef);
    if (propertiesSnapshot.exists()) {
      propertiesSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const property = childSnapshot.val();
        if (property.propertyType === 'Vacant') {
          properties.push({
            id: childSnapshot.key,
            ...property
          });
        }
      });
    }
    
    return properties;
  } catch (error) {
    console.error('Error fetching vacant properties from Firebase:', error);
    throw error;
  }
}

// Function to get all preleased properties (uses migrated structure first)
export async function getPreleasedProperties(): Promise<Property[]> {
  try {
    const properties: Property[] = [];
    
    // Get from migrated structure first
    const migratedSnapshot = await get(migratedPreleasedRef);
    if (migratedSnapshot.exists()) {
      migratedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Fallback to legacy collections
    const legacySnapshot = await get(preleasedPropertiesRef);
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Also check legacy properties for backward compatibility
    const propertiesSnapshot = await get(propertiesRef);
    if (propertiesSnapshot.exists()) {
      propertiesSnapshot.forEach((childSnapshot: DataSnapshot) => {
        const property = childSnapshot.val();
        if (property.propertyType === 'Pre-Leased') {
          properties.push({
            id: childSnapshot.key,
            ...property
          });
        }
      });
    }
    
    return properties;
  } catch (error) {
    console.error('Error fetching preleased properties from Firebase:', error);
    throw error;
  }
}

// Function to get a property by ID (checks all property collections including migrated)
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    if (!id || id.trim() === '') {
      console.log(`[Firebase] Invalid property ID provided: "${id}"`);
      return null;
    }
    
    console.log(`[Firebase] Searching for property ID: "${id}" across all collections`);
    
    // Log the search pattern to help debug production issues
    const searchOrder = [
      'migratedProperties/vacant',
      'migratedProperties/preleased', 
      'migratedProperties/franchise',
      'migratedProperties/plots',
      'legacy vacantProperties',
      'legacy preleasedProperties',
      'legacy franchiseProperties', 
      'legacy plots',
      'legacy properties'
    ];
    console.log(`[Firebase] Search order for ${id}:`, searchOrder);
    
    // Try migrated collections first
    let snapshot = await get(child(migratedVacantRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in migratedProperties/vacant`);
      const data = snapshot.val();
      
      // Handle nested vacant details structure
      let property = { id: snapshot.key, ...data };
      if (data.vacantDetails) {
        const details = data.vacantDetails;
        property = {
          ...property,
          category: details.category || data.category || 'Vacant',
          city: details.city || data.city || '',
          state: details.state || data.state || '',
          district: details.district || data.district || '',
          floor: details.floor || data.floor || '',
          facing: details.facing || data.facing || '',
          carpetArea: details.carpetArea || data.carpetArea || '',
          superArea: details.superArea || data.superArea || '',
          rent: details.rent || data.rent || data.price || 0,
          contactName: details.contactName || data.contactName || '',
          contactNumber: details.contactNumber || data.contactNumber || '',
          reference: details.reference || data.reference || '',
          propertyType: details.propertyType || data.propertyType || 'Vacant'
        };
      }
      
      return property;
    }
    
    snapshot = await get(child(migratedPreleasedRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in migratedProperties/preleased`);
      const data = snapshot.val();
      
      // Handle nested preleased details structure
      let property = { id: snapshot.key, ...data };
      if (data.preleasedDetails) {
        const details = data.preleasedDetails;
        property = {
          ...property,
          tenant: details.tenant || data.tenant || '',
          category: details.category || data.category || 'Pre-Leased',
          buildingName: details.buildingName || data.buildingName || '',
          floor: details.floor || data.floor || '',
          totalArea: details.totalArea || data.totalArea || '',
          areaOnSale: details.areaOnSale || data.areaOnSale || '',
          rent: parseFloat(typeof details.rent === 'string' ? details.rent.replace(/[^0-9.]/g, '') : details.rent || '0') || data.rent || 0,
          leaseTerm: details.leaseTerm || data.leaseTerm || '',
          remainingLease: details.remainingLease || data.remainingLease || '',
          lockIn: details.lockIn || data.lockIn || '',
          escalation: details.escalation || data.escalation || '',
          securityDeposit: details.securityDeposit || data.securityDeposit || '',
          roi: details.roi || data.roi || '',
          propertyStatus: details.propertyStatus || data.propertyStatus || '',
          reference: details.reference || data.reference || '',
          channel: details.channel || data.channel || '',
          propertyType: details.propertyType || data.propertyType || 'Pre-Leased'
        };
      }
      
      return property;
    }
    
    snapshot = await get(child(migratedFranchiseRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in migratedProperties/franchise`);
      const data = snapshot.val();
      
      // Handle nested franchise details structure
      let franchiseData = data;
      if (data.franchiseDetails) {
        const details = data.franchiseDetails;
        franchiseData = {
          ...data,
          // Map nested fields to root level for compatibility
          name: data.title || data.name || details.name || details.brand || '',
          industry: details.industry || data.industry || '',
          segment: details.segment || data.segment || '',
          model: details.model || data.model || '',
          minArea: details.minArea || data.minArea || '',
          maxArea: details.maxArea || data.maxArea || '',
          minInvestment: details.minInvestment || data.minInvestment || '',
          maxInvestment: details.maxInvestment || data.maxInvestment || '',
          royalty: details.royalty || data.royalty || '',
          establishmentYear: details.establishmentYear || data.establishmentYear || '',
          franchiseStartedYear: details.franchiseStartedYear || data.franchiseStartedYear || '',
          numberOutlets: details.numberOfOutlets || details.numberOutlets || data.numberOutlets || '',
          minPaybackPeriod: details.minPaybackPeriod || data.minPaybackPeriod || '',
          maxPaybackPeriod: details.maxPaybackPeriod || data.maxPaybackPeriod || '',
          headquarter: details.headquarter || data.headquarter || data.location || '',
          remarks: data.description || details.remarks || data.remarks || '',
          image: data.images?.[0] || data.image || ''
        };
      }
      
      return {
        id: snapshot.key,
        title: franchiseData.name || franchiseData.title,
        category: 'Franchise',
        location: franchiseData.location || franchiseData.headquarter,
        price: franchiseData.investment || franchiseData.minInvestment,
        description: franchiseData.description,
        image: franchiseData.image,
        propertyType: 'Franchise',
        ...franchiseData
      };
    }
    
    snapshot = await get(child(migratedPlotsRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in migratedProperties/plots`);
      const data = snapshot.val();
      
      // Handle nested plot details structure
      let plotData = data;
      if (data.plotDetails) {
        const details = data.plotDetails;
        plotData = {
          ...data,
          // Extract from plotDetails if available
          project: details.project || data.title || 'Plot Project',
          developerName: details.developerName || 'Developer not specified',
          status: details.status || 'Available',
          plotSize: details.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
          investmentStartsFrom: details.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
          investorDiscoveryKit: details.investorDiscoveryKit || {
            title: 'Investor Discovery Kit',
            url: '',
            description: 'Investment information package'
          },
          keySalientFeatures: details.keySalientFeatures || []
        };
      }
      
      return {
        id: snapshot.key,
        title: plotData.project || plotData.title,
        category: 'Plot',
        location: plotData.location,
        price: plotData.investmentStartsFrom?.amount,
        description: plotData.description,
        image: plotData.images?.[0],
        propertyType: 'Plot',
        ...plotData
      };
    }
    
    // Fallback: Try legacy collections
    snapshot = await get(child(vacantPropertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy vacantProperties`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    snapshot = await get(child(preleasedPropertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy preleasedProperties`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    snapshot = await get(child(franchisePropertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy franchiseProperties`);
      const franchiseData = snapshot.val();
      return {
        id: snapshot.key,
        title: franchiseData.name || franchiseData.title,
        category: 'Franchise',
        location: franchiseData.location || franchiseData.headquarter,
        price: franchiseData.investment || franchiseData.minInvestment,
        description: franchiseData.description,
        image: franchiseData.image,
        propertyType: 'Franchise',
        ...franchiseData
      };
    }
    
    snapshot = await get(child(plotsRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy plots`);
      const plotData = snapshot.val();
      return {
        id: snapshot.key,
        title: plotData.project || plotData.title,
        category: 'Plot',
        location: plotData.location,
        price: plotData.investmentStartsFrom?.amount,
        description: plotData.description,
        image: plotData.images?.[0],
        propertyType: 'Plot',
        ...plotData
      };
    }
    
    // Try legacy type-specific collections
    snapshot = await get(child(vacantPropertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy vacantProperties`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    snapshot = await get(child(preleasedPropertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy preleasedProperties`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    snapshot = await get(child(franchisePropertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy franchiseProperties`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    snapshot = await get(child(plotsRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy plots`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    // Finally try generic properties collection
    snapshot = await get(child(propertiesRef, id));
    if (snapshot.exists()) {
      console.log(`[Firebase] Found property ${id} in legacy properties`);
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    console.log(`[Firebase] Property ${id} not found in any collection (searched migrated and legacy collections)`);
    return null;
  } catch (error) {
    console.error(`[Firebase] Error fetching property ${id}:`, error);
    throw error;
  }
}

// Function to generate unique property IDs in the new format
export function generateUniquePropertyId(propertyType: string, sequence: number): string {
  const prefixes: { [key: string]: string } = {
    'Franchise': 'PROP_FRAN',
    'franchise': 'PROP_FRAN',
    'Plot': 'PROP_PLOT', 
    'plot': 'PROP_PLOT',
    'Pre-Leased': 'PROP_PRLS',
    'preleased': 'PROP_PRLS',
    'Vacant': 'PROP_VCNT',
    'vacant': 'PROP_VCNT',
    'Regular': 'PROP_LEGC',
    'default': 'PROP_LEGC'
  };
  
  const prefix = prefixes[propertyType] || prefixes['default'];
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `${prefix}_${paddedSequence}`;
}

// Function to get the next sequence number for a property type
export async function getNextSequenceNumber(propertyType: string): Promise<number> {
  try {
    const appropriate_ref = getPropertyRefByType(propertyType || '');
    const snapshot = await get(appropriate_ref);
    
    let highestSequence = 0;
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        const idStr = childSnapshot.key;
        if (idStr) {
          // Check if it's a new format ID (PROP_XXXX_XXX)
          const match = idStr.match(/PROP_[A-Z]{4}_([0-9]{3})$/);
          if (match) {
            const sequence = parseInt(match[1]);
            if (!isNaN(sequence) && sequence > highestSequence) {
              highestSequence = sequence;
            }
          } else {
            // Handle legacy numeric IDs - convert them to sequence numbers
            const idNum = parseInt(idStr);
            if (!isNaN(idNum) && idNum > highestSequence) {
              highestSequence = idNum;
            }
          }
        }
      });
    }
    
    // Also check legacy collections to avoid ID conflicts
    let legacyRef;
    if (propertyType === 'Vacant' || propertyType === 'vacant') {
      legacyRef = vacantPropertiesRef;
    } else if (propertyType === 'Pre-Leased' || propertyType === 'preleased') {
      legacyRef = preleasedPropertiesRef;
    } else if (propertyType === 'Franchise' || propertyType === 'franchise') {
      legacyRef = franchisePropertiesRef;
    } else if (propertyType === 'Plot' || propertyType === 'plot') {
      legacyRef = plotsRef;
    }
    
    if (legacyRef) {
      const legacySnapshot = await get(legacyRef);
      if (legacySnapshot.exists()) {
        legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
          const idStr = childSnapshot.key;
          if (idStr) {
            const match = idStr.match(/PROP_[A-Z]{4}_([0-9]{3})$/);
            if (match) {
              const sequence = parseInt(match[1]);
              if (!isNaN(sequence) && sequence > highestSequence) {
                highestSequence = sequence;
              }
            } else {
              const idNum = parseInt(idStr);
              if (!isNaN(idNum) && idNum > highestSequence) {
                highestSequence = idNum;
              }
            }
          }
        });
      }
    }
    
    return highestSequence + 1;
  } catch (error) {
    console.error('Error getting next sequence number:', error);
    return 1; // Default to sequence 1 if there's an error
  }
}

// Function to add a new property with enhanced ID generation
export async function addProperty(property: Property): Promise<Property> {
  try {
    // Log the complete property data for debugging
    console.log('Adding property with the following data:', JSON.stringify(property));
    
    // Determine the appropriate reference based on property type
    const appropriate_ref = getPropertyRefByType(property.propertyType || '');
    console.log('Using reference:', appropriate_ref.key);
    
    // Get the next sequence number for this property type
    const sequenceNumber = await getNextSequenceNumber(property.propertyType || '');
    
    // Generate the new unique ID
    const uniqueId = generateUniquePropertyId(property.propertyType || '', sequenceNumber);
    console.log(`Generated unique ID: ${uniqueId} for property type: ${property.propertyType}`);
    
    // Ensure all fields from the property interface are included
    const completeProperty = {
      ...property,
      location: property.location || '',
      category: property.category || '',
      state: property.state || '',
      city: property.city || '',
      district: property.district || '',
      subDistrict: property.subDistrict || '',
      floor: property.floor || '',
      facing: property.facing || '',
      superArea: property.superArea || '',
      carpetArea: property.carpetArea || '',
      length: property.length || '',
      width: property.width || '',
      height: property.height || '',
      reference: property.reference || '',
      contactName: property.contactName || '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Use the unique ID
    await set(child(appropriate_ref, uniqueId), completeProperty);
    console.log(`Property saved successfully with ID: ${uniqueId}`);
    
    // Return the property with the new unique ID
    return { ...completeProperty, id: uniqueId };
  } catch (error) {
    console.error('Error adding property to Firebase:', error);
    throw error;
  }
}

// Function to update a property (uses type-organized structure)
export async function updateProperty(id: string, property: Property): Promise<Property> {
  try {
    console.log(`Updating property ${id} with propertyType: ${property.propertyType}`);
    
    // Get the appropriate reference based on property type (migrated structure)
    const appropriate_ref = getPropertyRefByType(property.propertyType || '');
    console.log(`Appropriate reference determined: ${appropriate_ref.key}`);
    
    // Boolean to track if we found the property in any collection
    let foundProperty = false;
    
    // Check all collections to find where the property exists (migrated first, then legacy)
    const migratedCollections = [migratedVacantRef, migratedPreleasedRef, migratedFranchiseRef, migratedPlotsRef];
    const legacyCollections = [vacantPropertiesRef, preleasedPropertiesRef, franchisePropertiesRef, plotsRef, propertiesRef];
    
    // First, check migrated collections
    for (const collectionRef of migratedCollections) {
      const tempSnapshot = await get(child(collectionRef, id));
      
      if (tempSnapshot.exists()) {
        foundProperty = true;
        console.log(`Found property ${id} in migrated collection: ${collectionRef.key}`);
        
        // If it's not in the right collection, move it
        if (collectionRef !== appropriate_ref) {
          console.log(`Moving property ${id} from ${collectionRef.key} to ${appropriate_ref.key}`);
          await remove(child(collectionRef, id));
          await set(child(appropriate_ref, id), {
            ...property,
            updatedAt: Date.now()
          });
          console.log(`Property ${id} moved successfully to ${appropriate_ref.key}`);
        } else {
          // It's already in the right collection, just update it
          console.log(`Updating property ${id} in place at ${collectionRef.key}`);
          await update(child(appropriate_ref, id), {
            ...property,
            updatedAt: Date.now()
          });
          console.log(`Property ${id} updated successfully in ${appropriate_ref.key}`);
        }
        
        break;
      }
    }
    
    // If not found in migrated collections, check legacy collections
    if (!foundProperty) {
      for (const collectionRef of legacyCollections) {
        const tempSnapshot = await get(child(collectionRef, id));
        
        if (tempSnapshot.exists()) {
          foundProperty = true;
          console.log(`Found property ${id} in legacy collection: ${collectionRef.key}`);
          
          // Move from legacy to appropriate migrated collection
          console.log(`Moving property ${id} from legacy ${collectionRef.key} to migrated ${appropriate_ref.key}`);
          await remove(child(collectionRef, id));
          await set(child(appropriate_ref, id), {
            ...property,
            updatedAt: Date.now()
          });
          console.log(`Property ${id} moved from legacy to migrated structure`);
          break;
        }
      }
    }
    
    // If property wasn't found anywhere, create it in the appropriate migrated collection
    if (!foundProperty) {
      console.log(`Creating new property ${id} in ${appropriate_ref.key}`);
      await set(child(appropriate_ref, id), {
        ...property,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      console.log(`New property ${id} created successfully in ${appropriate_ref.key}`);
    }
    
    return { ...property, id };
  } catch (error) {
    console.error('Error updating property in Firebase:', error);
    throw error;
  }
}

// Function to delete a property (checks both migrated and legacy collections)
export async function deleteProperty(id: string, propertyType?: string): Promise<boolean> {
  try {
    // Try to delete from all collections if property type is not specified
    if (!propertyType) {
      // Delete from migrated collections
      await remove(child(migratedVacantRef, id));
      await remove(child(migratedPreleasedRef, id));
      await remove(child(migratedFranchiseRef, id));
      await remove(child(migratedPlotsRef, id));
      // Also delete from legacy collections for safety
      await remove(child(vacantPropertiesRef, id));
      await remove(child(preleasedPropertiesRef, id));
      await remove(child(franchisePropertiesRef, id));
      await remove(child(plotsRef, id));
      await remove(child(propertiesRef, id));
    } else {
      // Delete from the appropriate migrated collection
      const appropriate_ref = getPropertyRefByType(propertyType);
      await remove(child(appropriate_ref, id));
      
      // Also try legacy collections for safety
      if (propertyType === 'Vacant' || propertyType === 'vacant') {
        await remove(child(vacantPropertiesRef, id));
      } else if (propertyType === 'Pre-Leased' || propertyType === 'preleased') {
        await remove(child(preleasedPropertiesRef, id));
      } else if (propertyType === 'Franchise' || propertyType === 'franchise') {
        await remove(child(franchisePropertiesRef, id));
      } else if (propertyType === 'Plot' || propertyType === 'plot') {
        await remove(child(plotsRef, id));
      } else {
        await remove(child(propertiesRef, id));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting property from Firebase:', error);
    throw error;
  }
}

// Function to get all franchises (uses migrated structure first)
export async function getAllFranchises(): Promise<Franchise[]> {
  try {
    const franchises: Franchise[] = [];
    console.log("Getting franchises from migrated structure first...");
    
    // Try migrated structure first
    const migratedSnapshot = await get(migratedFranchiseRef);
    console.log("Migrated snapshot exists:", migratedSnapshot.exists());
    if (migratedSnapshot.exists()) {
      migratedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        console.log("Processing migrated franchise item with key:", childSnapshot.key);
        const data = childSnapshot.val();
        // Updated validation for migrated structure - check for 'title' instead of 'name'
        if (data && typeof data === 'object' && ('title' in data || 'name' in data || 'franchiseDetails' in data)) {
          // Extract franchiseDetails for easier access
          const details = data.franchiseDetails || {};
          
          // Convert migrated structure back to expected franchise format
          const franchiseData = {
            id: childSnapshot.key,
            name: data.title || data.name || details.name || details.brand || 'Franchise Name',
            // Extract all fields from franchiseDetails
            industry: details.industry || data.industry || 'Not specified',
            segment: details.segment || data.segment || '',
            product: details.product || data.product || '',
            model: details.model || data.model || '',
            minArea: details.minArea || data.minArea || '',
            maxArea: details.maxArea || data.maxArea || '',
            // Preserve original investment strings for proper display
            minInvestment: details.minInvestment || data.minInvestment || '',
            maxInvestment: details.maxInvestment || data.maxInvestment || '',
            royalty: details.royalty || data.royalty || 'Not specified',
            establishmentYear: details.establishmentYear || data.establishmentYear || '',
            franchiseStartedYear: details.franchiseStartedYear || data.franchiseStartedYear || '',
            numberOutlets: details.numberOfOutlets || data.numberOutlets || '',
            minPaybackPeriod: details.minPaybackPeriod || data.minPaybackPeriod || '',
            maxPaybackPeriod: details.maxPaybackPeriod || data.maxPaybackPeriod || '',
            headquarter: details.headquarter || data.headquarter || data.location || 'Location not specified',
            // Legacy fields for compatibility - preserve original investment text
            investment: data.price || details.minInvestment || '',
            location: data.location || details.headquarter || 'Location not specified',
            status: 'Active',
            roi: details.royalty || 'Varies',
            description: data.description || '',
            image: data.images?.[0] || data.image || '',
            // Additional fields
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Include all original data for any missing fields
            ...data
          };
          franchises.push(franchiseData);
          console.log(`  ✅ Added migrated franchise: ${franchiseData.name} (${franchiseData.industry})`);
        } else {
          console.log(`  ⚠️  Invalid migrated franchise data: ${childSnapshot.key}`);
        }
      });
    }
    
    // Fallback to legacy franchiseProperties
    console.log("Getting reference to legacy franchiseProperties...");
    const legacySnapshot = await get(franchisePropertiesRef);
    console.log("Legacy snapshot exists:", legacySnapshot.exists());
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
        console.log("Processing legacy franchise item with key:", childSnapshot.key);
        const data = childSnapshot.val();
        if (data && typeof data === 'object' && 'name' in data) {
          franchises.push({
            id: childSnapshot.key,
            ...data
          });
          console.log(`  ✅ Added legacy franchise: ${data.name}`);
        }
      });
    } else {
      console.log("No legacy franchises found in database");
    }
    
    console.log("Returning", franchises.length, "franchises");
    return franchises;
  } catch (error) {
    console.error('Error fetching franchises from Firebase:', error);
    throw error;
  }
}

// Function to get all franchises - removed

// ====================== PLOTS FUNCTIONS ======================

// Function to get all plots (uses migrated structure first)
export async function getAllPlots(): Promise<Plot[]> {
  try {
    const plots: Plot[] = [];
    console.log("Getting plots from migrated structure first...");
    
    // Try migrated structure first
    const migratedSnapshot = await get(migratedPlotsRef);
    console.log("Migrated plots snapshot exists:", migratedSnapshot.exists());
    if (migratedSnapshot.exists()) {
      migratedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        console.log("Processing migrated plot item with key:", childSnapshot.key);
        const data = childSnapshot.val();
        // Updated validation for migrated structure - check for title or plotDetails
        if (data && typeof data === 'object' && ('title' in data || 'plotDetails' in data)) {
          // Convert migrated structure back to expected plot format
          const plotData = {
            id: childSnapshot.key,
            // Extract from plotDetails if available, otherwise use root level
            project: data.plotDetails?.project || data.title || 'Plot Project',
            developerName: data.plotDetails?.developerName || 'Developer not specified',
            description: data.description || '',
            status: data.plotDetails?.status || 'Available',
            plotSize: data.plotDetails?.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
            location: data.location || 'Location not specified',
            investmentStartsFrom: data.plotDetails?.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
            investorDiscoveryKit: data.plotDetails?.investorDiscoveryKit || {
              title: 'Investor Discovery Kit',
              url: '',
              description: 'Investment information package'
            },
            images: data.images || [],
            keySalientFeatures: data.plotDetails?.keySalientFeatures || [],
            // Include timestamps if available
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            // Include all original data
            ...data
          };
          plots.push(plotData);
          console.log(`  ✅ Added migrated plot: ${plotData.project}`);
        } else {
          console.log(`  ⚠️  Invalid migrated plot data: ${childSnapshot.key}`);
        }
      });
    }
    
    // Fallback to legacy plots
    console.log("Getting reference to legacy plots...");
    const legacySnapshot = await get(plotsRef);
    console.log("Legacy plots snapshot exists:", legacySnapshot.exists());
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
        console.log("Processing legacy plot item with key:", childSnapshot.key);
        const data = childSnapshot.val();
        if (data && typeof data === 'object' && 'project' in data && 'developerName' in data) {
          const plotData = {
            ...data,
            id: childSnapshot.key
          };
          plots.push(plotData);
          console.log(`  ✅ Added legacy plot: ${data.project}`);
        }
      });
    } else {
      console.log("No legacy plots found in database");
    }
    
    console.log("Returning", plots.length, "plots");
    return plots;
  } catch (error) {
    console.error('Error fetching plots from Firebase:', error);
    throw error;
  }
}

// Function to get a plot by ID (checks migrated structure first)
export async function getPlotById(id: string): Promise<Plot | null> {
  try {
    // Try migrated structure first
    let snapshot = await get(child(migratedPlotsRef, id));
    if (snapshot.exists()) {
      console.log(`Found plot ${id} in migrated structure`);
      return { ...snapshot.val(), id: snapshot.key };
    }
    
    // Fallback to legacy structure
    snapshot = await get(child(plotsRef, id));
    if (snapshot.exists()) {
      console.log(`Found plot ${id} in legacy structure`);
      return { ...snapshot.val(), id: snapshot.key };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching plot from Firebase:', error);
    throw error;
  }
}

// Function to add a new plot
export async function addPlot(plot: Plot): Promise<Plot> {
  try {
    console.log('Adding plot with the following data:', JSON.stringify(plot));
    
    // Get the next sequence number for plot properties
    const sequenceNumber = await getNextSequenceNumber('Plot');
    
    // Generate the new unique ID
    const uniqueId = generateUniquePropertyId('Plot', sequenceNumber);
    console.log(`Generated unique ID: ${uniqueId} for plot`);
    
    // Ensure all fields are included
    const completePlot = {
      ...plot,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Use the unique ID
    await set(child(plotsRef, uniqueId), completePlot);
    console.log(`Plot saved successfully with ID: ${uniqueId}`);
    
    // Return the plot with the new unique ID
    return { ...completePlot, id: uniqueId };
  } catch (error) {
    console.error('Error adding plot to Firebase:', error);
    throw error;
  }
}

// Function to update a plot
export async function updatePlot(id: string, plot: Plot): Promise<Plot> {
  try {
    console.log(`Updating plot ${id}`);
    
    let foundPlot = false;
    let targetRef = child(plotsRef, id); // Default to legacy
    
    // Check if plot exists in migrated collection first
    const migratedSnapshot = await get(child(migratedPlotsRef, id));
    if (migratedSnapshot.exists()) {
      console.log('Updating plot in migrated collection');
      targetRef = child(migratedPlotsRef, id);
      foundPlot = true;
    } else {
      // Check legacy collection
      const legacySnapshot = await get(child(plotsRef, id));
      if (legacySnapshot.exists()) {
        console.log('Updating plot in legacy collection');
        targetRef = child(plotsRef, id);
        foundPlot = true;
      }
    }
    
    if (!foundPlot) {
      console.log('Plot not found in any collection, creating in migrated collection');
      targetRef = child(migratedPlotsRef, id);
    }
    
    await update(targetRef, {
      ...plot,
      updatedAt: Date.now()
    });
    
    console.log(`Plot ${id} updated successfully`);
    return { ...plot, id };
  } catch (error) {
    console.error('Error updating plot in Firebase:', error);
    throw error;
  }
}

// Function to delete a plot
export async function deletePlot(id: string): Promise<boolean> {
  try {
    console.log(`Deleting plot ${id} from both collections`);
    
    // Delete from both migrated and legacy collections to ensure complete removal
    await remove(child(migratedPlotsRef, id));
    await remove(child(plotsRef, id));
    
    console.log(`Plot ${id} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting plot from Firebase:', error);
    throw error;
  }
} 