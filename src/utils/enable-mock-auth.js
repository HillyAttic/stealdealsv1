/**
 * Run this in browser console to enable mock authentication
 * This will allow you to access Firebase wishlist data
 */

// Set mock authentication
localStorage.setItem('mock_authenticated', 'true');
localStorage.setItem('mock_user', JSON.stringify({
  id: 'user-1',
  email: 'test@stealdeals.com',
  name: 'Test User'
}));

console.log('✅ Mock authentication enabled!');
console.log('Refresh the page to see your Firebase wishlist items.');