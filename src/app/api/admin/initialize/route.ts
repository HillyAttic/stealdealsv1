import { NextRequest, NextResponse } from 'next/server';
import { initializeAdminSchema, createInitialSuperuser } from '@/lib/admin/initializeAdminSchema';

/**
 * Initialize admin user management schema
 * This endpoint should be called once during setup
 * POST /api/admin/initialize
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { createSuperuser, superuserData } = body;

    // Initialize the database schema
    const schemaResult = await initializeAdminSchema();

    if (!schemaResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: schemaResult.error,
          results: schemaResult.results 
        },
        { status: 500 }
      );
    }

    let superuserResult = null;

    // Create initial superuser if requested
    if (createSuperuser && superuserData) {
      const { email, password, name } = superuserData;
      
      if (!email || !password) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email and password are required for superuser creation',
            results: schemaResult.results 
          },
          { status: 400 }
        );
      }

      superuserResult = await createInitialSuperuser(email, password, name);
      
      if (!superuserResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: superuserResult.error,
            results: schemaResult.results,
            superuserCreation: superuserResult
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin schema initialized successfully',
      results: schemaResult.results,
      superuserCreated: !!superuserResult?.success,
      superuser: superuserResult?.user ? {
        uid: superuserResult.user.uid,
        email: superuserResult.user.email,
        name: superuserResult.user.name,
        role: superuserResult.user.role,
      } : null,
    });
  } catch (error) {
    console.error('Error in admin initialization:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during initialization' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get initialization status
 * GET /api/admin/initialize
 */
export async function GET() {
  try {
    // This is a simple check - in a real implementation, you might want to
    // check if the schema exists and if there are any admin users
    return NextResponse.json({
      message: 'Admin initialization endpoint',
      instructions: {
        method: 'POST',
        body: {
          createSuperuser: true,
          superuserData: {
            email: 'admin@example.com',
            password: 'secure-password',
            name: 'System Administrator'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}