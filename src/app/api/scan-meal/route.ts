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
              text: `You are a professional nutritionist and food scientist. Analyze this meal photo and return a JSON object ONLY (no markdown, no explanation). The JSON must have this exact structure:
{
  "mealName": "string",
  "totalCalories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "servingSize": "string",
  "healthScore": number (1-10),
  "healthLabel": "string (Excellent/Good/Moderate/Poor)",
  "ingredients": ["string"],
  "tips": ["string (1-2 short nutrition tips)"]
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
