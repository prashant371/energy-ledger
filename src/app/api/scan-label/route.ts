import { NextResponse } from 'next/server';

const MODEL = 'gemini-1.5-flash';
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

function buildHeaders(apiKey: string) {
  if (apiKey.startsWith('AIza')) return { 'Content-Type': 'application/json' };
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
}
function buildUrl(apiKey: string) {
  return apiKey.startsWith('AIza') ? `${BASE}:generateContent?key=${apiKey}` : `${BASE}:generateContent`;
}

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const res = await fetch(buildUrl(apiKey), {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        contents: [{ parts: [
          { text: `You are a food safety expert. Analyze this food label and return a JSON object ONLY (no markdown). Structure:\n{"productName":"string","overallGrade":"string (A/B/C/D/F)","gradeColor":"string (green/yellow/orange/red)","gradeExplanation":"string","totalCalories":number,"servingSize":"string","harmfulIngredients":[{"name":"string","reason":"string","severity":"string"}],"goodIngredients":["string"],"allergens":["string"],"additives":[{"name":"string","type":"string","safe":boolean}],"verdict":"string","recommendation":"string (Eat Freely/Eat Occasionally/Eat Rarely/Avoid)"}` },
          { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
        ]}]
      })
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || JSON.stringify(data);
      return NextResponse.json({ error: `Gemini Error (${res.status}): ${msg}` }, { status: res.status });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return NextResponse.json(JSON.parse(raw.replace(/```json|```/g, '').trim()));

  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}
