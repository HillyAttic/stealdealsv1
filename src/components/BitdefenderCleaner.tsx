"use client";

/**
 * This component injects a script that removes browser extension attributes
 * very early in the page load process, before React hydration occurs.
 * 
 * It specifically targets Bitdefender's bis_skin_checked attributes that
 * cause hydration errors.
 */
export default function BitdefenderCleaner() {
  return (
    <>
      {/* Inline script executed immediately */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function cleanBitdefenderAttributes() {
                // Remove Bitdefender attributes from all elements
                document.querySelectorAll('[bis_skin_checked]').forEach(function(el) {
                  el.removeAttribute('bis_skin_checked');
                });

                // Clean other extension attributes
                const attributesToRemove = [
                  'data-bit', 
                  'data-bitdefender',
                  'data-bd-',
                  'bis_',
                  'data-adguard',
                  'data-surfingkeys-',
                  'data-hint'
                ];

                // Recursively clean all elements
                function cleanElement(element) {
                  if (!element || !element.getAttribute) return;
                  
                  // Remove attributes that match our patterns
                  attributesToRemove.forEach(attrPrefix => {
                    if (attrPrefix.endsWith('-')) {
                      // Handle prefixes
                      Array.from(element.attributes || []).forEach(attr => {
                        if (attr && attr.name && attr.name.startsWith(attrPrefix)) {
                          element.removeAttribute(attr.name);
                        }
                      });
                    } else if (element.hasAttribute && element.hasAttribute(attrPrefix)) {
                      // Direct attribute match
                      element.removeAttribute(attrPrefix);
                    }
                  });
                  
                  // Process children
                  Array.from(element.children || []).forEach(cleanElement);
                }
                
                // Start from document body
                if (document.body) {
                  cleanElement(document.body);
                }
              }
              
              // Run immediately
              cleanBitdefenderAttributes();
              
              // Run again after a slight delay to catch any late additions
              setTimeout(cleanBitdefenderAttributes, 0);
              
              // Run at intervals to continuously clean attributes
              setInterval(cleanBitdefenderAttributes, 500);
              
              // Set up a MutationObserver to handle attributes added after initialization
              if (typeof MutationObserver !== 'undefined') {
                try {
                  const observer = new MutationObserver(function(mutations) {
                    let needsFullClean = false;
                    
                    mutations.forEach(function(mutation) {
                      // Handle attribute mutations directly
                      if (mutation.type === 'attributes') {
                        if (mutation.attributeName.startsWith('bis_') || 
                            mutation.attributeName.startsWith('data-bit')) {
                          mutation.target.removeAttribute(mutation.attributeName);
                        }
                      } 
                      // If there are childList changes, we'll need a full clean
                      else if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        needsFullClean = true;
                      }
                    });
                    
                    // If we had childList mutations, run a full clean
                    if (needsFullClean) {
                      cleanBitdefenderAttributes();
                    }
                  });
                  
                  // Start observing all changes to the document
                  observer.observe(document.documentElement, { 
                    attributes: true, 
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked', 'data-bit', 'data-bitdefender', 'bis_']
                  });
                } catch(e) {
                  console.error('Error setting up MutationObserver:', e);
                  // Fallback to interval-based cleanup if MutationObserver fails
                  setInterval(cleanBitdefenderAttributes, 200);
                }
              } else {
                // Fallback for browsers without MutationObserver
                setInterval(cleanBitdefenderAttributes, 200);
              }
              
              // Add a global function that can be called from anywhere
              window.__cleanBitdefenderAttributes = cleanBitdefenderAttributes;
            })();
          `
        }}
      />
    </>
  );
} 