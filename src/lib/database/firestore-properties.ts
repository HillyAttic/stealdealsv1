// Firestore properties module — parallel to firebase.ts property CRUD functions
// Routes to RTDB or Firestore based on MIGRATION_PHASE env var
//
// Firestore structure: properties/{id} with a `type` field ("vacant"|"preleased"|"franchise"|"plot")
// RTDB structure:      migratedProperties/{type}/{id}
//
// All functions have identical signatures to their firebase.ts counterparts
// so page components and API routes can switch imports without changes.

import { Property, Franchise, Plot } from '../firebase';
import { sortByNewest } from '@/lib/sort';

// RTDB imports (used when phase = rtdb)
import {
  database,
  migratedVacantRef,
  migratedPreleasedRef,
  migratedFranchiseRef,
  migratedPlotsRef,
  vacantPropertiesRef,
  preleasedPropertiesRef,
  franchisePropertiesRef,
  plotsRef,
  propertiesRef,
} from '../firebase';
import {
  ref as rtdbRef,
  get as rtdbGet,
  set as rtdbSet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  child as rtdbChild,
  DataSnapshot as RtdbDataSnapshot,
} from 'firebase/database';

// Firestore imports
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query as fsQuery,
  where,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { firestoreDb } from '../firestore';

type MigrationPhase = 'rtdb' | 'shadow' | 'dual-read' | 'firestore';

function getPhase(): MigrationPhase {
  return (process.env.MIGRATION_PHASE as MigrationPhase) || 'rtdb';
}

function propertiesCol() {
  return collection(firestoreDb, 'properties');
}

function propertyDoc(id: string) {
  return doc(firestoreDb, 'properties', id);
}

// ─── RTDB ref helpers (mirror firebase.ts) ──────────────────────────────────

function getPropertyRefByType(propertyType: string) {
  if (propertyType === 'Vacant' || propertyType === 'vacant') return migratedVacantRef;
  if (propertyType === 'Pre-Leased' || propertyType === 'preleased') return migratedPreleasedRef;
  if (propertyType === 'Franchise' || propertyType === 'franchise') return migratedFranchiseRef;
  if (propertyType === 'Plot' || propertyType === 'plot') return migratedPlotsRef;
  return migratedVacantRef;
}

// ─── ID generation (shared with firebase.ts) ─────────────────────────────────

export function generateUniquePropertyId(propertyType: string, sequence: number): string {
  const prefixes: { [key: string]: string } = {
    'Franchise': 'PROP_FRAN', 'franchise': 'PROP_FRAN',
    'Plot': 'PROP_PLOT', 'plot': 'PROP_PLOT',
    'Pre-Leased': 'PROP_PRLS', 'preleased': 'PROP_PRLS',
    'Vacant': 'PROP_VCNT', 'vacant': 'PROP_VCNT',
    'Regular': 'PROP_LEGC', 'default': 'PROP_LEGC',
  };
  const prefix = prefixes[propertyType] || prefixes['default'];
  return `${prefix}_${sequence.toString().padStart(3, '0')}`;
}

async function getNextSequenceNumberRTDB(propertyType: string): Promise<number> {
  const appropriateRef = getPropertyRefByType(propertyType || '');
  const snapshot = await rtdbGet(appropriateRef);
  let highest = 0;
  if (snapshot.exists()) {
    snapshot.forEach((child: RtdbDataSnapshot) => {
      const idStr = child.key;
      if (!idStr) return;
      const match = idStr.match(/PROP_[A-Z]{4}_([0-9]{3})$/);
      if (match) {
        const seq = parseInt(match[1]);
        if (!isNaN(seq) && seq > highest) highest = seq;
      } else {
        const num = parseInt(idStr);
        if (!isNaN(num) && num > highest) highest = num;
      }
    });
  }
  // Also check legacy collections
  let legacyRef = null;
  if (propertyType === 'Vacant' || propertyType === 'vacant') legacyRef = vacantPropertiesRef;
  else if (propertyType === 'Pre-Leased' || propertyType === 'preleased') legacyRef = preleasedPropertiesRef;
  else if (propertyType === 'Franchise' || propertyType === 'franchise') legacyRef = franchisePropertiesRef;
  else if (propertyType === 'Plot' || propertyType === 'plot') legacyRef = plotsRef;

  if (legacyRef) {
    const lsnap = await rtdbGet(legacyRef);
    if (lsnap.exists()) {
      lsnap.forEach((child: RtdbDataSnapshot) => {
        const idStr = child.key;
        if (!idStr) return;
        const match = idStr.match(/PROP_[A-Z]{4}_([0-9]{3})$/);
        if (match) {
          const seq = parseInt(match[1]);
          if (!isNaN(seq) && seq > highest) highest = seq;
        } else {
          const num = parseInt(idStr);
          if (!isNaN(num) && num > highest) highest = num;
        }
      });
    }
  }
  return highest + 1;
}

