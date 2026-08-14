import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth, db } from "@/lib/firebase-server-admin";
import admin from "firebase-admin";

const DEFAULT_PREFERENCES = {
  propertyTypes: [],
  priceRange: { min: 0, max: 10000000 },
  locations: [],
  notifications: {
    email: true,
    push: false,
    newProperties: true,
    priceAlerts: true,
  },
};

/**
 * POST /api/auth/sync-user
 * Verifies the Firebase ID token and creates/merges the user document
 * in Firestore using the Admin SDK (bypasses security rules).
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 }
      );
    }

    // 1. Verify the ID token
    let decodedToken;
    try {
      decodedToken = await (adminAuth as admin.auth.Auth).verifyIdToken(idToken);
    } catch (verifyError: any) {
      console.error("[sync-user] Token verification failed:", verifyError.message);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email || null;
    const displayName = decodedToken.name || null;
    const photoURL = decodedToken.picture || null;
    const emailVerified = decodedToken.email_verified || false;
    const provider =
      decodedToken.firebase?.sign_in_provider === "google.com"
        ? "google"
        : "email";

    // 2. Read existing user document via Admin SDK
    const userRef = (db as admin.firestore.Firestore).collection("users").doc(uid);
    const userSnap = await userRef.get();

    let userData: any;
    const now = admin.firestore.FieldValue.serverTimestamp();

    if (!userSnap.exists) {
      // Create new user document
      userData = {
        uid,
        email,
        name: displayName || email?.split("@")[0] || "",
        displayName,
        avatar: photoURL,
        photoURL,
        emailVerified,
        role: "user",
        provider,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        preferences: DEFAULT_PREFERENCES,
      };
      await userRef.set(userData);
    } else {
      // Merge-update lastLoginAt and updatedAt
      const existing = userSnap.data() || {};
      const mergeData: any = {
        lastLoginAt: now,
        updatedAt: now,
      };
      // Also sync any Auth fields that may have changed
      if (email !== undefined && email !== existing.email) mergeData.email = email;
      if (displayName !== undefined && displayName !== existing.displayName) {
        mergeData.displayName = displayName;
        mergeData.name = displayName;
      }
      if (photoURL !== undefined && photoURL !== existing.photoURL) {
        mergeData.photoURL = photoURL;
        mergeData.avatar = photoURL;
      }
      if (emailVerified !== undefined) mergeData.emailVerified = emailVerified;

      await userRef.set(mergeData, { merge: true });

      // Re-read to get the merged document
      const mergedSnap = await userRef.get();
      userData = mergedSnap.data() || {};
    }

    return NextResponse.json({
      success: true,
      user: {
        id: uid,
        email: userData.email || email,
        name: userData.name || displayName || email?.split("@")[0] || "",
        displayName: userData.displayName || displayName,
        avatar: userData.avatar || photoURL,
        photoURL: userData.photoURL || photoURL,
        emailVerified: userData.emailVerified ?? emailVerified,
        role: userData.role || "user",
        provider: userData.provider || provider,
        isActive: userData.isActive !== false,
        preferences: userData.preferences || DEFAULT_PREFERENCES,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLoginAt: userData.lastLoginAt,
      },
    });
  } catch (error: any) {
    console.error("[sync-user] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to sync user document" },
      { status: 500 }
    );
  }
}
