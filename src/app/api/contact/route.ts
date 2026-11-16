// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email format").max(120, "Email is too long"),
  phone: z.string().trim().max(25, "Phone number is too long").optional().nullable(),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters").max(150, "Subject is too long"),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000, "Message exceeds character limit"),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check (5 submissions per minute per IP)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`contact_${clientIp}`, 5, 60 * 1000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Too many submissions. Please wait ${rateLimit.reset} seconds before trying again.` },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.reset),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          }
        }
      );
    }

    // 2. Parse & Validate Payload
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = contactSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, phone, subject, message } = parseResult.data;

    // 3. Save Sanitized Entry to Firestore
    const docRef = await addDoc(collection(db, "messages"), {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      createdAt: Date.now(),
      status: "unread",
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error: any) {
    console.error("API Error saving contact form:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your message." },
      { status: 500 }
    );
  }
}
