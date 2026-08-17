// Firestore properties module — Firestore-only CRUD for properties, franchises, and plots
// Migration complete: all operations go to Firestore exclusively.
//
// Firestore structure: properties/{id} with a `type` field ("vacant"|"preleased"|"franchise"|"plot")
// All functions have identical signatures to their firebase.ts counterparts
// so page components and API routes can switch imports without changes.

import { Property, Franchise, Plot } from '../firebase';
import { sortByNewest } from '@/lib/sort';

// Re-export types so consumers can migrate imports in one go
export type { Property, Franchise, Plot };

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

function propertiesCol() {
  return collection(firestoreDb, 'properties');
}

function propertyDoc(id: string) {
  return doc(firestoreDb, 'properties', id);
}

// ─── ID generation ─────────────────────────────────────────────────────────

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

async function getNextSequenceNumber(propertyType: string): Promise<number> {
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

// ─── Flatten helpers (normalize data structures) ────────────────────────────

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
  const snap = await getDocs(propertiesCol());
  const properties: Property[] = [];
  snap.forEach(d => {
    properties.push(flattenPropertyByType(d.id, d.data()));
  });
  return sortByNewest(properties);
}

// ─── getVacantProperties ─────────────────────────────────────────────────────

export async function getVacantProperties(): Promise<Property[]> {
  const q = fsQuery(propertiesCol(), where('type', '==', 'vacant'));
  const snap = await getDocs(q);
  const properties: Property[] = [];
  snap.forEach(d => properties.push(flattenVacant(d.id, d.data())));
  return sortByNewest(properties);
}

// ─── getPreleasedProperties ─────────────────────────────────────────────────

export async function getPreleasedProperties(): Promise<Property[]> {
  const q = fsQuery(propertiesCol(), where('type', '==', 'preleased'));
  const snap = await getDocs(q);
  const properties: Property[] = [];
  snap.forEach(d => properties.push(flattenPreleased(d.id, d.data())));
  return sortByNewest(properties);
}

// ─── getPropertyById ─────────────────────────────────────────────────────────

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!id || id.trim() === '') return null;
  const docSnap = await getDoc(propertyDoc(id));
  if (docSnap.exists()) {
    return flattenPropertyByType(docSnap.id, docSnap.data());
  }
  console.warn(`[Firestore Properties] Property ${id} not found in Firestore`);
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
  console.log('[Firestore Properties] Adding property:', JSON.stringify(property));

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

  await setDoc(propertyDoc(uniqueId), completeProperty);
  return { ...completeProperty, id: uniqueId } as Property;
}

// ─── updateProperty ──────────────────────────────────────────────────────────

export async function updateProperty(id: string, property: Property): Promise<Property> {
  console.log(`[Firestore Properties] Updating property ${id}`);

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

  await updateDoc(propertyDoc(id), sanitized);
  return { ...sanitized, id } as Property;
}

// ─── deleteProperty ──────────────────────────────────────────────────────────

export async function deleteProperty(id: string, propertyType?: string): Promise<boolean> {
  console.log(`[Firestore Properties] Deleting property ${id}`);
  await deleteDoc(propertyDoc(id));
  return true;
}

// ─── getAllFranchises ────────────────────────────────────────────────────────

export async function getAllFranchises(): Promise<Franchise[]> {
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
      minInvestment: fd.minInvestment || data.minInvestment || 0,
      maxInvestment: fd.maxInvestment || data.maxInvestment || 0,
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

// ─── getAllPlots ─────────────────────────────────────────────────────────────

export async function getAllPlots(): Promise<Plot[]> {
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

// ─── getPlotById ─────────────────────────────────────────────────────────────

export async function getPlotById(id: string): Promise<Plot | null> {
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

// ─── addPlot ─────────────────────────────────────────────────────────────────

export async function addPlot(plot: Plot): Promise<Plot> {
  console.log('[Firestore Properties] Adding plot');

  const sequenceNumber = await getNextSequenceNumber('Plot');
  const uniqueId = generateUniquePropertyId('Plot', sequenceNumber);

  const completePlot = {
    ...plot,
    type: 'plot',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(propertyDoc(uniqueId), completePlot);
  return { ...completePlot, id: uniqueId } as Plot;
}

// ─── updatePlot ──────────────────────────────────────────────────────────────

export async function updatePlot(id: string, plot: Plot): Promise<Plot> {
  console.log(`[Firestore Properties] Updating plot ${id}`);

  const updateData = { ...plot, type: 'plot', updatedAt: Date.now() };
  await updateDoc(propertyDoc(id), updateData);
  return { ...plot, id } as Plot;
}

// ─── deletePlot ──────────────────────────────────────────────────────────────

export async function deletePlot(id: string): Promise<boolean> {
  console.log(`[Firestore Properties] Deleting plot ${id}`);
  await deleteDoc(propertyDoc(id));
  return true;
}

// Re-export for backward compatibility
export function getPropertyRefByType(propertyType: string) {
  // This function is no longer needed in Firestore-only mode
  // but kept for API compatibility with code that imports it
  console.warn('[Firestore Properties] getPropertyRefByType is deprecated — all operations use Firestore');
  return null;
}
