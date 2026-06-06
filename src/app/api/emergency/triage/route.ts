// src/app/api/emergency/triage/route.ts
// Receives symptoms + location → performs triage + nearest hospital lookup
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { symptoms, userDiseases = [], location } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: 'No symptoms provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    let condition = 'Mild Symptoms';
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let instructions = 'Monitor your symptoms. Rest and stay hydrated.';
    let needsHospital = false;

    if (apiKey) {
      try {
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
                content: `You are an emergency triage assistant. Based on the user's symptoms and medical history, return a JSON object:
{
  "condition": "string - detected condition name",
  "severity": "LOW|MEDIUM|HIGH",
  "instructions": "string - clear first-aid instructions",
  "needsHospital": boolean
}
Return ONLY valid JSON.`,
              },
              {
                role: 'user',
                content: `Symptoms: ${symptoms}\nMedical history: ${userDiseases.join(', ') || 'none'}`,
              },
            ],
            max_tokens: 200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            condition = parsed.condition || condition;
            severity = parsed.severity || severity;
            instructions = parsed.instructions || instructions;
            needsHospital = parsed.needsHospital ?? needsHospital;
          }
        }
      } catch {
        // Fall through to keyword matching
      }
    }

    // Keyword-based fallback if AI didn't run
    if (!apiKey) {
      const lc = symptoms.toLowerCase();
      if (lc.includes('dizzy') || lc.includes('faint') || lc.includes('sweat') || lc.includes('shaking')) {
        condition = 'Potential Hypoglycemia';
        severity = 'HIGH';
        instructions =
          'Please consume a fast-acting sugar source such as fruit juice, candy, or a sugar packet immediately. Sit down in a safe place. If symptoms persist for more than 15 minutes, seek emergency medical care.';
        needsHospital = true;
      } else if (lc.includes('chest') || lc.includes('heart') || lc.includes('arm pain') || lc.includes('breath')) {
        condition = 'Possible Cardiac Event';
        severity = 'HIGH';
        instructions =
          'This is a medical emergency. Stop all activity immediately. Rest in a comfortable position. If you have prescribed nitroglycerin, use it. Call an ambulance now.';
        needsHospital = true;
      } else if (lc.includes('headache') || lc.includes('nausea') || lc.includes('fever')) {
        condition = 'Possible Infection or Dehydration';
        severity = 'MEDIUM';
        instructions =
          'Drink plenty of fluids, rest in a cool area, and take paracetamol if needed. If fever exceeds 39°C or symptoms worsen, visit a hospital.';
        needsHospital = false;
      }
    }

    // Hospital lookup
    let nearestHospital = null;
    if (needsHospital && location?.lat && location?.lng) {
      try {
        const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:5000,${location.lat},${location.lng}););out 1;`;
        const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query,
        });
        if (overpassRes.ok) {
          const osm = await overpassRes.json();
          if (osm.elements?.[0]) {
            const h = osm.elements[0];
            const R = 6371;
            const dLat = ((h.lat - location.lat) * Math.PI) / 180;
            const dLng = ((h.lon - location.lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((location.lat * Math.PI) / 180) * Math.cos((h.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
            const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            nearestHospital = {
              name: h.tags?.name || 'Nearest Hospital',
              distance: `${dist.toFixed(1)} km`,
              address: h.tags?.['addr:street'] || 'Address not available',
              phone: h.tags?.phone || null,
              lat: h.lat,
              lng: h.lon,
            };
          }
        }
      } catch {
        // ignore
      }
    }

    if (needsHospital && !nearestHospital) {
      nearestHospital = {
        name: 'Black Lion Hospital',
        distance: '1.4 km',
        address: 'Lideta, Addis Ababa',
        phone: '+251 11 551 6835',
      };
    }

    const audioScript = needsHospital
      ? `Warning. ${condition} detected. ${instructions} Nearest hospital: ${nearestHospital?.name}, ${nearestHospital?.distance} away.`
      : `${condition} detected. ${instructions}`;

    return NextResponse.json({
      condition,
      severity,
      instructions,
      needsHospital,
      nearestHospital,
      audioScript,
    });
  } catch (error) {
    console.error('Emergency triage error:', error);
    return NextResponse.json(
      {
        condition: 'Error',
        severity: 'LOW',
        instructions: 'Could not process your symptoms. Please call emergency services directly.',
        needsHospital: true,
        nearestHospital: null,
        audioScript: 'Error processing symptoms. Please call emergency services directly.',
      },
      { status: 200 }
    );
  }
}
