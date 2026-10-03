import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are a professional fitness and gym equipment expert. Analyze this gym machine/equipment photo and return a JSON object ONLY (no markdown, no explanation). The JSON must have this exact structure:
{
  "machineName": "string",
  "category": "string (e.g. Cardio, Strength, Cable, Free Weights)",
  "primaryMuscles": ["string"],
  "secondaryMuscles": ["string"],
  "metValue": number (MET value for moderate intensity use),
  "caloriesBurnedPerHour": number (for 70kg person),
  "difficultyLevel": "string (Beginner/Intermediate/Advanced)",
  "formTips": ["string (3-4 key form tips)"],
  "commonMistakes": ["string (2-3 common mistakes)"],
  "safetyNotes": "string"
}`
            },
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Gemini API Error", details: data }, { status: response.status });

    const raw = data.candidates[0].content.parts[0].text;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