async function getNextSequenceNumberFirestore(propertyType: string): Promise<number> {
  const typeMap: Record<string, string> = {
    'Vacant': 'vacant', 'vacant': 'vacant',
    'Pre-Leased': 'preleased', 'preleased': 'preleased',
    'Franchise': 'franchise', 'franchise': 'franchise',
    'Plot': 'plot', 'plot': 'plot',
  };
  const fsType = typeMap[propertyType] || 'vacant';
  const snap = await getDocs(fsQuery(propertiesCol(), where('type', '==', fsType)));
  let highest = 0;
  snap.forEach(d => {
    const match = d.id.match(/PROP_[A-Z]{4}_([0-9]{3})$/);
    if (match) {
      const seq = parseInt(match[1]);
      if (!isNaN(seq) && seq > highest) highest = seq;
    }
  });
  return highest + 1;
}

export async function getNextSequenceNumber(propertyType: string): Promise<number> {
  const phase = getPhase();
  if (phase === 'firestore') return getNextSequenceNumberFirestore(propertyType);
  return getNextSequenceNumberRTDB(propertyType);
}

// ─── Flatten helpers (normalize RTDB nested structures) ─────────────────────

function flattenVacant(key: string, data: any): Property {
  const vd = data.vacantDetails || {};
  return {
    ...data,
    id: key,
    title: data.title || data.location || 'Vacant Property',
    category: vd.category || data.category || 'Industrial',
    location: data.location || vd.location || 'Location not specified',
    city: vd.city || data.city || '',
    state: vd.state || data.state || '',
    district: vd.district || data.district || '',
    subDistrict: vd.subDistrict || data.subDistrict || '',
    floor: vd.floor || data.floor || '',
    facing: vd.facing || data.facing || '',
    carpetArea: vd.carpetArea || data.carpetArea || '',
    superArea: vd.superArea || data.superArea || '',
    length: vd.length || data.length || '',
    width: vd.width || data.width || '',
    height: vd.height || data.height || '',
    rent: vd.rent || data.rent || data.price || 0,
    price: data.price || vd.rent || 0,
    contactName: vd.contactName || data.contactName || '',
    contactNumber: vd.contactNumber || data.contactNumber || '',
    reference: vd.reference || data.reference || '',
    propertyType: vd.propertyType || 'Vacant',
    unitType: vd.unitType || data.unitType || '',
    image: data.image || vd.image || '',
  };
}

function flattenPreleased(key: string, data: any): Property {
  const pd = data.preleasedDetails || {};
  return {
    ...data,
    id: key,
    title: data.title || pd.tenant || 'Preleased Property',
    tenant: pd.tenant || data.tenant || '',
    category: pd.category || data.category || 'Pre-Leased',
    buildingName: pd.buildingName || data.buildingName || '',
    floor: pd.floor || data.floor || '',
    totalArea: pd.totalArea || data.totalArea || '',
    areaOnSale: pd.areaOnSale || data.areaOnSale || '',
    rent: parseFloat(typeof pd.rent === 'string' ? pd.rent.replace(/[^0-9.]/g, '') : pd.rent || '0') || data.rent || 0,
    leaseTerm: pd.leaseTerm || data.leaseTerm || '',
    remainingLease: pd.remainingLease || data.remainingLease || '',
    lockIn: pd.lockIn || data.lockIn || '',
    escalation: pd.escalation || data.escalation || '',
    securityDeposit: pd.securityDeposit || data.securityDeposit || '',
    roi: pd.roi || data.roi || '',
    propertyStatus: pd.propertyStatus || data.propertyStatus || '',
    reference: pd.reference || data.reference || '',
    channel: pd.channel || data.channel || '',
    propertyType: pd.propertyType || 'Pre-Leased',
  };
}

