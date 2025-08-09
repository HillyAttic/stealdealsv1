/**
 * Run this in browser console to populate localStorage wishlist
 * This will add test items that you can see even when not authenticated
 */

// Add 6 test properties to localStorage wishlist
const testWishlistItems = ['1', '2', '3', '4', '5', '6'];

localStorage.setItem('stealdeals_wishlist_temp', JSON.stringify(testWishlistItems));

console.log('✅ Added 6 test items to localStorage wishlist:', testWishlistItems);
console.log('Refresh the page to see the wishlist items.');