import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import admin, { database as adminDb } from '@/lib/firebase-server-admin';


// Helper function to check if user is actually a superuser
async function isSuperuser(adminUser: { id: string; email: string; role: string }): Promise<boolean> {
    // First check: known superuser email
    if (adminUser.email === 'stealdeals.co.in@gmail.com') {
        return true;
    }

    // Second check: JWT role
    if (adminUser.role === 'superuser') {
        return true;
    }

    // Third check: Database role (most reliable)
    try {
        // Check new path
        let userRef = adminDb.ref(`adminUsers/${adminUser.id}`);
        let userSnapshot = await userRef.once('value');

        // Fallback to old path
        if (!userSnapshot.exists()) {
            userRef = adminDb.ref(`admin_users/${adminUser.id}`);
            userSnapshot = await userRef.once('value');
        }

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            if (userData.role === 'superuser') {
                return true;
            }
        }
    } catch (error) {
        console.error('[Firebase Users API] Error checking database role:', error);
    }

    return false;
}

// GET - Fetch all admin users
export async function GET(request: NextRequest) {
    return requireAdminAuth(request, async (req) => {
        const adminUser = {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role
        }; // normalized user object

        console.log('[Firebase Admin Users API] GET - Fetching admin users');
        console.log('[Firebase Admin Users API] Requesting user:', adminUser.email, 'role:', adminUser.role);

        try {
            // Check if user is superuser
            const hasAccess = await isSuperuser(adminUser);

            if (!hasAccess) {
                console.log('[Firebase Admin Users API] Access denied - not a superuser');
                return NextResponse.json(
                    { error: 'Unauthorized: Only superusers can view admin users' },
                    { status: 403 }
                );
            }

            console.log('[Firebase Admin Users API] Access granted');

            // Fetch admin users from Firebase
            const usersRef = adminDb.ref('adminUsers');
            let snapshot = await usersRef.once('value');

            // Fallback to old path
            if (!snapshot.exists()) {
                console.log('[Firebase Admin Users API] Checking legacy admin_users path');
                snapshot = await adminDb.ref('admin_users').once('value');
            }

            const users: any[] = [];
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                Object.entries(usersData).forEach(([id, data]: [string, any]) => {
                    users.push({
                        id, // Map id to uid/id
                        uid: id, // Ensure compatibility
                        email: data.email || 'No email',
                        role: data.role || 'user',
                        name: data.name || data.email?.split('@')[0] || 'Unknown',
                        createdAt: data.createdAt || null,
                        permissions: data.permissions || {},
                        isActive: data.isActive !== false,
                        createdBy: data.createdBy
                    });
                });
            }

            // Sort by creation date
            users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return NextResponse.json({ users, success: true });

        } catch (error: any) {
            console.error('[Firebase Admin Users API] GET Error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch admin users', details: error?.message },
                { status: 500 }
            );
        }
    });
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
    return requireAdminAuth(request, async (req) => {
        const adminUser = {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role
        };

        console.log('[Firebase Admin Users API] POST - Creating admin user');
        console.log('[Firebase Admin Users API] Requesting user:', adminUser.email, 'role:', adminUser.role);

        try {
            // Check if user is superuser
            const hasAccess = await isSuperuser(adminUser);

            if (!hasAccess) {
                console.log('[Firebase Admin Users API] Access denied - not a superuser');
                return NextResponse.json(
                    { error: 'Unauthorized: Only superusers can create admin users' },
                    { status: 403 }
                );
            }

            console.log('[Firebase Admin Users API] Access granted, processing request...');

            const body = await request.json();
            const { email, password, name, role = 'admin', permissions = {} } = body;

            // Validate required fields
            if (!email || !password || !name) {
                return NextResponse.json(
                    { error: 'Email, name and password are required' },
                    { status: 400 }
                );
            }

            // Validate role
            if (role !== 'superuser' && role !== 'subuser') {
                return NextResponse.json(
                    { error: 'Invalid role: must be either "superuser" or "subuser"' },
                    { status: 400 }
                );
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }

            // For subusers, validate permissions
            if (role === 'subuser') {
                const hasPagePermission = permissions?.pages && Object.values(permissions.pages).some(p => p);
                if (!hasPagePermission) {
                    return NextResponse.json(
                        { error: 'At least one page permission must be selected for subusers' },
                        { status: 400 }
                    );
                }
            }

            console.log(`[Firebase Admin Users API] Creating Firebase Auth user for ${email}`);

            // Create user in Firebase Authentication using Admin SDK
            let userRecord;
            try {
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: password,
                    displayName: name,
                    emailVerified: false,
                });
            } catch (firebaseError: any) {
                console.error('[Firebase Admin Users API] Firebase user creation error:', firebaseError);
                if (firebaseError.code === 'auth/email-already-exists') {
                    return NextResponse.json(
                        { error: 'Email already exists' },
                        { status: 409 }
                    );
                }
                throw firebaseError;
            }

            const userId = userRecord.uid;

            // Hash password (optional, if we want to store it in DB for some reason, but usually not recommended if we use Firebase Auth)
            // The user's solution stored it. I will store it if they want to support custom auth, but I'll rely on Firebase Auth ID.
            // Actually, let's Stick to storing what we need. Firebase Auth handles auth.

            // Create user data for Realtime DB
            const userData = {
                email: email.toLowerCase().trim(),
                name: name,
                role: role,
                permissions: role === 'superuser'
                    ? {
                        pages: { 
                            vacant: true, 
                            plots: true, 
                            franchise: true, 
                            preleased: true,
                            // NEW PERMISSIONS FOR SUPERUSER
                            dashboard: true,
                            users: true,
                            wishlist: true,
                            analytics: true,
                            migration: true
                        },
                        viewOthers: true,
                        editOthers: true,
                    }
                    : permissions,
                isActive: true,
                createdAt: new Date().toISOString(),
                createdBy: adminUser.id
            };

            // Save to database (using adminUsers path)
            await adminDb.ref(`adminUsers/${userId}`).set(userData);

            // Also save to legacy path just in case
            await adminDb.ref(`admin_users/${userId}`).set(userData);

            console.log('[Firebase Admin Users API] Created user:', userId);

            return NextResponse.json({
                success: true,
                message: 'Admin user created successfully',
                user: { ...userData, uid: userId }
            });

        } catch (error: any) {
            console.error('[Firebase Admin Users API] POST Error:', error);
            return NextResponse.json(
                { error: 'Failed to create admin user', details: error?.message },
                { status: 500 }
            );
        }
    });
}