function flattenFranchise(key: string, data: any): Property & Franchise {
  const fd = data.franchiseDetails || {};
  const franchiseData = {
    ...data,
    id: key,
    name: data.title || data.name || fd.name || fd.brand || 'Franchise Name',
    industry: fd.industry || data.industry || 'Not specified',
    segment: fd.segment || data.segment || '',
    product: fd.product || data.product || '',
    model: fd.model || data.model || '',
    minArea: fd.minArea || data.minArea || '',
    maxArea: fd.maxArea || data.maxArea || '',
    minInvestment: fd.minInvestment || data.minInvestment || '',
    maxInvestment: fd.maxInvestment || data.maxInvestment || '',
    royalty: fd.royalty || data.royalty || 'Not specified',
    establishmentYear: fd.establishmentYear || data.establishmentYear || '',
    franchiseStartedYear: fd.franchiseStartedYear || data.franchiseStartedYear || '',
    numberOutlets: fd.numberOfOutlets || fd.numberOutlets || data.numberOutlets || '',
    minPaybackPeriod: fd.minPaybackPeriod || data.minPaybackPeriod || '',
    maxPaybackPeriod: fd.maxPaybackPeriod || data.maxPaybackPeriod || '',
    headquarter: fd.headquarter || data.headquarter || data.location || 'Location not specified',
    investment: data.price || fd.minInvestment || '',
    location: data.location || fd.headquarter || 'Location not specified',
    status: 'Active',
    roi: fd.royalty || 'Varies',
    description: data.description || '',
    image: data.images?.[0] || data.image || '',
  };
  return {
    ...franchiseData,
    title: franchiseData.name,
    category: 'Franchise',
    price: franchiseData.investment || franchiseData.minInvestment,
    propertyType: 'Franchise',
  };
}

function flattenPlot(key: string, data: any): Plot & Property {
  const pd = data.plotDetails || {};
  const plotData = {
    ...data,
    id: key,
    project: pd.project || data.title || 'Plot Project',
    developerName: pd.developerName || 'Developer not specified',
    description: data.description || '',
    status: pd.status || 'Available',
    plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
    location: data.location || 'Location not specified',
    investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
    investorDiscoveryKit: pd.investorDiscoveryKit || { title: 'Investor Discovery Kit', url: '', description: '' },
    images: data.images || [],
    keySalientFeatures: pd.keySalientFeatures || [],
  };
  return {
    ...plotData,
    title: plotData.project,
    category: 'Plot',
    price: plotData.investmentStartsFrom?.amount,
    image: plotData.images?.[0],
    propertyType: 'Plot',
  };
}

function flattenPropertyByType(key: string, data: any): Property {
  const type = data.type;
  if (type === 'vacant') return flattenVacant(key, data);
  if (type === 'preleased') return flattenPreleased(key, data);
  if (type === 'franchise') return flattenFranchise(key, data);
  if (type === 'plot') return flattenPlot(key, data);
  // Fallback: return raw data with id
  return { ...data, id: key } as Property;
}

// ─── getAllProperties ────────────────────────────────────────────────────────

export async function getAllProperties(): Promise<Property[]> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const snap = await getDocs(propertiesCol());
    const properties: Property[] = [];
    snap.forEach(d => {
      properties.push(flattenPropertyByType(d.id, d.data()));
    });
    return sortByNewest(properties);
  }

  if (phase === 'dual-read') {
    try {
      const snap = await getDocs(propertiesCol());
      if (!snap.empty) {
        const properties: Property[] = [];
        snap.forEach(d => properties.push(flattenPropertyByType(d.id, d.data())));
        return sortByNewest(properties);
      }
    } catch (err) {
      console.warn('[Firestore Properties] getAllProperties failed, falling back to RTDB');
    }
  }

  // RTDB path (rtdb / shadow / dual-read fallback)
  const properties: Property[] = [];

  const vacantSnap = await rtdbGet(migratedVacantRef);
  if (vacantSnap.exists()) {
    vacantSnap.forEach((child: RtdbDataSnapshot) => {
      properties.push(flattenVacant(child.key!, child.val()));
    });
  }

  const preleasedSnap = await rtdbGet(migratedPreleasedRef);
  if (preleasedSnap.exists()) {
    preleasedSnap.forEach((child: RtdbDataSnapshot) => {
      properties.push(flattenPreleased(child.key!, child.val()));
    });
  }

  const franchiseSnap = await rtdbGet(migratedFranchiseRef);
  if (franchiseSnap.exists()) {
    franchiseSnap.forEach((child: RtdbDataSnapshot) => {
      const data = child.val();
      if (data && typeof data === 'object' && ('title' in data || 'name' in data || 'franchiseDetails' in data)) {
        properties.push(flattenFranchise(child.key!, data));
      }
    });
  }

  const plotsSnap = await rtdbGet(migratedPlotsRef);
  if (plotsSnap.exists()) {
    plotsSnap.forEach((child: RtdbDataSnapshot) => {
      const data = child.val();
      if (data && typeof data === 'object' && ('title' in data || 'plotDetails' in data)) {
        properties.push(flattenPlot(child.key!, data));
      }
    });
  }

  return sortByNewest(properties);
}

// ─── getVacantProperties ─────────────────────────────────────────────────────

