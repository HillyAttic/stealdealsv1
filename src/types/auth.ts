// TypeScript interfaces for User Authentication System

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // null for OAuth users
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
  website?: string;
  avatar?: string;
  provider: 'email' | 'google';
  providerId?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  propertyTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  locations: string[];
  notifications: {
    email: boolean;
    push: boolean;
    newProperties: boolean;
    priceAlerts: boolean;
  };
}

export interface WishlistItem {
  id: string;
  userId: string;
  propertyId: string;
  addedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WishlistProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  type: string;
  addedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

export type ActivityType = 
  | 'property_view'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'search'
  | 'filter_apply'
  | 'contact_inquiry'
  | 'property_share';

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  propertyId?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
}

export interface PropertyView {
  propertyId: string;
  propertyTitle: string;
  viewedAt: Date;
  duration?: number;
  source: 'search' | 'wishlist' | 'direct' | 'recommendation';
}

export interface UserAnalytics {
  userId: string;
  totalViews: number;
  uniqueProperties: number;
  averageSessionDuration: number;
  favoritePropertyTypes: PropertyTypeStats[];
  preferredLocations: LocationStats[];
  activityByDay: DailyActivity[];
  conversionMetrics: ConversionData;
}

export interface PropertyTypeStats {
  type: string;
  count: number;
  percentage: number;
}

export interface LocationStats {
  location: string;
  count: number;
  percentage: number;
}

export interface DailyActivity {
  date: string;
  views: number;
  searches: number;
  wishlistActions: number;
}

export interface ConversionData {
  propertyViews: number;
  wishlistAdds: number;
  contactInquiries: number;
  conversionRate: number;
}

// API Request/Response interfaces
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserProfile;
}

export interface GoogleAuthRequest {
  code: string;
  state?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  token: string;
  user: UserProfile;
  isNewUser: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
  website?: string;
  avatar?: string;
  role: 'user' | 'admin';
  provider: 'email' | 'google';
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export interface WishlistResponse {
  properties: WishlistProperty[];
  total: number;
}

export interface WishlistRequest {
  propertyId: string;
  action: 'add' | 'remove';
}

export interface ActivityResponse {
  viewHistory: PropertyView[];
  searchHistory: SearchQuery[];
  engagementMetrics: EngagementData;
}

export interface SearchQuery {
  id: string;
  query: string;
  filters: Record<string, unknown>;
  timestamp: Date;
  resultsCount: number;
}

export interface EngagementData {
  totalSessions: number;
  averageSessionDuration: number;
  pagesPerSession: number;
  bounceRate: number;
}

export interface ActivityStats {
  totalViews: number;
  wishlistItems: number;
  totalActivities: number;
  recentActivities: UserActivity[];
  topViewedProperties: Array<{
    propertyId: string;
    viewCount: number;
    property: {
      title: string;
      location: string;
      price: number;
      imageUrl: string;
      type: string;
    };
  }>;
}

export interface ActivityAggregation {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByDay: Array<{
    date: string;
    count: number;
    types: Record<ActivityType, number>;
  }>;
  activitiesByHour: Array<{
    hour: number;
    count: number;
  }>;
  topProperties: Array<{
    propertyId: string;
    viewCount: number;
    title?: string;
  }>;
  userEngagement: {
    averageSessionDuration: number;
    averageActivitiesPerSession: number;
    returnUserRate: number;
  };
}

export interface PaginatedActivities {
  activities: UserActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Admin interfaces
export interface AdminUsersResponse {
  users: UserSummary[];
  pagination: PaginationInfo;
  statistics: UserStatistics;
}

export interface AdminUserDetailsResponse {
  user: UserProfile;
  activity: UserActivity[];
  wishlist: WishlistProperty[];
  analytics: UserAnalytics;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  totalViews: number;
  wishlistCount: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  averageSessionDuration: number;
}

// Error handling interfaces
export enum AuthErrorCodes {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  GOOGLE_AUTH_FAILED = 'GOOGLE_AUTH_FAILED'
}

export interface AuthError {
  code: AuthErrorCodes;
  message: string;
  field?: string;
}