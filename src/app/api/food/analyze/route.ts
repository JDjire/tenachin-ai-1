import { NextRequest, NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/openai/client';
import { DatabaseService } from '@/utils/services';

export async function POST(request: NextRequest) {
  try {
    const { foodName, ingredients, userDiseases, bmi, userId } = await request.json();

    if (!foodName && !ingredients) {
      return NextResponse.json(
        { error: 'Either foodName or ingredients is required.' },
        { status: 400 }
      );
    }

    // Call OpenAI analysis
    const analysis = await analyzeFood(foodName || '', ingredients || '', userDiseases || [], bmi || null);

    // Save to database if userId is provided
    if (userId) {
      await DatabaseService.addFoodLog(userId, analysis);
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('API food analysis route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
