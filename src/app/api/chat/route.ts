import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // We expect the user to have GEMINI_API_KEY in their .env.local
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    // Format messages for Gemini API
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
           parts: [{ text: "You are the IRON LOG AI Coach, an elite, highly motivating, and knowledgeable fitness and nutrition expert. You give concise, actionable, and science-backed advice on bodybuilding, fat loss, and metabolism. Speak with a confident, intense, gym-bro but highly intelligent tone." }]
        },
        contents: formattedMessages
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("GEMINI ERROR RESPONSE:", data);
      return NextResponse.json({ error: "Gemini API Error", details: data }, { status: response.status });
    }

    return NextResponse.json({ 
      message: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