export async function getVacantProperties(): Promise<Property[]> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const q = fsQuery(propertiesCol(), where('type', '==', 'vacant'));
    const snap = await getDocs(q);
    const properties: Property[] = [];
    snap.forEach(d => properties.push(flattenVacant(d.id, d.data())));
    return sortByNewest(properties);
  }

  if (phase === 'dual-read') {
    try {
      const q = fsQuery(propertiesCol(), where('type', '==', 'vacant'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const properties: Property[] = [];
        snap.forEach(d => properties.push(flattenVacant(d.id, d.data())));
        return sortByNewest(properties);
      }
    } catch (err) {
      console.warn('[Firestore Properties] getVacantProperties failed, falling back to RTDB');
    }
  }

  const properties: Property[] = [];
  const snap = await rtdbGet(migratedVacantRef);
  if (snap.exists()) {
    snap.forEach((child: RtdbDataSnapshot) => {
      properties.push(flattenVacant(child.key!, child.val()));
    });
  }
  return sortByNewest(properties);
}

// ─── getPreleasedProperties ─────────────────────────────────────────────────

export async function getPreleasedProperties(): Promise<Property[]> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const q = fsQuery(propertiesCol(), where('type', '==', 'preleased'));
    const snap = await getDocs(q);
    const properties: Property[] = [];
    snap.forEach(d => properties.push(flattenPreleased(d.id, d.data())));
    return sortByNewest(properties);
  }

  if (phase === 'dual-read') {
    try {
      const q = fsQuery(propertiesCol(), where('type', '==', 'preleased'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const properties: Property[] = [];
        snap.forEach(d => properties.push(flattenPreleased(d.id, d.data())));
        return sortByNewest(properties);
      }
    } catch (err) {
      console.warn('[Firestore Properties] getPreleasedProperties failed, falling back to RTDB');
    }
  }

  const properties: Property[] = [];
  const snap = await rtdbGet(migratedPreleasedRef);
  if (snap.exists()) {
    snap.forEach((child: RtdbDataSnapshot) => {
      properties.push({ id: child.key!, ...child.val() });
    });
  }
  return sortByNewest(properties);
}

// ─── getPropertyById ─────────────────────────────────────────────────────────

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!id || id.trim() === '') return null;
  const phase = getPhase();

  if (phase === 'firestore') {
    const docSnap = await getDoc(propertyDoc(id));
    if (docSnap.exists()) {
      return flattenPropertyByType(docSnap.id, docSnap.data());
    }
    return null;
  }

  if (phase === 'dual-read') {
    try {
      const docSnap = await getDoc(propertyDoc(id));
      if (docSnap.exists()) {
        return flattenPropertyByType(docSnap.id, docSnap.data());
      }
    } catch (err) {
      console.warn(`[Firestore Properties] getPropertyById(${id}) failed, falling back to RTDB`);
    }
  }

  // RTDB: check migrated collections in order
  const searches: Array<{ ref: any; flatten: (k: string, d: any) => Property }> = [
    { ref: migratedVacantRef, flatten: flattenVacant },
    { ref: migratedPreleasedRef, flatten: flattenPreleased },
    { ref: migratedFranchiseRef, flatten: (k, d) => flattenFranchise(k, d) as Property },
    { ref: migratedPlotsRef, flatten: (k, d) => flattenPlot(k, d) as Property },
  ];

  for (const { ref: collRef, flatten } of searches) {
    const snap = await rtdbGet(rtdbChild(collRef, id));
    if (snap.exists()) return flatten(id, snap.val());
  }

  // Legacy fallback
  const legacySearches = [franchisePropertiesRef, vacantPropertiesRef, preleasedPropertiesRef, plotsRef, propertiesRef];
  for (const legacyRef of legacySearches) {
    try {
      const lsnap = await rtdbGet(rtdbChild(legacyRef, id));
      if (lsnap.exists()) {
        const d = lsnap.val();
        return { ...d, id: lsnap.key || id } as Property;
      }
    } catch { /* continue */ }
  }

  return null;
}

// ─── getPropertiesByIds ──────────────────────────────────────────────────────

export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids || ids.length === 0) return [];
  const uniqueIds = [...new Set(ids)];
  const results = await Promise.all(uniqueIds.map(async id => {
    try {
      const p = await getPropertyById(id);
      return p ? { ...p, id } : null;
    } catch { return null; }
  }));
  return results.filter((p): p is Property => p !== null);
}

// ─── addProperty ─────────────────────────────────────────────────────────────

