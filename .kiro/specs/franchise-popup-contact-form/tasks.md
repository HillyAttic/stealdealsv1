# Implementation Plan

- [x] 1. Set up modal state management and infrastructure
  - Add modal state variables to franchise detail component
  - Import necessary React hooks and icons
  - Create modal visibility toggle functionality
  - _Requirements: 1.1, 1.4, 5.1_

- [x] 2. Create popup modal component structure
  - [x] 2.1 Build modal container with backdrop
    - Create fixed overlay with proper z-index
    - Add backdrop blur and click-to-close functionality
    - Implement responsive modal sizing
    - _Requirements: 1.1, 1.3, 5.4_
  
  - [x] 2.2 Design modal header section
    - Add gradient header with franchise branding
    - Include franchise name display and close button
    - Implement proper typography and spacing
    - _Requirements: 1.2, 1.3, 5.2_
  
  - [x] 2.3 Create modal content area
    - Build scrollable content container
    - Add proper padding and spacing
    - Ensure mobile responsiveness
    - _Requirements: 1.3, 5.4_

- [x] 3. Implement contact form with FormSubmit.co integration
  - [x] 3.1 Set up FormSubmit.co configuration
    - Configure form action URL with target email
    - Add hidden fields for email subject and redirect
    - Disable captcha for better user experience
    - _Requirements: 3.1, 3.2_
  
  - [x] 3.2 Create user input fields
    - Add required fields (name, email, phone)
    - Include optional fields (investment budget, message)
    - Implement proper form validation attributes
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 3.3 Add franchise context as hidden fields
    - Include franchise name, industry, investment details
    - Add location and ROI information
    - Ensure all context data is properly formatted
    - _Requirements: 3.3, 3.4, 5.3_

- [x] 4. Implement franchise name pre-population
  - [x] 4.1 Create read-only franchise name field
    - Display franchise name as non-editable field
    - Style field to indicate it's pre-populated
    - Ensure proper labeling and accessibility
    - _Requirements: 1.2, 5.2_
  
  - [x] 4.2 Add franchise context display
    - Show relevant franchise information in modal header
    - Ensure context is clear and informative
    - Maintain clean, simple design aesthetic
    - _Requirements: 1.3, 3.4_

- [x] 5. Create form submission and success handling
  - [x] 5.1 Implement form submission functionality
    - Configure form to submit to FormSubmit.co
    - Add proper form method and encoding
    - Include all required and optional fields
    - _Requirements: 3.1, 4.1_
  
  - [x] 5.2 Add success notification system
    - Create success message component
    - Implement auto-hide functionality after 5 seconds
    - Add manual close option for users
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [x] 5.3 Handle URL parameter for success state
    - Check for success parameter on page load
    - Display success message when parameter is present
    - Clean URL after showing success message
    - _Requirements: 4.1, 4.3_

- [x] 6. Update trigger buttons and user interface
  - [x] 6.1 Modify hero section button
    - Change "Get Franchise Details" to "Request Information"
    - Update button to trigger modal instead of scrolling
    - Maintain existing styling and animations
    - _Requirements: 1.1, 5.1_
  
  - [x] 6.2 Update sidebar contact buttons
    - Change "Send Email" button to trigger modal
    - Add proper click handlers for all buttons
    - Implement share functionality for social sharing
    - _Requirements: 1.1, 5.1_
  
  - [x] 6.3 Add proper phone call functionality
    - Convert phone buttons to proper tel: links
    - Ensure click-to-call works on mobile devices
    - Maintain consistent button styling
    - _Requirements: 5.1, 5.4_

- [x] 7. Implement responsive design and mobile optimization
  - [x] 7.1 Ensure modal responsiveness
    - Test modal on various screen sizes
    - Adjust modal sizing for mobile devices
    - Ensure proper touch interactions
    - _Requirements: 1.4, 5.4_
  
  - [x] 7.2 Optimize form for mobile input
    - Ensure proper input types for mobile keyboards
    - Add appropriate input attributes for better UX
    - Test form submission on mobile devices
    - _Requirements: 2.4, 5.4_
  
  - [x] 7.3 Test touch interactions
    - Verify modal can be closed by tapping outside
    - Ensure all buttons have adequate touch targets
    - Test form scrolling on smaller screens
    - _Requirements: 1.4, 5.4_

- [x] 8. Add error handling and validation
  - [x] 8.1 Implement client-side form validation
    - Add required field validation
    - Include email format validation
    - Add phone number format checking
    - _Requirements: 2.4, 4.1_
  
  - [x] 8.2 Handle form submission errors
    - Add error messaging for failed submissions
    - Implement retry functionality if needed
    - Ensure graceful degradation for network issues
    - _Requirements: 4.1, 4.2_
  
  - [x] 8.3 Add accessibility features
    - Ensure proper ARIA labels for screen readers
    - Implement keyboard navigation support
    - Add focus management for modal
    - _Requirements: 1.4, 5.4_

- [x] 9. Clean up and optimize code
  - [x] 9.1 Remove unused imports and variables
    - Clean up unused React icons imports
    - Remove any unused state variables
    - Optimize component performance
    - _Requirements: 5.1_
  
  - [x] 9.2 Add proper TypeScript types
    - Ensure all props and state have proper types
    - Add interface definitions where needed
    - Fix any TypeScript warnings or errors
    - _Requirements: 5.1_
  
  - [x] 9.3 Test complete user journey
    - Test modal opening and closing
    - Verify form submission and email delivery
    - Confirm success message display
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 10. Final testing and validation
  - [x] 10.1 Test email delivery functionality
    - Verify emails are sent to correct address
    - Confirm email subject includes franchise name
    - Check that all form data is included in email
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 10.2 Validate franchise context in emails
    - Ensure franchise details are properly included
    - Verify investment amounts are correctly formatted
    - Confirm location and ROI data is present
    - _Requirements: 3.4, 5.3_
  
  - [x] 10.3 Cross-browser compatibility testing
    - Test modal functionality in different browsers
    - Verify form submission works across platforms
    - Ensure responsive design works consistently
    - _Requirements: 5.1, 5.4_
  
  - [x] 10.4 User experience validation
    - Test complete inquiry flow from user perspective
    - Verify success messaging and feedback
    - Confirm modal behavior meets requirements
    - _Requirements: 1.1, 4.1, 4.2, 4.3_