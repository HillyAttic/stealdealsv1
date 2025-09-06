# Design Document

## Overview

This design implements a popup contact form system for franchise detail pages that provides a seamless inquiry experience. The solution uses a modal popup with pre-populated franchise information and integrates with FormSubmit.co for email delivery, ensuring franchise owners receive detailed context about each inquiry without requiring backend infrastructure.

## Architecture

### Component Structure
```
FranchiseDetailPage
├── Contact Modal Popup
│   ├── Modal Header (franchise name, close button)
│   ├── Form Fields (user input)
│   ├── Hidden Fields (franchise context)
│   └── Submit Actions
├── Trigger Buttons (hero section, sidebar)
└── Success Notification
```

### Data Flow
```
User Click → Modal Opens → Form Submission → FormSubmit.co → Email Delivery → Success Notification
```

## Components and Interfaces

### 1. Contact Modal Component

**Modal Structure:**
- **Header Section**: Franchise name display, close button
- **Form Section**: User input fields with validation
- **Hidden Context**: Franchise data for email context
- **Action Buttons**: Cancel and submit options

**Design Elements:**
- Clean white background with subtle shadows
- Blue-to-purple gradient header for branding
- Responsive design that works on all screen sizes
- Smooth animations for open/close transitions

### 2. Form Fields Configuration

**Required Fields:**
```typescript
interface ContactFormData {
  name: string;           // User's full name
  email: string;          // User's email address
  phone: string;          // User's phone number
  franchise_name: string; // Pre-populated, read-only
}
```

**Optional Fields:**
```typescript
interface OptionalFormData {
  investment_budget: string; // Dropdown selection
  message: string;          // Textarea for additional details
}
```

**Hidden Context Fields:**
```typescript
interface FranchiseContext {
  franchise_name: string;
  franchise_industry: string;
  franchise_investment: string;
  franchise_location: string;
  franchise_roi: string;
}
```

### 3. FormSubmit.co Integration

**Configuration:**
- **Action URL**: `https://formsubmit.co/ishank@stealdeals.co.in`
- **Method**: POST
- **Subject Line**: `Franchise Inquiry - {franchise_name}`
- **Redirect**: Back to franchise page with success parameter
- **Captcha**: Disabled for better user experience

**Hidden Configuration Fields:**
```html
<input type="hidden" name="_subject" value="Franchise Inquiry - {franchise_name}" />
<input type="hidden" name="_next" value="{current_page}?success=true" />
<input type="hidden" name="_captcha" value="false" />
```

## Data Models

### Modal State Management
```typescript
interface ModalState {
  showContactModal: boolean;
  showSuccessMessage: boolean;
  isSubmitting: boolean;
}
```

### Form Validation Rules
```typescript
interface ValidationRules {
  name: {
    required: true;
    minLength: 2;
    pattern: /^[a-zA-Z\s]+$/;
  };
  email: {
    required: true;
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  };
  phone: {
    required: true;
    pattern: /^[+]?[\d\s\-\(\)]+$/;
    minLength: 10;
  };
}
```

## User Experience Design

### Modal Behavior
1. **Opening**: Smooth fade-in animation with backdrop blur
2. **Positioning**: Centered on screen with responsive sizing
3. **Scrolling**: Scrollable content for smaller screens
4. **Closing**: Click outside, ESC key, or close button

### Form Interaction
1. **Auto-focus**: First input field receives focus on open
2. **Tab Navigation**: Proper tab order through form fields
3. **Validation**: Real-time validation with error messages
4. **Submission**: Loading state during form submission

### Success Feedback
1. **Notification**: Top-right corner success message
2. **Auto-dismiss**: Disappears after 5 seconds
3. **Manual Close**: User can close manually
4. **Visual Feedback**: Green background with checkmark icon

## Visual Design Specifications

### Color Scheme
- **Primary**: Blue (#3B82F6) - Trust and professionalism
- **Secondary**: Purple (#8B5CF6) - Premium feel
- **Success**: Green (#10B981) - Positive feedback
- **Background**: White (#FFFFFF) - Clean and simple
- **Text**: Gray scale (#1F2937, #6B7280) - Readable hierarchy

### Typography
- **Headers**: Font weight 700, larger sizes for hierarchy
- **Labels**: Font weight 600, small size for form labels
- **Input Text**: Font weight 400, readable size
- **Buttons**: Font weight 600, medium size

### Layout Principles
- **Spacing**: Consistent 16px/24px spacing units
- **Border Radius**: 8px for form elements, 16px for modal
- **Shadows**: Subtle shadows for depth and elevation
- **Responsive**: Mobile-first approach with breakpoints

## Error Handling

### Form Validation
- **Client-side**: Immediate feedback on field blur
- **Required Fields**: Clear indication of missing data
- **Format Validation**: Email and phone number format checking
- **Error Messages**: Helpful, specific error descriptions

### Submission Handling
- **Network Errors**: Graceful handling of connection issues
- **FormSubmit Errors**: Fallback messaging for service issues
- **Success Confirmation**: Clear indication of successful submission
- **Retry Mechanism**: Option to retry failed submissions

## Mobile Optimization

### Responsive Design
- **Breakpoints**: 
  - Mobile: 320px - 768px (full width modal)
  - Tablet: 768px - 1024px (constrained width)
  - Desktop: 1024px+ (centered modal)

### Touch Interactions
- **Button Sizes**: Minimum 44px touch targets
- **Input Fields**: Adequate spacing for touch input
- **Modal Dismissal**: Touch outside to close
- **Keyboard Handling**: Proper virtual keyboard support

## Performance Considerations

### Loading Optimization
- **Modal Rendering**: Conditional rendering to avoid unnecessary DOM
- **Form Validation**: Debounced validation to reduce processing
- **Success Animation**: CSS transitions for smooth performance
- **Memory Management**: Proper cleanup of event listeners

### Accessibility

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical focus flow and trap
- **Color Contrast**: Sufficient contrast ratios for all text

### Implementation Approach

### Phase 1: Modal Infrastructure
1. Create modal component with proper state management
2. Implement open/close functionality with animations
3. Add responsive design and mobile optimization
4. Test modal behavior across different screen sizes

### Phase 2: Form Implementation
1. Build form fields with validation
2. Implement FormSubmit.co integration
3. Add franchise context as hidden fields
4. Test form submission and email delivery

### Phase 3: User Experience Enhancement
1. Add success notification system
2. Implement proper error handling
3. Add loading states and feedback
4. Test complete user journey

### Phase 4: Polish and Testing
1. Cross-browser compatibility testing
2. Accessibility compliance verification
3. Performance optimization
4. Final user experience testing