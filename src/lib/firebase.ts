// Firebase configuration for StealDeals app
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, get, push, child, update, remove, DataSnapshot } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
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

// Properties collection references - separate for vacant and preleased
const propertiesRef = ref(database, 'properties'); // Legacy reference for backward compatibility
const vacantPropertiesRef = ref(database, 'vacantProperties');
const preleasedPropertiesRef = ref(database, 'preleasedProperties');
const franchisePropertiesRef = ref(database, 'franchiseProperties');
const plotsRef = ref(database, 'plots');

// Export references
export { 
  app,
  database, 
  auth,
  propertiesRef, 
  vacantPropertiesRef, 
  preleasedPropertiesRef,
  franchisePropertiesRef,
  plotsRef
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
  images: string[]; // Array of image URLs
  createdAt?: number;
  updatedAt?: number;
}

// Function to get the appropriate reference based on property type
export function getPropertyRefByType(propertyType: string) {
  console.log(`Getting reference for property type: "${propertyType}"`);
  
  if (propertyType === 'Vacant') {
    console.log('Using vacantPropertiesRef');
    return vacantPropertiesRef;
  } else if (propertyType === 'Pre-Leased') {
    console.log('Using preleasedPropertiesRef');
    return preleasedPropertiesRef;
  }
  
  console.log('Using default propertiesRef (legacy)');
  return propertiesRef; // Fallback to legacy reference
}

