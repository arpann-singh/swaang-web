import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    // 🧠 Grab EVERYTHING sent from the form
    const data = await req.json();

    // 📥 Save it all to the "auditions" collection
    const docRef = await addDoc(collection(db, "auditions"), {
      ...data, // This magic spread operator ensures reason & portfolio are included!
      status: "pending",
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error: any) {
    console.error("AUDITION SERVER ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit audition." }, 
      { status: 500 }
    );
  }
}
