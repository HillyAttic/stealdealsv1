const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
}

const auth = admin.auth();
const db = admin.database();

const adminEmail = 'stealdeals.co.in@gmail.com';
const adminPassword = 'Stealdeals@821';
const adminName = 'StealDeals Admin';

async function setupAdmin() {
    try {
        console.log(`Checking if admin user exists: ${adminEmail}`);
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(adminEmail);
            console.log(`User already exists in Auth: ${userRecord.uid}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('User not found, creating...');
                userRecord = await auth.createUser({
                    email: adminEmail,
                    password: adminPassword,
                    displayName: adminName,
                    emailVerified: true
                });
                console.log(`Successfully created user in Auth: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }

        const uid = userRecord.uid;
        const userData = {
            uid: uid,
            email: adminEmail,
            name: adminName,
            role: 'superuser',
            permissions: {
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
                editOthers: true
            },
            createdAt: new Date().toISOString(),
            createdBy: 'setup_script'
        };

        console.log('Ensuring user data exists in Realtime Database...');
        // Update both paths for compatibility
        await db.ref(`adminUsers/${uid}`).set(userData);
        await db.ref(`admin_users/${uid}`).set(userData);

        console.log('✅ Admin user setup complete!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error in setup:', error);
        process.exit(1);
    }
}

setupAdmin();
