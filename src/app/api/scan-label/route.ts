import { NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function getAuthHeaders(apiKey: string) {
  if (apiKey.startsWith('AQ') || apiKey.startsWith('ya29')) {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
  }
  return { 'Content-Type': 'application/json' };
}

function getUrl(apiKey: string) {
  if (apiKey.startsWith('AQ') || apiKey.startsWith('ya29')) return GEMINI_URL;
  return `${GEMINI_URL}?key=${apiKey}`;
}

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });

    const response = await fetch(getUrl(apiKey), {
      method: 'POST',
      headers: getAuthHeaders(apiKey),
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `You are a food safety expert. Analyze this food label/ingredients list and return a JSON object ONLY (no markdown). Structure:\n{\n  "productName": "string",\n  "overallGrade": "string (A/B/C/D/F)",\n  "gradeColor": "string (green/yellow/orange/red)",\n  "gradeExplanation": "string",\n  "totalCalories": number,\n  "servingSize": "string",\n  "harmfulIngredients": [{"name": "string", "reason": "string", "severity": "string"}],\n  "goodIngredients": ["string"],\n  "allergens": ["string"],\n  "additives": [{"name": "string", "type": "string", "safe": boolean}],\n  "verdict": "string",\n  "recommendation": "string (Eat Freely/Eat Occasionally/Eat Rarely/Avoid)"\n}` },
            { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      console.error("Gemini /api/scan-label error:", response.status, errMsg);
      return NextResponse.json({ error: `Gemini API Error (${response.status}): ${errMsg}` }, { status: response.status });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));

  } catch (error: any) {
    console.error("Internal error /api/scan-label:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error?.message}` }, { status: 500 });
  }
}
