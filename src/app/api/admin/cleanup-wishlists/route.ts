import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { database as adminDb } from '@/lib/firebase-server-admin';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    return requireAdminAuth(request, async (req) => {
        const adminUser = req.user;

        // Only superusers can run cleanup
        if (adminUser.role !== 'superuser' && adminUser.email !== 'stealdeals.co.in@gmail.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { dryRun = true } = await request.json();

        console.log('[Cleanup] Starting wishlist cleanup, dryRun:', dryRun);

        try {
            const wishlistsRef = adminDb.ref('wishlists');
            const snapshot = await wishlistsRef.once('value');

            if (!snapshot.exists()) {
                return NextResponse.json({
                    message: 'No wishlists found',
                    deletedUsers: [],
                    dryRun
                });
            }

            const wishlists = snapshot.val();
            const userIds = Object.keys(wishlists);
            const deletedUsers: string[] = [];

            const client = await clerkClient();

            for (const userId of userIds) {
                try {
                    await client.users.getUser(userId);
                    // User exists, skip
                } catch (error: any) {
                    if (error?.status === 404) {
                        console.log(`[Cleanup] User ${userId} not found in Clerk`);
                        deletedUsers.push(userId);

                        if (!dryRun) {
                            // Actually delete the wishlist
                            await adminDb.ref(`wishlists/${userId}`).remove();
                            console.log(`[Cleanup] Deleted wishlist for user ${userId}`);
                        }
                    }
                }
            }

            return NextResponse.json({
                success: true,
                dryRun,
                totalUsers: userIds.length,
                deletedUsers,
                deletedCount: deletedUsers.length,
                message: dryRun
                    ? `Would delete ${deletedUsers.length} orphaned wishlists`
                    : `Deleted ${deletedUsers.length} orphaned wishlists`
            });

        } catch (error: any) {
            console.error('[Cleanup] Error:', error);
            return NextResponse.json(
                { error: 'Cleanup failed', details: error?.message },
                { status: 500 }
            );
        }
    });
}
