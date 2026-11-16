import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK singleton safely
export function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID || "swaangclub";

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback for environments with application default credentials or mock/dev
  return admin.initializeApp({
    projectId,
  });
}

export interface AuthContext {
  uid: string;
  email?: string;
  isAdmin: boolean;
  isTeamMember: boolean;
}

/**
 * Verifies the Firebase Auth Bearer token in the Authorization header.
 * Returns AuthContext if valid, or null if unauthenticated.
 */
export async function verifyAuthToken(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) return null;

  try {
    getAdminApp();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();

    // Determine admin status
    // 1. Firebase Custom Claims
    const hasAdminClaim = Boolean(decodedToken.admin || decodedToken.role === "admin");

    // 2. Environment Whitelist
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const isWhitelisted = email ? adminEmails.includes(email) : false;

    // 3. Firestore Directory check for leads / presidents
    let isLeadInFirestore = false;
    let isMember = false;

    if (email) {
      try {
        const db = admin.firestore();
        const teamSnap = await db.collection("team").where("email", "==", email).get();
        if (!teamSnap.empty) {
          isMember = true;
          const memberData = teamSnap.docs[0].data();
          if (
            memberData.isCurrentPresident ||
            memberData.category === "president" ||
            memberData.role?.toLowerCase().includes("lead") ||
            memberData.role?.toLowerCase().includes("director")
          ) {
            isLeadInFirestore = true;
          }
        }
      } catch (dbErr) {
        console.warn("Could not query team collection for admin status:", dbErr);
      }
    }

    const isAdmin = hasAdminClaim || isWhitelisted || isLeadInFirestore;

    return {
      uid: decodedToken.uid,
      email,
      isAdmin,
      isTeamMember: isMember || isAdmin,
    };
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}
