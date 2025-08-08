import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { deleteUserAccount } from '@/lib/database/users';
import { z } from 'zod';

// Validation schema for account deletion
const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  confirmation: z.literal('DELETE_MY_ACCOUNT', {
    errorMap: () => ({ message: 'Please type "DELETE_MY_ACCOUNT" to confirm' })
  })
});

// DELETE /api/user/delete - Delete user account
export async function DELETE(request: NextRequest) {
  return requireAuth(request, async (authenticatedRequest) => {
    try {
      const userId = authenticatedRequest.user.id;
      const body = await request.json();

      // Validate request body
      const validationResult = deleteAccountSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid data',
            details: validationResult.error.errors
          },
          { status: 400 }
        );
      }

      const { password } = validationResult.data;

      // Delete user account (this will also verify password)
      const result = await deleteUserAccount(userId, password);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }

      // Clear the authentication cookie
      const response = NextResponse.json({
        success: true,
        message: 'Account deleted successfully'
      });

      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });

      return response;

    } catch (error) {
      console.error('Error deleting user account:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete account' },
        { status: 500 }
      );
    }
  });
}