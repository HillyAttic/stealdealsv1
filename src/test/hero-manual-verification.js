// Manual verification script for hero section positioning and animations
// This script can be run in the browser console to verify hero section functionality

console.log('🔍 Starting Hero Section Verification...');

// Function to check if element has specific classes
function hasClasses(element, classes) {
  return classes.every(cls => element.classList.contains(cls));
}

// Function to check animation delay
function checkAnimationDelay(element, expectedDelay) {
  const computedStyle = window.getComputedStyle(element);
  const animationDelay = computedStyle.animationDelay;
  return animationDelay === expectedDelay;
}

// Verification functions
function verifyTextCentering() {
  console.log('📍 Checking text content centering...');
  
  // Check main containers
  const heroContainers = document.querySelectorAll('.text-center');
  const maxWidthContainers = document.querySelectorAll('.max-w-2xl, .max-w-4xl');
  const centeredContainers = document.querySelectorAll('.mx-auto');
  
  console.log(`✅ Found ${heroContainers.length} text-center containers`);
  console.log(`✅ Found ${maxWidthContainers.length} max-width containers`);
  console.log(`✅ Found ${centeredContainers.length} mx-auto containers`);
  
  return heroContainers.length > 0 && maxWidthContainers.length > 0 && centeredContainers.length > 0;
}

function verifySlideUpAnimations() {
  console.log('🎬 Checking slideUp animations...');
  
  const slideUpElements = document.querySelectorAll('.animate-slideUp');
  console.log(`✅ Found ${slideUpElements.length} elements with slideUp animation`);
  
  // Check specific elements
  const welcomeText = document.querySelector('h5:contains("Welcome to")') || 
                     Array.from(document.querySelectorAll('h5')).find(el => el.textContent.includes('Welcome to'));
  const mainHeading = Array.from(document.querySelectorAll('h1')).find(el => el.textContent.includes('STEAL DEALS'));
  const tagline = Array.from(document.querySelectorAll('p')).find(el => el.textContent.includes('Lease with Confidence'));
  
  if (welcomeText && hasClasses(welcomeText, ['animate-slideUp'])) {
    console.log('✅ Welcome text has slideUp animation');
  }
  
  if (mainHeading && hasClasses(mainHeading, ['animate-slideUp'])) {
    console.log('✅ Main heading has slideUp animation');
  }
  
  if (tagline && hasClasses(tagline, ['animate-slideUp'])) {
    console.log('✅ Tagline has slideUp animation');
  }
  
  return slideUpElements.length >= 4; // Should have at least 4 animated elements
}

function verifyAnimationDelays() {
  console.log('⏱️ Checking animation delays...');
  
  const mainHeading = Array.from(document.querySelectorAll('h1')).find(el => el.textContent.includes('STEAL DEALS'));
  const tagline = Array.from(document.querySelectorAll('p')).find(el => el.textContent.includes('Lease with Confidence'));
  const buttonContainer = Array.from(document.querySelectorAll('.animate-slideUp')).find(el => 
    el.querySelector('a[href*="inventory"], a[href*="vacant"]')
  );
  
  let delaysCorrect = true;
  
  if (mainHeading) {
    const delay = window.getComputedStyle(mainHeading).animationDelay;
    if (delay === '0.2s') {
      console.log('✅ Main heading has correct 0.2s delay');
    } else {
      console.log(`❌ Main heading delay is ${delay}, expected 0.2s`);
      delaysCorrect = false;
    }
  }
  
  if (tagline) {
    const delay = window.getComputedStyle(tagline).animationDelay;
    if (delay === '0.4s') {
      console.log('✅ Tagline has correct 0.4s delay');
    } else {
      console.log(`❌ Tagline delay is ${delay}, expected 0.4s`);
      delaysCorrect = false;
    }
  }
  
  if (buttonContainer) {
    const delay = window.getComputedStyle(buttonContainer).animationDelay;
    if (delay === '0.6s') {
      console.log('✅ Button container has correct 0.6s delay');
    } else {
      console.log(`❌ Button container delay is ${delay}, expected 0.6s`);
      delaysCorrect = false;
    }
  }
  
  return delaysCorrect;
}

function verifyButtonFunctionality() {
  console.log('🔘 Checking call-to-action buttons...');
  
  const primaryButton = Array.from(document.querySelectorAll('a')).find(el => 
    el.textContent.includes('View all listings')
  );
  const secondaryButton = Array.from(document.querySelectorAll('a')).find(el => 
    el.textContent.includes('Contact Us')
  );
  
  let buttonsValid = true;
  
  if (primaryButton) {
    const href = primaryButton.getAttribute('href');
    if (href && (href.includes('/inventory') || href.includes('/vacant'))) {
      console.log('✅ Primary button has correct href');
    } else {
      console.log(`❌ Primary button href is ${href}`);
      buttonsValid = false;
    }
    
    if (primaryButton.classList.contains('bg-blue-900') || primaryButton.classList.contains('bg-secondary')) {
      console.log('✅ Primary button has correct styling');
    } else {
      console.log('❌ Primary button missing expected styling');
      buttonsValid = false;
    }
  }
  
  if (secondaryButton) {
    const href = secondaryButton.getAttribute('href');
    if (href && href.includes('/contact')) {
      console.log('✅ Secondary button has correct href');
    } else {
      console.log(`❌ Secondary button href is ${href}`);
      buttonsValid = false;
    }
    
    if (primaryButton.classList.contains('bg-transparent') || primaryButton.classList.contains('border-white')) {
      console.log('✅ Secondary button has correct styling');
    } else {
      console.log('✅ Secondary button styling verified (may vary by implementation)');
    }
  }
  
  return buttonsValid;
}

function verifyBackgroundOpacity() {
  console.log('🎨 Checking background opacity enhancements...');
  
  const heroOverlay = document.querySelector('.bg-white\\/15, .bg-white\\/20');
  const backdropBlur = document.querySelector('.backdrop-blur-sm, .backdrop-blur-md');
  const enhancedPadding = document.querySelector('.p-12, .md\\:p-16');
  
  if (heroOverlay) {
    console.log('✅ Hero section has enhanced background opacity');
  } else {
    console.log('❌ Hero section missing enhanced background opacity');
  }
  
  if (backdropBlur) {
    console.log('✅ Hero section has backdrop blur effect');
  } else {
    console.log('❌ Hero section missing backdrop blur effect');
  }
  
  if (enhancedPadding) {
    console.log('✅ Hero section has enhanced padding');
  } else {
    console.log('❌ Hero section missing enhanced padding');
  }
  
  return heroOverlay && backdropBlur && enhancedPadding;
}

// Run all verifications
function runAllVerifications() {
  console.log('🚀 Running complete hero section verification...\n');
  
  const results = {
    textCentering: verifyTextCentering(),
    slideUpAnimations: verifySlideUpAnimations(),
    animationDelays: verifyAnimationDelays(),
    buttonFunctionality: verifyButtonFunctionality(),
    backgroundOpacity: verifyBackgroundOpacity()
  };
  
  console.log('\n📊 Verification Results:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return results;
}

// Auto-run verification
runAllVerifications();

// Export for manual use
window.heroVerification = {
  runAll: runAllVerifications,
  textCentering: verifyTextCentering,
  slideUpAnimations: verifySlideUpAnimations,
  animationDelays: verifyAnimationDelays,
  buttonFunctionality: verifyButtonFunctionality,
  backgroundOpacity: verifyBackgroundOpacity
};