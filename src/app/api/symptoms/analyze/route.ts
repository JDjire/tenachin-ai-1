import { NextRequest, NextResponse } from 'next/server';
import { analyzeSymptoms } from '@/lib/openai/client';
import { DatabaseService } from '@/utils/services';

export async function POST(request: NextRequest) {
  try {
    const { symptoms, userDiseases, userId } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms description is required.' },
        { status: 400 }
      );
    }

    // Call OpenAI analysis
    const analysis = await analyzeSymptoms(symptoms, userDiseases || []);

    // Save to database if userId is provided
    if (userId) {
      await DatabaseService.addSymptomLog(userId, symptoms, analysis);
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('API symptom triage route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
