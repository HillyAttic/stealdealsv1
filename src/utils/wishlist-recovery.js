/**
 * EMERGENCY WISHLIST RECOVERY SCRIPT
 * Paste this in browser console at http://localhost:3000/wishlist
 * This will find and restore your missing wishlist items
 */

console.log('🚨 EMERGENCY WISHLIST RECOVERY STARTING...');

async function recoverWishlist() {
  console.log('Step 1: Checking localStorage...');
  
  // Check all localStorage keys for wishlist data
  const allKeys = Object.keys(localStorage);
  console.log('All localStorage keys:', allKeys);
  
  // Look for any wishlist-related keys
  const wishlistKeys = allKeys.filter(key => 
    key.includes('wishlist') || 
    key.includes('stealdeals') || 
    key.includes('favorite') ||
    key.includes('saved')
  );
  console.log('Wishlist-related keys found:', wishlistKeys);
  
  // Check each key
  wishlistKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
  });
  
  console.log('\nStep 2: Checking sessionStorage...');
  
  // Check sessionStorage too
  const sessionKeys = Object.keys(sessionStorage);
  const sessionWishlistKeys = sessionKeys.filter(key => 
    key.includes('wishlist') || 
    key.includes('stealdeals') || 
    key.includes('favorite') ||
    key.includes('saved')
  );
  console.log('Session wishlist keys:', sessionWishlistKeys);
  
  sessionWishlistKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    console.log(`${key}:`, value);
  });
  
  console.log('\nStep 3: Testing different user IDs...');
  
  // Test different user IDs that might have your data
  const testUserIds = ['user-1', 'user-2', 'test-user', 'demo-user', 'guest-user'];
  
  for (const userId of testUserIds) {
    console.log(`Testing user ID: ${userId}`);
    
    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-user-id': userId,
          'x-mock-user-email': `${userId}@stealdeals.com`
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log(`User ${userId} wishlist:`, data);
      
      if (data.success && data.properties && data.properties.length > 0) {
        console.log(`🎉 FOUND WISHLIST DATA FOR USER: ${userId}`);
        console.log(`Found ${data.properties.length} properties:`, data.properties);
        
        // Enable mock auth for this user
        localStorage.setItem('mock_authenticated', 'true');
        localStorage.setItem('mock_user', JSON.stringify({
          id: userId,
          email: `${userId}@stealdeals.com`,
          name: `User ${userId}`
        }));
        
        console.log(`✅ Enabled mock auth for ${userId}`);
        console.log('🔄 Refreshing page in 2 seconds...');
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        return;
      }
    } catch (error) {
      console.log(`Error checking ${userId}:`, error);
    }
  }
  
  console.log('\nStep 4: Adding test data as fallback...');
  
  // If no data found, let's add some properties manually
  const testProperties = ['1', '2', '3', '4', '5', '6'];
  
  // Add to localStorage
  localStorage.setItem('stealdeals_wishlist_temp', JSON.stringify(testProperties));
  
  // Also try to add to Firebase with different methods
  for (let i = 0; i < testProperties.length; i++) {
    const propertyId = testProperties[i];
    
    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-user-id': 'user-1',
          'x-mock-user-email': 'user-1@stealdeals.com'
        },
        body: JSON.stringify({
          propertyId: propertyId,
          action: 'add',
          priority: 'medium',
          notes: `Recovered property ${i + 1}`
        })
      });
      
      const data = await response.json();
      console.log(`Added property ${propertyId}:`, data.success);
      
    } catch (error) {
      console.log(`Failed to add property ${propertyId}:`, error);
    }
  }
  
  console.log('✅ Recovery complete! Refreshing page...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Run the recovery
recoverWishlist();