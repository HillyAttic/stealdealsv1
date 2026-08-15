import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import admin, { db as adminFs } from '@/lib/firebase-server-admin';


// Helper function to check if user is actually a superuser
async function isSuperuser(adminUser: { id: string; email: string; role: string }): Promise<boolean> {
    if (adminUser.email === 'stealdeals.co.in@gmail.com') return true;
    if (adminUser.role === 'superuser') return true;

    try {
        const docSnap = await adminFs.collection('adminUsers').doc(adminUser.id).get();
        if (docSnap.exists) {
            const userData = docSnap.data();
            if (userData?.role === 'superuser') return true;
        }
    } catch (error) {
        console.error('[Firebase Users API] Error checking Firestore role:', error);
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
        };

        console.log('[Firebase Admin Users API] GET - Fetching admin users');

        try {
            const hasAccess = await isSuperuser(adminUser);
            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Unauthorized: Only superusers can view admin users' },
                    { status: 403 }
                );
            }

            const snapshot = await adminFs.collection('adminUsers').get();
            const users: any[] = [];

            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                users.push({
                    id: docSnap.id,
                    uid: docSnap.id,
                    email: data.email || 'No email',
                    role: data.role || 'user',
                    name: data.name || data.email?.split('@')[0] || 'Unknown',
                    createdAt: data.createdAt || null,
                    permissions: data.permissions || {},
                    isActive: data.isActive !== false,
                    createdBy: data.createdBy,
                    plainPassword: data.plainPassword || null,
                });
            });

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

        try {
            const hasAccess = await isSuperuser(adminUser);
            if (!hasAccess) {
                return NextResponse.json(
                    { error: 'Unauthorized: Only superusers can create admin users' },
                    { status: 403 }
                );
            }

            const body = await request.json();
            const { email, password, name, role = 'admin', permissions = {} } = body;

            if (!email || !password || !name) {
                return NextResponse.json(
                    { error: 'Email, name and password are required' },
                    { status: 400 }
                );
            }

            if (role !== 'superuser' && role !== 'subuser') {
                return NextResponse.json(
                    { error: 'Invalid role: must be either "superuser" or "subuser"' },
                    { status: 400 }
                );
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }

            if (role === 'subuser') {
                const hasPagePermission = permissions?.pages && Object.values(permissions.pages).some((p: any) => p);
                if (!hasPagePermission) {
                    return NextResponse.json(
                        { error: 'At least one page permission must be selected for subusers' },
                        { status: 400 }
                    );
                }
            }

            let userRecord;
            try {
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: password,
                    displayName: name,
                    emailVerified: false,
                });
            } catch (firebaseError: any) {
                if (firebaseError.code === 'auth/email-already-exists') {
                    return NextResponse.json(
                        { error: 'Email already exists' },
                        { status: 409 }
                    );
                }
                throw firebaseError;
            }

            const userId = userRecord.uid;

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
                plainPassword: password,
                createdAt: new Date().toISOString(),
                createdBy: adminUser.id
            };

            await adminFs.collection('adminUsers').doc(userId).set(userData);

            console.log('[Firebase Admin Users API] Created user in Firestore:', userId);

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

            const docRef = adminFs.collection('adminUsers').doc(userId);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            if (updateData.password) {
                try {
                    await admin.auth().updateUser(userId, { password: updateData.password });
                } catch (e) {
                    console.error("Failed to update password in Firebase Auth", e);
                }
                // Store the new plain password so it can be retrieved later
                updateData.plainPassword = updateData.password;
                delete updateData.password;
            }

            delete updateData.uid;
            delete updateData.id;

            await docRef.update({
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

            if (userId === adminUser.id) {
                return NextResponse.json(
                    { error: 'Cannot delete your own account' },
                    { status: 400 }
                );
            }

            await adminFs.collection('adminUsers').doc(userId).delete();

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
