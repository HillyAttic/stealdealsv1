import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// In a real app, this would be in a database
// For demo purposes, we'll hash the password once at startup
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@stealdeals.co.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Stealdeals@821';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

// Pre-hash the admin password (in a real app, this would be stored hashed in the database)
const hashedAdminPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Admin user object
const adminUser = { 
  id: 1, 
  email: ADMIN_EMAIL, 
  password: hashedAdminPassword, 
  role: 'admin' 
};

// Mock users - in a real app, this would be in a database
const mockUsers = [
  adminUser,
  { id: 2, email: 'test@example.com', password: bcrypt.hashSync('password', 10), role: 'user' }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Login attempt:', { email, providedPassword: password?.length > 0 });
    console.log('Expected admin:', { email: ADMIN_EMAIL });
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    // Find user - case insensitive email comparison
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // For debugging, add direct password comparison
    console.log('Password check:', { 
      match: password === ADMIN_PASSWORD,
      bcryptMatch: bcrypt.compareSync(password, user.password)
    });
    
    // Check if user exists and password is correct
    // For admin user, allow direct password comparison as fallback
    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const passwordMatches = bcrypt.compareSync(password, user.password) || 
                           (isAdmin && password === ADMIN_PASSWORD);
    
    if (!passwordMatches) {
      console.log('Password incorrect');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check for admin role if attempting admin login
    if (body.adminLogin && user.role !== 'admin') {
      console.log('Not an admin user');
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('Authentication successful');
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Create response
    const response = NextResponse.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role
      }
    });
    
    // Set HTTP-only cookie for enhanced security (can't be accessed by JavaScript)
    response.cookies.set({
      name: 'adminToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    // Also set a readable cookie for client (not HTTP-only) with user info
    response.cookies.set({
      name: 'adminUser',
      value: JSON.stringify({ 
        id: user.id, 
        email: user.email,
        role: user.role
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'Auth service running' });
} 