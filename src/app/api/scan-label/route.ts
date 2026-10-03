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
          { text: `You are a food safety expert. Analyze this food label/ingredients list and return a JSON object ONLY (no markdown). Structure:\n{\n  "productName": "string",\n  "overallGrade": "string (A/B/C/D/F)",\n  "gradeColor": "string (green/yellow/orange/red)",\n  "gradeExplanation": "string",\n  "totalCalories": number,\n  "servingSize": "string",\n  "harmfulIngredients": [{"name": "string", "reason": "string", "severity": "string"}],\n  "goodIngredients": ["string"],\n  "allergens": ["string"],\n  "additives": [{"name": "string", "type": "string", "safe": boolean}],\n  "verdict": "string",\n  "recommendation": "string (Eat Freely/Eat Occasionally/Eat Rarely/Avoid)"\n}` },
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
        ]
      }]
    });

    const raw = response.text ?? '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error("Error /api/scan-label:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
