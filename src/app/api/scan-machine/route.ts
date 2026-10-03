import { NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.0-flash-lite';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `You are a fitness and gym equipment expert. Analyze this gym machine photo and return a JSON object ONLY (no markdown). Structure:\n{\n  "machineName": "string",\n  "category": "string",\n  "primaryMuscles": ["string"],\n  "secondaryMuscles": ["string"],\n  "metValue": number,\n  "caloriesBurnedPerHour": number,\n  "difficultyLevel": "string",\n  "formTips": ["string"],\n  "commonMistakes": ["string"],\n  "safetyNotes": "string"\n}` },
              { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      console.error("Gemini /api/scan-machine error:", response.status, errMsg);
      return NextResponse.json({ error: `Gemini API Error (${response.status}): ${errMsg}` }, { status: response.status });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error("Internal error /api/scan-machine:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error?.message}` }, { status: 500 });
  }
}