export async function addProperty(property: Property): Promise<Property> {
  const phase = getPhase();
  console.log('[Firestore Properties] Adding property (phase=%s):', phase, JSON.stringify(property));

  const typeMap: Record<string, string> = {
    'Vacant': 'vacant', 'vacant': 'vacant',
    'Pre-Leased': 'preleased', 'preleased': 'preleased',
    'Franchise': 'franchise', 'franchise': 'franchise',
    'Plot': 'plot', 'plot': 'plot',
  };
  const fsType = typeMap[property.propertyType || ''] || 'vacant';

  const sequenceNumber = await getNextSequenceNumber(property.propertyType || '');
  const uniqueId = generateUniquePropertyId(property.propertyType || '', sequenceNumber);
  console.log(`Generated unique ID: ${uniqueId}`);

  const completeProperty: Record<string, any> = {
    ...property,
    type: fsType,
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
    updatedAt: Date.now(),
  };

  if (phase === 'firestore') {
    await setDoc(propertyDoc(uniqueId), completeProperty);
    return { ...completeProperty, id: uniqueId } as Property;
  }

  // RTDB write
  const appropriateRef = getPropertyRefByType(property.propertyType || '');
  await rtdbSet(rtdbChild(appropriateRef, uniqueId), completeProperty);

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await setDoc(propertyDoc(uniqueId), completeProperty);
    } catch (err) {
      console.warn('[Firestore Properties] Shadow write failed for addProperty:', err);
    }
  }

  return { ...completeProperty, id: uniqueId } as Property;
}

// ─── updateProperty ──────────────────────────────────────────────────────────

export async function updateProperty(id: string, property: Property): Promise<Property> {
  const phase = getPhase();
  console.log(`[Firestore Properties] Updating property ${id} (phase=${phase})`);

  const sanitized: Record<string, any> = { ...property };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === undefined) delete sanitized[key];
  });

  const typeMap: Record<string, string> = {
    'Vacant': 'vacant', 'vacant': 'vacant',
    'Pre-Leased': 'preleased', 'preleased': 'preleased',
    'Franchise': 'franchise', 'franchise': 'franchise',
    'Plot': 'plot', 'plot': 'plot',
  };
  const fsType = typeMap[sanitized.propertyType || ''] || 'vacant';
  sanitized.type = fsType;
  sanitized.updatedAt = Date.now();

  if (phase === 'firestore') {
    await updateDoc(propertyDoc(id), sanitized);
    return { ...sanitized, id } as Property;
  }

  // RTDB: find property in migrated or legacy collections
  const migratedCollections = [migratedVacantRef, migratedPreleasedRef, migratedFranchiseRef, migratedPlotsRef];
  const appropriateRef = getPropertyRefByType(property.propertyType || '');
  let foundProperty = false;

  for (const collectionRef of migratedCollections) {
    const tempSnapshot = await rtdbGet(rtdbChild(collectionRef, id));
    if (tempSnapshot.exists()) {
      foundProperty = true;
      if (collectionRef !== appropriateRef) {
        await rtdbRemove(rtdbChild(collectionRef, id));
        await rtdbSet(rtdbChild(appropriateRef, id), sanitized);
      } else {
        await rtdbUpdate(rtdbChild(appropriateRef, id), sanitized);
      }
      break;
    }
  }

  if (!foundProperty) {
    const legacyCollections = [vacantPropertiesRef, preleasedPropertiesRef, franchisePropertiesRef, plotsRef, propertiesRef];
    for (const collectionRef of legacyCollections) {
      const tempSnapshot = await rtdbGet(rtdbChild(collectionRef, id));
      if (tempSnapshot.exists()) {
        foundProperty = true;
        await rtdbRemove(rtdbChild(collectionRef, id));
        await rtdbSet(rtdbChild(appropriateRef, id), sanitized);
        break;
      }
    }
  }

  if (!foundProperty) {
    await rtdbSet(rtdbChild(appropriateRef, id), { ...sanitized, createdAt: Date.now() });
  }

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await updateDoc(propertyDoc(id), sanitized);
    } catch (err) {
      console.warn('[Firestore Properties] Shadow update failed:', err);
    }
  }

  return { ...sanitized, id } as Property;
}

// ─── deleteProperty ──────────────────────────────────────────────────────────

export async function deleteProperty(id: string, propertyType?: string): Promise<boolean> {
  const phase = getPhase();
  console.log(`[Firestore Properties] Deleting property ${id} (phase=${phase})`);

  if (phase === 'firestore') {
    await deleteDoc(propertyDoc(id));
    return true;
  }

  // RTDB
  if (!propertyType) {
    await rtdbRemove(rtdbChild(migratedVacantRef, id));
    await rtdbRemove(rtdbChild(migratedPreleasedRef, id));
    await rtdbRemove(rtdbChild(migratedFranchiseRef, id));
    await rtdbRemove(rtdbChild(migratedPlotsRef, id));
    await rtdbRemove(rtdbChild(vacantPropertiesRef, id));
    await rtdbRemove(rtdbChild(preleasedPropertiesRef, id));
    await rtdbRemove(rtdbChild(franchisePropertiesRef, id));
    await rtdbRemove(rtdbChild(plotsRef, id));
    await rtdbRemove(rtdbChild(propertiesRef, id));
  } else {
    const appropriateRef = getPropertyRefByType(propertyType);
    await rtdbRemove(rtdbChild(appropriateRef, id));
    // Also clean legacy
    if (propertyType === 'Vacant' || propertyType === 'vacant') await rtdbRemove(rtdbChild(vacantPropertiesRef, id));
    else if (propertyType === 'Pre-Leased' || propertyType === 'preleased') await rtdbRemove(rtdbChild(preleasedPropertiesRef, id));
    else if (propertyType === 'Franchise' || propertyType === 'franchise') await rtdbRemove(rtdbChild(franchisePropertiesRef, id));
    else if (propertyType === 'Plot' || propertyType === 'plot') await rtdbRemove(rtdbChild(plotsRef, id));
    else await rtdbRemove(rtdbChild(propertiesRef, id));
  }

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await deleteDoc(propertyDoc(id));
    } catch (err) {
      console.warn('[Firestore Properties] Shadow delete failed:', err);
    }
  }

  return true;
}

