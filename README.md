# StealDeals - Advanced Real Estate Platform

StealDeals is a comprehensive real estate platform built with Next.js, Firebase, and modern web technologies. It provides a complete solution for property browsing, user management, wishlist functionality, and real-time analytics.

## 🚀 Features

### Core Functionality
- **Property Management**: Browse vacant properties, plots, and franchise opportunities
- **Advanced Search**: Filter properties by location, price, type, and amenities
- **User Authentication**: Secure login with email/password and Google OAuth
- **Wishlist System**: Save and manage favorite properties with real-time sync
- **Activity Tracking**: User behavior analytics and engagement metrics
- **Admin Dashboard**: Comprehensive management panel with real-time statistics

### User Experience
- **Responsive Design**: Optimized for all devices and screen sizes
- **Real-time Updates**: Live notifications and data synchronization
- **Offline Support**: Queue operations when connection is lost
- **Performance Optimized**: Fast loading with caching and optimization
- **Modern UI**: Clean interface with smooth animations and transitions

## Screenshots

![Stealdeals Homepage](public/screenshot.png)

## 🛠️ Technologies Used

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and server-side rendering
- **[React 19](https://react.dev/)** - Modern React with concurrent features
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development

### Backend & Database
- **[Firebase](https://firebase.google.com/)** - Realtime database and authentication
- **[Firebase Admin](https://firebase.google.com/docs/admin/setup)** - Server-side Firebase operations
- **[Clerk](https://clerk.com/)** - Modern authentication and user management

### State Management & Real-time
- **React Context** - Global state management
- **Server-Sent Events (SSE)** - Real-time updates and notifications
- **Custom Hooks** - Reusable logic for wishlist, activity, and auth

### Security & Performance
- **[JWT](https://jwt.io/)** - JSON Web Tokens for secure authentication
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **Rate Limiting** - API protection and abuse prevention
- **CSRF Protection** - Cross-site request forgery prevention

### Development & Testing
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[Playwright](https://playwright.dev/)** - End-to-end testing

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or later)
- **npm** or **yarn**
- **Firebase Project** with Realtime Database enabled
- **Clerk Account** for authentication (optional, fallback auth included)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/stealdeals.git
cd stealdeals
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```bash
# Required - Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://your-project.firebasedatabase.app"

# Required - Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Required - Admin Credentials
ADMIN_EMAIL="your_admin_email@example.com"
ADMIN_PASSWORD="your_secure_password"

# Required - Security
JWT_SECRET="your_random_secure_string"

# Optional - Clerk Authentication (recommended for production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_your_key"
CLERK_SECRET_KEY="sk_live_your_key"

# Optional - Performance Settings (with defaults)
REALTIME_HEARTBEAT_INTERVAL=30000
ACTIVITY_BATCH_SIZE=10
WISHLIST_MAX_ITEMS=100
ENABLE_CACHING=true
```

**Generate secure secrets:**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Validate your environment
npm run validate-env
```

4. Set up Firebase Database:
   - Create the required database structure (see [Firebase Setup Guide](./FIREBASE_WISHLIST_SETUP.md))
   - Ensure `/wishlists` node exists for user wishlist functionality

5. Run the development server:

```bash
# Standard development
npm run dev

# With Turbopack (faster)
npm run dev:turbo

# Clean restart (clears cache)
npm run dev:clean
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔐 Authentication System

### User Authentication
- **Email/Password**: Traditional registration and login
- **Google OAuth**: One-click authentication with Google
- **Session Management**: Persistent sessions with automatic renewal
- **Security**: JWT tokens, HTTP-only cookies, CSRF protection

### Admin Panel
The admin panel provides comprehensive management capabilities:

1. **Access**: Navigate to `/admin/login`
2. **Credentials**: Use admin email/password from `.env.local`
3. **Features**:
   - Real-time user statistics
   - User management and analytics
   - System health monitoring
   - Activity tracking dashboard

**Security Features:**
- Rate limiting on authentication endpoints
- Secure session management
- Role-based access control
- Automatic session expiration

## 📁 Project Structure

```
stealdeals/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout
│   │   ├── providers.tsx             # Context providers
│   │   ├── admin/                    # Admin panel
│   │   ├── dashboard/                # User dashboard
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── wishlist/             # Wishlist management
│   │   │   ├── activity/             # Activity tracking
│   │   │   └── realtime/             # Real-time updates
│   │   ├── vacant/                   # Vacant properties
│   │   ├── plots/                    # Plot listings
│   │   └── franchise/                # Franchise opportunities
│   ├── components/                   # React components
│   │   ├── auth/                     # Authentication components
│   │   ├── wishlist/                 # Wishlist functionality
│   │   ├── dashboard/                # Dashboard components
│   │   ├── admin/                    # Admin panel components
│   │   └── ui/                       # Reusable UI components
│   ├── contexts/                     # React Context providers
│   │   ├── EnhancedWishlistContext.tsx
│   │   ├── EnhancedActivityContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/                        # Custom React hooks
│   │   ├── useWishlist.ts
│   │   ├── useActivity.ts
│   │   ├── useAuth.ts
│   │   └── useRealTime.ts
│   ├── lib/                          # Utility libraries
│   │   ├── auth/                     # Authentication utilities
│   │   ├── database/                 # Database operations
│   │   ├── realtime/                 # Real-time services
│   │   ├── security/                 # Security utilities
│   │   └── integration/              # System integration
│   └── test/                         # Test suites
├── scripts/                          # Build and deployment scripts
├── public/                           # Static assets
├── .kiro/                           # Kiro AI configuration
└── docs/                            # Documentation files
```

## 🎨 Customization

### Property Management
- **Listings**: Update property data in Firebase Realtime Database
- **Categories**: Modify property types in `src/types/` directory
- **Display**: Customize property cards in `src/components/property/`

### UI Customization
- **Styling**: Modify Tailwind configuration in `tailwind.config.js`
- **Colors**: Update color scheme in `src/app/globals.css`
- **Components**: Customize UI components in `src/components/ui/`

### Feature Configuration
- **Wishlist**: Adjust limits in environment variables
- **Analytics**: Configure tracking in `src/lib/analytics/`
- **Real-time**: Modify update intervals and channels

## 🚀 Deployment

### Quick Deployment
```bash
# Validate environment configuration
npm run validate-env

# Full deployment process (recommended)
npm run deploy:full

# Individual steps
npm run build                # Build the application
npm run deploy              # Deploy to production
npm run deploy:verify       # Verify deployment health
```

### Platform Support
- **Vercel** (recommended): Optimized configuration included
- **Netlify**: Compatible with static export
- **Docker**: Containerization support available
- **Traditional hosting**: Static build output supported

### Environment Setup for Production
1. Set up production Firebase project
2. Configure Clerk for production authentication
3. Update environment variables for production URLs
4. Enable HTTPS and security headers
5. Configure rate limiting and monitoring

### Health Monitoring
- **System Health**: `/api/system/health`
- **Detailed Status**: `/api/system/health?detailed=true`
- **Real-time Status**: `/api/realtime`

## 🧪 Testing

### Test Suites
```bash
# Run all tests
npm run test

# Watch mode for development
npm run test:watch

# Test coverage report
npm run test:coverage

# UI testing interface
npm run test:ui
```

### Test Categories
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and optimization testing

## 📊 System Features

### Real-time Capabilities
- **Live Updates**: Server-Sent Events for instant notifications
- **User Activity**: Real-time activity tracking and analytics
- **Admin Dashboard**: Live statistics and user monitoring
- **Wishlist Sync**: Instant synchronization across devices

### Performance Optimizations
- **Caching**: In-memory caching for improved response times
- **Lazy Loading**: Component and image lazy loading
- **Code Splitting**: Automatic code splitting with Next.js
- **Database Optimization**: Efficient Firebase queries and indexing

### Security Measures
- **Authentication**: Multi-provider authentication with session management
- **Authorization**: Role-based access control
- **Data Protection**: Input validation and sanitization
- **Rate Limiting**: API endpoint protection
- **CSRF Protection**: Cross-site request forgery prevention

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[Firebase Setup](./FIREBASE_WISHLIST_SETUP.md)** - Database configuration guide
- **[Authentication System](./AUTHENTICATION_SYSTEM_STATUS.md)** - Auth implementation details
- **[Integration Guide](./INTEGRATION_COMPLETE.md)** - System integration overview
- **[API Documentation](./API_DOCUMENTATION.md)** - API endpoints and usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

### Getting Help
- Check the [documentation files](./docs/) for detailed guides
- Review the [troubleshooting section](./MIGRATION_TROUBLESHOOTING.md)
- Use the system health endpoints for diagnostics

### System Status
- **Health Check**: `/api/system/health`
- **Real-time Status**: `/api/realtime`
- **Admin Panel**: `/admin/dashboard`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Images**: [Unsplash](https://unsplash.com/) for high-quality property images
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) for comprehensive icon library
- **Authentication**: [Clerk](https://clerk.com/) for modern auth solutions
- **Database**: [Firebase](https://firebase.google.com/) for real-time data management
- **Framework**: [Next.js](https://nextjs.org/) for the robust React framework

---

**StealDeals** - Transforming real estate discovery with modern technology and user-centric design.
