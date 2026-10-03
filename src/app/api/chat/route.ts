import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: "You are the IRON LOG AI Coach, an elite, highly motivating, and knowledgeable fitness and nutrition expert. You give concise, actionable, and science-backed advice on bodybuilding, fat loss, and metabolism. Speak with a confident, intense, gym-bro but highly intelligent tone."
      },
      history
    });

    const response = await chat.sendMessage({ message: lastMessage });

    return NextResponse.json({ message: response.text });

  } catch (error: any) {
    console.error("Error /api/chat:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
