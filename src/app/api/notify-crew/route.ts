// src/app/api/notify-crew/route.ts
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// 1. Initialize the Firebase Admin SDK securely
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "swaangclub", 
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, recipientType = "all" } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
    }

    // 2. Fetch tokens based on role
    let tokensQuery: any = db.collection("fcm_tokens");
    
    if (recipientType === "admin") {
      tokensQuery = tokensQuery.where("role", "==", "admin");
    }

    const tokensSnapshot = await tokensQuery.get();
    
    // 🔥 FIXED: Added explicit type (admin.firestore.QueryDocumentSnapshot) to the doc parameter
    const tokens = tokensSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => doc.data().token);

    if (tokens.length === 0) {
      return NextResponse.json({ 
        message: recipientType === "admin" ? "No Admin devices registered." : "No crew members subscribed." 
      }, { status: 200 });
    }

    // 3. Package the Push Notification
    const payload = {
      notification: {
        title: recipientType === "admin" ? `👑 ADMIN ALERT: ${title}` : `🚨 ${title}`,
        body: message,
      },
      tokens: tokens, 
    };

    // 4. Dispatch
    const response = await admin.messaging().sendEachForMulticast(payload);

    return NextResponse.json({ 
      success: true, 
      message: `Alert Dispatched! Reached ${response.successCount} devices. Failed: ${response.failureCount}` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Push Dispatch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}