import { NextRequest, NextResponse } from 'next/server';
import { requireEnhancedAdminAuth } from '@/lib/auth/enhanced-admin-middleware';

export async function GET(request: NextRequest) {
  return requireEnhancedAdminAuth(request, async (authenticatedRequest) => {
    const { user } = authenticatedRequest;
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        effectivePermissions: user.effectivePermissions
      }
    });
  });
}