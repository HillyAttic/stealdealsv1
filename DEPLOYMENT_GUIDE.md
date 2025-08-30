# User Activity & Wishlist System - Deployment Guide

This guide provides comprehensive instructions for deploying the User Activity & Wishlist System to production environments.

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
- Clerk authentication project
- Vercel account (recommended) or compatible hosting platform

### Required Services

1. **Clerk Authentication**
   - Create a Clerk project at [clerk.com](https://clerk.com)
   - Configure authentication providers (Google, email, etc.)
   - Note down publishable key and secret key

2. **Firebase Realtime Database**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Realtime Database
   - Configure security rules
   - Note down configuration values

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_change_in_production
JWT_EXPIRES_IN=24h

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password
```

### Optional Environment Variables (with defaults)

```bash
# Real-time Configuration
REALTIME_HEARTBEAT_INTERVAL=30000
REALTIME_CONNECTION_TIMEOUT=60000
REALTIME_MAX_CONNECTIONS=1000
REALTIME_ENABLE_LOGGING=false

# Activity Tracking Configuration
ACTIVITY_BATCH_SIZE=10
ACTIVITY_BATCH_TIMEOUT=5000
ACTIVITY_ENABLE_ANALYTICS=true

# Wishlist Configuration
WISHLIST_MAX_ITEMS=100
WISHLIST_ENABLE_NOTIFICATIONS=true

# Performance Configuration
ENABLE_CACHING=true
CACHE_TTL=300
DATABASE_POOL_SIZE=10
```

## Pre-Deployment Checklist

### 1. Code Quality Checks

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests
npm run test
```

### 2. Environment Validation

```bash
# Validate environment configuration
node scripts/validate-env.js
```

### 3. Build Verification

```bash
# Test production build locally
npm run build
npm run start
```

### 4. Security Review

- [ ] All environment variables are properly configured
- [ ] No sensitive data in client-side code
- [ ] Firebase security rules are properly configured
- [ ] Rate limiting is enabled for API endpoints
- [ ] CORS settings are properly configured

## Deployment Process

### Option 1: Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy using deployment script**
   ```bash
   npm run deploy
   ```

4. **Configure environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all required environment variables
   - Redeploy if necessary

### Option 2: Manual Deployment

1. **Run deployment preparation**
   ```bash
   node scripts/deploy.js
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy to your hosting platform**
   - Upload the `.next` folder and other necessary files
   - Configure environment variables
   - Set up domain and SSL

### Option 3: Docker Deployment

1. **Build Docker image**
   ```bash
   docker build -t stealdeals-app .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env.production stealdeals-app
   ```

## Post-Deployment Verification

### Automated Verification

Run the post-deployment verification script:

```bash
npm run deploy:verify
```

This script will test:
- [ ] Application health endpoints
- [ ] API endpoint accessibility
- [ ] Real-time connection functionality
- [ ] Authentication flow
- [ ] Database connectivity

### Manual Verification Checklist

1. **Basic Functionality**
   - [ ] Homepage loads correctly
   - [ ] User registration/login works
   - [ ] Property listings display properly

2. **Wishlist System**
   - [ ] Add/remove properties from wishlist
   - [ ] Wishlist persists across sessions
   - [ ] Real-time updates work

3. **Activity Tracking**
   - [ ] User activities are logged
   - [ ] Activity history displays correctly
   - [ ] Real-time activity updates work

4. **Admin Dashboard**
   - [ ] Admin login works
   - [ ] User statistics display
   - [ ] Real-time admin updates work

5. **Performance**
   - [ ] Page load times are acceptable
   - [ ] Real-time connections are stable
   - [ ] No memory leaks in long-running sessions

## Monitoring and Maintenance

### Health Monitoring

Set up monitoring for:
- Application uptime
- API response times
- Real-time connection stability
- Database performance
- Error rates

### Log Monitoring

Monitor logs for:
- Authentication errors
- Database connection issues
- Real-time connection problems
- API rate limiting
- Unexpected errors

### Performance Monitoring

Track:
- Page load times
- API response times
- Real-time message latency
- Memory usage
- CPU usage

### Regular Maintenance Tasks

1. **Weekly**
   - Review error logs
   - Check performance metrics
   - Verify backup integrity

2. **Monthly**
   - Update dependencies
   - Review security settings
   - Analyze user activity patterns

3. **Quarterly**
   - Security audit
   - Performance optimization review
   - Capacity planning

## Troubleshooting

### Common Issues

#### Real-time Connections Not Working

**Symptoms:** Real-time updates not appearing, SSE connection failures

**Solutions:**
1. Check firewall settings for SSE connections
2. Verify CORS headers are properly configured
3. Check server timeout settings
4. Review browser console for connection errors

#### Authentication Issues

**Symptoms:** Users cannot log in, session persistence problems

**Solutions:**
1. Verify Clerk configuration
2. Check JWT secret configuration
3. Review cookie settings
4. Verify domain configuration

#### Database Connection Problems

**Symptoms:** Data not saving, connection timeouts

**Solutions:**
1. Check Firebase configuration
2. Verify database rules
3. Review connection pool settings
4. Check network connectivity

#### Performance Issues

**Symptoms:** Slow page loads, high memory usage

**Solutions:**
1. Enable caching
2. Optimize database queries
3. Review real-time connection limits
4. Check for memory leaks

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set environment variable
DEBUG=true

# Or use debug query parameter
https://your-domain.com?debug=true
```

### Support Contacts

For deployment support:
- Technical Issues: [Create GitHub Issue](https://github.com/your-repo/issues)
- Security Concerns: security@yourdomain.com
- General Support: support@yourdomain.com

## Rollback Procedure

In case of deployment issues:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback**
   - Revert to previous deployment
   - Restore previous environment variables
   - Verify functionality

3. **Database Rollback**
   - Restore from backup if necessary
   - Verify data integrity

## Security Considerations

### Production Security Checklist

- [ ] All secrets are properly configured
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection protection is in place
- [ ] XSS protection is enabled
- [ ] CSRF protection is configured

### Regular Security Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Review Access Logs**
   - Monitor for suspicious activity
   - Check for unauthorized access attempts

3. **Backup Verification**
   - Test backup restoration
   - Verify backup integrity

## Performance Optimization

### Production Optimizations

1. **Enable Caching**
   - Set `ENABLE_CACHING=true`
   - Configure appropriate TTL values

2. **Database Optimization**
   - Use connection pooling
   - Optimize query performance
   - Implement proper indexing

3. **Real-time Optimization**
   - Limit concurrent connections
   - Implement connection throttling
   - Use efficient message batching

### Monitoring Performance

Track these metrics:
- Response time percentiles (p50, p95, p99)
- Error rates
- Throughput (requests per second)
- Resource utilization (CPU, memory)
- Real-time connection count

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
**Maintainer:** Development Team