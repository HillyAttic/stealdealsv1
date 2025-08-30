// Direct migration script to run without authentication
const { initializeApp, getApps } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

const firebaseConfig = {
  databaseURL: "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stealdeals-e89ab"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const database = getDatabase(app);

// Helper functions from the migration route
function generatePropertyId(type, sequence) {
  const prefixes = {
    'franchise': 'PROP_FRAN',
    'plot': 'PROP_PLOT',
    'preleased': 'PROP_PRLS',
    'vacant': 'PROP_VCNT',
    'legacy': 'PROP_LEGC'
  };
  
  const prefix = prefixes[type] || prefixes['legacy'];
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `${prefix}_${paddedSequence}`;
}

function removeUndefinedValues(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.filter(item => item !== undefined).map(removeUndefinedValues);
  
  const result = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = removeUndefinedValues(obj[key]);
    }
  });
  return result;
}

function sanitizePlotData(property) {
  const sanitized = { ...property };
  
  if (!sanitized.project) {
    sanitized.project = sanitized.title || sanitized.name || 'Plot Project';
  }
  if (!sanitized.developerName) {
    sanitized.developerName = 'Developer not specified';
  }
  if (!sanitized.status) {
    sanitized.status = 'Available';
  }
  if (!sanitized.location) {
    sanitized.location = 'Location not specified';
  }
  
  // Handle plotSize validation
  if (!sanitized.plotSize || typeof sanitized.plotSize !== 'object') {
    sanitized.plotSize = { min: 0, max: 0, unit: 'sq.ft' };
  } else {
    if (typeof sanitized.plotSize.min !== 'number') sanitized.plotSize.min = parseInt(sanitized.plotSize.min) || 0;
    if (typeof sanitized.plotSize.max !== 'number') sanitized.plotSize.max = parseInt(sanitized.plotSize.max) || 0;
    if (!sanitized.plotSize.unit) sanitized.plotSize.unit = 'sq.ft';
  }
  
  // Handle investmentStartsFrom validation
  if (!sanitized.investmentStartsFrom || typeof sanitized.investmentStartsFrom !== 'object') {
    sanitized.investmentStartsFrom = { amount: 0, unit: 'sq.ft' };
  } else {
    if (typeof sanitized.investmentStartsFrom.amount !== 'number') sanitized.investmentStartsFrom.amount = parseInt(sanitized.investmentStartsFrom.amount) || 0;
    if (!sanitized.investmentStartsFrom.unit) sanitized.investmentStartsFrom.unit = 'sq.ft';
  }
  
  if (!sanitized.keySalientFeatures || !Array.isArray(sanitized.keySalientFeatures)) {
    sanitized.keySalientFeatures = [];
  }
  if (!sanitized.images || !Array.isArray(sanitized.images)) {
    sanitized.images = [];
  }
  if (!sanitized.investorDiscoveryKit || typeof sanitized.investorDiscoveryKit !== 'object') {
    sanitized.investorDiscoveryKit = {
      title: 'Investor Discovery Kit',
      description: 'Investment information package',
      url: ''
    };
  }
  
  return sanitized;
}

function transformPlot(plot, originalKey, newId) {
  const sanitizedPlot = sanitizePlotData(plot);
  
  return removeUndefinedValues({
    id: newId,
    type: 'plot',
    title: sanitizedPlot.project || 'Plot Property',
    description: sanitizedPlot.description || '',
    location: sanitizedPlot.location || 'Location not specified',
    price: sanitizedPlot.investmentStartsFrom?.amount || 0,
    images: sanitizedPlot.images || [],
    createdAt: sanitizedPlot.createdAt || Date.now(),
    updatedAt: sanitizedPlot.updatedAt || Date.now(),
    
    migrationInfo: {
      originalCollection: 'plots',
      originalKey: originalKey,
      migratedAt: Date.now()
    },
    
    plotDetails: {
      project: sanitizedPlot.project,
      developerName: sanitizedPlot.developerName,
      plotSize: sanitizedPlot.plotSize,
      investmentStartsFrom: sanitizedPlot.investmentStartsFrom,
      status: sanitizedPlot.status,
      investorDiscoveryKit: sanitizedPlot.investorDiscoveryKit,
      keySalientFeatures: sanitizedPlot.keySalientFeatures
    }
  });
}

async function migratePlots() {
  try {
    console.log('=== STARTING PLOTS MIGRATION ===');
    
    // Fetch plots collection
    console.log('Fetching plots collection...');
    const plotsSnapshot = await get(ref(database, 'plots'));
    
    if (!plotsSnapshot.exists()) {
      console.log('No plots found in database');
      return;
    }
    
    const plots = plotsSnapshot.val();
    console.log(`Found ${Object.keys(plots).length} plots to migrate`);
    
    // Transform each plot
    const migratedPlots = {};
    let sequence = 1;
    
    for (const [originalKey, plot] of Object.entries(plots)) {
      if (!plot) continue;
      
      console.log(`Processing plot ${originalKey}...`);
      
      const newId = generatePropertyId('plot', sequence);
      const transformedPlot = transformPlot(plot, originalKey, newId);
      
      if (transformedPlot) {
        migratedPlots[newId] = transformedPlot;
        console.log(`✅ Transformed ${originalKey} -> ${newId}`);
        sequence++;
      } else {
        console.log(`❌ Failed to transform ${originalKey}`);
      }
    }
    
    console.log(`\nReady to migrate ${Object.keys(migratedPlots).length} plots`);
    
    // Save to migratedProperties/plots
    if (Object.keys(migratedPlots).length > 0) {
      console.log('Saving plots to migratedProperties/plots...');
      await set(ref(database, 'migratedProperties/plots'), migratedPlots);
      console.log('✅ Plots migration completed successfully!');
      
      // Show sample
      console.log('\nSample migrated plot IDs:');
      Object.keys(migratedPlots).slice(0, 3).forEach(id => {
        console.log(`- ${id}: ${migratedPlots[id].title}`);
      });
    }
    
    console.log('\n=== PLOTS MIGRATION COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migratePlots();