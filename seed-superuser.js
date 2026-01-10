const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin
try {
    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app'
    });

    const db = app.database();

    const uid = 'aJJ2OMHIJGPUQYD99EgoqTkqYz23';
    const email = 'stealdeals.co.in@gmail.com';

    const userData = {
        uid: uid,
        email: email,
        name: 'StealDeals Admin',
        role: 'superuser',
        permissions: {
            pages: {
                vacant: true,
                plots: true,
                franchise: true,
                preleased: true
            },
            viewOthers: true,
            editOthers: true
        },
        createdAt: new Date().toISOString(),
        createdBy: 'system_seed'
    };

    console.log(`Seeding superuser: ${email} (${uid})...`);

    db.ref(`admin_users/${uid}`).set(userData)
        .then(() => {
            console.log('✅ Successfully seeded superuser');
            process.exit(0);
        })
        .catch((e) => {
            console.error('❌ Error seeding:', e);
            process.exit(1);
        });

} catch (e) {
    console.error('Initialization error:', e);
}
