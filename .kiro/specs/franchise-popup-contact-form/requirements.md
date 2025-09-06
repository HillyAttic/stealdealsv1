# Requirements Document

## Introduction

This feature enhances the franchise detail page with a popup contact form that appears when users click "Request Information". The form automatically pre-populates the franchise name and uses FormSubmit.co to send inquiries directly to the business email with complete franchise context, enabling easy identification of which franchise opportunity the user is inquiring about.

## Requirements

### Requirement 1

**User Story:** As a potential franchisee, I want to easily request information about a specific franchise through a popup form, so that I can quickly inquire without navigating away from the franchise details.

#### Acceptance Criteria

1. WHEN I click "Request Information" on a franchise detail page THEN a popup modal SHALL appear with a contact form
2. WHEN the popup opens THEN the franchise name SHALL be automatically pre-populated and displayed as read-only
3. WHEN I view the form THEN it SHALL have a clean, simple design without excessive colors
4. WHEN I interact with the form THEN it SHALL be user-friendly and intuitive

### Requirement 2

**User Story:** As a potential franchisee, I want to provide my contact details and investment preferences in the form, so that the franchise owner can understand my requirements and respond appropriately.

#### Acceptance Criteria

1. WHEN I fill the form THEN I SHALL be required to provide my name, email, and phone number
2. WHEN I use the form THEN I SHALL be able to select my investment budget range
3. WHEN I submit the form THEN I SHALL be able to include an optional message with my specific requirements
4. WHEN I complete the form THEN all fields SHALL have proper validation

### Requirement 3

**User Story:** As a franchise owner, I want to receive detailed emails with both user information and franchise context, so that I can easily identify which franchise opportunity the inquiry is about and respond effectively.

#### Acceptance Criteria

1. WHEN a user submits the form THEN I SHALL receive an email at ishank@stealdeals.co.in
2. WHEN I receive the email THEN the subject line SHALL clearly indicate the franchise name
3. WHEN I read the email THEN it SHALL contain all user details (name, email, phone, budget, message)
4. WHEN I review the inquiry THEN it SHALL include complete franchise context (name, industry, investment, location, ROI)

### Requirement 4

**User Story:** As a user, I want to receive confirmation that my inquiry was sent successfully, so that I know my request was processed and can expect a response.

#### Acceptance Criteria

1. WHEN I submit the form successfully THEN I SHALL see a success notification message
2. WHEN the form is submitted THEN the popup modal SHALL close automatically
3. WHEN I see the success message THEN it SHALL indicate that I will receive a response soon
4. WHEN the success notification appears THEN it SHALL auto-hide after a reasonable time period

### Requirement 5

**User Story:** As a user, I want the contact form functionality to work consistently across all franchise detail pages, so that I have the same experience regardless of which franchise I'm viewing.

#### Acceptance Criteria

1. WHEN I visit any franchise detail page THEN the "Request Information" button SHALL trigger the popup form
2. WHEN the popup opens THEN it SHALL automatically show the correct franchise name for that specific franchise
3. WHEN I submit forms from different franchise pages THEN each email SHALL contain the correct franchise context
4. WHEN I use the form on mobile devices THEN it SHALL be fully responsive and touch-friendly