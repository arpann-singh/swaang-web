// src/app/api/notify-crew/route.ts
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// 1. Initialize the Firebase Admin SDK securely
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "swaangclub", // Your exact project ID
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This replace function ensures the secret key formats correctly across different operating systems
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
    }

    // 2. Fetch all subscribed crew tokens from the database
    const tokensSnapshot = await db.collection("fcm_tokens").get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    if (tokens.length === 0) {
      return NextResponse.json({ message: "No crew members subscribed to push notifications yet." }, { status: 200 });
    }

    // 3. Package the Push Notification
    const payload = {
      notification: {
        title: `🚨 ${title}`,
        body: message,
      },
      tokens: tokens, // This sends it to everyone at exactly the same time
    };

    // 4. Blast the notification to all phones!
    const response = await admin.messaging().sendEachForMulticast(payload);

    return NextResponse.json({ 
      success: true, 
      message: `Alert Dispatched! Reached ${response.successCount} crew members. Failed: ${response.failureCount}` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Push Dispatch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}