// ─── getAllFranchises ────────────────────────────────────────────────────────

export async function getAllFranchises(): Promise<Franchise[]> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const q = fsQuery(propertiesCol(), where('type', '==', 'franchise'));
    const snap = await getDocs(q);
    const franchises: Franchise[] = [];
    snap.forEach(d => {
      const data = d.data();
      const fd = data.franchiseDetails || {};
      franchises.push({
        ...data,
        id: d.id,
        name: data.title || data.name || fd.name || 'Franchise Name',
        industry: fd.industry || data.industry || 'Not specified',
        segment: fd.segment || data.segment || '',
        model: fd.model || data.model || '',
        minArea: fd.minArea || data.minArea || '',
        maxArea: fd.maxArea || data.maxArea || '',
        minInvestment: fd.minInvestment || data.minInvestment || '',
        maxInvestment: fd.maxInvestment || data.maxInvestment || '',
        headquarter: fd.headquarter || data.headquarter || data.location || 'Not specified',
        investment: data.price || fd.minInvestment || 0,
        location: data.location || fd.headquarter || 'Not specified',
        status: 'Active',
        roi: fd.royalty || 'Varies',
        image: data.images?.[0] || data.image || '',
      } as Franchise);
    });
    return sortByNewest(franchises);
  }

  if (phase === 'dual-read') {
    try {
      const q = fsQuery(propertiesCol(), where('type', '==', 'franchise'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const franchises: Franchise[] = [];
        snap.forEach(d => {
          const data = d.data();
          const fd = data.franchiseDetails || {};
          franchises.push({
            ...data,
            id: d.id,
            name: data.title || data.name || fd.name || 'Franchise Name',
            industry: fd.industry || data.industry || 'Not specified',
            headquarter: fd.headquarter || data.headquarter || data.location || 'Not specified',
            investment: data.price || fd.minInvestment || 0,
            location: data.location || fd.headquarter || 'Not specified',
            status: 'Active',
            roi: fd.royalty || 'Varies',
            image: data.images?.[0] || data.image || '',
          } as Franchise);
        });
        return sortByNewest(franchises);
      }
    } catch (err) {
      console.warn('[Firestore Properties] getAllFranchises failed, falling back to RTDB');
    }
  }

  // RTDB
  const franchises: Franchise[] = [];
  const migratedSnap = await rtdbGet(migratedFranchiseRef);
  if (migratedSnap.exists()) {
    migratedSnap.forEach((child: RtdbDataSnapshot) => {
      const data = child.val();
      if (data && typeof data === 'object' && ('title' in data || 'name' in data || 'franchiseDetails' in data)) {
        const details = data.franchiseDetails || {};
        franchises.push({
          ...data,
          id: child.key,
          name: data.title || data.name || details.name || details.brand || 'Franchise Name',
          industry: details.industry || data.industry || 'Not specified',
          segment: details.segment || data.segment || '',
          product: details.product || data.product || '',
          model: details.model || data.model || '',
          minArea: details.minArea || data.minArea || '',
          maxArea: details.maxArea || data.maxArea || '',
          minInvestment: details.minInvestment || data.minInvestment || '',
          maxInvestment: details.maxInvestment || data.maxInvestment || '',
          royalty: details.royalty || data.royalty || 'Not specified',
          establishmentYear: details.establishmentYear || data.establishmentYear || '',
          franchiseStartedYear: details.franchiseStartedYear || data.franchiseStartedYear || '',
          numberOutlets: details.numberOfOutlets || details.numberOutlets || data.numberOutlets || '',
          minPaybackPeriod: details.minPaybackPeriod || data.minPaybackPeriod || '',
          maxPaybackPeriod: details.maxPaybackPeriod || data.maxPaybackPeriod || '',
          headquarter: details.headquarter || data.headquarter || data.location || 'Location not specified',
          investment: data.price || details.minInvestment || '',
          location: data.location || details.headquarter || 'Location not specified',
          status: 'Active',
          roi: details.royalty || 'Varies',
          description: data.description || '',
          image: data.images?.[0] || data.image || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });
  }

  // Legacy fallback
  const legacySnap = await rtdbGet(franchisePropertiesRef);
  if (legacySnap.exists()) {
    legacySnap.forEach((child: RtdbDataSnapshot) => {
      const data = child.val();
      if (data && typeof data === 'object' && 'name' in data) {
        franchises.push({ ...data, id: child.key });
      }
    });
  }

  return sortByNewest(franchises);
}

// ─── getAllPlots ─────────────────────────────────────────────────────────────

export async function getAllPlots(): Promise<Plot[]> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const q = fsQuery(propertiesCol(), where('type', '==', 'plot'));
    const snap = await getDocs(q);
    const plots: Plot[] = [];
    snap.forEach(d => {
      const data = d.data();
      const pd = data.plotDetails || {};
      plots.push({
        ...data,
        id: d.id,
        project: pd.project || data.title || 'Plot Project',
        developerName: pd.developerName || 'Developer not specified',
        description: data.description || '',
        status: pd.status || 'Available',
        plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
        location: data.location || 'Location not specified',
        investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
        investorDiscoveryKit: pd.investorDiscoveryKit || { title: 'Investor Discovery Kit', url: '', description: '' },
        images: data.images || [],
        keySalientFeatures: pd.keySalientFeatures || [],
      } as Plot);
    });
    return sortByNewest(plots);
  }

  if (phase === 'dual-read') {
    try {
      const q = fsQuery(propertiesCol(), where('type', '==', 'plot'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const plots: Plot[] = [];
        snap.forEach(d => {
          const data = d.data();
          const pd = data.plotDetails || {};
          plots.push({
            ...data,
            id: d.id,
            project: pd.project || data.title || 'Plot Project',
            developerName: pd.developerName || 'Developer not specified',
            status: pd.status || 'Available',
            plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
            location: data.location || 'Location not specified',
            investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
            investorDiscoveryKit: pd.investorDiscoveryKit || { title: 'Investor Discovery Kit', url: '', description: '' },
            images: data.images || [],
            keySalientFeatures: pd.keySalientFeatures || [],
          } as Plot);
        });
        return sortByNewest(plots);
      }
    } catch (err) {
      console.warn('[Firestore Properties] getAllPlots failed, falling back to RTDB');
    }
  }

  // RTDB
  const plots: Plot[] = [];
  const migratedSnap = await rtdbGet(migratedPlotsRef);
  if (migratedSnap.exists()) {
    migratedSnap.forEach((child: RtdbDataSnapshot) => {
      const data = child.val();
      if (data && typeof data === 'object' && ('title' in data || 'plotDetails' in data)) {
        const pd = data.plotDetails || {};
        plots.push({
          ...data,
          id: child.key,
          project: pd.project || data.title || 'Plot Project',
          developerName: pd.developerName || 'Developer not specified',
          description: data.description || '',
          status: pd.status || 'Available',
          plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
          location: data.location || 'Location not specified',
          investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
          investorDiscoveryKit: pd.investorDiscoveryKit || { title: 'Investor Discovery Kit', url: '', description: '' },
          images: data.images || [],
          keySalientFeatures: pd.keySalientFeatures || [],
        });
      }
    });
  }

  const legacySnap = await rtdbGet(plotsRef);
  if (legacySnap.exists()) {
    legacySnap.forEach((child: RtdbDataSnapshot) => {
      const data = child.val();
      if (data && typeof data === 'object' && 'project' in data && 'developerName' in data) {
        plots.push({ ...data, id: child.key });
      }
    });
  }

  return sortByNewest(plots);
}

// ─── getPlotById ─────────────────────────────────────────────────────────────

export async function getPlotById(id: string): Promise<Plot | null> {
  const phase = getPhase();

  if (phase === 'firestore') {
    const docSnap = await getDoc(propertyDoc(id));
    if (docSnap.exists() && docSnap.data().type === 'plot') {
      const data = docSnap.data();
      const pd = data.plotDetails || {};
      return {
        ...data,
        id: docSnap.id,
        project: pd.project || data.title || 'Plot Project',
        developerName: pd.developerName || 'Developer not specified',
        status: pd.status || 'Available',
        plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
        investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
        investorDiscoveryKit: pd.investorDiscoveryKit || { title: '', url: '', description: '' },
        images: data.images || [],
        keySalientFeatures: pd.keySalientFeatures || [],
      } as Plot;
    }
    return null;
  }

  if (phase === 'dual-read') {
    try {
      const docSnap = await getDoc(propertyDoc(id));
      if (docSnap.exists() && docSnap.data().type === 'plot') {
        const data = docSnap.data();
        const pd = data.plotDetails || {};
        return {
          ...data,
          id: docSnap.id,
          project: pd.project || data.title || 'Plot Project',
          developerName: pd.developerName || 'Developer not specified',
          status: pd.status || 'Available',
          plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
          investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
          investorDiscoveryKit: pd.investorDiscoveryKit || { title: '', url: '', description: '' },
          images: data.images || [],
          keySalientFeatures: pd.keySalientFeatures || [],
        } as Plot;
      }
    } catch (err) {
      console.warn(`[Firestore Properties] getPlotById(${id}) failed, falling back to RTDB`);
    }
  }

  let snap = await rtdbGet(rtdbChild(migratedPlotsRef, id));
  if (snap.exists()) {
    const data = snap.val();
    const pd = data.plotDetails || {};
    return { ...data, id: snap.key, project: pd.project || data.title || 'Plot Project', developerName: pd.developerName || 'Developer not specified', status: pd.status || 'Available', plotSize: pd.plotSize || { min: 0, max: 0, unit: 'sq.ft' }, investmentStartsFrom: pd.investmentStartsFrom || { amount: 0, unit: 'sq.ft' }, investorDiscoveryKit: pd.investorDiscoveryKit || { title: '', url: '', description: '' }, images: data.images || [], keySalientFeatures: pd.keySalientFeatures || [] } as Plot;
  }
  snap = await rtdbGet(rtdbChild(plotsRef, id));
  if (snap.exists()) return { ...snap.val(), id: snap.key };
  return null;
}

// ─── addPlot ─────────────────────────────────────────────────────────────────

export async function addPlot(plot: Plot): Promise<Plot> {
  const phase = getPhase();
  console.log('[Firestore Properties] Adding plot (phase=%s)', phase);

  const sequenceNumber = await getNextSequenceNumber('Plot');
  const uniqueId = generateUniquePropertyId('Plot', sequenceNumber);

  const completePlot = {
    ...plot,
    type: 'plot',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (phase === 'firestore') {
    await setDoc(propertyDoc(uniqueId), completePlot);
    return { ...completePlot, id: uniqueId } as Plot;
  }

  await rtdbSet(rtdbChild(migratedPlotsRef, uniqueId), completePlot);

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await setDoc(propertyDoc(uniqueId), completePlot);
    } catch (err) {
      console.warn('[Firestore Properties] Shadow addPlot failed:', err);
    }
  }

  return { ...completePlot, id: uniqueId } as Plot;
}

// ─── updatePlot ──────────────────────────────────────────────────────────────

export async function updatePlot(id: string, plot: Plot): Promise<Plot> {
  const phase = getPhase();
  console.log(`[Firestore Properties] Updating plot ${id} (phase=${phase})`);

  const updateData = { ...plot, type: 'plot', updatedAt: Date.now() };

  if (phase === 'firestore') {
    await updateDoc(propertyDoc(id), updateData);
    return { ...plot, id } as Plot;
  }

  // RTDB: find in migrated or legacy
  let targetRef = rtdbChild(migratedPlotsRef, id);
  let found = false;

  const migratedSnap = await rtdbGet(rtdbChild(migratedPlotsRef, id));
  if (migratedSnap.exists()) {
    found = true;
  } else {
    const legacySnap = await rtdbGet(rtdbChild(plotsRef, id));
    if (legacySnap.exists()) {
      found = true;
      targetRef = rtdbChild(plotsRef, id);
    }
  }

  if (!found) {
    targetRef = rtdbChild(migratedPlotsRef, id);
  }

  await rtdbUpdate(targetRef, updateData);

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await updateDoc(propertyDoc(id), updateData);
    } catch (err) {
      console.warn('[Firestore Properties] Shadow updatePlot failed:', err);
    }
  }

  return { ...plot, id } as Plot;
}

// ─── deletePlot ──────────────────────────────────────────────────────────────

export async function deletePlot(id: string): Promise<boolean> {
  const phase = getPhase();
  console.log(`[Firestore Properties] Deleting plot ${id} (phase=${phase})`);

  if (phase === 'firestore') {
    await deleteDoc(propertyDoc(id));
    return true;
  }

  await rtdbRemove(rtdbChild(migratedPlotsRef, id));
  await rtdbRemove(rtdbChild(plotsRef, id));

  if (phase === 'shadow' || phase === 'dual-read') {
    try {
      await deleteDoc(propertyDoc(id));
    } catch (err) {
      console.warn('[Firestore Properties] Shadow deletePlot failed:', err);
    }
  }

  return true;
}

// Re-export ref helper for backward compatibility with code that imports it from this module
export { getPropertyRefByType };
