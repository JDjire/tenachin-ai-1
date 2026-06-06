import OpenAI from 'openai';
import { FoodAnalysisResponse, SymptomAnalysisResponse } from '@/types';

const apiKey = process.env.OPENAI_API_KEY;

// Only initialize OpenAI client if API key is provided, otherwise fall back to mock logic
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function analyzeFood(
  foodName: string,
  ingredients: string,
  userDiseases: string[],
  bmi: number | null
): Promise<FoodAnalysisResponse> {
  if (!openai) {
    // Elegant Mock Fallback Mode
    console.warn('OPENAI_API_KEY is not defined. Falling back to Mock Food Analysis.');
    
    // Check if foodName contains traditional Ethiopian items to make it realistic
    const lowerName = foodName.toLowerCase() + ' ' + ingredients.toLowerCase();
    const isDiabetic = userDiseases.some(d => d.toLowerCase().includes('diabetes'));
    const isHypertensive = userDiseases.some(d => d.toLowerCase().includes('hypertension'));
    
    if (lowerName.includes('injera') || lowerName.includes('misir') || lowerName.includes('wat')) {
      return {
        food_name: "Injera with Misir Wat",
        calories: 540,
        protein: 18,
        carbs: 82,
        fat: 10,
        sugar: 4.5,
        risk_level: isDiabetic ? "CAUTION" : "SAFE",
        disease_warning: isDiabetic 
          ? "This meal composition has a high glycemic index due to Injera. It may exceed your safe glucose threshold for your Type 2 Diabetes profile."
          : "",
        recommendation: isDiabetic 
          ? "Recommend reducing the Injera portion by 25% and adding a fiber-rich salad, or walking for 10-15 minutes after eating."
          : "Excellent source of plant-based protein and iron. Enjoy in moderation."
      };
    }

    if (lowerName.includes('ramen') || lowerName.includes('instant') || lowerName.includes('noodle')) {
      return {
        food_name: "Instant Ramen Noodles",
        calories: 380,
        protein: 8,
        carbs: 52,
        fat: 14,
        sugar: 2,
        risk_level: "RISK",
        disease_warning: isHypertensive 
          ? "CRITICAL WARNING: Extremely high sodium level (1500mg+). This will directly spike blood pressure in Hypertension profiles."
          : "High sodium and processed carbohydrate content.",
        recommendation: "Avoid this processed food. If you must consume it, use only 1/4 of the seasoning packet and add boiled vegetables or eggs."
      };
    }

    if (lowerName.includes('pizza')) {
      return {
        food_name: "Pizza",
        calories: 285,
        protein: 12,
        carbs: 36,
        fat: 10,
        sugar: 2.5,
        risk_level: isDiabetic ? "CAUTION" : "SAFE",
        disease_warning: isDiabetic 
          ? "Refined carbohydrates in pizza crust can cause rapid glucose spikes. Monitor blood sugar closely."
          : "",
        recommendation: isDiabetic
          ? "Consider having pizza with added vegetables and reducing portion size by 25%."
          : "Enjoy in moderation. Pair with a salad or vegetables for more balanced nutrition."
      };
    }

    if (lowerName.includes('chicken') || lowerName.includes('breast')) {
      return {
        food_name: "Grilled Chicken Breast",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        sugar: 0,
        risk_level: "SAFE",
        disease_warning: "",
        recommendation: "Excellent lean protein source. Great for muscle maintenance and satiety. Pair with vegetables."
      };
    }

    if (lowerName.includes('burger') || lowerName.includes('beef')) {
      return {
        food_name: "Hamburger",
        calories: 540,
        protein: 30,
        carbs: 41,
        fat: 28,
        sugar: 8,
        risk_level: isDiabetic ? "CAUTION" : "SAFE",
        disease_warning: isHypertensive 
          ? "High saturated fat and sodium content may impact blood pressure control."
          : isDiabetic 
          ? "High carbs and sugars from bun. Consider lettuce wrap alternative."
          : "",
        recommendation: "Limit portion frequency. Choose lean beef and remove excess fat. Substitute bun with whole grain."
      };
    }

    if (lowerName.includes('salad') || lowerName.includes('vegetable')) {
      return {
        food_name: "Mixed Vegetable Salad",
        calories: 95,
        protein: 3.6,
        carbs: 20,
        fat: 0.3,
        sugar: 4,
        risk_level: "SAFE",
        disease_warning: "",
        recommendation: "Excellent choice! High in fiber and nutrients. Add lean protein like chicken or beans for complete meal."
      };
    }

    if (lowerName.includes('rice')) {
      return {
        food_name: "White Rice",
        calories: 206,
        protein: 4.3,
        carbs: 45,
        fat: 0.3,
        sugar: 0,
        risk_level: isDiabetic ? "CAUTION" : "SAFE",
        disease_warning: isDiabetic 
          ? "High glycemic index. Can cause rapid blood sugar rise. Consider brown rice or smaller portions."
          : "",
        recommendation: isDiabetic
          ? "Use brown rice instead for lower glycemic impact. Limit to 1/2 cup cooked."
          : "Pair with protein and vegetables for balanced nutrition."
      };
    }

    // Default mock response with variation based on food hash
    const hash = foodName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variations = [
      { calories: 350, protein: 14, carbs: 38, fat: 11, sugar: 4 },
      { calories: 420, protein: 18, carbs: 52, fat: 13, sugar: 6 },
      { calories: 280, protein: 12, carbs: 35, fat: 9, sugar: 3 },
      { calories: 480, protein: 20, carbs: 58, fat: 15, sugar: 8 }
    ];
    const variation = variations[hash % variations.length];

    return {
      food_name: foodName || "Uploaded Food Item",
      calories: variation.calories,
      protein: variation.protein,
      carbs: variation.carbs,
      fat: variation.fat,
      sugar: variation.sugar,
      risk_level: "SAFE",
      disease_warning: "",
      recommendation: "A meal option. Ensure balanced macronutrients and stay hydrated."
    };
  }

  // Real OpenAI call with response schema
  try {
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert clinical dietitian and healthcare AI. 
Analyze the provided food photo/description, additional ingredients, and the user's medical context (pre-existing diseases, BMI goals).
Provide a precise nutritional breakdown (calories, protein, carbs, fat, sugar) and classify the safety as:
- 'SAFE': Complies with goals/diseases
- 'CAUTION': Mild warnings or requires portion adjustments
- 'RISK': Strongly contra-indicated for their diseases/vitals.
Formulate clear, brief, actionable recommendations in English. Provide clinical warnings if there are health risks (e.g. sugar spike in diabetes, sodium risk in hypertension/kidney disease).`
        },
        {
          role: 'user',
          content: JSON.stringify({
            foodName,
            ingredients,
            userDiseases,
            bmi
          })
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'food_analysis',
          schema: {
            type: 'object',
            properties: {
              food_name: { type: 'string' },
              calories: { type: 'number' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              sugar: { type: 'number' },
              risk_level: { type: 'string', enum: ['SAFE', 'CAUTION', 'RISK'] },
              disease_warning: { type: 'string' },
              recommendation: { type: 'string' }
            },
            required: ['food_name', 'calories', 'protein', 'carbs', 'fat', 'sugar', 'risk_level', 'disease_warning', 'recommendation'],
            additionalProperties: false
          }
        }
      }
    });

    const parsed = response.choices[0].message.parsed;
    if (!parsed) {
      throw new Error('Failed to parse OpenAI food response schema');
    }
    return parsed as FoodAnalysisResponse;
  } catch (error) {
    console.error('Error calling OpenAI for food analysis:', error);
    throw error;
  }
}

export async function analyzeSymptoms(
  symptoms: string,
  userDiseases: string[]
): Promise<SymptomAnalysisResponse> {
  if (!openai) {
    // Elegant Mock Fallback Mode
    console.warn('OPENAI_API_KEY is not defined. Falling back to Mock Symptom Analysis.');
    const lowerSymptoms = symptoms.toLowerCase();
    const isDiabetic = userDiseases.some(d => d.toLowerCase().includes('diabetes'));

    if (lowerSymptoms.includes('dizzy') || lowerSymptoms.includes('sweat') || lowerSymptoms.includes('vision') || lowerSymptoms.includes('hypo')) {
      return {
        possible_condition: "Hypoglycemia (Low Blood Sugar)",
        severity: "HIGH",
        recommendation: "Your symptoms (dizziness, sweating, visual disturbance) require immediate attention. Consume 15g of fast-acting glucose (e.g., fruit juice, candy, sugar packet) immediately if conscious and seek emergency medical care.",
        needs_hospital: true
      };
    }

    if (lowerSymptoms.includes('chest') || lowerSymptoms.includes('pain') || lowerSymptoms.includes('heart') || lowerSymptoms.includes('arm')) {
      return {
        possible_condition: "Acute Coronary Syndrome / Angina",
        severity: "HIGH",
        recommendation: "Chest pain or radiating pain represents a medical emergency. Rest quietly, take an aspirin if prescribed, and call emergency services or go to the nearest hospital immediately.",
        needs_hospital: true
      };
    }

    // Default mock response
    return {
      possible_condition: "Mild Fatigue / Cold Symptoms",
      severity: "LOW",
      recommendation: "Ensure you are getting enough rest and fluids. Monitor your temperature and symptoms over the next 24 hours. Contact a doctor if symptoms worsen.",
      needs_hospital: false
    };
  }

  // Real OpenAI call with response schema
  try {
    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an advanced emergency triage clinical assistant. 
Analyze the user's reported symptoms and their medical history.
Detect the most likely condition, assign a severity tier ('LOW', 'MEDIUM', 'HIGH'), and generate medical recommendations.
Set 'needs_hospital' to true if the condition is life-threatening or a severe emergency (e.g. stroke symptoms, heart attack, hypoglycemia, severe asthma attack, shock, major bleeding).`
        },
        {
          role: 'user',
          content: JSON.stringify({
            symptoms,
            userDiseases
          })
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'symptom_analysis',
          schema: {
            type: 'object',
            properties: {
              possible_condition: { type: 'string' },
              severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
              recommendation: { type: 'string' },
              needs_hospital: { type: 'boolean' }
            },
            required: ['possible_condition', 'severity', 'recommendation', 'needs_hospital'],
            additionalProperties: false
          }
        }
      }
    });

    const parsed = response.choices[0].message.parsed;
    if (!parsed) {
      throw new Error('Failed to parse OpenAI symptom response schema');
    }
    return parsed as SymptomAnalysisResponse;
  } catch (error) {
    console.error('Error calling OpenAI for symptom analysis:', error);
    throw error;
  }
}
