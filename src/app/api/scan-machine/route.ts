import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a fitness and gym equipment expert. Analyze this gym machine photo and return a JSON object ONLY (no markdown). Structure:
{
  "machineName": "string",
  "category": "string",
  "primaryMuscles": ["string"],
  "secondaryMuscles": ["string"],
  "metValue": number,
  "caloriesBurnedPerHour": number,
  "difficultyLevel": "string",
  "formTips": ["string"],
  "commonMistakes": ["string"],
  "safetyNotes": "string"
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
    ]);

    const raw = result.response.text();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error("Error /api/scan-machine:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
