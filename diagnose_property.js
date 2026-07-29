
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, child, update } = require('firebase/database');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://stealdeals-e89ab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function diagnose() {
    const id = 'PROP_VCNT_118';
    console.log(`Diagnosing property: ${id}`);

    const paths = [
        `migratedProperties/vacant/${id}`,
        `migratedProperties/preleased/${id}`,
        `migratedProperties/franchise/${id}`,
        `migratedProperties/plots/${id}`,
        `vacantProperties/${id}`,
        `preleasedProperties/${id}`,
        `franchiseProperties/${id}`,
        `plots/${id}`,
        `properties/${id}`
    ];

    for (const p of paths) {
        const snapshot = await get(ref(db, p));
        if (snapshot.exists()) {
            console.log(`✅ Found in: ${p}`);
            console.log('createdBy value:', snapshot.val().createdBy);
            console.log('Content preview:', JSON.stringify(snapshot.val(), null, 2));

            // Try a test update with undefined to see if it matches the suspected error
            try {
                const testData = { ...snapshot.val(), createdBy: undefined };
                console.log(`Attempting update with createdBy=undefined on ${p}...`);
                await update(ref(db, p), testData);
                console.log('✅ Update with undefined (unexpectedly) successful');
            } catch (e) {
                console.log('❌ Update with undefined failed (as suspected):', e.message);
            }
        }
    }

    process.exit(0);
}

diagnose().catch(err => {
    console.error('Diagnosis failed:', err);
    process.exit(1);
});
