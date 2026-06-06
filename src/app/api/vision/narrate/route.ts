// src/app/api/vision/narrate/route.ts
// Receives food image → analyzes and returns narration-ready description
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as Blob | null;
    const diseasesRaw = formData.get('diseases') as string | null;
    const diseases: string[] = diseasesRaw ? JSON.parse(diseasesRaw) : [];

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && image) {
      // Convert image to base64
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = image.type || 'image/jpeg';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a food analysis assistant for visually impaired users. Analyze the food image and respond with a JSON object containing:
- food_name: name of the detected food
- calories: estimated calories (number)
- risk_level: "SAFE", "CAUTION", or "RISK" based on the user's conditions: ${diseases.join(', ') || 'none'}
- narration: A clear, spoken-style sentence describing the food, its estimated calories, and risk level. Write this as if you are speaking directly to a blind person. Example: "I detected Injera with Shiro. Estimated calories: 450. Risk level: medium for diabetes."
Return ONLY valid JSON.`,
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this food image for a visually impaired user.' },
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
              ],
            },
          ],
          max_tokens: 300,
        }),
      });

      if (!response.ok) throw new Error('Vision API failed');
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Try to parse JSON from response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return NextResponse.json(JSON.parse(jsonMatch[0]));
        }
      } catch {
        // Fall through to mock
      }
    }

    // Mock fallback
    const isDiabetic = diseases.some((d: string) => d.toLowerCase().includes('diabetes'));
    return NextResponse.json({
      food_name: 'Injera with Shiro',
      calories: 450,
      risk_level: isDiabetic ? 'CAUTION' : 'SAFE',
      narration: isDiabetic
        ? 'I detected Injera with Shiro. Estimated calories: 450. Risk level: medium for diabetes. Recommended portion: half plate.'
        : 'I detected Injera with Shiro. Estimated calories: 450. This meal is safe for your health profile.',
    });
  } catch (error) {
    console.error('Vision narrate error:', error);
    return NextResponse.json(
      {
        food_name: 'Unknown Food',
        calories: 0,
        risk_level: 'SAFE',
        narration: 'I could not analyze this image. Please try again with better lighting.',
      },
      { status: 200 }
    );
  }
}
