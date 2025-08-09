/**
 * Script to install React DevTools extension for better development experience
 * Run this in your browser console or execute with Node.js
 */

console.log('🔧 React DevTools Installation Helper');
console.log('');
console.log('📦 To install React DevTools, visit one of these links:');
console.log('');
console.log('🌐 Chrome/Edge: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi');
console.log('🦊 Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/');
console.log('');
console.log('✅ After installation, refresh this page for a better development experience!');
console.log('');
console.log('💡 React DevTools provides:');
console.log('   - Component tree inspection');
console.log('   - Props and state debugging');
console.log('   - Performance profiling');
console.log('   - Hook debugging');
console.log('');

// If running in browser, show a nice popup
if (typeof window !== 'undefined') {
  // Check if React DevTools is already installed
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🎉 React DevTools is already installed!');
  } else {
    console.log('⚠️  React DevTools not detected. Consider installing it for a better experience.');
  }
}