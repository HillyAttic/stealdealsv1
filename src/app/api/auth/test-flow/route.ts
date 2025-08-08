import { NextRequest, NextResponse } from 'next/server';
import { registerSchema, loginSchema } from '@/lib/validations/auth';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateToken, verifyToken } from '@/lib/auth/jwt';
import { User } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    if (action === 'full-test') {
      // Test the complete authentication flow
      const testResults = [];
      
      // 1. Test Registration Validation
      const registerData = {
        name: "Test User",
        email: "testuser@example.com",
        password: "TestPass123"
      };
      
      const registerValidation = registerSchema.safeParse(registerData);
      testResults.push({
        step: "Registration Validation",
        success: registerValidation.success,
        details: registerValidation.success ? "Valid" : registerValidation.error.errors
      });
      
      if (!registerValidation.success) {
        return NextResponse.json({ success: false, testResults });
      }
      
      // 2. Test Password Hashing
      const hashedPassword = await hashPassword(registerData.password);
      testResults.push({
        step: "Password Hashing",
        success: hashedPassword.length > 0,
        details: `Hash length: ${hashedPassword.length}`
      });
      
      // 3. Test User Creation (mock)
      const mockUser: User = {
        id: "test-user-1",
        name: registerData.name,
        email: registerData.email,
        password: hashedPassword,
        provider: 'email',
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          propertyTypes: [],
          priceRange: { min: 0, max: 10000000 },
          locations: [],
          notifications: {
            email: true,
            push: false,
            newProperties: true,
            priceAlerts: true
          }
        }
      };
      
      testResults.push({
        step: "User Creation",
        success: true,
        details: `User created with ID: ${mockUser.id}`
      });
      
      // 4. Test JWT Token Generation
      const token = generateToken(mockUser);
      testResults.push({
        step: "JWT Token Generation",
        success: token.length > 0,
        details: `Token length: ${token.length}`
      });
      
      // 5. Test JWT Token Verification
      const tokenPayload = verifyToken(token);
      testResults.push({
        step: "JWT Token Verification",
        success: tokenPayload !== null,
        details: tokenPayload ? `User ID: ${tokenPayload.userId}, Email: ${tokenPayload.email}` : "Invalid token"
      });
      
      // 6. Test Login Validation
      const loginData = {
        email: registerData.email,
        password: registerData.password
      };
      
      const loginValidation = loginSchema.safeParse(loginData);
      testResults.push({
        step: "Login Validation",
        success: loginValidation.success,
        details: loginValidation.success ? "Valid" : loginValidation.error.errors
      });
      
      // 7. Test Password Verification
      const passwordMatch = await verifyPassword(loginData.password, hashedPassword);
      testResults.push({
        step: "Password Verification",
        success: passwordMatch,
        details: passwordMatch ? "Password matches" : "Password does not match"
      });
      
      // 8. Test Session Data Creation
      const sessionData = {
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          createdAt: mockUser.createdAt,
          lastLoginAt: mockUser.lastLoginAt,
          preferences: mockUser.preferences
        },
        token,
        authenticated: true
      };
      
      testResults.push({
        step: "Session Data Creation",
        success: true,
        details: "Session data created successfully"
      });
      
      return NextResponse.json({
        success: true,
        message: "Complete authentication flow test completed",
        testResults,
        sessionData
      });
    }
    
    return NextResponse.json({
      success: false,
      error: "Invalid action. Use 'full-test' to run the complete test."
    });
    
  } catch (error) {
    console.error('Test flow error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Authentication flow test endpoint',
    usage: 'POST with {"action": "full-test"} to run complete authentication test'
  });
}