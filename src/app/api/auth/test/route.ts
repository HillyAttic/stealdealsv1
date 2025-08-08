import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Test validation
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validationResult.data;
    
    // Test password hashing
    const hashedPassword = await hashPassword(password);
    
    return NextResponse.json({
      success: true,
      message: 'Test successful',
      data: {
        name,
        email,
        hashedPasswordLength: hashedPassword.length,
        validation: 'passed'
      }
    });
    
  } catch (error) {
    console.error('Test error:', error);
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
    message: 'Auth test endpoint is working',
    timestamp: new Date().toISOString()
  });
}