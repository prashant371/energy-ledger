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
              text: `You are a food safety expert and nutritional scientist. Analyze this food product label/ingredients list and return a JSON object ONLY (no markdown, no explanation). Assess ingredient quality, additives, and overall health impact. The JSON must have this exact structure:
{
  "productName": "string",
  "overallGrade": "string (A/B/C/D/F)",
  "gradeColor": "string (green/yellow/orange/red)",
  "gradeExplanation": "string (1 sentence)",
  "totalCalories": number (per serving, or 0 if not visible),
  "servingSize": "string",
  "harmfulIngredients": [{"name": "string", "reason": "string", "severity": "string (High/Medium/Low)"}],
  "goodIngredients": ["string"],
  "allergens": ["string"],
  "additives": [{"name": "string", "type": "string (Preservative/Colorant/Sweetener/etc)", "safe": boolean}],
  "verdict": "string (2-3 sentence overall verdict)",
  "recommendation": "string (Eat Freely/Eat Occasionally/Eat Rarely/Avoid)"
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
