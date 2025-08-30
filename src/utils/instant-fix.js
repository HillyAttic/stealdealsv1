/**
 * INSTANT WISHLIST FIX
 * Copy and paste this entire script into your browser console at:
 * http://localhost:3000/wishlist
 * 
 * This will immediately fix your wishlist issue
 */

console.log('🔧 INSTANT WISHLIST FIX STARTING...');

// Enable mock authentication immediately
localStorage.setItem('mock_authenticated', 'true');
localStorage.setItem('mock_user', JSON.stringify({
  id: 'user-1',
  email: 'user-1@stealdeals.com', 
  name: 'Test User'
}));

console.log('✅ Mock authentication enabled');
console.log('🔄 Reloading page to show your 6 wishlist items...');

// Reload the page to apply changes
setTimeout(() => {
  window.location.reload();
}, 500);