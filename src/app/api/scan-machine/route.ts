import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        parts: [
          { text: `You are a fitness and gym equipment expert. Analyze this gym machine photo and return a JSON object ONLY (no markdown). Structure:\n{\n  "machineName": "string",\n  "category": "string",\n  "primaryMuscles": ["string"],\n  "secondaryMuscles": ["string"],\n  "metValue": number,\n  "caloriesBurnedPerHour": number,\n  "difficultyLevel": "string",\n  "formTips": ["string"],\n  "commonMistakes": ["string"],\n  "safetyNotes": "string"\n}` },
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
        ]
      }]
    });

    const raw = response.text ?? '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error("Error /api/scan-machine:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
