import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Writes to the "messages" collection so your Admin Inbox can read it
    const docRef = await addDoc(collection(db, "messages"), {
      ...data,
      timestamp: new Date().toISOString(),
      read: false // Flags it as "New" for your inbox
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error: any) {
    console.error("CONTACT SERVER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message." }, 
      { status: 500 }
    );
  }
}
