import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, phone } = body;
    
    // Server-side validation
    const errors: Record<string, string> = {};
    
    if (!name || name.trim().length < 2) {
      errors.name = 'Name is required and must be at least 2 characters';
    }
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!message || message.trim().length < 10) {
      errors.message = 'Message is required and must be at least 10 characters';
    }
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    // Process form data - in a real app, you would:
    // 1. Store in database
    // 2. Send email notification
    // 3. Log the submission
    
    console.log('Contact form submitted:', { name, email, message, phone });
    
    // In production, you'd implement actual email sending here
    // const emailSent = await sendEmail({ to: 'admin@example.com', subject: 'New Contact Form', text: `From: ${name} (${email})\n\n${message}` });
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
} 