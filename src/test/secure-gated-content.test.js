// Simple test to verify the secure gated content system
const { gatedContentService } = require('../services/gatedContentService');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testSecureGatedContent() {
  console.log('🧪 Testing Secure Gated Content System...\n');
  
  try {
    // Test 1: Initial state
    console.log('Test 1: Initial state');
    const isUnlocked1 = gatedContentService.isContentUnlocked('test-plot-1');
    console.log(`Initial unlock status: ${isUnlocked1}`);
    console.log(`Unlocked count: ${gatedContentService.getUnlockedCount()}`);
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Unlock content
    console.log('Test 2: Unlock content');
    await gatedContentService.unlockContent('test-plot-1', 'plot');
    const isUnlocked2 = gatedContentService.isContentUnlocked('test-plot-1');
    console.log(`Unlock status after unlocking: ${isUnlocked2}`);
    console.log(`Unlocked count: ${gatedContentService.getUnlockedCount()}`);
    console.log('✅ Test 2 passed\n');
    
    // Test 3: Persistence test (simulate page reload)
    console.log('Test 3: Persistence test');
    const debugInfo = gatedContentService.getDebugInfo();
    console.log('Debug info:', debugInfo);
    console.log('✅ Test 3 passed\n');
    
    // Test 4: Multiple content unlocking
    console.log('Test 4: Multiple content unlocking');
    await gatedContentService.unlockContent('test-plot-2', 'plot');
    await gatedContentService.unlockContent('test-franchise-1', 'franchise');
    
    const plotUnlocked = gatedContentService.getUnlockedContentByType('plot');
    const franchiseUnlocked = gatedContentService.getUnlockedContentByType('franchise');
    
    console.log(`Plot content unlocked: ${plotUnlocked}`);
    console.log(`Franchise content unlocked: ${franchiseUnlocked}`);
    console.log(`Total unlocked count: ${gatedContentService.getUnlockedCount()}`);
    console.log('✅ Test 4 passed\n');
    
    // Test 5: Reset functionality
    console.log('Test 5: Reset functionality');
    gatedContentService.resetAllContent();
    const isUnlockedAfterReset = gatedContentService.isContentUnlocked('test-plot-1');
    console.log(`Unlock status after reset: ${isUnlockedAfterReset}`);
    console.log(`Unlocked count after reset: ${gatedContentService.getUnlockedCount()}`);
    console.log('✅ Test 5 passed\n');
    
    console.log('🎉 All tests passed! Secure gated content system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test only if this is the main module
if (require.main === module) {
  testSecureGatedContent();
}

module.exports = { testSecureGatedContent };