// Function to get all properties (combines both vacant and preleased)
export async function getAllProperties(): Promise<Property[]> {
  try {
    const properties: Property[] = [];
    
    // Get vacant properties
    const vacantSnapshot = await get(vacantPropertiesRef);
    if (vacantSnapshot.exists()) {
      vacantSnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Get preleased properties
    const preleasedSnapshot = await get(preleasedPropertiesRef);
    if (preleasedSnapshot.exists()) {
      preleasedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Get legacy properties (for backward compatibility)
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

// Function to get all vacant properties
export async function getVacantProperties(): Promise<Property[]> {
  try {
    const properties: Property[] = [];
    const snapshot = await get(vacantPropertiesRef);
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Also check legacy properties for backward compatibility
    const legacySnapshot = await get(propertiesRef);
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
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

// Function to get all preleased properties
export async function getPreleasedProperties(): Promise<Property[]> {
  try {
    const properties: Property[] = [];
    const snapshot = await get(preleasedPropertiesRef);
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
    }
    
    // Also check legacy properties for backward compatibility
    const legacySnapshot = await get(propertiesRef);
    if (legacySnapshot.exists()) {
      legacySnapshot.forEach((childSnapshot: DataSnapshot) => {
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

// Function to get a property by ID (checks all property collections)
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    // Try vacant properties first
    let snapshot = await get(child(vacantPropertiesRef, id));
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    // Try preleased properties next
    snapshot = await get(child(preleasedPropertiesRef, id));
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    // Finally check legacy properties
    snapshot = await get(child(propertiesRef, id));
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching property from Firebase:', error);
    throw error;
  }
}

// Function to add a new property
export async function addProperty(property: Property): Promise<Property> {
  try {
    // Log the complete property data for debugging
    console.log('Adding property with the following data:', JSON.stringify(property));
    
    // Determine the appropriate reference based on property type
    const appropriate_ref = getPropertyRefByType(property.propertyType || '');
    console.log('Using reference:', appropriate_ref.key);
    
    // Get all existing properties to find the highest ID
    const snapshot = await get(appropriate_ref);
    let highestId = 0;
    
    if (snapshot.exists()) {
      // Find the highest existing numeric ID
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        const idStr = childSnapshot.key;
        if (idStr) {
          const idNum = parseInt(idStr);
          if (!isNaN(idNum) && idNum > highestId) {
            highestId = idNum;
          }
        }
      });
    }
    
    // Next ID should be one higher than the highest existing ID
    const nextId = highestId + 1;
    const sequentialId = nextId.toString();
    
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
    
    // Use the sequential ID
    await set(child(appropriate_ref, sequentialId), completeProperty);
    console.log(`Property saved successfully with ID: ${sequentialId}`);
    
    // Return the property with the new sequential ID
    return { ...completeProperty, id: sequentialId };
  } catch (error) {
    console.error('Error adding property to Firebase:', error);
    throw error;
  }
}

// Function to update a property
export async function updateProperty(id: string, property: Property): Promise<Property> {
  try {
    console.log(`Updating property ${id} with propertyType: ${property.propertyType}`);
    
    // Get the appropriate reference based on property type
    const appropriate_ref = getPropertyRefByType(property.propertyType || '');
    console.log(`Appropriate reference determined: ${appropriate_ref.key}`);
    
    // Boolean to track if we found the property in any collection
    let foundProperty = false;
    
    // Check all collections to find where the property exists
    const collections = [vacantPropertiesRef, preleasedPropertiesRef, propertiesRef];
    
    // First, try to find where the property currently exists
    for (const collectionRef of collections) {
      const tempSnapshot = await get(child(collectionRef, id));
      
      if (tempSnapshot.exists()) {
        foundProperty = true;
        console.log(`Found property ${id} in collection: ${collectionRef.key}`);
        
        // If it's not in the right collection, delete it from the current collection
        if (collectionRef !== appropriate_ref) {
          console.log(`Moving property ${id} from ${collectionRef.key} to ${appropriate_ref.key}`);
          await remove(child(collectionRef, id));
          
          // Add it to the correct collection
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
    
    // If property wasn't found anywhere, create it in the appropriate collection
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

// Function to delete a property
export async function deleteProperty(id: string, propertyType?: string): Promise<boolean> {
  try {
    // Try to delete from all collections if property type is not specified
    if (!propertyType) {
      await remove(child(vacantPropertiesRef, id));
      await remove(child(preleasedPropertiesRef, id));
      await remove(child(propertiesRef, id));
    } else {
      // Delete from the appropriate collection
      const appropriate_ref = getPropertyRefByType(propertyType);
      await remove(child(appropriate_ref, id));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting property from Firebase:', error);
    throw error;
  }
}

// Function to get all franchises
export async function getAllFranchises(): Promise<Franchise[]> {
  try {
    const franchises: Franchise[] = [];
    console.log("Getting reference to franchiseProperties...");
    const franchisesRef = ref(database, 'franchiseProperties');
    console.log("Fetching snapshot from franchiseProperties...");
    const snapshot = await get(franchisesRef);
    
    console.log("Snapshot exists:", snapshot.exists());
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        console.log("Processing franchise item with key:", childSnapshot.key);
        const data = childSnapshot.val();
        // Validate that this is a valid franchise object before adding
        if (data && 
            typeof data === 'object' && 
            'name' in data) {  // Only check for name as required field
          franchises.push({
            id: childSnapshot.key,
            ...data
          });
        }
      });
    } else {
      console.log("No franchises found in database");
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

// Function to get all plots
export async function getAllPlots(): Promise<Plot[]> {
  try {
    const plots: Plot[] = [];
    console.log("Getting reference to plots...");
    const snapshot = await get(plotsRef);
    
    console.log("Snapshot exists:", snapshot.exists());
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        console.log("Processing plot item with key:", childSnapshot.key);
        const data = childSnapshot.val();
        // Validate that this is a valid plot object before adding
        if (data && 
            typeof data === 'object' && 
            'project' in data && 
            'developerName' in data) {
          const plotData = {
            ...data,
            id: childSnapshot.key  // Ensure key overrides any id in data
          };
          plots.push(plotData);
        }
      });
    } else {
      console.log("No plots found in database");
    }
    
    console.log("Returning", plots.length, "plots");
    return plots;
  } catch (error) {
    console.error('Error fetching plots from Firebase:', error);
    throw error;
  }
}

// Function to get a plot by ID
export async function getPlotById(id: string): Promise<Plot | null> {
  try {
    const snapshot = await get(child(plotsRef, id));
    if (snapshot.exists()) {
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
    
    // Get all existing plots to find the highest ID
    const snapshot = await get(plotsRef);
    let highestId = 0;
    
    if (snapshot.exists()) {
      // Find the highest existing numeric ID
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        const idStr = childSnapshot.key;
        if (idStr) {
          const idNum = parseInt(idStr);
          if (!isNaN(idNum) && idNum > highestId) {
            highestId = idNum;
          }
        }
      });
    }
    
    // Next ID should be one higher than the highest existing ID
    const nextId = highestId + 1;
    const sequentialId = nextId.toString();
    
    // Ensure all fields are included
    const completePlot = {
      ...plot,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Use the sequential ID
    await set(child(plotsRef, sequentialId), completePlot);
    console.log(`Plot saved successfully with ID: ${sequentialId}`);
    
    // Return the plot with the new sequential ID
    return { ...completePlot, id: sequentialId };
  } catch (error) {
    console.error('Error adding plot to Firebase:', error);
    throw error;
  }
}

// Function to update a plot
export async function updatePlot(id: string, plot: Plot): Promise<Plot> {
  try {
    console.log(`Updating plot ${id}`);
    
    await update(child(plotsRef, id), {
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
    await remove(child(plotsRef, id));
    return true;
  } catch (error) {
    console.error('Error deleting plot from Firebase:', error);
    throw error;
  }
} 