// src/app/api/notify-crew/route.ts
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getAdminApp, verifyAuthToken } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the caller
    const authContext = await verifyAuthToken(req);
    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized. Valid authentication credentials are required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, message, recipientType = "all" } = body;

    // 2. Validate payload
    if (!title || typeof title !== "string" || !message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing or invalid title or message." }, { status: 400 });
    }

    if (title.length > 100 || message.length > 500) {
      return NextResponse.json({ error: "Payload exceeds allowed size limits." }, { status: 400 });
    }

    // 3. Authorize based on recipientType
    // Only verified admins can broadcast to "all" (entire crew)
    if (recipientType === "all" && !authContext.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can dispatch broadcasts to all crew members." },
        { status: 403 }
      );
    }

    // Team members can ping admins ("admin" recipientType)
    if (recipientType === "admin" && !authContext.isTeamMember && !authContext.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You must be a registered team member to send alerts to admins." },
        { status: 403 }
      );
    }

    // 4. Fetch tokens based on role
    getAdminApp();
    const db = admin.firestore();
    let tokensQuery: any = db.collection("fcm_tokens");

    if (recipientType === "admin") {
      tokensQuery = tokensQuery.where("role", "==", "admin");
    }

    const tokensSnapshot = await tokensQuery.get();
    const tokens = tokensSnapshot.docs
      .map((doc: admin.firestore.QueryDocumentSnapshot) => doc.data().token)
      .filter((t: any): t is string => typeof t === "string" && t.length > 0);

    if (tokens.length === 0) {
      return NextResponse.json({
        message: recipientType === "admin" ? "No Admin devices registered." : "No crew members subscribed.",
      }, { status: 200 });
    }

    // 5. Package Push Notification
    const payload = {
      notification: {
        title: recipientType === "admin" ? `👑 ADMIN ALERT: ${title}` : `🚨 ${title}`,
        body: message,
      },
      tokens: tokens,
    };

    // 6. Dispatch
    const response = await admin.messaging().sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      message: `Alert Dispatched! Reached ${response.successCount} devices. Failed: ${response.failureCount}`,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Push Dispatch Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}