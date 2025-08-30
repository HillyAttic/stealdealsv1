/**
 * Property ID Diagnostic Script
 * 
 * Run this in the browser console to debug property ID resolution
 * and understand why the wrong property is being retrieved.
 */

console.log('🔍 PROPERTY ID DIAGNOSTIC TOOL');
console.log('===============================');

const PropertyDiagnostic = {
  
  // Test property retrieval for a specific ID
  async testPropertyId(propertyId) {
    console.log(`\n🔍 TESTING PROPERTY ID: "${propertyId}"`);
    console.log('================================================');
    
    try {
      // Test through the debug API which uses Firebase getPropertyById
      const response = await fetch(`/api/debug/property/${propertyId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Property found via API:');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('❌ Property not found via API');
        
        // Try the internal property search
        await this.searchAllCollections(propertyId);
      }
      
    } catch (error) {
      console.error('❌ Error testing property ID:', error);
      await this.searchAllCollections(propertyId);
    }
  },
  
  // Search all collections manually for the property ID
  async searchAllCollections(propertyId) {
    console.log(`\n🔍 MANUAL COLLECTION SEARCH FOR ID: "${propertyId}"`);
    console.log('===========================================');
    
    const collections = [
      'vacantProperties',
      'preleasedProperties', 
      'franchiseProperties',
      'plots',
      'properties'
    ];
    
    for (const collection of collections) {
      try {
        console.log(`\n📂 Checking ${collection}...`);
        
        // We can't directly access Firebase from browser, so we'll use a workaround
        // This is a simplified check - in real debugging you'd need server access
        console.log(`   Would check: /${collection}/${propertyId}`);
        
      } catch (error) {
        console.log(`   ❌ Error checking ${collection}:`, error.message);
      }
    }
  },
  
  // Check your current wishlist to see what's stored
  async checkCurrentWishlist() {
    console.log('\n📝 CHECKING CURRENT WISHLIST');
    console.log('=============================');
    
    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.properties) {
        console.log(`Found ${data.properties.length} items in wishlist:`);
        
        data.properties.forEach((item, index) => {
          console.log(`\n${index + 1}. Wishlist Item:`);
          console.log(`   Property ID: ${item.id}`);
          console.log(`   Title: ${item.title}`);
          console.log(`   Type: ${item.type || item.category}`);
          console.log(`   Location: ${item.location}`);
          console.log(`   Price: ${item.price}`);
          
          if (item.id === '1') {
            console.log('   🎯 THIS IS THE PROBLEM PROPERTY WITH ID "1"');
            console.log('   Raw data:', JSON.stringify(item, null, 2));
          }
        });
      } else {
        console.log('❌ No wishlist items found or error:', data);
      }
      
    } catch (error) {
      console.error('❌ Error checking wishlist:', error);
    }
  },
  
  // Check raw Firebase wishlist data
  async checkRawWishlistData() {
    console.log('\n🔧 RAW WISHLIST DATA CHECK');
    console.log('===========================');
    
    try {
      // Get the raw wishlist data that you showed
      console.log('Based on your Firebase data:');
      console.log('Property ID in wishlist: "1"');
      console.log('This should resolve to "Bird Estate" but shows "High-Street"');
      console.log('');
      console.log('🔍 Possible causes:');
      console.log('1. Another property with ID "1" exists in an earlier collection');
      console.log('2. Bird Estate has a different ID in the plots collection');
      console.log('3. Collection search order is finding wrong property first');
      console.log('');
      console.log('💡 Next steps:');
      console.log('1. Check what property has ID "1" in vacantProperties');
      console.log('2. Check what property has ID "1" in preleasedProperties');
      console.log('3. Find the actual ID of "Bird Estate" in plots collection');
      
    } catch (error) {
      console.error('❌ Error in raw data check:', error);
    }
  },
  
  // Find Bird Estate in plots collection
  async findBirdEstate() {
    console.log('\n🔍 SEARCHING FOR BIRD ESTATE');
    console.log('=============================');
    
    try {
      // Since we can't directly query Firebase from browser,
      // we'll provide instructions for manual checking
      console.log('🔧 To find Bird Estate manually:');
      console.log('');
      console.log('1. Go to Firebase Console:');
      console.log('   https://console.firebase.google.com/');
      console.log('');
      console.log('2. Navigate to: Realtime Database');
      console.log('');
      console.log('3. Check these paths:');
      console.log('   /plots/{id} - Look for Bird Estate project');
      console.log('   /vacantProperties/1 - See what property has ID "1"');
      console.log('   /preleasedProperties/1 - See what property has ID "1"');
      console.log('');
      console.log('4. Look for property with:');
      console.log('   - project: "Bird Estate"');
      console.log('   - location: "NEAR DELHI - GURUGRAM BORDER"');
      console.log('   - developer: "GLS"');
      console.log('');
      console.log('5. Note the actual ID of Bird Estate');
      
    } catch (error) {
      console.error('❌ Error in Bird Estate search:', error);
    }
  },
  
  // Main diagnostic function
  async runFullDiagnostic() {
    console.clear();
    console.log('🚀 RUNNING FULL PROPERTY DIAGNOSTIC...\n');
    
    // Step 1: Check current wishlist
    await this.checkCurrentWishlist();
    
    // Step 2: Test the problematic property ID "1"
    await this.testPropertyId('1');
    
    // Step 3: Check raw data explanation
    await this.checkRawWishlistData();
    
    // Step 4: Search for Bird Estate
    await this.findBirdEstate();
    
    console.log('\n📋 SUMMARY');
    console.log('==========');
    console.log('The issue is that property ID "1" is resolving to the wrong property.');
    console.log('This happens because getPropertyById searches collections in order:');
    console.log('1. vacantProperties ← If ID "1" exists here, it will be found first');
    console.log('2. preleasedProperties ← If ID "1" exists here, it will be found');
    console.log('3. franchiseProperties');
    console.log('4. plots ← Bird Estate is probably here with a different ID');
    console.log('5. properties (legacy)');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('A. Find the correct ID of Bird Estate in plots collection');
    console.log('B. Remove wrong property with ID "1" from earlier collections');
    console.log('C. Update wishlist to use correct property ID');
    
    return {
      issue: 'Property ID "1" resolves to wrong property',
      cause: 'Multiple properties with same ID across collections',
      solution: 'Find correct Bird Estate ID and update wishlist',
      timestamp: new Date().toISOString()
    };
  }
};

// Make globally available
window.PropertyDiagnostic = PropertyDiagnostic;

console.log('🛠️ Property Diagnostic Tool Loaded');
console.log('📞 Available commands:');
console.log('  - PropertyDiagnostic.runFullDiagnostic()');
console.log('  - PropertyDiagnostic.testPropertyId("1")');
console.log('  - PropertyDiagnostic.checkCurrentWishlist()');
console.log('  - PropertyDiagnostic.findBirdEstate()');

// Auto-run diagnostic
setTimeout(() => {
  console.log('\n🔄 Running automatic diagnostic in 3 seconds...');
  setTimeout(() => {
    PropertyDiagnostic.runFullDiagnostic();
  }, 3000);
}, 1000);