# Deployment Guide - User Activity & Wishlist System

This guide covers the deployment process for the StealDeals User Activity & Wishlist System, including all real-time features, authentication integration, and admin dashboard functionality.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Pre-Deployment Checklist](#pre-deployment-checklist)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Firebase project with Realtime Database enabled
- Clerk account for authentication
- Vercel/Netlify account (recommended) or any Node.js hosting platform

### Required Services

1. **Firebase Realtime Database**
   - Used for real-time data synchronization
   - Activity tracking and wishlist storage
   - Admin dashboard real-time updates

2. **Clerk Authentication**
   - User authentication and session management
   - Integration with wishlist and activity tracking

3. **Hosting Platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - Any platform supporting Node.js and Server-Sent Events

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.region.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Optional Configuration (with defaults)

```bash
# Real-time Configuration
REALTIME_HEARTBEAT_INTERVAL=30000          # SSE heartbeat interval (ms)
REALTIME_CONNECTION_TIMEOUT=60000          # Connection timeout (ms)
REALTIME_MAX_CONNECTIONS=1000              # Max concurrent SSE connections
REALTIME_ENABLE_LOGGING=true               # Enable real-time logging

# Activity Tracking Configuration
ACTIVITY_BATCH_SIZE=10                     # Batch size for activity logging
ACTIVITY_BATCH_TIMEOUT=5000                # Batch timeout (ms)
ACTIVITY_ENABLE_ANALYTICS=true             # Enable activity analytics

# Wishlist Configuration
WISHLIST_MAX_ITEMS=100                     # Max items per user wishlist
WISHLIST_ENABLE_NOTIFICATIONS=true         # Enable wishlist notifications

# Performance Configuration
ENABLE_CACHING=true                        # Enable in-memory caching
CACHE_TTL=300                             # Cache TTL in seconds
DATABASE_POOL_SIZE=10                      # Database connection pool size
```

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] ESLint checks pass (`npm run lint`)
- [ ] Code review completed

### 2. Configuration

- [ ] Environment variables configured
- [ ] Firebase project setup and rules configured
- [ ] Clerk application configured
- [ ] Domain/URL configuration updated

### 3. Database Setup

- [ ] Firebase Realtime Database rules configured
- [ ] Database indexes created for performance
- [ ] Test data cleared from production database

### 4. Security

- [ ] API keys secured and not exposed in client code
- [ ] CORS configuration reviewed
- [ ] Rate limiting configured
- [ ] Authentication flows tested

## Deployment Process

### Automated Deployment (Recommended)

Use the provided deployment script:

```bash
# Full deployment with tests
npm run deploy

# Skip tests (faster, use with caution)
npm run deploy:skip-tests
```

The script will:
1. Validate environment configuration
2. Run test suite
3. Build the application
4. Validate build output
5. Generate deployment report

### Manual Deployment

#### Step 1: Environment Validation

```bash
# Check required environment variables
node -e "
const required = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing required env vars:', missing);
  process.exit(1);
}
console.log('✅ Environment validation passed');
"
```

#### Step 2: Run Tests

```bash
npm run test
```

#### Step 3: Build Application

```bash
npm run build
```

