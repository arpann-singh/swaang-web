import { User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Checks whether an authenticated user possesses administrative clearance.
 * 
 * Verifies:
 * 1. Firebase Auth Custom Claims (if set via Firebase Admin SDK)
 * 2. Whitelisted emails configured in NEXT_PUBLIC_ADMIN_EMAILS
 * 3. Registered Team document with administrative privileges (e.g. isCurrentPresident, president, lead, admin)
 */
export async function verifyAdminAccess(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;

  const email = user.email.toLowerCase();

  // 1. Check custom claims
  try {
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.admin === true || idTokenResult.claims.role === "admin") {
      return true;
    }
  } catch (err) {
    console.warn("Could not retrieve custom claims:", err);
  }

  // 2. Check environment variable whitelist
  const envAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (envAdminEmails.includes(email)) {
    return true;
  }

  // 3. Fallback: Query Firestore "team" collection for administrative roles
  try {
    const q = query(collection(db, "team"), where("email", "==", email));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const data = snap.docs[0].data();
      const role = (data.role || "").toLowerCase();
      const category = (data.category || "").toLowerCase();

      if (
        data.isCurrentPresident === true ||
        category === "president" ||
        role.includes("president") ||
        role.includes("lead") ||
        role.includes("director") ||
        role.includes("admin")
      ) {
        return true;
      }
    }
  } catch (err) {
    console.warn("Could not check Firestore team directory for admin privileges:", err);
  }

  // Default: if email is the primary admin domain, club admin email, or developer admin email
  if (
    email.endsWith("@swaang.club") ||
    email === "admin@swaang.club" ||
    email === "president@swaang.club" ||
    email === "arpans7@outlook.in"
  ) {
    return true;
  }

  return false;
}
