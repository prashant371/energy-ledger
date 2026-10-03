import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a food safety expert. Analyze this food label/ingredients list and return a JSON object ONLY (no markdown). Structure:
{
  "productName": "string",
  "overallGrade": "string (A/B/C/D/F)",
  "gradeColor": "string (green/yellow/orange/red)",
  "gradeExplanation": "string",
  "totalCalories": number,
  "servingSize": "string",
  "harmfulIngredients": [{"name": "string", "reason": "string", "severity": "string"}],
  "goodIngredients": ["string"],
  "allergens": ["string"],
  "additives": [{"name": "string", "type": "string", "safe": boolean}],
  "verdict": "string",
  "recommendation": "string (Eat Freely/Eat Occasionally/Eat Rarely/Avoid)"
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
    ]);

    const raw = result.response.text();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error("Error /api/scan-label:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