// PUT - Update admin user
export async function PUT(request: NextRequest) {
    return requireAdminAuth(request, async (req) => {
        const adminUser = {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role
        };

        console.log('[Firebase Admin Users API] PUT - Updating admin user');

        try {
            const hasAccess = await isSuperuser(adminUser);

            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Unauthorized: Only superusers can update admin users' },
                    { status: 403 }
                );
            }

            const body = await request.json();
            const { userId, ...updateData } = body;

            if (!userId) {
                return NextResponse.json(
                    { error: 'User ID is required' },
                    { status: 400 }
                );
            }

            // Check if user exists
            const userRef = adminDb.ref(`adminUsers/${userId}`);
            let userSnapshot = await userRef.once('value');

            let refToUpdate = userRef;

            if (!userSnapshot.exists()) {
                // check legacy
                const legacyRef = adminDb.ref(`admin_users/${userId}`);
                userSnapshot = await legacyRef.once('value');
                if (userSnapshot.exists()) {
                    refToUpdate = legacyRef;
                }
            }

            if (!userSnapshot.exists()) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // If password update requested
            if (updateData.password) {
                try {
                    await admin.auth().updateUser(userId, {
                        password: updateData.password
                    });
                } catch (e) {
                    console.error("Failed to update password in Firebase Auth", e);
                    // continue to update DB
                }
                // Remove password from updateData so we don't store it in plain text in DB
                delete updateData.password;
            }

            // Remove other sensitive or immutable fields
            delete updateData.uid;
            delete updateData.id;

            // Update user
            await refToUpdate.update({
                ...updateData,
                updatedAt: new Date().toISOString(),
                updatedBy: adminUser.id
            });

            return NextResponse.json({
                success: true,
                message: 'Admin user updated successfully'
            });

        } catch (error: any) {
            console.error('[Firebase Admin Users API] PUT Error:', error);
            return NextResponse.json(
                { error: 'Failed to update admin user', details: error?.message },
                { status: 500 }
            );
        }
    });
}

// DELETE - Delete admin user
export async function DELETE(request: NextRequest) {
    return requireAdminAuth(request, async (req) => {
        const adminUser = {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role
        };

        console.log('[Firebase Admin Users API] DELETE - Deleting admin user');

        try {
            const hasAccess = await isSuperuser(adminUser);

            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Unauthorized: Only superusers can delete admin users' },
                    { status: 403 }
                );
            }

            const { searchParams } = new URL(request.url);
            const userId = searchParams.get('userId');

            if (!userId) {
                return NextResponse.json(
                    { error: 'User ID is required' },
                    { status: 400 }
                );
            }

            // Prevent deleting yourself
            if (userId === adminUser.id) {
                return NextResponse.json(
                    { error: 'Cannot delete your own account' },
                    { status: 400 }
                );
            }

            // Check if user exists
            // Try both paths
            await adminDb.ref(`adminUsers/${userId}`).remove();
            await adminDb.ref(`admin_users/${userId}`).remove();

            // Delete from Auth
            try {
                await admin.auth().deleteUser(userId);
            } catch (e) {
                console.warn("Failed to delete user from Auth (might already be deleted)", e);
            }

            return NextResponse.json({
                success: true,
                message: 'Admin user deleted successfully'
            });

        } catch (error: any) {
            console.error('[Firebase Admin Users API] DELETE Error:', error);
            return NextResponse.json(
                { error: 'Failed to delete admin user', details: error?.message },
                { status: 500 }
            );
        }
    });
}
