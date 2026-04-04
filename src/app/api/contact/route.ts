import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 🔥 Added 'phone' to the destructured body
    const { name, email, phone, subject, message } = body;

    // Basic Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Firebase (including the phone number)
    await addDoc(collection(db, 'messages'), {
      name,
      email,
      phone: phone || null, // Save as null if they left it empty
      subject,
      message,
      createdAt: Date.now(),
      status: 'unread'
    });

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("API Error saving contact form:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