#### Step 4: Deploy to Platform

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod --dir=.next
```

**Other platforms:**
Follow your platform's deployment instructions for Next.js applications.

## Post-Deployment Verification

### Automated Verification

```bash
npm run deploy:verify
```

This will test:
- Basic endpoint availability
- API functionality
- Real-time connection establishment
- Authentication endpoints
- Admin dashboard endpoints

### Manual Verification

#### 1. Basic Functionality

- [ ] Home page loads correctly
- [ ] User registration/login works
- [ ] Property browsing functional
- [ ] Search and filtering work

#### 2. Wishlist System

- [ ] Add items to wishlist
- [ ] Remove items from wishlist
- [ ] Wishlist persistence across sessions
- [ ] Wishlist button state updates

#### 3. Activity Tracking

- [ ] Property views are tracked
- [ ] Wishlist actions are logged
- [ ] Activity history displays correctly
- [ ] User statistics update

#### 4. Real-time Features

- [ ] Admin dashboard shows real-time updates
- [ ] User activity appears in real-time
- [ ] SSE connections establish successfully
- [ ] Connection recovery works after network issues

#### 5. Admin Dashboard

- [ ] User management functions
- [ ] Real-time statistics display
- [ ] User activity monitoring
- [ ] Wishlist analytics

## Monitoring and Maintenance

### Health Monitoring

Set up monitoring for:

1. **Application Health**
   - `/api/health` endpoint
   - Response times
   - Error rates

2. **Real-time Connections**
   - SSE connection count
   - Connection failures
   - Heartbeat monitoring

3. **Database Performance**
   - Firebase Realtime Database usage
   - Query performance
   - Connection pool status

### Log Monitoring

Monitor logs for:
- Authentication errors
- Real-time connection issues
- Database operation failures
- API rate limiting

### Performance Metrics

Track:
- Page load times
- API response times
- Real-time update latency
- User engagement metrics

## Troubleshooting

### Common Issues

#### 1. Real-time Connections Not Working

**Symptoms:**
- Admin dashboard not updating in real-time
- SSE connection failures

**Solutions:**
- Check CORS configuration in middleware
- Verify Firebase Realtime Database rules
- Check network/firewall settings
- Verify environment variables

#### 2. Authentication Issues

**Symptoms:**
- Users cannot log in
- Session not persisting
- API returns 401 errors

**Solutions:**
- Verify Clerk configuration
- Check environment variables
- Review middleware configuration
- Test authentication flow

#### 3. Wishlist/Activity Not Persisting

**Symptoms:**
- Data not saving to database
- Inconsistent state between sessions

**Solutions:**
- Check Firebase database rules
- Verify user authentication
- Review error logs
- Test database connectivity

#### 4. Performance Issues

**Symptoms:**
- Slow page loads
- High memory usage
- Database timeouts

**Solutions:**
- Enable caching (`ENABLE_CACHING=true`)
- Optimize database queries
- Review connection pool settings
- Monitor resource usage

### Debug Mode

Enable debug logging:

```bash
REALTIME_ENABLE_LOGGING=true
NODE_ENV=development
```

### Support Contacts

For deployment issues:
1. Check application logs
2. Review Firebase console
3. Check Clerk dashboard
4. Contact development team

## Security Considerations

### Production Security Checklist

- [ ] All API keys secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive data
- [ ] Database rules restrict unauthorized access
- [ ] Authentication flows secure

### Regular Security Tasks

1. **Monthly:**
   - Review access logs
   - Update dependencies
   - Check for security advisories

2. **Quarterly:**
   - Rotate API keys
   - Review user permissions
   - Security audit

## Rollback Procedure

If issues occur after deployment:

1. **Immediate Rollback:**
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify
   netlify sites:list
   netlify api rollbackSiteDeploy --site-id=SITE_ID --deploy-id=PREVIOUS_DEPLOY_ID
   ```

2. **Database Rollback:**
   - Restore from Firebase backup
   - Clear problematic data if necessary

3. **Configuration Rollback:**
   - Revert environment variables
   - Update DNS if necessary

## Performance Optimization

### Production Optimizations

1. **Caching:**
   - Enable Redis/memory caching
   - Configure CDN for static assets
   - Implement API response caching

2. **Database:**
   - Optimize Firebase rules
   - Implement connection pooling
   - Use database indexes

3. **Real-time:**
   - Limit concurrent connections
   - Implement connection throttling
   - Use efficient event filtering

### Scaling Considerations

- Monitor concurrent user limits
- Plan for database scaling
- Consider load balancing for high traffic
- Implement graceful degradation

---

## Quick Reference

### Deployment Commands

```bash
npm run deploy              # Full deployment
npm run deploy:skip-tests   # Skip tests
npm run deploy:verify       # Post-deployment verification
```

### Important URLs

- Health Check: `/api/health`
- Real-time SSE: `/api/realtime`
- Admin Dashboard: `/admin/dashboard`
- User Dashboard: `/dashboard`

### Environment Files

- `.env.example` - Template with all variables
- `.env.local` - Local development configuration
- `.env.production` - Production configuration (if needed)

For additional support or questions, refer to the project documentation or contact the development team.