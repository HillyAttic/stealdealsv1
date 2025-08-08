import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOMPurify instance for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(dirty: string): string {
  if (typeof dirty !== 'string') {
    return '';
  }
  
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false
  });
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w@.-]/g, '') // Only allow word chars, @, ., -
    .substring(0, 254); // RFC 5321 limit
}

/**
 * Sanitize URL input
 */
export function sanitizeURL(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') {
    return '';
  }
  
  return phone
    .replace(/[^\d+()-\s]/g, '') // Only allow digits, +, (), -, space
    .trim()
    .substring(0, 20);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isFinite(input) ? input : null;
  }
  
  if (typeof input !== 'string') {
    return null;
  }
  
  const cleaned = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isFinite(parsed) ? parsed : null;
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizers: Partial<Record<keyof T, (value: any) => any>> = {}
): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    const sanitizer = sanitizers[key as keyof T];
    
    if (sanitizer) {
      sanitized[key as keyof T] = sanitizer(value);
    } else if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize user registration data
 */
export function sanitizeRegistrationData(data: {
  name: string;
  email: string;
  password: string;
}) {
  return {
    name: sanitizeText(data.name),
    email: sanitizeEmail(data.email),
    password: data.password // Don't sanitize passwords, just validate
  };
}

/**
 * Validate and sanitize user login data
 */
export function sanitizeLoginData(data: {
  email: string;
  password: string;
}) {
  return {
    email: sanitizeEmail(data.email),
    password: data.password // Don't sanitize passwords
  };
}

/**
 * Validate and sanitize user profile data
 */
export function sanitizeProfileData(data: {
  name?: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}) {
  const sanitized: Record<string, unknown> = {};
  
  if (data.name) {
    sanitized.name = sanitizeText(data.name);
  }
  
  if (data.avatar) {
    sanitized.avatar = sanitizeURL(data.avatar);
  }
  
  if (data.preferences) {
    sanitized.preferences = sanitizeObject(data.preferences);
  }
  
  return sanitized;
}

/**
 * SQL injection prevention - escape special characters
 */
export function escapeSQLString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '\\;')
    .replace(/--/g, '\\--')
    .replace(/\/\*/g, '\\/\\*')
    .replace(/\*\//g, '\\*\\/');
}

/**
 * NoSQL injection prevention for MongoDB-like queries
 */
export function sanitizeNoSQLQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return query;
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeNoSQLQuery);
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Remove potentially dangerous operators
    if (key.startsWith('$') && !['$eq', '$ne', '$in', '$nin', '$gt', '$gte', '$lt', '$lte'].includes(key)) {
      continue;
    }
    
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeNoSQLQuery(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}