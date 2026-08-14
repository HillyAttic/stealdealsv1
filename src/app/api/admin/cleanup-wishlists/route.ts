import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/admin-middleware';
import { db as adminFs } from '@/lib/firebase-server-admin';
import { FirebaseAdminUserService } from '@/lib/admin/firebase-admin-user-service';

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
            // In Firestore, wishlists is a top-level collection with per-user subcollections:
            // wishlists/{userId}/items/{itemId}
            // Use listDocuments to get all user wishlist parent docs.
            const [userDocs] = await adminFs.collection('wishlists').listDocuments();
            const userIds = userDocs.map(d => d.id);

            if (userIds.length === 0) {
                return NextResponse.json({
                    message: 'No wishlists found',
                    deletedUsers: [],
                    dryRun
                });
            }

            const deletedUsers: string[] = [];

            for (const userId of userIds) {
                try {
                    await FirebaseAdminUserService.getUser(userId);
                    // User exists, skip
                } catch (error: any) {
                    if (error?.status === 404) {
                        console.log(`[Cleanup] User ${userId} not found in Firebase Auth`);
                        deletedUsers.push(userId);

                        if (!dryRun) {
                            // Delete all items in the user's wishlist subcollection
                            const itemsCol = adminFs.collection('wishlists').doc(userId).collection('items');
                            const items = await itemsCol.listDocuments();
                            const batch = adminFs.batch();
                            for (const itemDoc of items) {
                                batch.delete(itemDoc);
                            }
                            await batch.commit();

                            // Delete the parent wishlist document
                            await adminFs.collection('wishlists').doc(userId).delete();
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
