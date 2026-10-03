import { NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.0-flash-lite';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });
    }

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are the IRON LOG AI Coach, an elite, highly motivating, and knowledgeable fitness and nutrition expert. You give concise, actionable, and science-backed advice on bodybuilding, fat loss, and metabolism. Speak with a confident, intense, gym-bro but highly intelligent tone." }]
          },
          contents: formattedMessages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      console.error("Gemini /api/chat error:", response.status, errMsg);
      return NextResponse.json({ error: `Gemini API Error (${response.status}): ${errMsg}` }, { status: response.status });
    }

    return NextResponse.json({
      message: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from model."
    });

  } catch (error: any) {
    console.error("Internal error /api/chat:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error?.message}` }, { status: 500 });
  }
}
