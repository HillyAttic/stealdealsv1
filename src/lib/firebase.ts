// Firebase configuration for StealDeals app
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, child, update, remove, DataSnapshot } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVT3Fv_tWM8FuZ9hHnsdGmdfhp-uow_bg",
  authDomain: "stealdeals-e89ab.firebaseapp.com",
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab",
  storageBucket: "stealdeals-e89ab.firebasestorage.app",
  messagingSenderId: "836598569233",
  appId: "1:836598569233:web:a46668a6e140493d6f14b0",
  measurementId: "G-71EPMH0ZW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Properties collection reference
const propertiesRef = ref(database, 'properties');

// Property interface matching our application's property structure
export interface Property {
  id?: string | null;
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
  image?: string; // Image URL for the property
}

// Function to get all properties
export async function getAllProperties(): Promise<Property[]> {
  try {
    const snapshot = await get(propertiesRef);
    if (snapshot.exists()) {
      // Convert the Firebase object to an array with IDs included
      const properties: Property[] = [];
      snapshot.forEach((childSnapshot: DataSnapshot) => {
        properties.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return properties;
    }
    return [];
  } catch (error) {
    console.error('Error fetching properties from Firebase:', error);
    throw error;
  }
}

// Function to get a property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const snapshot = await get(child(propertiesRef, id));
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
    // Generate a new property ID using push()
    const newPropertyRef = push(propertiesRef);
    // Save the property with the new ID
    await set(newPropertyRef, property);
    // Return the ID of the newly created property
    return { id: newPropertyRef.key, ...property };
  } catch (error) {
    console.error('Error adding property to Firebase:', error);
    throw error;
  }
}

// Function to update a property
export async function updateProperty(id: string, property: Property): Promise<Property> {
  try {
    await update(child(propertiesRef, id), property);
    return { id, ...property };
  } catch (error) {
    console.error('Error updating property in Firebase:', error);
    throw error;
  }
}

// Function to delete a property
export async function deleteProperty(id: string): Promise<boolean> {
  try {
    await remove(child(propertiesRef, id));
    return true;
  } catch (error) {
    console.error('Error deleting property from Firebase:', error);
    throw error;
  }
}

export { database }; 