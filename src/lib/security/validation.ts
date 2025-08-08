import { validateSecurityConfig } from './config';
import { validateCookieSecurity } from './cookies';

export interface SecurityValidationResult {
  overall: 'secure' | 'warning' | 'critical';
  score: number; // 0-100
  issues: SecurityIssue[];
  recommendations: string[];
}

export interface SecurityIssue {
  category: 'csrf' | 'cookies' | 'session' | 'rateLimit' | 'headers' | 'environment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  fix?: string;
}

/**
 * Comprehensive security validation
 */
export function validateApplicationSecurity(): SecurityValidationResult {
  const issues: SecurityIssue[] = [];
  const recommendations: string[] = [];

  // Validate security configuration
  const configValidation = validateSecurityConfig();
  if (!configValidation.valid) {
    configValidation.issues.forEach(issue => {
      issues.push({
        category: 'environment',
        severity: 'critical',
        message: issue,
        fix: 'Set the required environment variable'
      });
    });
  }

  // Validate cookie security
  const cookieValidation = validateCookieSecurity();
  if (!cookieValidation.valid) {
    cookieValidation.issues.forEach(issue => {
      issues.push({
        category: 'cookies',
        severity: 'high',
        message: issue,
        fix: 'Update cookie configuration'
      });
    });
  }

  // Check environment-specific security
  if (process.env.NODE_ENV === 'production') {
    validateProductionSecurity(issues, recommendations);
  } else {
    validateDevelopmentSecurity(issues, recommendations);
  }

  // Check CSRF protection
  validateCSRFProtection(issues, recommendations);

  // Check rate limiting
  validateRateLimiting(issues, recommendations);

  // Check session security
  validateSessionSecurity(issues, recommendations);

  // Check security headers
  validateSecurityHeaders(issues, recommendations);

  // Calculate security score
  const score = calculateSecurityScore(issues);

  // Determine overall security level
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;

  let overall: 'secure' | 'warning' | 'critical';
  if (criticalIssues > 0) {
    overall = 'critical';
  } else if (highIssues > 0 || score < 70) {
    overall = 'warning';
  } else {
    overall = 'secure';
  }

  return {
    overall,
    score,
    issues,
    recommendations
  };
}

/**
 * Validate production-specific security requirements
 */
function validateProductionSecurity(issues: SecurityIssue[], recommendations: string[]): void {
  // Check HTTPS
  if (!process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://')) {
    issues.push({
      category: 'environment',
      severity: 'critical',
      message: 'HTTPS is not configured for production',
      fix: 'Configure HTTPS and update NEXT_PUBLIC_APP_URL'
    });
  }

  // Check secure cookies
  if (process.env.NODE_ENV === 'production') {
    recommendations.push('Ensure all cookies have Secure flag in production');
  }

  // Check secrets
  const requiredSecrets = ['JWT_SECRET', 'CSRF_SECRET'];
  requiredSecrets.forEach(secret => {
    if (!process.env[secret] || process.env[secret]?.includes('default') || process.env[secret]?.includes('fallback')) {
      issues.push({
        category: 'environment',
        severity: 'critical',
        message: `${secret} is not properly configured for production`,
        fix: `Set a strong, unique ${secret} environment variable`
      });
    }
  });
}

/**
 * Validate development-specific security considerations
 */
function validateDevelopmentSecurity(issues: SecurityIssue[], recommendations: string[]): void {
  recommendations.push('Development environment detected - some security features may be relaxed');
  
  if (process.env.JWT_SECRET?.includes('fallback')) {
    issues.push({
      category: 'environment',
      severity: 'low',
      message: 'Using fallback JWT secret in development',
      fix: 'Set JWT_SECRET environment variable for better security'
    });
  }
}

/**
 * Validate CSRF protection
 */
function validateCSRFProtection(issues: SecurityIssue[], recommendations: string[]): void {
  if (!process.env.CSRF_SECRET) {
    issues.push({
      category: 'csrf',
      severity: 'medium',
      message: 'CSRF secret not configured',
      fix: 'Set CSRF_SECRET environment variable'
    });
  }

  recommendations.push('Ensure CSRF tokens are validated on all state-changing requests');
}

/**
 * Validate rate limiting
 */
function validateRateLimiting(issues: SecurityIssue[], recommendations: string[]): void {
  // In a real implementation, we might check if rate limiting is properly configured
  recommendations.push('Consider implementing Redis-based rate limiting for production');
  recommendations.push('Monitor rate limiting effectiveness and adjust limits as needed');
}

/**
 * Validate session security
 */
function validateSessionSecurity(issues: SecurityIssue[], recommendations: string[]): void {
  recommendations.push('Implement session timeout monitoring on client side');
  recommendations.push('Consider implementing concurrent session limits per user');
  
  // Check session configuration
  const maxSessionTime = 8 * 60 * 60 * 1000; // 8 hours
  if (maxSessionTime > 12 * 60 * 60 * 1000) { // More than 12 hours
    issues.push({
      category: 'session',
      severity: 'medium',
      message: 'Session timeout is too long',
      fix: 'Reduce maximum session time to improve security'
    });
  }
}

/**
 * Validate security headers
 */
function validateSecurityHeaders(issues: SecurityIssue[], recommendations: string[]): void {
  recommendations.push('Implement Content Security Policy (CSP) headers');
  recommendations.push('Add security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection');
  recommendations.push('Consider implementing HSTS headers for HTTPS enforcement');
}

/**
 * Calculate security score based on issues
 */
function calculateSecurityScore(issues: SecurityIssue[]): number {
  let score = 100;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 25;
        break;
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });

  return Math.max(0, score);
}

/**
 * Get security recommendations based on current configuration
 */
export function getSecurityRecommendations(): string[] {
  const recommendations: string[] = [];

  // Environment-specific recommendations
  if (process.env.NODE_ENV === 'production') {
    recommendations.push('Regularly rotate JWT and CSRF secrets');
    recommendations.push('Implement security monitoring and alerting');
    recommendations.push('Conduct regular security audits');
    recommendations.push('Keep dependencies updated');
  }

  // General recommendations
  recommendations.push('Implement proper input validation on all endpoints');
  recommendations.push('Use parameterized queries to prevent SQL injection');
  recommendations.push('Implement proper error handling to avoid information disclosure');
  recommendations.push('Use HTTPS for all communications');
  recommendations.push('Implement proper logging and monitoring');

  return recommendations;
}

/**
 * Check if current security configuration meets minimum requirements
 */
export function meetsMinimumSecurity(): boolean {
  const validation = validateApplicationSecurity();
  const criticalIssues = validation.issues.filter(i => i.severity === 'critical').length;
  
  return criticalIssues === 0 && validation.score >= 60;
}

/**
 * Generate security report
 */
export function generateSecurityReport(): string {
  const validation = validateApplicationSecurity();
  const recommendations = getSecurityRecommendations();

  let report = `Security Assessment Report\n`;
  report += `==========================\n\n`;
  report += `Overall Security Level: ${validation.overall.toUpperCase()}\n`;
  report += `Security Score: ${validation.score}/100\n\n`;

  if (validation.issues.length > 0) {
    report += `Security Issues (${validation.issues.length}):\n`;
    report += `-------------------\n`;
    validation.issues.forEach((issue, index) => {
      report += `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}\n`;
      if (issue.fix) {
        report += `   Fix: ${issue.fix}\n`;
      }
      report += `\n`;
    });
  }

  if (recommendations.length > 0) {
    report += `Recommendations:\n`;
    report += `----------------\n`;
    recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
  }

  return report;
}