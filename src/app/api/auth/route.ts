import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This would typically connect to a database
const mockUsers = [
  { id: 1, email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'test@example.com', password: 'password', role: 'user' }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // In a real app, you would:
    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    // 2. Check credentials against database
    const user = mockUsers.find(u => u.email === email);
    
    // In a real app, use proper password comparison like bcrypt
    // Here we're doing a simple password check for demo purposes
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // For admin panel, check for admin role
    if (body.adminLogin && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    // 3. Create JWT (simplified for demo)
    // In a real app, use a library like jsonwebtoken
    const token = `token_${user.id}_${Date.now()}`;
    
    // 4. Return success with token
    return NextResponse.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role
      }
    });
    
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