// Firebase optimized functions for StealDeals app
import { Property } from '@/lib/firebase';
import { get, child, DataSnapshot } from 'firebase/database';
import { 
  migratedVacantRef, 
  migratedPreleasedRef, 
  migratedFranchiseRef, 
  migratedPlotsRef 
} from '@/lib/firebase';

/**
 * Get a property by ID (OPTIMIZED VERSION - MIGRATED ONLY)
 * This function fetches all collections in parallel and searches for the property
 */
export async function getPropertyByIdOptimized(id: string): Promise<Property | null> {
  try {
    if (!id || id.trim() === '') {
      console.log(`[Firebase Optimized] Invalid property ID provided: "${id}"`);
      return null;
    }
    
    console.log(`[Firebase Optimized] Optimized search for property ID: "${id}" in MIGRATED collections only`);
    
    // OPTIMIZATION: Fetch all collections in parallel and search
    const [vacantSnapshot, preleasedSnapshot, franchiseSnapshot, plotsSnapshot] = await Promise.all([
      get(child(migratedVacantRef, id)),
      get(child(migratedPreleasedRef, id)),
      get(child(migratedFranchiseRef, id)),
      get(child(migratedPlotsRef, id))
    ]);
    
    // Check vacant properties
    if (vacantSnapshot.exists()) {
      console.log(`[Firebase Optimized] Found property ${id} in migratedProperties/vacant`);
      const data = vacantSnapshot.val();
      
      // Handle nested vacant details structure
      let property = { id: vacantSnapshot.key, ...data };
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
    
    // Check preleased properties
    if (preleasedSnapshot.exists()) {
      console.log(`[Firebase Optimized] Found property ${id} in migratedProperties/preleased`);
      const data = preleasedSnapshot.val();
      
      // Handle nested preleased details structure
      let property = { id: preleasedSnapshot.key, ...data };
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
    
    // Check franchise properties
    if (franchiseSnapshot.exists()) {
      console.log(`[Firebase Optimized] Found property ${id} in migratedProperties/franchise`);
      const data = franchiseSnapshot.val();
      
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
        id: franchiseSnapshot.key,
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
    
    // Check plot properties
    if (plotsSnapshot.exists()) {
      console.log(`[Firebase Optimized] Found property ${id} in migratedProperties/plots`);
      const data = plotsSnapshot.val();
      
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
        id: plotsSnapshot.key,
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
    
    console.log(`[Firebase Optimized] ❌ Property ${id} not found in any MIGRATED collections`);
    return null;
  } catch (error) {
    console.error(`[Firebase Optimized] Error fetching property ${id}:`, error);
    throw error;
  }
}

/**
 * Get multiple properties by IDs in batch (OPTIMIZED VERSION - MIGRATED ONLY)
 * This function fetches all properties in parallel from each collection to avoid the N+1 problem
 */
export async function getPropertiesByIdsOptimized(ids: string[]): Promise<Property[]> {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    console.log(`[Firebase Optimized] Optimized batch fetching ${ids.length} properties from MIGRATED collections only`);
    
    // Remove duplicates
    const uniqueIds = [...new Set(ids)];
    
    // OPTIMIZATION: Fetch all properties in parallel from each collection
    // This avoids the N+1 problem of individual property lookups
    const allProperties: Property[] = [];
    
    // Fetch from all migrated collections in parallel
    const [vacantSnapshot, preleasedSnapshot, franchiseSnapshot, plotsSnapshot] = await Promise.all([
      get(migratedVacantRef),
      get(migratedPreleasedRef),
      get(migratedFranchiseRef),
      get(migratedPlotsRef)
    ]);
    
    // Process vacant properties
    if (vacantSnapshot.exists()) {
      vacantSnapshot.forEach((childSnapshot: DataSnapshot) => {
        if (uniqueIds.includes(childSnapshot.key!)) {
          const data = childSnapshot.val();
          const vacantDetails = data.vacantDetails || {};
          
          // Flatten the nested structure for vacant properties
          allProperties.push({
            id: childSnapshot.key,
            title: data.title || data.location || 'Vacant Property',
            // Extract from vacantDetails
            category: vacantDetails.category || data.category || 'Industrial',
            location: data.location || vacantDetails.location || 'Location not specified',
            city: vacantDetails.city || data.city || '',
            state: vacantDetails.state || data.state || '',
            district: vacantDetails.district || data.district || '',
            subDistrict: vacantDetails.subDistrict || data.subDistrict || '',
            floor: vacantDetails.floor || data.floor || '',
            facing: vacantDetails.facing || data.facing || '',
            carpetArea: vacantDetails.carpetArea || data.carpetArea || '',
            superArea: vacantDetails.superArea || data.superArea || '',
            length: vacantDetails.length || data.length || '',
            width: vacantDetails.width || data.width || '',
            height: vacantDetails.height || data.height || '',
            rent: vacantDetails.rent || data.rent || data.price || 0,
            price: data.price || vacantDetails.rent || 0,
            contactName: vacantDetails.contactName || data.contactName || '',
            contactNumber: vacantDetails.contactNumber || data.contactNumber || '',
            reference: vacantDetails.reference || data.reference || '',
            propertyType: vacantDetails.propertyType || 'Vacant',
            unitType: vacantDetails.unitType || data.unitType || '',
            image: data.image || vacantDetails.image || '',
            // Include all original data
            ...data
          });
        }
      });
    }
    
    // Process preleased properties
    if (preleasedSnapshot.exists()) {
      preleasedSnapshot.forEach((childSnapshot: DataSnapshot) => {
        if (uniqueIds.includes(childSnapshot.key!)) {
          const data = childSnapshot.val();
          const preleasedDetails = data.preleasedDetails || {};
          
          // Flatten the nested structure for preleased properties
          allProperties.push({
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
        }
      });
    }
    
    // Process franchise properties
    if (franchiseSnapshot.exists()) {
      franchiseSnapshot.forEach((childSnapshot: DataSnapshot) => {
        if (uniqueIds.includes(childSnapshot.key!)) {
          const data = childSnapshot.val();
          const franchiseDetails = data.franchiseDetails || {};
          
          // Flatten the nested structure for franchise properties
          const franchiseData = {
            ...data,
            // Map nested fields to root level for compatibility
            name: data.title || data.name || franchiseDetails.name || franchiseDetails.brand || '',
            industry: franchiseDetails.industry || data.industry || '',
            segment: franchiseDetails.segment || data.segment || '',
            model: franchiseDetails.model || data.model || '',
            minArea: franchiseDetails.minArea || data.minArea || '',
            maxArea: franchiseDetails.maxArea || data.maxArea || '',
            minInvestment: franchiseDetails.minInvestment || data.minInvestment || '',
            maxInvestment: franchiseDetails.maxInvestment || data.maxInvestment || '',
            royalty: franchiseDetails.royalty || data.royalty || '',
            establishmentYear: franchiseDetails.establishmentYear || data.establishmentYear || '',
            franchiseStartedYear: franchiseDetails.franchiseStartedYear || data.franchiseStartedYear || '',
            numberOutlets: franchiseDetails.numberOfOutlets || franchiseDetails.numberOutlets || data.numberOutlets || '',
            minPaybackPeriod: franchiseDetails.minPaybackPeriod || data.minPaybackPeriod || '',
            maxPaybackPeriod: franchiseDetails.maxPaybackPeriod || data.maxPaybackPeriod || '',
            headquarter: franchiseDetails.headquarter || data.headquarter || data.location || '',
            remarks: data.description || franchiseDetails.remarks || data.remarks || '',
            image: data.images?.[0] || data.image || ''
          };
          
          allProperties.push({
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
        }
      });
    }
    
    // Process plot properties
    if (plotsSnapshot.exists()) {
      plotsSnapshot.forEach((childSnapshot: DataSnapshot) => {
        if (uniqueIds.includes(childSnapshot.key!)) {
          const data = childSnapshot.val();
          const plotDetails = data.plotDetails || {};
          
          // Flatten the nested structure for plot properties
          const plotData = {
            ...data,
            // Extract from plotDetails if available
            project: plotDetails.project || data.title || 'Plot Project',
            developerName: plotDetails.developerName || 'Developer not specified',
            status: plotDetails.status || 'Available',
            plotSize: plotDetails.plotSize || { min: 0, max: 0, unit: 'sq.ft' },
            investmentStartsFrom: plotDetails.investmentStartsFrom || { amount: 0, unit: 'sq.ft' },
            investorDiscoveryKit: plotDetails.investorDiscoveryKit || {
              title: 'Investor Discovery Kit',
              url: '',
              description: 'Investment information package'
            },
            keySalientFeatures: plotDetails.keySalientFeatures || []
          };
          
          allProperties.push({
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
        }
      });
    }
    
    console.log(`[Firebase Optimized] ✅ Optimized batch fetch completed: ${allProperties.length}/${uniqueIds.length} properties found`);
    return allProperties;
  } catch (error) {
    console.error('[Firebase Optimized] Error optimized batch fetching properties:', error);
    throw error;
  }
}