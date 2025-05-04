# API Documentation for StealDeals

This document outlines the secure API implementation for the StealDeals application.

## Overview

The application now includes server-side API routes and secure server actions to handle sensitive operations. This approach helps protect data, validate inputs, and implement proper business logic on the server rather than exposing it to the client.

## API Endpoints

### Authentication

- **POST /api/auth**
  - Handles user authentication and returns a JWT token
  - Request body: `{ email: string, password: string }`
  - Response: `{ success: boolean, token: string, user: { id: number, email: string } }`

### Contact Form

- **POST /api/contact**
  - Processes contact form submissions with server-side validation
  - Request body: `{ name: string, email: string, message: string, phone?: string }`
  - Response: `{ success: boolean, message: string }` or `{ errors: { [field]: string } }`

### Properties

- **GET /api/properties**
  - Retrieves property listings with optional filtering
  - Query parameters:
    - `category`: Filter by property category
    - `featured`: Filter featured properties (true/false)
    - `limit`: Number of properties to return
  - Response: `{ properties: Property[], total: number }`

- **POST /api/properties** (Protected - requires authentication)
  - Creates a new property listing
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title: string, category: string, price: number, location: string, area: number, featured?: boolean }`
  - Response: `{ success: boolean, property: Property }`

## Server Actions

The application uses Next.js Server Actions for form processing:

- **submitContactForm**
  - Located in `src/app/actions/contact-actions.ts`
  - Processes contact form data with validation using Zod
  - Parameters: `{ name: string, email: string, message: string, phone?: string }`
  - Returns: `{ success: boolean, message?: string, errors?: object }`

## Middleware

The application uses middleware (`src/middleware.ts`) to protect sensitive API routes:

- Automatically protects routes under `/api/properties` and `/api/admin`
- Verifies JWT token in the Authorization header
- Returns 401 Unauthorized for invalid or missing tokens

## Security Features

1. **Server-side Validation**
   - All inputs are validated on the server using Zod schema validation
   - Prevents malformed data from being processed

2. **Protected Routes**
   - Sensitive operations require authentication
   - Uses middleware to verify tokens

3. **Server-side Business Logic**
   - Critical business logic runs on the server
   - Prevents client-side tampering

## Implementation Notes

- The authentication system is currently using mock data for demonstration
- In a production environment, you should:
  - Use a proper database for user storage
  - Implement proper password hashing (e.g., bcrypt)
  - Set up HTTPS and secure cookies
  - Configure CORS properly
  - Add rate limiting to prevent abuse

## Setup Instructions

1. Install the dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Access the API endpoints at `http://localhost:3000/api/...` 