// src/app/api/audition/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const auditionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email format").max(120, "Email is too long"),
  phone: z.string().trim().min(7, "Phone number is too short").max(20, "Phone number is too long"),
  branch: z.string().trim().max(100, "Branch name is too long").optional().default(""),
  year: z.string().trim().max(20, "Year is too long").optional().default(""),
  role: z.string().trim().min(2, "Role is required").max(60, "Role is too long"),
  experience: z.string().trim().max(3000, "Experience details exceed limit").optional().default(""),
  portfolio: z.string().trim().max(500, "Portfolio URL is too long").optional().default(""),
  photoLink: z.string().trim().max(500, "Photo URL is too long").optional().default(""),
  motivation: z.string().trim().max(3000, "Motivation exceeds limit").optional().default(""),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting Check (5 audition submissions per minute per IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`audition_${clientIp}`, 5, 60 * 1000);

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

    // 2. Parse JSON & Validate with Schema
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = auditionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Validation failed";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const validatedData = parseResult.data;

    // 3. Save Sanitized & Explicit Fields Only
    const docRef = await addDoc(collection(db, "auditions"), {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      branch: validatedData.branch,
      year: validatedData.year,
      role: validatedData.role,
      experience: validatedData.experience,
      portfolio: validatedData.portfolio,
      photoLink: validatedData.photoLink,
      motivation: validatedData.motivation || validatedData.experience,
      status: "pending",
      submittedAt: new Date().toISOString(),
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 200 });

  } catch (error: any) {
    console.error("AUDITION SERVER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to submit audition. Please try again." }, 
      { status: 500 }
    );
  }
}
