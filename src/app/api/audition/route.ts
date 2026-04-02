import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    // 1. Receive the data safely from the user's phone
    const data = await req.json();

    // 2. Server securely writes to Firebase (Immune to AdBlockers)
    const docRef = await addDoc(collection(db, "auditions"), {
      ...data,
      submittedAt: new Date().toISOString(),
      status: "pending" // Flags it as a new audition for your Master Hub
    });

    // 3. Send success confirmation back to the client
    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error: any) {
    console.error("Server Submission Error:", error);
    return NextResponse.json(
      { error: "Failed to submit securely. Please try again." }, 
      { status: 500 }
    );
  }
}
