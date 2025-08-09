import { z } from 'zod';

// User registration validation schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

// User login validation schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
});

// Google OAuth validation schema
export const googleAuthSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional()
});

// User preferences validation schema
export const userPreferencesSchema = z.object({
  propertyTypes: z.array(z.string()).default([]),
  priceRange: z.object({
    min: z.number().min(0, 'Minimum price must be positive').default(0),
    max: z.number().min(0, 'Maximum price must be positive').default(10000000)
  }).refine(data => data.max >= data.min, {
    message: 'Maximum price must be greater than or equal to minimum price'
  }),
  locations: z.array(z.string()).default([]),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    newProperties: z.boolean().default(true),
    priceAlerts: z.boolean().default(true)
  })
});

// User profile update validation schema
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
  preferences: userPreferencesSchema.optional()
});

// Wishlist validation schemas
export const wishlistActionSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  action: z.enum(['add', 'remove'], {
    errorMap: () => ({ message: 'Action must be either "add" or "remove"' })
  })
});

export const wishlistItemSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Activity tracking validation schemas
export const activitySchema = z.object({
  type: z.enum(['property_view', 'search', 'wishlist_add', 'wishlist_remove', 'contact_inquiry']),
  propertyId: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  sessionId: z.string().min(1, 'Session ID is required'),
  ipAddress: z.string().ip('Invalid IP address'),
  userAgent: z.string().min(1, 'User agent is required')
});

// Search query validation schema
export const searchQuerySchema = z.object({
  query: z.string().max(200, 'Search query must be less than 200 characters').optional(),
  filters: z.object({
    propertyType: z.string().optional(),
    location: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    category: z.string().optional()
  }).optional()
});

// Admin validation schemas
export const adminUserQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'lastLoginAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Password change validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Email verification validation schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// Password reset validation schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Response type schemas
export const loginResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.enum(['user', 'admin']),
    avatar: z.string().optional()
  }).optional(),
  token: z.string().optional(),
  error: z.string().optional()
});

export const registerResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.enum(['user', 'admin']),
    avatar: z.string().optional()
  }).optional(),
  token: z.string().optional(),
  error: z.string().optional()
});

export const googleAuthResponseSchema = z.object({
  success: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.enum(['user', 'admin']),
    avatar: z.string().optional()
  }).optional(),
  token: z.string().optional(),
  error: z.string().optional()
});

// Type exports for use in components
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type GoogleAuthData = z.infer<typeof googleAuthSchema>;
export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type WishlistActionData = z.infer<typeof wishlistActionSchema>;
export type WishlistItemData = z.infer<typeof wishlistItemSchema>;
export type ActivityData = z.infer<typeof activitySchema>;
export type SearchQueryData = z.infer<typeof searchQuerySchema>;
export type AdminUserQueryData = z.infer<typeof adminUserQuerySchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Response type exports
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type GoogleAuthResponse = z.infer<typeof googleAuthResponseSchema>;